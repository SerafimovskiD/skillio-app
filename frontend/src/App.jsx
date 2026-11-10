import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { homeFor } from './utils/routes'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import CompanyDashboard from './pages/company/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentPostings from './pages/student/Postings'
import StudentPostingDetails from './pages/student/PostingDetails'
import StudentApplications from './pages/student/Applications'
import StudentSavedPostings from './pages/student/SavedPostings'
import StudentRecommendations from './pages/student/Recommendations'
import CompanyProfile from './pages/company/CompanyProfile'
import CompanyPostings from './pages/company/MyPostings'
import PostingForm from './pages/company/PostingForm'
import PostingApplications from './pages/company/PostingApplications'
import PostingCandidates from './pages/company/PostingCandidates'
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
                <Route path="/student/profile" element={
                    <ProtectedRoute role="STUDENT"><StudentProfile /></ProtectedRoute>
                } />
                <Route path="/student/postings" element={
                    <ProtectedRoute role="STUDENT"><StudentPostings /></ProtectedRoute>
                } />
                <Route path="/student/postings/:id" element={
                    <ProtectedRoute role="STUDENT"><StudentPostingDetails /></ProtectedRoute>
                } />
                <Route path="/student/applications" element={
                    <ProtectedRoute role="STUDENT"><StudentApplications /></ProtectedRoute>
                } />
                <Route path="/student/saved" element={
                    <ProtectedRoute role="STUDENT"><StudentSavedPostings /></ProtectedRoute>
                } />
                <Route path="/student/recommendations" element={
                    <ProtectedRoute role="STUDENT"><StudentRecommendations /></ProtectedRoute>
                } />
                <Route path="/company/profile" element={
                    <ProtectedRoute role="COMPANY"><CompanyProfile /></ProtectedRoute>
                } />
                <Route path="/company/postings" element={
                    <ProtectedRoute role="COMPANY"><CompanyPostings /></ProtectedRoute>
                } />
                <Route path="/company/postings/new" element={
                    <ProtectedRoute role="COMPANY"><PostingForm /></ProtectedRoute>
                } />
                <Route path="/company/postings/:id/edit" element={
                    <ProtectedRoute role="COMPANY"><PostingForm /></ProtectedRoute>
                } />
                <Route path="/company/postings/:id/applications" element={
                    <ProtectedRoute role="COMPANY"><PostingApplications /></ProtectedRoute>
                } />
                <Route path="/company/postings/:id/candidates" element={
                    <ProtectedRoute role="COMPANY"><PostingCandidates /></ProtectedRoute>
                } />
                <Route path="*" element={<Root />} />
            </Routes>
        </div>
    )
}