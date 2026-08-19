import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * 記事の置き場所は リポジトリ直下の content/posts/*.md。
 * 「Markdown を1枚置いて git push するだけで記事が増える」ことが最優先要件なので、
 * 記事は src/ の外に、フラットに置く。
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts" }),
  schema: z.object({
    // --- 必須 ---
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),

    // --- 任意 ---
    /** 更新日。指定があれば記事下部に表示 */
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** 書籍の ISBN-13（ハイフンなし推奨）。書影・書誌の識別子 */
    isbn: z.string().optional(),
    /** 書籍タイトル・著者（記事タイトルと別に持つ） */
    book: z
      .object({
        title: z.string(),
        author: z.string().optional(),
        publisher: z.string().optional(),
      })
      .optional(),
    /**
     * canonical URL。省略時は site + 記事パスを自動生成する。
     * 外部PF（note/Zenn）に先に出してしまった等で「正」を移したいときだけ指定する。
     */
    canonical: z.string().url().optional(),
    /**
     * アフィリエイトリンク。1つでも入っていれば記事冒頭に PR表記が自動で出る（ステマ規制対応）。
     * kind: audible | kindle-unlimited | amazon | rakuten | asp
     */
    affiliate: z
      .array(
        z.object({
          kind: z.enum(["audible", "kindle-unlimited", "amazon", "rakuten", "asp"]),
          label: z.string(),
          url: z.string().url(),
          note: z.string().optional(),
        }),
      )
      .default([]),
    /** true の記事はビルド対象から外れる（下書き） */
    draft: z.boolean().default(false),
    /**
     * 書影URL（任意）。openBDの`summary.cover`等、権利者が公式に提供する画像のみを指す
     * （自前でスクリーンショットを撮って掲載しない＝著作権配慮）。ホットリンクで参照し、
     * 自サイトに複製・保存しない。openBDのcover提供率は低いため、無い記事の方が多い想定。
     */
    coverImage: z.string().url().optional(),
    /** 書影の出典表記（例: "openBD"）。coverImageがある場合は必須にしたいが、
     *  移行期の互換のため任意にしておく */
    coverImageCredit: z.string().optional(),
    /**
     * 記事の要点（3〜6個）。サイト表示には使わない。将来の別媒体展開
     * （例: 要約をスライド化してTikTok等に横展開）向けの構造化データとして
     * 記事生成時に併せて残しておく（CEO意向 2026-08-20）。空でもビルドは通る。
     */
    keyPoints: z.array(z.string()).max(6).optional(),
  }),
});

export const collections = { posts };
