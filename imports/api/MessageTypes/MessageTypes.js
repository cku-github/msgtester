/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const MessageTypes = new Mongo.Collection('MessageTypes');

MessageTypes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

MessageTypes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

MessageTypes.schema = new SimpleSchema({
  name: String,
});

MessageTypes.attachSchema(MessageTypes.schema);

export default MessageTypes;
