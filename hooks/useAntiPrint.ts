
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
        navigator.clipboard.writeText(""); // Clear clipboard
        alert("Captura de tela proibida neste ambiente seguro.");
        setIsBlurred(true);
      }

      // Cmd+Shift+4 / Ctrl+Shift+S detection is tricky in browser, but we can catch some
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '4')) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
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
