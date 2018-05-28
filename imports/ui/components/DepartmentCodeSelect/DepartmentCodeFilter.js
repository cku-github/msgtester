import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import DepartmentCodes from '../../../api/DepartmentCodes/DepartmentCodes';
import Loading from '../../components/Loading/Loading';

const DepartmentCodeFilter = ({
  loading, departmentCodes, value, onChange
}) => (!loading ? (
  <ReactSelect
    labelKey="name"
    valueKey="name"
    name="departmentCode"
    resetValue=""
    value={value}
    onChange={onChange}
    options={departmentCodes}
  />
) : <Loading />);

export default withTracker(({ name }) => {
  const subscription = Meteor.subscribe('departmentCodes');
  if (!subscription.ready()) {
    return {
      loading: !subscription.ready(),
    };
  }

  const departmentCodes = DepartmentCodes.find({}, { sort: { name: 1 } }).fetch();

  return {
    departmentCodes,
    name,
  };
})(DepartmentCodeFilter);
