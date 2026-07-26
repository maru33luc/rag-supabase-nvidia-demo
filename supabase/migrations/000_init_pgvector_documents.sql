-- Enable extensions required
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Usá pgvector en Supabase para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with 2048-dimension vectors for Nemotron embeddings
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(2048) NOT NULL,
  owner uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- INSERT policy (SOLO WITH CHECK)
CREATE POLICY "Insert own documents" ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (owner = auth.uid());

-- SELECT policy (USING filtra filas visibles)
CREATE POLICY "Select own documents" ON public.documents
  FOR SELECT
  TO authenticated
  USING (owner = auth.uid());

-- Optional but recommended: index for faster owner filtering
CREATE INDEX IF NOT EXISTS documents_owner_idx ON public.documents(owner);

-- Semantic search function
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector,
  limit_count int DEFAULT 5
)
RETURNS TABLE(id uuid, content text, distance float) AS $$
  SELECT
    d.id,
    d.content,
    (d.embedding <=> query_embedding) AS distance
  FROM public.documents d
  WHERE auth.role() = 'service_role' OR d.owner = auth.uid()
  ORDER BY distance
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;