import api from './client'

export const getMyApplications = () => api.get('/applications').then((r) => r.data)

export const applyToPosting = (postingId, message, attachCv = false) =>
    api.post('/applications', { postingId, message: message || null, attachCv }).then((r) => r.data)

export const cancelApplication = (id) => api.delete(`/applications/${id}`)