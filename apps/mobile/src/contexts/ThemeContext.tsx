// ============================================================
// mobile/src/contexts/ThemeContext.tsx
//
// Dark mode / light mode theme context. Reads system preference,
// stores user preference in AsyncStorage, and provides a toggle.
// ============================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@becandid/theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  mode: ThemeMode;
  toggle: () => void;
  setTheme: (theme: ThemeMode) => void;
  colors: typeof lightColors;
}

// ── Color palettes ──────────────────────────────────────────

const lightColors = {
  primary: '#226779',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  border: '#e5e7eb',
  tabBar: '#ffffff',
  tabBarBorder: 'transparent',
  statusBar: 'dark' as const,
  card: '#ffffff',
  cardBorder: '#e5e7eb',
  inputBg: '#ffffff',
  separator: '#f3f4f6',
  statCardBg: '#f9fafb',
} as const;

const darkColors = {
  primary: '#3ba5be',
  background: '#0f0f0f',
  surface: '#1c1c1e',
  onSurface: '#f5f5f5',
  onSurfaceVariant: '#9ca3af',
  error: '#f87171',
  emerald: '#34d399',
  border: '#2c2c2e',
  tabBar: '#1c1c1e',
  tabBarBorder: '#2c2c2e',
  statusBar: 'light' as const,
  card: '#1c1c1e',
  cardBorder: '#2c2c2e',
  inputBg: '#2c2c2e',
  separator: '#2c2c2e',
  statCardBg: '#232323',
} as const;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  // Load stored preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setMode(stored);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setMode(theme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const value = useMemo(
    () => ({ isDark, mode, toggle, setTheme, colors }),
    [isDark, mode, toggle, setTheme, colors],
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
