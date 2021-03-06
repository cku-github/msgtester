import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#react-root');

const RemoveTestCaseModal = ({isOpen, name, removeTestCase, closeModal}) => {
  return (
    <Modal isOpen={isOpen} style={customStyles} contentLabel="Remove Test Case Modal">
      <h1>
        Are you sure to wish to delete this test case: {name}?
      </h1>
      <Button onClick={removeTestCase}>
        Yes
      </Button>
      <Button onClick={closeModal}>
        No
      </Button>
    </Modal>
  );
};

RemoveTestCaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  removeTestCase: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default RemoveTestCaseModal;
