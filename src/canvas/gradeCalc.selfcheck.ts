import assert from 'node:assert';
import { computeNeededGrade } from './gradeCalc.ts';
import type { CanvasAssignmentGroup } from './types.ts';

function group(
  weight: number,
  assignments: { points_possible: number; score: number | null }[]
): CanvasAssignmentGroup {
  return {
    id: weight,
    name: `group-${weight}`,
    group_weight: weight,
    assignments: assignments.map((a, i) => ({
      id: i,
      name: `a${i}`,
      due_at: null,
      points_possible: a.points_possible,
      submission: { score: a.score, workflow_state: a.score !== null ? 'graded' : 'unsubmitted' },
    })),
  };
}

// Single group, weight 100, 2 graded (20+22=42/50) + 2 ungraded (50 remaining), goal 99 -> unreachable
// fixedSum=100*42/100=42, variableSum=100*50/100=50, neededPercent=100*(99-42)/50=114
{
  const groups = [
    group(100, [
      { points_possible: 25, score: 20 },
      { points_possible: 25, score: 22 },
      { points_possible: 25, score: null },
      { points_possible: 25, score: null },
    ]),
  ];
  const result = computeNeededGrade(groups, 99);
  assert.strictEqual(result.kind, 'unreachable');
  if (result.kind === 'unreachable') {
    assert.ok(Math.abs(result.neededPercent - 114) < 0.1, `got ${result.neededPercent}`);
  }
}

// Same course, goal 40 -> goal already exceeded even at 0% on remaining
{
  const groups = [
    group(100, [
      { points_possible: 25, score: 20 },
      { points_possible: 25, score: 22 },
      { points_possible: 25, score: null },
      { points_possible: 25, score: null },
    ]),
  ];
  const result = computeNeededGrade(groups, 40);
  assert.strictEqual(result.kind, 'goal-exceeded');
}

// Two weighted groups: G1 weight 40 fully graded (85/100), G2 weight 60, one graded (30/50) one ungraded (50 remaining), goal 80 -> computed ~93.33
{
  const groups = [
    group(40, [
      { points_possible: 50, score: 45 },
      { points_possible: 50, score: 40 },
    ]),
    group(60, [
      { points_possible: 50, score: 30 },
      { points_possible: 50, score: null },
    ]),
  ];
  const result = computeNeededGrade(groups, 80);
  assert.strictEqual(result.kind, 'computed');
  if (result.kind === 'computed') {
    assert.ok(Math.abs(result.neededPercent - 93.33) < 0.1, `got ${result.neededPercent}`);
  }
}

// All groups fully graded -> no-remaining-work, regardless of goal
{
  const groups = [group(100, [{ points_possible: 50, score: 45 }])];
  const result = computeNeededGrade(groups, 99);
  assert.strictEqual(result.kind, 'no-remaining-work');
}

// Group with zero total possible points is skipped, not a divide-by-zero crash.
// Surviving group: weight50, earned=40/100 total, remaining=50, so fixedSum=50*40/100=20,
// variableSum=50*50/100=25. goal=30 -> neededPercent=100*(30-20)/25=40.
{
  const groups = [
    group(50, []),
    group(50, [
      { points_possible: 50, score: 40 },
      { points_possible: 50, score: null },
    ]),
  ];
  const result = computeNeededGrade(groups, 30);
  assert.strictEqual(result.kind, 'computed');
  if (result.kind === 'computed') {
    assert.ok(Math.abs(result.neededPercent - 40) < 0.1, `got ${result.neededPercent}`);
  }
}

console.log('gradeCalc self-check: all assertions passed');
