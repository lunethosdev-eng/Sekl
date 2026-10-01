const axios = require('axios');
const cheerio = require('cheerio');

async function getAppleMusicMetadata(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://music.apple.com/us/search?term=${query}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    const staticCover = $('meta[property="og:image"]').attr('content') || null;
    const videoSrc = $('video source[type="video/mp4"]').attr('src') \vert{}\vert{} $('meta[property="og:video"]').attr('content') || null;
    const album = $('meta[property="music:album"]').attr('content') || 'Single';

    return {
      staticCover,
      animatedCover: videoSrc,
      album
    };
  } catch (error) {
    console.error('Error obteniendo metadatos de Apple Music:', error.message);
    return null;
  }
}

module.exports = { getAppleMusicMetadata };
