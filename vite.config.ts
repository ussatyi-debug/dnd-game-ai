import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Адрес dev-сервера для запуска на Android-устройстве (задаёт Tauri CLI).
const host = process.env.TAURI_DEV_HOST;

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version: string };

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Режим "web" (`npm run build:web`) собирает одну самодостаточную HTML-страницу,
// в которой движок на Rust, переведённый в JavaScript, работает прямо в браузере.
export default defineConfig(({ mode }) => {
  const web = mode === "web";
  return {
    base: web ? "./" : "/",
    plugins: [react(), tailwindcss(), ...(web ? [viteSingleFile()] : [])],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        "engine-web-module": web
          ? fromRoot("./src/generated/engine-web.js")
          : fromRoot("./src/lib/engineWebUnavailable.ts"),
      },
    },
    build: web ? { outDir: "dist-web", emptyOutDir: true } : undefined,
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
      watch: { ignored: ["**/src-tauri/**", "**/crates/**"] },
    },
  };
});
