import { createReport } from '../services/admin';
import { useState } from 'react';
import { ArrowLeft, Shield, Ban, Trash2, Eye, Lock, Users, Flag, MessageCircle } from 'lucide-react';
import { User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { formatUserNumber } from '../utils/formatUserNumber';
import { isDemoId } from '../demo';
import { updateUserProfile, deleteUserProfile } from '../services/users';

interface ViewProfileProps {
  currentUser?: User | null;
  user: User;
  navigate?: (tab: string, params?: any) => void;
  isAdmin?: boolean;
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
}

export function ViewProfile({ user, navigate, isAdmin, isPremium, onShowPremiumModal, currentUser }: ViewProfileProps) {
  const [showConfirmBan, setShowConfirmBan] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--libido-bg)] text-[var(--libido-muted)] opacity-50 text-xs">
        Perfil não encontrado.
      </div>
    );
  }

  const nickname = user.nickname || 'Usuário';
  const photoUrl = user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
  const userPhotos: string[] = user.photos || [];
  const displayBio = user.bio || '';
  const isOnline = user.isOnline || user.is_online || false;

  const isCouple = !!user.couple_profile;
  const coupleData = user.couple_profile || null;

  const handleBanUser = async () => {
    try {
      if (!user.user_id) return;
      await updateUserProfile(user.user_id, { status: 'banned' });
      alert('Usuário banido com sucesso.');
      navigate?.('feed');
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  
  const handleReport = async () => {
    if (isDemoId(user.id || user.user_id || '')) {
      alert("Ações de denúncia estão desabilitadas para perfis de demonstração.");
      setShowReportModal(false);
      return;
    }
    if (!reportReason.trim() || !currentUser?.id || !user?.user_id) return;
    setIsReporting(true);
    try {
      await createReport({
        reporterId: currentUser.id,
        targetUserId: user.user_id,
        reason: reportReason
      });
      alert('Denúncia enviada com sucesso.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert('Erro ao enviar denúncia.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (currentUser?.plan !== 'owner') {
      alert("Apenas owners podem excluir usuários.");
      return;
    }
    try {
      if (!user.user_id) return;
      await deleteUserProfile(user.user_id);
      alert('Usuário excluído.');
      navigate?.('feed');
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--libido-border)] flex-shrink-0 bg-[var(--libido-bg)]/95 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={() => navigate?.('radar')} className="text-[var(--libido-muted)] opacity-70 hover:text-[var(--libido-text)]"><ArrowLeft size={20} /></button>
        <h2 className="text-sm font-black uppercase tracking-wider flex-1">{nickname} {user.userNumber ? <span className="text-[10px] text-[var(--libido-muted)] opacity-50 ml-1">#{formatUserNumber(user.userNumber)}</span> : null}</h2>
        {(
    (currentUser?.plan === 'owner') || 
    (currentUser?.plan === 'admin' && user.plan !== 'owner' && user.plan !== 'admin') || 
    (currentUser?.plan === 'moderator' && user.plan !== 'owner' && user.plan !== 'admin' && user.plan !== 'moderator')
  ) && (
          <div className="flex gap-2">
            <button onClick={() => setShowConfirmBan(true)} className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center hover:bg-orange-500/20"><Ban size={14} className="text-orange-400" /></button>
            {currentUser?.plan === 'owner' && (
              <button onClick={() => setShowConfirmDelete(true)} className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center hover:bg-red-500/20"><Trash2 size={14} className="text-red-400" /></button>
            )}
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 rounded-full p-0.5 border-2 border-[var(--libido-accent)]/30 shadow-[0_0_30px_rgba(255,179,0,0.1)] mb-4">
            <ProtectedImage currentUser={currentUser} src={photoUrl} alt="avatar" className="w-full h-full rounded-full" />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[var(--libido-bg)] ${isOnline ? 'bg-green-500' : 'bg-white/20'}`} />
          </div>
          <h2 className="text-lg font-black text-[var(--libido-text)] flex items-center justify-center gap-1">{nickname} {user.userNumber ? <span className="text-[12px] text-[var(--libido-muted)] opacity-50">#{formatUserNumber(user.userNumber)}</span> : null}</h2>
          <p className="text-[10px] text-[var(--libido-muted)] opacity-50 font-semibold mt-0.5">{isOnline ? '🟢 Online agora' : '⚪ Offline'}</p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate?.('chat', { user })}
              className="flex items-center gap-2 bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/15"
            >
              <MessageCircle size={12} />
              Enviar Mensagem
            </button>
            <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 bg-white/5 border border-[var(--libido-border)] text-[var(--libido-muted)] opacity-80 font-black py-3 px-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10">
              <Flag size={12} />
              Denunciar
            </button>
          </div>
        </div>

        {isCouple && coupleData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 border-b border-[var(--libido-border)] pb-2">
              <Users size={14} className="text-[var(--libido-accent)]" />
              <h3 className="text-[10px] font-black text-[var(--libido-muted)] opacity-70 uppercase tracking-widest">Dados do Casal</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-accent)]/20 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1.5">Ele 👨</p>
                <h4 className="text-sm font-black truncate">{coupleData.maleNickname || 'Parceiro'}</h4>
                <p className="text-[10px] text-[var(--libido-muted)] opacity-70 font-semibold mt-1">{coupleData.maleAge ? `${coupleData.maleAge} anos` : ''}</p>
                <div className="mt-2 pt-2 border-t border-[var(--libido-border)] text-[8px] text-[var(--libido-muted)] opacity-60 font-bold space-y-0.5">
                  <p>Biotipo: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.maleBiotype || 'n/d'}</span></p>
                  <p>Altura: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.maleHeight || 'n/d'}</span></p>
                  <p>Peso: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.maleWeight || 'n/d'}</span></p>
                </div>
              </div>
              <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-accent)]/20 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1.5">Ela 👩</p>
                <h4 className="text-sm font-black truncate">{coupleData.femaleNickname || 'Parceira'}</h4>
                <p className="text-[10px] text-[var(--libido-muted)] opacity-70 font-semibold mt-1">{coupleData.femaleAge ? `${coupleData.femaleAge} anos` : ''}</p>
                <div className="mt-2 pt-2 border-t border-[var(--libido-border)] text-[8px] text-[var(--libido-muted)] opacity-60 font-bold space-y-0.5">
                  <p>Biotipo: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.femaleBiotype || 'n/d'}</span></p>
                  <p>Altura: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.femaleHeight || 'n/d'}</span></p>
                  <p>Peso: <span className="text-[var(--libido-muted)] opacity-80">{coupleData.femaleWeight || 'n/d'}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {displayBio && (
          <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
            <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider mb-1.5">Sobre</p>
            <p className="text-xs text-[var(--libido-muted)] opacity-90 font-medium leading-relaxed">{displayBio}</p>
          </div>
        )}

        {!isCouple && (
          <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
            <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider mb-2">Informações</p>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-[var(--libido-muted)] opacity-70">
              <p>Gênero: <span className="text-[var(--libido-muted)] opacity-90">{user.gender || 'n/d'}</span></p>
              <p>Idade: <span className="text-[var(--libido-muted)] opacity-90">{user.age ? `${user.age} anos` : 'n/d'}</span></p>
              <p>Biotipo: <span className="text-[var(--libido-muted)] opacity-90">{user.biotype || 'n/d'}</span></p>
              <p>Altura: <span className="text-[var(--libido-muted)] opacity-90">{user.height ? `${user.height} cm` : 'n/d'}</span></p>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--libido-muted)] opacity-70 mb-3">Galeria ({userPhotos.length})</h3>
          {userPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {userPhotos.map((imgUrl: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[var(--libido-border)] relative">
                  <ProtectedImage currentUser={currentUser} src={imgUrl} alt="gallery" className={`w-full h-full ${!isPremium && idx > 0 ? "blur-lg" : ""}`} />
                  {!isPremium && idx > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Lock size={14} className="text-[var(--libido-accent)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-[var(--libido-text)]/20 text-center py-6 font-bold">Nenhuma foto na galeria</p>
          )}
        </div>
      </div>

      
      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl p-6 max-w-xs w-full space-y-4">
            <h3 className="text-sm font-black text-[var(--libido-text)] uppercase text-center">Denunciar Perfil</h3>
            <textarea 
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Qual o motivo da denúncia?"
              className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-xs text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] h-24 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-white/5 border border-[var(--libido-border)] rounded-xl text-[9px] font-black text-[var(--libido-text)] uppercase tracking-widest">Cancelar</button>
              <button onClick={handleReport} disabled={isReporting} className="flex-1 py-3 bg-red-600 rounded-xl text-[9px] font-black text-[var(--libido-text)] uppercase tracking-widest disabled:opacity-50">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmBan && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl p-6 max-w-xs w-full text-center space-y-4">
            <Ban size={32} className="text-orange-400 mx-auto" />
            <h3 className="text-sm font-black text-[var(--libido-text)] uppercase">Banir {nickname}?</h3>
            <p className="text-[10px] text-[var(--libido-muted)] opacity-60 font-semibold">O usuário será impedido de acessar o app.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmBan(false)} className="flex-1 py-3 bg-white/5 border border-[var(--libido-border)] rounded-xl text-[9px] font-black text-[var(--libido-text)] uppercase tracking-widest">Cancelar</button>
              <button onClick={handleBanUser} className="flex-1 py-3 bg-orange-500 rounded-xl text-[9px] font-black text-black uppercase tracking-widest">Confirmar Ban</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl p-6 max-w-xs w-full text-center space-y-4">
            <Trash2 size={32} className="text-red-400 mx-auto" />
            <h3 className="text-sm font-black text-[var(--libido-text)] uppercase">Excluir {nickname}?</h3>
            <p className="text-[10px] text-[var(--libido-muted)] opacity-60 font-semibold">AÇÃO IRREVERSÍVEL. Todos os dados serão removidos.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDelete(false)} className="flex-1 py-3 bg-white/5 border border-[var(--libido-border)] rounded-xl text-[9px] font-black text-[var(--libido-text)] uppercase tracking-widest">Cancelar</button>
              <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 rounded-xl text-[9px] font-black text-[var(--libido-text)] uppercase tracking-widest">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
