export const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY_HERE';
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Debug logging
console.log('Config Debug:', {
  envVar: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ? 'SET' : 'NOT_SET',
  finalKey: YOUTUBE_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
  isConfigured: YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE'
});

export const GENRES = [
  'Pop',
  'Rock',
  'OPM',
  'K-pop',
  'R&B',
  'Hip-hop',
  'Country',
  'Jazz',
  'Classical',
  'EDM',
];

export const TRENDING_KARAOKE_QUERY = 'karaoke instrumental'; 