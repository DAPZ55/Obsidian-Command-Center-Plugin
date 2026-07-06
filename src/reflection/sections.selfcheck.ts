import assert from 'node:assert';
import {
  parseReflectionAnswer,
  parseBrainDumpItems,
  upsertReflectionSection,
  upsertBrainDumpSection,
} from './sections.ts';

// 1. Empty file has no sections
{
  assert.strictEqual(parseReflectionAnswer(''), '');
  assert.deepStrictEqual(parseBrainDumpItems(''), []);
}

// 2. File with both sections present
{
  const content = [
    '---',
    'banner: test.jpg',
    '---',
    '',
    '## Reflection',
    '**What went well today?**',
    'Shipped a feature.',
    'Feeling good about it.',
    '',
    '## Brain Dump',
    '- [Task] email professor',
    '- [Idea] app feature',
    '',
  ].join('\n');

  assert.strictEqual(parseReflectionAnswer(content), 'Shipped a feature.\nFeeling good about it.');
  assert.deepStrictEqual(parseBrainDumpItems(content), [
    { category: 'Task', text: 'email professor' },
    { category: 'Idea', text: 'app feature' },
  ]);
}

// 3. Upserting into a file with neither section appends both (order doesn't matter)
{
  const content = '---\nbanner: test.jpg\n---\n';
  const withReflection = upsertReflectionSection(content, 'What went well today?', 'Good day.');
  assert.ok(withReflection.includes('## Reflection'));
  assert.ok(withReflection.includes('**What went well today?**'));
  assert.ok(withReflection.includes('Good day.'));
  assert.ok(withReflection.startsWith('---\nbanner: test.jpg\n---\n'));

  const withBoth = upsertBrainDumpSection(withReflection, [{ category: 'Worry', text: 'exam friday' }]);
  assert.ok(withBoth.includes('## Brain Dump'));
  assert.ok(withBoth.includes('- [Worry] exam friday'));
  assert.ok(withBoth.includes('## Reflection'), 'reflection section preserved');
}

// 4. Upserting the missing section preserves the existing one untouched
{
  const content = ['## Reflection', '**What went well today?**', 'Existing answer.', ''].join('\n');

  const updated = upsertBrainDumpSection(content, [{ category: 'Task', text: 'new task' }]);
  assert.ok(updated.includes('## Reflection'));
  assert.ok(updated.includes('Existing answer.'));
  assert.ok(updated.includes('## Brain Dump'));
  assert.ok(updated.includes('- [Task] new task'));
}

// 5. Updating an existing section in place doesn't touch text before/after it
{
  const content = [
    '## Reflection',
    '**What went well today?**',
    'Old answer.',
    '',
    '## Brain Dump',
    '- [Task] old task',
    '',
  ].join('\n');

  const updated = upsertReflectionSection(content, 'What went well today?', 'New answer.');
  assert.ok(updated.includes('New answer.'));
  assert.ok(!updated.includes('Old answer.'));
  assert.ok(updated.includes('## Brain Dump'));
  assert.ok(updated.includes('- [Task] old task'), 'brain dump section untouched');
}

// 6. A user-written heading that merely starts with our heading text must not be
// mistaken for the managed section (e.g. "## Reflection on Life" is not "## Reflection")
{
  const content = [
    '## Reflection on Life',
    'Some unrelated personal essay content.',
    '',
  ].join('\n');

  const updated = upsertReflectionSection(content, 'What went well today?', 'New answer.');
  assert.ok(updated.includes('## Reflection on Life'));
  assert.ok(updated.includes('Some unrelated personal essay content.'), 'unrelated heading and content preserved, not overwritten');
  assert.ok(updated.includes('## Reflection\n'), 'new managed section appended separately');
  assert.ok(updated.includes('New answer.'));
}

console.log('sections self-check: all assertions passed');
