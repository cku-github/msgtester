import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Queues from './Queues';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'queues.insert': function queuesInsert(queue) {
    check(queue, {
      name: String,
    });

    try {
      return Queues.insert(queue);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});
