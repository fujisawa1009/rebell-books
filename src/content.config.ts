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
  }),
});

export const collections = { posts };
