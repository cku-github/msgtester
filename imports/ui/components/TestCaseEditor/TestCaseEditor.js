import React from 'react';

const TestCaseEditor = () => {
  return (
    <form>
      <input name="name" placeholder="name" />
      <input name="loadingQueue" placeholder="Queue name" />
      <input name="format" placeholder="format" />
      <input name="messageType" placeholder="Message type" />
      <textarea
        className="form-control"
        name="testMessage"
        placeholder="test message"
      />
      <input
        name="runTimeSec"
        defaultValue="60"
        placeholder="allowed runTime in Sec"
      />
      <textarea
        className="form-control"
        name="resultData"
        placeholder="resultData"
      />
      <textarea
        className="form-control"
        name="rfh2Header"
        placeholder="RFH2 MQ queue header value"
      />
      <textarea
        className="form-control"
        name="comment"
        placeholder="comment"
      />
      <input name="group" placeholder="group" />
      <input name="name" placeholder="name" />
      <input name="completesInIpc" placeholder="completesInIpc" />
      <input name="autoTest" placeholder="autoTest" />
    </form>
  );
};

export default TestCaseEditor;
