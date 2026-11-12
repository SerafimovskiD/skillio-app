import { useEffect, useState } from 'react'
import { getCompanyProfile, updateCompanyProfile } from '../../api/companyProfile'
import { useAuth } from '../../context/AuthContext'

const EMPTY = { name: '', description: '', website: '', industry: '', location: '' }

const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function CompanyProfile() {
    const { updateUser } = useAuth()
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        getCompanyProfile()
            .then((p) =>
                setForm({
                    name: p.name ?? '',
                    description: p.description ?? '',
                    website: p.website ?? '',
                    industry: p.industry ?? '',
                    location: p.location ?? '',
                })
            )
            .catch(() => setError('Профилот не може да се вчита.'))
            .finally(() => setLoading(false))
    }, [])

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setSuccess('')
    }

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!form.name.trim()) {
            setError('Името на компанијата е задолжително.')
            return
        }
        setSaving(true)
        try {
            await updateCompanyProfile(form)
            updateUser({ companyName: form.name.trim() })
            setSuccess('Профилот е зачуван.')
        } catch {
            setError('Зачувувањето не успеа. Провери ги податоците и обиди се повторно.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="mx-auto max-w-3xl px-4 py-8 text-slate-500">Се вчитува...</div>
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Профил на компанијата</h1>


            <form onSubmit={submit} className="mt-6 space-y-6 rounded-xl bg-white p-6 shadow">
                <div className="space-y-4">
                    <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-800">
                        Основни податоци
                    </h2>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Име на компанијата *</label>
                        <input name="name" value={form.name} onChange={change} maxLength={200}
                               className={inputClass} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Индустрија</label>
                            <input name="industry" value={form.industry} onChange={change}
                                   maxLength={100} className={inputClass}
                                   placeholder="пр. Софтвер, Финансии" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Локација</label>
                            <input name="location" value={form.location} onChange={change}
                                   maxLength={100} className={inputClass} placeholder="пр. Скопје" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Веб-страница</label>
                        <input name="website" value={form.website} onChange={change}
                               maxLength={255} className={inputClass} placeholder="https://firma.com.mk" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-800">
                        За компанијата
                    </h2>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Опис</label>
                        <textarea name="description" value={form.description} onChange={change}
                                  rows={6} maxLength={2000} className={inputClass}
                                  placeholder="Кратко претстави ја компанијата, што работите и каква култура имате." />
                        <p className="mt-1 text-right text-xs text-slate-400">{form.description.length}/2000</p>
                    </div>
                </div>

                {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                {success && (
                    <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>
                )}

                <div className="border-t border-slate-100 pt-5">
                    <button type="submit" disabled={saving}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Се зачувува...' : 'Зачувај'}
                    </button>
                </div>
            </form>
        </div>
    )
}