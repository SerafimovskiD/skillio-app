import { useEffect, useState } from 'react'
import { createProject, deleteProject, getMyProjects, updateProject } from '../api/projects'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'

const emptyForm = { title: '', description: '', link: '' }

// Ако линкот нема http(s), додаваме https:// за да се отвори правилно
const toHref = (link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`)

export default function ProjectsSection() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null) // null = формата е затворена, 'new' или id на проект
    const [form, setForm] = useState(emptyForm)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getMyProjects()
            .then(setProjects)
            .catch(() => setError('Не можев да ги вчитам проектите.'))
            .finally(() => setLoading(false))
    }, [])

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const openNew = () => {
        setForm(emptyForm)
        setEditingId('new')
        setError('')
    }

    const openEdit = (p) => {
        setForm({ title: p.title ?? '', description: p.description ?? '', link: p.link ?? '' })
        setEditingId(p.id)
        setError('')
    }

    const close = () => {
        setEditingId(null)
        setForm(emptyForm)
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || null,
            link: form.link.trim() || null,
        }
        try {
            if (editingId === 'new') {
                const created = await createProject(payload)
                setProjects((prev) => [...prev, created])
            } else {
                const updated = await updateProject(editingId, payload)
                setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            }
            close()
        } catch (err) {
            setError(err.response?.data?.message || 'Зачувувањето не успеа.')
        } finally {
            setBusy(false)
        }
    }

    const onDelete = async (p) => {
        if (!window.confirm(`Да го избришам проектот „${p.title}“?`)) return
        setError('')
        setBusy(true)
        try {
            await deleteProject(p.id)
            setProjects((prev) => prev.filter((x) => x.id !== p.id))
            if (editingId === p.id) close()
        } catch (err) {
            setError(err.response?.data?.message || 'Бришењето не успеа.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Проекти</h2>
                {editingId === null && (
                    <button type="button" onClick={openNew}
                            className="rounded-lg border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                        + Додади проект
                    </button>
                )}
            </div>

            {editingId !== null && (
                <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-medium text-slate-800">
                        {editingId === 'new' ? 'Нов проект' : 'Уреди проект'}
                    </h3>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Наслов</label>
                        <input required maxLength={200} value={form.title} onChange={set('title')} className={inputClass} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Опис</label>
                        <textarea rows={4} maxLength={2000} value={form.description} onChange={set('description')}
                                  placeholder="Што направи, со кои технологии/алатки, каков беше резултатот..."
                                  className={inputClass} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Линк (опционално)</label>
                        <input maxLength={2000} value={form.link} onChange={set('link')}
                               placeholder="github.com/..." className={inputClass} />
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
            ) : projects.length === 0 && editingId === null ? (
                <p className="mt-3 text-sm text-slate-500">Сè уште немаш додадено проекти.</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {projects.map((p) => (
                        <li key={p.id} className="rounded-lg border border-slate-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-slate-800">{p.title}</h3>
                                <div className="flex shrink-0 gap-2 text-sm">
                                    <button type="button" disabled={busy} onClick={() => openEdit(p)}
                                            className="text-indigo-600 hover:underline">Уреди</button>
                                    <button type="button" disabled={busy} onClick={() => onDelete(p)}
                                            className="text-red-600 hover:underline">Избриши</button>
                                </div>
                            </div>
                            {p.description && (
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{p.description}</p>
                            )}
                            {p.link && (
                                <a href={toHref(p.link)} target="_blank" rel="noopener noreferrer"
                                   className="mt-2 inline-block break-all text-sm text-indigo-600 hover:underline">
                                    {p.link}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    )
}