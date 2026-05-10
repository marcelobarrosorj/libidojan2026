
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
    
    const handleFocus = () => {
      setIsBlurred(false);
    };

    // 3. Block common screenshot shortcuts (PrtScn, Meta+Shift+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen Key
      if (e.key === 'PrintScreen') {
        try {
          navigator.clipboard.writeText(""); // Clear clipboard if possible
        } catch (err) {
          // ignore
        }
        setIsBlurred(true);
      }

      // Cmd+Shift+S / Cmd+Shift+4 / Ctrl+Shift+S
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      
      if (isCmdOrCtrl && isShift && (e.key === 's' || e.key === 'S' || e.key === '4' || e.key === '3')) {
        setIsBlurred(true);
        // We let it stay blurred if it's a critical capture attempt, or auto-reset after 5s
        setTimeout(() => setIsBlurred(false), 5000);
      }

      // Ctrl+S or Cmd+S (Save Page As)
      if (isCmdOrCtrl && e.key === 's') {
        e.preventDefault();
        return;
      }

      // F12 or Cmd+Option+I (Inspect element) - also common for "print" via devtools
      if (e.key === 'F12' || (isCmdOrCtrl && e.altKey && (e.key === 'i' || e.key === 'I'))) {
        // Just deterrent
        console.warn("DevTools access restricted for security.");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);

    // Apply global CSS class to body for user-select prevention
    document.body.classList.add('antiprint-active');

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('antiprint-active');
    };
  }, []);

  return isBlurred;
}
