# gulp-skelton

よく使用するであろうタスクを紹介します。
それ以外の詳しいことは `gulpfile.babel.js` を参照してください。

## npm start

最初に`src/`以下をビルドし、`src/`以下の監視を開始した状態でローカルサーバを立ち上げます。

## npm run build

最初に`src/`以下をビルドします。

## npm run release

実施前に、`public/`にあるファイルを削除して、`src`以下をビルドします。

## npm run cap

`public/`以下の`html`ファイルのプレビューをキャプチャして`capture`へ保存します。

## npm run min

`public/`以下の`js`と`css`を圧縮最適化します。
