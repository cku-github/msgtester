import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import TestCases from './TestCases';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'testCases.insert': function testCasesInsert(testCase) {
    check(testCase, {
      name: String,
      type: String,
      format: String,
      loadingQueue: String,
      runTimeSec: Number,
      testMessage: String, // clob
      resultData: String, // clob
      testStatus: String,
      // testStart: Date,
      // testResult: String,
      // testReport: String, // clob
      completesInIpc: Boolean,
      // lastRunResult: String, // clob
      rfh2Header: String, // clob
      comment: String,
      group: String,
      autoTest: Boolean,
    });

    try {
      return TestCases.insert({ owner: this.userId, ...testCase });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  }
});

rateLimit({
  methods: [
    'testCases.insert',
    'testCases.update',
    'testCases.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
