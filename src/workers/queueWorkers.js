const fs = require('fs');
const axios = require('axios');
const { supabase } = require('../config/supabase');
const { downloadMp3 } = require('../utils/ytdlp');
const { getAppleMusicMetadata } = require('../scrapers/appleMusic');

async function uploadToSupabaseBucket(bucket, fileName, fileBuffer, mimeType) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async function processQueueItem(io) {
  const { data: queueItems, error } = await supabase
    .from('download_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(1);

  if (error || !queueItems || queueItems.length === 0) return;

  const item = queueItems[0];
  const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    await supabase.from('download_queue').update({ status: 'processing', progress: 10 }).eq('id', item.id);
    io.emit('queue_update', { id: item.id, status: 'processing', progress: 10, title: item.track_title });

    // 1. Descarga MP3 mediante yt-dlp
    const searchQuery = `${item.artist} - ${item.track_title}`;
    const localMp3Path = await downloadMp3(searchQuery, fileId);

    await supabase.from('download_queue').update({ progress: 50 }).eq('id', item.id);
    io.emit('queue_update', { id: item.id, status: 'processing', progress: 50 });

    // 2. Metadatos y portadas desde Apple Music
    const appleMeta = await getAppleMusicMetadata(item.artist, item.track_title);

    let coverUrl = null;
    let animatedCoverUrl = null;

    if (appleMeta && appleMeta.staticCover) {
      const imgBuffer = (await axios.get(appleMeta.staticCover, { responseType: 'arraybuffer' })).data;
      coverUrl = await uploadToSupabaseBucket('covers', `${fileId}.jpg`, imgBuffer, 'image/jpeg');
    }

    if (appleMeta && appleMeta.animatedCover) {
      try {
        const videoBuffer = (await axios.get(appleMeta.animatedCover, { responseType: 'arraybuffer' })).data;
        animatedCoverUrl = await uploadToSupabaseBucket('animated-covers', `${fileId}.mp4`, videoBuffer, 'video/mp4');
      } catch (e) {
        console.warn('Falló la descarga del cover animado, usando cover estático.');
      }
    }

    // 3. Subir MP3 a Supabase Storage
    const mp3Buffer = fs.readFileSync(localMp3Path);
    const mp3Url = await uploadToSupabaseBucket('songs', `${fileId}.mp3`, mp3Buffer, 'audio/mpeg');
    fs.unlinkSync(localMp3Path); // Limpieza de archivo temporal local

    // 4. Registro final en la base de datos
    await supabase.from('tracks').insert({
      title: item.track_title,
      artist: item.artist,
      album: appleMeta?.album || 'Single',
      mp3_url: mp3Url,
      cover_url: coverUrl,
      animated_cover_url: animatedCoverUrl,
      lyrics_lrc: `[00:00.00] ${item.track_title} - ${item.artist}\n[00:05.00] Instrumental / Sync Lyrics`
    });

    await supabase.from('download_queue').update({ status: 'completed', progress: 100 }).eq('id', item.id);
    io.emit('queue_update', { id: item.id, status: 'completed', progress: 100 });
  } catch (err) {
    console.error('Error procesando elemento de la cola:', err);
    await supabase.from('download_queue').update({ status: 'failed', error_message: err.message }).eq('id', item.id);
    io.emit('queue_update', { id: item.id, status: 'failed', error: err.message });
  }
}

function startWorker(io) {
  setInterval(() => {
    processQueueItem(io);
  }, 5000);
}

module.exports = { startWorker };
