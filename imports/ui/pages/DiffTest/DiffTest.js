import React from 'react';
import PropTypes from 'prop-types';
import jsdiff from 'diff';
import { Button } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TestCases from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';

const DiffTest = ({history, loading, name, testResult, resultData}) => {
  if (loading) {
    return (
      <Loading />
    );
  }

  const inputA = testResult;
  const inputB = resultData;
  var diff = jsdiff.diffChars(inputA, inputB);
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
      <h1>
        Test Result
      </h1>
      <pre className='diff-result'>
        {testResult}
      </pre>
      <h1>
        Result Data
      </h1>
      <pre className='diff-result'>
        {resultData}
      </pre>
    </div>
  );
}

DiffTest.propTypes = {
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  name: PropTypes.string,
  testResult: PropTypes.string,
  resultData: PropTypes.string,
};

DiffTest.defaultProps = {
  name: '',
  testResult: '',
  resultData: '',
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
    testResult,
    resultData,
  } = TestCases.findOne(testCaseId);

  return {
    history,
    loading: false,
    name,
    testResult,
    resultData,
  };
})(DiffTest);
