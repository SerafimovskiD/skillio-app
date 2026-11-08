import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { homeFor } from './utils/routes'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import CompanyDashboard from './pages/company/Dashboard'

function Root() {
    const { user } = useAuth()
    return <Navigate to={user ? homeFor(user.role) : '/login'} replace />
}

export default function App() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student" element={
                    <ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>
                } />
                <Route path="/company" element={
                    <ProtectedRoute role="COMPANY"><CompanyDashboard /></ProtectedRoute>
                } />
                <Route path="*" element={<Root />} />
            </Routes>
        </div>
    )
}