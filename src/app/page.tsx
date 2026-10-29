import HomeHero from '@/components/home/HomeHero';
import HomeServices from '@/components/home/HomeServices';
import HomeScholar from '@/components/home/HomeScholar';
import HomeNumbers from '@/components/home/HomeNumbers';
import HomeWeather from '@/components/home/HomeWeather';
import HomeNews from '@/components/home/HomeNews';
import HomeLeadershipContact from '@/components/home/HomeLeadershipContact';
import '@/styles/scholarship.css';
import '@/styles/home.css';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeServices />
      <HomeScholar />
      <HomeNumbers />
      <HomeWeather />
      <HomeNews />
      <HomeLeadershipContact />
    </>
  );
}
