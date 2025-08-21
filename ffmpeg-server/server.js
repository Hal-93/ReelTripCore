const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 5001;
const VERSION = "v1.3.0";

const upload = multer({ dest: "/uploads/" });

app.post("/convert", upload.array("images"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "画像がアップロードされていません" });
  }

  const inputListPath = "/uploads/input.txt";
  const fs = require("fs");
  const fileListContent = req.files.map(file => `file '${file.path}'`).join('\n');
  fs.writeFileSync(inputListPath, fileListContent);

  const outputFile = "/outputs/out.mp4";

  const cmd = `ffmpeg -y -f concat -safe 0 -i ${inputListPath} -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart ${outputFile}`;
  console.log("FFmpeg command:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: "FFmpeg 変換失敗" });
    }
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