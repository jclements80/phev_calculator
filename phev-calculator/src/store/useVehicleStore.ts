import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'

export interface VehicleProfile {
  mpg: number
  batteryKwh: number
  milesPerKwh: number
}

const DEFAULTS: VehicleProfile = {
  mpg: 24,
  batteryKwh: 17,
  milesPerKwh: 3.5,
}

const IDB_KEY = 'vehicle-profile'

interface VehicleStore {
  profile: VehicleProfile
  loaded: boolean
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<VehicleProfile>) => void
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  profile: DEFAULTS,
  loaded: false,

  loadProfile: async () => {
    const stored = await idbGet<VehicleProfile>(IDB_KEY)
    set({ profile: stored ?? DEFAULTS, loaded: true })
  },

  updateProfile: (updates) => {
    const next = { ...get().profile, ...updates }
    set({ profile: next })
    idbSet(IDB_KEY, next)
  },
}))
