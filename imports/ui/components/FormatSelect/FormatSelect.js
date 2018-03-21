import 'react-select/dist/react-select.css';
import React from 'react';
import { Creatable } from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Formats from '../../../api/Formats/Formats';
import Loading from '../../components/Loading/Loading';

class FormatSelect extends React.Component {
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
    Meteor.call('formats.insert', { name }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Format added!');
        this.setState({ selectedOption: { name } });
      }
    });
  }

  render() {
    const { loading, formats } = this.props;
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
        name="format"
        value={value}
        onChange={this.handleChange}
        onNewOptionClick={this.handleNewOption}
        options={formats}
      />
    );
  }
}

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
})(FormatSelect);
