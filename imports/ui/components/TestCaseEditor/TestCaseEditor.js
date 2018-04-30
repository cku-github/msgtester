import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
import QueueSelect from '../QueueSelect/QueueSelect';
import GroupSelect from '../GroupSelect/GroupSelect';
import MessageTypeSelect from '../MessageTypeSelect/MessageTypeSelect';
import FormatSelect from '../FormatSelect/FormatSelect';



class TestCaseEditor extends React.Component {
  constructor(props) {
    super(props);
    this.copyMessage = this.copyMessage.bind(this);
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        name: {
          required: true,
        },
        testIdPrefix: {
          required: false,
          minlength: 8,
          maxlength: 8,
        },
        jiraURL: {
          required: false,
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
        mqUserIdentifier: {
          required: false,
        },
        linefeed: {
          required: false,
        },
      },
      messages: {
        name: {
          required: 'A name is needed',
        },
        testIdPrefix: {
          required: 'prefix which will be used in the ID created in the test message. if used, must be 8char long',
        },
        jiraURL: {
          required: 'optional link to Jira case for this testmessage',
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
        mqUserIdentifier: {
          required: 'If set this value will be written to the MQ Header, UserID field. It is used for message authorisation checks',
        },
        linefeed: {
          required: 'choose the linefeed char the test message will use when written to the Queue',
        },
      },
      submitHandler() { component.handleSubmit(component.form); },
    });
  }

  handleSubmit(form) {
    const { history } = this.props;
    const existingTestCase = this.props.testCase && this.props.testCase._id;
    const methodToCall = existingTestCase ? 'testCases.update' : 'testCases.insert';

    if (!form.format) {
      return Bert.alert('A format is needed', 'danger');
    }

    if (!form.loadingQueue) {
      return Bert.alert('A loading queue is needed', 'danger');
    }

    if (!form.group) {
      return Bert.alert('A group is needed', 'danger');
    }

    if (!form.messageType) {
      return Bert.alert('A message type is needed', 'danger');
    }

    const testCase = {
      name: form.name.value,
      testIdPrefix: form.testIdPrefix.value,
      messageType: form.messageType.value,
      format: form.format.value,
      loadingQueue: form.loadingQueue.value,
      runTimeSec: Number('60'),
      // runTimeSec: Number(form.runTimeSec.value),
      // TODO find way to escape CLOB because I need to store JSON and XML content
      testMessage: form.testMessage.value, // clob
      expectedResult: form.expectedResult.value, // clob
      testStatus: 'ready',
      completesInIpc: form.completesInIpc.checked,
      rfh2Header: form.rfh2Header.value, // clob
      comment: form.comment.value,
      group: form.group.value,
      autoTest: form.autoTest.checked,
      mqUserIdentifier: form.mqUserIdentifier.value,
      linefeed: form.linefeed.value,
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

  copyMessage() {
    const { testCase, history } = this.props;
    Meteor.call('testCases.copy', testCase._id, (error, newTestCaseId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Test case copied', 'success');
        history.push(`/test-cases/${newTestCaseId}`);
      }
    });
  }

  render() {
    const { testCase } = this.props;

    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Button type="submit" bsStyle="success">
          {testCase && testCase._id ? 'Save Change' : 'Add Test Case'}
        </Button>
        {testCase && testCase._id && <Button onClick={this.copyMessage}>Copy messages</Button>}
        <Row>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Test name</ControlLabel>
              <FormControl
                name="name"
                placeholder="name"
                defaultValue={testCase.name}
              />
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <ControlLabel>Message Type</ControlLabel>
              <MessageTypeSelect name={testCase.messageType} />
            </FormGroup>
          </Col>
          <Col xs={1}>
            <FormGroup>
              <ControlLabel>Format</ControlLabel>
              <FormatSelect name={testCase.format} />
            </FormGroup>
          </Col>
          <Col xs={2}>
            <FormGroup>
              <ControlLabel>MQ User</ControlLabel>
              <FormControl
                name="mqUserIdentifier"
                placeholder="mqUserIdentifier"
                defaultValue={testCase.mqUserIdentifier}
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
          <Col xs={1}>
            <FormGroup>
              <ControlLabel>TestID Prefix</ControlLabel>
              <FormControl
                name="testIdPrefix"
                defaultValue={testCase.testIdPrefix}
                placeholder="8 length ID"
              />
            </FormGroup>
          </Col>
          <Col xs={2}>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>Linefeed Chars</ControlLabel>
              <FormControl
                name="linefeed"
                componentClass="select"
                placeholder="linefeed"
                defaultValue={testCase.linefeed || 'CRLF'}
              >
                <option value="LF">LF</option>
                <option value="CRLF">CRLF</option>
              </FormControl>
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
                rows={6}
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
                rows={6}
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
            rows={24}
            defaultValue={testCase.testMessage}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Result Data</ControlLabel>
          <textarea
            className="form-control"
            name="expectedResult"
            placeholder="expectedResult"
            rows={24}
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
