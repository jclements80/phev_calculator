import { useState } from 'react'
import { useVehicleStore } from '../store/useVehicleStore'
import type { ChargerMode } from '../lib/calculations'
import {
  effectiveKwhRate,
  gasCostPerMile,
  evCostPerMile,
  breakevenGasPrice,
  breakevenKwhRate,
  estimatedChargeTime,
  fullChargeCost,
  getVerdict,
} from '../lib/calculations'
import ResultCard from './ResultCard'
import VerdictBanner from './VerdictBanner'
import BreakevenRow from './BreakevenRow'

// Format raw digit string as implied-decimal money value (e.g. "350" → "3.50")
function fmtDigits(digits: string): string {
  if (!digits) return ''
  const padded = digits.padStart(3, '0')
  const intPart = padded.slice(0, -2).replace(/^0+/, '') || '0'
  return `${intPart}.${padded.slice(-2)}`
}

function parseDigits(digits: string): number {
  return digits ? parseInt(digits, 10) / 100 : 0
}

function digitChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (s: string) => void
) {
  setter(e.target.value.replace(/\D/g, ''))
}

export default function Calculator() {
  const { profile } = useVehicleStore()

  const [gasPriceDigits, setGasPriceDigits]   = useState('')
  const [chargerMode, setChargerMode]          = useState<ChargerMode>('kwh')
  const [chargerRateDigits, setChargerRateDigits] = useState('')
  const [chargerKwDigits, setChargerKwDigits]  = useState('660')

  const gas   = parseDigits(gasPriceDigits)
  const rate  = parseDigits(chargerRateDigits)
  const kw    = parseDigits(chargerKwDigits)
  const hourlyReady = chargerMode === 'hourly' ? kw > 0 : true
  const ready = gas > 0 && rate > 0 && hourlyReady

  const kwhRate    = ready ? effectiveKwhRate(chargerMode, rate, kw) : 0
  const gasCpm     = ready ? gasCostPerMile(gas, profile.mpg) : 0
  const evCpm      = ready ? evCostPerMile(kwhRate, profile.milesPerKwh) : 0
  const verdict    = ready ? getVerdict(gasCpm, evCpm) : null

  const bkGas      = ready ? breakevenGasPrice(kwhRate, profile.milesPerKwh, profile.mpg) : 0
  const bkKwh      = ready ? breakevenKwhRate(gas, profile.mpg, profile.milesPerKwh) : 0
  const chargeHr   = ready && chargerMode === 'hourly' ? estimatedChargeTime(profile.batteryKwh, kw) : null
  const chargeCost = ready ? fullChargeCost(kwhRate, profile.batteryKwh) : 0

  const modeLabel = chargerMode === 'kwh' ? '$/kWh' : '$/hr'

  return (
    <div className="flex flex-col gap-4">
      {/* Gas Price */}
      <div className="bg-surface rounded-2xl p-4">
        <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">
          Gas Price
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-lg">$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="3.50"
            value={fmtDigits(gasPriceDigits)}
            onChange={e => digitChange(e, setGasPriceDigits)}
            className="flex-1 bg-transparent text-gas text-3xl font-bold placeholder-slate-700 focus:outline-none"
          />
          <span className="text-slate-500 text-sm">/gal</span>
        </div>
      </div>

      {/* Charger Rate */}
      <div className="bg-surface rounded-2xl p-4">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-3">
          {(['kwh', 'hourly'] as ChargerMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setChargerMode(mode)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chargerMode === mode
                  ? 'bg-ev/20 text-ev border border-ev/40'
                  : 'text-slate-500 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {mode === 'kwh' ? '$/kWh' : '$/hr'}
            </button>
          ))}
        </div>

        <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">
          Charger Rate ({modeLabel})
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-lg">$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={chargerMode === 'kwh' ? '0.35' : '1.50'}
            value={fmtDigits(chargerRateDigits)}
            onChange={e => digitChange(e, setChargerRateDigits)}
            className="flex-1 bg-transparent text-ev text-3xl font-bold placeholder-slate-700 focus:outline-none"
          />
          <span className="text-slate-500 text-sm">{modeLabel}</span>
        </div>

        {chargerMode === 'hourly' && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">
              Charger Capacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="6.60"
                value={fmtDigits(chargerKwDigits)}
                onChange={e => digitChange(e, setChargerKwDigits)}
                className="flex-1 bg-transparent text-slate-200 text-2xl font-semibold placeholder-slate-700 focus:outline-none"
              />
              <span className="text-slate-500 text-sm">kW</span>
            </div>
            {rate > 0 && kw > 0 && (
              <p className="text-slate-500 text-xs mt-1">
                = ${(rate / kw).toFixed(3)}/kWh
              </p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {ready && verdict !== null ? (
        <>
          {/* Cost per mile cards */}
          <div className="flex gap-3">
            <ResultCard
              label="Gas"
              cpm={gasCpm}
              color="gas"
              isWinner={verdict === 'gas'}
            />
            <ResultCard
              label="EV"
              cpm={evCpm}
              color="ev"
              isWinner={verdict === 'ev'}
            />
          </div>

          {/* Verdict banner */}
          <VerdictBanner verdict={verdict} gasCpm={gasCpm} evCpm={evCpm} />

          {/* Break-even + details */}
          <div className="flex flex-col gap-2">
            <BreakevenRow
              label="Gas break-even price"
              value={`$${bkGas.toFixed(2)}/gal`}
            />
            <BreakevenRow
              label="EV break-even rate"
              value={`$${bkKwh.toFixed(3)}/kWh`}
            />
            <BreakevenRow
              label="Full charge cost"
              value={`$${chargeCost.toFixed(2)} (${profile.batteryKwh} kWh)`}
            />
            {chargeHr !== null && (
              <BreakevenRow
                label="Est. charge time"
                value={`${chargeHr.toFixed(1)} hrs`}
              />
            )}
          </div>
        </>
      ) : (
        <div className="bg-surface rounded-2xl px-4 py-8 text-center text-slate-600 text-sm">
          Enter gas price and charger rate to compare
        </div>
      )}
    </div>
  )
}
