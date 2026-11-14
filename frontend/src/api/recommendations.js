import api from './client'

export const getRecommendedPostings = (mode = 'HYBRID', limit = 50) =>
    api.get('/recommendations/postings', { params: { mode, limit } }).then((r) => r.data)