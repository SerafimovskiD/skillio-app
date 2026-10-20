from fastapi import FastAPI

app = FastAPI(title="Skillio AI")

# обична проверка дали сервисот работи
@app.get("/health")
def health():
    return {"status": "ok"}