import React from 'react';
import PropTypes from 'prop-types';
import jsdiff from 'diff';

const DiffTest = ({inputA, inputB}) => {
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

export default DiffTest;
