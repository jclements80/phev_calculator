interface Props {
  /** What the losing side would need to equal the cheaper option */
  label: string
  value: string
}

export default function BreakevenRow({ label, value }: Props) {
  return (
    <div className="bg-surface rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-semibold tabular-nums text-sm">{value}</span>
    </div>
  )
}
