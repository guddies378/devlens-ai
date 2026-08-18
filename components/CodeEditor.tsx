"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  code: string;
  language: string;
  onChange: (value: string) => void;
};

const monacoLanguages: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  C: "c",
  "C++": "cpp",
  "C#": "csharp",
  PHP: "php",
  Go: "go",
  Rust: "rust",
  Swift: "swift",
  Kotlin: "kotlin",
  Ruby: "ruby",
  Dart: "dart",
  R: "r",
  Scala: "scala",
  Perl: "perl",
  Lua: "lua",
  Haskell: "haskell",
  Elixir: "elixir",
  "F#": "fsharp",
  "Visual Basic": "vb",
  "Objective-C": "objective-c",
  Assembly: "asm",
  Solidity: "sol",
  Groovy: "groovy",
  Julia: "julia",
  MATLAB: "matlab",
  "Shell / Bash": "shell",
  PowerShell: "powershell",
  HTML: "html",
  CSS: "css",
  SCSS: "scss",
  SQL: "sql",
  GraphQL: "graphql",
  XML: "xml",
  JSON: "json",
  YAML: "yaml",
};

export default function CodeEditor({
  code,
  language,
  onChange,
}: CodeEditorProps) {
  const editorLanguage =
    monacoLanguages[language] || "plaintext";

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <Editor
        height="500px"
        language={editorLanguage}
        value={code}
        theme="vs-dark"
        onChange={(value) => onChange(value || "")}
        options={{
          minimap: {
            enabled: false,
          },

          fontSize: 14,
          lineHeight: 22,

          fontFamily:
            "Consolas, 'Courier New', monospace",

          scrollBeyondLastLine: false,

          automaticLayout: true,

          tabSize: 2,

          wordWrap: "on",

          padding: {
            top: 16,
            bottom: 16,
          },

          lineNumbers: "on",

          renderLineHighlight: "line",

          cursorBlinking: "smooth",

          smoothScrolling: true,

          bracketPairColorization: {
            enabled: true,
          },
        }}
      />

      {/* Editor Status Bar*/}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
            <span>{language}</span>

            <span>
                {code ? code.split("\n").length : 1}{" "}
                {code.split("\n").length === 1 ? "line" : "lines"}
            </span>
        </div>
    </div>
  );
}