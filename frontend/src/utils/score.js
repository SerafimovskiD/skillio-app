export const toPercent = (score) => Math.max(0, Math.min(100, Math.round(score * 100)))

export const scoreStyle = (pct) => {
    if (pct >= 70) return { text: 'text-green-700', bar: 'bg-green-500' }
    if (pct >= 40) return { text: 'text-amber-700', bar: 'bg-amber-500' }
    return { text: 'text-slate-600', bar: 'bg-slate-400' }
}