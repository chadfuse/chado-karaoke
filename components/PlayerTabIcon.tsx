import { IconSymbol } from '@/components/ui/IconSymbol';
import { useReservedSongs } from '@/contexts/ReservedSongsContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PlayerTabIconProps {
  color: string;
  size?: number;
}

export function PlayerTabIcon({ color, size = 28 }: PlayerTabIconProps) {
  const { reservedSongs } = useReservedSongs();
  const queueCount = reservedSongs.length;

  return (
    <View style={styles.container}>
      <IconSymbol size={size} name="play.circle.fill" color={color} />
      {queueCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {queueCount > 99 ? '99+' : queueCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
