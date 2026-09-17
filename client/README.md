# AI Placement Assistant — Client (React + Vite)

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if your backend runs on a different port than `5001`:
```
VITE_API_URL=http://localhost:5000/api
```

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

**Make sure your backend server is running first** (`npm run dev` inside the
`server` folder), otherwise Signup/Login requests will fail.

## Pages included so far

- `/` — Landing page (notice ticker + feature overview)
- `/signup` — Create account (Name, Email, Phone, College, Password)
- `/login` — Log in
- `/dashboard` — Placeholder, redirected to after successful login/signup

## Design system

- Colors, fonts, and spacing are defined as CSS variables in `src/index.css`
- Component-level styles live next to each component (e.g. `Button.jsx` + `Button.css`)
- Palette: navy `#16233F`, maroon `#7A1F2B`, brass `#C9A227`, paper `#F6F3EA`
- Fonts: Fraunces (headings), IBM Plex Sans (body), IBM Plex Mono (labels/ticker)

## Next up

Dashboard with the three feature cards (Resume Feedback,
Interview Questions, Jobs) — build this next once Landing/Signup/Login are
approved.
