# PDF-RAG

Full-stack **Retrieval-Augmented Generation** app for PDF documents. Upload a PDF, process it asynchronously (extract → chunk → embed → index), then ask questions grounded in the retrieved document content.

## How it works

```
PDF upload  →  MongoDB metadata + BullMQ job
                    ↓
              Worker extracts text (pdf-parse)
                    ↓
              Chunks (1000 / overlap 200)
                    ↓
              Gemini embeddings → Qdrant
                    ↓
Question → similarity search (top 5) → Gemini chat → grounded answer
```

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Clerk |
| API | Express 5, Multer, CORS |
| Metadata DB | MongoDB (Mongoose) |
| Queue | BullMQ + Valkey (Redis-compatible) |
| Vector store | Qdrant |
| Embeddings & LLM | Google Gemini (`@google/genai`) |
| Chunking | LangChain `RecursiveCharacterTextSplitter` |

## Prerequisites

- Node.js (ES modules)
- MongoDB running locally or remotely
- Docker (for Valkey + Qdrant)
- [Google Gemini API key](https://aistudio.google.com/apikey)
- [Clerk](https://clerk.com) keys (frontend auth)

## Project structure

```
pdf-rag/
├── docker-compose.yml      # Valkey + Qdrant
├── package.json            # LangChain / Gemini (shared deps)
├── client/                 # Next.js UI (Upload / Ask)
└── server/                 # Express API + document worker
    ├── server.js
    └── src/
        ├── controllers/    # ingest, chat
        ├── workers/        # async PDF processing
        ├── queues/
        ├── services/       # chunk, embed, vector, prompt
        └── models/
```

## Setup

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts:

- **Valkey** on `localhost:6379`
- **Qdrant** on `localhost:6333` (HTTP) / `6334` (gRPC)

MongoDB is not included in Compose — start it yourself and set `MONGO_URI`.

### 2. Install dependencies

Install at **both** the repo root and in `server` / `client` (LangChain and Gemini live in the root `package.json` and are resolved by the server):

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment variables

Create `server/.env`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/pdf-rag
REDIS_URL=redis://127.0.0.1:6379
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_CHAT_MODEL=gemini-3.6-flash
GEMINI_EMBEDDING_DIMENSIONS=768
QDRANT_URL=http://127.0.0.1:6333
QDRANT_COLLECTION=pdf_documents
```

Create `client/.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Run

You need **three** processes for the full pipeline:

```bash
# Terminal 1 — API
cd server
npm run dev

# Terminal 2 — background worker (required for ingest to complete)
cd server
npm run worker

# Terminal 3 — frontend
cd client
npm run dev
```

| Service | Script | Default URL |
|---------|--------|-------------|
| API | `npm run dev` (in `server`) | `http://localhost:8080` (or `PORT`) |
| Worker | `npm run worker` (in `server`) | — |
| UI | `npm run dev` (in `client`) | `http://localhost:3000` |

> The worker must be running for uploaded PDFs to move from `queued` → `processing` → `completed`.

## API

### Ingest a PDF

```bash
curl -X POST http://localhost:8080/api/ingest \
  -F "pdf=@./your-document.pdf"
```

**Response** `202`:

```json
{
  "success": true,
  "message": "Document uploaded and queued for processing",
  "documentId": "...",
  "jobId": "..."
}
```

Document status lifecycle: `queued` → `processing` → `completed` | `failed`.

### Ask a question

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What is this document about?\"}"
```

**Response** `200`:

```json
{
  "success": true,
  "question": "What is this document about?",
  "answer": "...",
  "results": [
    {
      "score": 0.85,
      "content": "...",
      "metadata": {}
    }
  ]
}
```

Answers are grounded in retrieved chunks. If there is not enough context, the model responds with:

> I couldn't find enough information in the provided document to answer this question.

## Frontend

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/upload` |
| `/upload` | PDF upload UI |
| `/ask` | Q&A UI |

Auth is handled by Clerk. The UI is scaffolded; wire it to `POST /api/ingest` and `POST /api/chat` to connect the full flow end-to-end.

## Notable details

- Embeddings use Gemini with task types `RETRIEVAL_DOCUMENT` (ingest) and `RETRIEVAL_QUERY` (chat), batched with rate-limit retries.
- Queue name: `document-processing`; worker concurrency: `3`; jobs retry up to `3` times with exponential backoff.
- Uploaded files are stored under `server/ingest/` (run the API from the `server` directory so Multer paths resolve correctly).
- API routes are currently unauthenticated; CORS is enabled globally.
