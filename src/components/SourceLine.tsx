'use client';

import { useLanguage } from '@/i18n/LanguageContext';

/** "Source: sjc.gov.ph · checked 11 Nov 2026", localised; the host links to the source page. */
export default function SourceLine({ source, checked }: { source: string; checked: string }) {
  const { t, language } = useLanguage();
  const host = new URL(source).host.replace(/^www\./, '');
  const date = new Intl.DateTimeFormat(language === 'fil' ? 'fil-PH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${checked}T00:00:00Z`));
  const [before, after = ''] = t('source-line', 'Source: {src} · checked {date}')
    .replace('{date}', date)
    .split('{src}');
  return (
    <p className="source-line">
      {before}
      <a href={source} target="_blank" rel="noopener noreferrer">
        {host}
      </a>
      {after}
    </p>
  );
}
