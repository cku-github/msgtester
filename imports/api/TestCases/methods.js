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
      // testRunResult: String, // clob
      testStatus: String,
      // testStart: Date,
      expectedResult: String,
      // testReport: String, // clob
      completesInIpc: Boolean,
      // lastRunResult: String, // clob
      rfh2Header: String, // clob
      comment: String,
      group: String,
      autoTest: Boolean,
    });

    try {
      const _id = TestCases.insert({ owner: this.userId, ...testCase });
      import('./server/postgres').then(({default: postgres}) => {
        postgres.insert({ _id, owner: this.userId, ...testCase });
      });
      return _id;
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
      // testRunResult: String, // clob
      testStatus: String,
      // testStart: Date,
      expectedResult: String,
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
      import('./server/postgres').then(({default: postgres}) => {
        postgres.testCasesUpdate({ _id, owner: this.userId, ...testCase });
      });
      return testCaseId; // Return _id so we can redirect to the testcase after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.remove': function testCasesRemove(_id) {
    check(_id, String);

    try {
      //first try to delete from Postgresql
      import('./server/postgres').then(({default: postgres}) => {
        postgres.deleteTestCase({_id});
      });
      // then remove from MongoDB
      return TestCases.remove(_id);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.runTest': function testCasesRunTest(_id, date) {
    check(_id, String);
    check(date, Date);

    try {
      const result = TestCases.update(_id, {$set: {
        testStatus: 'run',
        testStart: date,
      }});

      import('./server/postgres').then(({default: postgres}) => {
        postgres.runTest({_id, owner: this.userId});
      });

      return result;
    } catch(exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.acceptTestResult': function testCasesAcceptTestResult(_id) {
    check(_id, String);

    try {
      const {testRunResult} = TestCases.findOne(_id);
      const result = TestCases.update(_id, {$set: {
        expectedResult: testRunResult,
        diffCount: 0,
      }});

      import('./server/postgres').then(({default: postgres}) => {
        postgres.acceptTestResult({_id, testRunResult});
      });

      return result;
    } catch(exception) {
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
