// src/App.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import type { App as ObsidianApp } from 'obsidian';
import type { default as AlanCommandCenterPlugin } from './main';
import { TileGrid, SectionId } from './components/TileGrid';
import { SearchBar } from './components/SearchBar';
import { CommandCenterPanel } from './panels/CommandCenterPanel';
import { PlaceholderPanel } from './panels/PlaceholderPanel';
import { CanvasPanel } from './panels/CanvasPanel';
import { NewsPanel } from './panels/NewsPanel';

interface AppProps {
  app: ObsidianApp;
  plugin: AlanCommandCenterPlugin;
}

export function App({ app, plugin }: AppProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  return (
    <div className="flex h-full w-full flex-col bg-surface-page text-text-body">
      <div className="px-4 py-sp-4">
        <SearchBar app={app} />
      </div>
      <div className="relative flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection ?? 'grid'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
            className="h-full w-full"
          >
            {activeSection === null && (
              <div className="h-full w-full overflow-y-auto p-sp-4">
                <TileGrid plugin={plugin} onSelect={setActiveSection} />
              </div>
            )}
            {activeSection !== null && (
              <div className="flex h-full w-full flex-col">
                <div className="p-sp-4">
                  <button
                    onClick={() => setActiveSection(null)}
                    className="type-label border border-border-strong bg-surface-well px-3 py-1.5 cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  {activeSection === 'command-center' && <CommandCenterPanel />}
                  {activeSection === 'news-signals' && <NewsPanel plugin={plugin} />}
                  {activeSection === 'intelligence' && <PlaceholderPanel label="Intelligence" />}
                  {activeSection === 'canvas' && <CanvasPanel plugin={plugin} />}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
