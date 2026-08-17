"use client";

import { useState } from "react";

type AnalysisResult = {
  score: number;
  explanation: string;
  issues: string[];
  suggestions: string[];
  improvedCode: string;
};

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) {
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const result = await response.json();

      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while analyzing the code.");
    } finally {
      setLoading(false);
    }
  };

  const copyImprovedCode = async () => {
    if (!analysis?.improvedCode) return;

    try {
      await navigator.clipboard.writeText(analysis.improvedCode);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
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

        {/* Main Content */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Your Code</h2>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="
                  rounded-md
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-3
                  py-2
                  text-sm
                  text-zinc-300
                  outline-none
                "
              >
                <option>JavaScript</option>
                <option>TypeScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C</option>
                <option>C++</option>
                <option>C#</option>
                <option>PHP</option>
                <option>Go</option>
                <option>Rust</option>
                <option>Swift</option>
                <option>Kotlin</option>
                <option>Ruby</option>
                <option>HTML</option>
                <option>CSS</option>
                <option>SQL</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
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
              onClick={analyzeCode}
              disabled={loading || !code.trim()}
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
                disabled:cursor-not-allowed
                disabled:bg-zinc-700
                disabled:text-zinc-400
              "
            >
              {loading ? "Analyzing..." : "Analyze Code"}
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <h2 className="mb-3 font-semibold">Analysis</h2>

            <div
              className="
                min-h-125
                rounded-xl
                border
                border-zinc-800
                bg-zinc-950
                p-6
              "
            >
              {/* Empty State */}
              {!analysis && !loading && (
                <div className="flex min-h-112.5 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-4xl">⌘</div>

                    <h3 className="font-medium text-zinc-300">
                      Ready to analyze
                    </h3>

                    <p className="mt-2 max-w-xs text-sm text-zinc-600">
                      Paste your code, choose the programming language, and
                      click Analyze Code.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex min-h-112.5 items-center justify-center">
                  <div className="text-center">
                    <p className="animate-pulse text-zinc-400">
                      Analyzing your code...
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div>
                  {/* Score */}
                  <div className="mb-8">
                    <p className="text-sm text-zinc-500">CODE QUALITY</p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-bold">
                        {analysis.score}
                      </span>

                      <span className="mb-1 text-zinc-500">/100</span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(analysis.score, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="mb-8">
                    <h3 className="mb-3 font-semibold">Explanation</h3>

                    <p className="text-sm leading-7 text-zinc-400">
                      {analysis.explanation}
                    </p>
                  </div>

                  {/* Potential Issues */}
                  <div className="mb-8">
                    <h3 className="mb-3 font-semibold">
                      Potential Issues
                    </h3>

                    {analysis.issues.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="
                              rounded-lg
                              border
                              border-zinc-800
                              bg-zinc-950
                              p-3
                              text-sm
                              leading-6
                              text-zinc-400
                            "
                          >
                            <span className="mr-2 text-zinc-500">
                              {index + 1}.
                            </span>

                            {issue}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-400">
                        No major issues detected.
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="mb-8">
                    <h3 className="mb-3 font-semibold">
                      Suggestions
                    </h3>

                    {analysis.suggestions.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.suggestions.map(
                          (suggestion, index) => (
                            <div
                              key={index}
                              className="
                                rounded-lg
                                bg-zinc-900
                                p-3
                                text-sm
                                leading-6
                                text-zinc-400
                              "
                            >
                              ✓ {suggestion}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-zinc-900 p-3 text-sm text-zinc-400">
                        No additional improvements required.
                      </div>
                    )}
                  </div>

                  {/* Improved Code */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">
                          Improved Code
                        </h3>

                        <p className="mt-1 text-xs text-zinc-600">
                          AI-generated improved version
                        </p>
                      </div>

                      <button
                        onClick={copyImprovedCode}
                        className="
                          shrink-0
                          rounded-md
                          border
                          border-zinc-700
                          px-3
                          py-1.5
                          text-xs
                          text-zinc-300
                          transition
                          hover:border-zinc-600
                          hover:bg-zinc-800
                        "
                      >
                        Copy Code
                      </button>
                    </div>

                    <pre
                      className="
                        max-h-112.5
                        overflow-auto
                        rounded-xl
                        border
                        border-zinc-800
                        bg-black
                        p-4
                        text-sm
                        leading-6
                        text-zinc-300
                      "
                    >
                      <code>
                        {analysis.improvedCode}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          DevLens AI — AI-powered code analysis
        </footer>
      </div>
    </main>
  );
}