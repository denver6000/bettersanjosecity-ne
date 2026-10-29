import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';

export default function TopStrip() {
  return (
    <div className="top-strip">
      <div className="container top-strip-inner">
        <span className="top-strip-item">
          <i className="ph-fill ph-map-pin" aria-hidden="true" />
          {SITE.lgu.name}, {SITE.lgu.province}
        </span>
        {SITE.hotlines.map((h) => (
          <a key={h.tel} href={`tel:${h.tel}`} className="top-strip-item">
            <i className="ph-fill ph-phone" aria-hidden="true" />
            {h.label}: {h.number}
          </a>
        ))}
        <span className="top-strip-item top-strip-note">
          <T k="topstrip-disclaimer">Independent civic site · not the official LGU website</T>
        </span>
      </div>
    </div>
  );
}
