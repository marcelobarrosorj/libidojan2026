
import { log } from './authUtils';

/**
 * Libido Security Layer 2.0 - 2026
 * Sistema de Proteção e Rastreabilidade Forense
 */

export const initSecurityLayer = () => {
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
    // Gera um código forense baseado no ID e nickname
    const idFragment = user.id.split('-').pop()?.toUpperCase() || "ALPHA";
    const nick = user.nickname.substring(0, 3).toUpperCase();
    return `LIBIDO-PROTECT-${nick}-${idFragment}`;
};
