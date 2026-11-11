import client from './client'
import { saveBlob } from './cv'

export const getPostingApplications = (postingId) =>
    client.get(`/company/postings/${postingId}/applications`).then((res) => res.data)

export const updateApplicationStatus = (applicationId, status) =>
    client.put(`/company/applications/${applicationId}/status`, { status }).then((res) => res.data)

export async function downloadApplicationCv(applicationId, fileName) {
    const res = await client.get(`/company/applications/${applicationId}/cv`, {
        responseType: 'blob',
    })
    saveBlob(res.data, fileName || 'cv.pdf')
}