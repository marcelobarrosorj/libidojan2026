
import { useEffect, useState } from 'react';

/**
 * Hook to implement anti-screenshot and content protection measures.
 * Note: Browser protections are limited but provide a layer of deterrence.
 */
export function useAntiPrint() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // 1. Block Right Click (Prevent Save Image As)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. We removed the window 'blur' trigger because it causes a black screen
    // when the user opens the file selection dialog for photo uploads.
    // Instead, we will focus on preventing keyboard shortcuts and right clicks.
    
    const handleBlur = () => {
      // Bloqueio imediato para evitar captura no App Switcher (iOS/Android)
      setIsBlurred(true);
      document.body.classList.add('security-overlay-active');
    };

    const handleFocus = () => {
      // Pequeno delay para garantir que o sistema de captura do OS já fechou
      setTimeout(() => {
        setIsBlurred(false);
        document.body.classList.remove('security-overlay-active');
      }, 600);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    // 3. Block common screenshot shortcuts (PrtScn, Meta+Shift+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Bloqueio de Teclas de Atalho (PrintScreen, Snipping Tool, Win+Shift+S)
      if (e.key === 'PrintScreen' || (isCmdOrCtrl && isShift && (e.key === 's' || e.key === 'S' || e.key === '4' || e.key === '3'))) {
        if (document.hasFocus()) {
          try {
            navigator.clipboard.writeText("CONTEÚDO PROTEGIDO - LIBIDO MATRIZ EXCLUSIVE");
          } catch (err) { }
        }
        handleBlur();
        setTimeout(handleFocus, 3000);
      }
    
      // Ctrl+P or Cmd+P (Print)
      if (isCmdOrCtrl && e.key === 'p') {
        e.preventDefault();
        handleBlur();
        setTimeout(handleFocus, 3000);
        return;
      }

      // Ctrl+S or Cmd+S (Save Page As)
      if (isCmdOrCtrl && e.key === 's') {
        e.preventDefault();
        return;
      }

      // Ctrl+C / Cmd+C (Copy) - Optional but good for protection
      if (isCmdOrCtrl && e.key === 'c') {
        // We don't necessarily block it but we deterrent
        console.warn("Copying restricted for security.");
      }

      // F12 or Cmd+Option+I (Inspect element) - also common for "print" via devtools
      if (e.key === 'F12' || (isCmdOrCtrl && e.altKey && (e.key === 'i' || e.key === 'I'))) {
        // Just deterrent
        console.warn("DevTools access restricted for security.");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('focus', handleFocus);
    // window.addEventListener('blur', handleBlur); // Removido conforme AGENTS.md
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. MutationObserver for self-healing security layers
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Detecta alterações críticas no body
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (!document.body.classList.contains('antiprint-active')) {
            document.body.classList.add('antiprint-active');
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    // Apply global CSS class to body for user-select prevention
    document.body.classList.add('antiprint-active');

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('focus', handleFocus);
      // window.removeEventListener('blur', handleBlur); // Removido conforme AGENTS.md
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      document.body.classList.remove('antiprint-active');
    };
  }, []);

  return isBlurred;
}
