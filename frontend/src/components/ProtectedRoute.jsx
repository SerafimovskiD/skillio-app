import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../utils/routes'

export default function ProtectedRoute({ role, children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />
    return children
}