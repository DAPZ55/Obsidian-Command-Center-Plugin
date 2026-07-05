export interface CanvasCourse {
  id: number;
  name: string;
}

export interface CanvasSubmission {
  score: number | null;
  workflow_state: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number;
  submission?: CanvasSubmission;
}

export interface CanvasAssignmentGroup {
  id: number;
  name: string;
  group_weight: number;
  assignments: CanvasAssignment[];
}

export interface CanvasCourseGrade {
  id: number;
  name: string;
  current_score: number | null;
}

export interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string | null;
  context_code: string;
}
