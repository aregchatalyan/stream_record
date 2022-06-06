# Simple video/audio Record Using mediasoup v3 and FFmpeg

---

## How to use

### Install FFmpeg

```bash
# For Ubuntu
sudo apt install ffmpeg
```

### Create SSL certs for development

```bash
npm run ssl
```

### Install Server Modules

```bash
npm run server:install
```

### Install App Modules

```bash
npm run client:install
```

### Configure the server

Change the announced IP in src/config.js to your local ip (config -> webRtcTransport -> listenIps)

### Start the server

```bash
npm run server:start:dev
```

### Start the application

```bash
# For deploy
npm start 

# For dev
npm run start:both:dev
```

### Access the sample page
https://localhost:5050


By default, recorded videos will be available in `/files` directory.

---

## Server ENV Options

| Argument | Type | Explanation |
| -------- | :--: | :---------: |

RECORD_FILE_LOCATION_PATH | string | Path to store the recorded files (user running node MUST have read/write permission)

SERVER_PORT | number | Server port number (default is 3000). Note if you change this you will also need to edit the WebSocket connection url.


