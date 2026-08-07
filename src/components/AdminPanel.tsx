import { useState, useEffect } from 'react';
import { Shield, Trash2, Ban, Eye, RotateCcw } from 'lucide-react';
import { User, Report, AdminLog } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { getAllUsers, updateUserProfile } from '../services/users';
import { getReports, getAdminLogs, createAdminLog } from '../services/admin';

interface AdminPanelProps {
  userId?: string;
  currentUser?: User | null;
}

export function AdminPanel({ userId, currentUser }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'logs'>('users');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const fetchedUsers = await getAllUsers();
    setUsers(fetchedUsers);
    const fetchedReports = await getReports();
    setReports(fetchedReports);
    const fetchedLogs = await getAdminLogs();
    setAdminLogs(fetchedLogs);
  };

  const handleBanUser = async (user: User) => {
    if (!userId) return;
    const targetUid = user.user_id || user.id;
    if (!targetUid) return;

    const newBanStatus = !user.isBanned;
    
    // Atualização otimista
    setUsers(prev => prev.map(u => (u.user_id === targetUid || u.id === targetUid) ? { ...u, isBanned: newBanStatus } : u));
    
    await updateUserProfile(targetUid, { is_banned: newBanStatus });
    await createAdminLog({
      adminId: userId,
      action: newBanStatus ? 'BAN_USER' : 'UNBAN_USER',
      targetId: targetUid
    });
    
    // Atualizar logs após a ação
    const newLogs = await getAdminLogs();
    setAdminLogs(newLogs);
  };

  const handleDeleteUser = async (user: User) => {
    if (!userId) return;
    const targetUid = user.user_id || user.id;
    if (!targetUid) return;

    const confirmDelete = window.confirm(`Atenção: Soft delete em ${user.nickname || user.name || 'User'}?`);
    if (confirmDelete) {
      // Atualização otimista
      setUsers(prev => prev.map(u => (u.user_id === targetUid || u.id === targetUid) ? { ...u, isDeleted: true } : u));
      
      await updateUserProfile(targetUid, { is_deleted: true });
      await createAdminLog({
        adminId: userId,
        action: 'DELETE_USER',
        targetId: targetUid
      });
      
      const newLogs = await getAdminLogs();
      setAdminLogs(newLogs);
    }
  };

  const handleRestoreUser = async (user: User) => {
    if (!userId) return;
    const targetUid = user.user_id || user.id;
    if (!targetUid) return;

    // Atualização otimista
    setUsers(prev => prev.map(u => (u.user_id === targetUid || u.id === targetUid) ? { ...u, isDeleted: false } : u));

    await updateUserProfile(targetUid, { is_deleted: false });
    await createAdminLog({
      adminId: userId,
      action: 'RESTORE_USER',
      targetId: targetUid
    });
    
    const newLogs = await getAdminLogs();
    setAdminLogs(newLogs);
  };

  return (
    <div className="flex flex-col flex-1 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto pb-[40px] no-scrollbar">
      <div className="px-4 py-6 border-b border-[var(--libido-border)]">
        <h2 className="text-2xl font-fraunces font-medium text-[var(--libido-accent)] flex items-center gap-2">
          <Shield className="w-6 h-6" />
          MASTER ADMIN
        </h2>
        <p className="text-sm text-[var(--libido-muted)] mt-1">Controle total de governança do app.</p>
      </div>

      <div className="flex px-4 pt-4 mb-4 gap-4">
        <button onClick={() => setActiveTab('users')} className={`pb-2 border-b-2 font-bold text-sm ${activeTab === 'users' ? 'border-[var(--libido-accent)] text-[var(--libido-text)]' : 'border-transparent text-[var(--libido-muted)]'}`}>Usuários</button>
        <button onClick={() => setActiveTab('reports')} className={`pb-2 border-b-2 font-bold text-sm ${activeTab === 'reports' ? 'border-[var(--libido-accent)] text-[var(--libido-text)]' : 'border-transparent text-[var(--libido-muted)]'}`}>Reports ({reports.length})</button>
        <button onClick={() => setActiveTab('logs')} className={`pb-2 border-b-2 font-bold text-sm ${activeTab === 'logs' ? 'border-[var(--libido-accent)] text-[var(--libido-text)]' : 'border-transparent text-[var(--libido-muted)]'}`}>Auditoria</button>
      </div>

      {activeTab === 'users' && (
        <div className="px-4 flex flex-col gap-3">
          {users.map(u => {
            const id = u.user_id || u.id;
            return (
            <div key={id || Math.random()} className={`bg-[var(--libido-surface)] border rounded-xl p-4 flex flex-col gap-3 ${u.isDeleted ? 'border-red-500/30 opacity-50' : u.isBanned ? 'border-orange-500/50' : 'border-[var(--libido-border)]'}`}>
              <div className="flex items-center gap-3">
                <ProtectedImage currentUser={currentUser} src={u.photo_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--libido-text)] truncate flex items-center gap-2">
                    {u.nickname || u.name || 'User'}
                    {(u.plan === 'admin' || u.plan === 'owner' || u.plan === 'moderator') && <span className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] text-[10px] font-black px-1.5 py-0.5 rounded">{u.plan.toUpperCase()}</span>}
                    {u.isBanned && <span className="bg-orange-500 text-[var(--libido-text)] text-[10px] font-black px-1.5 py-0.5 rounded">BANNED</span>}
                  </h3>
                  <p className="text-[var(--libido-muted)] text-xs truncate">Nº: {u.userNumber || '---'} | @{u.username || u.nickname}</p>
                </div>
              </div>
              
              {((currentUser?.plan === 'owner') || (currentUser?.plan === 'admin' && u.plan !== 'owner' && u.plan !== 'admin') || (currentUser?.plan === 'moderator' && u.plan !== 'owner' && u.plan !== 'admin' && u.plan !== 'moderator')) && (
                <div className="flex gap-2">
                  <button onClick={() => handleBanUser(u)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${u.isBanned ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                    <Ban className="w-4 h-4 mx-auto mb-1" />
                    {u.isBanned ? 'DESBANIR' : 'BANIR'}
                  </button>
                  {u.isDeleted ? (
                    <button onClick={() => handleRestoreUser(u)} className="flex-1 bg-green-500/10 text-green-500 py-2 text-xs font-bold rounded-lg hover:bg-green-500/20">
                      <RotateCcw className="w-4 h-4 mx-auto mb-1" /> RESTAURAR
                    </button>
                  ) : (
                    <button onClick={() => handleDeleteUser(u)} className="flex-1 bg-red-500/10 text-red-500 py-2 text-xs font-bold rounded-lg hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4 mx-auto mb-1" /> EXCLUIR
                    </button>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="px-4 flex flex-col gap-3">
          {reports.length === 0 ? (
            <p className="text-[var(--libido-muted)] text-center mt-10">Nenhuma denúncia no momento.</p>
          ) : (
            reports.map(r => (
              <div key={r.id} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl p-4">
                <p className="text-red-400 font-bold mb-1">Denúncia</p>
                <p className="text-[var(--libido-text)] text-sm mb-2">{r.reason}</p>
                <div className="text-xs text-[var(--libido-muted)]">
                  From: {r.reporterId} <br/> 
                  Target: {r.targetUserId} <br/>
                  Status: {r.status}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="px-4 flex flex-col gap-2">
          {adminLogs.slice().reverse().map(l => (
            <div key={l.id} className="bg-[var(--libido-surface)] px-3 py-2 rounded-lg flex items-center justify-between">
               <div>
                 <span className="font-bold text-[var(--libido-text)] text-xs">{l.action}</span>
                 <p className="text-[var(--libido-muted)] text-[10px]">Alvo: {l.targetId}</p>
               </div>
               <span className="text-[var(--libido-muted)] text-[10px]">{new Date(l.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
