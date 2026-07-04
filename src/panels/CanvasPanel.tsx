// src/panels/CanvasPanel.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import type AlanCommandCenterPlugin from '../main';
import { CourseAssignmentsView } from './CourseAssignmentsView';

interface CanvasPanelProps {
  plugin: AlanCommandCenterPlugin;
}

export function CanvasPanel({ plugin }: CanvasPanelProps) {
  const courses = plugin.settings.selectedCourses;
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courses[0]?.id ?? null);
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

  const currentCourseId =
    activeCourseId && courses.some((c) => c.id === activeCourseId) ? activeCourseId : courses[0].id;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border border-border-strong bg-surface-card px-4 shadow-sm">
        <div role="tablist" className="flex gap-1">
          {courses.map((course) => {
            const isActive = course.id === currentCourseId;
            return (
              <button
                key={course.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCourseId(course.id)}
                className={
                  'type-label relative inline-flex items-center border-none bg-transparent px-3 py-2.5 cursor-pointer transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ' +
                  (isActive ? 'text-text-body' : 'text-text-muted')
                }
              >
                {course.name}
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
        <CourseAssignmentsView key={currentCourseId + '-' + refreshKey} plugin={plugin} courseId={currentCourseId} />
      </div>
    </div>
  );
}
