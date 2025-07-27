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
              <ThemedText type="defaultSemiBold" style={styles.songTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.songSubtitle}>{item.artist}{item.genre ? ` • ${item.genre}` : ''}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.playButton]}
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
              <ThemedText type="defaultSemiBold" style={styles.playButtonText}>Play</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reserveButton, reservedSongs.includes(item.id) && styles.reserved]}
              disabled={reservedSongs.includes(item.id)}
              onPress={() => setReservedSongs([...reservedSongs, item.id])}
            >
              <ThemedText type="defaultSemiBold" style={[styles.reserveButtonText, reservedSongs.includes(item.id) && { color: '#888888' }]}>
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
    backgroundColor: '#1a1a1a', // Dark background
  },
  input: {
    height: 48,
    borderColor: '#333333', // Dark border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
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
  reserveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF', // Blue button
    marginLeft: 8,
  },
  reserved: {
    backgroundColor: '#444444', // Dark gray for reserved
  },
  playButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#34a853', // Green button
    marginLeft: 8,
  },
  songTitle: {
    color: '#ffffff', // White text
  },
  songSubtitle: {
    color: '#cccccc', // Light gray text
  },
  playButtonText: {
    color: '#ffffff', // White text
  },
  reserveButtonText: {
    color: '#ffffff', // White text
  },
}); 