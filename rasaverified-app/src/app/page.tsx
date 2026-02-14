import Link from "next/link";
import { ConvexDemo } from "@/components/convex-demo";

const highlights = [
  {
    label: "Signal-to-noise",
    value: "92%",
    description: "Bot + sponsor detection accuracy in internal tests",
  },
  {
    label: "Realtime",
    value: "<2s",
    description: "Fresh trust-score recompute window",
  },
  {
    label: "Stack",
    value: "Next.js + Convex",
    description: "Streaming PWA with serverless scoring",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-rose-900 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-y-0 left-1/2 h-full w-[40rem] -translate-x-1/2 rounded-full bg-pink-500 blur-[200px]" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row">
        <section className="flex-1 space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-rose-200">
            RasaVerified • Credibility Engine
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Reduce fake food hype. Surface reviews you can actually trust.
          </h1>
          <p className="max-w-2xl text-lg text-rose-100/90">
            We aggregate multichannel restaurant chatter, score authenticity with heuristic + AI signals, and visualize trust in a
            cinematic 3D dashboard. Powered by Next.js App Router, Convex realtime data, and upcoming 3D trust spheres.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-rose-200">{item.label}</p>
                <p className="text-3xl font-semibold text-white">{item.value}</p>
                <p className="text-xs text-rose-100/80">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="https://nextjs.org/docs"
              target="_blank"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-rose-50"
            >
              View build notes
            </Link>
            <Link
              href="https://dashboard.convex.dev"
              target="_blank"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Inspect Convex data
            </Link>
          </div>
        </section>

        <div className="flex-1">
          <ConvexDemo />
        </div>
      </main>
    </div>
  );
}
