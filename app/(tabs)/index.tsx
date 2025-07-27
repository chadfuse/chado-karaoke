import { ThemedText } from '@/components/ThemedText';
import { mockSongs } from '@/constants/mockSongs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [reservedSongs, setReservedSongs] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Trending Karaoke Songs</ThemedText>
      <FlatList
        data={mockSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.songItem}
            onPress={() => router.push({ pathname: '/(tabs)/player', params: { songId: item.id } })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={styles.songTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.songSubtitle}>{item.artist} • {item.genre}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.reserveButton, reservedSongs.includes(item.id) && styles.reserved]}
              disabled={reservedSongs.includes(item.id)}
              onPress={() => setReservedSongs([...reservedSongs, item.id])}
            >
              <ThemedText type="defaultSemiBold" style={[styles.reserveButtonText, reservedSongs.includes(item.id) && styles.reservedText]}>
                {reservedSongs.includes(item.id) ? 'Reserved' : 'Reserve'}
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
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
  title: {
    marginBottom: 16,
    color: '#ffffff', // White text
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333', // Dark border
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a', // Dark card background
  },
  songTitle: {
    color: '#ffffff', // White text for song titles
  },
  songSubtitle: {
    color: '#cccccc', // Light gray for artist/genre
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
    backgroundColor: '#007AFF', // Blue button background
    marginLeft: 8,
  },
  reserveButtonText: {
    color: '#ffffff', // White button text
  },
  reserved: {
    backgroundColor: '#444444', // Dark gray for reserved state
  },
  reservedText: {
    color: '#888888', // Gray text for reserved state
  },
});
