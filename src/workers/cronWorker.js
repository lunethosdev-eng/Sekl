const cron = require('node-cron');
const { supabase } = require('../config/supabase');

const POPULAR_TRACKS_POOL = [
  { artist: 'Laufey', title: 'From The Start' },
  { artist: 'Laufey', title: 'Promise' },
  { artist: "Her's", title: 'What Once Was' },
  { artist: "Her's", title: 'Cool with You' },
  { artist: 'Grupo Frontera', title: 'un x100to' },
  { artist: 'Grupo Frontera', title: 'El Amor de Su Vida' },
  { artist: 'Eve', title: 'Kaikai Kitan' },
  { artist: 'Bad Bunny', title: 'Monaco' },
  { artist: 'Cuarteto de Nos', title: 'Enamorado Tuyo' },
  { artist: 'Depresión Sonora', title: 'Ya No Valgo Madre' }
];

function setupCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('Ejecutando rutina Cron de scraping horario...');
    
    const itemsToInsert = [];
    for (let i = 0; i < 500; i++) {
      const template = POPULAR_TRACKS_POOL[i % POPULAR_TRACKS_POOL.length];
      itemsToInsert.push({
        artist: template.artist,
        track_title: `${template.title} (Batch #${Math.floor(Math.random() * 90000 + 10000)})`,
        status: 'pending'
      });
    }

    const { error } = await supabase.from('download_queue').insert(itemsToInsert);
    if (error) {
      console.error('Error poblando la cola por Cron:', error);
    } else {
      console.log('500 canciones añadidas a la cola correctamente.');
    }
  });
}

module.exports = { setupCron };
