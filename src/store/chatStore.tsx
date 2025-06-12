import { create } from 'zustand'

type ChatStore = {
  sessionID: string
  setSessionID: (id: string) => void
}

export const useChatStore = create<ChatStore>(set => ({
  sessionID: `guest-${Date.now()}`,
  setSessionID: (id: string) => set({ sessionID: id }),
}))
