# Skillio

Web platform for internships and jobs with AI-based recommendations (diploma thesis, FINKI).

Students get recommended postings and companies get recommended candidates. The ranking combines
semantic similarity (multilingual sentence embeddings), skill match and category match.

## Stack
- Backend: Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA
- Frontend: React 19, Vite, Tailwind CSS
- Database: PostgreSQL 16 + pgvector
- AI service: Python, FastAPI, sentence-transformers (`paraphrase-multilingual-MiniLM-L12-v2`, 384 dimensions)

## Prerequisites
- Docker (for the database)
- Java 21
- Node.js 20.19+ (or 22+), needed for the frontend
- Python 3.10+

## Run locally
Start the parts in this order (the backend needs the database and the AI service):

1. **Database**
   ```
   docker compose up -d
   ```
   PostgreSQL listens on port 5433. The pgvector extension is created by `db/init.sql` on the first start.

2. **AI service** (port 8000; the first start downloads the model, about 470 MB)
   ```
   cd ai-service
   python -m venv .venv
   .venv\Scripts\activate          # Linux/macOS: source .venv/bin/activate
   pip install -r requirements.txt
   python -m uvicorn main:app --port 8000
   ```
   Health check: http://localhost:8000/health

3. **Backend** (port 8080): run `BackendApplication` from IntelliJ, or
   ```
   cd backend
   ./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
   ```
   Tables are created automatically on the first start, together with the categories and skills.

4. **Frontend** (port 5173)
   ```
   cd frontend
   npm install
   npm run dev
   ```

API documentation (Swagger UI): http://localhost:8080/swagger-ui/index.html

## Demo data
The application starts empty. To load 10 companies, 40 postings and 20 students, start the backend once
with the Spring profile `seed`:

- IntelliJ: Run > Edit Configurations > `BackendApplication` > Active profiles = `seed`
- or `./mvnw spring-boot:run -Dspring-boot.run.profiles=seed` (Windows: `mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"`)

Requirements: the database and the AI service are running, and the backend was started normally at least once.
The seeder is idempotent (existing e-mails are skipped), uses only `@example.com` addresses and also writes
the evaluation files to `evaluation/data/`. **Clear the profile afterwards.**
All accounts, with the shared password, are listed in [SEED_DATA.md](SEED_DATA.md).

## Configuration
Defaults work for local development. They can be overridden with environment variables:

| Variable | Default |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/skillio` |
| `DB_USERNAME` / `DB_PASSWORD` | `skillio` / `skillio` |
| `JWT_SECRET` | development key (set your own, at least 32 bytes, for any real deployment) |
| `AI_SERVICE_URL` | `http://localhost:8000` |

The recommendation weights (`recommendation.weights.*`, default 0.6 / 0.3 / 0.1) are in
`backend/src/main/resources/application.properties`.

## Evaluation
The recommendation quality is evaluated against a rule-based ground truth for the seeded data
(P@K, R@K, MRR, nDCG@K, bootstrap confidence intervals, paired comparison, weight sensitivity).
With the database, AI service and backend running (**without** the `seed` profile):

```
pip install -r evaluation/requirements.txt
python evaluation/run_evaluation.py      # methods vs baselines
python evaluation/tune_weights.py        # weight sensitivity analysis
```

Results are written to `evaluation/results/`. Summary (nDCG@5):

| Method | student -> postings | posting -> candidates |
|---|---|---|
| Hybrid (default) | 0.976 | 0.984 |
| Skills only | 0.975 | 0.964 |
| Embeddings only | 0.770 | 0.881 |
| Category only | 0.586 | 0.769 |
| Random | 0.124 | 0.180 |

Limitation: the ground truth is built from skills and categories, so the skills-based methods are close to
the ceiling by construction. See `evaluation/results/` for details.

## Project structure
```
backend/      Spring Boot application (seed/ contains the demo data and the evaluation exporter)
frontend/     React application
ai-service/   FastAPI service that creates embeddings
db/           database initialization script
evaluation/   evaluation scripts, data and results
SEED_DATA.md  demo accounts
```

## Reset the database
`docker compose down -v` deletes the database volume **with all data**. Use it only to start from scratch.