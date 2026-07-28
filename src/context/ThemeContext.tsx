import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'mcu-pink' | 'emerald' | 'dark' | 'platinum';

export interface ThemeOption {
  id: ThemeMode;
  nameTh: string;
  nameEn: string;
  badgeBg: string;
  colorHex: string;
  topbarBg: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'mcu-pink',
    nameTh: 'ชมพู-ทอง (MCU Pink & Gold)',
    nameEn: 'MCU Signature Pink',
    badgeBg: 'bg-rose-600',
    colorHex: '#be185d',
    topbarBg: '#451a03'
  },
  {
    id: 'emerald',
    nameTh: 'เขียวมรกต (Royal Emerald)',
    nameEn: 'Royal Emerald',
    badgeBg: 'bg-emerald-700',
    colorHex: '#047857',
    topbarBg: '#022c22'
  },
  {
    id: 'dark',
    nameTh: 'มืดหรูหรา (Midnight Obsidian)',
    nameEn: 'Midnight Dark',
    badgeBg: 'bg-slate-900',
    colorHex: '#0f172a',
    topbarBg: '#020617'
  },
  {
    id: 'platinum',
    nameTh: 'ขาวพลาตินัม (Platinum Academic)',
    nameEn: 'Platinum Clean',
    badgeBg: 'bg-blue-600',
    colorHex: '#1e40af',
    topbarBg: '#1e293b'
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'mcu_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
      if (saved && ['mcu-pink', 'emerald', 'dark', 'platinum'].includes(saved)) {
        return saved;
      }
    }
    return 'mcu-pink';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const currentThemeOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
