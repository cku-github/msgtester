import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
import QueueSelect from '../QueueSelect/QueueSelect';
import GroupSelect from '../GroupSelect/GroupSelect';
import MessageTypeSelect from '../MessageTypeSelect/MessageTypeSelect';

class TestCaseEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        name: {
          required: true,
        },
        messageType: {
          required: true,
        },
        format: {
          required: true,
        },
        loadingQueue: {
          required: true,
        },
        runTimeSec: {
          required: true,
        },
        testMessage: {
          required: true,
        },
        expectedResult: {
          required: false,
        },
        testStatus: {
          required: true,
        },
        completesInIpc: {
          required: false,
        },
        rfh2Header: {
          required: false,
        },
        comment: {
          required: false,
        },
        group: {
          required: true,
        },
        autoTest: {
          required: false,
        },
      },
      messages: {
        name: {
          required: 'A name is needed',
        },
        messageType: {
          required: 'please choose a messageType',
        },
        format: {
          required: 'please choose a format from the list',
        },
        loadingQueue: {
          required: 'the MQ loading queue needs to be defined here',
        },
        runTimeSec: {
          required: 'set a time in sec to wait before the test result is calculated',
        },
        testMessage: {
          required: 'Paste the full test message here. Replace the SEME / or whatever value is stored in C_REF_1 in IPC with [REFERENCE] placeholder',
        },
        expectedResult: {
          required: 'Once a test run completes the resulting trace is stored here. You can manually edit this if required. This is used for comparing the next test run trace',
        },
        testStatus: {
          required: 'Status Ready shows that test is complete and can be run again',
        },
        completesInIpc: {
          required: 'Set flag if we expect this message to successfully complete in IPC. Some messages stay active. Normally test runs wait for the message to complete in IPC before the trace is calculated',
        },
        rfh2Header: {
          required: 'Paste any required MQ RFH2 headers here. Required for testing T2S messages or data from WBIFN systems',
        },
        comment: {
          required: 'Comment your test case here. Some keywords such as ID=xxxx will cause the MQMD_MSG_ID field to be filled with the relevant xxx value. USERID=yyyy will be written to MQMD_USER_IDENTIFIER',
        },
        group: {
          required: 'Please choose from list or create a new group to organize tests',
        },
        autoTest: {
          required: 'If set to true this test case will be run automatically on each code change deployment in the ISB',
        },
      },
      submitHandler() { component.handleSubmit(component.form); },
    });
  }

  handleSubmit(form) {
    const { history } = this.props;
    const existingTestCase = this.props.testCase && this.props.testCase._id;
    const methodToCall = existingTestCase ? 'testCases.update' : 'testCases.insert';
    const testCase = {
      name: form.name.value,
      messageType: form.messageType.value,
      format: form.format.value,
      loadingQueue: form.loadingQueue.value,
      runTimeSec: Number(form.runTimeSec.value),
      // TODO find way to escape CLOB because I need to store JSON and XML content
      testMessage: form.testMessage.value, // clob
      expectedResult: form.expectedResult.value, // clob
      testStatus: 'ready',
      completesInIpc: form.completesInIpc.checked,
      rfh2Header: form.rfh2Header.value, // clob
      comment: form.comment.value,
      group: form.group.value,
      autoTest: form.autoTest.checked,
    };

    if (existingTestCase) {
      testCase._id = existingTestCase;
    }

    Meteor.call(methodToCall, testCase, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingTestCase ? 'Test case updated!' : 'Test case added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/test-cases`);
      }
    });
  }

  render() {
    const { testCase } = this.props;

    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Row>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Test name</ControlLabel>
              <input
                name="name"
                placeholder="name"
                defaultValue={testCase.name || 'some name'}
              />
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Message Type</ControlLabel>
              <MessageTypeSelect name={testCase.messageType} />
            </FormGroup>
          </Col>
          <Col xs={3}>
            <FormGroup>
              <ControlLabel>Format</ControlLabel>
              <input
                name="format"
                placeholder="format"
                defaultValue={testCase.format || 'FIN'}
              />
            </FormGroup>
          </Col>
          <Col xs={1}>
            <FormGroup>
              <ControlLabel>Completes in IPC</ControlLabel>
              <input
                type="checkbox"
                name="completesInIpc"
                placeholder="completesInIpc"
                defaultChecked={testCase.completesInIpc || true}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Group</ControlLabel>
              <GroupSelect name={testCase.group} />
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>MQ Queue Name</ControlLabel>
              <QueueSelect name={testCase.loadingQueue} />
            </FormGroup>
          </Col>
          <Col xs={3}>
            <FormGroup>
              <ControlLabel>Run Time Sec.</ControlLabel>
              <input
                name="runTimeSec"
                defaultValue={testCase.runTimeSec || 60}
                placeholder="allowed runTime in Sec"
              />
            </FormGroup>
          </Col>
          <Col xs={1}>
            <FormGroup>
              <ControlLabel>Autotest</ControlLabel>
              <input
                type="checkbox"
                name="autoTest"
                placeholder="autoTest"
                defaultValue={testCase.autoTest || false}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>Comment</ControlLabel>
              <textarea
                className="form-control"
                name="comment"
                placeholder="comment"
                defaultValue={testCase.comment}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>RFH2 Header</ControlLabel>
              <textarea
                className="form-control"
                name="rfh2Header"
                placeholder="RFH2 MQ queue header value"
                defaultValue={testCase.rfh2Header}
              />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <ControlLabel>Test Message</ControlLabel>
          <textarea
            className="form-control"
            name="testMessage"
            placeholder="test message"
            defaultValue={testCase.testMessage || 'Some test message values'}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Result Data</ControlLabel>
          <textarea
            className="form-control"
            name="expectedResult"
            placeholder="expectedResult"
            defaultValue={testCase.expectedResult}
          />
        </FormGroup>
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
