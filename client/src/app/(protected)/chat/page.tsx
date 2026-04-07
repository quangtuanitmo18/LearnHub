'use client';

import { useChat } from '@ai-sdk/react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'http://localhost:3001/api/ai/chat',
    fetch: async (url: string | Request | URL, options?: RequestInit) => {
      // Mock fetch to adapt standard JSON REST to stream format for Vercel AI
      const res = await fetch(url, options);
      const data = await res.json();
      return new Response(data.content || '');
    },
  });

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col p-4">
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg bg-white p-4 shadow">
        {messages.length === 0 && (
          <div className="mt-10 text-center text-gray-500">
            Xin chào! Mình là AI Tutor. Bạn cần support bài học hay tìm khoá học nào?
          </div>
        )}

        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              <span className="mb-1 block text-xs font-bold uppercase opacity-70">
                {m.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 p-3 text-gray-500 italic">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything..."
          className="flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
