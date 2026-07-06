export type BrainDumpCategory = 'Task' | 'Idea' | 'Worry' | 'Question';

export interface BrainDumpItem {
  category: BrainDumpCategory;
  text: string;
}
