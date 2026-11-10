import client from './client'

export const getCompanyProfile = () =>
    client.get('/company/profile').then((res) => res.data)

export const updateCompanyProfile = (data) =>
    client.put('/company/profile', data).then((res) => res.data)