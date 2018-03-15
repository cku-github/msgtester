import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Groups from './Groups';

Meteor.methods({
  'groups.insert': function groupsInsert(group) {
    check(group, {
      name: String,
    });

    try {
      return Groups.insert(group);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});
