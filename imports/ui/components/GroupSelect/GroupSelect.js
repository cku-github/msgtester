import React from 'react';
import ReactSelect, { Creatable } from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Groups from '../../../api/Groups/Groups';
import Loading from '../../components/Loading/Loading';

import 'react-select/dist/react-select.css';

class GroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.name ? {name: props.name} : '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewOption = this.handleNewOption.bind(this);
  }

  handleChange(selectedOption) {
    this.setState({ selectedOption });
  }

  handleNewOption({name}) {
    Meteor.call('groups.insert', {name}, (error, groupId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Group added!');
        this.setState({ selectedOption: {name} });
      }
    });
  }

  render() {
    const { loading, groups } = this.props;
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
        name="group"
        value={value}
        onChange={this.handleChange}
        onNewOptionClick={this.handleNewOption}
        options={groups}
      />
    );
  }
}

export default withTracker(({name}) => {
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
})(GroupSelect);
