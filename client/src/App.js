import { useEffect, useRef } from "react";

import { socket, peer } from "./func";

const App = () => {
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);

  useEffect(() => {
    stopBtnRef.current.disabled = true;
  }, []);

  const startRecord = () => {
    console.log('startRecord()');

    socket.send(JSON.stringify({
      action: 'start-record',
      sessionId: peer.sessionId,
    }));

    startBtnRef.current.disabled = true;
    stopBtnRef.current.disabled = false;
  };

  const stopRecord = () => {
    console.log('stopRecord()');

    socket.send(JSON.stringify({
      action: 'stop-record',
      sessionId: peer.sessionId
    }));

    startBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = true;
  };

  return (
    <div>
      <video id="localVideo" autoPlay muted playsInline height="280"/>

      <br/>

      <button id="startRecordButton" ref={startBtnRef} onClick={startRecord}>Start Record</button>
      <button id="stopRecordButton" ref={stopBtnRef} onClick={stopRecord}>Stop Record</button>
    </div>
  );
}

export default App;
