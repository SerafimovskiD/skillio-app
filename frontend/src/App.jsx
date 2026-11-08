import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import client from './api/client'

function Home() {
    const [status, setStatus] = useState('проверувам...')

    useEffect(() => {
        client.get('/recommendations/postings')
            .then((res) => setStatus(`OK (${res.status})`))
            .catch((err) =>
                setStatus(
                    err.response
                        ? `Backend одговори со ${err.response.status}`
                        : 'Нема врска со backend'
                )
            )
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="rounded-xl bg-white p-8 shadow text-center">
                <h1 className="text-3xl font-bold text-indigo-600">Skillio</h1>
                <p className="mt-2 text-slate-600">Врска со backend: {status}</p>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    )
}