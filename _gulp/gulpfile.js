const { src, dest, watch, series, parallel } = require("gulp"); // Gulpの基本関数をインポート
const imageminSvgo = require("imagemin-svgo"); // SVGを最適化するためのモジュール
const imagemin = require("gulp-imagemin"); // 画像を最適化するためのモジュール
const imageminMozjpeg = require("imagemin-mozjpeg"); // JPEGを最適化するためのモジュール
const imageminPngquant = require("imagemin-pngquant"); // PNGを最適化するためのモジュール
const changed = require("gulp-changed"); // 変更されたファイルのみを対象にするためのモジュール
const del = require("del"); // ファイルやディレクトリを削除するためのモジュール
const webp = require("gulp-webp"); //webp変換
const rename = require("gulp-rename"); //ファイル名変更
const replace = require("gulp-replace"); // 文字列や正規表現による置換
const zip = require("gulp-zip");
const sharp = require("sharp"); // sharpモジュールをインポート
const through2 = require("through2"); // through2モジュールを追加
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const open = require("open").default;

//zip変換後の名前を設定
// const zipFailName = "smartLp";

// 読み込み元
const srcPath = {
  img: "../images/**/*",
};
const srcZipPath = {
  zip: "../zip/**/*",
};
// 出力先
let destPath = {
  img: "/Users/kounosatoshi/Downloads/dist-webp/",
};
let destZipPath = {
  zip: "/Users/kounosatoshi/Downloads/dist-zip/",
};

// 画像アップロード用ストレージ（元のファイル名で保存）
const storageWebp = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../images/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadWebp = multer({ storage: storageWebp });

// フォルダアップロード用ストレージ（元のファイル名で保存）
const storageZip = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../zip/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadZip = multer({ storage: storageZip });

// 画像圧縮
const imgImagemin = () => {
  // 画像ファイルを指定
  return (
    src(srcPath.img)
      //変更があった画像のみ処理対象に
      .pipe(changed(destPath.img))
      // 画像を圧縮
      .pipe(
        imagemin(
          [
            // JPEG画像の圧縮設定
            imageminMozjpeg({
              quality: 80, // 圧縮品質（0〜100）
            }),
            // PNG画像の圧縮設定
            imageminPngquant(),
            // SVG画像の圧縮設定
            imageminSvgo({
              plugins: [
                {
                  removeViewbox: false, // viewBox属性を削除しない
                },
              ],
            }),
          ],
          {
            verbose: true, // 圧縮情報を表示
          }
        )
      )
      //変換前の拡張子での圧縮画像が必要な場合
      .pipe(dest(destPath.img))
      //webp変換
      .pipe(webp())
      .pipe(dest(destPath.img))
  );
};

// webpからPNGへの変換タスク
const webpToPng = () => {
  return src(srcPath.img)
    .pipe(
      through2.obj(function (file, enc, cb) {
        sharp(file.contents)
          .png({
            quality: 80, // 品質設定（1-100）
            compressionLevel: 9, // 圧縮レベル（0-9、9が最大圧縮）
            palette: true, // パレットベースの圧縮を使用
            colors: 256, // パレットの色数
          })
          .toBuffer()
          .then((buffer) => {
            file.contents = buffer;
            file.path = file.path.replace(".webp", ".png");
            cb(null, file);
          })
          .catch((err) => cb(err));
      })
    )
    .pipe(dest(destPath.img));
};

// ファイルの削除
const clean = () => {
  return del(destPath.img, { force: true });
};
const cleanZip = () => {
  return del(destZipPath.zip, { force: true });
};

// ファイルの圧縮（サブフォルダごとにzip化）
const archive = (done) => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = now.getDate().toString().slice(-2);
  const yymmdd = year + month + day;

  const zipDir = path.resolve(__dirname, "../zip");
  const folders = fs
    .readdirSync(zipDir)
    .filter((f) => fs.statSync(path.join(zipDir, f)).isDirectory());

  if (folders.length === 0) {
    done();
    return;
  }

  const tasks = folders.map((folder) => {
    return src(`../zip/${folder}/**/*`)
      .pipe(zip(`${folder}_${yymmdd}.zip`))
      .pipe(dest("../dist-zip/"));
  });

  // 複数のストリームをまとめて完了させる
  return require("merge-stream")(...tasks);
};

// Expressサーバータスク
const apiServer = (done) => {
  const app = express();

  // index.html配信
  app.use(express.static(path.join(__dirname, "../")));

  // 画像アップロード→gulp webp
  app.post("/api/webp", uploadWebp.array("files"), (req, res) => {
    exec("npx gulp webp", (err, stdout, stderr) => {
      // 変換後にimagesフォルダ内を完全に空にする（サブフォルダ含む）
      del(
        [
          path.resolve(__dirname, "../images/**"),
          "!" + path.resolve(__dirname, "../images"),
        ],
        { force: true }
      ).then(() => {
        if (err) {
          res.status(500).send(stderr);
        } else {
          res.send("webp変換完了");
        }
      });
    });
  });

  // フォルダアップロード→gulp zip
  app.post("/api/zip", uploadZip.array("files"), (req, res) => {
    exec("npx gulp zip", (err, stdout, stderr) => {
      // 変換後にzipフォルダ内を完全に空にする（サブフォルダ含む）
      del(
        [
          path.resolve(__dirname, "../zip/**"),
          "!" + path.resolve(__dirname, "../zip"),
        ],
        { force: true }
      ).then(() => {
        if (err) {
          res.status(500).send(stderr);
        } else {
          res.send("zip化完了");
        }
      });
    });
  });

  app.listen(2229, () => {
    console.log("http://localhost:2229 でサーバー起動");
    open("http://localhost:2229");
    done();
  });
};

exports.webp = series(clean, imgImagemin);
exports.zip = series(cleanZip, archive);
exports.webpToPng = series(clean, webpToPng);
exports.serve = apiServer;
