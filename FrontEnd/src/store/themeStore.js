import { create } from 'zustand'

const useThemeStore = create((set) => ({
  dark: localStorage.getItem('theme') === 'dark',
  toggle: () => set((state) => {
    const next = !state.dark
    localStorage.setItem('theme', next ? 'dark' : 'light')
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    return { dark: next }
  }),
  init: () => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark'
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ dark: isDark })
  },
}))

export default useThemeStore
