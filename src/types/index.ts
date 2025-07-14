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
    twitter: string;
    behance: string;
    pinterest: string;
  };
  softwareSkills: string[];
};

export type Experience = {
  role: string;
  company: string;
  date: string;
  description: string;
  type: 'Work' | 'Education';
};
