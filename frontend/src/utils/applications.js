// Заеднички статуси за апликации (студент + компанија)
export const APPLICATION_STATUS = {
    SENT: {
        label: 'Испратено',
        className: 'bg-slate-100 text-slate-700',
        hint: 'Апликацијата е испратена и чека преглед од компанијата.',
    },
    REVIEWED: {
        label: 'Прегледано',
        className: 'bg-blue-50 text-blue-700',
        hint: 'Компанијата ја прегледа вашата апликација.',
    },
    INTERVIEW: {
        label: 'Интервју',
        className: 'bg-amber-50 text-amber-700',
        hint: 'Компанијата сака да те интервјуира. Следи ја твојата е-пошта.',
    },
    REJECTED: {
        label: 'Одбиено',
        className: 'bg-red-50 text-red-700',
        hint: 'Оваа апликација не е прифатена. Не се откажувај, пробај со други огласи.',
    },
    ACCEPTED: {
        label: 'Прифатено',
        className: 'bg-green-50 text-green-700',
        hint: 'Честитки! Апликацијата е прифатена.',
    },
}

// Листа по редослед: [{ value, label, className, hint }]
export const STATUS_LIST = Object.entries(APPLICATION_STATUS).map(([value, s]) => ({ value, ...s }))

export const LEVEL_LABELS = { BEGINNER: 'Почетник', INTERMEDIATE: 'Средно', ADVANCED: 'Напредно' }

export const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}.${mm}.${d.getFullYear()}`
}

export const initials = (name) =>
    (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')

export const STATUS_BORDER = {
    SENT: 'border-l-slate-300',
    REVIEWED: 'border-l-blue-400',
    INTERVIEW: 'border-l-amber-400',
    REJECTED: 'border-l-red-400',
    ACCEPTED: 'border-l-green-500',
}