const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const dir = await fs.promises.readdir('files/completed');
  const filteredByFileType = dir.filter(file => [ '.mkv', '.mp4', '.webm' ]
    .includes(path.extname(file).toLowerCase()));

  if (!filteredByFileType.length) return res.send('Failed to streaming, files not found');

  const filePath = `files/completed/${filteredByFileType[filteredByFileType.length - 1]}`;
  const fileExt = path.extname(filteredByFileType[filteredByFileType.length - 1]).replace('.', '');

  const stat = await fs.promises.stat(filePath);
  const fileSize = stat.size;

  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');

    const start = parseInt(parts[0], 10);

    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunkSize = (end - start) + 1;

    const file = fs.createReadStream(filePath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': `video/${fileExt}`,
    }

    res.writeHead(206, head);

    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': `video/${fileExt}`,
    }

    res.writeHead(200, head);

    fs.createReadStream(filePath).pipe(res);
  }
}
