import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createPosting, getMyPosting, updatePosting } from '../../api/companyPostings'
import { getAllCategories } from '../../api/interests'
import { getAllSkills } from '../../api/skills'
import { TYPE_LABELS, WORK_MODE_LABELS } from '../../utils/postings'
import PostingNotFound from '../../components/PostingNotFound'
import PageHeader from '../../components/PageHeader'

const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const EMPTY = {
    title: '',
    description: '',
    type: 'INTERNSHIP',
    workMode: '',
    location: '',
    categoryId: '',
    deadline: '',
}

function Section({ title, hint, children }) {
    return (
        <section className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                {hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
            {children}
        </section>
    )
}

export default function PostingForm() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const navigate = useNavigate()

    const [form, setForm] = useState(EMPTY)
    const [selected, setSelected] = useState([]) // [{ skillId, name, required }]
    const [categories, setCategories] = useState([])
    const [allSkills, setAllSkills] = useState([])
    const [skillQuery, setSkillQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const requests = [getAllCategories(), getAllSkills()]
        if (isEdit) requests.push(getMyPosting(id))
        Promise.all(requests)
            .then(([c, s, p]) => {
                setCategories(c)
                setAllSkills(s)
                if (p) {
                    setForm({
                        title: p.title ?? '',
                        description: p.description ?? '',
                        type: p.type ?? 'INTERNSHIP',
                        workMode: p.workMode ?? '',
                        location: p.location ?? '',
                        categoryId: p.categoryId ? String(p.categoryId) : '',
                        deadline: p.deadline ?? '',
                    })
                    setSelected(
                        (p.skills ?? []).map((k) => ({
                            skillId: k.skillId,
                            name: k.name,
                            required: k.required,
                        }))
                    )
                }
            })
            .catch((err) =>
                err.response?.status === 404
                    ? setNotFound(true)
                    : setError('Не можев да ги вчитам податоците.')
            )
            .finally(() => setLoading(false))
    }, [id, isEdit])

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    // Вештините што уште не се избрани, групирани по категорија
    const groups = useMemo(() => {
        const chosen = new Set(selected.map((s) => s.skillId))
        const q = skillQuery.trim().toLowerCase()
        const result = {}
        allSkills
            .filter((s) => !chosen.has(s.id) && (!q || s.name.toLowerCase().includes(q)))
            .forEach((s) => {
                const key = s.category || 'Останато'
                ;(result[key] ??= []).push(s)
            })
        return Object.entries(result)
    }, [allSkills, selected, skillQuery])

    const addSkill = (s) =>
        setSelected([...selected, { skillId: s.id, name: s.name, required: true }])

    const toggleRequired = (skillId) =>
        setSelected(selected.map((s) => (s.skillId === skillId ? { ...s, required: !s.required } : s)))

    const removeSkill = (skillId) => setSelected(selected.filter((s) => s.skillId !== skillId))

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.title.trim() || !form.description.trim()) {
            setError('Насловот и описот се задолжителни.')
            return
        }
        if (!form.workMode) {
            setError('Избери начин на работа.')
            return
        }
        if (!form.categoryId) {
            setError('Избери област.')
            return
        }
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            type: form.type,
            workMode: form.workMode,
            location: form.location.trim() || null,
            categoryId: Number(form.categoryId),
            deadline: form.deadline || null,
            skills: selected.map((s) => ({ skillId: s.skillId, required: s.required })),
        }
        setSaving(true)
        try {
            if (isEdit) await updatePosting(id, payload)
            else await createPosting(payload)
            navigate('/company/postings')
        } catch (err) {
            setError(err.response?.data?.message ?? 'Зачувувањето не успеа.')
            setSaving(false)
        }
    }

    if (notFound) return <PostingNotFound />

    if (loading) {
        return <div className="mx-auto max-w-3xl px-4 py-8 text-slate-500">Се вчитува...</div>
    }

    const requiredCount = selected.filter((s) => s.required).length

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <Link to="/company/postings" className="text-sm text-indigo-600 no-underline">
                ← Назад кон огласи
            </Link>
            <div className="mt-2">
                <PageHeader
                    title={isEdit ? 'Уреди оглас' : 'Нов оглас'}
                    subtitle="Полињата означени со * се задолжителни."
                />
            </div>

            <form onSubmit={submit} className="mt-6 space-y-8 rounded-xl bg-white p-6 shadow">
                <Section title="Основни информации">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Наслов *</label>
                        <input name="title" value={form.title} onChange={change} maxLength={255}
                               className={inputClass} placeholder="пр. Junior Frontend Developer" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Опис *</label>
                        <textarea name="description" value={form.description} onChange={change} rows={10}
                                  className={inputClass}
                                  placeholder="Опиши што ќе работи кандидатот, што барате и што нудите." />
                        <p className="mt-1 text-xs text-slate-500">
                            Совет: подробен опис дава попрецизни препораки. Можеш да користиш листи со „-“.
                        </p>
                    </div>
                </Section>

                <Section title="Детали за позицијата">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Тип *</label>
                            <select name="type" value={form.type} onChange={change} className={inputClass}>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Начин на работа *</label>
                            <select name="workMode" value={form.workMode} onChange={change} className={inputClass}>
                                <option value="">Избери...</option>
                                {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Област *</label>
                            <select name="categoryId" value={form.categoryId} onChange={change} className={inputClass}>
                                <option value="">Избери...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Локација</label>
                            <input name="location" value={form.location} onChange={change} maxLength={255}
                                   className={inputClass} placeholder="пр. Скопје" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Краен рок за аплицирање</label>
                            <input type="date" name="deadline" value={form.deadline} onChange={change}
                                   className={inputClass} />
                            <p className="mt-1 text-xs text-slate-500">Остави празно ако нема рок.</p>
                        </div>
                    </div>
                </Section>

                <Section title="Потребни вештини"
                         hint="Задолжителните вештини се бројат повеќе при препораките од пожелните.">
                    {selected.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs text-slate-500">
                                Избрани: {selected.length} (задолжителни: {requiredCount}). Кликни на ознаката за промена.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selected.map((s) => (
                                    <span key={s.skillId}
                                          className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-2 text-sm ${
                                              s.required
                                                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                                          }`}>
                                        {s.name}
                                        <button type="button" onClick={() => toggleRequired(s.skillId)}
                                                title="Промени помеѓу задолжителна и пожелна"
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    s.required
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                            {s.required ? 'Задолжителна' : 'Пожелна'}
                                        </button>
                                        <button type="button" onClick={() => removeSkill(s.skillId)}
                                                className="px-1 text-slate-400 hover:text-red-600"
                                                aria-label="Отстрани">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)}
                               className={inputClass} placeholder="Барај вештина за додавање..." />
                        <div className="mt-2 max-h-56 space-y-3 overflow-y-auto rounded-lg border border-slate-200 p-3">
                            {groups.length === 0 ? (
                                <span className="text-sm text-slate-400">Нема резултати.</span>
                            ) : (
                                groups.map(([category, skills]) => (
                                    <div key={category}>
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                            {category}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((s) => (
                                                <button type="button" key={s.id} onClick={() => addSkill(s)}
                                                        className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:border-indigo-400 hover:text-indigo-600">
                                                    + {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Section>

                {error && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                    <button type="submit" disabled={saving}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Се зачувува...' : isEdit ? 'Зачувај промени' : 'Објави оглас'}
                    </button>
                    <Link to="/company/postings"
                          className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Откажи
                    </Link>
                </div>
            </form>
        </div>
    )
}