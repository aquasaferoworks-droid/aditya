/**
 * @fileOverview Utility functions for detecting video types and extracting IDs.
 */

export type VideoSourceType = 'youtube' | 'direct' | 'unknown';

export function getVideoType(url: string): VideoSourceType {
  if (!url) return 'unknown';
  
  const isYoutube = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(url);
  if (isYoutube) return 'youtube';
  
  const isDirect = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  if (isDirect) return 'direct';
  
  // If it's just an 11 char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return 'youtube';
  
  return 'unknown';
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  
  // Handle direct ID input
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(idOrUrl: string, quality: 'hq' | 'max' = 'hq'): string {
  const id = extractYoutubeId(idOrUrl);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/${quality === 'max' ? 'maxresdefault' : 'hqdefault'}.jpg`;
}

export function getYoutubeEmbedUrl(idOrUrl: string): string {
  const id = extractYoutubeId(idOrUrl);
  if (!id) return '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`;
}
