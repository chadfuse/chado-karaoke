import { ThemedText } from '@/components/ThemedText';
import { useReservedSongs } from '@/contexts/ReservedSongsContext';
import { YouTubeService, YouTubeSong } from '@/services/youtubeService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILES_PER_ROW = 4;
const TILE_WIDTH = (width - (TILE_MARGIN * (TILES_PER_ROW + 1))) / TILES_PER_ROW;

export default function HomeScreen() {
  const router = useRouter();
  const { reservedSongs, addReservedSong, isReserved } = useReservedSongs();
  const [popularSongs, setPopularSongs] = useState<YouTubeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularSongs();
  }, []);

  const loadPopularSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎵 Loading popular karaoke songs...');
      const songs = await YouTubeService.getTrendingKaraoke(12); // 3 rows × 4 columns
      const limitedSongs = songs.slice(0, 12); // Ensure exactly 12 songs
      setPopularSongs(limitedSongs);
      console.log('✅ Loaded', limitedSongs.length, 'popular songs');
    } catch (err) {
      console.error('❌ Failed to load popular songs:', err);
      setError('Failed to load popular songs');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSong = (song: YouTubeSong) => {
    const reservedSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      youtubeId: song.youtubeId,
      thumbnail: song.thumbnail,
    };
    addReservedSong(reservedSong);
  };

  const handlePlaySong = (song: YouTubeSong) => {
    router.push({ 
      pathname: '/player', 
      params: { 
        youtubeId: song.youtubeId, 
        title: song.title, 
        artist: song.artist 
      } 
    });
  };

  const renderSongTile = ({ item }: { item: YouTubeSong }) => (
    <View style={styles.songTile}>
      <TouchableOpacity
        style={styles.tileImageContainer}
        onPress={() => handlePlaySong(item)}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.tileThumbnail} />
      </TouchableOpacity>
      <View style={styles.tileContent}>
        <ThemedText type="defaultSemiBold" style={styles.tileTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.tilePlayButtonContainer}
            onPress={() => handlePlaySong(item)}
          >
            <LinearGradient
              colors={['#02AAB0', '#00CDAC', '#02AAB0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tilePlayButton}
            >
              <ThemedText type="defaultSemiBold" style={styles.tilePlayText}>
                Play
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tileReserveButtonContainer}
            disabled={isReserved(item.id)}
            onPress={() => handleReserveSong(item)}
          >
            <LinearGradient
              colors={isReserved(item.id) ? ['#444444', '#444444'] : ['#4776E6', '#8E54E9', '#4776E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tileReserveButton}
            >
              <ThemedText type="defaultSemiBold" style={[styles.tileReserveText, isReserved(item.id) && styles.tileReservedText]}>
                {isReserved(item.id) ? 'Reserved' : 'Reserve'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading popular karaoke songs...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadPopularSongs}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/chado-logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <FlatList
        data={popularSongs}
        keyExtractor={(item) => item.id}
        numColumns={TILES_PER_ROW}
        renderItem={renderSongTile}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12, // Reduced padding for more space
    backgroundColor: '#1a1a1a', // Dark background
  },
  title: {
    marginBottom: 16,
    color: '#ffffff', // White text
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logo: {
    height: 60,
    width: 180,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 40, // More bottom padding
    paddingTop: 10, // Top padding for the list
  },
  row: {
    justifyContent: 'space-around', // Better distribution for 4 columns
    marginBottom: TILE_MARGIN, // Standard margin between rows
    paddingHorizontal: TILE_MARGIN / 2, // Add horizontal padding to rows
  },
  songTile: {
    width: TILE_WIDTH,
    height: 230, // Reduced height for 4-column layout
    backgroundColor: '#2a2a2a',
    borderRadius: 10, // Slightly smaller border radius
    overflow: 'hidden',
    marginHorizontal: TILE_MARGIN / 4, // Smaller horizontal margin
    marginVertical: TILE_MARGIN / 2, // Vertical margin for cards
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  tileImageContainer: {
    width: '100%',
    flex: 1, // Take available space
  },
  tileThumbnail: {
    width: '100%',
    height: '100%', // Use 100% of container height
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tileContent: {
    padding: 6, // Reduced padding for smaller tiles
    justifyContent: 'space-between', // Distribute content evenly
  },
  tileTitle: {
    color: '#ffffff',
    fontSize: 10, // Smaller font for 4-column layout
    marginBottom: 2,
    lineHeight: 12,
  },
  tileArtist: {
    color: '#cccccc',
    fontSize: 9, // Smaller artist font
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2, // Reduced gap for smaller buttons
  },
  tilePlayButtonContainer: {
    flex: 1,
    marginHorizontal: 1,
  },
  tilePlayButton: {
    paddingVertical: 3, // Smaller button padding
    paddingHorizontal: 4,
    borderRadius: 3,
    alignItems: 'center',
  },
  tilePlayText: {
    color: '#ffffff',
    fontSize: 9, // Smaller button text
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileReserveButtonContainer: {
    flex: 1,
    marginHorizontal: 1,
  },
  tileReserveButton: {
    paddingVertical: 3, // Smaller button padding
    paddingHorizontal: 4,
    borderRadius: 3,
    alignItems: 'center',
  },
  tileReserveText: {
    color: '#ffffff',
    fontSize: 9, // Smaller button text
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileReserved: {
    backgroundColor: '#444444',
  },
  tileReservedText: {
    color: '#888888',
  },
  // Legacy styles kept for compatibility
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  songTitle: {
    color: '#ffffff',
  },
  songSubtitle: {
    color: '#cccccc',
  },
  thumbnail: {
    width: 64,
    height: 36,
    borderRadius: 4,
    marginRight: 12,
  },
  reserveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  reserveButtonText: {
    color: '#ffffff',
  },
  reserved: {
    backgroundColor: '#444444',
  },
  reservedText: {
    color: '#888888',
  },
});
