import 'react-select/dist/react-select.css';
import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Groups from '../../../api/Groups/Groups';
import Loading from '../../components/Loading/Loading';

class GroupFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.name ? { name: props.name } : '',
    };
  }

  render() {
    const { loading, groups, onChange } = this.props;
    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.name;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <ReactSelect
        labelKey="name"
        valueKey="name"
        name="group"
        value={value}
        onChange={onChange}
        options={groups}
      />
    );
  }
}

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
