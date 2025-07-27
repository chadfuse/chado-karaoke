import { ThemedText } from '@/components/ThemedText';
import { mockSongs } from '@/constants/mockSongs';
import { useSearch } from '@/hooks/useSearch';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { memo, useCallback, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Memoized VideoPlayer to prevent re-renders when unrelated state changes
const VideoPlayer = memo(({ url, width, height, videoId }: { url: string; width: number; height: number; videoId: string }) => {
  const [hasError, setHasError] = useState(false);

  const openInYouTube = useCallback(() => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(youtubeUrl).catch(err => console.error('Failed to open YouTube:', err));
  }, [videoId]);

  if (hasError) {
    return (
      <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
          Video not available for embedding
        </Text>
        <TouchableOpacity
          onPress={openInYouTube}
          style={{
            backgroundColor: '#FF0000',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Open in YouTube</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <iframe
        src={url}
        style={{ width, height, border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="Karaoke Video Player"
        onError={() => setHasError(true)}
      />
    );
  }
  
  return (
    <WebView
      source={{ uri: url }}
      style={{ width, height }}
      allowsFullscreenVideo={true}
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      allowsInlineMediaPlayback={true}
      bounces={false}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      mixedContentMode="compatibility"
      originWhitelist={['*']}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
        setHasError(true);
      }}
      onLoadEnd={() => {
        console.log('Video loaded successfully');
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('HTTP error: ', nativeEvent);
        if (nativeEvent.statusCode >= 400) {
          setHasError(true);
        }
      }}
      injectedJavaScript={`
        // Ensure video elements are properly configured for mobile
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.setAttribute('controls', 'true');
        });
        
        // Check for YouTube error messages
        setTimeout(() => {
          const errorElements = document.querySelectorAll('.ytp-error, .ytp-error-content');
          if (errorElements.length > 0) {
            window.ReactNativeWebView.postMessage('error');
          }
        }, 3000);
        
        true; // Required for injected JS
      `}
      onMessage={(event) => {
        if (event.nativeEvent.data === 'error') {
          setHasError(true);
        }
      }}
    />
  );
});

// Memoized section wrapper for video that only updates when videoId/size changes
const VideoSection = memo(
  ({ videoId, width, height, isPlaying }: { videoId?: string; width: number; height: number; isPlaying: boolean }) => {
    if (!videoId) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>No video available for this song</Text>
          </View>
        </View>
      );
    }
    
    // Enhanced YouTube URL with mobile-friendly parameters
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      enablejsapi: '1',
      playsinline: '1',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      autohide: '1',
      start: '0'
    });
    
    // Remove origin parameter for better compatibility
    const url = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    
    return (
      <View style={{ flex: 1 }}>
        <View style={{ width, height, backgroundColor: '#000' }}>
          <VideoPlayer url={url} width={width} height={height} videoId={videoId} />
        </View>
      </View>
    );
  }
);

console.log('Mock songs available:', mockSongs.length);

export default function PlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reservedSongs, setReservedSongs] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(true); // Track play/pause state
  const [videoKey, setVideoKey] = useState(0); // Key to force video remount
  const { query, setQuery, results, loading, data } = useSearch();
  const [currentSong, setCurrentSong] = useState(() =>
    params.youtubeId
      ? {
          id: params.songId,
          title: params.title,
          artist: params.artist,
          genre: params.genre,
          youtubeId: params.youtubeId,
          thumbnail: params.thumbnail,
        }
      : mockSongs.find((s) => s.id === params.songId) || mockSongs[0] // Default to first song if none found
  );

  // Debug logging
  console.log('PlayerScreen debug:', {
    showSearch,
    query,
    resultsLength: results.length,
    loading,
    dataLength: data.length,
    actualData: query ? results : data,
    firstItem: (query ? results : data)[0],
    currentSongId: currentSong?.youtubeId,
    reservedSongsCount: reservedSongs.length,
    reservedSongsIds: reservedSongs.map(s => s.youtubeId)
  });

  // Sync local search query with hook
  React.useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, setQuery]);

  // Memoized functions to prevent unnecessary re-renders
  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => {
      const newValue = !prev;
      if (prev) { // if closing search
        setSearchQuery('');
      }
      return newValue;
    });
  }, []);

  const handleSongSelect = useCallback((song: any) => {
    console.log('Selected song:', song.title);
    // Always update the current song when selected
    setCurrentSong(song);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  const handleReserveSong = useCallback((song: any) => {
    console.log('Reserved song:', song.title);
    setReservedSongs(prev => [...prev, song]);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  const playNextReserved = useCallback(() => {
    if (reservedSongs.length > 0) {
      const nextSong = reservedSongs[0];
      setCurrentSong(nextSong);
      setReservedSongs(prev => prev.slice(1));
      setIsPlaying(true); // Start playing when switching to next song
    }
  }, [reservedSongs]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    setVideoKey(prev => prev + 1); // Force video remount
  }, []);

  // Memoize header components to prevent unnecessary re-renders
  const headerTitle = useCallback(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      {reservedSongs.length > 0 ? (
        <TouchableOpacity 
          style={{ flex: 1, alignItems: 'center' }}
          onPress={playNextReserved}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>
            ▶ Next: {reservedSongs[0].title}
          </Text>
          <Text style={{ color: '#fff', fontSize: 10, opacity: 0.8 }}>
            {reservedSongs.length} reserved • Tap to play
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>
            Now Playing
          </Text>
          <TouchableOpacity onPress={handlePlayPause}>
            <Text style={{ color: '#fff', fontSize: 18 }}>{isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [reservedSongs, playNextReserved, handlePlayPause, isPlaying]);

  const headerRight = useCallback(() => (
    <TouchableOpacity
      style={styles.searchIcon}
      onPress={handleSearchToggle}
    >
      <ThemedText style={styles.searchIconText}>
        🔍
      </ThemedText>
    </TouchableOpacity>
  ), [handleSearchToggle]);

  useLayoutEffect(() => {
    console.log('Disabling navigation header for custom header');
    navigation.setOptions({
      headerShown: false, // Disable navigation header since we have custom header
    });
  }, [navigation]);

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <ThemedText style={{ color: '#fff' }}>No song selected. Go to Home to choose a song.</ThemedText>
      </View>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1`;
  const { width, height: screenHeight } = Dimensions.get('window');
  // Calculate video height accounting for custom header and tab bar
  const customHeaderHeight = Platform.OS === 'ios' ? 85 : 60; // Custom header height
  const tabBarHeight = 60; // Approximate tab bar height
  const videoWidth = width; // Full width
  const videoHeight = screenHeight - customHeaderHeight - tabBarHeight;

  return (
    <View style={styles.container}>
      {/* Custom Header - always visible */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingHorizontal: 16 }}>
          {reservedSongs.length > 0 ? (
            <TouchableOpacity 
              style={{ flex: 1, alignItems: 'center' }}
              onPress={playNextReserved}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>
                ▶ Next: {reservedSongs[0].title}
              </Text>
              <Text style={{ color: '#fff', fontSize: 10, opacity: 0.8 }}>
                {reservedSongs.length} reserved • Tap to play
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>
                Now Playing
              </Text>
              <TouchableOpacity onPress={handlePlayPause}>
                <Text style={{ color: '#fff', fontSize: 18 }}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={handleSearchToggle}
          >
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Overlay */}
      {showSearch && (
        <View style={styles.searchOverlay}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search karaoke songs..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSearchToggle}
            >
              <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Search Results */}
          {searchQuery && results.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {results
                .filter(song => 
                  // Allow current song to be reserved, but filter out already reserved songs
                  song.youtubeId === currentSong?.youtubeId || 
                  !reservedSongs.some(reserved => reserved.youtubeId === song.youtubeId)
                )
                .slice(0, 5)
                .map((song, index) => (
                <View
                  key={index}
                  style={styles.searchResultItem}
                >
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => handleSongSelect(song)}
                  >
                    <Image
                      source={{ uri: String(song.thumbnail) }}
                      style={styles.resultThumbnail}
                    />
                    <Text style={styles.resultText} numberOfLines={1}>
                      {song.title} {song.youtubeId === currentSong?.youtubeId ? '(Now Playing)' : ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={() => handleReserveSong(song)}
                  >
                    <Text style={styles.reserveButtonText}>
                      Reserve
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Video Player Area - Always visible */}
      <VideoSection
        videoId={String(currentSong.youtubeId)}
        width={videoWidth}
        height={videoHeight}
        isPlaying={isPlaying}
        key={`${currentSong.youtubeId}-${videoKey}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background
  },
  customHeader: {
    backgroundColor: '#000',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 100, // Ensure it's above other elements
  },
  searchIcon: {
    padding: 10,
    marginRight: 10,
  },
  searchIconText: {
    fontSize: 18,
    color: '#fff',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'transparent',
    zIndex: 1000,
    padding: 16,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  resultThumbnail: {
    width: 30,
    height: 22,
    borderRadius: 3,
    marginRight: 8,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  reserveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
