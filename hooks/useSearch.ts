import { mockSongs } from '@/constants/mockSongs';
import { useEffect, useState } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    console.log('Searching for:', query);
    
    // Use mock data search
    setLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const filteredMockSongs = mockSongs.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.genre.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filteredMockSongs);
      setLoading(false);
      console.log('Mock data search results:', filteredMockSongs.length, 'songs found for query:', query);
    }, 300);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    data: query ? results : mockSongs
  };
}
