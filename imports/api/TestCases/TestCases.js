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
  testRunResult: {
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
  expectedResult: {
    type: String,
    optional: true,
  }, // overview not editor
  completesInIpc: Boolean,
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
  diffCount: {
    type: Number,
    optional: true,
  },
});

TestCases.attachSchema(TestCases.schema);

export default TestCases;
