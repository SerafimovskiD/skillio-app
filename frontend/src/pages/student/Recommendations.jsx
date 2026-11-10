import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendedPostings } from '../../api/recommendations'
import { TYPE_LABELS, formatDate, isExpired } from '../../utils/postings'
import { scoreStyle, toPercent } from '../../utils/score'

const MODES = [
    {
        value: 'HYBRID',
        label: 'Комбинирано',
        hint: 'Ги комбинира AI сличноста на текстот, вештините и областа. Препорачано.',
    },
    {
        value: 'EMBEDDING',
        label: 'AI сличност',
        hint: 'Го споредува значењето на твојот профил со описот на огласот, без точно совпаѓање на вештини.',
    },
    {
        value: 'SKILLS',
        label: 'Вештини',
        hint: 'Само колку од бараните вештини ги имаш. Задолжителните тежат повеќе од предностите.',
    },
]

function SkillBreakdown({ skillMatch }) {
    const { matched, missing } = skillMatch
    const total = matched.length + missing.length
    if (total === 0) return null

    return (
        <div className="mt-3">
            <p className="text-sm text-slate-600">
                Вештини: <span className="font-medium text-slate-800">{matched.length} од {total}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {matched.map((name) => (
                    <span key={`m-${name}`} className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">
                        ✓ {name}
                    </span>
                ))}
                {missing.map((name) => (
                    <span key={`x-${name}`} className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
                        ✗ {name}
                    </span>
                ))}
            </div>
        </div>
    )
}

function RecommendationCard({ item, showScore }) {
    const { posting, score, skillMatch, categoryMatch } = item
    const pct = toPercent(score)
    const style = scoreStyle(pct)
    const expired = isExpired(posting.deadline)

    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link to={`/student/postings/${posting.id}`}
                          className="text-lg font-semibold text-slate-800 hover:text-indigo-600">
                        {posting.title}
                    </Link>
                    <p className="text-sm text-slate-600">
                        {[posting.companyName, posting.location].filter(Boolean).join(' · ')}
                    </p>
                </div>
                {showScore && (
                    <div className="shrink-0 text-right">
                        <p className={`text-2xl font-bold ${style.text}`}>{pct}%</p>
                        <p className="text-xs text-slate-500">совпаѓање</p>
                    </div>
                )}
            </div>

            {showScore && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                    {TYPE_LABELS[posting.type] ?? posting.type}
                </span>
                {posting.categoryName && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {posting.categoryName}
                    </span>
                )}
            </div>

            {showScore && skillMatch && <SkillBreakdown skillMatch={skillMatch} />}
            {showScore && categoryMatch && (
                <p className="mt-2 text-sm text-green-700">✓ Областа е од твој интерес</p>
            )}

            <p className={`mt-3 text-sm ${expired ? 'text-red-600' : 'text-slate-500'}`}>
                {posting.deadline
                    ? expired
                        ? `Рокот истече на ${formatDate(posting.deadline)}`
                        : `Рок: ${formatDate(posting.deadline)}`
                    : 'Без рок'}
            </p>

            <div className="mt-4">
                <Link to={`/student/postings/${posting.id}`}
                      className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                    Детали
                </Link>
            </div>
        </div>
    )
}

export default function Recommendations() {
    const [mode, setMode] = useState('HYBRID')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false
        setLoading(true)
        setError('')
        getRecommendedPostings(mode)
            .then((data) => {
                if (!ignore) setItems(data)
            })
            .catch(() => {
                if (!ignore) setError('Не можев да ги вчитам препораките.')
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [mode])

    const allZero = items.length > 0 && items.every((i) => i.score === 0)
    const currentMode = MODES.find((m) => m.value === mode)

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Препораки за тебе</h1>

            <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
                {MODES.map((m) => (
                    <button key={m.value} type="button" onClick={() => setMode(m.value)}
                            className={`rounded-md px-3 py-1.5 font-medium ${
                                mode === m.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}>
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">{currentMode.hint}</p>

            {allZero && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    Профилот е се уште празен, па не можеме да пресметаме совпаѓање. Додај вештини и интереси во својот{' '}
                    <Link to="/student/profile" className="font-medium underline">профил</Link>{' '}
                    за да добиеш препораки прилагодени на тебе.
                </div>
            )}

            {error && <p className="mt-4 text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-slate-600">Се вчитува...</p>}

            {!loading && !error && items.length === 0 && (
                <div className="mt-6 rounded-xl bg-white p-6 text-slate-600 shadow">
                    Нема препораки. Додај вештини и интереси во{' '}
                    <Link to="/student/profile" className="text-indigo-600 hover:underline">профилот</Link>{' '}
                    за да добиеш препораки.
                </div>
            )}

            {!loading && (
                <div className="mt-6 space-y-4">
                    {items.map((item) => (
                        <RecommendationCard key={item.posting.id} item={item} showScore={!allZero} />
                    ))}
                </div>
            )}
        </div>
    )
}