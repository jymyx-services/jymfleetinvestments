import { create } from 'zustand'

export const useFleetStore = create((set) => ({
  fleets:       [],
  activeFleet:  null,
  balance:      null,
  unreadCount:  0,

  setFleets:      (fleets)      => set({ fleets }),
  setActiveFleet: (activeFleet) => set({ activeFleet }),
  setBalance:     (balance)     => set({ balance }),
  setUnreadCount: (count)       => set({ unreadCount: count }),

  incrementUnread: () => set(s => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread:     () => set({ unreadCount: 0 })
}))