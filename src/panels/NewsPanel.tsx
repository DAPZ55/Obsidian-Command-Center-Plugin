// src/panels/NewsPanel.tsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type AlanCommandCenterPlugin from '../main';
import { fetchNews } from '../news/api';
import type { NewsArticle } from '../news/types';

interface NewsPanelProps {
  plugin: AlanCommandCenterPlugin;
}

export function NewsPanel({ plugin }: NewsPanelProps) {
  const [topic, setTopic] = useState(plugin.settings.newsTopic);
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchNews(topic)
      .then((result) => {
        if (!cancelled) setArticles(result);
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
  }, [topic, refreshKey]);

  const commitTopic = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed === topic) return;
    setTopic(trimmed);
    plugin.settings.newsTopic = trimmed;
    void plugin.saveSettings();
  };

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between border border-border-strong bg-surface-card px-4 py-sp-2 shadow-sm">
        <div className="flex items-center gap-sp-2">
          <label className="type-label text-text-muted" htmlFor="news-topic">
            Topic:
          </label>
          <input
            id="news-topic"
            type="text"
            defaultValue={topic}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTopic((e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => commitTopic((e.target as HTMLInputElement).value)}
            className="type-body border border-border-strong bg-surface-page px-sp-2 text-center"
          />
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="type-label border border-border-strong bg-surface-well px-3 py-1.5 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-sp-2 p-sp-4">
        {loading && <p className="type-body text-text-muted text-center">Loading…</p>}
        {!loading && error && (
          <div className="border border-border-strong bg-surface-well p-sp-3 text-center">
            <p className="type-small text-accent-danger">Couldn't load news — check your connection</p>
          </div>
        )}
        {!loading && !error && (articles ?? []).length === 0 && (
          <p className="type-body text-text-muted text-center">No articles found for this topic</p>
        )}
        {!loading &&
          !error &&
          (articles ?? []).map((a) => (
            <div key={a.link} className="border border-border-strong bg-surface-card p-sp-3 shadow-sm text-center">
              <p className="type-body">{a.title}</p>
              <p className="type-small text-text-muted">
                {a.source}
                {' · '}
                {a.pubDate ? new Date(a.pubDate).toLocaleDateString() : 'No date'}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
