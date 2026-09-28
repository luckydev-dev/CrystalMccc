import React from 'react';
import { Hero } from '../components/sections/Hero';
import { ServerStats } from '../components/sections/ServerStats';
import { SeasonOneShowcase } from '../components/sections/SeasonOneShowcase';
import { FoundersCarousel } from '../components/sections/FoundersCarousel';
import { FeaturedStore } from '../components/sections/FeaturedStore';
import { HowToJoin } from '../components/sections/HowToJoin';
import { PageTransition } from '../components/utils/PageTransition';
import { SEOHead } from '../components/seo/SEOHead';

export function Home() {
  return (
    <PageTransition>
      <SEOHead
        title="Home"
        description="Welcome to CrystalMC! Join Season 1 featuring custom Survival SMP, high-stakes Lifesteal, and competitive 20 TPS PvP duels. Connect at play.crystalmc.fun."
      />
      <Hero />
      <ServerStats />
      <SeasonOneShowcase />
      <FoundersCarousel />
      <FeaturedStore />
      <HowToJoin />
    </PageTransition>
  );
}
