import { useEffect, useRef, useState } from 'react';

import { socket, peer } from './func/main';

const App = () => {
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);

  const [ rec, setRec ] = useState(false);
  const [ disconnected, setDisconnected ] = useState(socket.connected);

  useEffect(() => {
    startBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = true;
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
    socket.send(JSON.stringify({
      action: 'start-record',
      sessionId: peer.sessionId,
    }));

    startBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = false;

    setRec(true);
  }

  const stopRecord = () => {
    socket.send(JSON.stringify({
      action: 'stop-record',
      sessionId: peer.sessionId
    }));

    startBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = true;

    setRec(false);
  }

  const combineRecords = () => {
    socket.send(JSON.stringify({
      action: 'start-combine',
      sessionId: peer.sessionId
    }));
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
