
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
    const idFragment = user.serialNumber || user.id.slice(-6).toUpperCase();
    const nick = user.nickname.toUpperCase();
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${nick} • ID:${idFragment} • SEC:${timestamp}`;
};
