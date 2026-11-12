import { useEffect, useState } from 'react'

function initialDark() {
    try {
        const saved = localStorage.getItem('theme')
        if (saved) return saved === 'dark'
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default function ThemeToggle() {
    const [dark, setDark] = useState(initialDark)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light')
        } catch { /* ignore */ }
    }, [dark])

    return (
        <button type="button" onClick={() => setDark((d) => !d)}
                aria-label={dark ? 'Светол режим' : 'Темен режим'}
                title={dark ? 'Светол режим' : 'Темен режим'}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
            {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    )
}