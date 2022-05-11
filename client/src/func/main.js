import { io } from 'socket.io-client';
import * as mediasoup from 'mediasoup-client';

import GUM from './gum';
import Peer from './peer';
import SocketQueue from './queue';

let peer;
const queue = new SocketQueue();

const socket = io(`https://${window.location.hostname}:3030`, {
  transports: [ 'websocket', 'polling' ],
  autoConnect: true,
  secure: true,
});

socket.on('connect_error', () => {
  socket.io.opts.transports = [ 'polling', 'websocket' ];
  socket.io.opts.upgrade = true;
});

const handleSocketMessage = async (message) => {
  try {
    const jsonMessage = JSON.parse(message);
    await handleJsonMessage(jsonMessage);
  } catch (error) {
    console.error('handleSocketMessage() failed [error:%o]', error);
  }
};

const handleJsonMessage = async (jsonMessage) => {
  switch (jsonMessage.action) {
    case 'router-rtp-capabilities':
      await handleRouterRtpCapabilitiesRequest(jsonMessage);
      break;
    case 'create-transport':
      await handleCreateTransportRequest(jsonMessage);
      break;
    case 'connect-transport':
      await handleConnectTransportRequest(jsonMessage);
      break;
    case 'produce':
      await handleProduceRequest(jsonMessage);
      break;
    default:
      console.log('handleJsonMessage() unknown action %s', jsonMessage.action);
  }
};

const handleRouterRtpCapabilitiesRequest = async (jsonMessage) => {
  const { routerRtpCapabilities, sessionId } = jsonMessage;
  console.log('handleRouterRtpCapabilities() [rtpCapabilities:%o]', routerRtpCapabilities);
  try {
    const device = new mediasoup.Device();
    // Load the mediasoup device with the router rtp capabilities gotten from the server
    await device.load({ routerRtpCapabilities });

    peer = new Peer(sessionId, device);
    createTransport();
  } catch (error) {
    console.error('handleRouterRtpCapabilities() failed to init device [error:%o]', error);
    socket.disconnect();
  }
};

const createTransport = () => {
  console.log('createTransport()');

  if (!peer || !peer.device.loaded) {
    throw new Error('Peer or device is not initialized');
  }

  // First we must create the mediasoup transport on the server side
  socket.emit('message', JSON.stringify({
    action: 'create-transport',
    sessionId: peer.sessionId
  }));
};

// Mediasoup Transport on the server side has been created
const handleCreateTransportRequest = async (jsonMessage) => {
  console.log('handleCreateTransportRequest() [data:%o]', jsonMessage);
  try {
    // Create the local mediasoup send transport
    peer.sendTransport = await peer.device.createSendTransport(jsonMessage);
    console.log('handleCreateTransportRequest() send transport created [id:%s]', peer.sendTransport.id);

    // Set the transport listeners and get the users media stream
    handleSendTransportListeners();
    await getMediaStream();
  } catch (error) {
    console.error('handleCreateTransportRequest() failed to create transport [error:%o]', error);
    socket.disconnect();
  }
};

const handleSendTransportListeners = () => {
  peer.sendTransport.on('connect', handleTransportConnectEvent);
  peer.sendTransport.on('produce', handleTransportProduceEvent);
  peer.sendTransport.on('connectionstatechange', connectionState => {
    console.log('send transport connection state change [state:%s]', connectionState);
  });
};

const getMediaStream = async () => {
  const mediaStream = await GUM();
  const videoNode = document.getElementById('localVideo');
  videoNode.srcObject = mediaStream;

  // Get the video and audio tracks from the media stream
  const videoTrack = mediaStream.getVideoTracks()[0];
  const audioTrack = mediaStream.getAudioTracks()[0];

  // If there is a video track start sending it to the server
  if (videoTrack) {
    const videoProducer = await peer.sendTransport.produce({ track: videoTrack });
    peer.producers.push(videoProducer);
  }

  // if there is an audio track start sending it to the server
  if (audioTrack) {
    const audioProducer = await peer.sendTransport.produce({ track: audioTrack });
    peer.producers.push(audioProducer);
  }

  // Enable the start record button
  document.getElementById('startRecordButton').disabled = false;
};

const handleConnectTransportRequest = async (jsonMessage) => {
  console.log('handleTransportConnectRequest()');
  try {
    const action = queue.get('connect-transport');

    if (!action) {
      throw new Error('transport-connect action was not found');
    }

    await action(jsonMessage);
  } catch (error) {
    console.error('handleTransportConnectRequest() failed [error:%o]', error);
  }
};

const handleProduceRequest = async (jsonMessage) => {
  console.log('handleProduceRequest()');
  try {
    const action = queue.get('produce');

    if (!action) {
      throw new Error('produce action was not found');
    }

    await action(jsonMessage);
  } catch (error) {
    console.error('handleProduceRequest() failed [error:%o]', error);
  }
};

const handleTransportConnectEvent = ({ dtlsParameters }, callback, errback) => {
  console.log('handleTransportConnectEvent()');
  try {
    const action = () => {
      console.log('connect-transport action');
      callback();
      queue.remove('connect-transport');
    };

    queue.push('connect-transport', action);

    socket.emit('message', JSON.stringify({
      action: 'connect-transport',
      sessionId: peer.sessionId,
      transportId: peer.sendTransport.id,
      dtlsParameters
    }));
  } catch (error) {
    console.error('handleTransportConnectEvent() failed [error:%o]', error);
    errback(error);
  }
};

const handleTransportProduceEvent = ({ kind, rtpParameters }, callback, errback) => {
  console.log('handleTransportProduceEvent()');
  try {
    const action = jsonMessage => {
      console.log('handleTransportProduceEvent callback [data:%o]', jsonMessage);
      callback({ id: jsonMessage.id });
      queue.remove('produce');
    };

    queue.push('produce', action);

    socket.emit('message', JSON.stringify({
      action: 'produce',
      sessionId: peer.sessionId,
      transportId: peer.sendTransport.id,
      kind,
      rtpParameters
    }));
  } catch (error) {
    console.error('handleTransportProduceEvent() failed [error:%o]', error);
    errback(error);
  }
};

socket.on('message', handleSocketMessage);

socket.on('connect', () => console.log('Socket Connect'));

socket.on('error', (error) => console.error('Socket Error [error:%o]', error));

socket.on('disconnect', () => {
  console.log('handleSocketClose()');
  document.getElementById('startRecordButton').disabled = true;
  document.getElementById('stopRecordButton').disabled = true;
  document.getElementById('combineRecordsButton').disabled = true;
});

export { socket, peer }