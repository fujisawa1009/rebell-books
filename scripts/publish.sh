#!/usr/bin/env bash
# 記事を1本公開する = content/posts/*.md を commit して push するだけ。
# push すると Cloudflare Pages が自動でビルド・デプロイする。
#
#   ./scripts/publish.sh "post: 『達人プログラマー』の書評を追加"
#
# ⚠️ Cloudflare Pages Free は **ビルド500回/月**。1 push = 1 build なので、
#    複数記事をまとめて1回の push にするほど枠を節約できる。
set -euo pipefail

cd "$(dirname "$0")/.."

MSG="${1:-post: 記事を追加}"

# 記事とコンテンツだけを対象にする（設定やコードの変更を巻き込まない）
git add content/ public/

if git diff --cached --quiet; then
  echo "変更なし — commit をスキップします"
  exit 0
fi

git commit -m "$MSG"
git push origin HEAD
echo "push 完了。Cloudflare Pages のビルドが始まります（1〜2分）。"
