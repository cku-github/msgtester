import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Formats from '../../../api/Formats/Formats';
import Loading from '../../components/Loading/Loading';

const FormatFilter = ({
  loading, formats, value, onChange
}) => (!loading ? (
  <ReactSelect
    autosize={false}
    labelKey="name"
    valueKey="name"
    name="format"
    resetValue=""
    value={value}
    onChange={onChange}
    options={formats}
  />
) : <Loading />);

export default withTracker(({ name }) => {
  const subscription = Meteor.subscribe('formats');
  if (!subscription.ready()) {
    return {
      loading: !subscription.ready(),
    };
  }

  const formats = Formats.find({}, { sort: { name: 1 } }).fetch();

  return {
    formats,
    name,
  };
})(FormatFilter);
