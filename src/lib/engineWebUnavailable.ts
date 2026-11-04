// Подставляется вместо веб-движка в сборке приложения: там броски выполняет Rust через Tauri,
// а модуль веб-движка не собирается. Любой вызов сообщает, как получить веб-версию.

const message = "Веб-движок не входит в эту сборку. Соберите веб-версию: npm run build:web";

function unavailable(): never {
  throw new Error(message);
}

export const memory = { buffer: new ArrayBuffer(0) };
export const engine_init = (_seedHi: number, _seedLo: number): void => unavailable();
export const engine_alloc = (_len: number): number => unavailable();
export const engine_free = (_ptr: number, _len: number): void => unavailable();
export const engine_call = (_ptr: number, _len: number): number => unavailable();
export const engine_output_ptr = (): number => unavailable();
