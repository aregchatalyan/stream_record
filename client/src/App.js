import { useEffect, useRef, useState } from 'react';

import { socket, peer } from './func/main';

const sendAction = (action) => socket.send(JSON.stringify({ action, sessionId: peer.sessionId }));

const buttonState = (buttonRef, state) => buttonRef.current.disabled = state;

const App = () => {
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const combineBtnRef = useRef(null);

  useEffect(() => {
    buttonState(startBtnRef, true);
    buttonState(stopBtnRef, true);
    buttonState(combineBtnRef, true);
  }, []);

  const startRecord = () => {
    sendAction('start-record');
    buttonState(startBtnRef, true);
    buttonState(stopBtnRef, false);
  }

  const stopRecord = () => {
    sendAction('stop-record');
    buttonState(startBtnRef, false);
    buttonState(stopBtnRef, true);
  }

  const combineRecords = () => {
    sendAction('start-combine');
    buttonState(startBtnRef, true);
  }

  return (
    <div id="app">
      <video id="localVideo" autoPlay muted playsInline/>

      <div id="control">
        <button id="startRecordButton" ref={startBtnRef} onClick={startRecord}>
          Start Record
        </button>

        <button id="stopRecordButton" ref={stopBtnRef} onClick={stopRecord}>
          Stop Record
        </button>

        <button id="combineRecordsButton" ref={combineBtnRef} onClick={combineRecords}>
          Combine Records
        </button>
      </div>
    </div>
  );
}

export default App;
