# Claude.md — Intelligent Trading Analyst
## Market Analysis × Behavioural Awareness × AI Personas
**1-Day Hackathon Build · Live Demo Ready · No Signals**

Owner: Hongbo Wei  
Role: AI/ML Engineer (Claude Code executes)  
Mode: Explain-only, Compliant, Brand-Safe

---

# 0. Mission

> Build an AI analyst that explains market moves, understands a trader’s behaviour, and creates social content good enough to go viral — without revealing it's AI.

---

# 1. Demo Must Show

✅ Real-time explanation of market move  
✅ Behavioural insight based on user trading history  
✅ Generated social posts (LinkedIn + X personas)  
✅ Single web UI dashboard (desktop-optimized)  
✅ Works live, no predictions, brand-safe tone

---

# 2. What You’ll Build

AI-powered trading analyst that delivers:

| Module | Output |
|--------|--------|
| 📈 Market Engine | “EUR/USD spiked 1.3% after US CPI. RSI breakout + volume surge suggest momentum reversal.” |
| 🧠 Behaviour Engine | “You tend to re-enter quickly after 3 losses — this pattern is active now.” |
| 🧑‍💼 Content Engine | “Calm Analyst: ‘Markets moved sharply post-CPI. In times like this, clarity > reactivity.’” |

---

# 3. System Architecture

```mermaid
graph TD

subgraph Data
P[Live Price]
N[Market News]
T[User Trades]
end

subgraph Backend
M[Market Intelligence]
B[Behaviour Engine]
C[AI Prompt Engine]
S[Social Content Engine]
end

subgraph UI
D[Next.js Dashboard]
end

P --> M
N --> M
T --> B
M --> C
B --> C
C --> S
S --> D
C --> D
````

---

# 4. Feature Modules

## 4.1 Market Intelligence

* Real-time spike detection (>1.5%/5m)
* Context from RSI/ATR/Volume
* News summarization via GPT-5-mini
* Output: 1–2 sentence plain-English summary

## 4.2 Behaviour Engine

* Parse trades.csv: detect loss streaks, revenge trades, oversizing
* Rule-based triggers + optional fine-tuning
* Output: “You tend to oversize after loss. Consider pausing.”

## 4.3 AI Prompt Engine

* Fusion of market event + user history → coaching message
* Style: supportive, brief, no directives

Prompt:

```txt
Market: {event}
User: {behaviour pattern}
Write one coaching sentence. Brand-safe. No prediction.
```

## 4.4 Social Content Personas

* Generate persona-driven LinkedIn + X posts
* Voices: Calm Analyst, Data Nerd, Trading Coach
* Includes daily threads, X-style updates, reflection posts

---

# 5. Frontend

## Framework

| Layer         | Stack                                                     |
| ------------- | --------------------------------------------------------- |
| Core          | Next.js (App Router) + React + TypeScript                 |
| UI            | shadcn/ui + Radix UI primitives                           |
| Styling       | Tailwind CSS + Figma design tokens (via Style Dictionary) |
| Charting      | Recharts or Victory for SVG chart components              |
| Animations    | Framer Motion                                             |
| Accessibility | ARIA + keyboard nav + a11y linting                        |

## Layout

```
src/
├── app/                  // App Router structure
│   ├── layout.tsx        // Sidebar + header
│   └── dashboard/page.tsx
├── components/           
│   ├── ui/               // shadcn/Radix components
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
├── lib/
│   └── api.ts            // API hooks (SWR/React Query)
├── styles/
│   └── globals.css
└── tailwind.config.js    // Extended with Figma tokens
```

## UX Patterns

* Desktop-first, responsive fallback
* Sidebar + header layout
* Accessible keyboard shortcuts (e.g. `/` for search, `?` for help)
* Dashboard cards: “Why it moved”, “Your Pattern”, “Post Generator”

---

# 6. APIs

### `GET /market`

→ Returns move context + human explanation

### `POST /behavior`

→ Returns trader pattern + coaching nudge

### `POST /content`

→ Returns LinkedIn + X persona post

---

# 7. One-Day Sprint Plan

| Hour  | Task                                  |
| ----- | ------------------------------------- |
| H0–1  | Scaffold Next.js app + backend        |
| H1–3  | Market engine (yfinance + OpenAI)     |
| H3–5  | Behaviour engine + pattern rules      |
| H5–6  | AI persona + post generation      |
| H6–7  | Tailwind UI: dashboard cards, charts  |
| H7–8  | Wire API + simulate 3% drop           |
| H8–9  | Polish: sample trade history, buttons |
| H9–10 | Live demo ready                       |

---

# 8. Demo Flow

1. Click “Simulate 3% Drop”
2. AI explains market move
3. Behaviour alert triggers: “You often oversize here”
4. Auto-generates post: Calm Analyst / Data Nerd / Coach
5. Copy to LinkedIn/X — done

---

# 9. What Will Blow Minds

* "Market just dropped. Based on your history, you tend to revenge trade — pause."
* Persona posts so good, people repost without knowing it’s AI
* One-click post-to-social across personas
* “Bloomberg + Head Coach + Ghostwriter”
* Real-time awareness of both external (market) and internal (trader)

---

# 10. Compliance Checklist

| ✅ Constraint | Reason                            |
| ------------ | --------------------------------- |
| No signals   | Explain-only                      |
| Brand-safe   | Tones + personas are professional |
| Supportive   | No blocking, just nudging         |
| Real demo    | No slides, live interaction       |

---

# 11. Stack Summary

| Layer    | Stack                                      |
| -------- | ------------------------------------------ |
| Backend  | FastAPI + yfinance + OpenAI API            |
| Frontend | Next.js + Tailwind + shadcn/ui + Radix     |
| Infra    | Vercel / Cloudflare Pages                  |
| DevOps   | ESLint, Prettier, TypeScript, Storybook    |
| CI/CD    | Linting, a11y tests (axe-core), Lighthouse |
| Design   | Figma + Tailwind tokens                    |

---

# 12. Positioning

Deriv ≠ just a platform.
Deriv = market intelligence + behavioural awareness + social voice.
The analyst the retail trader never had — now, AI-powered.

---

# 13. One-Line Pitch

Bloomberg terminal + trading coach + ghostwriter
→ one AI analyst in your browser

```

Ready to drop into `Claude.md`.
```
