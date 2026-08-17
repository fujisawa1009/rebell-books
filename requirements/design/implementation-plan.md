# REBELL BOOKS 実装計画表（PJ-18）

> 作成: 2026-08-18
> 対象: `projects/rebell-books/`（本リポジトリ）の公開〜運用までの実装フェーズ
> 上位設計: `ai-auto-company/requirements/design/reading-pipeline/publishing.md`（公開・換金戦略）,
> `ai-auto-company/requirements/design/reading-pipeline/monetization.md`（収益モデル）
> 本ファイルは上記2つの**実行手順への落とし込み**。方針の根拠・数値はそちらを参照し、ここでは重複させない。

## 凡例

- **担当**: `CEO`（外部アクション・手動操作。AIは実行不可）/ `AI`（自動実行可）/ `CEO承認`（AIが下書き、CEOが承認して実行）
- **状態**: ✅完了 / 🟡未着手 / ⛔ブロック中（依存未解消）
- 各フェーズの終わりに **DoD（完了の定義）** を明記する。次フェーズはDoD達成が前提。

---

## フェーズ0: 土台構築（実装済み・確認のみ）

| # | 内容 | 担当 | 状態 |
|---|---|---|---|
| 0-1 | Astroプロジェクト一式（content collections / zodスキーマ / canonical自動生成 / PR表記自動挿入 / AffiliateBox）を実装 | AI | ✅ |
| 0-2 | `git init` → `first commit` → GitHubリポジトリ `fujisawa1009/rebell-books`（private）へpush | CEO/AI | ✅ |
| 0-3 | サンプル記事2本（`hello-rebell-books.md` / `template-book-review.md`）を配置 | AI | ✅ |

**DoD**: `git status` がclean、GitHub上にコードが存在する。（2026-08-18時点で満たしている）

---

## フェーズ1: 公開前セットアップ（🔴最優先・全てCEO作業）

publishing.md §7「残作業」に対応。ここが終わらないと**サイトが世に出ない**。

| # | 内容 | 担当 | 状態 | 備考 |
|---|---|---|---|---|
| 1-1 | Cloudflare Pages プロジェクト作成 → GitHub連携（`rebell-books`を選択） | CEO | 🟡 | Framework preset: Astro / Build command: `npm run build` / 出力: `dist` / Production branch: `main` / 環境変数 `NODE_VERSION=22` |
| 1-2 | Save and Deploy → `rebell-books.pages.dev` で表示確認 | CEO | 🟡 | 1-1完了後 |
| 1-3 | 独自ドメイン `wwwrebell.com` を Custom domains に追加（apexをハブ、サブドメインに切らない） | CEO | 🟡 | DNSは既にCloudflare管理下 → CNAME自動・数分でSSL発行 |
| 1-4 | `www.wwwrebell.com` を追加し apex へリダイレクト（Redirect Rule） | CEO | 🟡 | |
| 1-5 | `src/pages/about.astro` の `【CEO記入】` を埋める（運営者名・連絡先メール） | CEO | 🟡 | 🔴住所・電話番号は書かない。7/31 REBELL合同会社設立後に法人名を入れる。連絡先はメールのみ |
| 1-6 | `src/pages/privacy.astro` の `【CEO記入】` を埋める（連絡先メール） | CEO | 🟡 | |
| 1-7 | `content/posts/template-book-review.md`（サンプル記事）を削除 | CEO/AI | 🟡 | affiliateがダミーURLのため、そのまま公開すると「PR表記のある非アフィリ記事」になる事故を防ぐ |
| 1-8 | Cloudflare Web Analytics を有効化 | CEO | 🟡 | Cookie不使用。privacy.astroの記載と整合させる |

**DoD**: `https://wwwrebell.com` にアクセスでき、about/privacyが正しい内容で表示され、サンプル記事が公開されていない状態。

---

## フェーズ2: AI自動投稿の配線（worker連携）

publishing.md §7-3 の申し送り事項。**フェーズ1と並行実装可**（サイト非公開でも配線自体は作れる）。

| # | 内容 | 担当 | 状態 | 備考 |
|---|---|---|---|---|
| 2-1 | `worker.js`（ai-auto-companyの自動化基盤）が現状 ai-auto-company リポジトリ内しか commit/push を見ていない問題を起票 | AI | 🟡 | 別タスクとして起票（README §6既知の申し送り） |
| 2-2 | worker側に「`projects/rebell-books` ディレクトリで `scripts/publish.sh` を叩く」導線を1本追加 | AI | ⛔ | 2-1のタスク化が前提。既存の `scripts/publish.sh`（commit & push）をそのまま呼ぶだけで済む設計 |
| 2-3 | AIが書いた記事1本を試験的に投稿し、push→Cloudflareビルド→公開まで一気通貫で動作確認 | AI | ⛔ | フェーズ1（Cloudflare接続）完了が前提 |

**DoD**: AIが `content/posts/*.md` を書いてキューに積むだけで、人の手を介さず公開まで到達する。

---

## フェーズ3: 記事投稿（母数を積む）

monetization.md §5-2 に対応。

| # | 内容 | 担当 | 状態 | 備考 |
|---|---|---|---|---|
| 3-1 | 無料書評記事を10〜15本投稿 | AI（CEO承認不要・内部コンテンツ） | 🟡 | フェーズ1・2完了後に本格化。Amazonアソシエイト審査に「オリジナル記事10本以上＋運営者情報」が必須 |
| 3-2 | 読者反応（アクセス・クリック）を観測できる状態にする | AI | 🟡 | Cloudflare Web Analytics（1-8）が前提 |

**DoD**: 公開記事が10本以上、かつ運営者情報・プライバシーポリシーが正しく表示されている（Amazon審査要件を満たす）。

---

## フェーズ4: ASP（アフィリエイト案件）登録

publishing.md §4-5 / monetization.md §2, §5 に対応。**外部アクションのため全てCEO承認必須**。

| # | 内容 | 担当 | 状態 | 備考 |
|---|---|---|---|---|
| 4-1 | Amazonアソシエイト申請 | CEO承認 | 🟡 | 記事10本＋運営者情報が揃ってから。本命は書籍3%ではなく **Audible 2,000円/人** |
| 4-2 | 楽天アフィリエイト登録・リンク設置 | CEO承認 | 🟡 | 審査なし。ただし**自サイト＋認定SNSのみ**に限定（外部PFには貼らない）。楽天アカウントはポケカ転売(PJ-15)と共用のため規約違反厳禁 |
| 4-3 | afb / バリューコマース / A8.net 等ASP登録 | CEO承認 | 🟡 | AI案件（afbのDomoAI等）を優先候補として調査済み（`.company/products/rebell-auto-sns/affiliate/programs.md`） |
| 4-4 | 各affiliateリンクをfrontmatterの`affiliate`欄経由でのみ設置する運用を徹底（本文直書き禁止の再確認） | AI | 🟡 | PR表記自動挿入の仕組みが機能する前提を崩さない |

**DoD**: 少なくとも1つのASP（楽天 or Amazon）が稼働し、実際の記事にaffiliateリンクが表示されている。

---

## フェーズ5: 有料化（検証ゲート対象・🔴慎重フェーズ）

monetization.md §5-6 に対応。CLAUDE.mdの「Hypothesis validation gate」対象。

| # | 内容 | 担当 | 状態 | 備考 |
|---|---|---|---|---|
| 5-1 | 無料記事の反応データを見て「刺さるテーマ」を特定 | AI（分析）→CEO判断 | 🟡 | 憶測で有料商品を設計しない |
| 5-2 | `/validate-hypothesis` を実施（L2単発有料note / L3メンバーシップ） | CEO承認必須 | ⛔ | 5-1のデータが前提。会費は設定後変更不可のため値付けの検証を厳格に行う |
| 5-3 | L2: 単発有料note（実用ノウハウ、1,000〜2,000円）の設計・公開 | CEO承認 | ⛔ | 検証ゲート通過後 |
| 5-4 | L3: メンバーシップ（継続課金）の設計・公開 | CEO承認 | ⛔ | note審査あり。L2の反応を見てから着手 |

**DoD**: 検証ゲートを通過した仮説のみが実装される。憶測での有料商品ローンチが発生していない。

---

## 全体依存関係

```
フェーズ0(完了) → フェーズ1(CEO:Cloudflare接続等) ─┬→ フェーズ3(記事を積む) → フェーズ4(ASP登録)
                → フェーズ2(worker連携)      ─┘                              → フェーズ5(有料化・検証ゲート)
```

- フェーズ1とフェーズ2は並行着手可能。
- フェーズ3以降はフェーズ1完了（サイトが実際にネット上で見える状態）が前提。
- フェーズ5はフェーズ3で得た実データなしに着手しない（憶測禁止・CLAUDE.md検証ゲート）。

## 未確定・要確認（本計画への影響あり）

publishing.md §5 を継承。特に以下は本計画のフェーズ4以降に直接影響する。

| # | 内容 | タスク |
|---|---|---|
| 1 | 楽天の「認定SNS」に note/Zenn が該当するか（未定義） | T-217 |
| 2 | noteの投稿API有無／Amazon以外のASPリンクがnoteで機能するか | T-218 |
