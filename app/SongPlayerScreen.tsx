import { ThemedText } from '@/components/ThemedText';
import { mockSongs } from '@/constants/mockSongs';
import { useSearch } from '@/hooks/useSearch';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { memo, useCallback, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Memoized VideoPlayer to prevent re-renders when unrelated state changes
const VideoPlayer = memo(({ url, width, height }: { url: string; width: number; height: number }) => {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={url}
        style={{ width, height, border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <WebView
      source={{ uri: url }}
      style={{ width, height }}
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
    />
  );
});

// Memoized section wrapper for video that only updates when videoId/size changes
const VideoSection = memo(
  ({ videoId, width, height, key }: { videoId?: string; width: number; height: number; key?: string }) => {
    if (!videoId) {
      return (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>No video available for this song</Text>
          </View>
        </View>
      );
    }
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&t=${Date.now()}`;
    return (
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width, height, backgroundColor: '#000' }}>
          <VideoPlayer url={url} width={width} height={height} />
        </View>
      </View>
    );
  }
);

console.log('Mock songs available:', mockSongs.length);

export default function SongPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reservedSongs, setReservedSongs] = useState<any[]>([]);
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
      : mockSongs.find((s) => s.id === params.songId)
  );

  // Debug logging
  console.log('SongPlayerScreen debug:', {
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
    }
  }, [reservedSongs]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
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
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Now Playing
            </Text>
          )}
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={handleSearchToggle}
        >
          <ThemedText style={styles.searchIconText}>
            🔍
          </ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSearchToggle, reservedSongs, playNextReserved]);



  if (!currentSong) {
    return <ThemedText>Song not found.</ThemedText>;
  }

  const videoUrl = `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1`;
  const { width } = Dimensions.get('window');
  const height = (width * 9) / 16;

  // ...existing code above


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Search Overlay */}
      {showSearch && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: 'transparent',
          zIndex: 1000,
          padding: 16,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{
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
              }}
              placeholder="Search karaoke songs..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: 20,
              }}
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    marginBottom: 4,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 8,
                  }}
                >
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => handleSongSelect(song)}
                  >
                    <Image
                      source={{ uri: String(song.thumbnail) }}
                      style={{
                        width: 30,
                        height: 22,
                        borderRadius: 3,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', flex: 1 }} numberOfLines={1}>
                      {song.title} {song.youtubeId === currentSong?.youtubeId ? '(Now Playing)' : ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007AFF',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 15,
                      marginLeft: 8,
                    }}
                    onPress={() => handleReserveSong(song)}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
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
        width={width}
        height={height}
        key={`${currentSong.youtubeId}-${Date.now()}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchIcon: {
    padding: 10,
    marginRight: 10,
  },
  searchIconText: {
    fontSize: 18,
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  playerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  songInfo: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
    marginBottom: 8,
    borderRadius: 8,
  },
  thumbnail: {
    width: 60,
    height: 34,
    borderRadius: 4,
    marginRight: 12,
  },
  songDetails: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 