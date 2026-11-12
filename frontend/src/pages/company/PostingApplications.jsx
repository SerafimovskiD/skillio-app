import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMyPosting } from '../../api/companyPostings'
import {
    downloadApplicationCv,
    getPostingApplications,
    updateApplicationStatus,
} from '../../api/companyApplications'
import PostingNotFound from '../../components/PostingNotFound'
import {
    APPLICATION_STATUS,
    LEVEL_LABELS,
    STATUS_BORDER,
    STATUS_LIST,
    formatDate,
    initials,
} from '../../utils/applications'

function FilterTile({ label, count, active, onClick }) {
    return (
        <button type="button" onClick={onClick}
                className={`rounded-xl border bg-white p-3 text-left transition ${
                    active
                        ? 'border-indigo-600 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300'
                }`}>
            <p className={`text-2xl font-bold ${count ? 'text-slate-800' : 'text-slate-300'}`}>{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
        </button>
    )
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

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {applications.length === 0 ? (
                <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
                    <p className="font-medium text-slate-800">Сè уште нема апликации за овој оглас</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Во меѓувреме можеш да ги погледнеш препорачаните кандидати.
                    </p>
                    <Link to={`/company/postings/${id}/candidates`}
                          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Препорачани кандидати
                    </Link>
                </div>
            ) : (
                <>
                    <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                        <FilterTile label="Сите" count={applications.length} active={!filter}
                                    onClick={() => setFilter('')} />
                        {STATUS_LIST.map((s) => (
                            <FilterTile key={s.value} label={s.label} count={counts[s.value] ?? 0}
                                        active={filter === s.value}
                                        onClick={() => setFilter(filter === s.value ? '' : s.value)} />
                        ))}
                    </div>

                    <div className="mt-6 space-y-4">
                        {visible.map((a) => {
                            const st = APPLICATION_STATUS[a.status]
                            return (
                                <div key={a.id}
                                     className={`rounded-xl border-l-4 bg-white p-5 shadow ${STATUS_BORDER[a.status] ?? 'border-l-slate-300'}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                {initials(a.studentName)}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold leading-tight text-slate-800">
                                                    {a.studentName}
                                                </h2>
                                                <p className="text-sm text-slate-500">
                                                    {a.studentEmail}
                                                    {a.studentLocation && ` · ${a.studentLocation}`}
                                                </p>
                                                {a.createdAt && (
                                                    <p className="text-xs text-slate-400">
                                                        Аплицирал: {formatDate(a.createdAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st?.className ?? ''}`}>
                                                {st?.label ?? a.status}
                                            </span>
                                            <select value={a.status} disabled={savingId === a.id}
                                                    onChange={(e) => changeStatus(a, e.target.value)}
                                                    aria-label="Промени статус"
                                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50">
                                                {STATUS_LIST.map((s) => (
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

                                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                                        {a.hasCv ? (
                                            <button type="button" onClick={() => downloadCv(a)}
                                                    disabled={cvBusyId === a.id}
                                                    className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60">
                                                {cvBusyId === a.id ? 'Се презема...' : 'Преземи CV'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">Нема приложено CV.</span>
                                        )}
                                        {a.studentEmail && (
                                            <a href={`mailto:${a.studentEmail}`}
                                               className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                                Контактирај
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {visible.length === 0 && (
                            <p className="text-sm text-slate-500">Нема апликации со овој статус.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}