import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filePath = url.searchParams.get("path");

  if (!filePath) return NextResponse.json({ error: "No path specified" }, { status: 400 });

  const absPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(absPath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const fileBuffer = fs.readFileSync(absPath);
  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": "video/mp4" },
  });
}