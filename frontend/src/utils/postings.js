export const TYPE_LABELS = { INTERNSHIP: 'Пракса', JOB: 'Работа' }

// "2026-12-31" -> "31.12.2026"
export const formatDate = (d) => (d ? d.split('-').reverse().join('.') : '')

export const isExpired = (deadline) =>
    !!deadline && deadline < new Date().toLocaleDateString('sv-SE')

// "2026-11-02T10:00:00Z" -> "пред 7 дена"
export const timeAgo = (iso) => {
    if (!iso) return ''
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
    if (days <= 0) return 'денес'
    if (days === 1) return 'вчера'
    if (days < 30) return `пред ${days} дена`
    const months = Math.floor(days / 30)
    return months === 1 ? 'пред 1 месец' : `пред ${months} месеци`
}