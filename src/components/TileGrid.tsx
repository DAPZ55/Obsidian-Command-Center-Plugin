// src/components/TileGrid.tsx
import { h } from 'preact';
import { motion } from 'framer-motion';
import { LayoutDashboard, Newspaper, Brain, GraduationCap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type AlanCommandCenterPlugin from '../main';
import { TileCard } from './TileCard';
import { useNewsSnippet, useCanvasSnippet } from './tileSnippets';

export type SectionId = 'command-center' | 'news-signals' | 'intelligence' | 'canvas';

interface TileGridProps {
  plugin: AlanCommandCenterPlugin;
  onSelect: (section: SectionId) => void;
}

interface Tile {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  snippet: string | null;
  loading: boolean;
}

export function TileGrid({ plugin, onSelect }: TileGridProps) {
  const news = useNewsSnippet(plugin);
  const canvas = useCanvasSnippet(plugin);

  const tiles: Tile[] = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, snippet: null, loading: false },
    { id: 'news-signals', label: 'News and Signals', icon: Newspaper, snippet: news.snippet, loading: news.loading },
    { id: 'intelligence', label: 'Intelligence', icon: Brain, snippet: null, loading: false },
    { id: 'canvas', label: 'Canvas', icon: GraduationCap, snippet: canvas.snippet, loading: canvas.loading },
  ];

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-[5px]">
      {tiles.map((tile, index) => (
        <motion.div
          key={tile.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tile.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(tile.id);
          }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="cursor-pointer"
          style={{
            gridColumn: (index % 2) + 1,
            gridRow: Math.floor(index / 2) + 1,
          }}
        >
          <TileCard icon={tile.icon} label={tile.label} snippet={tile.snippet} loading={tile.loading} />
        </motion.div>
      ))}
    </div>
  );
}
