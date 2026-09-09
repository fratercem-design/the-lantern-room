const STOP_WORDS = new Set([
  'about', 'after', 'among', 'and', 'are', 'from', 'into', 'that', 'the',
  'this', 'when', 'where', 'which', 'with', 'what', 'who', 'why', 'how',
  'theory', 'hypothesis', 'psychology', 'history', 'study'
]);

export function topicKeywords(topic: string): string[] {
  return Array.from(new Set(
    topic.toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map(word => word.replace(/(?:ies|es|s)$/i, '').trim())
      .filter(word => word.length >= 5 && !STOP_WORDS.has(word))
  ));
}

export function hasTopicFidelity(topic: string, candidate: unknown): boolean {
  const keywords = topicKeywords(topic);
  if (keywords.length === 0) return true;

  const substantive: any = candidate && typeof candidate === 'object'
    ? { ...(candidate as Record<string, unknown>), meta: { ...((candidate as any).meta ?? {}) } }
    : candidate;
  if (substantive && typeof substantive === 'object' && substantive.meta && typeof substantive.meta === 'object') {
    delete (substantive.meta as Record<string, unknown>).researchTopic;
  }

  const haystack = JSON.stringify(substantive)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, ' ');
  const matches = keywords.filter(keyword => haystack.includes(keyword));
  const required = keywords.length === 1 ? 1 : 2;
  return new Set(matches).size >= Math.min(required, keywords.length);
}
