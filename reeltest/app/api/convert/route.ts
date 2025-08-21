import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let formDataKeys: string[] = [];
  try {
    // クライアントからの FormData を取得
    const formData = await req.formData();
    formDataKeys = Array.from(formData.keys());

    // FFmpeg サーバーに転送する FormData
    const forwardFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      forwardFormData.append(key, value);
    }

    // FFmpeg サーバーへ POST
    const resp = await fetch("http://ffmpeg-server:5001/convert", {
      method: "POST",
      body: forwardFormData,
    });

    // JSON 以外が返ってきた場合はエラーとして処理
    if (!resp.ok) {
      const text = await resp.text();
      console.error("FFmpeg server error:");
      console.error("Status:", resp.status);
      console.error("Headers:", JSON.stringify(Object.fromEntries(resp.headers.entries())));
      console.error("Body:", text);
      return NextResponse.json({ error: "FFmpegサーバーが失敗しました" }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Next.js API error:", err);
    if (err instanceof Error) {
      console.error("Stack trace:", err.stack);
    }
    console.error("Request FormData keys:", formDataKeys);
    return NextResponse.json({ error: "動画生成に失敗しました" }, { status: 500 });
  }
}