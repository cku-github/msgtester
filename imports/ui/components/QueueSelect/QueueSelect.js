import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect, { Creatable } from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Queues from '../../../api/Queues/Queues';
import Loading from '../../components/Loading/Loading';

class QueueSelect extends React.Component {
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
    Meteor.call('queues.insert', { name }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Queue added!');
        this.setState({ selectedOption: { name } });
      }
    });
  }

  render() {
    const { loading, queues } = this.props;
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
        name="loadingQueue"
        value={value}
        onChange={this.handleChange}
        onNewOptionClick={this.handleNewOption}
        options={queues}
      />
    );
  }
}

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
})(QueueSelect);
