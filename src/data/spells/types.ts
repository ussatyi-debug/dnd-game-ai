/** Заклинание каталога (интерфейс и ИИ-мастер). Механику проверяет движок. */
export interface SpellData {
  /** ID, общий с движком: `fireball`, `armor-of-agathys`. */
  id: string;
  name: string;
  nameEn: string;
  /** 0 — заговор. */
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  ritual: boolean;
  concentration: boolean;
  /** ID классов, в списках которых есть заклинание: `cleric`, `warlock`… */
  classes: string[];
  desc: string[];
  higher: string[];
  source: "srd" | "custom";
  sourceNote: string;
}
