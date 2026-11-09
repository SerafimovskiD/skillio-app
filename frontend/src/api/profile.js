import client from "./client.js";

export const getProfile = () => client.get('/profile').then((res) => res.data)
export const updateProfile = (payload) =>
    client.put('/profile', payload).then((res) => res.data)