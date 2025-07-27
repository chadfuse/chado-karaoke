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
            onPress={() => router.push({ pathname: '/SongPlayerScreen', params: { songId: item.id } })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText>{item.artist} • {item.genre}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.reserveButton, reservedSongs.includes(item.id) && styles.reserved]}
              disabled={reservedSongs.includes(item.id)}
              onPress={() => setReservedSongs([...reservedSongs, item.id])}
            >
              <ThemedText type="defaultSemiBold" style={{ color: reservedSongs.includes(item.id) ? '#aaa' : '#007AFF' }}>
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
  },
  title: {
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fafafa',
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
});
