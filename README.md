## ファイルの特徴
- webp画像変換・zip圧縮用ファイル
- `npx gulp webp`　コマンド入力でimagesフォルダに格納した画像をwebpに変換してdist-imagesフォルダ内に出力
- `npx gulp webpToPng`　コマンド入力でimagesフォルダに格納したwebp画像をpngに変換してdist-imagesフォルダ内に出力
- `npx gulp zip`　コマンド入力でzipフォルダに格納したフォルダをzip圧縮してdist-zipフォルダ内に出力 ※zip化後のフォルダ名は_gulpフォルダ内のgulpfile.js `const zipFailName`にて設定

## ファイル構成  
∟ images ・・・webpに変換したい画像格納用  
∟ zip ・・・zipに変換したいファイルフォルダ格納用  
∟ _gulp ・・・gulpファイル格納用      

∟ dist-images ・・・webp画像出力用（gulp起動後に表示）    
∟ dist-zip ・・・zip出力用（gulp起動後に表示）      


## このコーディングファイルの使い方
まず、以下に書いてある内容を必ずお読みください
この中身で分かることは以下のとおりです

- 使用環境
- 使い方および操作方法
- 注意点 

## 使用環境
- Node.js バージョン14系以上
- npm バージョン8以上
- バージョン確認方法：※ターミナル上でコマンドを入力すること
  - `node -v`
  - `npm -v`
- コマンドを入力後、数字がでてくれば大丈夫です

## 使い方および操作方法 
### 事前準備
1. ターミナルを開く
2. `cd _gulp`をターミナルに入力（cdと_gulpの間には半角スペース要）
3. `npm i`をターミナルへ入力
4. node_modulesが生成されます。
### - webpへ画像変換
- webpに変換したい画像をimagesへ格納（フォルダ階層があってもそのまま階層構造を維持したままwebpに変換されます）
- `npx gulp webp`をターミナルに入力するとdist-imagesフォルダに画像が出力されます。（cd _gulpで_gulpフォルダ直下に移動している状態で行ってください）
### - webpからpngへ画像変換
- webpからpngへ変換したい画像をimagesへ格納（フォルダ階層があってもそのまま階層構造を維持したままpngに変換されます）
- `npx gulp webpToPng`をターミナルに入力するとdist-imagesフォルダに画像が出力されます。（cd _gulpで_gulpフォルダ直下に移動している状態で行ってください）

### - zip圧縮
- zip圧縮したいフォルダ、ファイルをzipへ格納
- `npx gulp zip`をターミナルに入力するとdist-zipフォルダに画像が出力されます。（cd _gulpで_gulpフォルダ直下に移動している状態で行ってください）

# gulp-zip-webp
