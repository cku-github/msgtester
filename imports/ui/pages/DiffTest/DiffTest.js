import React from 'react';
import PropTypes from 'prop-types';
import jsdiff from 'diff';
import { Button, Col, Row, Glyphicon } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync';
import TestCases from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';

const acceptTestResult = (_id) => {
  Meteor.call('testCases.acceptTestResult', _id, (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Updated test case', 'success');
    }
  });
};

const DiffTest = ({_id, history, loading, name, testRunResult, expectedResult}) => {
  if (loading) {
    return (
      <Loading />
    );
  }

  var diff = jsdiff.diffChars(testRunResult, expectedResult);
  var diffCount = diff.filter(part => part.added || part.removed).length;

  var result = diff.map(function(part, index) {
    var spanStyle = {
      backgroundColor: part.added ? 'lightgreen' : part.removed ? 'salmon' : 'lightgrey'
    };
    return (
      <span key={index} style={spanStyle}>
        {part.value}
      </span>
    );
  });

  return (
    <div>
      <Button onClick={() => history.push('/test-cases')} title="back to test cases">
        <Glyphicon glyph="menu-left" />
      </Button>
      <Button onClick={() => acceptTestResult(_id)} title="accept test result as new standard">
        <Glyphicon glyph="ok" />
      </Button>
      <h1>
        {name}
      </h1>
      <ScrollSync>
        <div>
          <h1>
            Differences Found: {diffCount}
          </h1>
          <ScrollSyncPane>
            <pre className='diff-result'>
              {result}
            </pre>
          </ScrollSyncPane>
          <Row>
            <Col xs={6}>
              <h1>
                Expected Result
              </h1>
              <ScrollSyncPane>
                <pre className='diff-result'>
                  {expectedResult}
                </pre>
              </ScrollSyncPane>
            </Col>
            <Col xs={6}>
              <h1>
                Test Run Result
              </h1>
              <ScrollSyncPane>
                <pre className='diff-result'>
                  {testRunResult}
                </pre>
              </ScrollSyncPane>
            </Col>
          </Row>
        </div>
      </ScrollSync>
    </div>
  );
}

DiffTest.propTypes = {
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  name: PropTypes.string,
  expectedResult: PropTypes.string,
  testRunResult: PropTypes.string,
};

DiffTest.defaultProps = {
  name: '',
  expectedResult: '',
  testRunResult: '',
};

export default withTracker(({ history, match }) => {
  const testCaseId = match.params._id;

  const subscription = Meteor.subscribe('testCases.view', testCaseId);
  if (!subscription.ready()) {
    return {
      history,
      loading: true,
    };
  }

  const {
    name,
    testRunResult,
    expectedResult,
  } = TestCases.findOne(testCaseId);

  return {
    _id: testCaseId,
    history,
    loading: false,
    name,
    testRunResult,
    expectedResult,
  };
})(DiffTest);
