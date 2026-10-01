const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { COOKIES_PATH } = require('../config');

function downloadMp3(searchQuery, outputFilename) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${outputFilename}.mp3`);
    const binDir = path.join(__dirname, '../../bin');
    const binPath = path.join(binDir, 'yt-dlp');

    const executable = fs.existsSync(binPath) ? binPath : 'yt-dlp';

    const args = [
      `ytsearch1:${searchQuery}`,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--output', outputPath,
      '--no-playlist',
      '--cookies', COOKIES_PATH
    ];

    if (fs.existsSync(path.join(binDir, 'ffmpeg'))) {
      args.push('--ffmpeg-location', binDir);
    }

    const child = spawn(executable, args);

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error(`yt-dlp finalizó con código de estado ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { downloadMp3 };
