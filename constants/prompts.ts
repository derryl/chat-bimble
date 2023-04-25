import { PromptTemplate } from 'langchain/prompts';

export const DEFAULT_PROMPT =
  'Who were some of the most successful prospectors during the California Gold Rush?';

export const samplePrompts = [
  'Who were some of the most successful prospectors during the California Gold Rush?',
  'How does quantum entanglement challenge our understanding of classical physics?',
  'What factors contributed to the fall of the Mayan civilization?',
  "How do Shakespeare's tragedies reflect Elizabethan society's values and beliefs?",
  'What role do extremophiles play in astrobiology and the search for extraterrestrial life?',
  "How did Cleopatra's reign impact Egypt's relationship with the Roman Empire?",
  'How do black holes affect the surrounding space-time and nearby celestial bodies?',
  'How did the Code of Hammurabi shape the development of ancient legal systems?',
  'What makes the unreliable narrator an effective storytelling device in modern fiction?',
  'What is the role of epigenetics in the inheritance of acquired traits?',
  "How did the Great Wall of China impact China's political and cultural development?",
  'How does the recently discovered ability of some plants to communicate through their root systems alter our understanding of plant intelligence and ecology?',
  'In what ways did the Silk Road influence the development of Eastern and Western worlds throughout history?',
  'How might the works of Gabriel García Márquez be seen as a tool for exploring social and political issues?',
  'How have advancements in gene editing technologies, such as CRISPR-Cas9, impacted our ability to treat genetic diseases and what ethical considerations must be addressed?',
  'How did the development of the printing press in 15th century Europe influence the spread of knowledge, the democratization of information, and the eventual emergence of the scientific revolution?',
];

export const collectWikipediaReferencesPrompt = `The following is an "Answer" you provided to a user's prompt. I would like you to parse your "Answer" for any people, places, or topics which have an associated Wikipedia page. For each Wikipedia page you return, please retrieve Wikipedia page's title and its URL. Your response will be formatted as a JSON Array of Objects. Each Object will correspond to a single Wikipedia page and will have the following fields:
  - "title", the page title of the Wikipedia page
  - "url", the URL of the Wikipedia page
  - "reason", your 1-sentence rationale for choosing this particular Wikipedia page

  You should return 8 Wikipedia pages. No more than 4 pages should relate to individual persons. The other pages should consist of concepts, events, processes, or other interesting topics, even if they are not directly mentioned in your "Answer".

  Answer: {modelResponse}`;

export const proposeFurtherQuestionsPrompt = `The following is a "Prompt" you received from a user, and the "Answer" you gave for that prompt. Based on these inputs, I would like you to provide a list of 8 additional suggested prompts that a user might choose to ask you. These prompts should provide interesting avenues for further exploration by the user. Your response will be formatted as a JSON Array of Objects. Each of your suggestions should be an Object in this Array. Each Object will have a "prompt" field which contains the full text of your suggested prompt, as well as a "text" field which contains an abbreviated version.

You will provide 8 suggestions. The first 3 suggestions should consist of narrower questions that provide a deeper, more technical dive into various subjects related to the user's original prompt. Your next 3 suggestions should take a wider view of the subject, with the intent of surfacing helpful historical or contextual information. Your final 2 suggestions should pertain to fun, quirky, or obscure aspects of the current subject, such as interesting facts or humorous historical events.

  Prompt: {userPrompt}
  Answer: {modelResponse}
  `;
