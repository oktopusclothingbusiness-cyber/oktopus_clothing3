import type { Profile, Experience } from '@/types';

export const profileData: Profile = {
  name: 'Muhammad Zidnal Falah',
  role: 'Visual/Graphic Designer',
  bio: 'A graphic designer hailing from Indonesia with ±4 years of experience in the field. My talents encompass crafting editorial designs, creating visuals for live streaming and social media, expertly editing visual content, and analyzing social media insights.',
  imageUrl: 'https://placehold.co/400x600.png',
  resumeUrl: '#',
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com/in/zidnalfalah',
    instagram: 'https://instagram.com/zidnalfalah_',
    twitter: 'https://twitter.com/zidnalfalah_',
    behance: 'https://www.behance.net/zidnalfalah',
    pinterest: 'https://s.id/jidsportfolio',
  },
  softwareSkills: ['Ps', 'Ai', 'Xd', 'Id', 'figma', 'capcut', 'Pr', 'Ae', 'Wd'],
};


export const experiences: Experience[] = [
  {
    role: 'Research and Development',
    company: 'Student Company - SMA Progresif Bumi Shalawat',
    date: '2021-2022',
    description: 'Led a team in developing new product ideas.',
    type: 'Work',
  },
  {
    role: 'Layout Department',
    company: 'Progresif TV - PP. Progresif Bumi Shalawat',
    date: '2020-Now',
    description:
      'Responsible for layout design for various media productions.',
    type: 'Work',
  },
  {
    role: 'SMP Progresif Bumi Shalawat',
    company: 'Lebo, Sidoarjo',
    date: '2018-2021',
    description: 'Junior High School',
    type: 'Education',
  },
  {
    role: 'SMA Progresif Bumi Shalawat',
    company: 'Lebo, Sidoarjo',
    date: '2021-2024',
    description: 'Senior High School',
    type: 'Education',
  },
];
