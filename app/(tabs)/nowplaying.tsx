import { ThemedText } from '@/components/ThemedText';
import { useReservedSongs } from '@/contexts/ReservedSongsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NowPlayingScreen() {
  const { reservedSongs, removeReservedSong } = useReservedSongs();
  const [currentSong, setCurrentSong] = useState<any>(null);
  const router = useRouter();

  const handlePlaySong = (song: any) => {
    router.push({
      pathname: '/(tabs)/player',
      params: {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre || '',
        youtubeId: song.youtubeId,
        thumbnail: song.thumbnail,
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Current Song Section */}
      <View style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>Now Playing</ThemedText>
        {currentSong ? (
          <View style={styles.currentSongCard}>
            <Image source={{ uri: currentSong.thumbnail }} style={styles.currentThumbnail} />
            <View style={styles.currentSongInfo}>
              <ThemedText type="defaultSemiBold" style={styles.currentTitle}>{currentSong.title}</ThemedText>
              <ThemedText style={styles.currentArtist}>{currentSong.artist}</ThemedText>
              {currentSong.genre && <ThemedText style={styles.currentGenre}>{currentSong.genre}</ThemedText>}
            </View>
            <TouchableOpacity
              style={styles.playButtonContainer}
              onPress={() => handlePlaySong(currentSong)}
            >
              <LinearGradient
                colors={['#02AAB0', '#00CDAC', '#02AAB0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playButton}
              >
                <ThemedText type="defaultSemiBold" style={styles.playButtonText}>Play</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No song currently playing</ThemedText>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <ThemedText style={styles.browseButtonText}>Browse Songs</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Queue Section */}
      <View style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>Queue ({reservedSongs.length} songs)</ThemedText>
        {reservedSongs.length > 0 ? (
          reservedSongs.slice(0, 5).map((song, index) => (
            <View key={song.id} style={styles.queueItem}>
              <View style={styles.queueNumber}>
                <ThemedText style={styles.queueNumberText}>{index + 1}</ThemedText>
              </View>
              <Image source={{ uri: song.thumbnail }} style={styles.queueThumbnail} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.queueTitle}>{song.title}</ThemedText>
                <ThemedText style={styles.queueArtist}>{song.artist}</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.playButtonContainer}
                onPress={() => handlePlaySong(song)}
              >
                <LinearGradient
                  colors={['#02AAB0', '#00CDAC', '#02AAB0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.smallPlayButton}
                >
                  <ThemedText type="defaultSemiBold" style={styles.playButtonText}>Play</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No songs in queue</ThemedText>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <ThemedText style={styles.browseButtonText}>Add Songs</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentSongCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentThumbnail: {
    width: 80,
    height: 45,
    borderRadius: 8,
    marginRight: 16,
  },
  currentSongInfo: {
    flex: 1,
  },
  currentTitle: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 4,
  },
  currentArtist: {
    color: '#cccccc',
    fontSize: 16,
    marginBottom: 2,
  },
  currentGenre: {
    color: '#888888',
    fontSize: 14,
  },
  queueItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4776E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  queueNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  queueThumbnail: {
    width: 48,
    height: 27,
    borderRadius: 4,
    marginRight: 12,
  },
  queueTitle: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 2,
  },
  queueArtist: {
    color: '#cccccc',
    fontSize: 12,
  },
  playButtonContainer: {
    marginLeft: 8,
  },
  playButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallPlayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#4776E6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
