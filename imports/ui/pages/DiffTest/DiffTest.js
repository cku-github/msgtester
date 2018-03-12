import React from 'react';
import PropTypes from 'prop-types';
import jsdiff from 'diff';
import { Button, Col, Row } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TestCases from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';

const DiffTest = ({history, loading, name, testRunResult, expectedResult}) => {
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
      <Button onClick={() => history.push('/test-cases')}>
        Back to Test Cases
      </Button>
      <h1>
        {name}
      </h1>
      <h1>
        Differences Found: {diffCount}
      </h1>
      <pre className='diff-result'>
        {result}
      </pre>
      <Row>
        <Col xs={6}>
          <h1>
            Expected Result
          </h1>
          <pre className='diff-result'>
            {expectedResult}
          </pre>
        </Col>
        <Col xs={6}>
          <h1>
            Test Run Result
          </h1>
          <pre className='diff-result'>
            {testRunResult}
          </pre>
        </Col>
      </Row>
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
    history,
    loading: false,
    name,
    testRunResult,
    expectedResult,
  };
})(DiffTest);
