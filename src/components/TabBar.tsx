import { h } from 'preact';

export type TabId = 'command-center' | 'news-signals' | 'intelligence';

const TABS: { id: TabId; label: string }[] = [
  { id: 'command-center', label: 'Command Center' },
  { id: 'news-signals', label: 'News and Signals' },
  { id: 'intelligence', label: 'Intelligence' },
];

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border-subtle px-4">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={
              'relative inline-flex items-center border-none bg-transparent px-3 pb-3 pt-2.5 font-sans text-md cursor-pointer transition-colors duration-[120ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ' +
              (isActive ? 'text-text-primary font-semibold' : 'text-text-secondary font-medium')
            }
          >
            {tab.label}
            <span
              className={
                'absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent transition-opacity duration-[120ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ' +
                (isActive ? 'opacity-100' : 'opacity-0')
              }
            />
          </button>
        );
      })}
    </div>
  );
}
