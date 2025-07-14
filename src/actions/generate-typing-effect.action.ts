"use server";

import { generateTypingEffect as genkitGenerate } from '@/ai/flows/dynamic-typing-effect';

export async function generateTypingEffect(skills: string[]): Promise<string[]> {
  try {
    const result = await genkitGenerate({
      skills,
      numSkillsToDisplay: 3,
    });
    return result.selectedSkills;
  } catch (error) {
    console.error('Error generating typing effect:', error);
    // Fallback to a random subset of skills
    return [...skills].sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}
