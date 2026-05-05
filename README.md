# Trip Palette

行ったことのある場所と行きたい場所を、周辺マップ・観光スポット・場所ごとのTODO・予算メモでまとめる静的Webサイトです。

## 使い方

```bash
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173` を開いて確認します。

## GitHub Pages デプロイ

このリポジトリをGitHubにpushし、GitHub PagesのSourceを「GitHub Actions」に設定すると、`main` ブランチへのpushで自動デプロイされます。

公開URLはGitHub Pagesのデプロイ完了後に、リポジトリの **Settings > Pages** またはActionsの `github-pages` 環境に表示されます。通常は `https://<ユーザー名または組織名>.github.io/<リポジトリ名>/` 形式です。

## 主な機能

- 行きたい場所をフォームから手動追加
- 選択スポットに連動する周辺マップ表示
- 周辺観光スポット、季節、優先度、予算メモ、参考URLの表示
- 行きたい場所ごとのTODOリスト
- 写真URLまたは画像ファイル付きの行った記録
- 入力内容のブラウザ保存（localStorage）
