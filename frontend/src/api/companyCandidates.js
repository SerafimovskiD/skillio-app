import client from './client'

export const getCandidates = (postingId, mode = 'HYBRID', limit = 50) =>
    client
        .get(`/company/postings/${postingId}/candidates`, { params: { mode, limit } })
        .then((res) => res.data)