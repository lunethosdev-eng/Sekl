const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function downloadMp3(searchQuery, fileId) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join('/tmp', 'downloads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${fileId}.%(ext)s`);
    const target = searchQuery.startsWith('http') 
      ? searchQuery 
      : `ytsearch1:${searchQuery}`;

    // Ruta de cookies (primero busca en el proyecto, luego en /tmp)
    const cookiesPath = fs.existsSync(path.join(__dirname, '../../cookies.txt'))
      ? path.join(__dirname, '../../cookies.txt')
      : '/tmp/cookies.txt';

    const args = [
      target,
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputPath,
      '--no-playlist',
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=tv_downgraded,mweb,web_embedded,android_vr',
      // Si existen cookies, las usamos
      ...(fs.existsSync(cookiesPath) ? ['--cookies', cookiesPath] : []),
    ];

    console.log('Ejecutando yt-dlp con:', args.join(' '));

    const child = spawn('yt-dlp', args);

    let stderrData = '';
    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        const finalPath = path.join(outputDir, `${fileId}.mp3`);
        if (fs.existsSync(finalPath)) {
          resolve(finalPath);
        } else {
          reject(new Error('Archivo MP3 no encontrado después de la descarga'));
        }
      } else {
        console.error('--- Error yt-dlp ---');
        console.error(stderrData);
        reject(new Error(`yt-dlp falló: ${stderrData.slice(0, 500)}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { downloadMp3 };
