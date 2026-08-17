import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { code, language } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are DevLens AI, an expert software code reviewer.

Analyze the following ${language} code.

Return ONLY valid JSON using exactly this structure:

{
  "score": 0,
  "explanation": "",
  "issues": [],
  "suggestions": []
}

Rules:

- score must be a number from 0 to 100
- explain clearly what the code does
- identify real potential problems
- provide practical improvements
- don't invent problems if the code is correct
- keep the explanation understandable for junior developers
- do not use markdown
- do not use code fences
- return only JSON

CODE:

${code}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze code.",
      },
      {
        status: 500,
      }
    );
  }
}