import { ThemedText } from '@/components/ThemedText';
import { useReservedSongs } from '@/contexts/ReservedSongsContext';
import { useSearch } from '@/hooks/useSearch';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const { query, setQuery, results, loading, data } = useSearch();
  const { addReservedSong, isReserved } = useReservedSongs();
  const router = useRouter();

  const handleReserveSong = async (song: any) => {
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
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by title, artist, or genre"
        value={query}
        onChangeText={setQuery}
      />
      {loading && <ActivityIndicator style={{ marginBottom: 16 }} />}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={styles.songTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.songSubtitle}>{item.artist}{item.genre ? ` • ${item.genre}` : ''}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.playButtonContainer}
              onPress={() => router.push({
                pathname: '/(tabs)/player',
                params: {
                  songId: item.id,
                  title: item.title,
                  artist: item.artist,
                  genre: item.genre || '',
                  youtubeId: item.youtubeId,
                  thumbnail: item.thumbnail,
                }
              })}
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
            <TouchableOpacity
              style={styles.reserveButtonContainer}
              disabled={isReserved(item.id)}
              onPress={() => handleReserveSong(item)}
            >
              <LinearGradient
                colors={isReserved(item.id) ? ['#444444', '#444444'] : ['#4776E6', '#8E54E9', '#4776E6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reserveButton}
              >
                <ThemedText type="defaultSemiBold" style={[styles.reserveButtonText, isReserved(item.id) && { color: '#888888' }]}>
                  {isReserved(item.id) ? 'Reserved' : 'Reserve'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1a1a', // Dark background
    height:300,
  },
  input: {
    height: 100,
    borderColor: '#333333', // Dark border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#2a2a2a', // Dark input background
    color: '#ffffff', // White text
  },
  songItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333', // Dark border
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a', // Dark card background
    marginBottom: 8,
    borderRadius: 8,
  },
  thumbnail: {
    width: 64,
    height: 36,
    borderRadius: 4,
    marginRight: 12,
  },
  playButtonContainer: {
    marginLeft: 8,
  },
  playButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  reserveButtonContainer: {
    marginLeft: 8,
  },
  reserveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  reserved: {
    backgroundColor: '#444444', // Dark gray for reserved
  },
  songTitle: {
    color: '#ffffff', // White text
  },
  songSubtitle: {
    color: '#cccccc', // Light gray text
  },
  playButtonText: {
    color: '#ffffff', // White text
    textTransform: 'uppercase',
  },
  reserveButtonText: {
    color: '#ffffff', // White text
    textTransform: 'uppercase',
  },
});