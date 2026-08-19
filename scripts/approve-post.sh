#!/usr/bin/env bash
# approve-post.sh — 承認済みの下書き記事を実際に公開する（R0安全弁：この一手だけが対外発信）
#
#   ./scripts/approve-post.sh my-slug
#
# 設計: requirements/design/implementation-plan.md フェーズ3
#       skills/write-book-review.md（このリポジトリの外、ai-auto-company/skills/）が
#       draft:true で書いた記事だけを対象にする。
#
# やること:
#   1. content/posts/{slug}.md の draft: true を draft: false に書き換える
#   2. scripts/publish.sh で commit & push（＝Cloudflare Pagesが自動ビルド・実サイトへ反映）
#   3. 親リポ(ai-auto-company)のnotify.shがあれば、公開完了をTelegramへ即時通知する
#
# ⚠️ CEOの承認（.company/approval-queue.md の該当行）を得た後にのみ実行すること。
#    このスクリプト自体は承認の有無を検証しない（承認プロセスは呼び出し側=秘書の責務）。
set -euo pipefail

cd "$(dirname "$0")/.."

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "usage: scripts/approve-post.sh <slug>" >&2
  exit 1
fi

FILE="content/posts/${SLUG}.md"
if [[ ! -f "$FILE" ]]; then
  echo "not found: $FILE" >&2
  exit 1
fi

if ! grep -q '^draft: true$' "$FILE"; then
  echo "警告: $FILE に 'draft: true' が見つかりません（既に公開済み、または想定外のフォーマット）。中断します。" >&2
  exit 1
fi

# BSD sed (macOS) 互換のため -i '' を使う
sed -i '' 's/^draft: true$/draft: false/' "$FILE"

TITLE=$(sed -n 's/^title: "\(.*\)"$/\1/p' "$FILE" | head -1)

./scripts/publish.sh "post: 『${TITLE:-$SLUG}』を公開（承認済み）"

URL="https://wwwrebell.com/posts/${SLUG}"
PARENT_NOTIFY="../../scripts/notify.sh"
if [[ -x "$PARENT_NOTIFY" ]]; then
  NOTIFY_CHANNELS="telegram,slack" "$PARENT_NOTIFY" "✅rebell-books 公開完了" \
    "『${TITLE:-$SLUG}』を公開しました。${URL}" || true
fi

echo "公開完了: ${URL}"
