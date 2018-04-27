import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import RemoveTestCaseModal from './RemoveTestCaseModal';

class RemoveTestCaseButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isOpen: false};
    this.removeTestCase = this.removeTestCase.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  removeTestCase() {
    const {_id} = this.props;
    Meteor.call('testCases.remove', _id, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Testcase removed', 'success');
      }
    });
  }

  openModal() {
    this.setState({isOpen: true});
  }

  closeModal(event) {
    event.stopPropagation();
    this.setState({isOpen: false});
  }

  render() {
    const {name} = this.props;
    const {isOpen} = this.state;

    return (
      <Button bsStyle="danger" onClick={this.openModal} title="delete">
        <RemoveTestCaseModal
          isOpen={isOpen}
          name={name}
          removeTestCase={this.removeTestCase}
          closeModal={this.closeModal}
        />
        <Glyphicon glyph="remove" />
      </Button>
    );
  }
}

RemoveTestCaseButton.propTypes = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default RemoveTestCaseButton;
