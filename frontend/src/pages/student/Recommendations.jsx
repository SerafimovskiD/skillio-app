import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendedPostings } from '../../api/recommendations'
import { TYPE_LABELS, WORK_MODE_LABELS, formatDate, isExpired } from '../../utils/postings'
import { scoreStyle, toPercent } from '../../utils/score'
import PageHeader from '../../components/PageHeader'
import Typewriter from '../../components/Typewriter'

const MODES = [
    {
        value: 'HYBRID',
        label: 'Комбинирано',
        hint: 'Ги комбинира AI сличноста на текстот, вештините и областа. Препорачано.',
    },
    {
        value: 'EMBEDDING',
        label: 'AI сличност',
        hint: 'Го споредува значењето на твојот профил со описот на огласот, без точно совпаѓање на вештини.',
    },
    {
        value: 'SKILLS',
        label: 'Вештини',
        hint: 'Само колку од бараните вештини ги имаш. Задолжителните тежат повеќе од предностите.',
    },
]

// тежини во комбинираниот режим (се совпаѓаат со backend-от)
const WEIGHTS = { similarity: 0.6, skills: 0.3, category: 0.1 }

function verdictFor(pct) {
    if (pct >= 70) return { label: 'Одлично совпаѓање', cls: 'text-green-700' }
    if (pct >= 50) return { label: 'Добро совпаѓање', cls: 'text-green-700' }
    if (pct >= 40) return { label: 'Делумно совпаѓање', cls: 'text-amber-700' }
    return { label: 'Слабо совпаѓање', cls: 'text-slate-600' }
}

function SkillChips({ skillMatch }) {
    const { matched, missing } = skillMatch
    if (matched.length + missing.length === 0) return null
    return (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {matched.map((name) => (
                <span key={`m-${name}`} className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">
                    ✓ {name}
                </span>
            ))}
            {missing.map((name) => (
                <span key={`x-${name}`} className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
                    ✗ {name}
                </span>
            ))}
        </div>
    )
}

function SkillBreakdown({ skillMatch }) {
    const { matched, missing } = skillMatch
    const total = matched.length + missing.length
    if (total === 0) return null
    return (
        <div className="mt-3">
            <p className="text-sm text-slate-600">
                Вештини: <span className="font-medium text-slate-800">{matched.length} од {total}</span>
            </p>
            <SkillChips skillMatch={skillMatch} />
        </div>
    )
}

function Section({ number, title, value, children }) {
    const pct = toPercent(value)
    const style = scoreStyle(pct)
    return (
        <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {number}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{title}</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`w-10 text-right text-sm font-semibold ${style.text}`}>{pct}%</span>
                    </div>
                </div>
                <div className="mt-1 text-sm text-slate-600">{children}</div>
            </div>
        </div>
    )
}

function skillsSentence(skillMatch) {
    const matched = skillMatch?.matched ?? []
    const missing = skillMatch?.missing ?? []
    const total = matched.length + missing.length
    if (total === 0) return 'Огласот нема наведени вештини, па овој дел не може да се оцени.'
    let text =
        matched.length > 0
            ? `Ги исполнуваш ${matched.length} од ${total} вештини: ${matched.join(', ')}.`
            : `Не ја исполнуваш ниту една од ${total} бараните вештини.`
    if (missing.length > 0) {
        text += ` Ти фалат ${missing.join(', ')}. Ако ги научиш и ги додадеш во профилот, совпаѓањето расте.`
    }
    return text
}

function intro(mode, { similarity, skillMatch, categoryMatch }) {
    const matched = skillMatch?.matched ?? []
    const missing = skillMatch?.missing ?? []
    const total = matched.length + missing.length

    if (mode === 'EMBEDDING') {
        return 'Системот го чита твојот профил (вештини, интереси, проекти, образование) и описот на огласот и проценува колку зборуваат за иста работа. Не ги брои точните вештини ниту областа.'
    }
    if (mode === 'SKILLS') {
        return 'Овој режим гледа само колку од бараните вештини ги имаш. Задолжителните вештини се бројат со тежина 1, а пожелните со 0,5.'
    }

    let skillsPart
    if (total === 0) skillsPart = 'Огласот нема наведени вештини'
    else {
        const ratio = matched.length / total
        if (ratio >= 0.7) skillsPart = 'Ги имаш повеќето бараните вештини'
        else if (ratio >= 0.4) skillsPart = 'Имаш дел од бараните вештини'
        else if (ratio > 0) skillsPart = 'Имаш малку од бараните вештини'
        else skillsPart = 'Не ги исполнуваш бараните вештини'
    }
    const catPart = categoryMatch ? ', а областа е од твој интерес.' : ', а областа не е меѓу твоите интереси.'
    return skillsPart + catPart
}

function ExplainPanel({ mode, item }) {
    const { posting, score, similarity, skillMatch, categoryMatch } = item
    const pct = toPercent(score)
    const verdict = verdictFor(pct)
    const catValue = categoryMatch ? 1 : 0
    const simPct = toPercent(similarity)
    const simWord = simPct >= 70 ? 'многу слични' : simPct >= 50 ? 'делумно слични' : 'малку слични'
    const areaName = posting.categoryName ? `„${posting.categoryName}“` : 'на огласот'

    return (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
            <p className={`text-sm font-semibold ${verdict.cls}`}>
                {verdict.label} ({pct}%)
            </p>
            <p className="mt-1 text-sm text-slate-700">{intro(mode, item)}</p>

            <div className="mt-4 space-y-4">
                {(mode === 'HYBRID' || mode === 'SKILLS') && skillMatch && (
                    <Section number={mode === 'HYBRID' ? 1 : 1} title="Вештини" value={skillMatch.score}>
                        <p>{skillsSentence(skillMatch)}</p>
                        <SkillChips skillMatch={skillMatch} />
                    </Section>
                )}

                {mode === 'HYBRID' && (
                    <Section number={2} title="Област" value={catValue}>
                        {categoryMatch
                            ? `Огласот е во областа ${areaName}, која ја избра како интерес.`
                            : `Огласот е во областа ${areaName}, која не е меѓу твоите интереси. Додај ја во профилот ако те интересира.`}
                    </Section>
                )}

                {(mode === 'HYBRID' || mode === 'EMBEDDING') && (
                    <Section number={mode === 'HYBRID' ? 3 : 1} title="Сличност на текст (AI)" value={similarity}>
                        <p>
                            Твојот профил и описот на огласот се {simWord} по значење. Системот ги препознава
                            и сродни поими, не само исти зборови.
                        </p>
                    </Section>
                )}
            </div>

            {mode === 'HYBRID' && (
                <p className="mt-4 rounded-md bg-white px-3 py-2 text-xs text-slate-600">
                    Како се пресметува: {Math.round(WEIGHTS.skills * 100)}% вештини ({toPercent(skillMatch?.score ?? 0)}%) +{' '}
                    {Math.round(WEIGHTS.category * 100)}% област ({toPercent(catValue)}%) +{' '}
                    {Math.round(WEIGHTS.similarity * 100)}% сличност на текст ({simPct}%) ={' '}
                    <span className="font-semibold text-slate-800">{pct}%</span>
                </p>
            )}

            {mode === 'EMBEDDING' && (
                <p className="mt-4 rounded-md bg-white px-3 py-2 text-xs text-slate-500">
                    Сличноста на текст ретко паѓа под 40% дури и за неповрзани огласи, па процентите
                    во овој режим се во потесен опсег. Погледни го табот „Комбинирано“ за појасна слика.
                </p>
            )}
        </div>
    )
}

function RecommendationCard({ item, mode, showScore }) {
    const { posting, score, skillMatch, categoryMatch } = item
    const [open, setOpen] = useState(false)
    const pct = toPercent(score)
    const style = scoreStyle(pct)
    const expired = isExpired(posting.deadline)

    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link to={`/student/postings/${posting.id}`}
                          className="text-lg font-semibold text-slate-800 hover:text-indigo-600">
                        {posting.title}
                    </Link>
                    <p className="text-sm text-slate-600">
                        {[posting.companyName, posting.location].filter(Boolean).join(' · ')}
                    </p>
                </div>
                {showScore && (
                    <div className="shrink-0 text-right">
                        <p className={`text-2xl font-bold ${style.text}`}>{pct}%</p>
                        <p className="text-xs text-slate-500">совпаѓање</p>
                    </div>
                )}
            </div>

            {showScore && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
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

            {showScore && !open && skillMatch && <SkillBreakdown skillMatch={skillMatch} />}
            {showScore && !open && categoryMatch && (
                <p className="mt-2 text-sm text-green-700">✓ Областа е од твој интерес</p>
            )}

            <p className={`mt-3 text-sm ${expired ? 'text-red-600' : 'text-slate-500'}`}>
                {posting.deadline
                    ? expired
                        ? `Рокот истече на ${formatDate(posting.deadline)}`
                        : `Рок: ${formatDate(posting.deadline)}`
                    : 'Без рок'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
                {showScore && (
                    <button type="button" onClick={() => setOpen((v) => !v)}
                            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                        Зошто е препорачано?
                    </button>
                )}
                <Link to={`/student/postings/${posting.id}`}
                      className="rounded-lg border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                    Детали
                </Link>
            </div>

            {showScore && open && <ExplainPanel mode={mode} item={item} />}
        </div>
    )
}

export default function Recommendations() {
    const [mode, setMode] = useState('HYBRID')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // чекање само додека се пишува насловот; по прв клик на таб паѓа на 0
    const [hintDelay, setHintDelay] = useState('Препораки за тебе'.length * 45 + 200)
    const changeMode = (value) => {
        setHintDelay(0)
        setMode(value)
    }

    useEffect(() => {
        let ignore = false
        setLoading(true)
        setError('')
        getRecommendedPostings(mode)
            .then((data) => {
                if (!ignore) setItems(data)
            })
            .catch(() => {
                if (!ignore) setError('Не можев да ги вчитам препораките.')
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [mode])

    const allZero = items.length > 0 && items.every((i) => i.score === 0)
    const currentMode = MODES.find((m) => m.value === mode)

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <PageHeader title="Препораки за тебе" />

            <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
                {MODES.map((m) => (
                    <button key={m.value} type="button" onClick={() => changeMode(m.value)}
                            className={`rounded-md px-3 py-1.5 font-medium ${
                                mode === m.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}>
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">
                {/* key = се пишува одново секогаш кога ќе смениш режим */}
                <Typewriter
                    key={mode}
                    text={currentMode.hint}
                    speed={12}
                    delay={hintDelay}
                />
            </p>

            {allZero && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    Профилот е се уште празен, па не можеме да пресметаме совпаѓање. Додај вештини и интереси во својот{' '}
                    <Link to="/student/profile" className="font-medium underline">профил</Link>{' '}
                    за да добиеш препораки прилагодени на тебе.
                </div>
            )}

            {error && <p className="mt-4 text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-slate-600">Се вчитува...</p>}

            {!loading && !error && items.length === 0 && (
                <div className="mt-6 rounded-xl bg-white p-6 text-slate-600 shadow">
                    Нема препораки. Додај вештини и интереси во{' '}
                    <Link to="/student/profile" className="text-indigo-600 hover:underline">профилот</Link>{' '}
                    за да добиеш препораки.
                </div>
            )}

            {!loading && (
                <div className="mt-6 space-y-4">
                    {items.map((item) => (
                        <RecommendationCard key={item.posting.id} item={item} mode={mode}
                                            showScore={!allZero} />
                    ))}
                </div>
            )}
        </div>
    )
}