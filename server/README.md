# AI Placement Assistant — Backend

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` to `.env` and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI`: get this from MongoDB Atlas (free tier) → Connect → Drivers
   - `JWT_SECRET`: any long random string (e.g. generate with `openssl rand -base64 32`)
   - `GEMINI_API_KEY`: get a free key at https://aistudio.google.com/apikey

3. **Run in dev mode** (auto-restarts on file changes)
   ```bash
   npm run dev
   ```
   Server starts on `http://localhost:5000`. Test it:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Folder Structure
```
server/
  config/db.js              MongoDB connection
  models/                   Mongoose schemas (User, Resume, Interview, Feedback)
  controllers/              Business logic per feature
  routes/                   Express route definitions
  middleware/               Auth (JWT), file upload (Multer), error handling
  services/aiService.js     All Gemini AI API calls, isolated in one place
  server.js                 App entry point
```

## API Routes (test these with Postman/Thunder Client)

### Auth
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` | No |
| POST | `/api/auth/login` | `{ email, password }` | No |
| GET | `/api/auth/me` | — | Yes (Bearer token) |

### Resume
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/resumes/upload` | multipart form, field `resume` = PDF file | Yes |
| GET | `/api/resumes/me` | — | Yes |

### Interview
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/interviews` | `{ company, difficulty }` | Yes |
| GET | `/api/interviews` | — | Yes |
| GET | `/api/interviews/:id` | — | Yes |
| PUT | `/api/interviews/:id/answers` | `{ answers: [{questionId, userAnswer}] }` | Yes |
| POST | `/api/interviews/:id/feedback` | — | Yes |

**Auth header for protected routes:** `Authorization: Bearer <token>`
(token comes from the signup/login response)

## Suggested test flow
1. `POST /api/auth/signup` → copy the `token` from response
2. `POST /api/resumes/upload` with the token, attach a PDF resume
3. `POST /api/interviews` with `{ "company": "Google", "difficulty": "medium" }`
   → this calls Gemini to generate 5 questions based on your resume
4. `PUT /api/interviews/:id/answers` → submit your answers
5. `POST /api/interviews/:id/feedback` → this calls Gemini again to score you

## Notes
- `multer` was pinned to `^2.0.0` (not the roadmap's default) since `1.x` has known CVEs.
- The AI layer uses Gemini's `gemini-3.6-flash` model. If you switch to OpenAI, only `services/aiService.js` needs to change; nothing else touches the AI API directly.
- Uploaded resumes are stored locally in `uploads/` for now. For deployment (Render/Railway), local disk storage won't persist — you'll want to swap to a cloud storage bucket or store the file in MongoDB/GridFS before deploying. Fine for local dev.
