import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { TabBar, TabId } from './components/TabBar';
import { CommandCenterPanel } from './panels/CommandCenterPanel';
import { PlaceholderPanel } from './panels/PlaceholderPanel';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('command-center');

  return (
    <div className="flex h-full w-full flex-col bg-bg-canvas text-text-primary">
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
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
            {activeTab === 'news-signals' && <PlaceholderPanel label="News and Signals" />}
            {activeTab === 'intelligence' && <PlaceholderPanel label="Intelligence" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
