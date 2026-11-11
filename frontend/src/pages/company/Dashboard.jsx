import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyPostings } from '../../api/companyPostings'
import { getPostingApplications } from '../../api/companyApplications'
import { getCompanyProfile } from '../../api/companyProfile'
import { isExpired } from '../../utils/postings'
import StatTile from '../../components/StatTile'

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

const initials = (name) =>
    (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')

const linkBtn =
    'rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50'

export default function Dashboard() {
    const { user } = useAuth()
    const [postings, setPostings] = useState([])
    const [applications, setApplications] = useState([])
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

    const perPosting = useMemo(() => {
        const m = {}
        applications.forEach((a) => {
            const s = (m[a.postingId] ??= { total: 0, fresh: 0 })
            s.total += 1
            if (a.status === 'SENT') s.fresh += 1
        })
        return m
    }, [applications])

    const activePostings = postings.filter((p) => !isExpired(p.deadline)).length
    const newApplications = applications.filter((a) => a.status === 'SENT').length
    const interviews = applications.filter((a) => a.status === 'INTERVIEW').length
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
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Активни огласи" value={activePostings} icon="document" tone="indigo"
                                  hint={`од вкупно ${postings.length}`} to="/company/postings" />
                        <StatTile label="Вкупно апликации" value={applications.length} icon="users" tone="sky" />
                        <StatTile label="Нови апликации" value={newApplications} icon="bell" tone="amber"
                                  hint="Со статус „Испратено“" />
                        <StatTile label="На интервју" value={interviews} icon="check" tone="green" />
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-5">
                        <section className="rounded-xl bg-white p-6 shadow lg:col-span-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800">Мои огласи</h2>
                                <Link to="/company/postings" className="text-sm text-indigo-600 hover:underline">
                                    Сите →
                                </Link>
                            </div>

                            {postings.length === 0 ? (
                                <p className="mt-4 text-sm text-slate-600">
                                    Сè уште немаш огласи.{' '}
                                    <Link to="/company/postings/new" className="text-indigo-600 hover:underline">
                                        Објави го првиот
                                    </Link>
                                </p>
                            ) : (
                                <ul className="mt-2 divide-y divide-slate-100">
                                    {postings.slice(0, 5).map((p) => {
                                        const s = perPosting[p.id] ?? { total: 0, fresh: 0 }
                                        const expired = isExpired(p.deadline)
                                        return (
                                            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-medium text-slate-800">{p.title}</p>
                                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                                                            expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                        }`}>
                                                            {expired ? 'Истечен' : 'Активен'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-slate-500">
                                                        {s.total} апликации
                                                        {s.fresh > 0 && (
                                                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                                {s.fresh} нови
                                                            </span>
                                                        )}
                                                        {p.deadline && ` · рок ${formatDate(p.deadline)}`}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 text-sm">
                                                    <Link to={`/company/postings/${p.id}/candidates`}
                                                          className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700">
                                                        Кандидати
                                                    </Link>
                                                    <Link to={`/company/postings/${p.id}/applications`} className={linkBtn}>
                                                        Апликации
                                                    </Link>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </section>

                        <section className="rounded-xl bg-white p-6 shadow lg:col-span-2">
                            <h2 className="text-lg font-semibold text-slate-800">Последни апликации</h2>

                            {applications.length === 0 ? (
                                <p className="mt-4 text-sm text-slate-600">Сè уште нема апликации.</p>
                            ) : (
                                <ul className="mt-2 divide-y divide-slate-100">
                                    {applications.slice(0, 5).map((a) => {
                                        const st = STATUS[a.status]
                                        return (
                                            <li key={a.id}>
                                                <Link to={`/company/postings/${a.postingId}/applications`}
                                                      className="flex items-center gap-3 py-3 hover:bg-slate-50">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                        {initials(a.studentName)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-slate-800">{a.studentName}</p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {a.postingTitle} · {formatDate(a.createdAt)}
                                                            {a.hasCv && ' · CV'}
                                                        </p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st?.cls ?? ''}`}>
                                                        {st?.label ?? a.status}
                                                    </span>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    )
}