-- Inquiry.topicQuestions caches Socratic starter questions generated
-- by Gemini from the uploaded file chunks. Populated lazily on first
-- session open and reused for every subsequent session of the same
-- inquiry, so the Gemini call fires at most once per uploaded packet.
--
-- String[] default '{}' keeps existing rows safe; an empty array
-- routes the UI back to the previous generic-prompt path.

ALTER TABLE "Inquiry"
  ADD COLUMN "topicQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
