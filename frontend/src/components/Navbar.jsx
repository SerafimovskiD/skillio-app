import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../utils/routes'

const navClass = ({ isActive }) =>
    isActive ? 'font-medium text-indigo-600' : 'text-slate-600 hover:text-indigo-600'

const STUDENT_LINKS = [
    ['/student', 'Почетна', true],
    ['/student/postings', 'Огласи'],
    ['/student/recommendations', 'Препораки'],
    ['/student/applications', 'Апликации'],
    ['/student/saved', 'Зачувани'],
    ['/student/profile', 'Профил'],
]

const COMPANY_LINKS = [
    ['/company', 'Почетна', true],
    ['/company/postings', 'Мои огласи'],
    ['/company/profile', 'Профил'],
]

const initials = (name) =>
    (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const logout = () => {
        setOpen(false)
        signOut()
        navigate('/login')
    }

    const displayName = user?.role === 'COMPANY' && user.companyName ? user.companyName : user?.name
    const links = user?.role === 'STUDENT' ? STUDENT_LINKS : user?.role === 'COMPANY' ? COMPANY_LINKS : []

    return (
        <header className="relative border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-8">
                    <Link to={user ? homeFor(user.role) : '/login'} className="text-xl font-bold text-indigo-600">
                        Skillio
                    </Link>
                    <nav className="hidden gap-5 text-sm md:flex">
                        {links.map(([to, label, end]) => (
                            <NavLink key={to} to={to} end={end} className={navClass}>{label}</NavLink>
                        ))}
                    </nav>
                </div>

                {user ? (
                    <>
                        <div className="hidden items-center gap-3 text-sm md:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                {initials(displayName)}
                            </div>
                            <div className="hidden leading-tight lg:block">
                                <p className="font-medium text-slate-800">{displayName}</p>
                                <p className="text-xs text-slate-500">
                                    {user.role === 'COMPANY' ? 'Компанија' : 'Студент'}
                                </p>
                            </div>
                            <button onClick={logout}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                                Одјава
                            </button>
                        </div>
                        <button onClick={() => setOpen((v) => !v)} aria-label="Мени"
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-lg leading-none md:hidden">
                            {open ? '✕' : '☰'}
                        </button>
                    </>
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

            {user && open && (
                <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
                    <nav className="flex flex-col gap-3 text-sm">
                        {links.map(([to, label, end]) => (
                            <NavLink key={to} to={to} end={end} className={navClass} onClick={() => setOpen(false)}>
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                        <span className="text-slate-600">
                            {displayName} · {user.role === 'COMPANY' ? 'Компанија' : 'Студент'}
                        </span>
                        <button onClick={logout}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                            Одјава
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}