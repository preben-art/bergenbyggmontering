import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = {
  main: resolve(__dirname, "index.html"),
  faginnsikt: resolve(__dirname, "faginnsikt.html"),
  personvern: resolve(__dirname, "personvern.html"),
  "tjeneste-totalrenovering": resolve(
    __dirname,
    "tjeneste-totalrenovering.html",
  ),
  "tjeneste-bad": resolve(__dirname, "tjeneste-bad.html"),
  "tjeneste-tak": resolve(__dirname, "tjeneste-tak.html"),
  "tjeneste-ror": resolve(__dirname, "tjeneste-ror.html"),
  "tjeneste-fasade": resolve(__dirname, "tjeneste-fasade.html"),
  "tjeneste-tomrer": resolve(__dirname, "tjeneste-tomrer.html"),
  "tjeneste-tilbygg": resolve(__dirname, "tjeneste-tilbygg.html"),
  "tjeneste-brl": resolve(__dirname, "tjeneste-brl.html"),
};

export default defineConfig({
  appType: "mpa",
  publicDir: "public",
  server: {
    host: "0.0.0.0",
    port: 43147,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 43147,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: pages,
    },
  },
});
