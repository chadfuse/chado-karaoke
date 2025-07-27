import { mockSongs } from '@/constants/mockSongs';
import { YouTubeService, YouTubeSong } from '@/services/youtubeService';
import { useEffect, useState } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingData, setTrendingData] = useState<YouTubeSong[]>([]);

  // Load trending karaoke songs on mount
  useEffect(() => {
    loadTrendingKaraoke();
  }, []);

  const loadTrendingKaraoke = async () => {
    try {
      setLoading(true);
      const trending = await YouTubeService.getTrendingKaraoke(30);
      
      if (trending.length > 0) {
        setTrendingData(trending);
      } else {
        // Fallback to mock data if YouTube API fails
        console.log('Using mock data as fallback');
        setTrendingData(mockSongs);
      }
    } catch (error) {
      console.error('Failed to load trending karaoke:', error);
      setTrendingData(mockSongs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    console.log('Searching for:', query);
    setLoading(true);

    // Search using YouTube API
    const searchWithYouTube = async () => {
      try {
        const youtubeResults = await YouTubeService.searchKaraokeSongs(query, 20);
        
        if (youtubeResults.length > 0) {
          setResults(youtubeResults);
          console.log('YouTube API search results:', youtubeResults.length, 'songs found for query:', query);
        } else {
          // Fallback to mock data search
          console.log('YouTube API returned no results, falling back to mock data');
          const filteredMockSongs = mockSongs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.genre.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filteredMockSongs);
          console.log('Mock data search results:', filteredMockSongs.length, 'songs found for query:', query);
        }
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
    };

    // Debounce the search
    const timeoutId = setTimeout(searchWithYouTube, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    data: query ? results : trendingData.length > 0 ? trendingData : mockSongs,
    refreshTrending: loadTrendingKaraoke
  };
}
