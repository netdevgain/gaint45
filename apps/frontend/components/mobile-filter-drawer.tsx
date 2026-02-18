'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function MobileFilterDrawer({ children }: { children: React.ReactNode }): React.JSX.Element {
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current.focus();

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <Button type="button" variant="secondary" className="lg:hidden" onClick={() => setOpen(true)}>
        <Filter size={15} />
        {tCommon('filters')}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[110] bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={`absolute inset-y-0 w-[min(92vw,390px)] overflow-y-auto border-slate-200 bg-white p-4 shadow-2xl ${
                isRtl ? 'left-0 border-r' : 'right-0 border-l'
              }`}
              initial={
                reduceMotion
                  ? false
                  : {
                      x: isRtl ? '-100%' : '100%'
                    }
              }
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ duration: 0.24 }}
              onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-slateInk">{tCommon('filters')}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slateInk transition hover:bg-slate-100"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">{children}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
