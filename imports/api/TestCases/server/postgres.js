import { Meteor } from 'meteor/meteor';
import { Pool } from 'pg';
import jsdiff from 'diff';
import TestCases from '../TestCases';
import Queues from '../../Queues/Queues';
import Groups from '../../Groups/Groups';
import MessageTypes from '../../MessageTypes/MessageTypes';
import DepartmentCodes from '../../DepartmentCodes/DepartmentCodes';
import Formats from '../../Formats/Formats';

const pool = new Pool(Meteor.settings.private.postgres);

const oldPoolQuery = pool.query;
pool.query = (...args) => {
  console.log('QUERY:', args);
  return oldPoolQuery.apply(pool, args);
};

const fetch = async (query, params) => {
  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    result.rows.forEach((result) => {
      // NOTE: result here will likely need to be mapped to specific fields in MongoDB instead of a plain dump.
      //  TestCases.insert(result);
    });

    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const updateStatusAndDiffResult = async (_id, diffCount) => {
  try {
    const client = await pool.connect();
    const query = `
      update bus_test_cases
      set c_test_status = 'calculating'
      , c_test_run_resulttrace = '${diffCount}'
      where c_test_case_id = '${_id}'
    `;

    const result = await fetch(query);
    await client.release(true)
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const updateExpectedResult = async (_id, testRunResult) => {
  try {
    const client = await pool.connect();

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    c_expected_resulttrace = '${testRunResult}'
    , c_test_status = 'calculating'
    , n_diff_count = 0
    where
    c_test_case_id = '${_id}'
    `;

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const pollReadyTests = async () => {
  try {
    var today = new Date();
    const client = await pool.connect();
    const query = `
      select c_test_case_id, coalesce(c_expected_resulttrace, '') as c_expected_resulttrace
      , coalesce(c_test_run_resulttrace, '') as c_test_run_resulttrace
      , coalesce(c_ipclink, '') as c_ipclink
      from bus_test_cases
      where c_test_status = 'ready'
    `;

    const result = await client.query(query);
    result.rows.forEach((row) => {
      const {
        c_test_case_id: _id,
        c_expected_resulttrace: expectedResult,
        c_test_run_resulttrace: testRunResult,
        c_ipclink: ipcLink,
      } = row;

      console.log('current testStart: ', today);
      // test result is empty, new test case
      if (!expectedResult) {
        TestCases.update(_id, {
          $set: {
            testRunResult,
            expectedResult: testRunResult,
            testStatus: 'passed',
            diffCount: 0,
            testStart: today,
            ipcLink,
          },
        });

        updateExpectedResult(_id, testRunResult);
      } else {
        // test result is same
        // test result is different
        // const diff = jsdiff.diffChars(expectedResult, testRunResult);
        const diff = jsdiff.diffWords(expectedResult, testRunResult);
        const diffCount = diff.filter(part => part.added || part.removed).length;

        TestCases.update(_id, {
          $set: {
            testRunResult,
            testStatus: diffCount === 0 ? 'passed' : 'failed',
            diffCount,
            testStart: today,
            ipcLink,
          },
        });

        updateStatusAndDiffResult(_id, diffCount);
      }
    });

    await client.release(true)
  } catch (exception) {
    throw new Error(exception.message);
  }
};

// function to import all data from Postgresql. Deletes all existing data in Mongo.
const loadFromPostgresql = async (userId) => {
  try {
    // define value lists used for checking input data
    var validLineBreaks = ["CR", "CRLF"];
    var validDepartmentCodes = ["cs","is","fs","ss","dev"]

    const client = await pool.connect();
    // query to get all test_cases from Postgresql
    const query = `
    select
    c_test_case_id,
    c_test_case_name,
    c_group_name,
    c_message_type,
    c_format,
    c_loading_queue,
    c_test_message,
    --c_test_status,
    c_rhf2_header,
    c_comment,
    c_expected_resulttrace,
    c_test_run_resulttrace,
    c_last_editor,
    n_diff_count,
    n_autotest,
    n_delayed,
    n_runtime_in_sec,
    n_completes_in_ipc,
    c_mqmd_useridentifier,
    c_linebreak,
    c_testid_prefix,
    c_jira_url,
    c_department_code
    from bus_test_cases
    where c_test_message is not null
    `;

    const result = await client.query(query);

    // delete existing Mongo records
    // delete Queues
    Groups.remove({});
    Queues.remove({});
    MessageTypes.remove({});
    Formats.remove({});
    TestCases.remove({});
    DepartmentCodes.remove({});

    const setGroups = new Set();
    const setQueues = new Set();
    const setMessageTypes = new Set();
    const setFormats = new Set();

    console.log('process each row from Postgresql');
    result.rows.forEach((row) => {
      const testCase = {
        _id: row.c_test_case_id,
        owner: userId,
        name: row.c_test_case_name,
        testIdPrefix: row.c_testid_prefix,
        jiraURL: row.c_jira_url,
        group: row.c_group_name,
        messageType: row.c_message_type,
        format: row.c_format,
        loadingQueue: row.c_loading_queue,
        testMessage: row.c_test_message, // clob
        testStatus: 'ready',
        rfh2Header: row.c_rhf2_header, // clob
        comment: row.c_comment,
        expectedResult: row.c_expected_resulttrace, // clob
        testRunResult: row.c_test_run_resulttrace,
        diffCount: row.n_diff_count,
        autoTest: row.n_autotest ? true : false,
        delayedTest: row.n_delayed ? true : false,
        runTimeSec: row.n_runtime_in_sec,
        completesInIpc: row.n_completes_in_ipc ? true : false,
        mqUserIdentifier: row.c_mqmd_useridentifier,
        linefeed: validLineBreaks.includes(row.c_linebreak) ? row.c_linebreak : "CRLF",
        departmentCode: validDepartmentCodes.includes(row.c_department_code) ? row.c_department_code : "dev" ,
      };


      console.log('testCase: ', testCase)
      TestCases.insert(testCase);
      setGroups.add(row.c_group_name);
      setQueues.add(row.c_loading_queue);
      setMessageTypes.add(row.c_message_type);
      setFormats.add(row.c_format);
    });

    setGroups.forEach(name => Groups.insert({ name }));
    setQueues.forEach(name => Queues.insert({ name }));
    setMessageTypes.forEach(name => MessageTypes.insert({ name }));
    setFormats.forEach(name => Formats.insert({ name }));

    // Set valid departmentCodes
    DepartmentCodes.insert({ name: 'cs' });
    DepartmentCodes.insert({ name: 'fs' });
    DepartmentCodes.insert({ name: 'is' });
    DepartmentCodes.insert({ name: 'ss' });
    DepartmentCodes.insert({ name: 'dev' });

    console.log('Groups: ', Groups.find({}).fetch());
    console.log('DepartmentCodes: ', DepartmentCodes.find({}).fetch());

    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const insert = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
      owner,
      name,
      testIdPrefix,
      messageType,
      format,
      loadingQueue,
      runTimeSec,
      testMessage,
      completesInIpc,
      rfh2Header,
      comment,
      group,
      autoTest,
      delayedTest,
      mqUserIdentifier,
      linefeed,
      jiraURL,
      departmentCode,
    } = testCase;

    const query = `
      insert into bus_test_cases(
        c_test_case_id, c_test_case_name, c_message_type, c_format,
        c_loading_queue, c_test_message, c_test_status, c_rhf2_header,
        c_comment, c_group_name, c_last_editor, n_runtime_in_sec,
        n_completes_in_ipc, n_autotest, n_delayed, c_mqmd_useridentifier, c_linebreak,
        c_testid_prefix, c_jira_url, c_department_code
      )
      values(
        '${_id}', '${name}', '${messageType}', '${format}',
        '${loadingQueue}', $token$${testMessage}$token$, 'new', $token$${rfh2Header}$token$,
        $token$${comment}$token$, '${group}', '${owner}', ${runTimeSec},
        ${completesInIpc ? 1 : 0}, ${autoTest ? 1 : 0}, ${delayedTest ? 1 : 0},
        '${mqUserIdentifier}', '${linefeed}', '${testIdPrefix}', '${jiraURL}',
        '${departmentCode}'
      );
    `;

    const cleanquery = query.replace(/'undefined',/g, '\'\',');

    //console.log('update postgresql with', cleanquery);
    const result = await client.query(cleanquery);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const update = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
      owner,
      name,
      testIdPrefix,
      messageType,
      format,
      loadingQueue,
      runTimeSec,
      testMessage,
      testRunResult,
      completesInIpc,
      rfh2Header,
      comment,
      group,
      autoTest,
      delayedTest,
      mqUserIdentifier,
      linefeed,
      jiraURL,
      departmentCode,
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    c_test_case_name = '${name}',
    c_message_type = '${messageType}',
    c_format = '${format}',
    c_loading_queue = '${loadingQueue}',
    c_test_message = $token$${testMessage}$token$,
    c_expected_resulttrace = $token$${testRunResult}$token$,
    c_test_status = 'new',
    c_rhf2_header = $token$${rfh2Header}$token$,
    c_comment = $token$${comment}$token$,
    c_group_name = '${group}',
    c_last_editor = '${owner}',
    n_runtime_in_sec = ${runTimeSec},
    n_completes_in_ipc = ${completesInIpc ? 1 : 0},
    n_autotest = ${autoTest ? 1 : 0},
    n_delayed = ${delayedTest ? 1 : 0},
    c_mqmd_useridentifier = '${mqUserIdentifier}',
    c_linebreak = '${linefeed}',
    c_testid_prefix = '${testIdPrefix}',
    c_jira_url = '${jiraURL}',
    c_department_code = '${departmentCode}'
    where
    c_test_case_id = '${_id}'
    `;

    // enable here to see insert in case of errors
    //console.log('update postgresql with', query);
    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const runTest = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
      owner,
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    c_test_status = 'run',
    c_last_editor = '${owner}',
    d_test_time = statement_timestamp()
    where
    c_test_case_id = '${_id}'
    `;

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const runTestsFiltered = async ({
  group, loadingQueue, messageType, owner, departmentCode
}) => {
  try {
    const client = await pool.connect();

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    let query = `
    update bus_test_cases set
    c_test_status = 'run',
    c_last_editor = '${owner}',
    d_test_time = statement_timestamp()
    where 1 = 1
    `;

    if (group) {
      query += ` AND c_group_name = '${group}'`;
    }

    if (loadingQueue) {
      query += ` AND c_loading_queue = '${loadingQueue}'`;
    }

    if (messageType) {
      query += ` AND c_message_type = '${messageType}'`;
    }

    if (departmentCode) {
      query += ` AND c_department_code = '${departmentCode}'`;
    }

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const deleteTestCase = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
    } = testCase;

    const query = `
      delete from bus_test_cases
      where c_test_case_id = '${_id}'
    `;

    const result = await fetch(query);
    await client.release(true)
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const acceptTestResult = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
      testRunResult,
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    c_expected_resulttrace = '${testRunResult}'
    where
    c_test_case_id = '${_id}'
    `;

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

export default {
  fetch,
  loadFromPostgresql,
  insert,
  update,
  runTest,
  runTestsFiltered,
  pollReadyTests,
  updateStatusAndDiffResult,
  deleteTestCase,
  acceptTestResult,
  updateExpectedResult,
};
