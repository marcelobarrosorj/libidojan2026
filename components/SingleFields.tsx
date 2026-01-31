
import React from 'react';
import { ProfileData, Biotype, SexualOrientation, UserType } from '../types';
import { Input, Select } from './common/RegistrationUI';
import { Sparkles, User, Heart, Fingerprint, Target, Eye, Moon, Palette, Scissors, Search, Mail } from 'lucide-react';

interface SingleFieldsProps {
  data: ProfileData;
  onChange: (field: keyof ProfileData, value: any) => void;
}

const eyeColorOptions = [
  { value: '', label: 'OLHOS: SELECIONE...' },
  { value: 'Castanhos', label: 'Castanhos' },
  { value: 'Azuis', label: 'Azuis' },
  { value: 'Verdes', label: 'Verdes' },
  { value: 'Mel', label: 'Mel' },
];

const hairColorOptions = [
  { value: '', label: 'COR CABELO: SELECIONE...' },
  { value: 'Pretos', label: 'Pretos' },
  { value: 'Castanhos', label: 'Castanhos' },
  { value: 'Loiros', label: 'Loiros' },
  { value: 'Ruivos', label: 'Ruivos' },
  { value: 'Grisalhos', label: 'Grisalhos' },
  { value: 'Coloridos', label: 'Coloridos' },
  { value: 'Careca', label: 'Careca' },
];

const hairTypeOptions = [
  { value: '', label: 'TIPO CABELO: SELECIONE...' },
  { value: 'Liso', label: 'Liso' },
  { value: 'Ondulado', label: 'Ondulado' },
  { value: 'Cacheado', label: 'Cacheado' },
  { value: 'Crespo', label: 'Crespo' },
  { value: 'Raspado', label: 'Raspado' },
];

const skinColorOptions = [
  { value: '', label: 'PELE: SELECIONE...' },
  { value: 'Branca', label: 'Branca' },
  { value: 'Parda', label: 'Parda' },
  { value: 'Negra', label: 'Negra' },
  { value: 'Amarela', label: 'Amarela' },
  { value: 'Indígena', label: 'Indígena' },
];

const sexualPreferenceOptions = [
  { value: '', label: 'ORIENTAÇÃO: SELECIONE...' },
  { value: SexualOrientation.HETERO, label: 'Heterossexual' },
  { value: SexualOrientation.BISSEXUAL, label: 'Bissexual' },
  { value: SexualOrientation.HOMOSSEXUAL, label: 'Homossexual' },
];

const biotypeOptions = [
  { value: '', label: 'BIOTIPO: SELECIONE...' },
  { value: Biotype.PADRAO, label: 'Normal' },
  { value: Biotype.MAGRO, label: 'Magro(a)' },
  { value: Biotype.ATLETICO, label: 'Atlético(a)' },
  { value: Biotype.CURVILINEO, label: 'Curvilíneo(a)' },
  { value: Biotype.PLUS_SIZE, label: 'Plus Size' },
  { value: Biotype.DEFINIDO, label: 'Definido(a)' },
];

export const SingleFields: React.FC<SingleFieldsProps> = ({ data, onChange }) => {
  const toggleLookingFor = (type: UserType) => {
    const current = data.lookingFor || [];
    if (current.includes(type)) {
      onChange('lookingFor', current.filter(t => t !== type));
    } else {
      onChange('lookingFor', [...current, type]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-pink" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Codinome</label>
          </div>
          <Input 
            value={data.nickname} 
            onChange={(v) => onChange('nickname', v)} 
            placeholder="SEU NICKNAME (OBRIGATÓRIO)" 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={14} className="text-pink" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">E-mail de Cadastro</label>
          </div>
          <Input 
            type="email"
            value={data.email || ''} 
            onChange={(v) => onChange('email', v)} 
            placeholder="EX: NOME@DOMINIO.COM" 
          />
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border-white/5 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Sparkles size={14} className="text-pink animate-pulse" />
          <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sincronização Física</h5>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2">
              <Search size={14} /> O que você busca?
            </label>
            <div className="flex gap-2">
              {Object.values(UserType).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleLookingFor(type)}
                  className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    (data.lookingFor || []).includes(type) 
                    ? 'bg-pink border-pink text-white shadow-lg' 
                    : 'bg-slate-900 border-white/5 text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Heart size={14} className="text-pink" /> Preferência Sexual</label>
            <Select value={data.sexualPreference || ''} onChange={(v) => onChange('sexualPreference', v as SexualOrientation)} options={sexualPreferenceOptions} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Fingerprint size={14} /> Altura (cm)</label>
              <Input type="number" value={data.height?.toString() || ''} onChange={(v) => onChange('height', parseInt(v) || 0)} placeholder="EX: 175" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Target size={14} /> Biotipo</label>
              <Select value={data.biotype || ''} onChange={(v) => onChange('biotype', v as Biotype)} options={biotypeOptions} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Palette size={14} /> Pele</label>
              <Select value={data.skinColor || ''} onChange={(v) => onChange('skinColor', v)} options={skinColorOptions} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Eye size={14} /> Olhos</label>
              <Select value={data.eyeColor || ''} onChange={(v) => onChange('eyeColor', v)} options={eyeColorOptions} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Moon size={14} /> Cor Cabelo</label>
              <Select value={data.hairColor || ''} onChange={(v) => onChange('hairColor', v)} options={hairColorOptions} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase ml-2 flex items-center gap-2"><Scissors size={14} /> Tipo Cabelo</label>
              <Select value={data.hairType || ''} onChange={(v) => onChange('hairType', v)} options={hairTypeOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
