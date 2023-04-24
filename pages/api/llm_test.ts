import { OpenAI } from 'langchain/llms/openai';
import { NextApiRequest } from 'next';

export const config = { runtime: 'edge' };

export default async function handler(req: NextApiRequest) {
  try {
    const model = new OpenAI({
      temperature: 0.9,
    });

    const modelResponse = await model.call(
      'What would be a good company name a company that makes colorful socks?',
    );
    console.log({ modelResponse });

    return new Response(JSON.stringify({ modelResponse }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (e) {
    console.error(e);

    return new Response(JSON.stringify({ error: e }), {
      status: 500,
    });
  }
}
