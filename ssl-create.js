const os = require('os');
const fs = require('fs');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

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

const paths = [
  {
    key_file: `${__dirname}/ssl/key.pem`,
    cert_file: `${__dirname}/ssl/cert.pem`
  },
  {
    key_file: `${__dirname}/client/src/ssl/key.pem`,
    cert_file: `${__dirname}/client/src/ssl/cert.pem`
  }
];

(async () => {
  for (const { key_file, cert_file } of paths) {
    try {
      fs.stat(key_file, async (e) => {
        if (!e) await fs.promises.unlink(key_file);
      });

      fs.stat(cert_file, async (e) => {
        if (!e) await fs.promises.unlink(cert_file);
      });

      await exec(`mkcert -key-file ${key_file} -cert-file ${cert_file} 0.0.0.0 localhost ${getLocalIp()}`);
      console.log('SSL certs created');
    } catch (e) {
      console.error(e);
    }
  }
})();
