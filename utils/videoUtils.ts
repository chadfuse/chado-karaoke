import { Linking } from 'react-native';

export const openYouTubeVideo = (videoId: string) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return Linking.openURL(youtubeUrl).catch(err => {
    console.error('Failed to open YouTube:', err);
  });
};

export const checkVideoEmbeddable = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return response.ok;
  } catch (error) {
    console.warn('Failed to check video embeddability:', error);
    return false;
  }
};

export const getOptimizedYouTubeURL = (videoId: string, isPlaying: boolean = false) => {
  const params = new URLSearchParams({
    autoplay: isPlaying ? '1' : '0',
    enablejsapi: '1',
    playsinline: '1',
    controls: '1',
    rel: '0',
    modestbranding: '1',
    fs: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    autohide: '1',
    start: '0'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};
