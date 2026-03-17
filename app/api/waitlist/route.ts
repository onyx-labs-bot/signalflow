import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { email, product } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, "waitlist.json");
    let entries: Array<{ email: string; product: string; date: string }> = [];

    try {
      const existing = await fs.readFile(filePath, "utf-8");
      entries = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
    }

    // Dedupe
    if (entries.some((e) => e.email === email)) {
      return NextResponse.json({ message: "Already on the list!" });
    }

    entries.push({ email, product: product || "agentkit", date: new Date().toISOString() });
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ message: "Added to waitlist!" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
