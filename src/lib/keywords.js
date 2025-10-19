// Common stopwords to filter out
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'would', 'you', 'your', 'we', 'our',
  'they', 'their', 'them', 'this', 'these', 'those', 'i', 'me',
  'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
  'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'shall', 'ought'
]);

export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

export function scoreOverlap(letterText, jdKeywords) {
  if (!letterText || !jdKeywords || jdKeywords.length === 0) return 0;
  
  const letterTokens = new Set(tokenize(letterText));
  const jdTokenSet = new Set(jdKeywords.map(k => k.toLowerCase()));
  
  let matches = 0;
  for (const token of letterTokens) {
    if (jdTokenSet.has(token)) {
      matches++;
    }
  }
  
  // Return normalized score (0-1)
  return jdTokenSet.size > 0 ? matches / jdTokenSet.size : 0;
}

export function selectTopExamples(letters, jdKeywords, maxCount = 3) {
  if (!letters || letters.length === 0 || !jdKeywords || jdKeywords.length === 0) {
    return [];
  }
  
  // Score each letter
  const scoredLetters = letters.map(letter => ({
    ...letter,
    score: scoreOverlap(letter.body, jdKeywords)
  }));
  
  // Sort by score (descending) and take top N
  return scoredLetters
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .filter(letter => letter.score > 0); // Only include letters with some overlap
}
