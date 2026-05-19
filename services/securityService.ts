
import { log } from './authUtils';

/**
 * Libido Security Layer 2.0 - 2026
 * Sistema de Proteção e Rastreabilidade Forense
 */

export const initSecurityLayer = () => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) return;

    log('info', 'Libido Security: Protocolo de Blindagem Ativo.');
    
    // Bloqueia menu de contexto em todo o app
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Detecta teclas de atalho de captura (PrintScreen)
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText(''); // Limpa clipboard
            log('warn', 'Captura de tela detectada e neutralizada.');
        }
    });
};

export const getWatermarkData = (user: any) => {
    if (!user) return "USER_NOT_SYNCED";
    
    // Marcello: Identidade dinâmica com override tático para o proprietário
    let nickname = String(user.nickname || user.name || 'Agente').toUpperCase();
    if (nickname === 'MARCELO' || nickname === 'AGENTE' || nickname === 'USER_LIBIDO' || !user.nickname) {
        nickname = 'CASAL BEIJO';
    }
    const serial = String(user.serialNumber || '000001');
    
    return `${nickname} | ID: ${serial}`;
};
