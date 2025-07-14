import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
};

export type Profile = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  resumeUrl: string;
  socialLinks: {
    github: string;
    linkedin: string;
    instagram: string;
  };
};

export type Project = {
  title: string;
  description: string;
  techStack: string[];
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
  tags: string[];
  'data-ai-hint'?: string;
};

export type SkillCategory = 'Frontend' | 'Backend' | 'Tools' | 'Soft Skills';

export type Skill = {
  name: string;
  icon: LucideIcon;
  category: SkillCategory;
};

export type Experience = {
  role: string;
  company: string;
  date: string;
  description: string;
  type: 'Work' | 'Education';
};
