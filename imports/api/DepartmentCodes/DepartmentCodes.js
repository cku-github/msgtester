/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const DepartmentCodes = new Mongo.Collection('DepartmentCodes');

DepartmentCodes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

DepartmentCodes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

DepartmentCodes.schema = new SimpleSchema({
  name: String,
});

DepartmentCodes.attachSchema(DepartmentCodes.schema);

export default DepartmentCodes;
