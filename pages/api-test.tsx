import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { useState } from 'react';

export default function Hund() {
  const [response, setResponse] = useState('');

  async function handleClick() {
    try {
      const res = await fetch('/api/llm_test');
      const json = await res.json();
      console.log(json);
      setResponse(json.data);
    } catch (err) {
      console.log(err);
    }
  }

  function prettyPrint(obj: Object) {
    return JSON.stringify(obj, null, 2);
  }

  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleClick}
        >
          GET /api/llm_test
        </button>
        <p>seeing what&apos;s possible to do inside an edge function</p>
        <div className="textarea pretty-code">
          {response && (
            <code>
              <pre>{prettyPrint(response)}</pre>
            </code>
          )}
        </div>
      </div>
    </Layout>
  );
}
