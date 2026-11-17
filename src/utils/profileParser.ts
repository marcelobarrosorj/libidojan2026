export function sanitizarPerfil(u: any) {
  if (!u) return { nome: 'Membro Liberal', bioLimpa: '', isCasal: false, isHomem: false, isMulher: false, orientacao: 'Liberal', statusLabel: 'Membro', foto: null };

  let rawBio = u.bio || u.description || '';
  let isCasal = u.couple_profile === true || u.is_couple === true;
  let cleanBio = '';
  let genderStr = String(u.gender || '').toLowerCase();
  let orientStr = String(u.sexual_orientation || u.orientation || u.preferences || '').toLowerCase();
  let statusStr = String(u.relationship_status || u.type || u.profile_type || '').toLowerCase();

  if (typeof rawBio === 'string' && rawBio.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawBio);
      if (parsed.isCouple === true || parsed.couple === true || parsed.is_couple === true) isCasal = true;
      if (parsed.gender) genderStr = String(parsed.gender).toLowerCase();
      if (parsed.orientation) orientStr = String(parsed.orientation).toLowerCase();
      if (parsed.relationship_status) statusStr = String(parsed.relationship_status).toLowerCase();
      cleanBio = parsed.description || parsed.bio || parsed.about || parsed.text || '';
    } catch (e) {
      cleanBio = rawBio;
    }
  } else if (typeof rawBio === 'object' && rawBio !== null) {
    if (rawBio.isCouple === true || rawBio.couple === true || rawBio.is_couple === true) isCasal = true;
    if (rawBio.gender) genderStr = String(rawBio.gender).toLowerCase();
    if (rawBio.orientation) orientStr = String(rawBio.orientation).toLowerCase();
    cleanBio = rawBio.description || rawBio.bio || rawBio.about || rawBio.text || '';
  } else {
    cleanBio = rawBio;
  }

  const combined = `${statusStr} ${genderStr} ${u.type || ''} ${u.profile_type || ''} ${cleanBio}`.toLowerCase();
  if (combined.includes('casal') || combined.includes('casais') || combined.includes('couple') || combined.includes('casad')) {
    isCasal = true;
  }

  const isHomem = !isCasal && (genderStr.includes('homem') || genderStr.includes('male') || genderStr.includes('solteiro') || statusStr.includes('solteiro'));
  const isMulher = !isCasal && (genderStr.includes('mulher') || genderStr.includes('female') || genderStr.includes('solteira') || statusStr.includes('solteira') || genderStr.includes('feminina'));

  const statusLabel = isCasal ? 'Casal' : (isHomem ? 'Solteiro (Ele)' : (isMulher ? 'Solteira (Ela)' : 'Membro'));

  return {
    ...u,
    nome: u.nickname || u.name || u.username || 'Perfil Liberal',
    bioLimpa: cleanBio || 'Disponível para conexões liberais com sigilo e respeito.',
    isCasal,
    isHomem,
    isMulher,
    orientacao: u.sexual_orientation || u.orientation || 'Liberal',
    statusLabel,
    foto: u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]) || null
  };
}