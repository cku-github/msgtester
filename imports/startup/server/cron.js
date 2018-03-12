import { SyncedCron } from 'meteor/percolate:synced-cron';

import postgres from '../../api/TestCases/server/postgres';

SyncedCron.config({
  log: false,
});

SyncedCron.add({
  name: 'Poll postgres',
  schedule(parser) {
    return parser.text('every 1 minute');
  },
  job() {
    console.log('polling');
    return postgres.pollReadyTests();
  },
});

SyncedCron.start();
