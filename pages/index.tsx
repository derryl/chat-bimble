import Layout from '@/components/layout';
import LoadingDots from '@/components/ui/LoadingDots';
import styles from '@/styles/Home.module.css';
import { getRandomPrompt } from '@/utils/getRandomPrompt';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

function prettyPrint(obj: Object) {
  return JSON.stringify(obj, null, 2);
}

const defaultUserPrompt = getRandomPrompt();

type Reference = {
  title: string;
  url: string;
  thumbnail?: string;
};

export default function ChatHole() {
  const [response, setResponse] = useState('');
  const [references, setReferences] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [userPrompt, setUserPrompt] = useState<string>(defaultUserPrompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    if (isLoading) {
      return false;
    }

    setIsLoading(true);

    // Zero the outputs
    setResponse('');
    setSuggestions([]);
    setReferences([]);

    let streamedResponse = '';

    const ctrl = new AbortController();

    try {
      console.log('Asking...', userPrompt);
      class RetriableError extends Error {}
      class FatalError extends Error {}

      fetchEventSource('/api/chat_hole_streaming_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt,
        }),
        signal: ctrl.signal,
        // on open
        async onopen(response) {
          if (
            response.ok &&
            response.headers.get('content-type') === 'text/event-stream'
          ) {
            return; // everything's good
          } else if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            // throw new FatalError();
            console.error(response);
            return;
          } else {
            throw new RetriableError();
          }
        },
        onerror(err) {
          if (err instanceof FatalError) {
            throw err; // rethrow to stop the operation
          } else {
            // do nothing to automatically retry. You can also
            // return a specific retry interval here.
          }
        },
        // on message
        onmessage: (msg) => {
          console.log(msg);
          const { data, event } = msg;

          if (event === 'start') {
            console.log('stream begun by server');
          } else if (event === 'end') {
            setIsLoading(false);
            ctrl.abort();
            console.log('stream ended by server');
          } else {
            const data = JSON.parse(msg.data);

            if (event === 'modelResponse') {
              streamedResponse += data;
              setResponse(streamedResponse);
            } else if (event === 'suggestions') {
              setSuggestions(JSON.parse(data));
            } else if (data.referencesResponse) {
              const references = JSON.parse(data.referencesResponse);
              setReferences(references);
            }
          }
        },
      });
    } catch (err) {
      ctrl.abort();
      setIsLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  return (
    <Layout>
      <div className="chathole mx-auto flex flex-col gap-4 p-6 pt-0">
        <p>
          simple GPT interface that answers prompts, and then finds related
          Wikipedia articles & suggests further questions for the user to ask
        </p>
        {/* Header + Controls */}
        <div className="flex justify-between rounded-lg p-5 border-2 border-gray-500">
          <div className="grow-1 pr-6 flex flex-col gap-4">
            <h3 className="font-semibold">User Input</h3>
            <textarea
              disabled={isLoading}
              ref={textAreaRef}
              autoFocus={false}
              rows={1}
              maxLength={512}
              id="userInput"
              name="userInput"
              placeholder={
                isLoading ? 'Waiting for response...' : defaultUserPrompt
              }
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className={styles.textarea}
            />
          </div>
          <button
            className="grow-0 justify-self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Submit
          </button>
        </div>

        {/* Output Area */}
        <div className="relative p-5 rounded-lg border-2 border-blue-500 flex flex-col gap-4">
          <h3 className="font-semibold">Base Model Response</h3>

          {isLoading && response.length === 0 ? (
            <div className={styles.loadingwheel}>
              <LoadingDots color="#000" />
            </div>
          ) : (
            // <div className="textarea pretty-code">
            //   <code>
            //     <pre>{prettyPrint(response)}</pre>
            //   </code>
            // </div>
            <div>
              <p>{prettyPrint(response)}</p>
            </div>
          )}
        </div>

        {/* You Might Want To Ask */}
        <div className="relative p-5 rounded-lg border-2 border-red-400 flex flex-col gap-4">
          <h3 className="font-semibold">Proposed follow-up questions</h3>
          {isLoading && suggestions.length === 0 ? (
            <div className={styles.loadingwheel}>
              <LoadingDots color="#000" />
            </div>
          ) : (
            <div className="flex">
              <ul className="list-disc">
                {suggestions.map(({ text }) => {
                  return <li key={text}>{text}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
        {/* References */}
        <div className="relative p-5 rounded-lg border-2 border-yellow-300 flex flex-col gap-4">
          <h3 className="font-semibold">Relevant Wikipedia Articles</h3>
          {isLoading && references.length === 0 ? (
            <div className={styles.loadingwheel}>
              <LoadingDots color="#000" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {references.map(({ title, thumbnail, url }) => {
                return (
                  <Link key={url} href={url}>
                    <div className="max-w-sm rounded overflow-hidden shadow-lg">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{title}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
