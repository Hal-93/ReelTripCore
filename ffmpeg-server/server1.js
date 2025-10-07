const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5001;
const VERSION = "v1.3.0";

// 画像アップロード用
const upload = multer({ dest: "/uploads/" });

app.post("/convert", upload.array("images"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "画像がアップロードされていません" });
  }

  // input.txt を生成（画像ごとに duration 1秒）
  const inputListPath = "/uploads/input.txt";
  const fileListContent = req.files
    .map(file => `file '${file.path}'\nduration 1`) // durationを追加
    .join("\n") + `\nfile '${req.files[req.files.length - 1].path}'`; // 最後の画像も参照
  fs.writeFileSync(inputListPath, fileListContent);

  const outputFile = "/outputs/out.mp4";
  const bgmFile = "/uploads/bgm.mp3"; // アップロードしたBGMを想定
  const subtitleText = "サンプル字幕"; // 固定テキスト。動的も可

  // ffmpeg コマンド生成
  const cmd = `
    ffmpeg -y -f concat -safe 0 -i ${inputListPath} \
    -i ${bgmFile} -filter_complex "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,drawtext=text='${subtitleText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-100[v];[1:a]volume=0.5[audio]" \
    -map "[v]" -map "[audio]" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart ${outputFile}
  `;

  console.log("FFmpeg command:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: "FFmpeg 変換失敗" });
    }

    // アップロード画像を削除
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete file:", file.path, unlinkErr);
      }
    });

    res.json({ output: outputFile });
  });
});

app.listen(PORT, () => {
  console.log(`FFmpeg server(${VERSION}) running on port ${PORT}`);
});
