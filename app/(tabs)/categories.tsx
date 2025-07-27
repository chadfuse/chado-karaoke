import { ThemedText } from '@/components/ThemedText';
import { GENRES } from '@/constants/config';
import { mockSongs } from '@/constants/mockSongs';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Genres</ThemedText>
      <FlatList
        data={GENRES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const song = mockSongs.find((s) => s.genre === item);
          return (
            <TouchableOpacity
              style={styles.genreButton}
              // onPress={() => router.push({ pathname: '/genre', params: { genre: item } })}
            >
              {song && <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />}
              <ThemedText type="defaultSemiBold">{item}</ThemedText>
            </TouchableOpacity>
          );
        }}
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
  genreButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 27,
    borderRadius: 4,
    marginRight: 12,
  },
}); 