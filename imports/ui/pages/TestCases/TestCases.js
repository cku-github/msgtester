import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import TestCasesCollection from '../../../api/TestCases/TestCases';
import { timeago, monthDayYearAtTime } from '../../../modules/dates';
import Loading from '../../components/Loading/Loading';

import './TestCases.scss';

const handleRemove = (documentId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('TestCases.remove', documentId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Document deleted!', 'success');
      }
    });
  }
};

const TestCases = ({
  loading = false, testCases = [1], match, history,
}) => (!loading ? (
  <div className="TestCases">
    <div className="page-header clearfix">
      <h4 className="pull-left">TestCases</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Document</Link>
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
            _id, title, createdAt, updatedAt,
          }) => (
            <tr key={_id}>
              <td>
                <Button>
                  Run
                </Button>
                <Button>
                  Edit
                </Button>
                <Button>
                  Test Results
                </Button>
              </td>
              <td>Group</td>
              <td>Name</td>
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

// export default withTracker(() => {
//   const subscription = Meteor.subscribe('TestCases');
//   return {
//     loading: !subscription.ready(),
//     TestCases: TestCasesCollection.find().fetch(),
//   };
// })(TestCases);

export default TestCases;
