import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMySavedPostings, unsavePosting } from '../../api/savedPostings'
import { TYPE_LABELS, formatDate, isExpired, timeAgo } from '../../utils/postings'

export default function SavedPostings() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getMySavedPostings()
            .then((list) =>
                setItems([...list].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
            )
            .catch(() => setError('Не можев да ги вчитам зачуваните огласи.'))
            .finally(() => setLoading(false))
    }, [])

    const handleRemove = async (item) => {
        setError('')
        try {
            await unsavePosting(item.postingId)
            setItems((prev) => prev.filter((i) => i.postingId !== item.postingId))
        } catch {
            setError('Не успеав да го тргнам огласот.')
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Зачувани огласи</h1>

            {error && <p className="mt-4 text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-slate-600">Се вчитува...</p>}

            {!loading && items.length === 0 && !error && (
                <div className="mt-6 rounded-xl bg-white p-6 text-slate-600 shadow">
                    Немаш зачувани огласи. Кликни „☆ Зачувај" на оглас за да го најдеш тука подоцна.{' '}
                    <Link to="/student/postings" className="text-indigo-600 hover:underline">
                        Прегледај огласи
                    </Link>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {items.map((item) => {
                    const expired = isExpired(item.deadline)
                    return (
                        <div key={item.postingId} className="rounded-xl bg-white p-5 shadow">
                            <Link to={`/student/postings/${item.postingId}`}
                                  className="text-lg font-semibold text-slate-800 hover:text-indigo-600">
                                {item.title}
                            </Link>
                            <p className="text-sm text-slate-600">
                                {[item.companyName, item.location].filter(Boolean).join(' · ')}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                                    {TYPE_LABELS[item.type] ?? item.type}
                                </span>
                                {item.categoryName && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                        {item.categoryName}
                                    </span>
                                )}
                            </div>

                            <p className={`mt-3 text-sm ${expired ? 'text-red-600' : 'text-slate-500'}`}>
                                {item.deadline
                                    ? expired
                                        ? `Рокот истече на ${formatDate(item.deadline)}`
                                        : `Рок: ${formatDate(item.deadline)}`
                                    : 'Без рок'}
                                {' · '}Зачувано {timeAgo(item.savedAt)}
                            </p>

                            <div className="mt-4 flex gap-3">
                                <Link to={`/student/postings/${item.postingId}`}
                                      className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                                    Детали
                                </Link>
                                <button type="button" onClick={() => handleRemove(item)}
                                        className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                                    Тргни
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}