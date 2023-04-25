import {
  collectWikipediaReferencesPrompt,
  proposeFurtherQuestionsPrompt,
  samplePrompts,
} from '@/constants/prompts';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { NextApiResponse, NextApiRequest } from 'next';

export const config = { runtime: 'edge' };

const COLLECT_REFERENCES = PromptTemplate.fromTemplate(
  collectWikipediaReferencesPrompt,
);
const SUGGEST_MORE = PromptTemplate.fromTemplate(proposeFurtherQuestionsPrompt);

// https://vercel.com/docs/concepts/functions/edge-functions/streaming#how-to-stream-data-in-an-edge-function
export default async function handler(request: NextApiRequest) {
  // Determine prompt. Return error if not provided
  let userPrompt = '';

  try {
    // @ts-ignore
    const data = await request.json();
    if (!data.userPrompt || data.userPrompt === '') {
      throw new Error('userPrompt is a required field');
    }
    userPrompt = data.userPrompt;
  } catch (e) {
    console.error(e);
    return new Response(null, {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  function sendEventData(
    controller: ReadableStreamDefaultController,
    event: string,
    data: any,
  ) {
    controller.enqueue(encoder.encode(`event: ${event}\n`));
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      console.log('[handler] started');
      sendEventData(controller, 'start', 'null');

      // Initialize model
      const model = new OpenAI({
        temperature: 0.9,
        maxTokens: 150,
        streaming: true,
        modelName: 'gpt-3.5-turbo', // 'gpt-4'
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              console.log({ token });
              sendEventData(controller, 'modelResponse', token);
            },
          },
        ],
      });

      // Answer the initial prompt
      // const modelResponse = await model.call(userPrompt);
      // console.log({ modelResponse });
      // sendEventData(controller, 'modelResponse', modelResponse);

      const modelResponseStream = await model.call(userPrompt);

      // Come up with suggested follow-up prompts
      // const suggestMorePrompt = await SUGGEST_MORE.format({
      //   modelResponse,
      //   userPrompt,
      // });
      // const suggestionsResponse = await model.call(suggestMorePrompt);
      // console.log({ suggestionsResponse });
      // sendEventData(controller, 'suggestions', suggestionsResponse);

      sendEventData(controller, 'end', '[DONE]');
      console.log('[handler] stream closed');
      controller.close();
    },
  });

  return new Response(readableStream, { headers });
}
