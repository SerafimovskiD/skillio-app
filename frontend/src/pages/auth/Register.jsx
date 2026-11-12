import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { homeFor } from '../../utils/routes'
import Typewriter from '../../components/Typewriter'
import PasswordInput from '../../components/PasswordInput'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const ROLES = [
    { value: 'STUDENT', title: 'Студент'},
    { value: 'COMPANY', title: 'Компанија'},
]

export default function Register() {
    const { user, signIn } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        role: 'STUDENT', name: '', companyName: '', email: '', password: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (user) return <Navigate to={homeFor(user.role)} replace />

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
    const isCompany = form.role === 'COMPANY'

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const payload = {
                email: form.email,
                password: form.password,
                name: form.name,
                role: form.role,
                companyName: isCompany ? form.companyName : null,
            }
            const auth = await register(payload)
            signIn(auth)
            navigate(homeFor(auth.role))
        } catch (err) {
            setError(err.response?.data?.message || 'Регистрацијата не успеа. Провери ги податоците.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto mt-10 max-w-md px-4 pb-10">
            <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">
                    <Typewriter text="Skillio" speed={110} cursor />
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    <Typewriter text="Веб платформа за пракси и работа со паметни препораки" speed={35} delay={900} />
                </p>
            </div>

            <div className="mt-6 rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-slate-800">Регистрација</h1>
                <p className="mt-1 text-sm text-slate-500">Креирај профил за неколку секунди.</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    {ROLES.map((r) => (
                        <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                                className={`rounded-lg border p-3 text-left transition ${
                                    form.role === r.value
                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}>
                            <p className={`font-medium ${form.role === r.value ? 'text-indigo-700' : 'text-slate-800'}`}>
                                {r.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">{r.hint}</p>
                        </button>
                    ))}
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {isCompany ? 'Име и презиме на контакт лице' : 'Име и презиме'}
                        </label>
                        <input required autoComplete="name" value={form.name} onChange={set('name')}
                               className={inputClass} />
                    </div>
                    {isCompany && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Име на компанија</label>
                            <input required value={form.companyName} onChange={set('companyName')}
                                   className={inputClass} />
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Е-пошта</label>
                        <input type="email" required autoComplete="email" value={form.email}
                               onChange={set('email')} className={inputClass} placeholder="ime@primer.com" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Лозинка</label>
                        <PasswordInput required minLength={8} autoComplete="new-password"
                                       value={form.password} onChange={set('password')} />
                        <p className="mt-1 text-xs text-slate-500">Најмалку 8 знаци.</p>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                    )}

                    <button type="submit" disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {loading ? 'Се регистрирам...' : 'Регистрирај се'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Веќе имаш профил?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:underline">Најави се</Link>
                </p>
            </div>
        </div>
    )
}