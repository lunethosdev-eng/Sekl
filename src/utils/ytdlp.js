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

    // Ruta de cookies (usa el cookies.txt que ya tienes en la raíz)
    const cookiesPath = path.join(__dirname, '../../cookies.txt');

    // Varias combinaciones de clientes (prueba en orden hasta que una funcione)
    const playerClients = [
      'tv_downgraded,mweb,web_embedded',
      'android_vr,tv_downgraded,mweb',
      'web_embedded,mweb,tv_simply',
      'mweb,web_safari,android_vr',
      'tv_downgraded,web_embedded'
    ];

    let attempt = 0;

    function tryDownload() {
      if (attempt >= playerClients.length) {
        return reject(new Error('Todos los player_client fallaron'));
      }

      const client = playerClients[attempt];
      attempt++;

      const args = [
        target,
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', outputPath,
        '--no-playlist',
        '--no-warnings',
        '--force-ipv4',
        '--extractor-args', `youtube:player_client=${client}`,
      ];

      // Siempre intentamos usar las cookies si existen
      if (fs.existsSync(cookiesPath)) {
        args.push('--cookies', cookiesPath);
        console.log(`Usando cookies: ${cookiesPath}`);
      } else {
        console.log('⚠️ No se encontró cookies.txt');
      }

      console.log(`Intento \( {attempt}/ \){playerClients.length} → player_client=${client}`);

      const child = spawn('yt-dlp', args);
      let stderrData = '';

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const finalPath = path.join(outputDir, `${fileId}.mp3`);
          if (fs.existsSync(finalPath)) {
            console.log('✅ Descarga exitosa con', client);
            return resolve(finalPath);
          } else {
            console.log('Archivo no encontrado, probando siguiente cliente...');
            setTimeout(tryDownload, 2000);
          }
        } else {
          console.log(`Falló con ${client}`);
          console.log(stderrData.slice(0, 300));
          setTimeout(tryDownload, 2000);
        }
      });

      child.on('error', (err) => {
        console.error('Error spawn:', err.message);
        setTimeout(tryDownload, 2000);
      });
    }

    tryDownload();
  });
}

module.exports = { downloadMp3 };
