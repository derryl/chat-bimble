import { samplePrompts } from '@/constants/prompts';

// Return a random prompt from sample prompts
export function getRandomPrompt(promptList: string[] = samplePrompts): string {
  return samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
}
