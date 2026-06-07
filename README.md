# CineStash 🎬

**A minimalist, local-first media tracker supercharged by Genkit.**

Track everything you've watched, queue up what's next, and let an autonomous AI agent match your exact mood to the perfect movie or show — all without ever leaving your couch.

🔗 **[Live Demo](https://app.rajeel.me)**

---

## 🏆 Agents League Hackathon — Featured Agent

### The Vibe Matcher

> _"I want something that feels like driving through rain at 2AM with synth music playing."_

The Vibe Matcher is an autonomous AI agent powered by **Gemini 2.5 Flash** via **Genkit 1.x**. It doesn't just search keywords — it interprets highly specific human moods, aesthetics, and scenarios, then translates them into structured, actionable movie and TV show recommendations.

**How it works:**

1. User describes a vibe in natural language.
2. The agent processes the prompt through a Firebase Cloud Function (v2) secured with Google Cloud Secret Manager.
3. Gemini returns strictly typed JSON — one movie, one TV show, each with a `vibeReason` explaining the match.
4. The frontend hydrates each result against the **TMDB API**, pulling official posters, ratings, and release data.
5. Users can instantly add matches to their local-first library with one tap.

**No hallucinated links. No generic lists. Just precise, vibe-matched cinema.**

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **AI Engine** | Genkit 1.x + Google AI Plugin (Gemini 2.5 Flash) |
| **Backend** | Firebase Cloud Functions v2 |
| **Auth** | Firebase Authentication |
| **Database** | Local-first (`localStorage`) with Firestore-ready architecture |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Media Data** | TMDB API (The Movie Database) |
| **Secrets** | Google Cloud Secret Manager |
| **PWA** | Offline-capable via `next-pwa` |

---

## 🖥️ Local Setup

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A [TMDB API Key](https://developer.themoviedb.org/docs/getting-started)
- A [Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/Rajeel-Ali/CineStash.git
cd CineStash
npm install
cd functions && npm install && cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Set the Gemini Secret for Cloud Functions

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

### 4. Start the Backend (Firebase Emulator)

```bash
firebase emulators:start --only functions
```

### 5. Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to **Vibe** to test The Vibe Matcher agent.

---

## 📂 Project Structure

```
CineStash/
├── functions/           # Firebase Cloud Functions (v2) — The Vibe Matcher endpoint
│   └── index.js         # vibeMatcher HTTPS function with Genkit + Gemini
├── src/
│   ├── ai/              # Genkit initialization & prompt flows
│   ├── app/             # Next.js App Router pages & layouts
│   │   ├── (main)/      # Core app routes (Home, Library, Discover, Suggestions)
│   │   ├── add-item/    # Item detail/add page
│   │   ├── onboarding/  # First-run onboarding flow
│   │   └── privacy/     # Privacy policy
│   ├── components/      # Reusable UI components (Tinder cards, movie cards, nav)
│   ├── firebase/        # Firebase client provider & auth hooks
│   ├── hooks/           # Custom hooks (library manager, user library, toast)
│   └── lib/             # Utilities
├── firebase.json        # Firebase project config & emulator settings
├── firestore.rules      # Firestore security rules
└── .env                 # Environment variables (git-ignored)
```

---

## 🔒 Security

- All API keys are loaded from environment variables — zero hardcoded secrets.
- `GEMINI_API_KEY` is stored in **Google Cloud Secret Manager** and injected at runtime via `defineSecret`.
- TMDB fetches run exclusively server-side (`'use server'`) — keys never reach the browser.
- User input is validated (min 10 chars) and truncated (max 500 chars) before reaching the AI agent.

---

## 👤 Author

**Rajeel Ali**

---

<p align="center">
  <em>Built for the Agents League Hackathon 2026.</em>
</p>
