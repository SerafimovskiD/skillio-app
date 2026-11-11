import client from "./client";

export async function getMyCv() {
    const res = await client.get("/profile/cv");
    return res.status === 204 ? null : res.data;
}

export async function uploadCv(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await client.post("/profile/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function deleteCv() {
    await client.delete("/profile/cv");
}

export async function downloadMyCv(fileName) {
    const res = await client.get("/profile/cv/download", { responseType: "blob" });
    saveBlob(res.data, fileName || "cv.pdf");
}

export function saveBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}