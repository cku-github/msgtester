import 'react-select/dist/react-select.css';
import React from 'react';
import { Creatable } from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import MessageTypes from '../../../api/MessageTypes/MessageTypes';
import Loading from '../../components/Loading/Loading';

class MessageTypeSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.name ? { name: props.name } : '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewOption = this.handleNewOption.bind(this);
  }

  handleChange(selectedOption) {
    this.setState({ selectedOption });
  }

  handleNewOption({ name }) {
    Meteor.call('messageTypes.insert', { name }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('MessageType added!');
        this.setState({ selectedOption: { name } });
      }
    });
  }

  render() {
    const { loading, messageTypes } = this.props;
    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.name;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <Creatable
        labelKey="name"
        valueKey="name"
        name="messageType"
        value={value}
        onChange={this.handleChange}
        onNewOptionClick={this.handleNewOption}
        options={messageTypes}
      />
    );
  }
}

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
})(MessageTypeSelect);
