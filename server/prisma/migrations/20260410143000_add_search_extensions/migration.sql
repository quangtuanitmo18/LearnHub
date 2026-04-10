CREATE SCHEMA IF NOT EXISTS "extensions";
SET search_path TO "$user", public, extensions;

CREATE EXTENSION IF NOT EXISTS "unaccent" SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA "extensions";

-- Create an IMMUTABLE unaccent function for indexing
CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text AS
$func$
SELECT extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$func$  LANGUAGE sql IMMUTABLE;

-- Create GIN trigram indexes for Course model
CREATE INDEX IF NOT EXISTS idx_course_title_trgm ON "Course" USING GIN (f_unaccent(title) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_course_description_trgm ON "Course" USING GIN (f_unaccent(description) gin_trgm_ops);

-- Create GIN trigram indexes for Blog model
CREATE INDEX IF NOT EXISTS idx_blog_title_trgm ON "Blog" USING GIN (f_unaccent(title) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_blog_content_trgm ON "Blog" USING GIN (f_unaccent(content) gin_trgm_ops);
