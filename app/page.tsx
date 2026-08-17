"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              DevLens
              <span className="text-zinc-500"> AI</span>
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              AI-powered code analysis
            </p>
          </div>

          <span className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-400">
            v1.0
          </span>
        </header>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Your Code</h2>

              <select className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none">
                <option>JavaScript</option>
                <option>Python</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`function hello() {\n  console.log("Hello World");\n}`}
              className="
                min-h-125
                w-full
                resize-none
                rounded-xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                font-mono
                text-sm
                text-zinc-200
                outline-none
                transition
                focus:border-zinc-600
              "
            />

            <button
              className="
                mt-4
                w-full
                rounded-xl
                bg-white
                px-6
                py-3
                font-semibold
                text-black
                transition
                hover:bg-zinc-200
              "
            >
              Analyze Code
            </button>
          </div>

          <div>
            <h2 className="mb-3 font-semibold">Analysis</h2>

            <div
              className="
                flex
                min-h-125
                items-center
                justify-center
                rounded-xl
                border
                border-zinc-800
                bg-zinc-950
                p-6
              "
            >
              <div className="text-center">
                <div className="mb-4 text-4xl">⌘</div>

                <h3 className="font-medium text-zinc-300">
                  Ready to analyze
                </h3>

                <p className="mt-2 max-w-xs text-sm text-zinc-600">
                  Paste your JavaScript or Python code and click Analyze Code.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}