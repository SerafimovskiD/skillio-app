import client from './client'

export const getMyProjects = () => client.get('/profile/projects').then((res) => res.data)

export const createProject = (payload) =>
    client.post('/profile/projects', payload).then((res) => res.data)

export const updateProject = (id, payload) =>
    client.put(`/profile/projects/${id}`, payload).then((res) => res.data)

export const deleteProject = (id) => client.delete(`/profile/projects/${id}`)