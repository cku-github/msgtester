import { Client } from 'pg';
import TestCases from '../TestCases';

const client = new Client({
  user: 'ipc_vps',
  // user: 'ipc',
  host: 'localhost',
  database: 'ipcdb',
  password: 'IPC',
  port: 5432,
});

const connection = client.connect();

const fetch = async (query, params) => {
  try {
    const result = await client.query(query, params);
    result.rows.forEach((result) => {
      // NOTE: result here will likely need to be mapped to specific fields in MongoDB instead of a plain dump.
      console.log(result);
      //  TestCases.insert(result);
    });

    await client.end()
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const insert = async (testCase) => {
  try {
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
      insert into bus_test_cases(test_case_id,test_case_name,message_type,format,loading_queue,test_message,test_status,rhf2_header,comment,group_name,last_editor,runtime_in_sec,completes_in_ipc,autotest)
values('${_id}','${name}','${type}','${format}','${loadingQueue}','${testMessage}','new',${rfh2Header},'${comment}','${group}',,
${runTimeSec},${completesInIpc},${autoTest},${owner});
    `;

    console.log(query);

    const result = await client.query(query);
    await client.end();
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const update = async (testCase) => {
  try {
    const {
      _id,
      owner,
      name,
      type,
      format,
      loadingQueue,
      runTimeSec,
      testMessage,
      resultData,
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
    result_data = '${resultData}',
    test_status = 'new',
    rhf2_header = '${rfh2Header}',
    comment = '${comment}',
    group_name = '${group}',
    last_editor = '${owner}',
    runtime_in_sec = ${runTimeSec},
    completes_in_ipc = ${completesInIpc},
    autotest = ${autoTest} where
    test_case_id = '${_id}'
    `;

    console.log(query);

    const result = await client.query(query);
    await client.end();
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const runTest = async (testCase) => {
  try {
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
    await client.end();
  } catch (exception) {
    throw new Error(exception.message);
  }
};

const updateLastRunResult = async (testCase) => {
  try {
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
    await client.end();
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
};
