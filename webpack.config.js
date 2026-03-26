const path = require('path');

module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: 'development',

  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: './src/overpassProvider.ts',

  output: {
    library: {
      type: "umd",
      name: "GeoSearchOverpass"
    },
    path: path.join(__dirname, "dist"),
    filename: "overpassProvider.js"
  },

  module: {
      rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
      }]
  },
  // import 文で .ts ファイルを解決するため
  // これを定義しないと import 文で拡張子を書く必要が生まれる。
  // フロントエンドの開発では拡張子を省略することが多いので、
  // 記載したほうがトラブルに巻き込まれにくい。
  // resolve: {
    // 拡張子を配列で指定
  //   extensions: [
  //     '.ts', '.js',
  //   ],
  // },
};
