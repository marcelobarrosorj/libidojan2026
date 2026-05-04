
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, Check, X, Clock, User, Filter, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { moderationService, ReportData } from '../services/moderationService';
import { isOwner } from '../services/authUtils';
import { cache } from '../services/authUtils';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await moderationService.getPendingReports();
    setReports(data || []);
    setLoading(false);
  };

  if (!isOwner(cache.userData)) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <ShieldAlert size={48} className="text-rose-500" />
            <h2 className="text-xl font-black text-white uppercase italic">Acesso Restrito</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px]">
                Somente a Matriz de Moderação tem autorização para acessar esta frequência.
            </p>
        </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Central de Governança</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Monitoramento de Integridade</p>
          </div>
        </div>
        <button onClick={loadReports} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Clock size={20} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-900/60 rounded-3xl border border-white/5">
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Denúncias Pendentes</p>
            <p className="text-2xl font-black text-white italic leading-none">{reports.length}</p>
        </div>
        <div className="p-4 bg-slate-900/60 rounded-3xl border border-white/5">
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Tempo de Resposta</p>
            <p className="text-2xl font-black text-emerald-500 italic leading-none">&lt; 4h</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
            <Filter size={12} /> Fila de Moderação
        </h3>
        
        {loading ? (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
        ) : reports.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <Check size={32} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Tudo limpo por aqui. A comunidade está segura.</p>
            </div>
        ) : (
            reports.map((report) => (
                <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="w-full p-4 rounded-3xl bg-slate-900 border border-white/5 hover:border-amber-500/30 transition-all text-left flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tighter truncate">
                            Report: {report.reason.replace('_', ' ')}
                        </h4>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">ID: {report.reported_user_id.substring(0, 8)}...</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </button>
            ))
        )}
      </div>

      <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
        <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Política de Privacidade de Matriz</h4>
        </div>
        <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
            As denúncias devem ser tratadas com imparcialidade. Lembre-se que o acesso à Matriz é auditado. O banimento injustificado reduz o Vouch Score do administrador.
        </p>
      </div>

      {/* Modal de Detalhes da Denúncia - Simplificado para o MVP */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] border border-white/10 p-8 space-y-6 relative">
                <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 text-slate-500"><X size={20}/></button>
                
                <div className="text-center space-y-2">
                     <div className="w-16 h-16 bg-rose-600/20 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/30 mx-auto">
                        <AlertTriangle size={32} />
                     </div>
                     <h3 className="text-lg font-black text-white uppercase italic">Analise de Violação</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mb-1">Motivo</p>
                        <p className="text-xs font-black text-rose-400 uppercase tracking-widest">{selectedReport.reason}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mb-1">Descrição</p>
                        <p className="text-[10px] text-slate-300 leading-relaxed">{selectedReport.description || 'Sem descrição adicional.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="h-14 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5 transition-all">Ignorar</button>
                    <button className="h-14 bg-rose-600 hover:bg-rose-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-900/20 transition-all">Banir Usuário</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
