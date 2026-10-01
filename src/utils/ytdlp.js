const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function downloadMp3(searchQuery, fileId) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join('/tmp', 'downloads'); // o './temp'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${fileId}.%(ext)s`);
    const target = searchQuery.startsWith('http') ? searchQuery : `ytsearch1:${searchQuery}`;

    const args = [
      target,
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputPath,
      '--no-playlist',
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=android,web'
    ];

    const child = spawn('yt-dlp', args);

    let stderrData = '';
    child.stderr.on('data', (data) => { stderrData += data.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        const finalPath = path.join(outputDir, `${fileId}.mp3`);
        if (fs.existsSync(finalPath)) {
          resolve(finalPath);           // ← ahora sí devuelve la ruta
        } else {
          reject(new Error('Archivo MP3 no encontrado después de la descarga'));
        }
      } else {
        reject(new Error(`yt-dlp falló: ${stderrData.slice(0, 400)}`));
      }
    });

    child.on('error', reject);
  });
}

module.exports = { downloadMp3 };
