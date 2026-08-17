// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// site は canonical / sitemap / OGP の絶対URL生成に使われる。
// 本番ドメインを変える場合はここだけ直せばよい。
export default defineConfig({
  site: "https://wwwrebell.com",
  trailingSlash: "never",
  integrations: [sitemap()],
  build: {
    format: "file", // /posts/foo.html — Cloudflare Pages がそのまま /posts/foo で配信する
  },
  markdown: {
    shikiConfig: { theme: "github-light", wrap: true },
  },
});
