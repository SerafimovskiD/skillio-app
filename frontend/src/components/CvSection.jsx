import { useEffect, useRef, useState } from "react";
import { getMyCv, uploadCv, deleteCv, downloadMyCv } from "../api/cv";

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export default function CvSection() {
    const [cv, setCv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        getMyCv()
            .then(setCv)
            .catch(() => setError("CV-то не може да се вчита."))
            .finally(() => setLoading(false));
    }, []);

    async function handleFile(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError("");
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are allowed.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("The CV is too large (maximum 5 MB).");
            return;
        }
        setBusy(true);
        try {
            setCv(await uploadCv(file));
        } catch (err) {
            setError(err.response?.data?.message || "Setup failed..");
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        setBusy(true);
        setError("");
        try {
            await deleteCv();
            setCv(null);
        } catch {
            setError("The deletion failed.");
        } finally {
            setBusy(false);
        }
    }

    async function handleDownload() {
        setError("");
        try {
            await downloadMyCv(cv?.fileName);
        } catch {
            setError("The download failed.");
        }
    }

    return (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-800">CV</h2>
            <p className="mt-1 text-sm text-slate-500">
                Постави го твоето CV (PDF) тука.
            </p>

            {loading ? (
                <p className="mt-4 text-sm text-slate-500">Се вчитува...</p>
            ) : cv ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                    <div>
                        <p className="font-medium text-slate-800">📄 {cv.fileName}</p>
                        <p className="text-xs text-slate-500">Поставено на {formatDate(cv.uploadedAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleDownload}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Преземи
                        </button>
                        <button
                            onClick={() => inputRef.current?.click()}
                            disabled={busy}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {busy ? "Се качува..." : "Замени"}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={busy}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            Избриши
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {busy ? "Се поставува..." : "Постави CV (PDF)"}
                </button>
            )}

            <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={handleFile} className="hidden" />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    );
}