
import { ProfileType, ProfileData, CoupleProfileData } from '../types';
import { User, Users, Ghost, Heart } from 'lucide-react';

function normalizeCoupleBaseNickname(mainNickname: string): string {
  const trimmed = (mainNickname || '').trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('casal ')) return trimmed.slice(6).trim();
  if (lower.startsWith('casal-')) return trimmed.slice(6).trim();
  if (lower.startsWith('casal_')) return trimmed.slice(6).trim();

  return trimmed;
}

export function generateNicknames(
  profileType: ProfileType,
  mainNickname: string
): { partner1: string; partner2: string } {
  const base = normalizeCoupleBaseNickname(mainNickname);

  switch (profileType) {
    case 'couple_fxm':
      return { partner1: `Sr ${base}`, partner2: `Sra ${base}` };
    case 'couple_mxm':
      return { partner1: `Sr ${base} 1`, partner2: `Sr ${base} 2` };
    case 'couple_fxf':
      return { partner1: `Sra ${base} 1`, partner2: `Sra ${base} 2` };
    default:
      return { partner1: base, partner2: '' };
  }
}

export const PROFILE_TYPE_META: Record<ProfileType, { label: string; icon: any; desc: string }> = {
  couple_fxm: { label: 'Casal Heterossexual', icon: Heart, desc: 'Perfil composto por Homem e Mulher' },
  man: { label: 'Homem', icon: User, desc: 'Perfil individual masculino' },
  woman: { label: 'Mulher', icon: User, desc: 'Perfil individual feminino' },
  couple_mxm: { label: 'Casal Masculino', icon: Users, desc: 'Perfil composto por dois Homens' },
  couple_fxf: { label: 'Casal Feminino', icon: Users, desc: 'Perfil composto por duas Mulheres' },
  trans_man: { label: 'Homem trans', icon: Ghost, desc: 'Identidade masculina trans' },
  trans_woman: { label: 'Mulher trans', icon: Ghost, desc: 'Identidade feminina trans' },
};

export function validateNickname(nickname: string): boolean {
  return nickname.trim().length >= 3;
}

export function validateData(profileType: ProfileType, data: ProfileData | CoupleProfileData): boolean {
  if (profileType.startsWith('couple')) {
    const coupleData = data as CoupleProfileData;
    const hasMainNick = !!coupleData.mainNickname && validateNickname(coupleData.mainNickname);
    return hasMainNick;
  }
  const singleData = data as ProfileData;
  return !!singleData.nickname && validateNickname(singleData.nickname);
}

export function validateConsent(accepted18Plus: boolean, acceptedTerms: boolean): boolean {
  return accepted18Plus && acceptedTerms;
}
