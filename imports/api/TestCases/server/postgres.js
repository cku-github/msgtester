import { Client } from 'pg';
import TestCases from '../TestCases';

const client = new Client({
  user: 'ipc',
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
    	resultData,
    	testStatus,
    	completesInIpc,
    	rfh2Header,
    	comment,
    	group,
    	autoTest,
    	testStart,
    } = testCase;

    const query = `
      insert into bus_test_cases(test_case_id, test_message)
      values('${_id}', '${testMessage}')
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
      testStatus,
      completesInIpc,
      rfh2Header,
      comment,
      group,
      autoTest,
      testStart,
    } = testCase;

        // update bus_test_cases set test_message = $2 where test_case_id = $1;
    const query = `
      update bus_test_cases
      set test_message = '${testMessage}'
      where test_case_id = '${_id}'
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
};
