import React, { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { uploadPhoto } from '../services/uploadPhoto';
import { updateUserProfile } from '../services/users';
import { garantirPostDaFoto } from '../services/posts';
import { User } from '../types';

function isValidRealPhotoUrl(url: unknown): boolean {
  const s = String(url || '').trim();
  if (!s) return false;
  if (s.includes('dicebear.com')) return false;
  if (s.includes('photo-1534528741775')) return false;
  return true;
}

export function extrairFotosValidas(user: any): string[] {
  if (!user) return [];
  const lista: string[] = [];
  if (Array.isArray(user.photos)) {
    for (const p of user.photos) {
      const s = String(p || '').trim();
      if (isValidRealPhotoUrl(s) && !lista.includes(s)) lista.push(s);
    }
  }
  const avatar = String(user.photo_url || '').trim();
  if (isValidRealPhotoUrl(avatar) && !lista.includes(avatar)) {
    lista.unshift(avatar);
  }
  return lista;
}

export function temFotoObrigatoria(user: any): boolean {
  return extrairFotosValidas(user).length > 0;
}

async function comprimirFotoObrigatoria(file: File): Promise<File> {
  try {
    const img = await createImageBitmap(file);
    const maxLado = 1280;
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const w = Math.round(img.width * escala);
    const h = Math.round(img.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

interface MandatoryPhotoGateProps {
  userId: string;
  currentUser?: User | null;
  onPhotoUploaded: () => Promise<void> | void;
  onLogout?: () => void;
}

export function MandatoryPhotoGate({
  userId,
  currentUser,
  onPhotoUploaded,
  onLogout
}: MandatoryPhotoGateProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setError('É obrigatório enviar uma foto para acessar o aplicativo.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const comprimida = await comprimirFotoObrigatoria(photoFile);
      const uploadedUrl = await uploadPhoto(comprimida, userId);

      const fotosAtuais = extrairFotosValidas(currentUser);
      const novasFotos = fotosAtuais.includes(uploadedUrl)
        ? fotosAtuais
        : [uploadedUrl, ...fotosAtuais];

      await updateUserProfile(userId, {
        photo_url: uploadedUrl,
        photos: novasFotos
      });

      const okPost = await garantirPostDaFoto(userId, uploadedUrl, '');
      if (!okPost) {
        await garantirPostDaFoto(userId, uploadedUrl, '');
      }

      window.dispatchEvent(new Event('profileUpdated'));
      window.dispatchEvent(new Event('feedUpdated'));
      await onPhotoUploaded();
    } catch (err: any) {
      console.error('MANDATORY-PHOTO-GATE falhou:', err);
      setError('Não foi possível enviar sua foto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)] px-5 py-8">
      <div className="w-full max-w-md bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-[var(--libido-accent)]/10 rounded-full">
            <Sparkles size={28} className="text-[var(--libido-accent)]" />
          </div>
          <h1 className="text-2xl font-fraunces font-medium">Foto obrigatória</h1>
          <p className="text-xs text-[var(--libido-muted)] leading-relaxed">
            Para entrar no Libido App, envie pelo menos uma foto para a sua galeria. Ela será publicada automaticamente no feed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="mandatory-photo-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => document.getElementById('mandatory-photo-input')?.click()}
            className="w-full py-4 px-4 rounded-2xl bg-[var(--libido-surface)] border border-dashed border-[var(--libido-accent)]/50 hover:border-[var(--libido-accent)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Camera size={16} className="text-[var(--libido-accent)]" />
            {photoFile ? 'Trocar foto selecionada' : 'Escolher foto da galeria'}
          </button>

          {preview && (
            <div className="rounded-2xl overflow-hidden border border-[var(--libido-border)] bg-black/40 flex items-center justify-center max-h-64">
              <img src={preview} alt="Prévia" className="max-h-64 object-contain" />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs text-center font-semibold bg-red-500/10 py-2.5 px-3 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !photoFile}
            className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 rounded-2xl text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {saving ? 'ENVIANDO FOTO...' : 'PUBLICAR E ENTRAR NO APP'}
          </button>
        </form>

        {onLogout && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onLogout}
              className="text-[10px] uppercase tracking-widest text-[var(--libido-muted)] hover:text-[var(--libido-text)]"
            >
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}