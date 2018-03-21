import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Formats from '../Formats';

Meteor.publish('formats', function formats() {
  return Formats.find();
});
