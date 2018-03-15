import '../../api/Documents/server/publications';
import '../../api/TestCases/server/publications';
import '../../api/Groups/server/publications';
import '../../api/Queues/server/publications';
import '../../api/MessageTypes/server/publications';

import '../../api/OAuth/server/methods';

import '../../api/Users/server/methods';
import '../../api/Users/server/publications';

import '../../api/Utility/server/methods';

import postgres from '../../api/TestCases/server/postgres';
import TestCases from '../../api/TestCases/TestCases';


const testCase = {
  _id: '_id',
  owner: 'owner',
  name: 'name',
  messageType: 'messageType',
  format: 'format',
  loadingQueue: 'loadingQueue',
  runTimeSec: 60,
  testMessage: 'testMessage',
  completesInIpc: true,
  rfh2Header: 'rfh2Header',
  comment: 'comment',
  group: 'group',
  autoTest: true,
};


// postgres.insert(testCase);

// postgres.fetch(`
//   select fk_test_case_id as testCaseId,
//   result as expectedResult
//   from bus_test_runs
//   where runstate = 'ready'
// `);

// postgres.update({...testCase, testMessage: 'new test message'});

// postgres.runTest(testCase);

// postgres.pollReadyTests();
