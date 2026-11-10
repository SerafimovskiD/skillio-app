import { Link } from 'react-router-dom'

export default function PostingNotFound() {
    return (
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
            <h1 className="text-2xl font-semibold text-slate-800">Огласот не е пронајден</h1>
            <p className="mt-2 text-sm text-slate-500">
                Огласот не постои или не е објавен од страна на вашата компанија.
            </p>
            <Link to="/company/postings"
                  className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                ← Назад кон мои огласи
            </Link>
        </div>
    )
}