'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface ShareJobButtonProps {
  url: string;
}

export function ShareJobButton({ url }: ShareJobButtonProps): React.JSX.Element {
  const t = useTranslations('jobs');
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      push({
        title: t('linkCopied'),
        variant: 'success'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      push({
        title: t('copyLink'),
        variant: 'error'
      });
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={() => void copy()}>
      <Share2 size={14} />
      {copied ? t('linkCopied') : t('copyLink')}
    </Button>
  );
}
