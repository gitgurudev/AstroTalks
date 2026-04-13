# AstroTalks 🔮

> *Whisper your questions to the cosmos. Receive ancient wisdom, one star at a time.*

A full-stack astrology chat web app built with React + Vite + Express + MongoDB. Chat with **Jyotish Guruji** — an AI persona modelled on a professional Indian Vedic astrologer — powered by the OpenRouter API.

---

## Features

- **Landing page** — Animated star-field hero with a single CTA button
- **User registration** — Name + Date of Birth (calendar picker with validation)
- **Personalised AI** — Sun sign & Nakshatra derived from DOB, injected into every prompt
- **Persistent chat history** — Sessions saved in MongoDB; browse and delete past chats from sidebar
- **Vedic astrologer AI** — Strong system prompt enforcing a calm, concise, spiritual tone
- **Typing indicator** — Animated dots while the AI is responding
- **Error handling** — Dismissable inline error banners
- **Responsive** — Works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | CSS Modules + CSS custom properties |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI API | OpenRouter (`mistralai/mixtral-8x7b-instruct`) |
| Fonts | Cinzel (serif) + Inter (sans) via Google Fonts |

---

## Project Structure

```
AstroTalks/
├── src/                        # React frontend (Vite)
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── ChatInput.jsx
│   │   └── Landing/
│   │       └── LandingPage.jsx
│   ├── hooks/
│   │   └── useChat.js          # Chat state + API orchestration
│   ├── services/
│   │   └── api.js              # Frontend fetch wrapper
│   ├── utils/
│   │   └── systemPrompt.js     # (unused in prod — prompt lives on server)
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── server/                     # Express backend
│   ├── routes/
│   │   ├── sessions.js         # Chat session CRUD + AI call
│   │   └── users.js            # User registration
│   ├── models/
│   │   ├── Session.js
│   │   └── User.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── systemPrompt.js         # AI persona (server-side, API key never reaches browser)
│   └── index.js                # Express entry point
├── .env                        # secrets (not committed)
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- An [OpenRouter](https://openrouter.ai/keys) API key

### 2. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/AstroTalks.git
cd AstroTalks
```

### 3. Create the `.env` file

In the root `AstroTalks/` folder, create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
VITE_API_BASE_URL=http://localhost:5000
```

> The `.env` file is in `.gitignore` — it will never be committed.

### 4. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 5. Start the servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | `.env` (root) | MongoDB Atlas connection string |
| `OPENROUTER_API_KEY` | `.env` (root) | OpenRouter API key (server-side only) |
| `VITE_API_BASE_URL` | `.env` (root) | Backend URL (default: `http://localhost:5000`) |

---

## License

MIT — free to use and modify.
