const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const { PORT } = require('./config');
const { supabase } = require('./config/supabase');
const { startWorker } = require('./workers/queueWorkers'); // <-- RUTA CORREGIDA
const { setupCron } = require('./workers/cronWorker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Endpoints REST API
app.get('/api/tracks', async (req, res) => {
  const { data, error } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/queue', async (req, res) => {
  const { data, error } = await supabase.from('download_queue').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/stats', async (req, res) => {
  const { count: totalTracks } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
  const { count: pendingQueue } = await supabase.from('download_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: completedQueue } = await supabase.from('download_queue').select('*', { count: 'exact', head: true }).eq('status', 'completed');

  res.json({
    totalTracks: totalTracks || 0,
    pendingQueue: pendingQueue || 0,
    completedQueue: completedQueue || 0
  });
});

app.post('/api/queue/add', async (req, res) => {
  const { artist, title } = req.body;
  if (!artist || !title) return res.status(400).json({ error: 'Faltan parámetros artist y title' });

  const { data, error } = await supabase.from('download_queue').insert([{ artist, track_title: title, status: 'pending' }]).select();
  if (error) return res.status(500).json({ error: error.message });

  io.emit('queue_new', data[0]);
  res.json(data[0]);
});

server.listen(PORT, () => {
  console.log(`Servidor de Music Engine activo en el puerto ${PORT}`);
  startWorker(io);
  setupCron();
});
