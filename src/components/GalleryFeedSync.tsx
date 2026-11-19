import React, { useState } from 'react';

export interface MediaItem {
  id: string;
  url: string;
  createdAt: string;
  showInFeed: boolean;
  isGalleryItem: boolean;
}

const STORAGE_KEY = 'libido_user_media_v1';

export function getStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMediaAndSyncFeed(url: string): MediaItem[] {
  const current = getStoredMedia();
  const newItem: MediaItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: url.trim(),
    createdAt: new Date().toISOString(),
    showInFeed: true,      // Garante presença automática no Feed
    isGalleryItem: true    // Garante presença na Galeria
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('libido:media-updated', { detail: updated }));
  } catch {
    // Ignora erro de armazenamento indisponível
  }
  return updated;
}

export function hasRequiredPhoto(): boolean {
  return getStoredMedia().some((item) => item.isGalleryItem && Boolean(item.url));
}

export function getFeedMedia(): MediaItem[] {
  return getStoredMedia().filter((item) => item.showInFeed && Boolean(item.url));
}

interface MandatoryPhotoGateProps {
  onPhotoUploaded?: (items: MediaItem[]) => void;
}

export function MandatoryPhotoGate({ onPhotoUploaded }: MandatoryPhotoGateProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      setError('É obrigatório enviar uma foto para acessar o aplicativo.');
      return;
    }
    setError('');
    const updated = saveMediaAndSyncFeed(photoUrl);
    setPhotoUrl('');
    if (onPhotoUploaded) {
      onPhotoUploaded(updated);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-white max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-bold">Foto obrigatória para continuar</h2>
      <p className="text-sm text-neutral-400">
        Para entrar no app, envie pelo menos uma foto para sua galeria. Ela será publicada automaticamente no feed.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Cole a URL ou caminho da foto..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
        >
          Publicar na Galeria e no Feed
        </button>
      </form>
    </div>
  );
}