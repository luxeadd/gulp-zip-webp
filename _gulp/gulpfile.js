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

//zip変換後の名前を設定
const zipFailName = "smartLp";

// 読み込み元
const srcPath = {
  img: "../images/**/*",
};
const srcZipPath = {
  zip: "../zip/**/*",
};
// 出力先
let destPath = {
  img: "../dist-images/",
};
let destZipPath = {
  zip: "../dist-zip/",
};

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
    // .pipe(webp())
    // .pipe(dest(destPath.img))
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

// ファイルの圧縮
const archive = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = now.getDate().toString().slice(-2);

  const yymmdd = year + month + day;

  return src(srcZipPath.zip)
    .pipe(zip(`${zipFailName}_${yymmdd}.zip`))
    .pipe(dest(destZipPath.zip));
};

// exports.default = series(
//   series(cssSass, jsBabel, imgImagemin, ejsCompile),
//   parallel(watchFiles, browserSyncFunc)
// );

exports.webp = series(clean, imgImagemin);
exports.zip = series(cleanZip, archive);
exports.webpToPng = series(clean, webpToPng);
