// src/components/TileCard.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface TileCardProps {
  icon: LucideIcon;
  label: string;
  snippet: string | null;
  loading: boolean;
}

export function TileCard({ icon: Icon, label, snippet, loading }: TileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showSub = isHovered && (loading || snippet);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex w-full flex-col items-center gap-sp-2 border border-border-strong bg-surface-card p-sp-6 shadow-sm text-center"
    >
      <Icon size={40} />
      <p className="type-label break-words text-text-body">{label}</p>
      <AnimatePresence initial={false}>
        {showSub && (
          <motion.div
            key="sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="w-full overflow-hidden"
          >
            <p className="type-caption break-words pt-sp-1 text-text-muted">
              {loading ? '…' : snippet}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
