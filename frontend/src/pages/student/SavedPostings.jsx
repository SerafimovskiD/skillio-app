import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMySavedPostings, unsavePosting } from '../../api/savedPostings'
import PostingCard from '../../components/PostingCard'
import PageHeader from '../../components/PageHeader'
import { timeAgo } from '../../utils/postings'
import { plural } from '../../utils/plural'

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
        <div className="mx-auto max-w-6xl px-4 py-8">
            <PageHeader title="Зачувани огласи" subtitle="Огласи што си ги зачувал за подоцна.">
                {!loading && items.length > 0 && (
                    <p className="text-sm text-slate-500">{plural(items.length, 'оглас', 'огласи')}</p>
                )}
            </PageHeader>

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            {loading && <p className="mt-4 text-slate-500">Се вчитува...</p>}

            {!loading && items.length === 0 && !error && (
                <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
                    <p className="text-slate-700">Немаш зачувани огласи.</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Кликни „☆ Зачувај“ на оглас за да го најдеш тука подоцна.
                    </p>
                    <Link to="/student/postings"
                          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Прегледај огласи
                    </Link>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <PostingCard key={item.postingId}
                                 posting={{ ...item, id: item.postingId }}
                                 note={`Зачувано ${timeAgo(item.savedAt)}`}>
                        <button type="button" onClick={() => handleRemove(item)}
                                className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                            Отстрани
                        </button>
                    </PostingCard>
                ))}
            </div>
        </div>
    )
}