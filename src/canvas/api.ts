import { requestUrl } from 'obsidian';
import type { CanvasCourse, CanvasAssignmentGroup } from './types';

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
