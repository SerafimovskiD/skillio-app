import client from './client'

export const getAllCategories = () => client.get('/categories').then((res) => res.data)

export const getMyInterests = () => client.get('/profile/interests').then((res) => res.data)

export const addInterest = (categoryId) =>
    client.put(`/profile/interests/${categoryId}`).then((res) => res.data)

export const removeInterest = (categoryId) => client.delete(`/profile/interests/${categoryId}`)