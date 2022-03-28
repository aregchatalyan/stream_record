const DEFAULT_CONSTRAINTS = Object.freeze({
  audio: true, 
  video: { width: 640, height: 480 }
});

// Gets the users camera and returns the media stream
const GUM = async () => {
  return await navigator.mediaDevices.getUserMedia(DEFAULT_CONSTRAINTS);
};

export default GUM;