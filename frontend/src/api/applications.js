import api from './client'

export const getMyApplications = () => api.get('/applications').then((r) => r.data)

export const applyToPosting = (postingId, message) =>
    api.post('/applications', { postingId, message: message || null }).then((r) => r.data)

export const cancelApplication = (id) => api.delete(`/applications/${id}`)