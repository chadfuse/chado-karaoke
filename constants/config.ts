import Constants from 'expo-constants';

export const YOUTUBE_API_KEY = Constants.expoConfig?.extra?.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY_HERE';
export const YOUTUBE_API_BASE_URL = Constants.expoConfig?.extra?.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';

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