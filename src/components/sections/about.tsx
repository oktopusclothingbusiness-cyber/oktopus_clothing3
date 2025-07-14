import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';
import { experiences } from '@/lib/data';
import type { Experience } from '@/types';

const TimelineItem = ({ experience }: { experience: Experience }) => {
  const isWork = experience.type === 'Work';
  return (
    <div className="relative pl-8 sm:pl-32 py-6 group">
      <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:w-px before:bg-border sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-primary after:border-4 after:box-content after:border-card after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
        <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-28 h-6 mb-3 sm:mb-0 text-primary-foreground bg-primary rounded-full">
          {experience.date}
        </time>
        <div className="text-xl font-bold font-headline text-foreground">{experience.role}</div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {isWork ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
        <div className="font-medium">{experience.company}</div>
      </div>
      <div className="text-muted-foreground">{experience.description}</div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-center font-headline text-3xl font-bold md:text-4xl">
          About Me
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          My journey in technology and design.
        </p>

        <div className="mt-12">
            {experiences.map((exp, index) => (
              <TimelineItem key={index} experience={exp} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
