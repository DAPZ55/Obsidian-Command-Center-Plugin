// src/components/tileSnippets.ts
import { useEffect, useState } from 'preact/hooks';
import type { App as ObsidianApp } from 'obsidian';
import type AlanCommandCenterPlugin from '../main';
import { fetchNews } from '../news/api';
import { fetchNearestDueDate } from '../canvas/api';
import { getTodayNoteFile, readTodaySections } from '../reflection/dailyNote';

interface SnippetState {
  snippet: string | null;
  loading: boolean;
}

const BRAIN_DUMP_REFRESH_MS = 10 * 60 * 1000;

export function useNewsSnippet(plugin: AlanCommandCenterPlugin): SnippetState {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchNews(plugin.settings.newsTopic)
      .then((articles) => {
        if (cancelled) return;
        setSnippet(articles[0]?.title ?? null);
      })
      .catch(() => {
        if (!cancelled) setSnippet(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { snippet, loading };
}

export function useBrainDumpSnippet(app: ObsidianApp): SnippetState {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const pickRandomItem = async () => {
      try {
        const file = await getTodayNoteFile(app);
        const { items } = await readTodaySections(app, file);
        if (cancelled) return;
        setSnippet(items.length > 0 ? items[Math.floor(Math.random() * items.length)].text : null);
      } catch {
        if (!cancelled) setSnippet(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void pickRandomItem();
    const intervalId = setInterval(() => void pickRandomItem(), BRAIN_DUMP_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return { snippet, loading };
}

export function useCanvasSnippet(plugin: AlanCommandCenterPlugin): SnippetState {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const courseIds = plugin.settings.selectedCourses.map((c) => c.id);

    if (!plugin.settings.baseUrl || !plugin.settings.token || courseIds.length === 0) {
      setSnippet(null);
      setLoading(false);
      return;
    }

    fetchNearestDueDate(plugin.settings.baseUrl, plugin.settings.token, courseIds)
      .then((dueDate) => {
        if (cancelled) return;
        setSnippet(
          dueDate
            ? `Next due: ${new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
            : null
        );
      })
      .catch(() => {
        if (!cancelled) setSnippet(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { snippet, loading };
}
