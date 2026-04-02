-- AlterColumn: Change vector dimensions from 1536 to 1024 for Together.ai bge-large-en-v1.5
ALTER TABLE "TextChunk" ALTER COLUMN "embedding" TYPE vector(1024);
