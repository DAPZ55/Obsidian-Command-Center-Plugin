// src/panels/CanvasOverviewView.tsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type AlanCommandCenterPlugin from '../main';
import { fetchCoursesWithGrades, fetchAnnouncements } from '../canvas/api';
import type { CanvasCourseGrade, CanvasAnnouncement } from '../canvas/types';

interface CanvasOverviewViewProps {
  plugin: AlanCommandCenterPlugin;
}

const MESSAGE_TRUNCATE_LENGTH = 160;

function truncate(html: string, length: number): string {
  const text = html.replace(/<[^>]*>/g, '');
  return text.length > length ? text.slice(0, length) + '…' : text;
}

function courseNameFromContextCode(
  contextCode: string,
  selectedCourses: { id: string; name: string }[]
): string {
  const id = contextCode.replace('course_', '');
  return selectedCourses.find((c) => c.id === id)?.name ?? 'Unknown course';
}

export function CanvasOverviewView({ plugin }: CanvasOverviewViewProps) {
  const [grades, setGrades] = useState<CanvasCourseGrade[] | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<CanvasAnnouncement[] | null>(null);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGradesError(null);
    setAnnouncementsError(null);

    const selectedIds = plugin.settings.selectedCourses.map((c) => c.id);
    const selectedIdSet = new Set(selectedIds);

    const gradesPromise = fetchCoursesWithGrades(plugin.settings.baseUrl, plugin.settings.token)
      .then((result) => {
        if (!cancelled) setGrades(result.filter((g) => selectedIdSet.has(String(g.id))));
      })
      .catch((e) => {
        if (!cancelled) setGradesError(e instanceof Error ? e.message : String(e));
      });

    const announcementsPromise = fetchAnnouncements(
      plugin.settings.baseUrl,
      plugin.settings.token,
      selectedIds
    )
      .then((result) => {
        if (!cancelled) setAnnouncements(result);
      })
      .catch((e) => {
        if (!cancelled) setAnnouncementsError(e instanceof Error ? e.message : String(e));
      });

    Promise.all([gradesPromise, announcementsPromise]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="type-body text-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="grid grid-cols-2 gap-sp-2 sm:grid-cols-3">
        {gradesError && (
          <div className="col-span-full border border-border-strong bg-surface-well p-sp-3 text-center">
            <p className="type-small text-accent-danger">Couldn't load grades — check plugin settings</p>
          </div>
        )}
        {!gradesError &&
          (grades ?? []).map((g) => (
            <div key={g.id} className="border border-border-strong bg-surface-card p-sp-3 shadow-sm text-center">
              <p className="type-label text-text-muted">{g.name}</p>
              <p className="type-h3">{g.current_score !== null ? `${g.current_score.toFixed(1)}%` : '—'}</p>
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-sp-2">
        {announcementsError && (
          <div className="border border-border-strong bg-surface-well p-sp-3 text-center">
            <p className="type-small text-accent-danger">Couldn't load announcements — check plugin settings</p>
          </div>
        )}
        {!announcementsError &&
          (announcements ?? []).map((a) => (
            <div key={a.id} className="border border-border-strong bg-surface-card p-sp-3 shadow-sm text-center">
              <p className="type-body">{a.title}</p>
              <p className="type-small text-text-muted">
                {courseNameFromContextCode(a.context_code, plugin.settings.selectedCourses)}
                {' · '}
                {a.posted_at ? new Date(a.posted_at).toLocaleDateString() : 'No date'}
              </p>
              <p className="type-small text-text-muted">{truncate(a.message, MESSAGE_TRUNCATE_LENGTH)}</p>
            </div>
          ))}
        {!announcementsError && (announcements ?? []).length === 0 && (
          <p className="type-body text-text-muted text-center">No recent announcements</p>
        )}
      </div>
    </div>
  );
}
