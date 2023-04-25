import {
  collectWikipediaReferencesPrompt,
  proposeFurtherQuestionsPrompt,
  samplePrompts,
} from '@/constants/prompts';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { NextApiResponse, NextApiRequest } from 'next';

// export const config = { runtime: 'edge' };

const COLLECT_REFERENCES = PromptTemplate.fromTemplate(
  collectWikipediaReferencesPrompt,
);
const SUGGEST_MORE = PromptTemplate.fromTemplate(proposeFurtherQuestionsPrompt);

// Purpose of this function is to answer user's prompt, and then suggest follow-up questions
// or further avenues of exploration for the user to undertake.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    sendData('[BEGIN]');

    // Initialize model
    const model = new OpenAI({
      temperature: 0.9,
      modelName: 'gpt-3.5-turbo', // 'gpt-4'
    });

    // Answer the initial prompt
    const userPrompt = req.body?.prompt || samplePrompts[0];
    const modelResponse = await model.call(userPrompt);
    console.log({ modelResponse });
    sendData(JSON.stringify({ modelResponse }));

    // Come up with suggested follow-up prompts
    const suggestMorePrompt = await SUGGEST_MORE.format({
      modelResponse,
      userPrompt,
    });
    const suggestionsResponse = await model.call(suggestMorePrompt);
    console.log({ suggestionsResponse });
    sendData(JSON.stringify({ suggestionsResponse }));

    // Collect Wikipedia references
    const collectReferencesPrompt = await COLLECT_REFERENCES.format({
      modelResponse,
    });
    const referencesResponse = await model.call(collectReferencesPrompt);
    console.log({ referencesResponse });
    sendData(JSON.stringify({ referencesResponse }));
  } catch (e) {
    console.error(e);
  } finally {
    sendData('[DONE]');
    res.end();
  }
}
