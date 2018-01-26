/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const TestCases = new Mongo.Collection('TestCases');

TestCases.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

TestCases.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

TestCases.schema = new SimpleSchema({
  name: String,
  type: String,
  format: String,
  loadingQueue: String,
  runTimeSec: Number,
  testMessage: String, // clob
  resultData: String, // clob
  testStatus: {
    type: String,
    allowedValues: ['run', 'loading', 'ready']
  },
  testStart: Date,
  testResult: String,
  testReport: String, // clob
  completesInIpc: Boolean,
  lastRunResult: String, // clob
  rfh2Header: String, // clob
  comment: String,
  group: String,
  autoTest: Boolean,
});

TestCases.attachSchema(TestCases.schema);

export default TestCases;
