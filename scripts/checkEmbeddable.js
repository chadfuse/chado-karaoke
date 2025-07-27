const fs = require('fs');
const https = require('https');
const path = require('path');

// Load mockSongs from constants/mockSongs.ts
const mockSongsPath = path.join(__dirname, '../constants/mockSongs.ts');
const fileContent = fs.readFileSync(mockSongsPath, 'utf8');

// Extract YouTube IDs from the mockSongs array
const youtubeIdRegex = /youtubeId:\s*['"]([\w-]{11})['"]/g;
const ids = [];
let match;
while ((match = youtubeIdRegex.exec(fileContent)) !== null) {
  ids.push(match[1]);
}

function checkEmbeddable(videoId) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      host: 'www.youtube.com',
      path: `/embed/${videoId}`,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        // If the page contains 'Video unavailable', it's not embeddable
        if (data.includes('Video unavailable') || data.includes('Playback on other websites has been disabled')) {
          resolve({ videoId, embeddable: false });
        } else {
          resolve({ videoId, embeddable: true });
        }
      });
    });
    req.on('error', () => resolve({ videoId, embeddable: false }));
    req.end();
  });
}

(async () => {
  console.log('Checking embeddability of YouTube videos in mockSongs...');
  const results = await Promise.all(ids.map(checkEmbeddable));
  const notEmbeddable = results.filter((r) => !r.embeddable);
  if (notEmbeddable.length === 0) {
    console.log('All videos are embeddable!');
  } else {
    console.log('The following videos are NOT embeddable:');
    notEmbeddable.forEach((r) => console.log(`https://www.youtube.com/watch?v=${r.videoId}`));
  }
})(); 