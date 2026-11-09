import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

function readUser() {
    try {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser)

    const signIn = (auth) => {
        const u = { email: auth.email, name: auth.name, role: auth.role, companyName: auth.companyName }
        localStorage.setItem('token', auth.token)
        localStorage.setItem('user', JSON.stringify(u))
        setUser(u)
    }

    const updateUser = (patch) => {
        const next = { ...user, ...patch }
        localStorage.setItem('user', JSON.stringify(next))
        setUser(next)
    }

    const signOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    // client.js го брише токенот и испраќа настан кога е истечен
    useEffect(() => {
        const onExpired = () => setUser(null)
        window.addEventListener('auth:expired', onExpired)
        return () => window.removeEventListener('auth:expired', onExpired)
    }, [])

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}