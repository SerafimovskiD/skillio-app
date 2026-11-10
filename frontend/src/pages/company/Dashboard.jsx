import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyPostings } from '../../api/companyPostings'
import { getPostingApplications } from '../../api/companyApplications'
import { getCompanyProfile } from '../../api/companyProfile'
import { isExpired } from '../../utils/postings'

const STATUS = {
    SENT: { label: 'Испратено', cls: 'bg-slate-100 text-slate-700' },
    REVIEWED: { label: 'Прегледано', cls: 'bg-blue-50 text-blue-700' },
    INTERVIEW: { label: 'Интервју', cls: 'bg-amber-50 text-amber-700' },
    REJECTED: { label: 'Одбиено', cls: 'bg-red-50 text-red-700' },
    ACCEPTED: { label: 'Прифатено', cls: 'bg-green-50 text-green-700' },
}

const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}.${mm}.${d.getFullYear()}`
}

function Tile({ label, value, hint }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [postings, setPostings] = useState([])
    const [applications, setApplications] = useState([]) // со додадени postingId/postingTitle
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const [list, prof] = await Promise.allSettled([getMyPostings(), getCompanyProfile()])
                if (prof.status === 'fulfilled') setProfile(prof.value)
                if (list.status !== 'fulfilled') {
                    setError('Не можев да ги вчитам огласите.')
                    return
                }
                setPostings(list.value)

                const results = await Promise.allSettled(
                    list.value.map((p) => getPostingApplications(p.id))
                )
                const all = []
                results.forEach((r, i) => {
                    if (r.status === 'fulfilled') {
                        r.value.forEach((a) =>
                            all.push({ ...a, postingId: list.value[i].id, postingTitle: list.value[i].title })
                        )
                    }
                })
                all.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
                setApplications(all)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const activePostings = postings.filter((p) => !isExpired(p.deadline)).length
    const newApplications = applications.filter((a) => a.status === 'SENT').length
    const profileIncomplete = profile && (!profile.description || !profile.website)

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Здраво, {user.companyName ?? user.name}
                    </h1>
                    <p className="mt-1 text-slate-600">Преглед на огласите и апликациите на твојата компанија.</p>
                </div>
                <Link to="/company/postings/new"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    + Објави оглас
                </Link>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {profileIncomplete && (
                <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Профилот на компанијата е нецелосен. Додај опис и веб-страница за да изгледа попрофесионално
                    пред студентите.{' '}
                    <Link to="/company/profile" className="font-medium underline">Уреди профил</Link>
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-slate-600">Се вчитува...</p>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <Tile label="Активни огласи" value={activePostings}
                              hint={`од вкупно ${postings.length}`} />
                        <Tile label="Вкупно апликации" value={applications.length} />
                        <Tile label="Нови апликации" value={newApplications}
                              hint="Со статус „Испратено“" />
                    </div>

                    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-800">Последни апликации</h2>
                            <Link to="/company/postings" className="text-sm text-indigo-600 hover:underline">
                                Сите огласи →
                            </Link>
                        </div>

                        {applications.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-600">Сè уште нема апликации.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-100">
                                {applications.slice(0, 5).map((a) => {
                                    const st = STATUS[a.status]
                                    return (
                                        <li key={a.id}>
                                            <Link to={`/company/postings/${a.postingId}/applications`}
                                                  className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-slate-50">
                                                <div>
                                                    <p className="font-medium text-slate-800">{a.studentName}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {a.postingTitle} · {formatDate(a.createdAt)}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st?.cls ?? ''}`}>
                                                    {st?.label ?? a.status}
                                                </span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <Link to="/company/postings"
                              className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100">
                            Мои огласи
                        </Link>
                        <Link to="/company/profile"
                              className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100">
                            Профил на компанијата
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}