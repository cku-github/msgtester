import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MessageTypes from './MessageTypes';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'messageTypes.insert': function messageTypesInsert(messageType) {
    check(messageType, {
      name: String,
    });

    try {
      return MessageTypes.insert(messageType);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});
