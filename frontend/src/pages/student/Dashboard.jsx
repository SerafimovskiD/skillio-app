import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../../api/applications'
import { getMyEducation } from '../../api/education'
import { getMyInterests } from '../../api/interests'
import { getProfile } from '../../api/profile'
import { getMyProjects } from '../../api/projects'
import { getRecommendedPostings } from '../../api/recommendations'
import { getMySavedPostings } from '../../api/savedPostings'
import { getMySkills } from '../../api/skills'
import { useAuth } from '../../context/AuthContext'
import { APPLICATION_STATUS } from '../../utils/applications'
import { timeAgo } from '../../utils/postings'
import { scoreStyle, toPercent } from '../../utils/score'

const val = (result, fallback) => (result.status === 'fulfilled' ? result.value : fallback)

function StatTile({ label, value, to }) {
    return (
        <Link to={to} className="rounded-xl bg-white p-4 shadow hover:shadow-md">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </Link>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [data, setData] = useState(null)

    useEffect(() => {
        Promise.allSettled([
            getProfile(),
            getMySkills(),
            getMyInterests(),
            getMyProjects(),
            getMyEducation(),
            getMyApplications(),
            getMySavedPostings(),
            getRecommendedPostings('HYBRID', 3),
        ]).then(([profile, skills, interests, projects, education, applications, saved, recs]) =>
            setData({
                profile: val(profile, null),
                skills: val(skills, []),
                interests: val(interests, []),
                projects: val(projects, []),
                education: val(education, []),
                applications: val(applications, []),
                saved: val(saved, []),
                recs: val(recs, []),
            })
        )
    }, [])

    if (!data) {
        return <p className="mx-auto max-w-5xl px-4 py-8 text-slate-600">Се вчитува...</p>
    }

    const { profile, skills, interests, projects, education, applications, saved, recs } = data

    const checks = [
        { label: 'Локација', done: Boolean(profile?.location?.trim()) },
        { label: 'Биографија', done: Boolean(profile?.bio?.trim()) },
        { label: 'Вештини', done: skills.length > 0 },
        { label: 'Интереси', done: interests.length > 0 },
        { label: 'Проект', done: projects.length > 0 },
        { label: 'Образование', done: education.length > 0 },
    ]
    const completeness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)
    const missing = checks.filter((c) => !c.done)

    const noSignal = recs.length === 0 || recs.every((r) => r.score === 0)
    const recentApps = [...applications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
    const answered = applications.filter((a) => a.status !== 'SENT').length

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Здраво, {user.name}</h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile label="Апликации" value={applications.length} to="/student/applications" />
                <StatTile label="Зачувани огласи" value={saved.length} to="/student/saved" />
                <StatTile label="Одговори од компании" value={answered} to="/student/applications" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-xl bg-white p-6 shadow lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Препорачани за тебе</h2>
                        <Link to="/student/recommendations" className="text-sm text-indigo-600 hover:underline">
                            Сите препораки
                        </Link>
                    </div>

                    {noSignal ? (
                        <p className="mt-4 text-sm text-slate-600">
                            Пополни го{' '}
                            <Link to="/student/profile" className="text-indigo-600 hover:underline">профилот</Link>{' '}
                            со вештини и интереси за да добиеш препораки.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {recs.map((r) => {
                                const pct = toPercent(r.score)
                                const style = scoreStyle(pct)
                                return (
                                    <Link key={r.posting.id} to={`/student/postings/${r.posting.id}`}
                                          className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-800">{r.posting.title}</p>
                                            <p className="truncate text-sm text-slate-600">
                                                {[r.posting.companyName, r.posting.location].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 text-lg font-bold ${style.text}`}>{pct}%</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="rounded-xl bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold text-slate-800">Профил</h2>
                    <p className="mt-1 text-sm text-slate-600">Комплетност: {completeness}%</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${completeness === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                             style={{ width: `${completeness}%` }} />
                    </div>
                    {missing.length === 0 ? (
                        <p className="mt-3 text-sm text-green-700">✓ Профилот е комплетен</p>
                    ) : (
                        <>
                            <p className="mt-3 text-xs text-slate-500">Додај:</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                {missing.map((m) => (
                                    <Link key={m.label} to="/student/profile"
                                          className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 hover:bg-indigo-100">
                                        + {m.label}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>

            <section className="mt-6 rounded-xl bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Последни апликации</h2>
                    <Link to="/student/applications" className="text-sm text-indigo-600 hover:underline">
                        Сите апликации
                    </Link>
                </div>

                {recentApps.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-600">
                        Сè уште немаш апликации.{' '}
                        <Link to="/student/postings" className="text-indigo-600 hover:underline">Прегледај огласи</Link>
                    </p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {recentApps.map((app) => {
                            const status = APPLICATION_STATUS[app.status] ?? {
                                label: app.status,
                                className: 'bg-slate-100 text-slate-700',
                            }
                            return (
                                <Link key={app.id} to={`/student/postings/${app.postingId}`}
                                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-800">{app.postingTitle}</p>
                                        <p className="truncate text-sm text-slate-600">
                                            {app.companyName} · {timeAgo(app.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                                        {status.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}