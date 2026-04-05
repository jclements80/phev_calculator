import { useState, useEffect } from 'react'
import { useVehicleStore } from '../store/useVehicleStore'
import type { VehicleProfile } from '../store/useVehicleStore'

interface Props {
  onClose: () => void
}

interface Field {
  key: keyof VehicleProfile
  label: string
  unit: string
  step: number
  min: number
}

const FIELDS: Field[] = [
  { key: 'mpg',         label: 'Hybrid MPG',       unit: 'mpg',    step: 1,   min: 1 },
  { key: 'batteryKwh',  label: 'Battery Capacity', unit: 'kWh',    step: 0.1, min: 1 },
  { key: 'milesPerKwh', label: 'EV Efficiency',    unit: 'mi/kWh', step: 0.1, min: 0.1 },
]

export default function Settings({ onClose }: Props) {
  const { profile, updateProfile } = useVehicleStore()
  const [draft, setDraft] = useState<VehicleProfile>(profile)

  // Sync if profile changes externally (e.g. initial load)
  useEffect(() => { setDraft(profile) }, [profile])

  function handleChange(key: keyof VehicleProfile, raw: string) {
    const val = parseFloat(raw)
    if (!isNaN(val) && val > 0) {
      setDraft(prev => ({ ...prev, [key]: val }))
    } else {
      setDraft(prev => ({ ...prev, [key]: raw as unknown as number }))
    }
  }

  function handleSave() {
    // Only save fields that are valid numbers
    const valid: Partial<VehicleProfile> = {}
    for (const f of FIELDS) {
      const v = Number(draft[f.key])
      if (!isNaN(v) && v > 0) valid[f.key] = v
    }
    updateProfile(valid)
    onClose()
  }

  function handleReset() {
    updateProfile({ mpg: 24, batteryKwh: 17, milesPerKwh: 3.5 })
    onClose()
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Sheet / modal */}
      <div
        className="w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Vehicle Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {FIELDS.map(({ key, label, unit, step, min }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-1">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min={min}
                  step={step}
                  value={draft[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="flex-1 bg-bg border border-slate-700 rounded-lg px-3 py-2.5 text-white text-base focus:outline-none focus:border-accent"
                />
                <span className="text-slate-500 text-sm w-14">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
