import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";

type PythonMetrics = {
  language: string;
  totalLines: number;
  codeLines: number;
  blankLines: number;
  commentLines: number;
  functions: number;
  classes: number;
  imports: number;
  syntaxValid: boolean;
  complexity: number;
  complexityBlocks: {
    name: string;
    complexity: number;
    line: number;
  }[];
  maintainability: number;
};

function runPythonAnalyzer(code: string): Promise<PythonMetrics> {
  return new Promise((resolve, reject) => {
    const projectRoot = process.cwd();

    const pythonPath =
      process.platform === "win32"
        ? path.join(
            projectRoot,
            ".venv",
            "Scripts",
            "python.exe"
          )
        : path.join(
            projectRoot,
            ".venv",
            "bin",
            "python"
          );

    const analyzerPath = path.join(
      projectRoot,
      "python",
      "analyzer.py"
    );

    const pythonProcess = spawn(
      pythonPath,
      [analyzerPath],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(error);
    });

    pythonProcess.on("close", (codeNumber) => {
      if (codeNumber !== 0) {
        reject(
          new Error(
            errorOutput ||
              `Python exited with code ${codeNumber}`
          )
        );

        return;
      }

      try {
        const result = JSON.parse(output);

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result);
      } catch {
        reject(
          new Error(
            `Could not parse Python response: ${output}`
          )
        );
      }
    });

    // Send Monaco source code directly to Python stdin
    pythonProcess.stdin.write(code);
    pythonProcess.stdin.end();
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { code, language } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        {
          error: "Code is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (language !== "Python") {
      return NextResponse.json(
        {
          error:
            "Python metrics are currently available only for Python code.",
        },
        {
          status: 400,
        }
      );
    }

    const metrics = await runPythonAnalyzer(code);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Python metrics error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze Python code.",
      },
      {
        status: 500,
      }
    );
  }
}