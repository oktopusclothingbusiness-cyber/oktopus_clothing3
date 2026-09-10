'use client';

import React, { useMemo } from 'react';
import { useProduct } from '@/context/product-context';
import { SEED_STOREFRONT_PRODUCTS, toStorefrontProduct } from '@/data/storefront-data';

// 18 Homepage Modules in Exact Required Order
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { HeroSection } from '@/components/storefront/home/hero-section';
import { DropIntroSection } from '@/components/storefront/home/drop-intro-section';
import { FeaturedProductSection } from '@/components/storefront/home/featured-product-section';
import { ShopTheDropSection } from '@/components/storefront/home/shop-the-drop-section';
import { EditorialStatementSection } from '@/components/storefront/home/editorial-statement-section';
import { CollectionWallSection } from '@/components/storefront/home/collection-wall-section';
import { FindYourSignalSection } from '@/components/storefront/home/find-your-signal-section';
import { NewArrivalsSection } from '@/components/storefront/home/new-arrivals-section';
import { TechnicalQualitySection } from '@/components/storefront/home/technical-quality-section';
import { CampaignEditorialSection } from '@/components/storefront/home/campaign-editorial-section';
import { OktopusUniformSection } from '@/components/storefront/home/oktopus-uniform-section';
import { BestsellersSection } from '@/components/storefront/home/bestsellers-section';
import { SocialWallSection } from '@/components/storefront/home/social-wall-section';
import { FaqSection } from '@/components/storefront/home/faq-section';
import { NewsletterSection } from '@/components/storefront/home/newsletter-section';
import { StorefrontFooter } from '@/components/storefront/footer';

export default function HomePage() {
  const { products: dbProducts, loading } = useProduct();

  const allProducts = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(toStorefrontProduct);
    }
    return SEED_STOREFRONT_PRODUCTS;
  }, [dbProducts]);

  // Lead featured product for section 5
  const featuredProduct = useMemo(() => {
    return (
      allProducts.find((p) => p.isHero) ||
      allProducts.find((p) => p.featured) ||
      allProducts[0] ||
      SEED_STOREFRONT_PRODUCTS[0]
    );
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <StorefrontHeader />

      {/* 3. Hero */}
      <HeroSection />

      {/* 4. Current Drop Introduction */}
      <DropIntroSection />

      {/* 5. Featured Product */}
      <FeaturedProductSection product={featuredProduct} />

      {/* 6. Shop the Drop Product Grid */}
      <ShopTheDropSection products={allProducts} loading={loading} />

      {/* 7. Editorial Brand Statement */}
      <EditorialStatementSection />

      {/* 8. Collection Wall */}
      <CollectionWallSection />

      {/* 9. Find Your Signal */}
      <FindYourSignalSection />

      {/* 10. New Arrivals */}
      <NewArrivalsSection products={allProducts} loading={loading} />

      {/* 11. Technical / Quality Section */}
      <TechnicalQualitySection />

      {/* 12. Campaign Editorial Block */}
      <CampaignEditorialSection />

      {/* 13. The Oktopus Uniform */}
      <OktopusUniformSection />

      {/* 14. Bestsellers */}
      <BestsellersSection products={allProducts} loading={loading} />

      {/* 15. Community / Social Wall */}
      <SocialWallSection />

      {/* 16. FAQ */}
      <FaqSection />

      {/* 17. Newsletter */}
      <NewsletterSection />

      {/* 18. Footer */}
      <StorefrontFooter />
    </div>
  );
}
