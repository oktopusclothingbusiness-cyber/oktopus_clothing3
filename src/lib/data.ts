import type { NavItem, Profile, Project, Skill, Experience } from '@/types';
import {
  Code,
  Server,
  Cog,
  Users,
  GitBranch,
  Database,
  Type,
  Monitor,
  Component,
  Brain,
  MessageSquare,
  PenTool,
  Figma,
} from 'lucide-react';

export const navItems: NavItem[] = [
  { title: 'About', href: '#about' },
  { title: 'Skills', href: '#skills' },
  { title: 'Projects', href: '#projects' },
  { title: 'Contact', href: '#contact' },
];

export const profileData: Profile = {
  name: 'Alex Doe',
  role: 'Full-Stack Developer & UI/UX Enthusiast',
  bio: 'I am a passionate full-stack developer with a keen eye for design. I love building beautiful, functional, and user-centric web applications. My goal is to merge cutting-edge technology with intuitive design to create unforgettable digital experiences.',
  imageUrl: 'https://placehold.co/400x400.png',
  resumeUrl: '#',
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
  },
};

export const skills: Skill[] = [
  // Frontend
  { name: 'React', icon: Component, category: 'Frontend' },
  { name: 'Next.js', icon: Monitor, category: 'Frontend' },
  { name: 'TypeScript', icon: Type, category: 'Frontend' },
  { name: 'Tailwind CSS', icon: PenTool, category: 'Frontend' },
  { name: 'Figma', icon: Figma, category: 'Frontend' },
  
  // Backend
  { name: 'Node.js', icon: Server, category: 'Backend' },
  { name: 'Express', icon: GitBranch, category: 'Backend' },
  { name: 'MongoDB', icon: Database, category: 'Backend' },
  { name: 'Firebase', icon: Code, category: 'Backend' },
  
  // Tools
  { name: 'Git & GitHub', icon: GitBranch, category: 'Tools' },
  { name: 'Docker', icon: Cog, category: 'Tools' },
  { name: 'Genkit AI', icon: Brain, category: 'Tools'},

  // Soft Skills
  { name: 'Problem Solving', icon: Brain, category: 'Soft Skills' },
  { name: 'Teamwork', icon: Users, category: 'Soft Skills' },
  { name: 'Communication', icon: MessageSquare, category: 'Soft Skills' },
];

export const projects: Project[] = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce website with product listings, shopping cart, and a secure checkout process. Integrated with Stripe for payments.',
    techStack: ['Next.js', 'Stripe', 'MongoDB', 'Tailwind CSS'],
    imageUrl: 'https://placehold.co/600x400.png',
    githubUrl: '#',
    liveUrl: '#',
    tags: ['Web', 'AI'],
    'data-ai-hint': 'e-commerce website',
  },
  {
    title: 'Task Management App',
    description: 'A productivity app for managing tasks and projects. Features include drag-and-drop boards, due dates, and user authentication.',
    techStack: ['React', 'Firebase', 'Node.js'],
    imageUrl: 'https://placehold.co/600x400.png',
    githubUrl: '#',
    liveUrl: '#',
    tags: ['Web', 'Mobile'],
    'data-ai-hint': 'task management',
  },
  {
    title: 'AI-Powered Blog Generator',
    description: 'A content creation tool that uses AI to generate blog post ideas and drafts based on user prompts. Built with Genkit and Gemini.',
    techStack: ['Next.js', 'Genkit AI', 'Firebase'],
    imageUrl: 'https://placehold.co/600x400.png',
    githubUrl: '#',
    liveUrl: '#',
    tags: ['AI'],
    'data-ai-hint': 'ai blog',
  },
  {
    title: 'Mobile Weather App',
    description: 'A simple and elegant weather application for iOS and Android, providing real-time weather data and forecasts.',
    techStack: ['React Native', 'OpenWeatherMap API'],
    imageUrl: 'https://placehold.co/600x400.png',
    githubUrl: '#',
    liveUrl: '#',
    tags: ['Mobile'],
    'data-ai-hint': 'weather app',
  },
];

export const experiences: Experience[] = [
    {
        role: 'Senior Full-Stack Developer',
        company: 'Tech Solutions Inc.',
        date: '2020 - Present',
        description: 'Led the development of scalable web applications for enterprise clients. Mentored junior developers and contributed to architectural decisions.',
        type: 'Work',
    },
    {
        role: 'Web Developer',
        company: 'Digital Creations LLC',
        date: '2018 - 2020',
        description: 'Developed and maintained client websites using the MERN stack. Collaborated with designers to implement responsive and interactive user interfaces.',
        type: 'Work',
    },
    {
        role: 'Bachelor of Science in Computer Science',
        company: 'University of Technology',
        date: '2014 - 2018',
        description: 'Graduated with honors. Focused on software engineering, algorithms, and human-computer interaction.',
        type: 'Education',
    }
];

export const allProjectTags = [...new Set(projects.flatMap(p => p.tags))];
export const allSkillRoles = ["MERN Stack Developer", "UI/UX Enthusiast", "Firebase Expert", "AI Engineer", "Next.js Developer"];
