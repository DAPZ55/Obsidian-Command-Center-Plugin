// src/reflection/dailyNote.ts
import type { App, TFile } from 'obsidian';
import { getAllDailyNotes, getDailyNote, createDailyNote } from 'obsidian-daily-notes-interface';
import type { BrainDumpItem } from './types';
import {
  parseReflectionAnswer,
  parseBrainDumpItems,
  upsertReflectionSection,
  upsertBrainDumpSection,
} from './sections';

export async function getTodayNoteFile(app: App): Promise<TFile> {
  const today = window.moment();
  const allNotes = getAllDailyNotes();
  const existing = getDailyNote(today, allNotes);
  if (existing) return existing;

  const created = await createDailyNote(today);
  if (!created) {
    throw new Error("Could not create today's daily note");
  }
  return created;
}

export async function readTodaySections(
  app: App,
  file: TFile
): Promise<{ answer: string; items: BrainDumpItem[] }> {
  const content = await app.vault.read(file);
  return {
    answer: parseReflectionAnswer(content),
    items: parseBrainDumpItems(content),
  };
}

// ponytail: serializes read-modify-write so concurrent saves (e.g. blur + click
// firing together) don't read the same snapshot and clobber each other's write.
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite(operation: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(operation, operation);
  return writeQueue;
}

export async function saveReflection(
  app: App,
  file: TFile,
  prompt: string,
  answer: string
): Promise<void> {
  return enqueueWrite(async () => {
    const content = await app.vault.read(file);
    await app.vault.modify(file, upsertReflectionSection(content, prompt, answer));
  });
}

export async function saveBrainDump(app: App, file: TFile, items: BrainDumpItem[]): Promise<void> {
  return enqueueWrite(async () => {
    const content = await app.vault.read(file);
    await app.vault.modify(file, upsertBrainDumpSection(content, items));
  });
}
