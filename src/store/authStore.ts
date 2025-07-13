import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: any | null
  settings : any,
  setAuth: (token: string, user: any) => void
  setSettings: (settings: any) => void
  logout: () => void
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,
      settings : null,
      setAuth: (token, user) => set({ token, user }),
      setSettings : (settings) => set({settings}),
      logout: () => set({ token: null, user: null })
    }),
    {
      name: 'auth-storage' // this key will be used in localStorage
    }
  )
)
