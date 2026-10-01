// src/scrapers/appleMusic.js
const axios = require('axios');
const cheerio = require('cheerio');

async function getAppleMusicMetadata(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const response = await axios.get(searchUrl);

    if (!response.data.results || response.data.results.length === 0) {
      return null;
    }

    const track = response.data.results[0];
    const staticCover = track.artworkUrl100.replace('100x100bb', '1000x1000bb');
    let animatedCover = null;

    // Extracción de Animated Covers desde la vista Web de Apple Music
    try {
      const pageUrl = track.trackViewUrl;
      const pageRes = await axios.get(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const $ = cheerio.load(pageRes.data);
      const videoSrc = $('video source[type="video/mp4"]').attr('src') \vert{}\vert{} $('meta[property="og:video"]').attr('content');
      if (videoSrc) {
        animatedCover = videoSrc;
      }
    } catch (e) {
      // Si falla la extracción animada, se preserva el cover estático de alta resolución
    }

    return {
      album: track.collectionName,
      staticCover,
      animatedCover,
      releaseDate: track.releaseDate
    };
  } catch (error) {
    console.error('Error fetching Apple Music metadata:', error.message);
    return null;
  }
}

module.exports = { getAppleMusicMetadata };
