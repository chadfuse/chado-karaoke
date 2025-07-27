# YouTube API Setup Instructions

To enable real-time karaoke song search using the YouTube API, follow these steps:

## 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

## 2. Configure the API Key

### Option A: Environment Variable (Recommended)
Create a `.env` file in your project root:
```bash
EXPO_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
```

### Option B: Direct Configuration
Edit `constants/config.ts` and replace `YOUR_YOUTUBE_API_KEY_HERE` with your actual API key.

## 3. Restart Your Development Server

After adding the API key, restart your Expo development server:
```bash
npx expo start
```

## 4. Test the Integration

- Open your app and try searching for songs
- The app will automatically use YouTube API if configured, otherwise fall back to mock data
- Check the console logs to see if the API is working

## Features Enabled

With YouTube API integration, you get:
- ✅ Real-time search for karaoke songs
- ✅ Trending karaoke songs on app load
- ✅ Higher quality thumbnails
- ✅ More song variety
- ✅ Automatic fallback to mock data if API fails

## API Limits

- Free tier: 10,000 units per day
- Each search request costs ~100 units
- Monitor usage in Google Cloud Console

## Troubleshooting

If search isn't working:
1. Check console logs for error messages
2. Verify API key is correct in config
3. Ensure YouTube Data API v3 is enabled
4. Check if you've exceeded daily quota
