'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import * as React from 'react';

// Custom spring transitions for professional feel
const springTransition = {
  type: "spring",
  stiffness: 80,
  damping: 15
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const logoVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition
  }
};

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition
  }
};

const cardVariants = (targetRotate: number) => ({
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 120,
    rotate: 0
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: targetRotate,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 14
    }
  },
  hover: {
    scale: 1.15,
    rotate: 0,
    zIndex: 50,
    boxShadow: "0px 15px 35px rgba(252, 195, 36, 0.3)", // Vibrant gold/yellow streetwear glow
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
});

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springTransition,
      delay: 0.8
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 0px 25px rgba(255, 255, 255, 0.45)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { scale: 0.95 }
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 bg-radial-gradient pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-grow flex flex-col justify-between items-center p-6 md:p-12 relative z-10"
      >
        {/* Top Header Logo */}
        <motion.div variants={logoVariants} className="mt-4 md:mt-8 select-none">
          <Image 
            src="https://i.ibb.co/GfTs981G/okto-new-logo-white.png"
            alt="Oktopus Logo"
            width={160}
            height={70}
            className="object-contain"
            priority
            data-ai-hint="logo"
          />
        </motion.div>

        {/* Center Card Stack */}
        <div className="relative w-full max-w-4xl h-[320px] md:h-[480px] flex items-center justify-center my-6">
          {/* Card 1: Leftmost */}
          <motion.div
            variants={cardVariants(-12)}
            whileHover="hover"
            className="absolute left-[calc(50%-130px)] md:left-[calc(50%-320px)] rounded-2xl shadow-lg w-[90px] h-[120px] md:w-[180px] md:h-[240px] overflow-hidden cursor-pointer origin-bottom"
          >
            <Image
              src="https://i.imgur.com/h0SjEpg.png"
              alt="Fashion Showcase 1"
              layout="fill"
              objectFit="cover"
              data-ai-hint="eyewear fashion"
            />
          </motion.div>

          {/* Card 2: Mid-Left */}
          <motion.div
            variants={cardVariants(-6)}
            whileHover="hover"
            className="absolute left-[calc(50%-80px)] md:left-[calc(50%-190px)] rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] md:w-[210px] md:h-[280px] overflow-hidden cursor-pointer origin-bottom"
          >
            <Image
              src="https://i.imgur.com/njNbmfx.jpeg"
              alt="Fashion Showcase 2"
              layout="fill"
              objectFit="cover"
              data-ai-hint="eyewear fashion"
            />
          </motion.div>

          {/* Card 3: Center focus */}
          <motion.div
            variants={cardVariants(0)}
            whileHover="hover"
            className="absolute left-1/2 -translate-x-1/2 rounded-2xl shadow-2xl z-20 w-[120px] h-[160px] md:w-[240px] md:h-[320px] overflow-hidden cursor-pointer origin-bottom border-2 border-white/10"
          >
            <Image
              src="https://i.ibb.co/k23QM5vt/pic-1.png"
              alt="Fashion Showcase 3"
              layout="fill"
              objectFit="cover"
              data-ai-hint="eyewear fashion"
            />
          </motion.div>

          {/* Card 4: Mid-Right */}
          <motion.div
            variants={cardVariants(6)}
            whileHover="hover"
            className="absolute right-[calc(50%-80px)] md:right-[calc(50%-190px)] rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] md:w-[210px] md:h-[280px] overflow-hidden cursor-pointer origin-bottom"
          >
            <Image
              src="https://i.imgur.com/kDUL51T.jpeg"
              alt="Fashion Showcase 4"
              layout="fill"
              objectFit="cover"
              data-ai-hint="eyewear fashion"
            />
          </motion.div>

          {/* Card 5: Rightmost */}
          <motion.div
            variants={cardVariants(12)}
            whileHover="hover"
            className="absolute right-[calc(50%-130px)] md:right-[calc(50%-320px)] rounded-2xl shadow-lg w-[90px] h-[120px] md:w-[180px] md:h-[240px] overflow-hidden cursor-pointer origin-bottom"
          >
            <Image
              src="https://i.imgur.com/x9kLhGO.jpeg"
              alt="Fashion Showcase 5"
              layout="fill"
              objectFit="cover"
              data-ai-hint="eyewear fashion"
            />
          </motion.div>
        </div>

        {/* Bottom Typography & Action */}
        <div className="text-center w-full max-w-xl mb-4 md:mb-8 flex flex-col items-center">
          <motion.h1 
            variants={titleVariants}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter font-bebas mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
          >
            T-Shirts That Stand Out!
          </motion.h1>

          <motion.p 
            variants={titleVariants}
            className="text-muted-foreground text-xs md:text-sm font-medium tracking-wide max-w-sm md:max-w-md mb-8 px-4"
          >
            Elevate your streetwear statement with premium t-shirts, custom designer drops, and accessory styling.
          </motion.p>

          <motion.div 
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="inline-block"
          >
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-md font-bold shadow-lg group">
              <Link href="/store" className="flex items-center gap-2">
                Enter Store 
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "easeInOut" 
                  }}
                >
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
