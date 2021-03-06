import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert, Button, Glyphicon } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import TestCasesCollection from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/LoadingTable';
import RemoveTestCaseButton from '../../components/RemoveTestCaseButton/RemoveTestCaseButton';

import './TestCasesTableBody.scss';

const runTest = (_id) => {
  const date = new Date();
  Meteor.call('testCases.runTest', _id, date, (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Test is running', 'success');
    }
  });
};

const TestCasesTableBody = ({
  loading, testCases, match, history,
}) => (!loading ? (
  <tbody className="TestCasesTableBody">
    {testCases.length ? testCases.map(({
      _id, departmentCode, group, name, messageType, loadingQueue, testStatus, diffCount, testStart, ipcLink,
    }) => (
      <tr key={_id}>
        <td>
          <Button onClick={() => runTest(_id)} title="run">
            <Glyphicon glyph="play" />
          </Button>
          <Button onClick={() => history.push(`${match.url}/${_id}`)} title="edit">
            <Glyphicon glyph="pencil" />
          </Button>
          <RemoveTestCaseButton _id={_id} name={name} />
          <Button onClick={() => history.push(`${match.url}/${_id}/diff`)} title="diff">
            <Glyphicon glyph="eye-open" />
          </Button>
        </td>
        <td>{departmentCode || ''}</td>
        <td>{group}</td>
        <td>{name}</td>
        <td>{messageType}</td>
        <td>{loadingQueue}</td>
        <td className={`testStatus ${testStatus}`}>{testStatus}</td>
        <td>{diffCount}</td>
        <td>{testStart ? testStart.toISOString().substring(0,10) : '' }</td>
        <td>
          <a href={ipcLink} target="_blank">
            ...
          </a>
        </td>
      </tr>
    )) : <tr><td colSpan={9}><Alert bsStyle="warning">No TestCases yet!</Alert></td></tr>}
  </tbody>
) : <Loading />);

TestCasesTableBody.propTypes = {
  loading: PropTypes.bool.isRequired,
  testCases: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(({
  departmentCode, group, loadingQueue, messageType, match, history
}) => {
  const subscription = Meteor.subscribe('testCases');

  const params = {};

  if (departmentCode) {
    params.departmentCode = departmentCode;
  }

  if (group) {
    params.group = group;
  }

  if (loadingQueue) {
    params.loadingQueue = loadingQueue;
  }

  if (messageType) {
    params.messageType = messageType;
  }

  return {
    loading: !subscription.ready(),
    testCases: TestCasesCollection.find(params, { sort: { group: 1, name: 1 } }).fetch(),
  };
})(TestCasesTableBody);
