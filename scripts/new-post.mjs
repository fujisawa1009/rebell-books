#!/usr/bin/env node
/**
 * 記事の雛形を content/posts/{slug}.md に作る。
 *   npm run new -- my-slug "記事タイトル"
 *
 * AIが自動投稿する場合はこのスクリプトを使う必要はない。
 * content/posts/*.md に直接ファイルを書いて git push すればよい（それが本サイトの設計）。
 * これは人間が手で1本足すときの手間を減らすだけのもの。
 */
import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [slug, title] = process.argv.slice(2);
if (!slug) {
  console.error('usage: npm run new -- <slug> "<title>"');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(root, "content/posts", `${slug}.md`);
if (existsSync(file)) {
  console.error(`already exists: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const body = `---
title: "${title ?? slug}"
date: ${today}
description: ""
tags: []
# isbn: "9784..."
# book:
#   title: ""
#   author: ""
#   publisher: ""
# canonical: "https://wwwrebell.com/posts/${slug}"   # 省略時は自動生成
# affiliate:                                          # 1件でもあれば冒頭にPR表記が自動で出る
#   - kind: audible          # audible | kindle-unlimited | amazon | rakuten | asp
#     label: "Audible で聴く"
#     url: "https://..."
draft: true
---

## この本が賭けている一点

## 読んで、何を変えたか

## 結果

## 誰に勧めるか
`;

writeFileSync(file, body, "utf8");
console.log(`created: ${file}`);
