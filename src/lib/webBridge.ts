// Мост к веб-версии движка (Rust → wasm32 → JavaScript).
// Обмен строками JSON через общую память модуля; формат описан в crates/engine-web.

export interface WebEngineModule {
  memory: { buffer: ArrayBuffer };
  engine_init(seedHi: number, seedLo: number): void;
  engine_alloc(len: number): number;
  engine_free(ptr: number, len: number): void;
  engine_call(ptr: number, len: number): number;
  engine_output_ptr(): number;
}

export interface WebEngine {
  call<T>(request: Record<string, unknown>): T;
}

type Response<T> = { ok: T } | { err: string };

/** Создаёт сессию движка. Ошибки движка выбрасываются как строки — как у команд Tauri. */
export function createWebEngine(mod: WebEngineModule, seed: readonly [number, number]): WebEngine {
  mod.engine_init(seed[0] >>> 0, seed[1] >>> 0);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return {
    call<T>(request: Record<string, unknown>): T {
      const bytes = encoder.encode(JSON.stringify(request));
      const ptr = mod.engine_alloc(bytes.length);
      let length: number;
      try {
        new Uint8Array(mod.memory.buffer, ptr, bytes.length).set(bytes);
        length = mod.engine_call(ptr, bytes.length);
      } finally {
        mod.engine_free(ptr, bytes.length);
      }
      // Буфер памяти читается заново: он мог смениться при росте памяти модуля.
      const output = new Uint8Array(mod.memory.buffer, mod.engine_output_ptr(), length);
      const response = JSON.parse(decoder.decode(output)) as Response<T>;
      if ("err" in response) {
        throw response.err;
      }
      return response.ok;
    },
  };
}
