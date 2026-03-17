# CS Study Agent

An AI-powered computer science study tool built on Cloudflare. Ask questions, take quizzes, and track your score.

## What it does

- Generates multiple choice CS practice questions across any topic (algorithms, data structures, networking, OS, databases, web dev)
- Checks your answers and updates your score in real time
- Persists state across sessions using Durable Objects
- Streams responses live as the model thinks

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Llama 3.3 70B via Cloudflare Workers AI |
| Agent / State | Cloudflare Durable Objects (`AIChatAgent`) |
| Backend | Cloudflare Workers |
| Frontend | React + Vite |
| Deployment | Cloudflare Workers + Assets |


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Cloudflare account](https://dash.cloudflare.com)
- Wrangler CLI: `npm install -g wrangler`

### Local Development

1. Clone the repo and install dependencies:

```bash
npm install
cd client && npm install && cd ..
```

2. Run the dev server:

```bash
npm run dev
```

3. In a separate terminal, run the frontend:

```bash
cd client
npm run dev
```

### Deploy

1. Build the frontend:

```bash
cd client
npm run build
cd ..
```

2. Deploy to Cloudflare:

```bash
npx wrangler deploy
```

Your app will be live at `https://chat-agent.<your-subdomain>.workers.dev`

## How it works

The agent is a Cloudflare Durable Object that extends `AIChatAgent`. It holds two pieces of state:

```typescript
type StudyState = {
  quizScore: { correct: number; total: number };
  currentTopic: string;
};
```

The model has two tools:

- `generateQuestion` — client-side tool that triggers the model to write out a question
- `checkAnswer` — client-side tool that updates the score in React state when the model evaluates an answer

Score is tracked in React state via `onToolCall` and resets on demand via a `@callable()` method on the Durable Object.

## Configuration

Edit `wrangler.toml` to change the Worker name, compatibility date, or AI binding.

The system prompt and model can be changed in `src/server.ts`:

```typescript
model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
```