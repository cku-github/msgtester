import { Meteor } from 'meteor/meteor';
import { Pool } from 'pg';
import jsdiff from 'diff';
import TestCases from '../TestCases';
import Queues from '../../Queues/Queues';
import Groups from '../../Groups/Groups';
import MessageTypes from '../../MessageTypes/MessageTypes';
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
      console.log(result);
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

      console.log({ _id, testRunResult, expectedResult });

      // test result is empty, new test case
      if (!expectedResult) {
        console.log('expected result empty');
        TestCases.update(_id, {
          $set: {
            testRunResult,
            expectedResult: testRunResult,
            testStatus: 'ready',
            diffCount: 0,
            ipcLink: ipcLink,
          },
        });

        updateExpectedResult(_id, testRunResult);
      } else {
        console.log('expected result not empty');
        // test result is same
        // test result is different
        // const diff = jsdiff.diffChars(expectedResult, testRunResult);
        const diff = jsdiff.diffWords(expectedResult, testRunResult);
        const diffCount = diff.filter(part => part.added || part.removed).length;

        TestCases.update(_id, {
          $set: {
            testRunResult,
            testStatus: 'ready',
            diffCount,
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
    console.log('Start loadFromPostgresql');
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
    c_test_status,
    c_rhf2_header,
    c_comment,
    c_expected_resulttrace,
    c_test_run_resulttrace,
    c_last_editor,
    n_diff_count,
    n_autotest,
    n_runtime_in_sec,
    n_completes_in_ipc,
    c_mqmd_useridentifier,
    c_linebreak
    from bus_test_cases
    `;

    const result = await client.query(query);

    // delete existing Mongo records
    // delete Queues
    console.log('deleting data in MongoDB');
    Groups.remove({});
    Queues.remove({});
    MessageTypes.remove({});
    Formats.remove({});
    TestCases.remove({});

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
        runTimeSec: row.n_runtime_in_sec,
        completesInIpc: row.n_completes_in_ipc ? true : false,
        mqUserIdentifier: row.c_mqmd_useridentifier,
        linefeed: row.c_linebreak,
      };


      console.log('will add new entry with ID ', row.c_test_case_id);
      console.log(row.c_group_name, row.c_loading_queue, row.c_message_type);
      // console.log('testCase: ', testCase)
      TestCases.insert(testCase);
      setGroups.add(row.c_group_name);
      setQueues.add(row.c_loading_queue);
      setMessageTypes.add(row.c_message_type);
      setFormats.add(row.c_format);
    });

    console.log(setGroups);
    console.log(setQueues);
    console.log(setMessageTypes);
    console.log(setFormats);

    setGroups.forEach(name => Groups.insert({ name }));
    setQueues.forEach(name => Queues.insert({ name }));
    setMessageTypes.forEach(name => MessageTypes.insert({ name }));
    setFormats.forEach(name => Formats.insert({ name }));

    await client.release(true)
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
      mqUserIdentifier,
      linefeed,
    } = testCase;

    const query = `
      insert into bus_test_cases(
        c_test_case_id, c_test_case_name, c_message_type, c_format,
        c_loading_queue, c_test_message, c_test_status, c_rhf2_header,
        c_comment, c_group_name, c_last_editor, n_runtime_in_sec,
        n_completes_in_ipc, n_autotest, c_mqmd_useridentifier, c_linebreak
      )
      values(
        '${_id}', '${name}', '${messageType}', '${format}',
        '${loadingQueue}', '${testMessage}', 'new', '${rfh2Header}',
        '${comment}', '${group}', '${owner}', ${runTimeSec},
        ${completesInIpc ? 1 : 0}, ${autoTest ? 1 : 0},
        '${mqUserIdentifier}', '${linefeed}'
      );
    `;

    const result = await client.query(query);
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
      mqUserIdentifier,
      linefeed,
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    c_test_case_name = '${name}',
    c_message_type = '${messageType}',
    c_format = '${format}',
    c_loading_queue = '${loadingQueue}',
    c_test_message = '${testMessage}',
    c_expected_resulttrace = '${testRunResult}',
    c_test_status = 'new',
    c_rhf2_header = '${rfh2Header}',
    c_comment = '${comment}',
    c_group_name = '${group}',
    c_last_editor = '${owner}',
    n_runtime_in_sec = ${runTimeSec},
    n_completes_in_ipc = ${completesInIpc ? 1 : 0},
    n_autotest = ${autoTest ? 1 : 0},
    c_mqmd_useridentifier = '${mqUserIdentifier}',
    c_linebreak = '${linefeed}' where
    c_test_case_id = '${_id}'
    `;

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
    c_last_editor = '${owner}'
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
  group, loadingQueue, messageType, owner,
}) => {
  try {
    const client = await pool.connect();

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    let query = `
    update bus_test_cases set
    c_test_status = 'run',
    c_last_editor = '${owner}'
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
