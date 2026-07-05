import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import type { App as ObsidianApp } from 'obsidian';
import type { default as AlanCommandCenterPlugin } from './main';
import { TabBar, TabId } from './components/TabBar';
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
  const [activeTab, setActiveTab] = useState<TabId>('command-center');

  return (
    <div className="flex h-full w-full flex-col bg-surface-page text-text-body">
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="px-4 py-sp-4">
        <SearchBar app={app} />
      </div>
      <div className="relative flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
            className="h-full w-full"
          >
            {activeTab === 'command-center' && <CommandCenterPanel />}
            {activeTab === 'news-signals' && <NewsPanel plugin={plugin} />}
            {activeTab === 'intelligence' && <PlaceholderPanel label="Intelligence" />}
            {activeTab === 'canvas' && <CanvasPanel plugin={plugin} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
