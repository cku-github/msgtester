import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Queues from '../Queues';

Meteor.publish('queues', function queues() {
  return Queues.find();
});
