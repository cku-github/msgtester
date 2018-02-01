import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

class TestCaseEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        name: {
          required: true,
        },

        // TODO fill out form validation
      },
      messages: {
        name: {
          required: 'A name is needed',
        },
      },
      submitHandler() { component.handleSubmit() },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingTestCase = this.props.testCase && this.props.testCase._id;
    const methodToCall = existingTestCase ? 'testCases.update' : 'testCases.insert';
    const testCase = {
      name: this.name.value,
      type: this.messageType.value,
      format: this.format.value,
      loadingQueue: this.loadingQueue.value,
      runTimeSec: Number(this.runTimeSec.value),
      testMessage: this.testMessage.value, // clob
      resultData: this.resultData.value, // clob
      testStatus: 'ready',
      completesInIpc: false,
      rfh2Header: this.rfh2Header.value, // clob
      comment: this.comment.value,
      group: this.group.value,
      autoTest: true,
    };

    if (existingTestCase) {
      testCase._id = existingTestCase;
    }

    Meteor.call(methodToCall, testCase, (error, testCaseId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingTestCase ? 'Test case updated!' : 'Test case added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/test-cases`);
      }
    })
  }

  render() {
    const { testCase } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <input
          name="name"
          placeholder="name"
          ref={name => (this.name = name)}
        />
        <input
          name="loadingQueue"
          placeholder="Queue name"
          ref={loadingQueue => (this.loadingQueue = loadingQueue)}
        />
        <input
          name="format"
          placeholder="format"
          ref={format => (this.format = format)}
        />
        <input
          name="messageType"
          placeholder="Message type"
          ref={messageType => (this.messageType = messageType)}
        />
        <textarea
          className="form-control"
          name="testMessage"
          placeholder="test message"
          ref={testMessage => (this.testMessage = testMessage)}
        />
        <input
          name="runTimeSec"
          defaultValue="60"
          placeholder="allowed runTime in Sec"
          ref={runTimeSec => (this.runTimeSec = runTimeSec)}
        />
        <textarea
          className="form-control"
          name="resultData"
          placeholder="resultData"
          ref={resultData => (this.resultData = resultData)}
        />
        <textarea
          className="form-control"
          name="rfh2Header"
          placeholder="RFH2 MQ queue header value"
          ref={rfh2Header => (this.rfh2Header = rfh2Header)}
        />
        <textarea
          className="form-control"
          name="comment"
          placeholder="comment"
          ref={comment => (this.comment = comment)}
        />
        <input
          name="group"
          placeholder="group"
          ref={group => (this.group = group)}
        />
        <input
          name="completesInIpc"
          placeholder="completesInIpc"
          ref={completesInIpc => (this.completesInIpc = completesInIpc)}
        />
        <input
          name="autoTest"
          placeholder="autoTest"
          ref={autoTest => (this.autoTest = autoTest)}
        />
        <Button type="submit" bsStyle="success">
          {testCase && testCase._id ? 'Save Change' : 'Add Test Case'}
        </Button>
      </form>
    );
  }
}

TestCaseEditor.defaultProps = {
  testCase: {},
};

TestCaseEditor.propTypes = {
  testCase: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default TestCaseEditor;
