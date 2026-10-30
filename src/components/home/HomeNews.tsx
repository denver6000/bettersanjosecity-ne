import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { HomeNews as NewsCards } from '@/components/NewsList';

export default function HomeNews() {
  return (
    <section className="home-sec">
      <div className="container">
        <div className="home-sec-head">
          <h2>
            <T k="home-news-title">Latest news</T>
          </h2>
          <Link href="/news" className="home-more">
            <T k="home-all-news">All news</T>
            <i className="ph-bold ph-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <NewsCards />
      </div>
    </section>
  );
}
