import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, any>;
}

export function SEOHead({
  title,
  description = "Join CrystalMC for the ultimate Minecraft experience featuring custom Survival SMP, intense Lifesteal, and competitive PvP duels. Connect now at play.crystalmc.fun!",
  image = "https://i.ibb.co/VczbqSyw/New-Project-5-894-D560.gif",
  url,
  type = "website",
  schema,
}: SEOHeadProps) {
  const fullTitle = title 
    ? `${title} | CrystalMC Network` 
    : "CrystalMC | Premium Minecraft Server – Survival, Lifesteal & PvP";

  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://play.crystalmc.fun');

  const defaultSchema = schema || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CrystalMC Network",
    "url": "https://play.crystalmc.fun",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Minecraft Java & Bedrock Edition",
    "description": description,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph / Facebook / Discord */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="CrystalMC" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:type" content="image/gif" />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="theme-color" content="#a855f7" />

      {/* Twitter Cards / Discord Compact Embed */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(defaultSchema)}
      </script>
    </Helmet>
  );
}
