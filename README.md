# Skillio

Web platform for internships and jobs with AI-based recommendations (diploma thesis, FINKI).

## Stack
- Backend: Java 21, Spring Boot, Spring Data JPA
- Frontend: React, Vite
- Database: PostgreSQL 16 + pgvector
- AI service: Python, FastAPI, sentence-transformers

## Run locally
1. Database: `docker compose up -d`
2. Backend: run `BackendApplication` in `backend/` (port 8080)
3. Frontend: `cd frontend && npm install && npm run dev` (port 5173)
4. AI service: `cd ai-service && python -m uvicorn main:app --port 8000`