import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MessageTypes from '../MessageTypes';

Meteor.publish('messageTypes', function messageTypes() {
  return MessageTypes.find();
});
