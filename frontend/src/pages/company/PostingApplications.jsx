import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMyPosting } from '../../api/companyPostings'
import {
    downloadApplicationCv,
    getPostingApplications,
    updateApplicationStatus,
} from '../../api/companyApplications'
import PostingNotFound from '../../components/PostingNotFound'

const STATUSES = [
    { value: 'SENT', label: 'Испратено', cls: 'bg-slate-100 text-slate-700' },
    { value: 'REVIEWED', label: 'Прегледано', cls: 'bg-blue-50 text-blue-700' },
    { value: 'INTERVIEW', label: 'Интервју', cls: 'bg-amber-50 text-amber-700' },
    { value: 'REJECTED', label: 'Одбиено', cls: 'bg-red-50 text-red-700' },
    { value: 'ACCEPTED', label: 'Прифатено', cls: 'bg-green-50 text-green-700' },
]
const STATUS_BY_VALUE = Object.fromEntries(STATUSES.map((s) => [s.value, s]))

const LEVEL_LABELS = { BEGINNER: 'Почетник', INTERMEDIATE: 'Средно', ADVANCED: 'Напредно' }

const formatDateTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}.${mm}.${d.getFullYear()}`
}

export default function PostingApplications() {
    const { id } = useParams()
    const [posting, setPosting] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notFound, setNotFound] = useState(false)
    const [filter, setFilter] = useState('')
    const [savingId, setSavingId] = useState(null)
    const [cvBusyId, setCvBusyId] = useState(null)

    useEffect(() => {
        Promise.all([getMyPosting(id), getPostingApplications(id)])
            .then(([p, a]) => {
                setPosting(p)
                setApplications(a)
            })
            .catch((err) =>
                err.response?.status === 404
                    ? setNotFound(true)
                    : setError('Не можев да ги вчитам апликациите.')
            )
            .finally(() => setLoading(false))
    }, [id])

    const counts = useMemo(() => {
        const c = {}
        applications.forEach((a) => {
            c[a.status] = (c[a.status] ?? 0) + 1
        })
        return c
    }, [applications])

    const visible = filter ? applications.filter((a) => a.status === filter) : applications

    const changeStatus = async (application, status) => {
        if (status === application.status) return
        setError('')
        setSavingId(application.id)
        try {
            const updated = await updateApplicationStatus(application.id, status)
            setApplications((list) => list.map((a) => (a.id === updated.id ? updated : a)))
        } catch (err) {
            setError(err.response?.data?.message ?? 'Статусот не може да се промени.')
        } finally {
            setSavingId(null)
        }
    }

    const downloadCv = async (application) => {
        setError('')
        setCvBusyId(application.id)
        try {
            await downloadApplicationCv(application.id, `CV - ${application.studentName}.pdf`)
        } catch {
            setError('CV-то не може да се преземе.')
        } finally {
            setCvBusyId(null)
        }
    }

    if (notFound) return <PostingNotFound />

    if (loading) {
        return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-500">Се вчитува...</div>
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <Link to="/company/postings" className="text-sm text-indigo-600 hover:underline">
                ← Назад кон огласи
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-800">Апликации</h1>
            {posting && <p className="mt-1 text-slate-600">{posting.title}</p>}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {applications.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <button onClick={() => setFilter('')}
                            className={`rounded-full border px-3 py-1 ${
                                !filter ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}>
                        Сите ({applications.length})
                    </button>
                    {STATUSES.filter((s) => counts[s.value]).map((s) => (
                        <button key={s.value} onClick={() => setFilter(s.value)}
                                className={`rounded-full border px-3 py-1 ${
                                    filter === s.value
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}>
                            {s.label} ({counts[s.value]})
                        </button>
                    ))}
                </div>
            )}

            {applications.length === 0 ? (
                <p className="mt-6 text-slate-600">Сè уште нема апликации за овој оглас.</p>
            ) : (
                <div className="mt-6 space-y-4">
                    {visible.map((a) => {
                        const st = STATUS_BY_VALUE[a.status]
                        return (
                            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">{a.studentName}</h2>
                                        <p className="text-sm text-slate-500">
                                            {a.studentEmail}
                                            {a.studentLocation && ` · ${a.studentLocation}`}
                                            {a.createdAt && ` · Аплицирал: ${formatDateTime(a.createdAt)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st?.cls ?? ''}`}>
                                            {st?.label ?? a.status}
                                        </span>
                                        <select value={a.status} disabled={savingId === a.id}
                                                onChange={(e) => changeStatus(a, e.target.value)}
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50">
                                            {STATUSES.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {a.message && (
                                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Порака
                                        </p>
                                        <p className="whitespace-pre-line">{a.message}</p>
                                    </div>
                                )}

                                {a.studentBio && (
                                    <p className="mt-3 line-clamp-3 text-sm text-slate-600">{a.studentBio}</p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {a.skills?.length ? (
                                        a.skills.map((s) => (
                                            <span key={s.skillId}
                                                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                                                {s.name}
                                                {s.level && ` · ${LEVEL_LABELS[s.level] ?? s.level}`}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400">Нема внесени вештини.</span>
                                    )}
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-3">
                                    {a.hasCv ? (
                                        <button type="button" onClick={() => downloadCv(a)}
                                                disabled={cvBusyId === a.id}
                                                className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60">
                                            {cvBusyId === a.id ? 'Се презема...' : 'Преземи CV'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">Нема приложено CV.</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}