import React from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'react-bootstrap';
import { year } from '../../../modules/dates';

import './Footer.scss';

const copyrightYear = () => {
  const currentYear = year();
  return currentYear === '2018' ? '2018' : `2018-${currentYear}`;
};

const Footer = () => (
  <div className="Footer">
    <Grid>
      <p className="pull-left">&copy; {copyrightYear()} Testcase Manager</p>
      <ul className="pull-right">
        <li><a href="https://tere.tech/">TERE TECH</a></li>
      </ul>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
