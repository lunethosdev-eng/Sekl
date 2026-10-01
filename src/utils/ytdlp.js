const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Descarga el audio de YouTube usando yt-dlp.
 * @param {string} searchQuery - Término de búsqueda o URL de YouTube.
 * @param {string} outputDir - Directorio donde se guardará el archivo MP3.
 */
function downloadAudio(searchQuery, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: recursive });
    }

    // Si no es URL directa, usamos la sintaxis de búsqueda ytsearch1
    const target = searchQuery.startsWith('http') ? searchQuery : `ytsearch1:${searchQuery}`;
    const outputPattern = path.join(outputDir, '%(id)s.%(ext)s');

    const args = [
      target,
      '-x',                             // Extraer audio
      '--audio-format', 'mp3',          // Convertir a MP3 usando ffmpeg
      '--audio-quality', '0',           // Máxima calidad
      '-o', outputPattern,              // Formato de salida
      '--no-playlist',                  // Evitar descargar listas completas
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=android,web' // Burlar bloqueos de IP en Render
    ];

    const child = spawn('yt-dlp', args);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, logs: stdoutData });
      } else {
        console.error('--- Detalle de error de yt-dlp ---');
        console.error(stderrData);
        reject(new Error(`yt-dlp finalizó con código de estado ${code}: ${stderrData.slice(0, 300)}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { downloadAudio };
