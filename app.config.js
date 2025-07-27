import 'dotenv/config';

export default {
  expo: {
    name: 'Chado',
    slug: 'chado',
    version: '1.0.0',
    orientation: 'landscape',
    extra: {
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
      YOUTUBE_API_BASE_URL: 'https://www.googleapis.com/youtube/v3',
    },
    // ...other config fields as needed
  },
}; 