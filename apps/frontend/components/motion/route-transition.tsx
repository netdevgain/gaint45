'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { usePathname } from '@/lib/i18n/navigation';

export function RouteTransition({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const key = `${locale}:${pathname}`;

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

