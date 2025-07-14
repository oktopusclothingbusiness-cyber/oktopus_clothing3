"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { projects, allProjectTags } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="aspect-video overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={project['data-ai-hint']}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
        <p className="mt-2 flex-1 text-muted-foreground">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" asChild>
            <Link href={project.githubUrl} target="_blank">
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Link>
          </Button>
          <Button asChild>
            <Link href={project.liveUrl} target="_blank">
              Live Demo <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const ProjectsSection = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!activeTag) return projects;
    return projects.filter((project) => project.tags.includes(activeTag));
  }, [activeTag]);

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-center font-headline text-3xl font-bold md:text-4xl">
          My Projects
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          A selection of my work.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button
            variant={!activeTag ? 'default' : 'outline'}
            onClick={() => setActiveTag(null)}
          >
            All
          </Button>
          {allProjectTags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? 'default' : 'outline'}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.title} className="group">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
