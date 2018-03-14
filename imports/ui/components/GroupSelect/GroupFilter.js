import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Groups from '../../../api/Groups/Groups';
import Loading from '../../components/Loading/Loading';

const GroupFilter = ({
  loading, groups, value, onChange
}) => (!loading ? (
  <ReactSelect
    labelKey="name"
    valueKey="name"
    name="group"
    resetValue=""
    value={value}
    onChange={onChange}
    options={groups}
  />
) : <Loading />);

export default withTracker(({ name }) => {
  const subscription = Meteor.subscribe('groups');
  if (!subscription.ready()) {
    return {
      loading: !subscription.ready(),
    };
  }

  const groups = Groups.find().fetch();

  return {
    groups,
    name,
  };
})(GroupFilter);
