import { h } from 'preact';

export type TabId = 'command-center' | 'news-signals' | 'intelligence' | 'canvas';

const TABS: { id: TabId; label: string }[] = [
  { id: 'command-center', label: 'Command Center' },
  { id: 'news-signals', label: 'News and Signals' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'canvas', label: 'Canvas' },
];

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      className="flex gap-1 border border-border-strong bg-surface-card px-4 shadow-sm"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={
              'type-label relative inline-flex items-center border-none bg-transparent px-3 pb-3 pt-2.5 cursor-pointer transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ' +
              (isActive ? 'text-text-body' : 'text-text-muted')
            }
          >
            {tab.label}
            <span
              className={
                'absolute inset-x-2 -bottom-px h-0.5 bg-accent-primary transition-opacity duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ' +
                (isActive ? 'opacity-100' : 'opacity-0')
              }
            />
          </button>
        );
      })}
    </div>
  );
}
