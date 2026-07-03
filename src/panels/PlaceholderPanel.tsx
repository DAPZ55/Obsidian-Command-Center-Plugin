import { h } from 'preact';

interface PlaceholderPanelProps {
  label: string;
}

export function PlaceholderPanel({ label }: PlaceholderPanelProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="type-body text-text-muted">{label} — coming soon</p>
    </div>
  );
}
