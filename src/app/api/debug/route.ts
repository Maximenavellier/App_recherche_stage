import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://www.1jeune1solution.gouv.fr/stages?motCle=data&page=1";
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    });
    const duration = Date.now() - start;
    const text = await res.text();
    const hasNextData = text.includes("__NEXT_DATA__");
    return NextResponse.json({
      status: res.status,
      duration,
      hasNextData,
      length: text.length,
      sample: text.slice(0, 500)
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      duration: Date.now() - start,
    });
  }
}
