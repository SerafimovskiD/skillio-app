import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../utils/routes'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const logout = () => {
        signOut()
        navigate('/login')
    }
    const displayName = user?.role === 'COMPANY' && user.companyName ? user.companyName : user?.name
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to={user ? homeFor(user.role) : '/login'} className="text-xl font-bold text-indigo-600">
                    Skillio
                </Link>
                {user ? (
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">
                            {displayName} · {user.role === 'COMPANY' ? 'Компанија' : 'Студент'}
                        </span>
                        <button onClick={logout}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                            Одјава
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3 text-sm">
                        <Link to="/login" className="px-3 py-1.5 hover:text-indigo-600">Најава</Link>
                        <Link to="/register"
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
                            Регистрација
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}