import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

export type ColorMode = 'system' | 'light' | 'dark';
export const DISPLAY_STORAGE_KEY = 'kiwi-demo-display-v1';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function readPreferences(): { mode: ColorMode; animation: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(DISPLAY_STORAGE_KEY) || 'null');
    return { mode: ['system', 'light', 'dark'].includes(saved?.mode) ? saved.mode : 'system', animation: saved?.animation !== false };
  } catch { return { mode: 'system', animation: true }; }
}

function useMediaPreference(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

type Preferences = {
  mode: ColorMode; scheme: 'light' | 'dark'; animation: boolean; reducedMotion: boolean;
  motionAllowed: boolean; saved: boolean;
  setMode: (mode: ColorMode) => void; setAnimation: (enabled: boolean) => void;
};
const Context = createContext<Preferences | null>(null);

export function DisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [saved, setSaved] = useState(true);
  const deviceDark = useMediaPreference(DARK_QUERY);
  const reducedMotion = useMediaPreference(MOTION_QUERY);
  const scheme = preferences.mode === 'system' ? deviceDark ? 'dark' : 'light' : preferences.mode;
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = scheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', scheme === 'dark' ? '#191816' : '#f6f4f3');
  }, [scheme]);
  useEffect(() => {
    try { localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(preferences)); setSaved(true); }
    catch { setSaved(false); }
  }, [preferences]);
  return <Context.Provider value={{ ...preferences, scheme, reducedMotion, saved,
    motionAllowed: preferences.animation && !reducedMotion,
    setMode: mode => setPreferences(previous => ({ ...previous, mode })),
    setAnimation: animation => setPreferences(previous => ({ ...previous, animation })),
  }}>{children}</Context.Provider>;
}

export function useDisplayPreferences() {
  const context = useContext(Context);
  if (!context) throw new Error('Missing DisplayPreferencesProvider');
  return context;
}
