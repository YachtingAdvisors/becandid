// Extract FAQ pairs from blog post HTML content
// Looks for H2/H3 headings that end with "?" followed by paragraph content

export interface FaqPair {
  q: string;
  a: string;
}

export function extractFaqs(html: string): FaqPair[] {
  // Match patterns like:
  // <h2>Why don't porn blockers work?</h2><p>Answer text...</p>
  // <h3>Is Be Candid like Covenant Eyes?</h3><p>No, because...</p>
  // Also match questions inside FAQ sections (h2 containing "FAQ" or "Questions")

  const pairs: FaqPair[] = [];

  // Pattern 1: Any h2/h3 ending with ? followed by one or more <p> tags
  const questionPattern =
    /<h[23][^>]*>(.*?\?)<\/h[23]>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*)+)/gi;
  let match;
  while ((match = questionPattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answerHtml = match[2];
    // Take first 2 paragraphs max, strip HTML tags
    const answer = answerHtml
      .split('</p>')
      .slice(0, 2)
      .map((p) => p.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .join(' ');

    if (question.length > 10 && answer.length > 20) {
      pairs.push({ q: question, a: answer });
    }
  }

  return pairs;
}
