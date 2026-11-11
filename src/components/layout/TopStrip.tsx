import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import { toTel } from '@/lib/phone';

export default function TopStrip() {
  return (
    <div className="top-strip">
      <div className="container top-strip-inner">
        <span className="top-strip-item">
          <i className="ph-fill ph-map-pin" aria-hidden="true" />
          {SITE.lgu.name}, {SITE.lgu.province}
        </span>
        {SITE.hotlines
          .filter((h) => h.id === 'emergency')
          .map((h) => (
            <a key={h.id} href={`tel:${toTel(h.numbers[0])}`} className="top-strip-item">
              <i className="ph-fill ph-phone" aria-hidden="true" />
              {h.label}: {h.numbers[0]}
            </a>
          ))}
        <span className="top-strip-item top-strip-note">
          <T k="topstrip-disclaimer">Independent civic site · not the official LGU website</T>
        </span>
      </div>
    </div>
  );
}
