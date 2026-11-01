from sentence_transformers import SentenceTransformer

model=SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
vectors=model.encode(["Java програмер", "Java developer", "Сметководител"])
print(vectors.shape)