import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Queues from '../../../api/Queues/Queues';
import Loading from '../../components/Loading/Loading';

const QueueFilter = ({
  loading, queues, value, onChange
}) => (!loading ? (
  <ReactSelect
    labelKey="name"
    valueKey="name"
    name="loadingQueue"
    resetValue=""
    value={value}
    onChange={onChange}
    options={queues}
  />
) : <Loading />);

export default withTracker(({ name }) => {
  const subscription = Meteor.subscribe('queues');
  if (!subscription.ready()) {
    return {
      loading: !subscription.ready(),
    };
  }

  const queues = Queues.find().fetch();

  return {
    queues,
    name,
  };
})(QueueFilter);
