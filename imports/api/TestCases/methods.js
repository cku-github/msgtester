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
  },
  'testCases.update': function testCasesUpdate(testCase) {
    check(testCase, {
      _id: String,
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
      const testCaseId = testCase._id;
      TestCases.update(testCaseId, {$set: { owner: this.userId, ...testCase } });
      return testCaseId; // Return _id so we can redirect to the testcase after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.remove': function testCasesRemove(testCaseId) {
    check(testCaseId, String);

    try {
      return TestCases.remove(testCaseId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.runTest': function testCasesRunTest(_id, date) {
    check(_id, String);
    check(date, Date);

    try {
      return TestCases.update(_id, {$set: {
        testStatus: 'run',
        testStart: date,
      }});
    } catch(exception) {
      throw new Meteor.Error('500', exception);
    }
  },
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
