"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Github, Linkedin, Instagram, Download, Send } from 'lucide-react';
import { profileData, allSkillRoles } from '@/lib/data';
import TypingEffect from '../typing-effect';
import Link from 'next/link';

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[calc(100vh-5rem)] w-full flex items-center">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 text-center md:order-1 md:text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {profileData.name}
            </h1>
            <div className="mt-3 h-10">
              <TypingEffect roles={allSkillRoles} />
            </div>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:mx-0">
              {profileData.bio}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <Button size="lg" asChild>
                <Link href={profileData.resumeUrl} target="_blank">
                  <Download className="mr-2 h-5 w-5" /> Download Resume
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToContact}>
                 <Send className="mr-2 h-5 w-5" /> Contact Me
              </Button>
            </div>
            <div className="mt-8 flex justify-center gap-4 md:justify-start">
              <Button variant="ghost" size="icon" asChild>
                <Link href={profileData.socialLinks.github} target="_blank" aria-label="GitHub">
                  <Github className="h-6 w-6" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={profileData.socialLinks.linkedin} target="_blank" aria-label="LinkedIn">
                  <Linkedin className="h-6 w-6" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={profileData.socialLinks.instagram} target="_blank" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <div className="relative h-80 w-80 md:h-96 md:w-96">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"></div>
              <Image
                src={profileData.imageUrl}
                alt={profileData.name}
                width={400}
                height={400}
                priority
                className="relative rounded-full border-4 border-card object-cover shadow-lg"
                data-ai-hint="profile photo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
