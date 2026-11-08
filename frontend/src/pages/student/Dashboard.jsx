import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">Здраво, {user.name}</h1>
            <p className="mt-2 text-slate-600">Студентски дел (тука ќе бидат профилот, огласите и препораките).</p>
        </div>
    )
}