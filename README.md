## MCQ Maker (Next.js + PostgreSQL + Prisma)

Features:
- **Admin CSV upload**: `http://localhost:3000/admin/upload`
- **Practice UI** (progress + hint + next): `http://localhost:3000/practice/[quizId]`
- **Quiz list** homepage: `http://localhost:3000`

### Setup (local)

1) Install deps:

```bash
npm install
```

2) Create `.env` (copy from `env.example`) and set your DB url:

```bash
copy env.example .env
```

3) Start PostgreSQL (optional, via Docker):

```bash
docker compose up -d
```

4) Apply Prisma schema:

```bash
npm run prisma:migrate
```

5) Run the app:

```bash
npm run dev
```

### CSV format

You can use either:

- Columns: `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer`, optional `hint`
- Or: `question`, `options` (pipe-separated like `A|B|C|D`), `answer`, optional `hint`

`answer` can be:
- **A/B/C/D**
- **1..N** (1-based)
- **0..N-1** (0-based)
- or **the exact option text**

Example CSV is in `sample-quiz.csv`.
# MCQ
