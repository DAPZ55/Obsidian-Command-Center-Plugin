// src/panels/CourseAssignmentsView.tsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type AlanCommandCenterPlugin from '../main';
import { fetchCourseAssignmentGroups } from '../canvas/api';
import { computeNeededGrade } from '../canvas/gradeCalc';
import type { CanvasAssignmentGroup, CanvasAssignment } from '../canvas/types';

interface CourseAssignmentsViewProps {
  plugin: AlanCommandCenterPlugin;
  courseId: string;
}

const DEFAULT_GOAL = 90;

function sortByDueDate(assignments: CanvasAssignment[]): CanvasAssignment[] {
  return assignments.slice().sort((a, b) => {
    if (!a.due_at && !b.due_at) return 0;
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });
}

export function CourseAssignmentsView({ plugin, courseId }: CourseAssignmentsViewProps) {
  const [groups, setGroups] = useState<CanvasAssignmentGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(plugin.settings.goalsByCourseId[courseId] ?? DEFAULT_GOAL);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCourseAssignmentGroups(plugin.settings.baseUrl, plugin.settings.token, Number(courseId))
      .then((result) => {
        if (!cancelled) setGroups(result);
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
  }, [courseId]);

  const handleGoalChange = (value: number) => {
    setGoal(value);
    plugin.settings.goalsByCourseId[courseId] = value;
    void plugin.saveSettings();
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="type-body text-text-muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border-strong bg-surface-well p-sp-4 text-center">
        <p className="type-body text-accent-danger">Couldn't load — check plugin settings</p>
        <p className="type-small text-text-muted">{error}</p>
      </div>
    );
  }

  const allAssignments = sortByDueDate((groups ?? []).flatMap((g) => g.assignments));
  const result = computeNeededGrade(groups ?? [], goal);

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="border border-border-strong bg-surface-card p-sp-4 shadow-sm text-center">
        <div className="flex items-center justify-center gap-sp-2">
          <label className="type-label text-text-muted" htmlFor={`goal-${courseId}`}>
            Goal:
          </label>
          <input
            id={`goal-${courseId}`}
            type="number"
            min={0}
            max={100}
            value={goal}
            onChange={(e) => handleGoalChange(Number((e.target as HTMLInputElement).value))}
            className="type-body w-16 border border-border-strong bg-surface-page px-sp-2 text-center"
          />
          <span className="type-label text-text-muted">%</span>
        </div>
        <p className="type-h3 mt-sp-2">
          {result.kind === 'no-remaining-work' && 'Nothing left to raise it.'}
          {result.kind === 'goal-exceeded' && 'Already exceeded goal.'}
          {result.kind === 'unreachable' && (
            <span className="text-accent-danger">
              Not reachable — would need {result.neededPercent.toFixed(1)}% on remaining work.
            </span>
          )}
          {result.kind === 'computed' && `Need ${result.neededPercent.toFixed(1)}% on remaining work.`}
        </p>
      </div>

      <div className="flex flex-col gap-sp-2">
        {allAssignments.map((a) => (
          <div key={a.id} className="border border-border-strong bg-surface-card p-sp-3 shadow-sm text-center">
            <p className="type-body">{a.name}</p>
            <p className="type-small text-text-muted">
              Due: {a.due_at ? new Date(a.due_at).toLocaleString() : 'No due date'} · {a.points_possible} pts ·{' '}
              {a.submission?.workflow_state ?? 'unsubmitted'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
