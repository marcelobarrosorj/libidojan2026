
import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, MapPin, Zap, Users, Plus, Star, ShieldCheck, 
  Sparkles, Clock, ChevronRight, X, Info, Building2, Send, 
  Ticket, QrCode, UserCheck, CheckCircle2, Crown, Loader2
} from 'lucide-react';
import ActionButton from './common/ActionButton';
import { showNotification, cache, saveUserData, syncCaches, handleButtonAction } from '../services/authUtils';
import { Input, Select } from './common/RegistrationUI';
import { EventItem, TrustLevel } from '../types';

const MOCK_EVENTS_INITIAL: EventItem[] = [
  {
    id: 'e1',
    title: 'Midnight Masquerade',
    organizer: 'Vogue Club',
    category: 'Festa',
    date: 'Hoje, 23:00',
    vibeScore: 98,
    image: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=800',
    dressCode: 'Máscara & Black Tie',
    audience: 'Só Casais',
    description: 'Uma noite de mistério e elegância absoluta no coração da cidade. Exclusividade garantida para casais que buscam uma experiência sensorial única.',
    confirmedGuests: [
      { id: 'm1', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', trust: TrustLevel.OURO },
      { id: 'm2', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', trust: TrustLevel.PRATA },
      { id: 'm4', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', trust: TrustLevel.OURO }
    ]
  },
  {
    id: 'e2',
    title: 'Secret Terrace Night',
    organizer: 'Lounge Privado SP',
    category: 'Social',
    date: 'Amanhã, 20:00',
    vibeScore: 85,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    dressCode: 'Casual Elegante',
    audience: 'Casais & Single Fem',
    description: 'Encontro descontraído no terraço mais secreto da Vila Madalena. Drinks artesanais e networking lifestyle.',
    confirmedGuests: [
      { id: 'm5', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100', trust: TrustLevel.PRATA }
    ]
  }
];

const MOCK_PARTNERS: EventItem[] = [
  {
      id: 'p1',
      title: 'Vogue Club Elite',
      organizer: 'Vogue Club',
      category: 'Parceiro',
      date: 'Aberto Hoje',
      vibeScore: 95,
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      audience: 'Membros Ouro',
      description: 'Estabelecimento parceiro 100% verificado. Ambiente seguro e discreto.',
      isVerifiedPartner: true,
      confirmedGuests: []
  },
  {
      id: 'p2',
      title: 'Lust Hotel Boutique',
      organizer: 'Lust Group',
      category: 'Parceiro',
      date: '24 Horas',
      vibeScore: 92,
      image: 'https://images.unsplash.com/photo-1544124499-58ec120d82be?w=800',
      audience: 'Todos os Públicos',
      description: 'Hospedagem temática para experiências lifestyle com total privacidade.',
      isVerifiedPartner: true,
      confirmedGuests: []
  }
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS_INITIAL);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'partners'>('events');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Social');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    syncCaches();
  }, []);

  const hasRSVP = (eventId: string) => {
    return cache.userData?.rsvps?.includes(eventId);
  };

  const handleRSVP = async (event: EventItem) => {
    if (hasRSVP(event.id)) {
      setShowTicket(true);
      return;
    }

    await handleButtonAction(
      'EVENT_RSVP',
      async () => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 1500));
        
        const currentData: any = cache.userData || {};
        const updatedRSVPs = [...(currentData.rsvps || []), event.id];
        
        saveUserData({
          ...currentData,
          rsvps: updatedRSVPs,
          xp: (currentData.xp || 0) + 100
        });

        return true;
      },
      {
        setLoading: setIsProcessing,
        onSuccess: () => {
          showNotification('RSVP Confirmado! Seu ticket foi gerado.', 'success');
          setShowTicket(true);
        }
      }
    );
  };

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newDate.trim()) {
      showNotification('Preencha os campos obrigatórios.', 'error');
      return;
    }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const newEvent: EventItem = {
      id: `e-${Date.now()}`,
      title: newTitle,
      organizer: 'Você',
      category: newCat as any,
      date: newDate,
      vibeScore: 100,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      audience: 'Todos',
      description: 'Evento criado pelo usuário.',
      confirmedGuests: []
    };
    setEvents([newEvent, ...events]);
    setIsProcessing(false);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDate('');
    showNotification('Experiência publicada com sucesso!', 'success');
  };

  const displayList = activeTab === 'events' ? events : MOCK_PARTNERS;

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in bg-[#050505] min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-3xl font-black font-outfit text-white tracking-tighter italic flex items-center gap-3">
            <CalendarDays size={26} className="text-pink" />
            THE CIRCLE
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Rede de Experiências</p>
        </div>
      </div>

      <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5">
        <button onClick={() => setActiveTab('events')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-pink text-white shadow-lg shadow-pink/30' : 'text-slate-500'}`}>Eventos</button>
        <button onClick={() => setActiveTab('partners')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'partners' ? 'bg-pink text-white shadow-lg shadow-pink/30' : 'text-slate-500'}`}>Locais Verificados</button>
      </div>

      <div className="space-y-6">
        {displayList.map((event) => (
          <div key={event.id} onClick={() => setSelectedEvent(event)} className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl relative group cursor-pointer">
            <div className="aspect-[16/9] relative">
              <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {event.isVerifiedPartner && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full border border-amber-600 flex items-center gap-1.5 shadow-xl">
                    <Crown size={12} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Parceiro Elite</span>
                  </div>
              )}

              {hasRSVP(event.id) && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full border border-green-400 flex items-center gap-1.5 shadow-xl animate-in zoom-in">
                  <CheckCircle2 size={12} fill="currentColor" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Confirmado</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-black text-white font-outfit uppercase italic tracking-tight">{event.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase ${event.isVerifiedPartner ? 'bg-amber-500 text-black' : 'bg-pink/80 text-white'}`}>{event.category}</span>
                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {event.date}</span>
                </div>
              </div>
            </div>
            
            <div className="p-5 flex items-center justify-between bg-slate-900/40">
              <div className="flex -space-x-3 overflow-hidden">
                {event.confirmedGuests?.map((g, i) => (
                  <img key={i} src={g.avatar} className={`w-8 h-8 rounded-full border-2 border-slate-950 object-cover ${g.trust === TrustLevel.OURO ? 'border-amber-500' : ''}`} />
                ))}
                {event.confirmedGuests && event.confirmedGuests.length > 0 && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-400">
                    +{Math.floor(Math.random() * 20)}
                  </div>
                )}
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${event.isVerifiedPartner ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400'}`}>
                {event.isVerifiedPartner ? <Building2 size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RSVP Detail Modal */}
      {selectedEvent && !showTicket && (
        <div className="fixed inset-0 z-[150] bg-black/98 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto pb-10">
           <div className="relative aspect-video">
              <img src={selectedEvent.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"><X size={24} /></button>
           </div>

           <div className="px-8 -mt-10 relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white font-outfit uppercase italic tracking-tighter leading-none">{selectedEvent.title}</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{selectedEvent.organizer}</p>
                   </div>
                   <div className="bg-pink/10 p-3 rounded-2xl border border-pink/20 text-center min-w-[70px]">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">VIBE</span>
                      <span className="text-lg font-black text-pink">{selectedEvent.vibeScore}%</span>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <span className="px-3 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Users size={12} /> {selectedEvent.audience}</span>
                   {selectedEvent.dressCode && <span className="px-3 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} /> {selectedEvent.dressCode}</span>}
                   <span className="px-3 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> {selectedEvent.date}</span>
                </div>
              </div>

              <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">O QUE ESPERAR</h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedEvent.description}"</p>
              </div>

              {selectedEvent.confirmedGuests && selectedEvent.confirmedGuests.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">THE GUESTLIST ({selectedEvent.confirmedGuests.length} CONFIRMADOS)</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {selectedEvent.confirmedGuests.map((g, i) => (
                      <div key={i} className="flex-shrink-0 relative">
                        <img src={g.avatar} className={`w-12 h-12 rounded-2xl object-cover border-2 ${g.trust === TrustLevel.OURO ? 'border-amber-500' : 'border-slate-800'}`} />
                        {g.trust === TrustLevel.OURO && <Crown size={10} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <ActionButton 
                  label={hasRSVP(selectedEvent.id) ? "Ver Meu Vibe Ticket" : "Confirmar RSVP"} 
                  onClick={() => handleRSVP(selectedEvent)} 
                  loading={isProcessing}
                  icon={hasRSVP(selectedEvent.id) ? <Ticket size={20} /> : <UserCheck size={20} />} 
                />
              </div>
           </div>
        </div>
      )}

      {/* Ticket Digital Modal */}
      {showTicket && selectedEvent && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-sm space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-white font-outfit uppercase italic tracking-tighter">VIBE TICKET</h3>
              <p className="text-[10px] text-pink font-black uppercase tracking-[0.4em]">Confirmação de Matriz</p>
            </div>

            <div className="bg-white rounded-[3rem] p-8 space-y-6 text-center shadow-[0_0_50px_rgba(255,20,147,0.3)] relative overflow-hidden group">
               {/* Decorators de Ticket */}
               <div className="absolute top-0 left-0 w-8 h-8 bg-black rounded-br-full" />
               <div className="absolute top-0 right-0 w-8 h-8 bg-black rounded-bl-full" />
               <div className="absolute bottom-0 left-0 w-8 h-8 bg-black rounded-tr-full" />
               <div className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-tl-full" />
               
               <div className="pt-4">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                      <QrCode size={180} className="text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t-2 border-dashed border-slate-200 pt-6">
                    <div className="flex justify-between items-center text-left">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">EVENTO</p>
                          <p className="text-sm font-black text-slate-900 uppercase italic truncate max-w-[150px]">{selectedEvent.title}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DATA</p>
                          <p className="text-sm font-black text-slate-900 uppercase">{selectedEvent.date.split(',')[0]}</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-center text-left">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ACESSO</p>
                          <p className="text-sm font-black text-pink uppercase italic">{cache.userData?.nickname}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">STATUS</p>
                          <p className="text-sm font-black text-green-600 uppercase">VALIDADO</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <ActionButton 
                  label="Salvar na Carteira" 
                  onClick={() => {
                    showNotification('Ticket salvo na galeria.', 'success');
                    setShowTicket(false);
                  }} 
                  icon={<Sparkles size={18} />}
               />
               <button 
                  onClick={() => {
                    setShowTicket(false);
                    setSelectedEvent(null);
                  }}
                  className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest"
               >
                  Fechar Ticket
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm glass-card rounded-[3rem] p-8 border-pink/20 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white font-outfit uppercase italic tracking-tighter">Nova Experiência</h3>
                    <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-full text-slate-400"><X size={18} /></button>
                </div>
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Título do Evento</label>
                        <Input value={newTitle} onChange={setNewTitle} placeholder="NOME DO EVENTO" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Categoria</label>
                        <Select value={newCat} onChange={setNewCat} options={[{value:'Social', label:'Encontro Social'}, {value:'Festa', label:'Festa Privada'}, {value:'Clube', label:'Visita a Clube'}]} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Data e Hora</label>
                        <Input value={newDate} onChange={setNewDate} placeholder="SÁBADO, 22:00" />
                    </div>
                    <ActionButton 
                        label="Lançar no Círculo" 
                        onClick={handleCreateEvent} 
                        loading={isProcessing} 
                        icon={<Send size={18} />} 
                    />
                </div>
              </div>
          </div>
      )}

      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-16 h-16 gradient-libido rounded-full flex items-center justify-center text-white shadow-2xl shadow-pink/40 hover:scale-110 active:scale-95 transition-all group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
