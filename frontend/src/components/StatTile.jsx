import { Link } from 'react-router-dom'

const TONES = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    sky: 'bg-sky-50 text-sky-600',
}

function Icon({ name }) {
    const props = {
        width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    }
    switch (name) {
        case 'document':
            return <svg {...props}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></svg>
        case 'users':
            return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
        case 'bell':
            return <svg {...props}><path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>
        case 'bookmark':
            return <svg {...props}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
        case 'send':
            return <svg {...props}><path d="M3 11l18-8-8 18-2-8z" /></svg>
        case 'check':
            return <svg {...props}><path d="M5 13l4 4L19 7" /></svg>
        default:
            return null
    }
}

export default function StatTile({ label, value, hint, to, tone = 'indigo', icon }) {
    const content = (
        <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
                <Icon name={icon} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight text-slate-800">{value}</p>
                <p className="text-sm text-slate-600">{label}</p>
                {hint && <p className="text-xs text-slate-400">{hint}</p>}
            </div>
        </div>
    )
    const cls = 'rounded-xl bg-white p-4 shadow'
    return to ? (
        <Link to={to} className={`${cls} transition hover:shadow-md`}>{content}</Link>
    ) : (
        <div className={cls}>{content}</div>
    )
}