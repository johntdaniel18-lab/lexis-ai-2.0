
import { KNOWLEDGE_BASE } from '../knowledgeBase';

const STOP_WORDS = new Set(['a', 'an', 'the', 'is', 'in', 'on', 'of', 'for', 'to', 'and', 'or', 'but', 'what', 'how', 'why', 'do', 'ielts']);

/**
 * Converts a string into an array of meaningful keywords for searching.
 * @param text The input string (e.g., a query or chunk title/tags).
 * @returns An array of cleaned, lowercased tokens.
 */
const tokenize = (text: string): string[] => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
};

/**
 * Retrieves the most relevant context from the knowledge base based on a user query.
 * This is a simple keyword-based retrieval system. It scores chunks based on keyword
 * matches in their title and tags, then returns the content of the highest-scoring chunks.
 * @param query The user's question or message.
 * @returns A formatted string containing the content of the top 3 most relevant chunks.
 */
export const retrieveContext = (query: string): string => {
  const queryTokens = new Set(tokenize(query));

  if (queryTokens.size === 0) {
    return "No specific context found. Please use your general knowledge.";
  }

  const scoredChunks = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    const titleTokens = tokenize(chunk.title);
    const tagTokens = chunk.tags.flatMap(tag => tokenize(tag));

    // Weighting: Title matches are more important than tag matches.
    for (const token of titleTokens) {
      if (queryTokens.has(token)) {
        score += 5; // High weight for title match
      }
    }

    for (const token of tagTokens) {
      if (queryTokens.has(token)) {
        score += 3; // Medium weight for tag match
      }
    }

    return { ...chunk, score };
  }).filter(chunk => chunk.score > 0);

  // Sort by the highest score to find the most relevant chunks.
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, 3);

  if (topChunks.length === 0) {
    return "No specific context found. Please use your general knowledge.";
  }

  // Format the retrieved context for the AI model.
  return topChunks
    .map(chunk => `--- START CONTEXT CHUNK ---\nTITLE: ${chunk.title}\nCONTENT: ${chunk.content}\n--- END CONTEXT CHUNK ---`)
    .join('\n\n');
};
