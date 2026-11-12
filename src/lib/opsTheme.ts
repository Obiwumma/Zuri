import { useSyncExternalStore } from 'react';

const THEME_STORAGE_KEY = 'zuri-ops-theme';
const THEME_CHANGE_EVENT = 'zuri-ops-theme-change';

type OpsTheme = 'dark' | 'light';

function getThemeSnapshot(): OpsTheme {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function getServerThemeSnapshot(): OpsTheme {
  return 'dark';
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

export function useOpsTheme() {
  return useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
}

export function setOpsTheme(theme: OpsTheme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
