import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyPostings, deletePosting } from '../../api/companyPostings'
import { TYPE_LABELS, WORK_MODE_LABELS, daysUntil, formatDate, isExpired } from '../../utils/postings'
import { plural, pluralWord } from '../../utils/plural'

export default function MyPostings() {
    const [postings, setPostings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [confirmId, setConfirmId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        getMyPostings()
            .then(setPostings)
            .catch(() => setError('Не можев да ги вчитам огласите.'))
            .finally(() => setLoading(false))
    }, [])

    const remove = async (id) => {
        setError('')
        setDeletingId(id)
        try {
            await deletePosting(id)
            setPostings((list) => list.filter((p) => p.id !== id))
            setConfirmId(null)
        } catch (err) {
            setError(err.response?.data?.message ?? 'Огласот не може да се избрише.')
        } finally {
            setDeletingId(null)
        }
    }

    const active = postings.filter((p) => !isExpired(p.deadline)).length
    const expiredCount = postings.length - active

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Мои огласи</h1>
                    {!loading && (
                        <p className="mt-1 text-sm text-slate-500">
                            {plural(postings.length, 'оглас', 'огласи')} · {active}{' '}
                            {pluralWord(active, 'активен', 'активни')} · {expiredCount}{' '}
                            {pluralWord(expiredCount, 'истечен', 'истечени')}
                        </p>
                    )}
                </div>
                <Link to="/company/postings/new"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    + Нов оглас
                </Link>
            </div>

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <p className="mt-6 text-slate-500">Се вчитува...</p>
            ) : postings.length === 0 ? (
                <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
                    <p className="font-medium text-slate-800">Сè уште немаш објавено огласи</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Објави го првиот оглас и добиј препорачани кандидати.
                    </p>
                    <Link to="/company/postings/new"
                          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Објави прв оглас
                    </Link>
                </div>
            ) : (
                <div className="mt-6 space-y-3">
                    {postings.map((p) => {
                        const expired = isExpired(p.deadline)
                        const left = daysUntil(p.deadline)
                        const soon = !expired && left !== null && left <= 7
                        return (
                            <div key={p.id}
                                 className={`flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow ${
                                     expired ? 'opacity-75' : ''
                                 }`}>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold text-slate-800">{p.title}</h2>
                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                                            {TYPE_LABELS[p.type] ?? p.type}
                                        </span>
                                        {p.workMode && (
                                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                                                {WORK_MODE_LABELS[p.workMode] ?? p.workMode}
                                            </span>
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                                            expired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                                        }`}>
                                            {expired ? 'Истечен' : 'Активен'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {p.categoryName}
                                        {p.location && ` · ${p.location}`}
                                        {p.deadline && ` · Рок: ${formatDate(p.deadline)}`}
                                        {soon && (
                                            <span className="ml-2 font-medium text-amber-700">
                                                (уште {left} {left === 1 ? 'ден' : 'дена'})
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    {confirmId === p.id ? (
                                        <>
                                            <span className="text-slate-600">Сигурен си?</span>
                                            <button onClick={() => remove(p.id)} disabled={deletingId === p.id}
                                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-50">
                                                {deletingId === p.id ? 'Се брише...' : 'Да, избриши'}
                                            </button>
                                            <button onClick={() => setConfirmId(null)}
                                                    className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                                                Откажи
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to={`/company/postings/${p.id}/candidates`}
                                                  className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700">
                                                Кандидати
                                            </Link>
                                            <Link to={`/company/postings/${p.id}/applications`}
                                                  className="rounded-lg border border-indigo-200 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50">
                                                Апликации
                                            </Link>
                                            <Link to={`/company/postings/${p.id}/edit`}
                                                  className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                                                Уреди
                                            </Link>
                                            <button onClick={() => { setConfirmId(p.id); setError('') }}
                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">
                                                Избриши
                                            </button>
                                        </>
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