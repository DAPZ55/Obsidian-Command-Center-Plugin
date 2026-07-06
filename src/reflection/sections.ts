import type { BrainDumpCategory, BrainDumpItem } from './types';

const REFLECTION_HEADING = '## Reflection';
const BRAIN_DUMP_HEADING = '## Brain Dump';

function findSectionBounds(content: string, heading: string): { start: number; end: number } | null {
  const startIndex = content.indexOf(heading);
  if (startIndex === -1) return null;

  const afterHeading = startIndex + heading.length;
  const nextHeadingMatch = content.slice(afterHeading).match(/\n## /);
  const end = nextHeadingMatch ? afterHeading + (nextHeadingMatch.index as number) : content.length;

  return { start: startIndex, end };
}

function upsertSection(content: string, heading: string, newSection: string): string {
  const bounds = findSectionBounds(content, heading);

  if (!bounds) {
    const separator = content.length > 0 && !content.endsWith('\n') ? '\n\n' : '\n';
    return content.length > 0 ? `${content}${separator}${newSection}\n` : `${newSection}\n`;
  }

  const before = content.slice(0, bounds.start);
  const after = content.slice(bounds.end);
  return `${before}${newSection}\n${after}`;
}

export function parseReflectionAnswer(content: string): string {
  const bounds = findSectionBounds(content, REFLECTION_HEADING);
  if (!bounds) return '';

  const body = content.slice(bounds.start + REFLECTION_HEADING.length, bounds.end);
  const lines = body.split('\n');
  const promptLineIndex = lines.findIndex((line) => line.trim().startsWith('**'));
  if (promptLineIndex === -1) return '';

  return lines
    .slice(promptLineIndex + 1)
    .join('\n')
    .trim();
}

export function parseBrainDumpItems(content: string): BrainDumpItem[] {
  const bounds = findSectionBounds(content, BRAIN_DUMP_HEADING);
  if (!bounds) return [];

  const body = content.slice(bounds.start + BRAIN_DUMP_HEADING.length, bounds.end);
  const itemPattern = /^- \[(Task|Idea|Worry|Question)\] (.+)$/;
  const items: BrainDumpItem[] = [];

  for (const line of body.split('\n')) {
    const match = line.match(itemPattern);
    if (match) {
      items.push({ category: match[1] as BrainDumpCategory, text: match[2] });
    }
  }

  return items;
}

export function upsertReflectionSection(content: string, prompt: string, answer: string): string {
  const section = `${REFLECTION_HEADING}\n**${prompt}**\n${answer}`;
  return upsertSection(content, REFLECTION_HEADING, section);
}

export function upsertBrainDumpSection(content: string, items: BrainDumpItem[]): string {
  const itemLines = items.map((item) => `- [${item.category}] ${item.text}`).join('\n');
  const section = itemLines ? `${BRAIN_DUMP_HEADING}\n${itemLines}` : `${BRAIN_DUMP_HEADING}`;
  return upsertSection(content, BRAIN_DUMP_HEADING, section);
}
