import { Link } from 'react-router-dom'
import { TYPE_LABELS, formatDate, isExpired } from '../utils/postings'

export default function PostingCard({ posting }) {
    const expired = isExpired(posting.deadline)

    return (
        <article className="flex flex-col rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-800">{posting.title}</h3>
            <p className="mt-1 text-sm text-slate-600">
                {posting.companyName}
                {posting.location && ` · ${posting.location}`}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                    {TYPE_LABELS[posting.type] ?? posting.type}
                </span>
                {posting.categoryName && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {posting.categoryName}
                    </span>
                )}
            </div>

            <p className={`mt-3 text-xs ${expired ? 'text-red-600' : 'text-slate-500'}`}>
                {posting.deadline
                    ? expired
                        ? `Рокот истече на ${formatDate(posting.deadline)}`
                        : `Рок: ${formatDate(posting.deadline)}`
                    : 'Без рок'}
            </p>

            <div className="mt-auto pt-4">
                <Link to={`/student/postings/${posting.id}`}
                      className="inline-block rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                    Детали
                </Link>
            </div>
        </article>
    )
}