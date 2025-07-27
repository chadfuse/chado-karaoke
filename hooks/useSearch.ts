import { mockSongs } from '@/constants/mockSongs';
import { YouTubeService, YouTubeSong } from '@/services/youtubeService';
import { useEffect, useRef, useState } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingData, setTrendingData] = useState<YouTubeSong[]>([]);
  const [apiUsage, setApiUsage] = useState(YouTubeService.getApiUsage());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load trending karaoke songs on mount
  useEffect(() => {
    loadTrendingKaraoke();
    // Clear expired cache on app start
    YouTubeService.clearCache();
  }, []);

  const loadTrendingKaraoke = async () => {
    try {
      setLoading(true);
      const trending = await YouTubeService.getTrendingKaraoke(30);
      
      if (trending.length > 0) {
        setTrendingData(trending);
        console.log('✅ Loaded trending karaoke songs:', trending.length);
      } else {
        // Fallback to mock data if YouTube API fails
        console.log('📦 Using mock data as fallback for trending');
        setTrendingData(mockSongs);
      }
      
      // Update API usage stats
      setApiUsage(YouTubeService.getApiUsage());
    } catch (error) {
      console.error('Failed to load trending karaoke:', error);
      setTrendingData(mockSongs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    // Don't search for very short queries to save API calls
    if (query.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    console.log('🔍 Search query changed:', query);
    setLoading(true);

    // Debounced search with longer delay to prevent excessive API calls
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🎵 Starting YouTube search for:', query);
        const youtubeResults = await YouTubeService.searchKaraokeSongs(query, 15); // Reduced from 20 to save quota
        
        if (youtubeResults.length > 0) {
          setResults(youtubeResults);
          console.log('✅ YouTube API search results:', youtubeResults.length, 'songs found for query:', query);
        } else {
          // Fallback to mock data search
          console.log('📦 YouTube API returned no results, falling back to mock data');
          const filteredMockSongs = mockSongs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.genre.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filteredMockSongs);
          console.log('📦 Mock data search results:', filteredMockSongs.length, 'songs found for query:', query);
        }
        
        // Update API usage stats after search
        setApiUsage(YouTubeService.getApiUsage());
      } catch (error) {
        console.error('YouTube search failed, using mock data:', error);
        
        // Fallback to mock data search
        const filteredMockSongs = mockSongs.filter(song => 
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase()) ||
          song.genre.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredMockSongs);
      } finally {
        setLoading(false);
      }
    }, 800); // Increased debounce delay from 500ms to 800ms

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    data: query ? results : trendingData.length > 0 ? trendingData : mockSongs,
    refreshTrending: loadTrendingKaraoke,
    apiUsage,
    clearCache: YouTubeService.clearAllCache
  };
}
