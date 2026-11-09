import api from './client'

export const getMySavedPostings = () => api.get('/saved-postings').then((r) => r.data)

export const savePosting = (postingId) => api.put(`/saved-postings/${postingId}`).then((r) => r.data)

export const unsavePosting = (postingId) => api.delete(`/saved-postings/${postingId}`)