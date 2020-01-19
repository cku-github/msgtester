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
import QueueFilter from '../../components/QueueSelect/QueueFilter';
import MessageTypeFilter from '../../components/MessageTypeSelect/MessageTypeFilter';
import DepartmentCodeFilter from '../../components/DepartmentCodeSelect/DepartmentCodeFilter';
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

const runTestsFiltered = (params) => {
  Meteor.call('testCases.runTestsFiltered', params, (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Ran filtered tests successfully', 'success');
    }
  });
}

class TestCases extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingQueue: window.localStorage.getItem('filterLoadingQueue') || '',
      group: window.localStorage.getItem('filterGroup') || '',
      messageType: window.localStorage.getItem('filterMessageType') || '',
      departmentCode: window.localStorage.getItem('filterDepartmentCode') || '',
    };

    this.filterGroup = this.filterGroup.bind(this);
    this.filterQueue = this.filterQueue.bind(this);
    this.filterMessageType = this.filterMessageType.bind(this);
    this.filterDepartmentCode = this.filterDepartmentCode.bind(this);
  }

  filterGroup({ name }) {
    if (name) {
      window.localStorage.setItem('filterGroup', name);
    } else {
      window.localStorage.removeItem('filterGroup');
    }
    this.setState({ group: name });
  }

  filterQueue({ name }) {
    if (name) {
      window.localStorage.setItem('filterLoadingQueue', name);
    } else {
      window.localStorage.removeItem('filterLoadingQueue');
    }
    this.setState({ loadingQueue: name });
  }

  filterMessageType({ name }) {
    if (name) {
      window.localStorage.setItem('filterMessageType', name);
    } else {
      window.localStorage.removeItem('filterMessageType');
    }
    this.setState({ messageType: name });
  }

  filterDepartmentCode({ name }) {
    if (name) {
      window.localStorage.setItem('filterDepartmentCode', name);
    } else {
      window.localStorage.removeItem('filterDepartmentCode');
    }
    this.setState({ departmentCode: name });
  }

  render() {
    const { match, history } = this.props;
    const { loadingQueue, group, messageType, departmentCode } = this.state;

    return (
      <div className="TestCases">
        <div className="pull-right">
          <Button onClick={importPostgresInfo} 
            title={`load all testcases from linked Postgresql DB:
                  ${Meteor.settings.public.postgresInfo.host}:${Meteor.settings.public.postgresInfo.port}/${Meteor.settings.public.postgresInfo.database}`}>
            Reload from Postgres
          </Button>
        </div>
        <div className="page-header clearfix">
          <h2 className="pull-left">{Meteor.settings.public.environmentName}</h2>
          <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Test Case</Link>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th>
                <Button onClick={() => runTestsFiltered({ loadingQueue, group, messageType, departmentCode })} title="Run all filtered tests">
                  <Glyphicon glyph="forward" />
                </Button>
              </th>
              <th>DP</th>
              <th>Group</th>
              <th>Name</th>
              <th>MT</th>
              <th>Queue</th>
              <th>Status</th>
              <th>Diff</th>
              <th>Last run</th>
              <th>IPC Link</th>
            </tr>
            <tr>
              <th />
              <th>
                <DepartmentCodeFilter value={departmentCode} onChange={this.filterDepartmentCode} />
              </th>
              <th>
                <GroupFilter value={group} onChange={this.filterGroup} />
              </th>
              <th />
              <th>
                <MessageTypeFilter value={messageType} onChange={this.filterMessageType} />
              </th>
              <th>
                <QueueFilter value={loadingQueue} onChange={this.filterQueue} />
              </th>
              <th />
              <th />
              <th />
              <th />
            </tr>
          </thead>
          <TestCasesTableBody departmentCode={departmentCode} group={group} loadingQueue={loadingQueue} messageType={messageType} match={match} history={history} />
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
