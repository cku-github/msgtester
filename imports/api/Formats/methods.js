import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Formats from './Formats';

Meteor.methods({
  'formats.insert': function formatsInsert(format) {
    check(format, {
      name: String,
    });

    try {
      return Formats.insert(format);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});
