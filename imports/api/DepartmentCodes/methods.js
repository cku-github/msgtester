import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import DepartmentCodes from './DepartmentCodes';

Meteor.methods({
  'departmentCodes.insert': function departmentCodesInsert(departmentCode) {
    check(departmentCode, {
      name: String,
    });

    try {
      return DepartmentCodes.insert(departmentCode);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});
