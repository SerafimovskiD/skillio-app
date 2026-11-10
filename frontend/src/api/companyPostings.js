import client from './client'

export const getMyPostings = () =>
    client.get('/company/postings').then((res) => res.data)

export const getMyPosting = (id) =>
    client.get(`/company/postings/${id}`).then((res) => res.data)

export const createPosting = (data) =>
    client.post('/company/postings', data).then((res) => res.data)

export const updatePosting = (id, data) =>
    client.put(`/company/postings/${id}`, data).then((res) => res.data)

export const deletePosting = (id) =>
    client.delete(`/company/postings/${id}`)