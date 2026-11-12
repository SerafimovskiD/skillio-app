import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyPostings } from '../../api/companyPostings'
import { getPostingApplications } from '../../api/companyApplications'
import { getCompanyProfile } from '../../api/companyProfile'
import { isExpired } from '../../utils/postings'
import { APPLICATION_STATUS, formatDate, initials } from '../../utils/applications'
import { plural } from '../../utils/plural'
import { headerDuration } from '../../utils/typing'
import StatTile from '../../components/StatTile'
import PageHeader from '../../components/PageHeader'

const linkBtn =
    'rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50'

const SUBTITLE = 'Преглед на огласите и апликациите на твојата компанија.'

export default function Dashboard() {
    const { user } = useAuth()
    // од кога смеат да почнат да се бројат броевите (по завршување на насловот и поднасловот)
    const [countStart] = useState(
        () => Date.now() + headerDuration(`Здраво, ${user.companyName ?? user.name}`, SUBTITLE)
    )
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
            <PageHeader
                title={`Здраво, ${user.companyName ?? user.name}`}
                subtitle={SUBTITLE}>
                <Link to="/company/postings/new"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    + Објави оглас
                </Link>
            </PageHeader>

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {profileIncomplete && (
                <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Профилот на компанијата е нецелосен. Додај опис и веб-страница за да изгледа попрофесионално
                    пред студентите.{' '}
                    <Link to="/company/profile" className="font-medium underline">Уреди профил</Link>
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-slate-500">Се вчитува...</p>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Активни огласи" value={activePostings} icon="document" tone="indigo"
                                  hint={`од вкупно ${postings.length}`} to="/company/postings"
                                  startAt={countStart} />
                        <StatTile label="Вкупно апликации" value={applications.length} icon="users" tone="sky"
                                  startAt={countStart} />
                        <StatTile label="Нови апликации" value={newApplications} icon="bell" tone="amber"
                                  hint="Со статус „Испратено“" startAt={countStart} />
                        <StatTile label="На интервју" value={interviews} icon="check" tone="green"
                                  startAt={countStart} />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <section className="min-w-0 rounded-xl bg-white p-6 shadow lg:col-span-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800">Мои огласи</h2>
                                <Link to="/company/postings" className="text-sm text-indigo-600 no-underline">
                                    Погледни ги сите
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
                                                <div className="min-w-0 max-w-full">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <p className="min-w-0 truncate font-medium text-slate-800">{p.title}</p>
                                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                                                            expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                        }`}>
                                                            {expired ? 'Истечен' : 'Активен'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-slate-500">
                                                        {plural(s.total, 'апликација', 'апликации')}
                                                        {s.fresh > 0 && (
                                                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                                {s.fresh === 1 ? '1 нова' : `${s.fresh} нови`}
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

                        <section className="min-w-0 rounded-xl bg-white p-6 shadow lg:col-span-2">
                            <h2 className="text-lg font-semibold text-slate-800">Последни апликации</h2>

                            {applications.length === 0 ? (
                                <p className="mt-4 text-sm text-slate-600">Сè уште нема апликации.</p>
                            ) : (
                                <ul className="mt-2 divide-y divide-slate-100">
                                    {applications.slice(0, 5).map((a) => {
                                        const st = APPLICATION_STATUS[a.status]
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
                                                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st?.className ?? ''}`}>
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