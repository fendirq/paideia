const TOGETHER_API_URL = "https://api.together.xyz/v1/embeddings";
const EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5";

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error("TOGETHER_API_KEY is not set");
  }

  const batchSize = 32;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Together.ai embedding API error: ${response.status} ${error}`
      );
    }

    const data = await response.json();
    const embeddings = data.data
      .sort(
        (a: { index: number }, b: { index: number }) => a.index - b.index
      )
      .map((item: { embedding: number[] }) => item.embedding);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

export async function generateSingleEmbedding(
  text: string
): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}
