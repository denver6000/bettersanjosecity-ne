import HomeHero from '@/components/home/HomeHero';
import HomeFinder from '@/components/home/HomeFinder';
import HomeScholar from '@/components/home/HomeScholar';
import HomeNumbers from '@/components/home/HomeNumbers';
import HomeWeather from '@/components/home/HomeWeather';
import HomeNews from '@/components/home/HomeNews';
import HomeLeadershipContact from '@/components/home/HomeLeadershipContact';
import '@/styles/scholarship.css';
import ScrollReveal from '@/components/ScrollReveal';
import '@/styles/home.css';
import '@/styles/motion.css';

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <HomeHero />
      <HomeFinder />
      <HomeScholar />
      <HomeNumbers />
      <HomeWeather />
      <HomeNews />
      <HomeLeadershipContact />
    </>
  );
}
