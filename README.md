# rag-supabase-nvidia-demo

A complete Retrieval-Augmented Generation (RAG) demo built with Angular, Supabase, pgvector, and NVIDIA models for embeddings and answer generation.

## Overview

This project demonstrates how to:

- ingest text documents into a vector database from the frontend UI,
- generate embeddings with NVIDIA's embedding model,
- store them in Supabase using pgvector,
- retrieve relevant chunks via semantic search,
- generate grounded answers with NVIDIA chat completions.

## Tech Stack

- Angular 19 for the frontend UI
- Supabase for the database and Edge Functions
- pgvector for vector similarity search
- NVIDIA Nemotron embeddings for document vectors
- NVIDIA chat completions for answer generation

## Project Structure

- `src/` – Angular application source
- `supabase/migrations/` – database migrations for pgvector and RAG schema
- `supabase/functions/ingest/` – Edge Function for document ingestion
- `supabase/functions/ask/` – Edge Function for semantic query and answer generation
- `.env.example` – template for required environment variables

## Prerequisites

Make sure you have installed:

- Node.js 20+
- npm
- Angular CLI
- Supabase CLI

## Environment Variables

Copy `.env.example` to `.env` and fill in the values for your environment:

```bash
cp .env.example .env
```

Required variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

NVIDIA_EMBEDDINGS_API_KEY=your-nvidia-embeddings-key
NVIDIA_EMBEDDINGS_MODEL=nvidia/nemotron-3-embed-1b
NVIDIA_EMBEDDINGS_INVOKE_URL=https://integrate.api.nvidia.com/v1/embeddings

NVIDIA_LLM_API_KEY=your-nvidia-llm-key
NVIDIA_LLM_MODEL=poolside/laguna-xs-2.1
NVIDIA_LLM_INVOKE_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the Angular app:

```bash
npm start
```

Then open:

```text
http://localhost:4200/
```

## Supabase Setup

1. Log in to Supabase CLI:

```bash
supabase login
```

2. Link the project:

```bash
supabase link --project-ref <your-project-ref>
```

3. Apply the database migrations:

```bash
supabase db push
```

4. Deploy the Edge Functions:

```bash
supabase functions deploy ingest --project-ref <your-project-ref>
supabase functions deploy ask --project-ref <your-project-ref>
```

5. Set the function secrets:

```bash
supabase secrets set \
  NVIDIA_EMBEDDINGS_API_KEY=<your-nvidia-embeddings-key> \
  NVIDIA_EMBEDDINGS_MODEL=nvidia/nemotron-3-embed-1b \
  NVIDIA_EMBEDDINGS_INVOKE_URL=https://integrate.api.nvidia.com/v1/embeddings \
  NVIDIA_LLM_API_KEY=<your-nvidia-llm-key> \
  NVIDIA_LLM_MODEL=poolside/laguna-xs-2.1 \
  NVIDIA_LLM_INVOKE_URL=https://integrate.api.nvidia.com/v1/chat/completions \
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  --project-ref <your-project-ref>
```

## Example API Usage

### Ingest a document

```bash
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a sample document about RAG and embeddings.","owner":null}'
```

### Ask a question

```bash
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is a RAG system?"}'
```

## Security Notes

- Row Level Security (RLS) is enabled on the `documents` table.
- The Edge Functions use the Supabase service role only for server-side operations.
- Secrets should remain in environment variables and never be committed to source control.

## Build

To build the project for production:

```bash
npm run build
```
