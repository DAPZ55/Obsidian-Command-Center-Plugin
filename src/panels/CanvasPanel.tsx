// src/panels/CanvasPanel.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import type AlanCommandCenterPlugin from '../main';
import { CourseAssignmentsView } from './CourseAssignmentsView';
import { CanvasOverviewView } from './CanvasOverviewView';

interface CanvasPanelProps {
  plugin: AlanCommandCenterPlugin;
}

const OVERVIEW_TAB_ID = 'overview';

export function CanvasPanel({ plugin }: CanvasPanelProps) {
  const courses = plugin.settings.selectedCourses;
  const [activeSubTabId, setActiveSubTabId] = useState<string>(OVERVIEW_TAB_ID);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!plugin.settings.baseUrl || !plugin.settings.token) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="type-body text-text-muted">Set up Canvas in plugin settings</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="type-body text-text-muted">No courses selected — pick some in plugin settings</p>
      </div>
    );
  }

  const subTabs = [{ id: OVERVIEW_TAB_ID, name: 'Overview' }, ...courses];
  const currentSubTabId = subTabs.some((t) => t.id === activeSubTabId) ? activeSubTabId : OVERVIEW_TAB_ID;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border border-border-strong bg-surface-card px-4 shadow-sm">
        <div role="tablist" className="flex gap-1">
          {subTabs.map((tab) => {
            const isActive = tab.id === currentSubTabId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSubTabId(tab.id)}
                className={
                  'type-label relative inline-flex items-center border-none bg-transparent px-3 py-2.5 cursor-pointer transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ' +
                  (isActive ? 'text-text-body' : 'text-text-muted')
                }
              >
                {tab.name}
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
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="type-label border border-border-strong bg-surface-well px-3 py-1.5 cursor-pointer"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-auto p-sp-4">
        {currentSubTabId === OVERVIEW_TAB_ID ? (
          <CanvasOverviewView key={'overview-' + refreshKey} plugin={plugin} />
        ) : (
          <CourseAssignmentsView
            key={currentSubTabId + '-' + refreshKey}
            plugin={plugin}
            courseId={currentSubTabId}
          />
        )}
      </div>
    </div>
  );
}
