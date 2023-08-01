import { useEffect } from 'react'

import { create } from 'zustand'

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

interface ThemeState {
  theme: Theme
  setTheme: (nextValue: Theme) => void
  toggleTheme: () => void
}

const getTheme = () => {
  const theme = `${window?.localStorage?.getItem('theme')}`
  if (['light', 'dark'].includes(theme)) return theme as Theme

  const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
  if (userMedia.matches) return Theme.DARK

  return Theme.LIGHT
}

export const useThemeState = create<ThemeState>((set) => ({
  theme: getTheme(),
  setTheme: (nextValue) => set((state) => ({ ...state, theme: nextValue })),
  toggleTheme: () =>
    set((state) => ({
      ...state,
      theme: state.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
    })),
}))

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeState()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
