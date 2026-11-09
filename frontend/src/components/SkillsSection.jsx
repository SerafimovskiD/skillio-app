import { useEffect, useMemo, useState } from 'react'
import { getAllSkills, getMySkills, setSkill, removeSkill } from '../api/skills'

const LEVELS = [
    { value: 'BEGINNER', label: 'Почетник' },
    { value: 'INTERMEDIATE', label: 'Средно' },
    { value: 'ADVANCED', label: 'Напредно' },
]

const selectClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'

export default function SkillsSection() {
    const [allSkills, setAllSkills] = useState([])
    const [mySkills, setMySkills] = useState([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [newSkillId, setNewSkillId] = useState('')
    const [newLevel, setNewLevel] = useState('BEGINNER')

    useEffect(() => {
        Promise.all([getAllSkills(), getMySkills()])
            .then(([all, mine]) => {
                setAllSkills(all)
                setMySkills(mine)
            })
            .catch(() => setError('Не можев да ги вчитам вештините.'))
            .finally(() => setLoading(false))
    }, [])

    // Вештините што сè уште ги нема студентот, групирани по област
    const available = useMemo(() => {
        const have = new Set(mySkills.map((s) => s.skillId))
        const groups = {}
        allSkills
            .filter((s) => !have.has(s.id))
            .forEach((s) => {
                ;(groups[s.category] ??= []).push(s)
            })
        return groups
    }, [allSkills, mySkills])

    const upsert = (saved) =>
        setMySkills((prev) =>
            [...prev.filter((s) => s.skillId !== saved.skillId), saved].sort((a, b) =>
                a.name.localeCompare(b.name)
            )
        )

    const run = async (action) => {
        setError('')
        setBusy(true)
        try {
            await action()
        } catch (err) {
            setError(err.response?.data?.message || 'Акцијата не успеа.')
        } finally {
            setBusy(false)
        }
    }

    const add = (e) => {
        e.preventDefault()
        if (!newSkillId) return
        run(async () => {
            upsert(await setSkill(newSkillId, newLevel))
            setNewSkillId('')
        })
    }

    const changeLevel = (skillId, level) => run(async () => upsert(await setSkill(skillId, level)))

    const remove = (skillId) =>
        run(async () => {
            await removeSkill(skillId)
            setMySkills((prev) => prev.filter((s) => s.skillId !== skillId))
        })

    return (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-800">Вештини</h2>

            {loading ? (
                <p className="mt-3 text-sm text-slate-500">Се вчитува...</p>
            ) : (
                <>
                    {mySkills.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">Сè уште немаш додадено вештини.</p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {mySkills.map((s) => (
                                <li key={s.skillId}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                                    <div>
                                        <span className="font-medium text-slate-800">{s.name}</span>
                                        <span className="ml-2 text-xs text-slate-500">{s.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select value={s.level} disabled={busy}
                                                onChange={(e) => changeLevel(s.skillId, e.target.value)}
                                                className={selectClass}>
                                            {LEVELS.map((l) => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                        <button type="button" disabled={busy} title="Отстрани"
                                                onClick={() => remove(s.skillId)}
                                                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                                            ✕
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={add}
                          className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                        <select value={newSkillId} onChange={(e) => setNewSkillId(e.target.value)}
                                className={`${selectClass} min-w-56`}>
                            <option value="">Избери вештина...</option>
                            {Object.entries(available).map(([category, skills]) => (
                                <optgroup key={category} label={category}>
                                    {skills.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)}
                                className={selectClass}>
                            {LEVELS.map((l) => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                        </select>
                        <button type="submit" disabled={busy || !newSkillId}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            Додади
                        </button>
                    </form>
                </>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    )
}