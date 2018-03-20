import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import MessageTypes from '../../../api/MessageTypes/MessageTypes';
import Loading from '../../components/Loading/Loading';

const MessageTypeFilter = ({
  loading, messageTypes, value, onChange
}) => (!loading ? (
  <ReactSelect
    labelKey="name"
    valueKey="name"
    name="messageType"
    resetValue=""
    value={value}
    onChange={onChange}
    options={messageTypes}
  />
) : <Loading />);

export default withTracker(({ name }) => {
  const subscription = Meteor.subscribe('messageTypes');
  if (!subscription.ready()) {
    return {
      loading: !subscription.ready(),
    };
  }

  const messageTypes = MessageTypes.find({}, { sort: { name: 1 } }).fetch();

  return {
    messageTypes,
    name,
  };
})(MessageTypeFilter);
