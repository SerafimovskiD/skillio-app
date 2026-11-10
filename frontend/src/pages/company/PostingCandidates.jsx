import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMyPosting } from '../../api/companyPostings'
import { getCandidates } from '../../api/companyCandidates'
import PostingNotFound from '../../components/PostingNotFound'

const MODES = [
    { value: 'HYBRID', label: 'Комбинирано', hint: 'Ги комбинира AI сличноста на текст, вештините и областа. Препорачано.' },
    { value: 'EMBEDDING', label: 'AI сличност', hint: 'Само семантичка сличност меѓу профилот на кандидатот и огласот.' },
    { value: 'SKILLS', label: 'Вештини', hint: 'Само совпаѓање на вештините побарани во огласот.' },
]

const skillName = (s) => (typeof s === 'string' ? s : s?.name)

function scoreClasses(pct) {
    if (pct >= 70) return { text: 'text-green-700', bar: 'bg-green-500' }
    if (pct >= 40) return { text: 'text-amber-700', bar: 'bg-amber-500' }
    return { text: 'text-slate-600', bar: 'bg-slate-400' }
}

export default function PostingCandidates() {
    const { id } = useParams()
    const [posting, setPosting] = useState(null)
    const [candidates, setCandidates] = useState([])
    const [mode, setMode] = useState('HYBRID')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        getMyPosting(id)
            .then(setPosting)
            .catch((err) =>
                err.response?.status === 404
                    ? setNotFound(true)
                    : setError('Не можев да го вчитам огласот.')
            )
    }, [id])

    useEffect(() => {
        if (notFound) return
        setLoading(true)
        setError('')
        getCandidates(id, mode)
            .then(setCandidates)
            .catch((err) => {
                if (err.response?.status !== 404) setError('Не можев да ги вчитам кандидатите.')
            })
            .finally(() => setLoading(false))
    }, [id, mode, notFound])

    const allZero = candidates.length > 0 && candidates.every((c) => Math.round(c.score * 100) === 0)
    const current = MODES.find((m) => m.value === mode)

    if (notFound) return <PostingNotFound />

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <Link to="/company/postings" className="text-sm text-indigo-600 hover:underline">
                ← Назад кон огласи
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-800">Препорачани кандидати</h1>
            {posting && <p className="mt-1 text-slate-600">{posting.title}</p>}

            <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
                {MODES.map((m) => (
                    <button key={m.value} onClick={() => setMode(m.value)}
                            className={`rounded-md px-3 py-1.5 ${
                                mode === m.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}>
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">{current.hint}</p>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {loading ? (
                <p className="mt-6 text-slate-600">Се вчитува...</p>
            ) : candidates.length === 0 ? (
                <p className="mt-6 text-slate-600">
                    Сè уште нема кандидати со доволно податоци во профилот.
                </p>
            ) : (
                <>
                    {allZero && (
                        <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            Ниеден кандидат нема совпаѓање во овој режим. Пробај „Комбинирано" или додај
                            вештини во огласот.
                        </p>
                    )}
                    <div className="mt-6 space-y-4">
                        {candidates.map((c) => {
                            const pct = Math.round(c.score * 100)
                            const style = scoreClasses(pct)
                            const matched = (c.skillMatch?.matched ?? []).map(skillName)
                            const missing = (c.skillMatch?.missing ?? []).map(skillName)
                            const total = matched.length + missing.length
                            const matchedSet = new Set(matched)
                            const others = (c.skills ?? []).filter((s) => !matchedSet.has(s))

                            return (
                                <div key={c.userId} className="rounded-xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-800">{c.name}</h2>
                                            {c.location && <p className="text-sm text-slate-500">{c.location}</p>}
                                        </div>
                                        {!allZero && (
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${style.text}`}>{pct}%</p>
                                                <p className="text-xs text-slate-400">совпаѓање</p>
                                            </div>
                                        )}
                                    </div>

                                    {!allZero && (
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div className={`h-full ${style.bar}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    )}

                                    {total > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-slate-600">
                                                Вештини за огласот: <b>{matched.length} од {total}</b>
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {matched.map((s) => (
                                                    <span key={`m-${s}`}
                                                          className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
                                                        ✓ {s}
                                                    </span>
                                                ))}
                                                {missing.map((s) => (
                                                    <span key={`x-${s}`}
                                                          className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600">
                                                        ✗ {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'HYBRID' && c.categoryMatch && (
                                        <p className="mt-3 text-sm text-green-700">
                                            ✓ Областа на огласот е од интересите на кандидатот
                                        </p>
                                    )}

                                    {others.length > 0 && (
                                        <p className="mt-3 text-sm text-slate-500">
                                            Други вештини: {others.join(', ')}
                                        </p>
                                    )}

                                    {c.bio && (
                                        <p className="mt-3 line-clamp-3 text-sm text-slate-600">{c.bio}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}