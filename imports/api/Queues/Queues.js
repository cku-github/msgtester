/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Queues = new Mongo.Collection('Queues');

Queues.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Queues.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Queues.schema = new SimpleSchema({
  name: String,
});

Queues.attachSchema(Queues.schema);

export default Queues;
