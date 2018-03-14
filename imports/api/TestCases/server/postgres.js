import { Meteor } from 'meteor/meteor';
import { Pool } from 'pg';
import jsdiff from 'diff';
import TestCases from '../TestCases';

const pool = new Pool(Meteor.settings.private.postgres);

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

const pollReadyTests = async () => {
  try {
    const client = await pool.connect();
    const query = `
      select test_case_id, coalesce(expected_result, '') as expected_result, coalesce(test_run_result, '') as test_run_result
      from bus_test_cases
      where test_status = 'ready'
    `;

    const result = await client.query(query);
    result.rows.forEach((row) => {
      const {
        test_case_id: _id,
        expected_result: expectedResult,
        test_run_result: testRunResult,
      } = row;

      console.log({_id, testRunResult, expectedResult})

      // test result is empty, new test case
      if (! expectedResult) {
        console.log('expected result empty')
        TestCases.update(_id, {
          $set: {
            testRunResult,
            expectedResult: testRunResult,
            diffCount: 0,
          },
        });

        updateExpectedResult(_id, testRunResult);
      } else {
        console.log('expected result not empty')
        // test result is same
        // test result is different
        const diff = jsdiff.diffChars(expectedResult, testRunResult);
        const diffCount = diff.filter(part => part.added || part.removed).length;

        TestCases.update(_id, {
          $set: {
            testRunResult,
            diffCount,
          },
        });

        updateReadyToCalculating(_id);
      }
    });

    await client.release(true)
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const updateReadyToCalculating = async (_id) => {
  try {
    const client = await pool.connect();
    const query = `
      update bus_test_cases
      set test_status = 'calculating'
      where test_case_id = '${_id}'
    `;

    const result = await fetch(query);
    await client.release(true)
  } catch (exception) {
    throw new Error(exception.message);
  }
};

// function to import all data from Postgresql. Deletes all existing data in Mongo.
const loadFromPostgresql = async () => {
  try {
    const client = await pool.connect();
    // query to get all test_cases from Postgresql
    const query = `
    select test_case_id, message_type, format, loading_queue, runtime_in_sec, test_message
, test_run_result, test_status, expected_result, test_report, completes_in_ipc
, rhf2_header, comment, group_name, autotest, test_case_name, last_run_result from bus_test_cases
    `;

    const result = await client.query(query);

    // delete existing Mongo records
    // delete Queues
    Meteor.call('queuesDeleteAll');
    Meteor.call('groupsDeleteAll');
    Meteor.call('TestCasesDeleteAll');

    result.rows.forEach((row) => {
      const {
        test_case_id: _id,
        message_type: type,
        format: format,
        loading_queue: loadingQueue,
        runtime_in_sec: runTimeSec,
        test_message: testMessage,
        test_run_result: testRunResult,
        test_status: testStatus,
        expected_result: expectedResult,
        test_report: testReport,
        completes_in_ipc: completesInIpc,
        rfh2_header: rfh2Header,
        comment: comment,
        group_name: group,
        autotest: autoTest,
        test_case_name: name,
        last_run_result: diffCount,
      } = row;

      const testCase = {
        _id: _id,
        name: name,
        type: message_type,
        format: form.format.value,
        loadingQueue: form.loadingQueue.value,
        runTimeSec: Number(form.runTimeSec.value),
        // TODO find way to escape CLOB because I need to store JSON and XML content
        testMessage: form.testMessage.value, // clob
        expectedResult: form.expectedResult.value, // clob
        testStatus: 'ready',
        completesInIpc: form.completesInIpc.checked,
        rfh2Header: form.rfh2Header.value, // clob
        comment: form.comment.value,
        group: form.group.value,
        autoTest: form.autoTest.checked,
      };


      console.log('will add new entry wit ID ')
      TestCases.insert(testCase);

    });

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
      type,
      format,
      loadingQueue,
      runTimeSec,
      testMessage,
      completesInIpc,
      rfh2Header,
      comment,
      group,
      autoTest,
    } = testCase;

    const query = `
      insert into bus_test_cases(
        test_case_id, test_case_name, message_type, format,
        loading_queue, test_message, test_status, rhf2_header,
        comment, group_name, last_editor, runtime_in_sec,
        completes_in_ipc, autotest
      )
      values(
        '${_id}', '${name}', '${type}', '${format}',
        '${loadingQueue}', '${testMessage}', 'new', '${rfh2Header}',
        '${comment}', '${group}', '${owner}', ${runTimeSec},
        ${completesInIpc ? 1 : 0}, ${autoTest ? 1 : 0}
      );
    `;

    console.log(query);

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
      type,
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
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    test_case_name = '${name}',
    message_type = '${type}',
    format = '${format}',
    loading_queue = '${loadingQueue}',
    test_message = '${testMessage}',
    expected_result = '${testRunResult}',
    test_status = 'new',
    rhf2_header = '${rfh2Header}',
    comment = '${comment}',
    group_name = '${group}',
    last_editor = '${owner}',
    runtime_in_sec = ${runTimeSec},
    completes_in_ipc = ${completesInIpc ? 1 : 0},
    autotest = ${autoTest ? 1 : 0} where
    test_case_id = '${_id}'
    `;

    console.log(query);

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
    test_status = 'run',
    last_editor = '${owner}'
    where
    test_case_id = '${_id}'
    `;

    console.log(query);

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const updateLastRunResult = async (testCase) => {
  try {
    const client = await pool.connect();
    const {
      _id,
      compareResult,
    } = testCase;

    // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
    update bus_test_cases set
    last_run_result = '${compareResult}'
    where
    test_case_id = '${_id}'
    `;

    console.log(query);

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
      where test_case_id = '${_id}'
    `;

    console.log(query);

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
    expected_result = '${testRunResult}'
    where
    test_case_id = '${_id}'
    `;

    console.log(query);

    const result = await client.query(query);
    await client.release(true);
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
    expected_result = '${testRunResult}', test_status = 'calculating'
    where
    test_case_id = '${_id}'
    `;

    console.log(query);

    const result = await client.query(query);
    await client.release(true);
  } catch (exception) {
    throw new Error(exception.message);
  }
};

export default {
  fetch,
  insert,
  update,
  runTest,
  updateLastRunResult,
  pollReadyTests,
  updateReadyToCalculating,
  deleteTestCase,
  acceptTestResult,
  updateExpectedResult,
};
