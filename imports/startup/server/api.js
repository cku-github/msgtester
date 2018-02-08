import '../../api/Documents/server/publications';
import '../../api/TestCases/server/publications';

import '../../api/OAuth/server/methods';

import '../../api/Users/server/methods';
import '../../api/Users/server/publications';

import '../../api/Utility/server/methods';

import postgres from '../../api/TestCases/server/postgres';

// postgres.fetch(`
//   select fk_test_case_id as testCaseId,
//   result as testResult
//   from bus_test_runs
//   where runstate = 'ready'
// `);

postgres.update({_id: 'something', testMessage: 'change'})
