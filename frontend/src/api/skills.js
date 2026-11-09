import client from './client'

export const getAllSkills = () => client.get('/skills').then((res) => res.data)

export const getMySkills = () => client.get('/profile/skills').then((res) => res.data)

// PUT е и за додавање и за промена на ниво
export const setSkill = (skillId, level) =>
    client.put(`/profile/skills/${skillId}`, { level }).then((res) => res.data)

export const removeSkill = (skillId) => client.delete(`/profile/skills/${skillId}`)