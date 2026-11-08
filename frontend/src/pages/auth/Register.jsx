import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { homeFor } from '../../utils/routes'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'

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
        <div className="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-slate-800">Регистрација</h1>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
                {[['STUDENT', 'Студент'], ['COMPANY', 'Компанија']].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                            className={`rounded-md py-2 ${form.role === value ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Вашето име</label>
                    <input required value={form.name} onChange={set('name')} className={inputClass} />
                </div>
                {isCompany && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Име на компанија</label>
                        <input required value={form.companyName} onChange={set('companyName')} className={inputClass} />
                    </div>
                )}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Е-пошта</label>
                    <input type="email" required value={form.email} onChange={set('email')} className={inputClass} />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Лозинка (мин. 8 знаци)</label>
                    <input type="password" required minLength={8} value={form.password} onChange={set('password')} className={inputClass} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {loading ? 'Се регистрирам...' : 'Регистрирај се'}
                </button>
            </form>
            <p className="mt-4 text-sm text-slate-600">
                Веќе имаш профил? <Link to="/login" className="text-indigo-600 hover:underline">Најави се</Link>
            </p>
        </div>
    )
}