import { useEffect, useState } from 'react'
import {
    createEducation,
    deleteEducation,
    getMyEducation,
    updateEducation,
} from '../api/education'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'

const emptyForm = { institution: '', degree: '', startDate: '', endDate: '' }

// "2022-10-01" -> "10.2022"
const fmt = (d) => (d ? `${d.slice(5, 7)}.${d.slice(0, 4)}` : null)

const period = (e) => {
    const from = fmt(e.startDate)
    const to = fmt(e.endDate)
    if (!from && !to) return null
    return `${from ?? '…'} – ${to ?? 'Моментално'}`
}

// Најново први (според датум на почеток)
const sortEducation = (list) =>
    [...list].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))

export default function EducationSection() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null) // null = затворена форма, 'new' или id
    const [form, setForm] = useState(emptyForm)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getMyEducation()
            .then((data) => setItems(sortEducation(data)))
            .catch(() => setError('Не можев да го вчитам образованието.'))
            .finally(() => setLoading(false))
    }, [])

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const openNew = () => {
        setForm(emptyForm)
        setEditingId('new')
        setError('')
    }

    const openEdit = (item) => {
        setForm({
            institution: item.institution ?? '',
            degree: item.degree ?? '',
            startDate: item.startDate ?? '',
            endDate: item.endDate ?? '',
        })
        setEditingId(item.id)
        setError('')
    }

    const close = () => {
        setEditingId(null)
        setForm(emptyForm)
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.startDate && form.endDate && form.endDate < form.startDate) {
            setError('Крајниот датум не може да биде пред почетниот.')
            return
        }
        setBusy(true)
        const payload = {
            institution: form.institution.trim(),
            degree: form.degree.trim() || null,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
        }
        try {
            if (editingId === 'new') {
                const created = await createEducation(payload)
                setItems((prev) => sortEducation([...prev, created]))
            } else {
                const updated = await updateEducation(editingId, payload)
                setItems((prev) => sortEducation(prev.map((x) => (x.id === updated.id ? updated : x))))
            }
            close()
        } catch (err) {
            setError(err.response?.data?.message || 'Зачувувањето не успеа.')
        } finally {
            setBusy(false)
        }
    }

    const onDelete = async (item) => {
        if (!window.confirm(`Да го избришам „${item.institution}“?`)) return
        setError('')
        setBusy(true)
        try {
            await deleteEducation(item.id)
            setItems((prev) => prev.filter((x) => x.id !== item.id))
            if (editingId === item.id) close()
        } catch (err) {
            setError(err.response?.data?.message || 'Бришењето не успеа.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Образование</h2>
                {editingId === null && (
                    <button type="button" onClick={openNew}
                            className="rounded-lg border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                        + Додади образование
                    </button>
                )}
            </div>

            {editingId !== null && (
                <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-medium text-slate-800">
                        {editingId === 'new' ? 'Ново образование' : 'Уреди образование'}
                    </h3>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Институција</label>
                        <input required maxLength={200} value={form.institution} onChange={set('institution')}
                               placeholder="на пр. ФИНКИ, Скопје" className={inputClass} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Степен / студиска програма</label>
                        <input maxLength={200} value={form.degree} onChange={set('degree')}
                               placeholder="на пр. Компјутерски науки (додипломски)" className={inputClass} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Од</label>
                            <input type="date" value={form.startDate} onChange={set('startDate')} className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">До</label>
                            <input type="date" value={form.endDate} onChange={set('endDate')} className={inputClass} />
                            <p className="mt-1 text-xs text-slate-500">Остави празно ако сè уште студираш.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={busy}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                            {busy ? 'Се зачувува...' : 'Зачувај'}
                        </button>
                        <button type="button" onClick={close} disabled={busy}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
                            Откажи
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="mt-3 text-sm text-slate-500">Се вчитува...</p>
            ) : items.length === 0 && editingId === null ? (
                <p className="mt-3 text-sm text-slate-500">Сè уште немаш додадено образование.</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                        <li key={item.id} className="rounded-lg border border-slate-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{item.institution}</h3>
                                    {item.degree && <p className="text-sm text-slate-600">{item.degree}</p>}
                                    {period(item) && <p className="mt-1 text-xs text-slate-500">{period(item)}</p>}
                                </div>
                                <div className="flex shrink-0 gap-2 text-sm">
                                    <button type="button" disabled={busy} onClick={() => openEdit(item)}
                                            className="text-indigo-600 hover:underline">Уреди</button>
                                    <button type="button" disabled={busy} onClick={() => onDelete(item)}
                                            className="text-red-600 hover:underline">Избриши</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    )
}