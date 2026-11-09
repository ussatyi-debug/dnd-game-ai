// Портреты героев: один на сочетание «вид × пол». Нет файла — силуэт-заглушка на листе.

const files = import.meta.glob("../../assets/portraits/*.webp", { eager: true, import: "default" }) as Record<
  string,
  string
>;

export type Gender = "m" | "f";

const BY_KEY: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const key = path.split("/").pop()?.replace(".webp", "");
  if (key) BY_KEY[key] = url;
}

/** Ключ портрета: `elf-f`. */
export function portraitKey(species: string, gender: Gender): string {
  return `${species}-${gender}`;
}

/** URL портрета или `null`, если для сочетания портрета пока нет. */
export function portraitUrl(key: string): string | null {
  return BY_KEY[key] ?? null;
}
