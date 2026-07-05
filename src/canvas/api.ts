import { requestUrl } from 'obsidian';
import type { CanvasCourse, CanvasAssignmentGroup, CanvasCourseGrade, CanvasAnnouncement } from './types';

export async function fetchCourses(baseUrl: string, token: string): Promise<CanvasCourse[]> {
  const res = await requestUrl({
    url: `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=100`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json as CanvasCourse[];
}

export async function fetchCourseAssignmentGroups(
  baseUrl: string,
  token: string,
  courseId: number
): Promise<CanvasAssignmentGroup[]> {
  const res = await requestUrl({
    url: `${baseUrl}/api/v1/courses/${courseId}/assignment_groups?include[]=assignments&include[]=submission`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json as CanvasAssignmentGroup[];
}

export async function fetchCoursesWithGrades(
  baseUrl: string,
  token: string
): Promise<CanvasCourseGrade[]> {
  const res = await requestUrl({
    url: `${baseUrl}/api/v1/courses?enrollment_state=active&include[]=total_scores&per_page=100`,
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw = res.json as {
    id: number;
    name: string;
    enrollments?: { computed_current_score: number | null }[];
  }[];
  return raw.map((course) => ({
    id: course.id,
    name: course.name,
    current_score: course.enrollments?.[0]?.computed_current_score ?? null,
  }));
}

export async function fetchAnnouncements(
  baseUrl: string,
  token: string,
  courseIds: string[]
): Promise<CanvasAnnouncement[]> {
  const contextParams = courseIds.map((id) => `context_codes[]=course_${id}`).join('&');
  const res = await requestUrl({
    url: `${baseUrl}/api/v1/announcements?${contextParams}&per_page=10`,
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw = res.json as CanvasAnnouncement[];
  return raw.slice(0, 10);
}

export async function fetchNearestDueDate(
  baseUrl: string,
  token: string,
  courseIds: string[]
): Promise<string | null> {
  const groupsByCourse = await Promise.all(
    courseIds.map((id) => fetchCourseAssignmentGroups(baseUrl, token, Number(id)))
  );
  const now = Date.now();
  const dueDates = groupsByCourse
    .flatMap((groups) => groups.flatMap((g) => g.assignments))
    .map((a) => a.due_at)
    .filter((d): d is string => d !== null && new Date(d).getTime() > now)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return dueDates[0] ?? null;
}
