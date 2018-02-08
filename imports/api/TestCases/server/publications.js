import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import TestCases from '../TestCases';

Meteor.publish('testCases', function testCases() {
  return TestCases.find();
});

Meteor.publish('testCases.view', function testCasesView(testCaseId) {
  check(testCaseId, String);
  return TestCases.find(testCaseId);
});
