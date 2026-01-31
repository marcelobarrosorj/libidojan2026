
import React from 'react';
import { CoupleProfileData, ProfileType, ProfileData, Biotype, SexualOrientation, UserType } from '../types';
import { Input, Select, Checkbox } from './common/RegistrationUI';
import { generateNicknames } from '../services/profileUtils';
import { Sparkles, Heart, Fingerprint, Target, Palette, Eye, Moon, Scissors, User, Search, Mail } from 'lucide-react';

interface CoupleFieldsProps {
  profileType: ProfileType;
  data: CoupleProfileData;
  onChange: (field: string, value: any) => void;
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
  { value: SexualOrientation.HETERO, label: 'Hetero' },
  { value: SexualOrientation.BISSEXUAL, label: 'Bissexual' },
  { value: SexualOrientation.HOMOSSEXUAL, label: 'Homo' },
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

function updatePartner(setter: (field: string, value: any) => void, partner: 'partner1' | 'partner2') {
  return (subField: keyof ProfileData, value: any) => setter(`${partner}.${String(subField)}`, value);
}

export const CoupleFields: React.FC<CoupleFieldsProps> = ({ profileType, data, onChange }) => {
  const generated = generateNicknames(profileType, data.mainNickname);
  const partner1Nickname = data.customizeNicknames ? data.partner1.nickname : generated.partner1;
  const partner2Nickname = data.customizeNicknames ? data.partner2.nickname : generated.partner2;

  const titles =
    profileType === 'couple_fxm'
      ? { p1: 'Homem', p2: 'Mulher' }
      : profileType === 'couple_mxm'
        ? { p1: 'Parceiro 1', p2: 'Parceiro 2' }
        : { p1: 'Parceira 1', p2: 'Parceira 2' };

  const p1 = updatePartner(onChange, 'partner1');
  const p2 = updatePartner(onChange, 'partner2');

  const toggleLookingFor = (type: UserType) => {
    const current = data.lookingFor || [];
    if (current.includes(type)) {
      onChange('lookingFor', current.filter(t => t !== type));
    } else {
      onChange('lookingFor', [...current, type]);
    }
  };

  const renderPartnerFields = (title: string, partnerData: ProfileData, pUpdate: (subField: keyof ProfileData, value: any) => void, currentNick: string, iconColor: string) => (
    <div className="glass-card p-6 rounded-[2.5rem] border-white/5 space-y-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 style={{ marginTop: 0 }} className={`text-xl font-black uppercase tracking-tighter italic flex items-center gap-2 ${iconColor}`}>
          <User size={16} /> {title}
        </h3>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic truncate max-w-[120px]">{currentNick}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Fingerprint size={10}/> Altura</label>
          <Input type="number" value={partnerData.height?.toString() || ''} onChange={(v) => pUpdate('height', parseInt(v) || 0)} placeholder="CM" />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Target size={10}/> Biotipo</label>
          <Select value={partnerData.biotype || ''} onChange={(v) => pUpdate('biotype', v as Biotype)} options={biotypeOptions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Palette size={10}/> Pele</label>
          <Select value={partnerData.skinColor || ''} onChange={(v) => pUpdate('skinColor', v)} options={skinColorOptions} />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Heart size={10}/> Orientação</label>
          <Select value={partnerData.sexualPreference || ''} onChange={(v) => pUpdate('sexualPreference', v)} options={sexualPreferenceOptions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Moon size={10}/> Cor Cabelo</label>
          <Select value={partnerData.hairColor || ''} onChange={(v) => pUpdate('hairColor', v)} options={hairColorOptions} />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Scissors size={10}/> Tipo Cabelo</label>
          <Select value={partnerData.hairType || ''} onChange={(v) => pUpdate('hairType', v)} options={hairTypeOptions} />
        </div>
      </div>

      <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-600 uppercase ml-1 flex items-center gap-1"><Eye size={10}/> Cor dos Olhos</label>
          <Select value={partnerData.eyeColor || ''} onChange={(v) => pUpdate('eyeColor', v)} options={eyeColorOptions} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-pink uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
            <Heart size={12} fill="currentColor" /> Nickname Principal do Casal
          </label>
          <Input 
            value={data.mainNickname} 
            onChange={(v) => onChange('mainNickname', v)} 
            placeholder="EX: CASAL SAFIRA SP" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-pink uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
            <Mail size={12} /> E-mail da Conta
          </label>
          <Input 
            type="email"
            value={data.email || ''} 
            onChange={(v) => onChange('email', v)} 
            placeholder="EX: CASAL@DOMINIO.COM" 
          />
        </div>

        <div className="space-y-3 px-2">
            <label className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
              <Search size={14} /> O que o casal busca?
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

        <Checkbox 
          checked={data.customizeNicknames} 
          onChange={(c) => onChange('customizeNicknames', c)} 
          label="Personalizar nicknames individuais" 
        />
      </div>

      <div className="space-y-6">
        {renderPartnerFields(titles.p1, data.partner1, p1, partner1Nickname, "text-pink")}
        {renderPartnerFields(titles.p2, data.partner2, p2, partner2Nickname, "text-purple-500")}
      </div>
    </div>
  );
};
