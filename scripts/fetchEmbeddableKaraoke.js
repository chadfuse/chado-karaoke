const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY in .env');
  process.exit(1);
}

// Example list of songs (replace or expand as needed)
const songs = [
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', genre: 'Pop' },
  { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock' },
  { title: 'Buwan', artist: 'Juan Karlos', genre: 'OPM' },
  { title: 'Dynamite', artist: 'BTS', genre: 'K-pop' },
  { title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop' },
];

async function fetchKaraokeVideo(song) {
  const query = encodeURIComponent(`${song.title} ${song.artist} karaoke`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoEmbeddable=true&maxResults=1&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await axios.get(url);
    const item = res.data.items[0];
    if (!item) return null;
    return {
      id: item.id.videoId,
      title: `${song.title} (Karaoke Version)`,
      artist: song.artist,
      genre: song.genre,
      youtubeId: item.id.videoId,
      thumbnail: `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
    };
  } catch (e) {
    return null;
  }
}

(async () => {
  const results = [];
  for (const song of songs) {
    const karaoke = await fetchKaraokeVideo(song);
    if (karaoke) {
      results.push(karaoke);
      console.log(`Found: ${karaoke.title} - https://www.youtube.com/watch?v=${karaoke.youtubeId}`);
    } else {
      console.log(`No embeddable karaoke found for: ${song.title} by ${song.artist}`);
    }
  }
  // Output as mockSongs array
  const output = `// Auto-generated embeddable karaoke mock data\nexport const mockSongs = ${JSON.stringify(results, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../constants/mockSongs.ts'), output);
  console.log('Done! Check constants/mockSongs.ts for results.');
})(); 