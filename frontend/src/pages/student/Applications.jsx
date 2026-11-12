import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelApplication, getMyApplications } from '../../api/applications'
import { APPLICATION_STATUS, STATUS_LIST } from '../../utils/applications'
import { timeAgo } from '../../utils/postings'
import { useConfirm } from '../../components/ConfirmProvider'
import PageHeader from '../../components/PageHeader'
import { plural } from '../../utils/plural'
const BORDER = {
    SENT: 'border-l-slate-300',
    REVIEWED: 'border-l-blue-400',
    INTERVIEW: 'border-l-amber-400',
    REJECTED: 'border-l-red-400',
    ACCEPTED: 'border-l-green-500',
}

const STAGE = { SENT: 0, REVIEWED: 1, INTERVIEW: 2, REJECTED: 3, ACCEPTED: 3 }

function Timeline({ status }) {
    const current = STAGE[status] ?? 0
    const steps = [
        { label: 'Испратено' },
        { label: 'Прегледано' },
        { label: 'Интервју' },
        {
            label: status === 'ACCEPTED' ? 'Прифатено' : status === 'REJECTED' ? 'Одбиено' : 'Одлука',
        },
    ]

    return (
        <ol className="mt-5 flex">
            {steps.map((s, i) => {
                const reached = i <= current
                const last = i === steps.length - 1
                let circle = 'bg-slate-200 text-slate-400'
                let mark = i + 1
                if (reached) {
                    circle = 'bg-indigo-600 text-white'
                    mark = '✓'
                }
                if (i === current && !last) circle += ' ring-4 ring-indigo-100'
                if (last && status === 'ACCEPTED') {
                    circle = 'bg-green-500 text-white'
                    mark = '✓'
                }
                if (last && status === 'REJECTED') {
                    circle = 'bg-red-500 text-white'
                    mark = '✕'
                }

                return (
                    <li key={s.label} className="relative flex-1 text-center">
                        {i > 0 && (
                            <span className={`absolute left-[-50%] top-3 h-0.5 w-full ${
                                reached ? 'bg-indigo-600' : 'bg-slate-200'
                            }`} />
                        )}
                        <span className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${circle}`}>
                            {mark}
                        </span>
                        <p className={`mt-1 text-xs ${reached ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                            {s.label}
                        </p>
                    </li>
                )
            })}
        </ol>
    )
}

export default function Applications() {
    const confirm = useConfirm()
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('')

    useEffect(() => {
        getMyApplications()
            .then((list) =>
                setApps([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
            )
            .catch(() => setError('Не можев да ги вчитам апликациите.'))
            .finally(() => setLoading(false))
    }, [])

    const counts = useMemo(() => {
        const c = {}
        apps.forEach((a) => {
            c[a.status] = (c[a.status] ?? 0) + 1
        })
        return c
    }, [apps])

    const visible = filter ? apps.filter((a) => a.status === filter) : apps

    const handleCancel = async (app) => {
        const ok = await confirm({
            title: 'Повлечи апликација',
            message: `Да ја повлечеш апликацијата за „${app.postingTitle}“?`,
            confirmText: 'Повлечи',
            danger: true,
        })
        if (!ok) return
        setError('')
        try {
            await cancelApplication(app.id)
            setApps((prev) => prev.filter((a) => a.id !== app.id))
            setFilter('')
        } catch (err) {
            setError(err.response?.data?.message ?? 'Не успеав да ја повлечам апликацијата.')
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <PageHeader title="Мои апликации" subtitle="Статусот на апликациите го менува компанијата.">
                {!loading && apps.length > 0 && (
                    <p className="text-sm text-slate-500">
                        {plural(apps.length, 'апликација', 'апликации')}
                    </p>
                )}
            </PageHeader>

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            {loading && <p className="mt-4 text-slate-500">Се вчитува...</p>}

            {!loading && apps.length === 0 && !error && (
                <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
                    <p className="font-medium text-slate-800">Сè уште немаш апликации</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Прегледај ги огласите или погледни што ти препорачуваме.
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                        <Link to="/student/postings"
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                            Прегледај огласи
                        </Link>
                        <Link to="/student/recommendations"
                              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            Мои препораки
                        </Link>
                    </div>
                </div>
            )}

            {apps.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <button onClick={() => setFilter('')}
                            className={`rounded-full border px-3 py-1 ${
                                !filter
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}>
                        Сите ({apps.length})
                    </button>
                    {STATUS_LIST.filter((s) => counts[s.value]).map((s) => (
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

            <div className="mt-6 space-y-5">
                {visible.map((app) => {
                    const status = APPLICATION_STATUS[app.status] ?? {
                        label: app.status,
                        className: 'bg-slate-100 text-slate-700',
                    }
                    return (
                        <div key={app.id}
                             className={`rounded-xl border-l-4 bg-white p-5 shadow ${BORDER[app.status] ?? 'border-l-slate-300'}`}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <Link to={`/student/postings/${app.postingId}`}
                                          className="text-lg font-semibold text-slate-800 hover:text-indigo-600">
                                        {app.postingTitle}
                                    </Link>
                                    <p className="text-sm text-slate-600">{app.companyName}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>

                            <Timeline status={app.status} />

                            {status.hint && (
                                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    {status.hint}
                                </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                <span>Аплицирано {timeAgo(app.createdAt)}</span>
                                {app.cvAttached && (
                                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">
                                        CV приложено
                                    </span>
                                )}
                            </div>

                            {app.message && (
                                <p className="mt-3 line-clamp-2 border-l-2 border-slate-200 pl-3 text-sm text-slate-500">
                                    „{app.message}“
                                </p>
                            )}

                            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                                <Link to={`/student/postings/${app.postingId}`}
                                      className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                                    Погледни оглас
                                </Link>
                                {app.status === 'SENT' && (
                                    <button type="button" onClick={() => handleCancel(app)}
                                            className="rounded-lg border border-red-300 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50">
                                        Повлечи
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}