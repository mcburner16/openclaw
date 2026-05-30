# Worth the Ticket? Command Center

> Honest Reviews. Real Reactions. Stories Matter.

A production-ready Next.js app for managing your movie review content operation — write reviews, auto-generate social content with AI, track analytics, plan your calendar, and never run out of ideas.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** + strict mode
- **Tailwind CSS** — cinematic dark theme (black/red/gold)
- **Supabase** — database (no auth required for v1)
- **OpenAI API** — AI content generation
- **Recharts** — analytics charts
- **shadcn/ui** — component primitives

## Features

| Page | What it does |
|------|-------------|
| **Dashboard** (`/`) | Stats overview + latest reviews + quick actions |
| **New Review** (`/reviews/new`) | Full review form → auto-generates all social content |
| **Review Detail** (`/reviews/[id]`) | View review + tabbed generated content with copy buttons |
| **Content Library** (`/library`) | Filterable grid of all reviews |
| **Analytics** (`/analytics`) | Manual stats entry + bar charts |
| **Recommendations** (`/recommendations`) | Rule-based insights from your data |
| **Calendar** (`/calendar`) | Month view — plan/track posting schedule |
| **Daily Ideas** (`/ideas`) | AI-generated post idea bank by category |

## Setup

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL editor, run `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` for 5 example reviews

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1   # or your compatible API
MODEL_NAME=gpt-4o                            # optional, defaults to gpt-4o
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Content Generation

When you save a review, the app calls `/api/generate` which uses the OpenAI API to create:

- **TikTok 4-slide script** — ready to drop into CapCut
- **TikTok caption** — under 150 chars with hashtags
- **Instagram caption** — 3-5 sentences + hashtags
- **Facebook post** — share-friendly full paragraphs
- **X/Twitter post** — under 280 chars, punchy
- **Podcast seed** — 150-200 word episode opening

Voice is always first-person, conversational, never film-critic jargon.

## Database

Tables: `reviews`, `generated_content`, `analytics`, `content_calendar`, `post_ideas`

Full schema in `supabase/schema.sql`. For v1, all reads/writes are client-side with the anon key — enable Row Level Security in Supabase when you add auth.

## Project Structure

```
worth-the-ticket/
├── app/
│   ├── api/generate/     AI content generation endpoint
│   ├── api/ideas/        Post ideas generation endpoint
│   ├── reviews/new/      New review form
│   ├── reviews/[id]/     Review detail + generated content
│   ├── library/          Content grid with filters
│   ├── analytics/        Stats entry + charts
│   ├── recommendations/  Rule-based insights
│   ├── calendar/         Month-view posting calendar
│   └── ideas/            AI idea bank
├── components/
│   ├── ui/               Radix-based components
│   └── layout/sidebar    Navigation
├── lib/
│   ├── supabase.ts       DB client
│   ├── openai.ts         AI client
│   ├── generate-content  AI generation logic
│   └── utils.ts          Helpers
├── types/index.ts         All types + constants
└── supabase/
    ├── schema.sql
    └── seed.sql
```
