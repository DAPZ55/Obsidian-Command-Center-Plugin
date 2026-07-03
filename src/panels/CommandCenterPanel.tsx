import { h } from 'preact';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

export function CommandCenterPanel() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <LayoutDashboard size={32} style={{ color: 'var(--accent-primary)' }} />
        <h1 className="type-h1 text-text-body">Command Center</h1>
        <p className="type-body text-text-muted">The shell is loading.</p>
      </motion.div>
    </div>
  );
}
