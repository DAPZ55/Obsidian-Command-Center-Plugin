// src/components/TileCard.tsx
import { h } from 'preact';
import type { LucideIcon } from 'lucide-react';

interface TileCardProps {
  icon: LucideIcon;
  label: string;
  snippet: string | null;
  loading: boolean;
}

export function TileCard({ icon: Icon, label, snippet, loading }: TileCardProps) {
  return (
    <div className="flex w-40 flex-col items-center gap-sp-2 border border-border-strong bg-surface-card p-sp-4 shadow-sm text-center">
      <Icon size={28} />
      <p className="type-label text-text-body">{label}</p>
      {loading && <p className="type-caption text-text-muted">…</p>}
      {!loading && snippet && <p className="type-caption text-text-muted">{snippet}</p>}
    </div>
  );
}
