# ギフトコイン当てゲーム

TikTokギフトのコイン数を当てるゲームです。Next.jsの静的エクスポートを使い、GitHub Pagesで動作します。データベース、ランキング、スコア送信API、Supabaseの環境変数は不要です。

- 通常モード：出題数、ギフト名表示、回答形式、誤差許容、時間制限を選べます。
- 連続チャレンジ：間違えるまで連続正解数を伸ばします。記録は画面に表示するだけで、保存・送信しません。

## 開発

Node.js 24を使用します。

```sh
npm ci
npm run dev
```

http://localhost:3000/ を開きます。

## 静的サイトの確認

```sh
npm run build
npm start
```

`out/` に公開用のHTML、JavaScript、CSS、画像が生成されます。`npm start` はこのフォルダーを静的配信します。

GitHub Pagesの配信パスをローカルで検証する場合、ビルド前に `NEXT_PUBLIC_BASE_PATH=/gift-coin-game` を設定します（PowerShellでは `$env:NEXT_PUBLIC_BASE_PATH = "/gift-coin-game"`）。この場合は `out/` を静的サーバーの `/gift-coin-game/` に配置して確認してください。環境変数を外して再ビルドするとルート配信に戻ります。

## GitHub Pagesへの公開

1. GitHubのリポジトリで **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定します。
2. この変更を既定ブランチ `master` にマージします。pushで `.github/workflows/pages.yml` がビルドと公開を実行します。
3. **Actions → Deploy to GitHub Pages** で成功を確認します。手動の **Run workflow** でも実行できます。

公開パスはGitHub Pagesの設定から自動取得します。通常の公開URLは https://miso-eg.github.io/gift-coin-game/ です。カスタムドメインではその設定に合わせてビルドされます。
