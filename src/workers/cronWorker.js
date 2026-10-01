const cron = require('node-cron');
const { TARGET_ARTISTS } = require('../config');
const { supabase } = require('../config/supabase');
const { fetchFullDiscography } = require('../scrapers/discography');

async function syncArtistDiscographies() {
  console.log('Iniciando sincronización de discografías completas...');

  for (const artist of TARGET_ARTISTS) {
    console.log(`Obteniendo canciones de: ${artist}`);
    const songs = await fetchFullDiscography(artist);

    if (songs.length === 0) continue;

    // Obtener canciones registradas para evitar duplicados
    const { data: existingQueue } = await supabase
      .from('download_queue')
      .select('track_title')
      .eq('artist', artist);

    const { data: existingTracks } = await supabase
      .from('tracks')
      .select('title')
      .eq('artist', artist);

    const registeredTitles = new Set([
      ...(existingQueue || []).map(q => q.track_title.toLowerCase()),
      ...(existingTracks || []).map(t => t.title.toLowerCase())
    ]);

    const newItems = songs
      .filter(song => !registeredTitles.has(song.title.toLowerCase()))
      .map(song => ({
        artist: song.artist,
        track_title: song.title,
        status: 'pending'
      }));

    if (newItems.length > 0) {
      const { error } = await supabase.from('download_queue').insert(newItems);
      if (error) {
        console.error(`Error insertando canciones de ${artist}:`, error.message);
      } else {
        console.log(`Se añadieron ${newItems.length} canciones nuevas a la cola para ${artist}.`);
      }
    } else {
      console.log(`Todas las canciones de ${artist} ya están en la cola o descargadas.`);
    }
  }
}

function setupCron() {
  // Ejecutar al arrancar el servidor
  syncArtistDiscographies();

  // Re-escaneo automático cada 6 horas
  cron.schedule('0 */6 * * *', () => {
    syncArtistDiscographies();
  });
}

module.exports = { setupCron, syncArtistDiscographies };
