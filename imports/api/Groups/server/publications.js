import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Groups from '../Groups';

Meteor.publish('groups', function groups() {
  return Groups.find();
});
