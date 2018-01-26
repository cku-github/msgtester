import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import TestCases from '../TestCases';

Meteor.publish('testCases', function testCases() {
  return TestCases.find();
});
