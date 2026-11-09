import client from './client'

export const getPostings = (categoryId) =>
    client.get('/postings', { params: categoryId ? { categoryId } : {} }).then((res) => res.data)

export const getPosting = (id) => client.get(`/postings/${id}`).then((res) => res.data)