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
  owner: SimpleSchema.RegEx.Id,
  name: String,
  type: String,
  format: String,
  loadingQueue: String,
  runTimeSec: Number,
  testMessage: String, // clob
  resultData: {
    type: String,
    optional: true,
  }, // clob
  testStatus: {
    type: String,
    allowedValues: ['run', 'loading', 'ready'],
  },
  testStart: {
    type: Date,
    optional: true,
  }, // internal
  testResult: {
    type: String,
    optional: true,
  }, // overview not editor
  testReport: {
    type: String,
    optional: true,
  }, // clob, internal
  completesInIpc: Boolean,
  lastRunResult: {
    type: String,
    optional: true,
  }, // clob, internal, overview not editor
  rfh2Header: {
    type: String,
    optional: true,
  }, // clob
  comment: {
    type: String,
    optional: true,
  }, // clob,
  group: String,
  autoTest: Boolean,
});

TestCases.attachSchema(TestCases.schema);

export default TestCases;
