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
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-sp-4">
      {tiles.map((tile) => (
        <motion.button
          key={tile.id}
          onClick={() => onSelect(tile.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
          style={{ border: 'none', background: 'transparent', padding: 0 }}
        >
          <TileCard icon={tile.icon} label={tile.label} snippet={tile.snippet} loading={tile.loading} />
        </motion.button>
      ))}
    </div>
  );
}
