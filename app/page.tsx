"use client";

import { useState } from "react";
import { languages } from "@/data/languages";
import CodeEditor from "@/components/CodeEditor";

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
  const [copied, setCopied] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const filteredLanguages = languages.filter((item) =>
    item.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const selectedLanguage = languages.find(
    (item) => item.name === language
  );

  const analyzeCode = async () => {
    if (!code.trim()) {
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setCopied(false);

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

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const selectLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    setLanguageOpen(false);
    setLanguageSearch("");
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
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-semibold">Your Code</h2>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="
                    flex
                    min-w-42.5
                    items-center
                    justify-between
                    gap-4
                    rounded-lg
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-3
                    py-2
                    text-sm
                    text-zinc-300
                    transition
                    hover:border-zinc-700
                  "
                >
                  <span>{selectedLanguage?.name || language}</span>

                  <span className="text-xs text-zinc-600">▼</span>
                </button>

                {languageOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      z-50
                      mt-2
                      w-70
                      overflow-hidden
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-950
                      shadow-2xl
                    "
                  >
                    {/* Search */}
                    <div className="border-b border-zinc-800 p-3">
                      <input
                        type="text"
                        value={languageSearch}
                        onChange={(e) =>
                          setLanguageSearch(e.target.value)
                        }
                        placeholder="Search language..."
                        autoFocus
                        className="
                          w-full
                          rounded-lg
                          border
                          border-zinc-800
                          bg-black
                          px-3
                          py-2
                          text-sm
                          text-zinc-200
                          outline-none
                          placeholder:text-zinc-600
                          focus:border-zinc-600
                        "
                      />
                    </div>

                    {/* Language List */}
                    <div className="max-h-80 overflow-y-auto p-2">
                      {filteredLanguages.length > 0 ? (
                        filteredLanguages.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() =>
                              selectLanguage(item.name)
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              rounded-lg
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              transition
                              ${
                                language === item.name
                                  ? "bg-zinc-800 text-white"
                                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                              }
                            `}
                          >
                            <span>{item.name}</span>

                            <span className="text-xs text-zinc-600">
                              {item.short}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-6 text-center text-sm text-zinc-600">
                          No language found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              />

            {/* Analyze Button */}
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

                    <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-600">
                      Paste your code, choose the programming language,
                      and click Analyze Code.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex min-h-112.5 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

                    <p className="text-sm text-zinc-400">
                      Analyzing your code...
                    </p>
                  </div>
                </div>
              )}

              {/* Results */}
              {analysis && (
                <div>
                  {/* Score */}
                  <div className="mb-8">
                    <p className="text-sm text-zinc-500">
                      CODE QUALITY
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-bold">
                        {analysis.score}
                      </span>

                      <span className="mb-1 text-zinc-500">
                        /100
                      </span>
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
                    <h3 className="mb-3 font-semibold">
                      Explanation
                    </h3>

                    <p className="text-sm leading-7 text-zinc-400">
                      {analysis.explanation}
                    </p>
                  </div>

                  {/* Issues */}
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
                          AI-generated improved {language} code
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
                        {copied ? "✓ Copied!" : "Copy Code"}
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
                      <code>{analysis.improvedCode}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          DevLens AI — AI-powered multi-language code analysis
        </footer>
      </div>
    </main>
  );
}