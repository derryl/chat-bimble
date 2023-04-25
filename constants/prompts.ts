import { PromptTemplate } from 'langchain/prompts';

export const DEFAULT_PROMPT =
  'Who were some of the most successful prospectors during the California Gold Rush?';

export const samplePrompts = [
  'Who were some of the most successful prospectors during the California Gold Rush?',
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
