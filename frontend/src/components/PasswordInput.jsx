import { useState } from 'react'

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function PasswordInput(props) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative">
            <input {...props} type={show ? 'text' : 'password'} className={inputClass} />
            <button type="button" onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Скриј лозинка' : 'Прикажи лозинка'}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600">
                {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    )
}