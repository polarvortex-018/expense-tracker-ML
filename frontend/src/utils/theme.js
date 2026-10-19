// Theme management utility for Cash Buddy multi-theme engine

export const THEMES = [
  {
    id: 'pastel-dark',
    name: 'Pastel Dark',
    desc: 'Material 3 dark pastel aesthetic (Default)',
    icon: 'dark_mode',
    bg: '#0c0d14',
    card: '#141520',
    border: '#1f202e',
    primary: '#D4BFFF',
    isDark: true
  },
  {
    id: 'oled-black',
    name: 'OLED Pitch Black',
    desc: 'Pure #000000 background for AMOLED screens',
    icon: 'contrast',
    bg: '#000000',
    card: '#0d0d0d',
    border: '#1a1a1a',
    primary: '#D4BFFF',
    isDark: true
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate (Dark)',
    desc: 'Deep arctic slate blue & cyan accent',
    icon: 'ac_unit',
    bg: '#161b22',
    card: '#1c2128',
    border: '#2d333b',
    primary: '#88c0d0',
    isDark: true
  },
  {
    id: 'nordic-light',
    name: 'Nordic Light',
    desc: 'Cool arctic slate light theme',
    icon: 'wb_twilight',
    bg: '#f0f4f8',
    card: '#ffffff',
    border: '#d9e2ec',
    primary: '#0284c7',
    isDark: false
  },
  {
    id: 'emerald-midnight',
    name: 'Emerald Midnight (Dark)',
    desc: 'Deep forest green & mint accent',
    icon: 'forest',
    bg: '#091510',
    card: '#0f2019',
    border: '#1b3328',
    primary: '#6ee7b7',
    isDark: true
  },
  {
    id: 'emerald-light',
    name: 'Emerald Light',
    desc: 'Fresh mint & forest green light theme',
    icon: 'eco',
    bg: '#f0fdf4',
    card: '#ffffff',
    border: '#bbf7d0',
    primary: '#059669',
    isDark: false
  },
  {
    id: 'pastel-light',
    name: 'Pastel Light',
    desc: 'Soft warm light theme',
    icon: 'light_mode',
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    primary: '#7c3aed',
    isDark: false
  }
];

export function applyTheme(themeId) {
  const targetTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', targetTheme.id);
  
  // Update browser status bar / mobile meta theme-color tag
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', targetTheme.bg);
}
