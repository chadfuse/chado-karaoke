// YouTube API service for karaoke songs
import { YOUTUBE_API_BASE_URL, YOUTUBE_API_KEY } from '@/constants/config';
import { ApiCacheManager } from './apiCacheManager';

console.log('YouTube Service Debug - API Key loaded:', YOUTUBE_API_KEY?.substring(0, 10) + '...');

export interface YouTubeSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  youtubeId: string;
  thumbnail: string;
  duration?: string;
  channelTitle?: string;
}

export class YouTubeService {
  private static get apiKey() {
    return YOUTUBE_API_KEY;
  }

  private static get baseUrl() {
    return YOUTUBE_API_BASE_URL;
  }

  // Check if API is configured
  static isConfigured(): boolean {
    const isValid = Boolean(this.apiKey && this.apiKey.length > 10);
    
    console.log('YouTube API Debug:', {
      apiKey: this.apiKey?.substring(0, 10) + '...',
      keyLength: this.apiKey?.length,
      isValid
    });
    
    return isValid;
  }

  // Search for karaoke songs
  static async searchKaraokeSongs(query: string, maxResults: number = 20): Promise<YouTubeSong[]> {
    console.log('🎵 YouTube Search Starting:', { query, maxResults, isConfigured: this.isConfigured() });
    
    if (!this.isConfigured()) {
      console.warn('❌ YouTube API key not configured, falling back to mock data');
      return [];
    }

    // Check cache first
    const cacheKey = ApiCacheManager.getSearchCacheKey(query, maxResults);
    const cached = ApiCacheManager.getCached<YouTubeSong[]>(cacheKey);
    if (cached) {
      console.log('✅ Using cached search results for:', query);
      return cached;
    }

    // Check if we can make API request
    const requestCheck = ApiCacheManager.canMakeRequest();
    if (!requestCheck.allowed) {
      console.warn('⚠️ API request blocked:', requestCheck.reason);
      return []; // Return empty array to trigger fallback to mock data
    }

    try {
      // Record the API request
      ApiCacheManager.recordRequest();
      
      // Add "karaoke" to the search query for better results
      const searchQuery = `${query} karaoke`;
      
      const searchUrl = `${this.baseUrl}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}&` +
        `videoEmbeddable=true&` + // Only embeddable videos
        `videoCategoryId=10`; // Music category

      console.log('🔍 Making YouTube API request:', searchUrl.replace(this.apiKey!, 'API_KEY_HIDDEN'));

      const response = await fetch(searchUrl);
      
      console.log('📡 YouTube API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ YouTube API Error Response:', errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ YouTube API Success:', { itemCount: data.items?.length || 0 });
      
      // Process results (simplified - skip video details call to save quota)
      const songs: YouTubeSong[] = data.items.map((item: any) => {
        const title = item.snippet.title;
        
        // Try to extract artist from title (common patterns)
        let artist = item.snippet.channelTitle;
        const titleParts = title.split(' - ');
        if (titleParts.length >= 2) {
          artist = titleParts[0];
        } else {
          // Look for patterns like "Artist - Song (Karaoke)"
          const match = title.match(/^([^-()]+?)(?:\s*-\s*|\s*\()/);
          if (match) {
            artist = match[1].trim();
          }
        }

        return {
          id: item.id.videoId,
          title: this.cleanTitle(title),
          artist: this.cleanArtist(artist),
          genre: 'Karaoke',
          youtubeId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          channelTitle: item.snippet.channelTitle
        };
      });

      // Cache the results
      ApiCacheManager.setCache(cacheKey, songs);
      
      return songs;
    } catch (error) {
      console.error('YouTube API search failed:', error);
      return [];
    }
  }

  // Get trending karaoke songs
  static async getTrendingKaraoke(maxResults: number = 50): Promise<YouTubeSong[]> {
    if (!this.isConfigured()) {
      console.warn('YouTube API key not configured');
      return [];
    }

    // Check cache first - trending data can be cached longer
    const cacheKey = ApiCacheManager.getTrendingCacheKey();
    const cached = ApiCacheManager.getCached<YouTubeSong[]>(cacheKey);
    if (cached) {
      console.log('✅ Using cached trending karaoke results');
      return cached;
    }

    // Check if we can make API request
    const requestCheck = ApiCacheManager.canMakeRequest();
    if (!requestCheck.allowed) {
      console.warn('⚠️ Trending API request blocked:', requestCheck.reason);
      return [];
    }

    try {
      // Use a single optimized query instead of multiple queries
      const trendingQuery = 'popular karaoke songs 2024';
      const results = await this.searchKaraokeSongs(trendingQuery, maxResults);
      
      if (results.length > 0) {
        // Cache trending results for longer duration
        ApiCacheManager.setCache(
          cacheKey, 
          results, 
          ApiCacheManager.getTrendingCacheDuration()
        );
      }

      return results;
    } catch (error) {
      console.error('Failed to get trending karaoke:', error);
      return [];
    }
  }

  // Clean up song titles (remove karaoke, instrumental, etc.)
  private static cleanTitle(title: string): string {
    return title
      .replace(/\(karaoke\s*(version|instrumental)?\)/gi, '')
      .replace(/\[karaoke\s*(version|instrumental)?\]/gi, '')
      .replace(/karaoke\s*(version|instrumental)?/gi, '')
      .replace(/instrumental\s*version/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Clean up artist names
  private static cleanArtist(artist: string): string {
    return artist
      .replace(/karaoke/gi, '')
      .replace(/official/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Get API usage statistics
  static getApiUsage() {
    return ApiCacheManager.getUsageStats();
  }

  // Clear expired cache entries
  static clearCache() {
    ApiCacheManager.clearExpiredCache();
  }

  // Force clear all cache (for debugging)
  static clearAllCache() {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith('youtube_cache_')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log('🧹 Force cleared', cleared, 'cache entries');
  }
}
