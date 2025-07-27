import { ThemedText } from '@/components/ThemedText';
import { useSearch } from '@/hooks/useSearch';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const { query, setQuery, results, loading, data } = useSearch();
  const [reservedSongs, setReservedSongs] = useState<string[]>([]);
  const router = useRouter();

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
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText>{item.artist}{item.genre ? ` • ${item.genre}` : ''}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.playButton]}
              onPress={() => router.push({
                pathname: '/SongPlayerScreen',
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
              <ThemedText type="defaultSemiBold" style={{ color: '#34a853' }}>Play</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reserveButton, reservedSongs.includes(item.id) && styles.reserved]}
              disabled={reservedSongs.includes(item.id)}
              onPress={() => setReservedSongs([...reservedSongs, item.id])}
            >
              <ThemedText type="defaultSemiBold" style={{ color: reservedSongs.includes(item.id) ? '#aaa' : '#007AFF' }}>
                {reservedSongs.includes(item.id) ? 'Reserved' : 'Reserve'}
              </ThemedText>
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
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  songItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#e0e0e0',
    marginLeft: 8,
  },
  reserved: {
    backgroundColor: '#f5f5f5',
  },
  playButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e0f7e0',
    marginLeft: 8,
  },
}); 