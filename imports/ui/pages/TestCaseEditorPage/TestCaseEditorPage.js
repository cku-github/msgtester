import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TestCases from '../../../api/TestCases/TestCases';
import TestCaseEditor from '../../components/TestCaseEditor/TestCaseEditor';
import NotFound from '../NotFound/NotFound';

const TestCaseEditorPage = ({history, testCase}) => (testCase ? (
  <div className="TestCaseEditorPage">
    <TestCaseEditor history={history} testCase={testCase} />
  </div>
) : <NotFound />);

TestCaseEditorPage.defaultProps = {
  testCase: null,
};

TestCaseEditorPage.propTypes = {
  testCase: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ history, match }) => {
  const testCaseId = match.params._id;
  if (testCaseId) {
    const subscription = Meteor.subscribe('testCases.view', testCaseId);

    return {
      history,
      loading: !subscription.ready(),
      testCase: TestCases.findOne(testCaseId),
    };
  }

  return {
    history,
    loading: false,
    testCase: {},
  };
})(TestCaseEditorPage);
