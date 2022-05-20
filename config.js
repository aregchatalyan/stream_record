const os = require('os');
const faces = os.networkInterfaces();

const getLocalIp = () => {
  let localIp = '127.0.0.1';

  for (const { family, internal, address } of Object.values(faces).flat(1)) {
    if (family === 'IPv4' && !internal) {
      return localIp = address;
    }
  }

  return localIp;
};

module.exports = Object.freeze({
  numWorkers: os.cpus(),
  worker: {
    logLevel: 'debug',
    logTags: [
      'rtp',
      'srtp',
      'rtcp',
    ],
    rtcMinPort: 40000,
    rtcMaxPort: 49999
  },
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000
        }
      },
    ]
  },
  webRtcTransport: {
    listenIps: [ {
      ip: '0.0.0.0', announcedIp: process.env.NODE_ENV === 'production'
        ? '52.29.86.126'
        : getLocalIp()
    } ], // TODO: Change announcedIp to your external IP or domain name
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    maxIncomingBitrate: 1500000
  },
  plainRtpTransport: {
    listenIp: {
      ip: '0.0.0.0', announcedIp: process.env.NODE_ENV === 'production'
        ? '52.29.86.126'
        : getLocalIp()
    }, // TODO: Change announcedIp to your external IP or domain name
    rtcpMux: true,
    comedia: false
  },
  combiner: {
    '2': '0_0|w0_0',
    '3': '0_0|w0_0|w0+w1_0',
    '4': '0_0|w0_0|0_h0|w0_h0',
    '5': '0_0|w0_0|w0+w1_0|0_h0|w0_h0',
    '6': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0',
    '7': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1',
    '8': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1',
    '9': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1',
    '10': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1|0_h0+h1+h2',
    '11': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1|0_h0+h1+h2|w0_h0+h1+h2',
    '12': '0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1|0_h0+h1+h2|w0_h0+h1+h2|w0+w1_h0+h1+h2',
  }
});
