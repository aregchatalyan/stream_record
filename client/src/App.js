import { useEffect, useRef, useState } from 'react';

import { socket, peer } from './func/main';

const sendAction = (action) => {
  socket.send(JSON.stringify({
    action,
    sessionId: peer.sessionId
  }));
}

const App = () => {
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const combineBtnRef = useRef(null);

  const [ rec, setRec ] = useState(false);
  const [ disconnected, setDisconnected ] = useState(socket.connected);

  useEffect(() => {
    startBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = true;
    combineBtnRef.current.disabled = true;
  }, []);

  useEffect(() => {
    if (rec) {
      setTimeout(() => {
        stopRecord();
        console.log('The record stopped by timer!');
      }, 15000);
    }
  }, [ rec ]);

  const startRecord = () => {
    sendAction('start-record');

    startBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = false;

    setRec(true);
  }

  const stopRecord = () => {
    sendAction('stop-record');

    startBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = true;

    setRec(false);
  }

  const combineRecords = () => {
    sendAction('start-combine');

    startBtnRef.current.disabled = true;
  }

  return (
    <div id="app">
      <video
        id="localVideo"
        autoPlay
        muted
        playsInline
      />

      <div id="control">
        <button
          id="startRecordButton"
          ref={startBtnRef}
          onClick={startRecord}
        >
          Start Record
        </button>

        <button
          id="stopRecordButton"
          ref={stopBtnRef}
          onClick={stopRecord}
        >
          Stop Record
        </button>

        <button
          id="combineRecordsButton"
          ref={combineBtnRef}
          onClick={combineRecords}
        >
          Combine Records
        </button>

        <button onClick={() => {
          socket.disconnect();
          setDisconnected(true);
        }} disabled={disconnected}>Disconnect
        </button>
      </div>
    </div>
  );
}

export default App;
