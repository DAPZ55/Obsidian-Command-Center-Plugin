import { h, JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { App as ObsidianApp, SearchResult, TFile } from 'obsidian';
import { prepareFuzzySearch, sortSearchResults } from 'obsidian';

interface SearchBarProps {
  app: ObsidianApp;
}

interface FileMatch {
  file: TFile;
  match: SearchResult;
}

const MAX_RESULTS = 8;

// steps(1,end)-equivalent: holds the initial value for the full duration,
// then snaps to the final value — matches the --anim-fast token's stepped
// feel, which framer-motion has no built-in "steps" easing for.
const snapEase = (t: number) => (t < 1 ? 0 : 1);

export function SearchBar({ app }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const results = useMemo<FileMatch[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const search = prepareFuzzySearch(trimmed);
    const matches: FileMatch[] = [];

    for (const file of app.vault.getMarkdownFiles()) {
      const match = search(file.path);
      if (match) matches.push({ file, match });
    }

    sortSearchResults(matches);
    return matches.slice(0, MAX_RESULTS);
  }, [query, app]);

  const isOpen = isFocused && results.length > 0;

  function clampIndex(index: number): number {
    if (results.length === 0) return 0;
    return Math.max(0, Math.min(index, results.length - 1));
  }

  function openFile(file: TFile) {
    app.workspace.getLeaf('tab').openFile(file);
    setQuery('');
    setHighlightedIndex(0);
  }

  function handleKeyDown(event: JSX.TargetedKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => clampIndex(index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => clampIndex(index - 1));
    } else if (event.key === 'Enter') {
      const selected = results[highlightedIndex];
      if (selected) openFile(selected.file);
    } else if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  }

  return (
    <div className="relative mx-auto max-w-md">
      <div className="flex items-center gap-2 border border-border-strong bg-surface-card px-3 py-2 shadow-sm transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-md">
        <Search size={16} className="shrink-0 text-text-muted" />
        <input
          type="text"
          value={query}
          placeholder="Search notes..."
          className="type-body w-full border-none bg-transparent text-center text-text-body outline-none placeholder:text-text-muted"
          onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>) => {
            setQuery(event.currentTarget.value);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.08, ease: snapEase }}
            className="absolute inset-x-0 top-full z-10 mt-2 border border-border-strong bg-surface-card shadow-md"
          >
            {results.map((result, index) => (
              <button
                key={result.file.path}
                type="button"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                className={
                  'w-full gap-0.5 px-3 py-2 text-center transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ' +
                  (index === highlightedIndex ? 'bg-accent-highlight' : 'bg-surface-card hover:bg-accent-highlight')
                }
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => openFile(result.file)}
              >
                <span className="type-body block w-full text-text-body">{result.file.basename}</span>
                <span className="type-caption block w-full text-text-muted">
                  {result.file.parent?.path || '/'}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
