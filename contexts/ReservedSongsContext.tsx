import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ReservedSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  youtubeId: string;
  thumbnail: string;
  channelTitle?: string;
}

interface ReservedSongsContextType {
  reservedSongs: ReservedSong[];
  addReservedSong: (song: ReservedSong) => void;
  removeReservedSong: (songId: string) => void;
  playNextReserved: () => ReservedSong | null;
  isReserved: (songId: string) => boolean;
  clearReservedSongs: () => void;
}

const ReservedSongsContext = createContext<ReservedSongsContextType | undefined>(undefined);

interface ReservedSongsProviderProps {
  children: ReactNode;
}

export function ReservedSongsProvider({ children }: ReservedSongsProviderProps) {
  const [reservedSongs, setReservedSongs] = useState<ReservedSong[]>([]);

  const addReservedSong = (song: ReservedSong) => {
    setReservedSongs(prev => {
      // Check if song is already reserved
      if (prev.some(s => s.youtubeId === song.youtubeId)) {
        console.log('Song already reserved:', song.title);
        return prev;
      }
      
      console.log('Adding song to queue:', song.title);
      return [...prev, song];
    });
  };

  const removeReservedSong = (songId: string) => {
    setReservedSongs(prev => {
      const filtered = prev.filter(song => song.youtubeId !== songId);
      console.log('Removed song from queue, remaining:', filtered.length);
      return filtered;
    });
  };

  const playNextReserved = (): ReservedSong | null => {
    if (reservedSongs.length === 0) return null;
    
    const nextSong = reservedSongs[0];
    setReservedSongs(prev => prev.slice(1));
    console.log('Playing next reserved song:', nextSong.title, 'Queue remaining:', reservedSongs.length - 1);
    
    return nextSong;
  };

  const isReserved = (songId: string): boolean => {
    return reservedSongs.some(song => song.youtubeId === songId || song.id === songId);
  };

  const clearReservedSongs = () => {
    console.log('Clearing all reserved songs');
    setReservedSongs([]);
  };

  const value: ReservedSongsContextType = {
    reservedSongs,
    addReservedSong,
    removeReservedSong,
    playNextReserved,
    isReserved,
    clearReservedSongs,
  };

  return (
    <ReservedSongsContext.Provider value={value}>
      {children}
    </ReservedSongsContext.Provider>
  );
}

export function useReservedSongs(): ReservedSongsContextType {
  const context = useContext(ReservedSongsContext);
  if (context === undefined) {
    throw new Error('useReservedSongs must be used within a ReservedSongsProvider');
  }
  return context;
}
