import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';

const removeTest = (_id) => {
  Meteor.call('testCases.remove', _id, (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Testcase removed', 'success');
    }
  });
};

const RemoveTestCaseButton = ({_id}) => {
  return (
    <Button bsStyle="danger" onClick={() => removeTest(_id)} title="delete">
      <Glyphicon glyph="remove" />
    </Button>
  );
}

RemoveTestCaseButton.propTypes = {
  _id: PropTypes.string.isRequired,
};

export default RemoveTestCaseButton;
