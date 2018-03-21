import React from 'react';
import { Meteor } from 'meteor/meteor';

import './Logout.scss';

class Logout extends React.Component {
  componentDidMount() {
    Meteor.logout();
  }

  render() {
    return (
      <div className="Logout">
        <h1>Thanks for testing.</h1>
      </div>
    );
  }
}

Logout.propTypes = {};

export default Logout;
