import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { applyToPosting, getMyApplications } from '../../api/applications'
import { getPosting } from '../../api/postings'
import { getMySavedPostings, savePosting, unsavePosting } from '../../api/savedPostings'
import { getMySkills } from '../../api/skills'
import RichText from '../../components/RichText'
import { TYPE_LABELS, WORK_MODE_LABELS, formatDate, isExpired, timeAgo } from '../../utils/postings'

function SkillChip({ name, have }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
            have ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
            {have ? '✓' : '✗'} {name}
        </span>
    )
}

export default function PostingDetails() {
    const { id } = useParams()
    const [posting, setPosting] = useState(null)
    const [mySkills, setMySkills] = useState([])
    const [application, setApplication] = useState(null)
    const [saved, setSaved] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [message, setMessage] = useState('')
    const [busy, setBusy] = useState(false)
    const [actionError, setActionError] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        setLoading(true)
        setError('')
        setShowForm(false)
        setActionError('')
        Promise.all([getPosting(id), getMySkills(), getMyApplications(), getMySavedPostings()])
            .then(([p, s, apps, savedList]) => {
                setPosting(p)
                setMySkills(s)
                setApplication(apps.find((a) => a.postingId === p.id) ?? null)
                setSaved(savedList.some((x) => x.postingId === p.id))
            })
            .catch((err) =>
                setError(err.response?.status === 404 ? 'Огласот не е пронајден.' : 'Не можев да го вчитам огласот.')
            )
            .finally(() => setLoading(false))
    }, [id])

    const back = (
        <Link to="/student/postings" className="text-sm text-indigo-600 hover:underline">
            ← Назад кон огласи
        </Link>
    )

    if (loading) return <p className="mx-auto max-w-3xl px-4 py-8 text-slate-600">Се вчитува...</p>

    if (error) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                {back}
                <p className="mt-4 text-red-600">{error}</p>
            </div>
        )
    }

    const expired = isExpired(posting.deadline)
    const mine = new Set(mySkills.map((s) => s.skillId))
    const required = posting.skills.filter((s) => s.required)
    const optional = posting.skills.filter((s) => !s.required)
    const haveRequired = required.filter((s) => mine.has(s.skillId)).length
    const haveAll = posting.skills.filter((s) => mine.has(s.skillId)).length

    let headline = 'Огласот нема наведени вештини.'
    if (required.length > 0) {
        headline = `Ги исполнуваш ${haveRequired} од ${required.length} задолжителни вештини`
    } else if (posting.skills.length > 0) {
        headline = `Ги имаш ${haveAll} од ${posting.skills.length} вештини`
    }

    const handleApply = async (e) => {
        e.preventDefault()
        setBusy(true)
        setActionError('')
        try {
            const created = await applyToPosting(posting.id, message.trim())
            setApplication(created)
            setShowForm(false)
            setMessage('')
        } catch (err) {
            setActionError(err.response?.data?.message ?? 'Не успеав да аплицирам. Обиди се повторно.')
        } finally {
            setBusy(false)
        }
    }

    const toggleSave = async () => {
        setBusy(true)
        setActionError('')
        try {
            if (saved) await unsavePosting(posting.id)
            else await savePosting(posting.id)
            setSaved(!saved)
        } catch {
            setActionError('Не успеав да го зачувам огласот.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {back}

            <div className="mt-4 rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium text-slate-600">{posting.companyName}</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-800">{posting.title}</h1>
                <p className="mt-2 text-sm text-slate-500">
                    {[posting.location, timeAgo(posting.createdAt) && `Објавено ${timeAgo(posting.createdAt)}`]
                        .filter(Boolean)
                        .join(' · ')}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                        {TYPE_LABELS[posting.type] ?? posting.type}
                    </span>
                    {posting.categoryName && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            {posting.categoryName}
                        </span>
                    )}
                    {posting.workMode && (
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                            {WORK_MODE_LABELS[posting.workMode] ?? posting.workMode}
                        </span>
                    )}
                </div>

                <p className={`mt-3 text-sm ${expired ? 'text-red-600' : 'text-slate-500'}`}>
                    {posting.deadline
                        ? expired
                            ? `Рокот истече на ${formatDate(posting.deadline)}`
                            : `Рок за аплицирање: ${formatDate(posting.deadline)}`
                        : 'Без рок за аплицирање'}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    {application ? (
                        <span className="rounded-lg bg-green-50 px-5 py-2 font-medium text-green-700">
                            ✓ Аплицирано
                        </span>
                    ) : (
                        <button type="button" disabled={expired || busy}
                                onClick={() => setShowForm((v) => !v)}
                                className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                            {expired ? 'Рокот истече' : 'Аплицирај'}
                        </button>
                    )}
                    <button type="button" onClick={toggleSave} disabled={busy}
                            className="rounded-lg border border-indigo-600 px-5 py-2 font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60">
                        {saved ? '★ Зачувано' : '☆ Зачувај'}
                    </button>
                </div>

                {showForm && !application && (
                    <form onSubmit={handleApply} className="mt-4 space-y-3">
                        <label className="block text-sm font-medium text-slate-700">
                            Порака до компанијата (опционално)
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                                      rows={4} maxLength={5000}
                                      placeholder="Накратко зошто те интересира оваа позиција..."
                                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:border-indigo-500 focus:outline-none" />
                        </label>
                        <div className="flex gap-3">
                            <button type="submit" disabled={busy}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                                {busy ? 'Се испраќа...' : 'Испрати апликација'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-slate-600 hover:bg-slate-50">
                                Откажи
                            </button>
                        </div>
                    </form>
                )}
                {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
            </div>

            <section className="mt-4 rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-slate-800">Совпаѓање со твојот профил</h2>
                <p className="mt-1 text-slate-700">{headline}</p>

                {required.length > 0 && (
                    <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-slate-600">Задолжително</p>
                        <div className="flex flex-wrap gap-2">
                            {required.map((s) => (
                                <SkillChip key={s.skillId} name={s.name} have={mine.has(s.skillId)} />
                            ))}
                        </div>
                    </div>
                )}
                {optional.length > 0 && (
                    <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-slate-600">Предност</p>
                        <div className="flex flex-wrap gap-2">
                            {optional.map((s) => (
                                <SkillChip key={s.skillId} name={s.name} have={mine.has(s.skillId)} />
                            ))}
                        </div>
                    </div>
                )}
                <p className="mt-4 text-xs text-slate-500">
                    Додај вештини во{' '}
                    <Link to="/student/profile" className="text-indigo-600 hover:underline">профилот</Link>{' '}
                    за да го подобриш совпаѓањето.
                </p>
            </section>

            <section className="mt-4 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-3 text-lg font-semibold text-slate-800">Опис на позицијата</h2>
                <RichText text={posting.description} />
            </section>
        </div>
    )
}