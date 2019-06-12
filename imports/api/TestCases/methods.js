import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import TestCases from './TestCases';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'testCases.insert': function testCasesInsert(testCase) {
    check(testCase, {
      name: String,
      messageType: String,
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
      delayedTest: Boolean,
      mqUserIdentifier: String,
      linefeed: String,
      departmentCode: String,
      testIdPrefix: Match.Maybe(String),
      jiraURL: Match.Maybe(String),
    });
    // console.log('methods.testCases.insert: ', testCase);

    try {
      const _id = TestCases.insert({ owner: this.userId, ...testCase });
      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.insert({ _id, owner: this.userId, ...testCase });
        });
      }
      return _id;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.update': function testCasesUpdate(testCase) {
      check(testCase, {
      _id: String,
      name: String,
      messageType: String,
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
      delayedTest: Boolean,
      mqUserIdentifier: String,
      linefeed: String,
      departmentCode: String,
      testIdPrefix: Match.Maybe(String),
      jiraURL: Match.Maybe(String),
    });

    console.log('methods.testCases.update: ', testCase);
    try {
      const testCaseId = testCase._id;
      TestCases.update(testCaseId, {$set: { owner: this.userId, ...testCase } });

      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.update({ testCaseId, owner: this.userId, ...testCase });
        });
      }
      return testCaseId; // Return _id so we can redirect to the testcase after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.remove': function testCasesRemove(_id) {
    check(_id, String);

    try {
      //first try to delete from Postgresql
      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.deleteTestCase({_id});
        });
      }
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
        diffCount: '',
        testStart: date,
        ipcLink: '',
      }});

      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.runTest({_id, owner: this.userId});
        });
      }

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
        testStatus: 'passed',
      }});

      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.acceptTestResult({_id, testRunResult});
        });
      }

      return result;
    } catch(exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.runTestsFiltered': function testCasesRunTestsFiltered(params) {
    check(params, {
      group: Match.Maybe(String),
      loadingQueue: Match.Maybe(String),
      messageType: Match.Maybe(String),
      departmentCode: Match.Maybe(String),
    });
    const date = new Date();

    try {
      const updateParams = {};

      if (params.group) {
        updateParams.group = params.group;
      }

      if (params.loadingQueue) {
        updateParams.loadingQueue = params.loadingQueue;
      }

      if (params.messageType) {
        updateParams.messageType = params.messageType;
      }

      if (params.departmentCode) {
        updateParams.departmentCode = params.departmentCode;
      }

      const result = TestCases.update(updateParams, {$set: { owner: this.userId, testStatus: 'run', diffCount: '', testStart: date, ipcLink: '', } }, { multi: true });
      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.runTestsFiltered({...params, owner: this.userId});
        });
      }
    } catch(exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'testCases.copy': function testCasesCopy(oldTestCaseId) {
    check(oldTestCaseId, String);

    const testCase = TestCases.findOne(oldTestCaseId);
    delete testCase._id;

    //create new Name value with COPY string
    const name = testCase.name + ' Copy';
    const count = TestCases.find({name: new RegExp(`^${name}`)}).count();

    const newTestCase = {
      ...testCase,
      name: name + ` ${count ? count + 1 : ''}`,
    };

    try {
      const _id = TestCases.insert({ owner: this.userId, ...newTestCase });
      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.insert({ _id, owner: this.userId, ...newTestCase });
        });
      }
      return _id;
    } catch(exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'importPostgresInfo': function importPostgresInfo() {
    try {
      if (Meteor.isServer) {
        import('./server/postgres').then(({default: postgres}) => {
          postgres.loadFromPostgresql(this.userId);
        });
      }
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
