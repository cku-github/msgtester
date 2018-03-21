/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Formats = new Mongo.Collection('Formats');

Formats.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Formats.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Formats.schema = new SimpleSchema({
  name: String,
});

Formats.attachSchema(Formats.schema);

export default Formats;
