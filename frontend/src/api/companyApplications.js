import client from './client'

export const getPostingApplications = (postingId) =>
    client.get(`/company/postings/${postingId}/applications`).then((res) => res.data)

export const updateApplicationStatus = (applicationId, status) =>
    client.put(`/company/applications/${applicationId}/status`, { status }).then((res) => res.data)