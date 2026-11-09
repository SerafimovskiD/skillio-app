import { useEffect, useState } from 'react'
import { addInterest, getAllCategories, getMyInterests, removeInterest } from '../api/interests'

export default function InterestsSection() {
    const [categories, setCategories] = useState([])
    const [selected, setSelected] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getAllCategories(), getMyInterests()])
            .then(([all, mine]) => {
                setCategories(all)
                setSelected(new Set(mine.map((i) => i.categoryId)))
            })
            .catch(() => setError('Не можев да ги вчитам интересите.'))
            .finally(() => setLoading(false))
    }, [])

    const toggle = async (id) => {
        setError('')
        setBusyId(id)
        try {
            if (selected.has(id)) {
                await removeInterest(id)
                setSelected((prev) => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
            } else {
                await addInterest(id)
                setSelected((prev) => new Set(prev).add(id))
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Акцијата не успеа.')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-800">Интереси</h2>
            <p className="mt-1 text-sm text-slate-500">
                Избери ги областите што те интересираат.
            </p>

            {loading ? (
                <p className="mt-3 text-sm text-slate-500">Се вчитува...</p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((c) => {
                        const active = selected.has(c.id)
                        return (
                            <button key={c.id} type="button" aria-pressed={active}
                                    disabled={busyId === c.id} onClick={() => toggle(c.id)}
                                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                                        active
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                                    } disabled:opacity-60`}>
                                {active && '✓ '}{c.name}
                            </button>
                        )
                    })}
                </div>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    )
}