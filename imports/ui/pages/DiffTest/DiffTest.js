import React from 'react';
import PropTypes from 'prop-types';
import jsdiff from 'diff';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TestCases from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';

const DiffTest = ({loading, testResult, resultData}) => {
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
  inputA: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  inputB: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  type: PropTypes.oneOf([
    'chars',
    'words',
    'sentences',
    'json'
  ])
};

DiffTest.defaultProps = {
  inputA: '',
  inputB: '',
  type: 'chars'
};

export default withTracker(({ history, match }) => {
  const testCaseId = match.params._id;

  const subscription = Meteor.subscribe('testCases.view', testCaseId);
  const testCase = TestCases.findOne(testCaseId);

  return {
    history,
    loading: !subscription.ready(),
    testResult: testCase && testCase.testResult,
    resultData: testCase && testCase.resultData,
  };
})(DiffTest);
