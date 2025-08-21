"use client";

import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    setLoading(true);
    setVideoUrl(null);

    try {
      const convertResp = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      const data = await convertResp.json();

      setVideoUrl(`/api/video?path=${encodeURIComponent(data.output)}`); 
    } catch (err) {
      console.error(err);
      alert("動画生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">画像を動画に変換</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        disabled={loading || !files || files.length === 0}
      >
        {loading ? "生成中…" : "動画に変換"}
      </button>

      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {videoUrl && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">プレビュー</h2>
          <video src={videoUrl} controls className="max-w-full rounded shadow" />
        </div>
      )}
    </div>
  );
}