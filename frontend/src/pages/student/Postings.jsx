import { useEffect, useMemo, useState } from 'react'
import { getPostings } from '../../api/postings'
import { getAllCategories } from '../../api/interests'
import PostingCard from '../../components/PostingCard'
import { TYPE_LABELS } from '../../utils/postings'

const selectClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'

export default function Postings() {
    const [postings, setPostings] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [query, setQuery] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [type, setType] = useState('')

    useEffect(() => {
        Promise.all([getPostings(), getAllCategories()])
            .then(([p, c]) => {
                setPostings(p)
                setCategories(c)
            })
            .catch(() => setError('Не можев да ги вчитам огласите.'))
            .finally(() => setLoading(false))
    }, [])

    // Типовите што постојат во податоците (Пракса, Работа...)
    const types = useMemo(() => [...new Set(postings.map((p) => p.type))], [postings])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return postings
            .filter(
                (p) =>
                    (!categoryId || String(p.categoryId) === categoryId) &&
                    (!type || p.type === type) &&
                    (!q || [p.title, p.companyName, p.location].some((v) => v?.toLowerCase().includes(q)))
            )
            .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    }, [postings, query, categoryId, type])

    const hasFilters = query || categoryId || type
    const clearFilters = () => {
        setQuery('')
        setCategoryId('')
        setType('')
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-end justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Огласи</h1>
                {!loading && <p className="text-sm text-slate-500">{filtered.length} огласи</p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                       placeholder="Барај по наслов, компанија или град..."
                       className="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectClass}>
                    <option value="">Сите области</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                    <option value="">Сите типови</option>
                    {types.map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                    ))}
                </select>
                {hasFilters && (
                    <button type="button" onClick={clearFilters}
                            className="rounded-lg px-3 py-2 text-sm text-indigo-600 hover:underline">
                        Исчисти филтри
                    </button>
                )}
            </div>

            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

            {loading ? (
                <p className="mt-6 text-slate-600">Се вчитува...</p>
            ) : filtered.length === 0 ? (
                <p className="mt-6 text-slate-600">Нема огласи што одговараат на филтерот.</p>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p) => (
                        <PostingCard key={p.id} posting={p} />
                    ))}
                </div>
            )}
        </div>
    )
}