# CS Study Agent

> An AI-powered computer science study tool built on Cloudflare. Ask questions, take quizzes, and track your score in real time.

![CS Study Agent](https://img.shields.io/badge/built%20on-Cloudflare-orange?style=flat-square) ![LLM](https://img.shields.io/badge/LLM-Llama%203.3%2070B-blue?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

- 🧠 Generates multiple choice CS practice questions on any topic
- ✅ Checks your answers and updates your score in real time
- 💾 Persists quiz state across sessions via Durable Objects
- ⚡ Streams responses live as the model generates them
- 🎨 Clean, minimal dark UI

**Topics covered:** Algorithms · Data Structures · Networking · Operating Systems · Databases · Web Development

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Llama 3.3 70B via Cloudflare Workers AI |
| Agent / State | Cloudflare Durable Objects (`AIChatAgent`) |
| Backend | Cloudflare Workers |
| Frontend | React + Vite |
| Deployment | Cloudflare Workers + Assets |

---

## Project Structure

```
cf_ai_study_agent/
├── src/
│   └── server.ts        # Worker + ChatAgent Durable Object
├── client/
│   ├── src/
│   │   ├── App.tsx      # Main React app
│   │   └── App.css      # Styles
│   └── package.json
├── wrangler.jsonc        # Cloudflare config
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Cloudflare account](https://dash.cloudflare.com)
- Wrangler CLI:

```bash
npm install -g wrangler
```

### 1. Clone & Install

```bash
git clone https://github.com/deanb4/cf_ai_study_agent.git
cd cf_ai_study_agent

npm install
cd client && npm install && cd ..
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Run Locally

In one terminal, start the Worker:

```bash
npm run dev
```

In a second terminal, start the frontend:

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Deploy to Cloudflare

### 1. Build the frontend

```bash
cd client
npm run build
cd ..
```

### 2. Deploy

```bash
npx wrangler deploy
```

Your app will be live at `https://chat-agent.<your-subdomain>.workers.dev`

---

## How it Works

The agent is a Cloudflare Durable Object that extends `AIChatAgent` and holds persistent state:

```typescript
type StudyState = {
  quizScore: { correct: number; total: number };
  currentTopic: string;
};
```

The model has two tools:

- `generateQuestion` — triggers the model to write out a practice question
- `checkAnswer` — evaluates the user's answer and updates the score in React state

Score is tracked client-side via `onToolCall` and can be reset via a `@callable()` method on the Durable Object.

### Configuration

The model and system prompt can be changed in `src/server.ts`:

```typescript
model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
```

---

## Contributing

PRs welcome. Open an issue first for large changes.