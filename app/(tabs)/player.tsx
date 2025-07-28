import { ThemedText } from '@/components/ThemedText';
import { mockSongs } from '@/constants/mockSongs';
import { useReservedSongs } from '@/contexts/ReservedSongsContext';
import { useSearch } from '@/hooks/useSearch';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { memo, useCallback, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

// Memoized VideoPlayer that uses different implementations based on platform
const VideoPlayer = memo(({ videoId, width, height, onVideoEnd, isPlaying }: { videoId: string; width: number; height: number; onVideoEnd?: () => void; isPlaying: boolean }) => {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const openInYouTube = useCallback(() => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(youtubeUrl).catch(err => console.error('Failed to open YouTube:', err));
  }, [videoId]);

  if (hasError) {
    return (
      <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}>
          🚫 Video Unavailable
        </Text>
        <Text style={{ color: '#ccc', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
          This video cannot be played. It may be restricted, private, or removed.
        </Text>
        <TouchableOpacity
          onPress={openInYouTube}
          style={{
            backgroundColor: '#FF0000',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 8 }}>📱</Text>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Open in YouTube</Text>
        </TouchableOpacity>
        <Text style={{ color: '#888', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          Tap to open in YouTube app
        </Text>
      </View>
    );
  }

  // Use react-native-youtube-iframe for mobile platforms only
  if ((Platform.OS === 'ios' || Platform.OS === 'android') && Platform.OS !== 'web') {
    const handleStateChange = useCallback((state: string) => {
      console.log('YouTube player state changed:', state);
      if (state === 'ended') {
        onVideoEnd?.();
      }
    }, [onVideoEnd]);

    const handleError = useCallback((error: string) => {
      console.error('YouTube player error:', error);
      setHasError(true);
    }, []);

    return (
      <View style={{ width, height, backgroundColor: '#000' }}>
        {!isReady && (
          <View style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#000',
            zIndex: 1
          }}>
            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>🎵 Loading video...</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>Please wait</Text>
          </View>
        )}
        <YoutubePlayer
          height={height}
          width={width}
          videoId={videoId}
          play={isPlaying}
          onChangeState={handleStateChange}
          onError={handleError}
          onReady={() => {
            console.log('YouTube player ready');
            setIsReady(true);
          }}
          initialPlayerParams={{
            cc_lang_pref: 'en',
            showClosedCaptions: false,
            preventFullScreen: false,
            controls: true,
            modestbranding: true,
            rel: false,
            showinfo: false,
          }}
          webViewStyle={{
            backgroundColor: '#000',
          }}
          webViewProps={{
            allowsFullscreenVideo: true,
            allowsInlineMediaPlayback: true,
          }}
        />
      </View>
    );
  }

  // Use WebView/iframe for web and other platforms
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
    start: '0',
    widget_referrer: 'https://karaoke-app.com'
  });
  
  const url = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

  // Use iframe for web platform
  if (Platform.OS === 'web') {
    return (
      <div style={{ width, height, backgroundColor: '#000' }}>
        {!isReady && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#000',
            zIndex: 1,
            color: '#fff',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: 16, marginBottom: 10 }}>🎵 Loading video...</div>
            <div style={{ fontSize: 12, color: '#888' }}>Please wait</div>
          </div>
        )}
        <iframe
          src={url}
          style={{ width, height, border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Karaoke Video Player"
          onError={() => setHasError(true)}
          onLoad={() => setIsReady(true)}
        />
      </div>
    );
  }

  // Fallback WebView for other platforms
  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      {!isReady && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#000',
          zIndex: 1
        }}>
          <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>🎵 Loading video...</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>Please wait</Text>
        </View>
      )}
      <WebView
        source={{ uri: url }}
        style={{ width, height }}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
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
          setIsReady(true);
        }}
        onLoadStart={() => {
          setIsReady(false);
          console.log('Video loading started');
        }}
        onLoadEnd={() => {
          setIsReady(true);
          console.log('Video loaded successfully');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP error: ', nativeEvent);
          setIsReady(true);
          if (nativeEvent.statusCode >= 400) {
            setHasError(true);
          }
        }}
        injectedJavaScript={`
          // Monitor video progress and detect near end
          let videoEndTimer = null;
          
          function checkVideoProgress() {
            const video = document.querySelector('video');
            if (video && video.duration && video.currentTime) {
              const timeLeft = video.duration - video.currentTime;
              
              // If 2 seconds or less remaining, trigger next video
              if (timeLeft <= 2 && timeLeft > 0 && !videoEndTimer) {
                videoEndTimer = setTimeout(() => {
                  window.ReactNativeWebView.postMessage('videoNearEnd');
                  videoEndTimer = null;
                }, (timeLeft - 0.5) * 1000);
              }
            }
          }
          
          // Check progress every 500ms
          setInterval(checkVideoProgress, 500);
          
          // Check for YouTube error messages
          setTimeout(() => {
            const errorElements = document.querySelectorAll('.ytp-error, .ytp-error-content');
            if (errorElements.length > 0 || 
                document.body.innerHTML.includes('Video unavailable') ||
                document.body.innerHTML.includes('restricted from playback')) {
              window.ReactNativeWebView.postMessage('error');
            }
          }, 5000);
          
          // Hide suggested videos at the end
          const style = document.createElement('style');
          style.textContent = \`
            .ytp-endscreen-content,
            .ytp-ce-element,
            .ytp-cards-teaser,
            .ytp-pause-overlay {
              display: none !important;
            }
          \`;
          document.head.appendChild(style);
          
          true;
        `}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'error') {
            setHasError(true);
          } else if (event.nativeEvent.data === 'videoNearEnd') {
            onVideoEnd?.();
          }
        }}
      />
    </View>
  );
});

// Memoized section wrapper for video that only updates when videoId/size changes
const VideoSection = memo(
  ({ videoId, width, height, isPlaying, onVideoEnd }: { videoId?: string; width: number; height: number; isPlaying: boolean; onVideoEnd?: () => void }) => {
    if (!videoId) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>No video available for this song</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <View style={{ width, height, backgroundColor: '#000' }}>
          <VideoPlayer 
            videoId={videoId} 
            width={width} 
            height={height} 
            onVideoEnd={onVideoEnd}
            isPlaying={isPlaying}
          />
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
  const { reservedSongs, addReservedSong, playNextReserved, isReserved } = useReservedSongs();
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

  const handleReserveSong = useCallback(async (song: any) => {
    console.log('Reserved song:', song.title);
    const reservedSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      genre: song.genre || '',
      youtubeId: song.youtubeId,
      thumbnail: song.thumbnail,
      channelTitle: song.channelTitle,
    };
    await addReservedSong(reservedSong);
    setSearchQuery('');
    setShowSearch(false);
  }, [addReservedSong]);

  const handlePlayNextReserved = useCallback(() => {
    const nextSong = playNextReserved();
    if (nextSong) {
      setCurrentSong(nextSong);
      setIsPlaying(true); // Start playing when switching to next song
    }
  }, [playNextReserved]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    setVideoKey(prev => prev + 1); // Force video remount
  }, []);

  const handleVideoEnd = useCallback(() => {
    console.log('Video ended, checking for next reserved song');
    if (reservedSongs.length > 0) {
      console.log('Auto-playing next reserved song');
      setTimeout(() => {
        handlePlayNextReserved();
      }, 1000); // Add small delay before switching to next video
    }
  }, [reservedSongs.length, handlePlayNextReserved]);

  // Memoize header components to prevent unnecessary re-renders
  const headerTitle = useCallback(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      {reservedSongs.length > 0 ? (
        <TouchableOpacity 
          style={{ flex: 1, alignItems: 'center' }}
          onPress={handlePlayNextReserved}
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
  ), [reservedSongs, handlePlayNextReserved, handlePlayPause, isPlaying]);

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

  console.log('Platform detected:', Platform.OS, '- Using', 
    Platform.OS === 'ios' || Platform.OS === 'android' ? 'react-native-youtube-iframe' : 
    Platform.OS === 'web' ? 'iframe' : 'WebView');

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <ThemedText style={{ color: '#fff' }}>No song selected. Go to Home to choose a song.</ThemedText>
      </View>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&modestbranding=1&rel=0&controls=1&fs=0&iv_load_policy=3`;
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
              onPress={handlePlayNextReserved}
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
                  !isReserved(song.youtubeId)
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
        onVideoEnd={handleVideoEnd}
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
