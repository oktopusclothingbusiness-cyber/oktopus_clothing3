import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { skills } from '@/lib/data';
import type { SkillCategory } from '@/types';

const SkillsSection = () => {
  const categorizedSkills = skills.reduce((acc, skill) => {
    const { category } = skill;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, typeof skills>);

  return (
    <section id="skills" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto">
        <h2 className="text-center font-headline text-3xl font-bold md:text-4xl">
          My Technical Skills
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          A collection of technologies and tools I'm proficient with.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categorizedSkills).map(([category, skills]) => (
            <Card key={category} className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {skills.map((skill) => (
                    <li key={skill.name} className="flex items-center gap-4">
                      <skill.icon className="h-8 w-8 text-accent" />
                      <span className="font-medium">{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
