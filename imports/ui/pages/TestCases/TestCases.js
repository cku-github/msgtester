import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button, Glyphicon } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import TestCasesCollection from '../../../api/TestCases/TestCases';
import Loading from '../../components/Loading/Loading';
import GroupFilter from '../../components/GroupSelect/GroupFilter';
import TestCasesTableBody from './TestCasesTableBody';

import './TestCases.scss';

const importPostgresInfo = () => {
  Meteor.call('importPostgresInfo', (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Imported successfully', 'success');
    }
  });
}

class TestCases extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loadingQueue: '', group: ''};
    this.filterGroup = this.filterGroup.bind(this);
  }

  filterGroup({name}) {
    this.setState({group: name});
  }

  render() {
    const {match, history} = this.props;
    const {loadingQueue, group} = this.state;

    return (
      <div className="TestCases">
        <div>
          <Button onClick={importPostgresInfo}>
            Import Postgres Info
          </Button>
        </div>
        <div className="page-header clearfix">
          <h4 className="pull-left">TestCases</h4>
          <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Test Case</Link>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th />
              <th>Group</th>
              <th>Name</th>
              <th>MT</th>
              <th>Status</th>
              <th>Diff Count</th>
              <th>Format</th>
              <th>Test Result</th>
            </tr>
            <tr>
              <th />
              <th><GroupFilter value={group} onChange={this.filterGroup} /></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <TestCasesTableBody group={group} loadingQueue={loadingQueue} match={match} history={history} />
        </Table>
      </div>
    );
  }
}

TestCases.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default TestCases;
