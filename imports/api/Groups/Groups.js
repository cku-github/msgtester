/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Groups = new Mongo.Collection('Groups');

Groups.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Groups.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Groups.schema = new SimpleSchema({
  name: String,
});

Groups.attachSchema(Groups.schema);

export default Groups;
