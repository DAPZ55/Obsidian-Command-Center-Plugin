// src/panels/CommandCenterPanel.tsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { App as ObsidianApp, TFile } from 'obsidian';
import { getTodayNoteFile, readTodaySections, saveReflection, saveBrainDump } from '../reflection/dailyNote';
import { getPromptForDate } from '../reflection/prompts';
import type { BrainDumpCategory, BrainDumpItem } from '../reflection/types';

interface CommandCenterPanelProps {
  app: ObsidianApp;
}

const CATEGORIES: BrainDumpCategory[] = ['Task', 'Idea', 'Worry', 'Question'];

export function CommandCenterPanel({ app }: CommandCenterPanelProps) {
  const [file, setFile] = useState<TFile | null>(null);
  const [answer, setAnswer] = useState('');
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BrainDumpCategory>('Task');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const prompt = getPromptForDate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTodayNoteFile(app)
      .then(async (todayFile) => {
        if (cancelled) return;
        setFile(todayFile);
        const sections = await readTodaySections(app, todayFile);
        if (cancelled) return;
        setAnswer(sections.answer);
        setItems(sections.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnswerBlur = () => {
    if (!file) return;
    saveReflection(app, file, prompt, answer)
      .then(() => setSaveError(null))
      .catch((e) => setSaveError(e instanceof Error ? e.message : String(e)));
  };

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed || !file) return;
    const updated = [...items, { category: newItemCategory, text: trimmed }];
    setItems(updated);
    setNewItemText('');
    saveBrainDump(app, file, updated)
      .then(() => setSaveError(null))
      .catch((e) => setSaveError(e instanceof Error ? e.message : String(e)));
  };

  const handleDeleteItem = (index: number) => {
    if (!file) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    saveBrainDump(app, file, updated)
      .then(() => setSaveError(null))
      .catch((e) => setSaveError(e instanceof Error ? e.message : String(e)));
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="type-body text-text-muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="border border-border-strong bg-surface-well p-sp-4 text-center">
          <p className="type-body text-accent-danger">Couldn't load today's note</p>
          <p className="type-small text-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-sp-4 overflow-y-auto p-sp-4">
      {saveError && (
        <div className="border border-border-strong bg-surface-well p-sp-3 text-center">
          <p className="type-small text-accent-danger">Couldn't save — check your vault. ({saveError})</p>
        </div>
      )}
      <div className="border border-border-strong bg-surface-card p-sp-4 shadow-sm text-center">
        <p className="type-label text-text-muted">{prompt}</p>
        <textarea
          value={answer}
          onInput={(e) => setAnswer((e.target as HTMLTextAreaElement).value)}
          onBlur={handleAnswerBlur}
          rows={4}
          className="type-body mt-sp-2 w-full border border-border-strong bg-surface-page p-sp-2 text-text-body"
        />
      </div>

      <div className="flex flex-col gap-sp-2">
        <div className="flex items-center gap-sp-2">
          <input
            type="text"
            value={newItemText}
            onInput={(e) => setNewItemText((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
            placeholder="Dump a thought..."
            className="type-body flex-1 border border-border-strong bg-surface-page px-sp-2 py-sp-1"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory((e.target as HTMLSelectElement).value as BrainDumpCategory)}
            className="type-body border border-border-strong bg-surface-page px-sp-2 py-sp-1"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddItem}
            className="type-label border border-border-strong bg-surface-well px-3 py-1.5 cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="grid grid-cols-2 gap-sp-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="border border-border-strong bg-surface-card p-sp-3 shadow-sm">
              <p className="type-label text-center text-text-muted">{category}</p>
              <div className="mt-sp-2 flex flex-col gap-sp-1">
                {items
                  .map((item, index) => ({ item, index }))
                  .filter(({ item }) => item.category === category)
                  .map(({ item, index }) => (
                    <div key={index} className="flex items-center justify-between gap-sp-2">
                      <p className="type-small break-words text-text-body">{item.text}</p>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="type-caption border border-border-strong bg-surface-well px-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
