import type { CanvasAssignmentGroup } from './types';

export type GradeCalcResult =
  | { kind: 'computed'; neededPercent: number }
  | { kind: 'no-remaining-work' }
  | { kind: 'unreachable'; neededPercent: number }
  | { kind: 'goal-exceeded' };

export function computeNeededGrade(
  groups: CanvasAssignmentGroup[],
  goalPercent: number
): GradeCalcResult {
  let fixedSum = 0;
  let variableSum = 0;

  for (const group of groups) {
    const totalPossible = group.assignments.reduce((sum, a) => sum + a.points_possible, 0);
    if (totalPossible === 0) continue;

    const earned = group.assignments.reduce((sum, a) => {
      const isGraded = a.submission != null && a.submission.score !== null;
      return isGraded ? sum + (a.submission!.score as number) : sum;
    }, 0);

    const remainingPossible = group.assignments.reduce((sum, a) => {
      const isGraded = a.submission != null && a.submission.score !== null;
      return isGraded ? sum : sum + a.points_possible;
    }, 0);

    fixedSum += (group.group_weight * earned) / totalPossible;
    variableSum += (group.group_weight * remainingPossible) / totalPossible;
  }

  if (variableSum === 0) {
    return { kind: 'no-remaining-work' };
  }

  const neededPercent = (100 * (goalPercent - fixedSum)) / variableSum;

  if (neededPercent < 0) {
    return { kind: 'goal-exceeded' };
  }
  if (neededPercent > 100) {
    return { kind: 'unreachable', neededPercent };
  }
  return { kind: 'computed', neededPercent };
}
