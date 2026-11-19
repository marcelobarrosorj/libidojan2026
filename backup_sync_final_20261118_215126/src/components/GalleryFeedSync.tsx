import React, { useEffect, useState } from 'react';

export interface MediaItem {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
  showInFeed: boolean;
  isGalleryItem: boolean;
}

const STORAGE_KEY = 'libido_user_media_v1';

export function getStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMediaAndSyncFeed(url: string, caption = ''): MediaItem[] {
  const cleanUrl = url.trim();
  if (!cleanUrl) return getStoredMedia();

  const current = getStoredMedia();
  const newItem: MediaItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: cleanUrl,
    caption: caption.trim(),
    createdAt: new Date().toISOString(),
    showInFeed: true,
    isGalleryItem: true
  };

  // Garante que todo item da galeria também fique marcado para aparecer no feed
  const normalizedCurrent = current.map((item) => ({
    ...item,
    isGalleryItem: item.isGalleryItem !== false,
    showInFeed: true
  }));

  const updated = [newItem, ...normalizedCurrent];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('libido:media-updated', { detail: updated }));
  } catch {
    // Ignora falha de storage em contexto restrito
  }
  return updated;
}

export function hasRequiredPhoto(): boolean {
  return getStoredMedia().some((item) => item.isGalleryItem && Boolean(item.url && item.url.trim()));
}

export function getGalleryMedia(): MediaItem[] {
  return getStoredMedia().filter((item) => item.isGalleryItem && Boolean(item.url && item.url.trim()));
}

export function getFeedMedia(): MediaItem[] {
  return getStoredMedia().filter((item) => item.showInFeed && Boolean(item.url && item.url.trim()));
}

export function useSyncedMedia() {
  const [media, setMedia] = useState<MediaItem[]>(() => getStoredMedia());

  useEffect(() => {
    const syncFromStorage = () => setMedia(getStoredMedia());
    window.addEventListener('libido:media-updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('libido:media-updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const addPhoto = (url: string, caption = '') => {
    const updated = saveMediaAndSyncFeed(url, caption);
    setMedia(updated);
    return updated;
  };

  return {
    media,
    galleryMedia: media.filter((m) => m.isGalleryItem && Boolean(m.url)),
    feedMedia: media.filter((m) => m.showInFeed && Boolean(m.url)),
    hasPhoto: media.some((m) => m.isGalleryItem && Boolean(m.url)),
    addPhoto
  };
}

interface MandatoryPhotoGateProps {
  onPhotoUploaded?: (items: MediaItem[]) => void;
}

export function MandatoryPhotoGate({ onPhotoUploaded }: MandatoryPhotoGateProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      setError('É obrigatório enviar uma foto para entrar no aplicativo.');
      return;
    }
    setError('');
    const updated = saveMediaAndSyncFeed(photoUrl, caption);
    setPhotoUrl('');
    setCaption('');
    if (onPhotoUploaded) {
      onPhotoUploaded(updated);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-white max-w-md mx-auto space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Foto obrigatória para acessar</h2>
        <p className="text-sm text-neutral-400">
          Para entrar no app, envie uma foto para a galeria. Ela aparecerá automaticamente no feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-xs text-neutral-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
        />

        <input
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Ou cole a URL da foto..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-600"
        />

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda opcional..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-600"
        />

        {photoUrl.trim() && (
          <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 max-h-48 flex items-center justify-center">
            <img src={photoUrl} alt="Prévia da foto" className="max-h-48 object-contain" />
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
        >
          Enviar foto para Galeria e Feed
        </button>
      </form>
    </div>
  );
}