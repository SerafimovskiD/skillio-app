// Каде оди корисникот по најава, според улогата
export const homeFor = (role) => (role === 'COMPANY' ? '/company' : '/student')