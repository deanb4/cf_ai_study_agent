# CS Study Agent

An AI-powered CS study tool built on Cloudflare Workers.

---

## Run Locally

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Setup

```bash
# Clone
git clone https://github.com/deanb4/cf_ai_study_agent.git
cd cf_ai_study_agent

# Install dependencies
npm install
cd client && npm install && cd ..

# Authenticate with Cloudflare
npx wrangler login
```

### Start

In one terminal:

```bash
npm run dev
```

In a second terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`