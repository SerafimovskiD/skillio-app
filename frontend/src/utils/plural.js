// Македонска множина: 1, 21, 31... → еднина (освен 11, 111...), останато → множина
const isOne = (n) => n % 10 === 1 && n % 100 !== 11

// plural(1, 'апликација', 'апликации') → "1 апликација"
export const plural = (n, one, many) => `${n} ${isOne(n) ? one : many}`

// Само зборот, без бројот
export const pluralWord = (n, one, many) => (isOne(n) ? one : many)