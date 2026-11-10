import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import {
  DEFAULT_CANDIDATE_PROFILE,
  extractProfileFromCvText,
} from "@/lib/offers-data";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier CV fourni" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let extractedText = "";

    if (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf"
    ) {
      try {
        const pdf = await getDocumentProxy(uint8Array);
        const { text } = await extractText(pdf, { mergePages: true });
        extractedText = Array.isArray(text) ? text.join("\n") : String(text || "");
      } catch {
        // Fallback decoder if PDF has non-standard header
        extractedText = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      }
    } else {
      extractedText = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
    }

    const cleanText = extractedText.replace(/\s+/g, " ").trim();
    const { profile, suggestedQuery } = extractProfileFromCvText(
      cleanText,
      file.name,
      DEFAULT_CANDIDATE_PROFILE
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      extractedCharacters: cleanText.length,
      textPreview: cleanText.slice(0, 600),
      suggestedQuery,
      detectedSkills: profile.keywords,
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors de l'extraction du CV PDF",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
