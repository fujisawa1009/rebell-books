# REBELL BOOKS — 書評サイト（wwwrebell.com）

PJ-18 読書パイプラインの **ハブ**。Cloudflare Pages で配信する静的サイト（月額 ¥0）。

- 設計: `ai-auto-company/requirements/design/reading-pipeline/publishing.md` / `monetization.md`
- 役割: **フル版の書評をここに先に出す（＝canonicalの「正」）。換金リンクはここだけに置く。**
  外部PF（note / X / Zenn / 楽天ROOM）はスポークで、切り口を変えた版＋原文URLを出す。

---

## 1. なぜ Astro か（T-219 技術選定）

| 判断軸 | Astro | Hugo | Eleventy |
|---|---|---|---|
| ① **md を置いて push するだけで記事が増える** | ◎ content collections + glob loader。`content/posts/*.md` に1枚置くだけ | ◎ | ◎ |
| ② ビルドが速い（Pages Free = **500ビルド/月**） | ◎ **0.7秒 / 10ページ**（実測）。npm install 込みでも1分以内 | ◎ 最速 | ○ |
| ③ **canonical を記事ごとに制御** | ◎ frontmatter → `<link rel=canonical>`。**本PJの生命線** | ○ 要テンプレ実装 | ○ 要実装 |
| ④ 保守が軽い | ○ 依存は astro + sitemap の2つだけ | ◎ バイナリ1個 | ○ |
| ⑤ 日本語 | ◎ | ◎ | ◎ |
| その他 | **frontmatter を zod で型検証**。スキーマ違反はビルドで落ちる | Goテンプレの学習コスト | エコシステムが小さい |

**採用理由**: 差がついたのは③と「frontmatter のスキーマ検証」。
本サイトは **AI が自動で記事を書いて push する**前提で、`canonical` `affiliate` `isbn` のような
**間違うと事故になるメタデータ**を機械的に守らせる必要がある。Astro の zod スキーマなら、
`affiliate` の形が壊れていれば**ビルドが赤くなって公開されない**（＝PR表記漏れ・canonical事故を構造的に防げる）。
Hugo は最速だがこの検証がテンプレ側の手作りになる。ビルド時間は Astro でも十分速く（実測0.7秒）、
Pages Free の500ビルド/月に対しては記事投稿頻度なら誤差。

**依存は2つだけ**: `astro`, `@astrojs/sitemap`（RSSは依存を増やさず手書き）。

---

## 2. ローカル開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に静的HTMLを生成（これが通らないものは公開しない）
npm run preview  # ビルド結果を確認
```

## 3. 記事の追加方法（★AI自動投稿はこれだけ）

**`content/posts/{slug}.md` を1枚書いて、git push する。それだけ。**
push すると Cloudflare Pages が自動でビルド・デプロイする（1〜2分）。
URL は `https://wwwrebell.com/posts/{slug}` になる（ファイル名 = slug）。

```bash
./scripts/publish.sh "post: 『達人プログラマー』の書評を追加"
```

> ⚠️ **Pages Free は 500ビルド/月**（= 1日16回）。1 push = 1 build。
> 記事を複数まとめて1回の push にすると枠を節約できる。

雛形が欲しいときだけ: `npm run new -- my-slug "記事タイトル"`

### frontmatter リファレンス

```yaml
---
title: "記事タイトル"                 # 必須
date: 2026-07-13                     # 必須
description: "一覧・OGP・meta description に出る要約"  # 必須
tags: ["AI運用", "エンジニアリング"]   # 任意
isbn: "9784274226298"                # 任意（構造化データに出る）
book:                                # 任意
  title: "達人プログラマー 第2版"
  author: "David Thomas"
  publisher: "オーム社"
canonical: "https://..."             # 任意。★省略時は自サイトのURLが自動で入る（通常は省略でよい）
affiliate:                           # 任意。1件でもあれば【記事冒頭にPR表記が自動で出る】
  - kind: audible                    # audible | kindle-unlimited | amazon | rakuten | asp
    label: "Audible で聴く"
    url: "https://..."
    note: "移動中に聴くなら"
draft: false                         # true ならビルド対象外
---
```

### 🔴 守るルール（設計上の前提。破ると事業が飛ぶ）

1. **canonical は原則いじらない**。自サイトが「正」。外部PFに先に出してしまった場合だけ、
   その外部URLを `canonical` に入れる（＝自サイトが「写し」だと宣言する）。
2. **アフィリリンクを置いたら PR表記は自動で出る**。`affiliate` に1件でも入れれば
   記事冒頭に「PR」が入り、リンクには `rel="sponsored nofollow"` が付く（ステマ規制・景表法）。
   **逆に言えば、affiliate に書かずに本文へ直接アフィリURLを埋め込むと表記が漏れる。絶対にやらない。**
3. **楽天リンクは自サイトと認定SNS（X / 楽天ROOM）にだけ**。note/Zenn には貼らない（T-217未解決）。
   楽天アカウントはポケカ転売（PJ-15）と共用 → 規約違反で凍結すると転売事業まで巻き添え。
4. **読んでいない本・課金していないサービスは推さない。**

---

## 4. 🔴 CEO がやる作業（外部アクション。AIは実行できない）

### 手順A: GitHub リポジトリを作る

`git init` までは済んでいる（コミットは未実施 — CEO の手で打つ）。

```bash
cd ~/project/ai-auto-company/projects/rebell-books
git add -A
git commit -m "init: REBELL BOOKS (Astro / Cloudflare Pages)"
gh repo create rebell-books --private --source=. --remote=origin --push
```
> **Private でよい**（Cloudflare Pages は Private リポジトリも連携できる）。
> 書評の下書きが公開リポジトリで丸見えになるのを避けられる。

### 手順B: Cloudflare Pages に接続

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub を認可して `rebell-books` を選択
3. ビルド設定:

   | 項目 | 値 |
   |---|---|
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Production branch | `main` |
   | 環境変数 | `NODE_VERSION` = `22` |

4. **Save and Deploy** → 1〜2分で `rebell-books.pages.dev` が生える。ここで表示を確認する。

### 手順C: 独自ドメインを繋ぐ（wwwrebell.com）

1. Pages プロジェクト → **Custom domains** → **Set up a custom domain**
2. `wwwrebell.com` を入力 → DNSは既に Cloudflare 管理下なので **CNAME が自動で入る**（数分でSSL発行）
3. あわせて `www.wwwrebell.com` も追加し、apex へリダイレクトさせる（Redirect Rule）

> **サブドメイン構成の提案**: **apex（`wwwrebell.com`）をそのままハブにするのを推奨**。
> `books.wwwrebell.com` のように切ると、SEOの評価が2ドメインに分散し、
> 将来 REBELL のコーポレートサイトを立てる時に「どっちが本体か」が曖昧になる。
> 会社サイトが必要になったら `corp.wwwrebell.com` を切る側にすればよい。
> 検索流入が生命線の書評サイトを apex に置く、が正しい配分。

### 手順D: 公開前チェック（★これをやらずに公開しない）

- [ ] **`src/pages/about.astro` の `【CEO記入】` を埋める**（運営者名・連絡先メール）
      → 🔴 **住所・電話番号は書かない**。7/31 の REBELL合同会社 設立後に法人名を入れる。
      連絡先はメールのみ（例: `contact@wwwrebell.com`）。
- [ ] **`src/pages/privacy.astro` の `【CEO記入】` を埋める**（連絡先メール）
- [ ] **`content/posts/template-book-review.md` を削除する**（記事テンプレ兼サンプル。
      affiliate の URL がダミーなので、そのまま公開すると「PR表記のある非アフィリ記事」になる）
- [ ] Cloudflare Web Analytics を有効化（Cookie不使用。privacy.astro の記載と整合させる）

### 手順E: ASP（あとで。記事が10本貯まってから）

- **Amazonアソシエイト**: 審査に **オリジナル記事10本以上 + 運営者情報 + プライバシーポリシー** が要る。
  → **記事を10本積んでから申請**（`monetization.md` §5）。本命は書籍3%ではなく **Audible 2,000円/人**。
- **楽天**: 審査なし。ただし §3-3 の制約を守ること。
- ※ ASP登録は外部アクション＝CEO承認・CEO操作。

---

## 5. 構成

```
content/posts/*.md          ← 記事。AIはここに md を置いて push するだけ
src/content.config.ts       ← frontmatter のスキーマ（zod）。ここが品質ゲート
src/layouts/Base.astro      ← <head>・canonical・ナビ・フッタ
src/layouts/Post.astro      ← 記事本文・PR表記の自動挿入・構造化データ(Review/Book)
src/components/
  PrDisclosure.astro        ← ステマ規制のPR表記（affiliate があれば冒頭に自動表示）
  AffiliateBox.astro        ← 記事末尾のアフィリリンク欄（rel="sponsored nofollow"）
src/pages/
  index.astro               ← 記事一覧
  posts/[...slug].astro     ← 記事ページ
  tags/index.astro, [tag].astro
  about.astro               ← 運営者情報（Amazon審査に必須）
  privacy.astro             ← プライバシーポリシー（同上）
  rss.xml.ts, 404.astro
scripts/publish.sh          ← commit & push（= 公開）
scripts/new-post.mjs        ← 雛形生成（人間用）
```

## 6. 既知の申し送り

- **worker.js の commit/push 基盤は ai-auto-company リポジトリ内しか見ていない。**
  本サイトは別リポジトリ（`projects/rebell-books/`）なので、AI が自動投稿するには
  **worker 側に「このディレクトリで commit/push する」導線を1本足す必要がある**（`scripts/publish.sh` を叩くだけでよい）。
  → 別タスクとして起票すること。
- Amazon PA-API は 2026-05-15 に廃止済み。**書影・書誌の自動取得はできない**（手貼りリンクは継続可）。
  書影が要るなら openBD / Google Books API を検討。
