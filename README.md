# Durable LLM Streams

A Next.js application demonstrating resilient LLM streaming with conversation persistence using Upstash Redis and Realtime. This demo showcases how to create durable, resumable AI chat experiences that can survive network interruptions.

## Features

- **Resumable Streams**: Automatically reconnects and resumes AI responses after network interruptions
- **Persistent History**: Chat conversations stored in Redis with sorted sets for efficient retrieval
- **Durable Workflows**: Built with Upstash Workflow for reliable background processing
- **Real-time Updates**: Uses Upstash Realtime for streaming AI responses
- **Modern UI**: Elegant chat interface with markdown support and smooth animations

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **AI SDK**: Vercel AI SDK with OpenRouter integration
- **Database**: Upstash Redis for conversation persistence
- **Streaming**: Upstash Realtime for durable message streaming
- **Workflows**: Upstash Workflow for background AI generation
- **UI**: Tailwind CSS with Radix UI components
- **Markdown**: Streamdown for progressive markdown rendering

## Architecture

The application uses a unique transport layer that:

1. **Saves messages to Redis** using sorted sets with timestamps
2. **Initiates AI generation** via Upstash Workflow in the background
3. **Streams responses** through Upstash Realtime channels
4. **Resumes interrupted streams** by reconnecting to existing channels using message IDs

When a connection drops, the client automatically reconnects to the same channel and continues receiving chunks from where it left off.

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```env
# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Upstash Workflow (QStash)
QSTASH_URL=your_qstash_url
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Workflow URL
UPSTASH_WORKFLOW_URL=deployed_url, use ngrok or other similar solutions for testing locally
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Message Flow

1. User sends a message → Saved to Redis history
2. Workflow triggered → AI generates response in background
3. Response chunks → Streamed via Realtime channel
4. Client receives → Progressive markdown rendering
5. On completion → AI response saved to Redis history

### Resumability

The custom transport layer handles reconnections by:

- Tracking the current `messageId` in URL search params
- On reconnect, fetching from the existing Realtime channel
- Continuing the stream from the last received chunk

This ensures no data loss even during network interruptions.

## Project Structure

```
app/
├── api/chat/route.ts    # Chat API with workflow integration
├── layout.tsx           # Root layout with providers
└── page.tsx             # Home page with chat history loading

components/
├── chat.tsx             # Main chat component
├── transports.ts        # Custom resumable transport
└── ui/                  # Shadcn UI components

lib/
├── openrouter.ts        # OpenRouter provider config
├── realtime.ts          # Upstash Realtime setup
├── redis.ts             # Redis client
└── utils.ts             # Utility functions
```
