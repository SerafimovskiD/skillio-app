from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, Field, StringConstraints
from sentence_transformers import SentenceTransformer

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
models = {}

NonEmptyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    model = SentenceTransformer(MODEL_NAME)
    model.max_seq_length = 256
    models["embedder"] = model
    yield
    models.clear()


app = FastAPI(title="Skillio AI service", lifespan=lifespan)


class EmbedRequest(BaseModel):
    texts: list[NonEmptyText] = Field(min_length=1, max_length=100)


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    dimension: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest):
    vectors = models["embedder"].encode(request.texts, normalize_embeddings=True)
    return EmbedResponse(embeddings=vectors.tolist(), dimension=int(vectors.shape[1]))