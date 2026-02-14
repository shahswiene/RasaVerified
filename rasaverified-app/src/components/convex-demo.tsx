'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

export function ConvexDemo() {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);

  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  const orderedMessages = useMemo(() => messages ?? [], [messages]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ui] Loaded ${orderedMessages.length} messages from Convex`);
    }
  }, [orderedMessages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      setPending(true);
      console.debug('[ui] Sending message to Convex');
      await sendMessage({ text: trimmed });
      setText('');
    } catch (error) {
      console.error('[ui] Failed to send message via Convex', error);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="w-full rounded-3xl border border-white/10 bg-white/70 p-8 shadow-xl shadow-pink-500/10 backdrop-blur dark:bg-zinc-900/70">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
          Live Convex demo
        </p>
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          Messages stored in Convex
        </h2>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Queries stream in realtime while mutations push new entries to the messages table.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          className="flex-1 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-white"
          placeholder="Drop a quick note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Add message'}
        </button>
      </form>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
        {orderedMessages.length === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-5 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No messages yet. Be the first to add one!
          </p>
        )}
        {orderedMessages.map((message) => (
          <article
            key={message._id}
            className="rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-100"
          >
            <p className="font-medium text-pink-500">#{message._id.slice(-6)}</p>
            <p>{message.text}</p>
            <time className="text-xs text-zinc-500">
              {new Date(message.createdAt).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
