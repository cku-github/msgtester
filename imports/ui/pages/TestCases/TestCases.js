import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import TestCasesCollection from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';

import './TestCases.scss';

const runTest = (_id) => {
  const date = new Date();
  Meteor.call('testCases.runTest', _id, date, (error, result) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    }
    else {
      Bert.alert('Test is running', 'success');
    }
  })
}

const TestCases = ({
  loading, testCases, match, history,
}) => (!loading ? (
  <div className="TestCases">
    <div className="page-header clearfix">
      <h4 className="pull-left">TestCases</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Test Case</Link>
    </div>
    {TestCases.length ?
      <Table responsive>
        <thead>
          <tr>
            <th />
            <th>Group</th>
            <th>Name</th>
            <th>MT</th>
            <th>Status</th>
            <th>Last Run</th>
            <th>Format</th>
            <th>Test Result</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map(({
            _id, group, name
          }) => (
            <tr key={_id}>
              <td>
                <Button onClick={() => runTest(_id)}>
                  Run
                </Button>
                <Button onClick={() => history.push(`${match.url}/${_id}`)}>
                  Edit
                </Button>
                <Button>
                  Test Results
                </Button>
              </td>
              <td>{group}</td>
              <td>{name}</td>
              <td>MT</td>
              <td>Status</td>
              <td>Last Run</td>
              <td>Format</td>
              <td>Test Result</td>
            </tr>
          ))}
        </tbody>
      </Table> : <Alert bsStyle="warning">No TestCases yet!</Alert>}
  </div>
) : <Loading />);

TestCases.propTypes = {
  loading: PropTypes.bool.isRequired,
  testCases: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('testCases');
  return {
    loading: !subscription.ready(),
    testCases: TestCasesCollection.find().fetch(),
  };
})(TestCases);

// export default TestCases;
