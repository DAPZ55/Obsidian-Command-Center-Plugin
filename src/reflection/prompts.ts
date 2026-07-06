const PROMPTS: string[] = [
  "What went well today?",
  "What's one thing you'd do differently?",
  "What are you grateful for right now?",
  "What's been on your mind lately?",
  "What's one small win from today?",
  "What's something you learned today?",
  "What's worrying you right now?",
  "What would make tomorrow better than today?",
  "What's a challenge you faced today, and how did you handle it?",
  "Who or what made you smile today?",
  "What's something you're looking forward to?",
  "What's a habit you want to build or break?",
  "What did you avoid today, and why?",
  "What's one thing you're proud of this week?",
  "If today had a theme, what would it be?",
];

function getDayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - startOfYear.getTime();
  return Math.floor(diffMs / 86400000);
}

export function getPromptForDate(): string {
  const dayOfYear = getDayOfYear(new Date());
  return PROMPTS[dayOfYear % PROMPTS.length];
}
