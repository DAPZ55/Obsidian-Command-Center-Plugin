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
