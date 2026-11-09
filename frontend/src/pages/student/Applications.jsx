import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelApplication, getMyApplications } from '../../api/applications'
import { APPLICATION_STATUS } from '../../utils/applications'
import { timeAgo } from '../../utils/postings'

export default function Applications() {
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getMyApplications()
            .then((list) =>
                setApps([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
            )
            .catch(() => setError('Не можев да ги вчитам апликациите.'))
            .finally(() => setLoading(false))
    }, [])

    const handleCancel = async (app) => {
        if (!window.confirm(`Да ја повлечеш апликацијата за „${app.postingTitle}"?`)) return
        setError('')
        try {
            await cancelApplication(app.id)
            setApps((prev) => prev.filter((a) => a.id !== app.id))
        } catch (err) {
            setError(err.response?.data?.message ?? 'Не успеав да ја повлечам апликацијата.')
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Мои апликации</h1>

            {error && <p className="mt-4 text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-slate-600">Се вчитува...</p>}

            {!loading && apps.length === 0 && !error && (
                <div className="mt-6 rounded-xl bg-white p-6 text-slate-600 shadow">
                    Сè уште не си аплицирала/аплицирал.{' '}
                    <Link to="/student/postings" className="text-indigo-600 hover:underline">
                        Прегледај огласи
                    </Link>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {apps.map((app) => {
                    const status = APPLICATION_STATUS[app.status] ?? {
                        label: app.status,
                        className: 'bg-slate-100 text-slate-700',
                    }
                    return (
                        <div key={app.id} className="rounded-xl bg-white p-5 shadow">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
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

                            <p className="mt-2 text-sm text-slate-500">Аплицирано {timeAgo(app.createdAt)}</p>

                            {app.message && (
                                <p className="mt-3 line-clamp-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                    {app.message}
                                </p>
                            )}

                            <div className="mt-4 flex gap-3">
                                <Link to={`/student/postings/${app.postingId}`}
                                      className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                                    Детали
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