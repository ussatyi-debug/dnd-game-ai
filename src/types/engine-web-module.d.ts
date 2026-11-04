// Модуль веб-движка. В веб-сборке (`npm run build:web`) это JavaScript, полученный из Rust;
// в сборке приложения — src/lib/engineWebUnavailable.ts (см. vite.config.ts).
declare module "engine-web-module" {
  export const memory: { buffer: ArrayBuffer };
  export function engine_init(seedHi: number, seedLo: number): void;
  export function engine_alloc(len: number): number;
  export function engine_free(ptr: number, len: number): void;
  export function engine_call(ptr: number, len: number): number;
  export function engine_output_ptr(): number;
}
