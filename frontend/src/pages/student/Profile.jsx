import {useEffect, useState} from 'react'
import {getProfile, updateProfile} from '../../api/profile'
import {useAuth} from '../../context/AuthContext'
import SkillsSection from '../../components/SkillsSection'
import InterestsSection from '../../components/InterestsSection'
import ProjectsSection from '../../components/ProjectsSection'
import EducationSection from '../../components/EducationSection'
import CvSection from "../../components/CvSection";
const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'

export default function Profile() {
    const {updateUser} = useAuth()
    const [email, setEmail] = useState('')
    const [form, setForm] = useState({name: '', location: '', bio: ''})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        getProfile()
            .then((p) => {
                setEmail(p.email)
                setForm({name: p.name ?? '', location: p.location ?? '', bio: p.bio ?? ''})
            })
            .catch(() => setMessage({type: 'error', text: 'Не можев да го вчитам профилот.'}))
            .finally(() => setLoading(false))
    }, [])

    const set = (field) => (e) => setForm({...form, [field]: e.target.value})

    const onSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        setSaving(true)
        try {
            const saved = await updateProfile({
                name: form.name.trim(),
                location: form.location.trim(),
                bio: form.bio.trim(),
            })
            setForm({name: saved.name ?? '', location: saved.location ?? '', bio: saved.bio ?? ''})
            updateUser({name: saved.name})
            setMessage({type: 'ok', text: 'Профилот е зачуван.'})
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Зачувувањето не успеа.',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p className="mx-auto max-w-3xl px-4 py-8 text-slate-600">Се вчитува...</p>

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Мој профил</h1>

            <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-slate-800">Основни податоци</h2>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Е-пошта</label>
                    <input value={email} disabled className={`${inputClass} bg-slate-100 text-slate-500`}/>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Име и презиме</label>
                    <input required maxLength={100} value={form.name} onChange={set('name')} className={inputClass}/>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Локација</label>
                    <input required maxLength={100} value={form.location} onChange={set('location')}
                           placeholder="на пр. Скопје" className={inputClass}/>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Биографија</label>
                    <textarea rows={6} maxLength={2000} value={form.bio} onChange={set('bio')}
                              placeholder="Кажи нешто за себе: што студираш, што те интересира, што знаеш..."
                              className={inputClass}/>
                    <p className="mt-1 text-right text-xs text-slate-500">{form.bio.length}/2000</p>
                </div>

                {message && (
                    <p className={`text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
                <button type="submit" disabled={saving}
                        className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {saving ? 'Се зачувува...' : 'Зачувај'}
                </button>
            </form>
            <SkillsSection/>
            <InterestsSection/>
            <ProjectsSection/>
            <EducationSection/>
            <CvSection />
        </div>
    )
}