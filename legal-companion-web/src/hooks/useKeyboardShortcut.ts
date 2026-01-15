import { useEffect, useCallback } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  callback: () => void,
  enabled: boolean = true
): void {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrl, shift, alt, meta } = keyCombo;

      // Check if all modifiers match
      const ctrlMatch = ctrl === undefined || event.ctrlKey === ctrl;
      const shiftMatch = shift === undefined || event.shiftKey === shift;
      const altMatch = alt === undefined || event.altKey === alt;
      const metaMatch = meta === undefined || event.metaKey === meta;

      // Check if key matches (case-insensitive)
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        callback();
      }
    },
    [keyCombo, callback]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);
}

/**
 * Common keyboard shortcuts
 */
export function useCommandK(callback: () => void, enabled: boolean = true): void {
  useKeyboardShortcut({ key: 'k', meta: true }, callback, enabled);
  useKeyboardShortcut({ key: 'k', ctrl: true }, callback, enabled);
}

export function useEscape(callback: () => void, enabled: boolean = true): void {
  useKeyboardShortcut({ key: 'Escape' }, callback, enabled);
}

export function useEnter(callback: () => void, enabled: boolean = true): void {
  useKeyboardShortcut({ key: 'Enter' }, callback, enabled);
}
