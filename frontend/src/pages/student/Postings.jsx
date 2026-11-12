import { useEffect, useMemo, useState } from 'react'
import { getPostings } from '../../api/postings'
import { getAllCategories } from '../../api/interests'
import PostingCard from '../../components/PostingCard'
import { TYPE_LABELS, WORK_MODE_LABELS } from '../../utils/postings'
import { plural } from '../../utils/plural'

// на мобилен по два во ред, на поголем екран природна ширина
const selectClass =
    'w-[calc(50%-6px)] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:w-auto'

export default function Postings() {
    const [postings, setPostings] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [query, setQuery] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [type, setType] = useState('')
    const [workMode, setWorkMode] = useState('')
    const [sort, setSort] = useState('new')

    useEffect(() => {
        Promise.all([getPostings(), getAllCategories()])
            .then(([p, c]) => {
                setPostings(p)
                setCategories(c)
            })
            .catch(() => setError('Не можев да ги вчитам огласите.'))
            .finally(() => setLoading(false))
    }, [])

    const types = useMemo(() => [...new Set(postings.map((p) => p.type))], [postings])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        const list = postings.filter(
            (p) =>
                (!categoryId || String(p.categoryId) === categoryId) &&
                (!type || p.type === type) &&
                (!workMode || p.workMode === workMode) &&
                (!q || [p.title, p.companyName, p.location].some((v) => v?.toLowerCase().includes(q)))
        )
        const byNewest = (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
        if (sort === 'deadline') {
            return list.sort((a, b) => {
                if (!a.deadline && !b.deadline) return byNewest(a, b)
                if (!a.deadline) return 1
                if (!b.deadline) return -1
                return a.deadline.localeCompare(b.deadline) || byNewest(a, b)
            })
        }
        return list.sort(byNewest)
    }, [postings, query, categoryId, type, workMode, sort])

    const hasFilters = query || categoryId || type || workMode
    const clearFilters = () => {
        setQuery('')
        setCategoryId('')
        setType('')
        setWorkMode('')
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Огласи</h1>
                    <p className="mt-1 text-slate-600">Пракси и работни позиции од компании.</p>
                </div>
                {!loading && (
                    <p className="text-sm text-slate-500">
                        {plural(filtered.length, 'оглас', 'огласи')}
                    </p>
                )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow">
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                       placeholder="Барај по наслов, компанија или град..."
                       className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:w-auto sm:min-w-64 sm:flex-1" />
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
                <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={selectClass}>
                    <option value="">Начин на работа</option>
                    {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
                    <option value="new">Најнови</option>
                    <option value="deadline">Истекуваат наскоро</option>
                </select>
                {hasFilters && (
                    <button type="button" onClick={clearFilters}
                            className="rounded-lg px-1 py-2 text-sm text-indigo-600 hover:underline sm:px-3">
                        Ресетирај филтри
                    </button>
                )}
            </div>

            {error && (
                <div className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <p className="mt-6 text-slate-500">Се вчитува...</p>
            ) : filtered.length === 0 ? (
                <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
                    <p className="text-slate-700">Нема огласи што одговараат на филтерот.</p>
                    {hasFilters && (
                        <button type="button" onClick={clearFilters}
                                className="mt-3 rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                            Ресетирај филтри
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p) => (
                        <PostingCard key={p.id} posting={p} />
                    ))}
                </div>
            )}
        </div>
    )
}