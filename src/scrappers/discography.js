const axios = require('axios');

async function fetchFullDiscography(artistName) {
  try {
    const query = encodeURIComponent(artistName);
    // Solicitamos el límite máximo permitido por la API pública (200 canciones por artista)
    const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=200`;
    const response = await axios.get(url);

    if (!response.data || !response.data.results) {
      return [];
    }

    const trackMap = new Map();

    for (const item of response.data.results) {
      const title = item.trackName;
      if (!title) continue;

      const cleanKey = `${artistName.toLowerCase()}_${title.toLowerCase()}`;
      if (!trackMap.has(cleanKey)) {
        trackMap.set(cleanKey, {
          artist: item.artistName || artistName,
          title: title,
          album: item.collectionName || 'Single'
        });
      }
    }

    return Array.from(trackMap.values());
  } catch (error) {
    console.error(`Error buscando discografía de ${artistName}:`, error.message);
    return [];
  }
}

module.exports = { fetchFullDiscography };
