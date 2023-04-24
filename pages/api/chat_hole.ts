import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { NextApiRequest } from 'next';

export const config = { runtime: 'edge' };

const DEFAULT_PROMPT =
  'Who were some of the most successful prospectors during the California Gold Rush?';

const COLLECT_REFERENCES = PromptTemplate.fromTemplate(
  `The following is an "Answer" you provided to a user's prompt. I would like you to parse your "Answer" for any people, places, or topics which have an associated Wikipedia page.  For every entity that has a Wikipedia page, please retrieve the title of its Wikipedia page and its URL. Your response will be formatted as a JSON Array of Objects. Each Object will correspond to a Wikipedia page and will have two fields, "title" and "url". "title" should be the page title of the Wikipedia page and "url" will be the page's URL.

  If you cannot find any relevant Wikipedia pages, simply return an empty Array: "[]"

  Answer: {modelResponse}
  `,
);

// const FOLLOW_UP_SUGGESTIONS = PromptTemplate.fromTemplate(
//   `The following is an "Answer" you provided to a user's "Prompt". Based on these inputs, please provide the following outputs. You should provide only these outputs, formatted as a list:

//   Outpu if your "Answer" mentions any people, places, or topics which have an associated Wikipedia page, please include the title of that Wikipedia page and its URL, in the following format: "Wikipedia: <page title>, <page url>"

//   `,
// );

// Purpose of this function is to answer user's prompt, and then suggest follow-up questions
// or further avenues of exploration for the user to undertake.
export default async function handler(req: NextApiRequest) {
  try {
    const model = new OpenAI({
      temperature: 0.9,
      modelName: 'gpt-3.5-turbo', // 'gpt-4'
    });

    // Answer the initial prompt
    const userPrompt = req.body?.prompt || DEFAULT_PROMPT;
    const modelResponse = await model.call(userPrompt);

    console.log({ modelResponse });

    // Collect Wikipedia references
    const collectReferencesPrompt = await COLLECT_REFERENCES.format({
      modelResponse,
    });
    const referencesResponse = await model.call(collectReferencesPrompt);

    console.log({ referencesResponse });

    return new Response(
      JSON.stringify({
        data: {
          userPrompt: userPrompt,
          answer: modelResponse,
          references: referencesResponse,
        },
        error: null,
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ data: null, error: e }), {
      status: 500,
    });
  }
}
