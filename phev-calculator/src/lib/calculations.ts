/** All inputs assumed to be valid positive numbers. */

export type ChargerMode = 'kwh' | 'hourly'

/** Gas cost in cents per mile */
export function gasCostPerMile(gasPrice: number, mpg: number): number {
  return (gasPrice / mpg) * 100
}

/** EV cost in cents per mile given a $/kWh rate */
export function evCostPerMile(kwhRate: number, miPerKwh: number): number {
  return (kwhRate / miPerKwh) * 100
}

/** Convert an hourly charger rate to $/kWh using the charger's power output */
export function hourlyRateToKwh(hourlyRate: number, chargerKw: number): number {
  return hourlyRate / chargerKw
}

/** Effective $/kWh for the selected charger mode */
export function effectiveKwhRate(
  mode: ChargerMode,
  rate: number,
  chargerKw: number
): number {
  return mode === 'hourly' ? hourlyRateToKwh(rate, chargerKw) : rate
}

/** Gas price at which gas and EV costs are exactly equal */
export function breakevenGasPrice(kwhRate: number, miPerKwh: number, mpg: number): number {
  return (kwhRate / miPerKwh) * mpg
}

/** kWh rate at which EV and gas costs are exactly equal */
export function breakevenKwhRate(gasPrice: number, mpg: number, miPerKwh: number): number {
  return (gasPrice / mpg) * miPerKwh
}

/** Estimated charge time in hours with 15% real-world overhead */
export function estimatedChargeTime(batteryKwh: number, chargerKw: number): number {
  return (batteryKwh / chargerKw) * 1.15
}

/** Full charge cost in dollars */
export function fullChargeCost(kwhRate: number, batteryKwh: number): number {
  return kwhRate * batteryKwh
}

export type Verdict = 'ev' | 'gas' | 'even'

/** 'even' if within 5% of the cheaper option, otherwise the cheaper option wins */
export function getVerdict(gasCpm: number, evCpm: number): Verdict {
  const diff = Math.abs(gasCpm - evCpm)
  const threshold = Math.min(gasCpm, evCpm) * 0.05
  if (diff <= threshold) return 'even'
  return gasCpm < evCpm ? 'gas' : 'ev'
}
