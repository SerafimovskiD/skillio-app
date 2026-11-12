import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { homeFor } from '../../utils/routes'
import Typewriter from '../../components/Typewriter'
import PasswordInput from '../../components/PasswordInput'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function Login() {
    const { user, signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (user) return <Navigate to={homeFor(user.role)} replace />

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const auth = await login(email, password)
            signIn(auth)
            navigate(homeFor(auth.role))
        } catch (err) {
            setError(
                err.response?.status === 401 || err.response?.status === 403
                    ? 'Погрешна е-пошта или лозинка.'
                    : err.response?.data?.message || 'Настана грешка. Обиди се повторно.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto mt-12 max-w-md px-4">
            <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">
                    <Typewriter text="Skillio" speed={110} cursor />
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    <Typewriter text="Веб платформа за пракси и работа со паметни препораки" speed={35} delay={900} />
                </p>
            </div>

            <div className="mt-6 rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-slate-800">Најава</h1>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Е-пошта</label>
                        <input type="email" required autoComplete="email" value={email}
                               onChange={(e) => setEmail(e.target.value)} className={inputClass}
                               placeholder="ime@primer.com" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Лозинка</label>
                        <PasswordInput required autoComplete="current-password" value={password}
                                       onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                    )}

                    <button type="submit" disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {loading ? 'Се најавувам...' : 'Најави се'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Немаш профил?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:underline">
                        Регистрирај се
                    </Link>
                </p>
            </div>
        </div>
    )
}