interface Props {
  label: string
  cpm: number
  color: 'gas' | 'ev'
  isWinner: boolean
}

const COLOR = {
  gas: { text: 'text-gas', ring: 'ring-gas/40', badge: 'bg-gas/10 text-gas' },
  ev:  { text: 'text-ev',  ring: 'ring-ev/40',  badge: 'bg-ev/10 text-ev'   },
}

export default function ResultCard({ label, cpm, color, isWinner }: Props) {
  const c = COLOR[color]
  return (
    <div className={`flex-1 bg-surface rounded-2xl p-4 flex flex-col gap-1 ${isWinner ? `ring-2 ${c.ring}` : ''}`}>
      <span className={`text-xs font-medium uppercase tracking-widest ${c.text}`}>{label}</span>
      <span className={`text-4xl font-bold tabular-nums ${c.text}`}>
        {cpm.toFixed(1)}<span className="text-xl font-normal">¢</span>
      </span>
      <span className="text-slate-500 text-xs">per mile</span>
    </div>
  )
}
