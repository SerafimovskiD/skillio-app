import client from './client'

export const getMyEducation = () => client.get('/profile/education').then((res) => res.data)

export const createEducation = (payload) =>
    client.post('/profile/education', payload).then((res) => res.data)

export const updateEducation = (id, payload) =>
    client.put(`/profile/education/${id}`, payload).then((res) => res.data)

export const deleteEducation = (id) => client.delete(`/profile/education/${id}`)