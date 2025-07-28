import { storage } from '../src/utils/storage';

// Cache manager for YouTube API responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ApiUsageStats {
  requestsToday: number;
  lastRequestTime: number;
  dailyResetTime: number;
}

export class ApiCacheManager {
  private static readonly CACHE_PREFIX = 'youtube_cache_';
  private static readonly USAGE_KEY = 'youtube_api_usage';
  private static readonly DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly TRENDING_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private static readonly MAX_DAILY_REQUESTS = 800; // Conservative limit (out of 10,000 quota)
  private static readonly REQUEST_COOLDOWN = 1000; // 1 second between requests
  
  // Get cached data if valid
  static getCached<T>(key: string): T | null {
    try {
      const cached = storage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;
      
      const item: CacheItem<T> = JSON.parse(cached);
      
      if (Date.now() > item.expiresAt) {
        // Cache expired, remove it
        storage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }
      
      console.log('📦 Using cached data for:', key);
      return item.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }
  
  // Cache data with expiration
  static setCache<T>(key: string, data: T, duration?: number): void {
    try {
      const expiresAt = Date.now() + (duration || this.DEFAULT_CACHE_DURATION);
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt
      };
      
      storage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item));
      console.log('💾 Cached data for:', key, 'expires in', Math.round(duration || this.DEFAULT_CACHE_DURATION) / 1000 / 60, 'minutes');
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
  
  // Check if we can make API request (rate limiting)
  static canMakeRequest(): { allowed: boolean; reason?: string; waitTime?: number } {
    const usage = this.getUsageStats();
    const now = Date.now();
    
    // Check daily limit
    if (usage.requestsToday >= this.MAX_DAILY_REQUESTS) {
      const hoursUntilReset = Math.ceil((usage.dailyResetTime - now) / (1000 * 60 * 60));
      return { 
        allowed: false, 
        reason: `Daily API limit reached (${this.MAX_DAILY_REQUESTS} requests). Resets in ${hoursUntilReset}h`,
        waitTime: usage.dailyResetTime - now
      };
    }
    
    // Check cooldown period
    const timeSinceLastRequest = now - usage.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_COOLDOWN) {
      const waitTime = this.REQUEST_COOLDOWN - timeSinceLastRequest;
      return { 
        allowed: false, 
        reason: `Request cooldown active. Wait ${waitTime}ms`,
        waitTime
      };
    }
    
    return { allowed: true };
  }
  
  // Record API request usage
  static recordRequest(): void {
    const usage = this.getUsageStats();
    const now = Date.now();
    
    // Reset daily counter if new day
    if (now > usage.dailyResetTime) {
      usage.requestsToday = 0;
      usage.dailyResetTime = this.getNextDayReset();
    }
    
    usage.requestsToday++;
    usage.lastRequestTime = now;
    
    storage.setItem(this.USAGE_KEY, JSON.stringify(usage));
    
    console.log('📊 API Usage:', {
      requestsToday: usage.requestsToday,
      remainingToday: this.MAX_DAILY_REQUESTS - usage.requestsToday,
      percentage: Math.round((usage.requestsToday / this.MAX_DAILY_REQUESTS) * 100)
    });
  }
  
  // Get current usage statistics
  static getUsageStats(): ApiUsageStats {
    try {
      const stored = storage.getItem(this.USAGE_KEY);
      if (stored) {
        const usage: ApiUsageStats = JSON.parse(stored);
        
        // Reset if past reset time
        if (Date.now() > usage.dailyResetTime) {
          return {
            requestsToday: 0,
            lastRequestTime: 0,
            dailyResetTime: this.getNextDayReset()
          };
        }
        
        return usage;
      }
    } catch (error) {
      console.warn('Usage stats read error:', error);
    }
    
    // Default stats
    return {
      requestsToday: 0,
      lastRequestTime: 0,
      dailyResetTime: this.getNextDayReset()
    };
  }
  
  // Get cache key for search queries
  static getSearchCacheKey(query: string, maxResults: number): string {
    return `search_${query.toLowerCase().trim()}_${maxResults}`;
  }
  
  // Get cache key for trending results
  static getTrendingCacheKey(): string {
    return 'trending_karaoke';
  }
  
  // Clear old cache entries
  static clearExpiredCache(): void {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = storage.getItem(key);
          if (cached) {
            const item: CacheItem<any> = JSON.parse(cached);
            if (Date.now() > item.expiresAt) {
              storage.removeItem(key);
              cleared++;
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          storage.removeItem(key);
          cleared++;
        }
      }
    });
    
    if (cleared > 0) {
      console.log('🧹 Cleared', cleared, 'expired cache entries');
    }
  }
  
  // Get next day reset time (midnight)
  private static getNextDayReset(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }
  
  // Cache duration for trending data
  static getTrendingCacheDuration(): number {
    return this.TRENDING_CACHE_DURATION;
  }
}
