# rag-supabase-nvidia-demo

A complete Retrieval-Augmented Generation (RAG) demo built with Angular, Supabase, pgvector, and NVIDIA models for embeddings and answer generation.

## What this project does

This app demonstrates a full RAG flow from the browser:

- the Angular UI lets you ingest text into the system,
- the text is split into chunks,
- NVIDIA embeddings are generated for each chunk,
- the vectors are stored in Supabase using pgvector,
- questions are embedded too, matched against the stored vectors,
- the most relevant chunks are passed to an NVIDIA chat model so the app can answer grounded questions.

In other words, the app is not just a chat UI: it is a small end-to-end vector search + generation pipeline.

## Architecture at a glance

- `src/app/` – Angular frontend UI and services.
- `src/app/services/rag.service.ts` – calls the Supabase Edge Functions from the browser.
- `supabase/functions/ingest/index.ts` – receives text, chunks it, generates embeddings, and inserts rows into the `documents` table.
- `supabase/functions/ask/index.ts` – generates an embedding for the user question, calls the `match_documents` RPC, and uses NVIDIA chat completions to answer from those retrieved chunks.
- `supabase/migrations/` – SQL that enables pgvector/pgcrypto, creates the `documents` table, adds RLS policies, and creates the `match_documents` function.
- `.env.example` – template for the variables used by the Edge Functions.

## Tech Stack

- Angular 19 for the frontend UI
- Supabase for the database and Edge Functions
- pgvector for vector similarity search
- NVIDIA embeddings for document vectors
- NVIDIA chat completions for grounded answer generation

## Project Structure

- `src/` – Angular application source
- `src/environments/` – frontend environment config (currently points to the Supabase project URL)
- `supabase/migrations/` – database migrations for pgvector and RAG schema
- `supabase/functions/ingest/` – Edge Function for document ingestion
- `supabase/functions/ask/` – Edge Function for semantic query and answer generation
- `.env.example` – template for required environment variables used by the Edge Functions

## Prerequisites

Make sure you have installed:

- Node.js 20+
- npm
- Angular CLI
- Supabase CLI
- Docker Desktop (required if you want to run Supabase locally with `supabase start`)

## Environment variables: where they are used

There are two different concerns here:

1. The Angular frontend needs the Supabase project URL so it can call the Edge Functions.
2. The Supabase Edge Functions need secrets so they can talk to NVIDIA and to the Supabase service role.

### Frontend configuration

The frontend does not read the `.env` file directly. It uses the URL defined in:

- `src/environments/environment.ts` for local development
- `src/environments/environment.prod.ts` for production builds

These files currently contain the Supabase project URL. If you want the app to call a local Supabase instance instead of the hosted project, change that URL to:

```ts
http://127.0.0.1:54321
```

Important: the frontend only needs the project URL. It does not need the NVIDIA keys.

### Edge Function configuration

Copy `.env.example` to `.env` and fill in the values for your environment:

```bash
cp .env.example .env
```

The variables below are used by the Supabase Edge Functions:

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

### Where to set these values in practice

- For local CLI usage, keep them in a local `.env` file and pass that file when deploying or serving functions.
- For a deployed Supabase project, you usually need to set them as Edge Function secrets in the Supabase Dashboard:
  - Project Settings
  - Edge Functions
  - Secrets

This is the important part for this project: the functions are deployed to Supabase, so the secrets must exist in the Supabase project environment, not only in your local shell. In other words, if you run the app against a hosted Supabase project, the Edge Functions will only work if their secrets were added in the Supabase Dashboard (or via `supabase secrets set`).

### Variable-by-variable meaning

- `SUPABASE_URL`: the base URL of your Supabase project. Used by the functions and also by the frontend when it calls them.
- `SUPABASE_SERVICE_ROLE_KEY`: required by the Edge Functions because they insert rows and call RPCs with privileged access.
- `SUPABASE_ANON_KEY`: optional for this demo today; it is included for completeness and may be useful if you later add direct Supabase client calls.
- `NVIDIA_EMBEDDINGS_API_KEY`: required to generate embeddings for ingested text and questions.
- `NVIDIA_EMBEDDINGS_MODEL`: model used for embeddings.
- `NVIDIA_EMBEDDINGS_INVOKE_URL`: NVIDIA embeddings endpoint.
- `NVIDIA_LLM_API_KEY`: required by the `ask` function to generate the final answer.
- `NVIDIA_LLM_MODEL`: model used for chat completions.
- `NVIDIA_LLM_INVOKE_URL`: NVIDIA chat completions endpoint.

## Local development

### Option 1: run the Angular app against the hosted Supabase project

This is the simplest setup if you only want to use the deployed Edge Functions.

1. Install dependencies:

```bash
npm install
```

2. Start the Angular app:

```bash
npm start
```

3. Open:

```text
http://localhost:4200/
```

4. Make sure the Supabase project URL in `src/environments/environment.ts` matches the target project.

### Option 2: run the app and Edge Functions locally with Supabase CLI

This is useful when you want to test the functions locally before deploying.

1. Log in to Supabase CLI:

```bash
supabase login
```

2. Start the local Supabase stack:

```bash
supabase start
```

3. Apply the migrations to the local database:

```bash
supabase db reset
```

4. Set the environment variables for the functions (either in `.env` or by exporting them in your shell).

5. Serve the functions locally:

```bash
supabase functions serve --env-file .env
```

6. Point the Angular frontend at the local Supabase URL by changing `src/environments/environment.ts` to:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'http://127.0.0.1:54321',
};
```

7. Start the Angular app again:

```bash
npm start
```

If you do not change the frontend URL, the app will still try to reach the hosted Supabase project instead of the local CLI instance.

## Supabase setup

### 1. Link your project

If you are deploying to a hosted Supabase project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 2. Apply the database migrations

For a hosted project:

```bash
supabase db push
```

For a local emulator:

```bash
supabase db reset
```

### 3. Deploy the Edge Functions

```bash
supabase functions deploy ingest --project-ref <your-project-ref>
supabase functions deploy ask --project-ref <your-project-ref>
```

### 4. Set the function secrets

If you use the hosted project, set the secrets in the Supabase Dashboard or with the CLI:

```bash
supabase secrets set \
  SUPABASE_URL=https://<your-project-ref>.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  NVIDIA_EMBEDDINGS_API_KEY=<your-nvidia-embeddings-key> \
  NVIDIA_EMBEDDINGS_MODEL=nvidia/nemotron-3-embed-1b \
  NVIDIA_EMBEDDINGS_INVOKE_URL=https://integrate.api.nvidia.com/v1/embeddings \
  NVIDIA_LLM_API_KEY=<your-nvidia-llm-key> \
  NVIDIA_LLM_MODEL=poolside/laguna-xs-2.1 \
  NVIDIA_LLM_INVOKE_URL=https://integrate.api.nvidia.com/v1/chat/completions \
  --project-ref <your-project-ref>
```

## How the data flow works

1. The frontend calls the `ingest` function with a block of text.
2. The `ingest` function splits the content into chunks and sends them to NVIDIA embeddings.
3. The resulting vectors are inserted into the `documents` table in Supabase.
4. When the user asks a question, the frontend calls the `ask` function.
5. The `ask` function generates an embedding for the question and uses the `match_documents` RPC to retrieve the closest chunks from the database.
6. The retrieved chunks are injected into a prompt and sent to NVIDIA chat completions.
7. The answer is returned to the Angular UI.

## Example API usage

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

### Local CLI example

If you are using the local Supabase emulator:

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a sample document about RAG and embeddings.","owner":null}'
```

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is a RAG system?"}'
```

## Security notes

- Row Level Security (RLS) is enabled on the `documents` table.
- The Edge Functions use the Supabase service role only for server-side operations.
- The service role key should never be exposed to the browser.
- Secrets should remain in environment variables and never be committed to source control.
- In a production deployment, review your RLS policies carefully if you want documents to be shared between users.

## Build

To build the project for production:

```bash
npm run build
```
