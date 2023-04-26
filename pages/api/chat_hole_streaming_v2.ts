import {
  collectWikipediaReferencesPrompt,
  proposeFurtherQuestionsPrompt,
  samplePrompts,
} from '@/constants/prompts';
import {
  BaseCallbackHandler,
  BaseCallbackHandlerInput,
} from 'langchain/callbacks';
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
      console.log('[handler] stream started');
      sendEventData(controller, 'start', 'null');

      let modelResponse = '';

      ////////////////////////////////
      // Initialize model
      const model = new OpenAI({
        temperature: 0.9,
        maxTokens: 50,
        streaming: true,
        modelName: 'gpt-3.5-turbo', // 'gpt-4'
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              console.log({ token });
              modelResponse += token;
              sendEventData(controller, 'modelResponse', token);
            },
            handleLLMStart(llm, prompts, runId) {
              console.log('LLM start', runId);
              sendEventData(controller, 'llmStart', { runId });
            },
            handleLLMEnd(output, runId) {
              console.log('LLM end', runId);
              sendEventData(controller, 'llmEnd', { runId });
            },
            handleLLMError(error, runId) {
              console.error('LLM error', runId);
              sendEventData(controller, 'llmError', { runId, error });
            },
          },
        ],
      });
      const modelResponseStream = await model.call(userPrompt);
      console.log('[handler] modelResponse finished');

      //////////////////////////////////
      // Come up with suggested follow-up prompts
      console.log('[handler] beginning suggestions stream');
      const suggestionsModel = new OpenAI({
        temperature: 0.9,
        modelName: 'gpt-3.5-turbo', // 'gpt-4'
      });
      const suggestMorePrompt = await SUGGEST_MORE.format({
        modelResponse,
        userPrompt,
      });
      const suggestionsResponseSync = await suggestionsModel.call(
        suggestMorePrompt,
      );
      console.log({ suggestionsResponseSync });
      sendEventData(controller, 'suggestions', suggestionsResponseSync);

      sendEventData(controller, 'end', '[DONE]');
      console.log('[handler] stream closed');
      controller.close();
    },
  });

  return new Response(readableStream, { headers });
}
