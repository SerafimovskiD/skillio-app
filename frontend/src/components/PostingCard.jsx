import { Link } from 'react-router-dom'
import {
    TYPE_LABELS,
    WORK_MODE_LABELS,
    daysUntil,
    formatDate,
    isExpired,
    isNew,
} from '../utils/postings'

export default function PostingCard({ posting, note, children }) {
    const expired = isExpired(posting.deadline)
    const left = daysUntil(posting.deadline)
    const soon = !expired && left !== null && left <= 7

    let deadlineText = 'Без рок за аплицирање'
    let deadlineCls = 'text-slate-500'

    if (posting.deadline) {
        if (expired) {
            deadlineText = `Рокот истече на ${formatDate(posting.deadline)}`
            deadlineCls = 'text-red-600'
        } else if (soon) {
            deadlineText = `Уште ${left} ${left === 1 ? 'ден' : 'дена'} (до ${formatDate(posting.deadline)})`
            deadlineCls = 'font-medium text-amber-700'
        } else {
            deadlineText = `Рок: ${formatDate(posting.deadline)}`
        }
    }

    return (
        <article
            className={`flex flex-col rounded-xl bg-white p-5 shadow transition hover:shadow-md ${
                expired ? 'opacity-75' : ''
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-base font-semibold text-indigo-700">
                    {(posting.companyName ?? '?')[0].toUpperCase()}
                </div>

                <div className="min-w-0">
                    <Link
                        to={`/student/postings/${posting.id}`}
                        title={posting.title}
                        className="block truncate text-lg font-semibold leading-snug text-slate-800 hover:text-indigo-600"
                    >
                        {posting.title}
                    </Link>

                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <span>
                            {posting.companyName}
                            {posting.location && ` · ${posting.location}`}
                        </span>
                        {isNew(posting.createdAt) && !expired && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                Ново
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                    {TYPE_LABELS[posting.type] ?? posting.type}
                </span>
                {posting.categoryName && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {posting.categoryName}
                    </span>
                )}
                {posting.workMode && (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                        {WORK_MODE_LABELS[posting.workMode] ?? posting.workMode}
                    </span>
                )}
            </div>

            <p className={`mt-3 text-sm ${deadlineCls}`}>{deadlineText}</p>
            {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link
                    to={`/student/postings/${posting.id}`}
                    className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                    Детали
                </Link>
                {children}
            </div>
        </article>
    )
}