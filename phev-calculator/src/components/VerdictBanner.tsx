import type { Verdict } from '../lib/calculations'

interface Props {
  verdict: Verdict
  gasCpm: number
  evCpm: number
}

const CONFIG = {
  ev:   { bg: 'bg-ev/10',   border: 'border-ev/30',   text: 'text-ev',   label: 'EV Wins'  },
  gas:  { bg: 'bg-gas/10',  border: 'border-gas/30',  text: 'text-gas',  label: 'Gas Wins' },
  even: { bg: 'bg-win/10',  border: 'border-win/30',  text: 'text-win',  label: 'Even'     },
}

export default function VerdictBanner({ verdict, gasCpm, evCpm }: Props) {
  const { bg, border, text, label } = CONFIG[verdict]
  const diff = Math.abs(gasCpm - evCpm)
  const pct  = (diff / Math.min(gasCpm, evCpm)) * 100

  return (
    <div className={`rounded-2xl border ${bg} ${border} px-5 py-4 flex flex-col gap-1`}>
      <span className={`text-2xl font-bold ${text}`}>{label}</span>
      <div className="text-slate-400 text-sm tabular-nums">
        {verdict === 'even' ? (
          <>Within {pct.toFixed(1)}% — {gasCpm.toFixed(2)}¢ gas vs {evCpm.toFixed(2)}¢ EV per mile</>
        ) : (
          <>
            {verdict === 'ev' ? 'EV' : 'Gas'} saves {diff.toFixed(2)}¢/mi ({pct.toFixed(1)}%) —{' '}
            {gasCpm.toFixed(2)}¢ gas vs {evCpm.toFixed(2)}¢ EV
          </>
        )}
      </div>
    </div>
  )
}
