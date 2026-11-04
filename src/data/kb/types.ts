// Структура базы знаний.
//
// Три слоя, как в архитектуре:
// - «Мир» — общее для всех кампаний: лор, локации, NPC, фракции, артефакты, правила, карты;
// - «Игрок» — то, что знает герой: цели, личины, пароли, известные NPC, хроника, заметки;
// - «Мастер» — тайны, планы, угрозы, расписание, пленники, журнал импровизаций.
//
// Карточка одна для всех разделов: краткое описание для списка, факты «поле — значение»,
// подробные разделы текста, связи с другими карточками и источник сведений.

export type KbLayer = "world" | "player" | "master";

/** Состояние сущности — показывается значком на карточке. */
export type KbStatus =
  | "active"
  | "ally"
  | "vassal"
  | "neutral"
  | "watch"
  | "enemy"
  | "prisoner"
  | "dead"
  | "open"
  | "progress"
  | "done"
  | "failed"
  | "planned";

/** Раскрытие тайны (слой мастера). */
export type KbReveal = "hidden" | "hint" | "revealed";

export interface KbFact {
  label: string;
  value: string;
}

export interface KbBlock {
  heading?: string;
  paragraphs: string[];
}

export interface KbEntry {
  id: string;
  layer: KbLayer;
  /** Раздел внутри слоя (id из списка разделов слоя). */
  section: string;
  /** Подраздел — группировка внутри раздела. */
  group: string;
  title: string;
  /** Короткая строка под заголовком: роль, расстояние, тип. */
  subtitle?: string;
  /** Одно-два предложения для списка. */
  summary: string;
  status?: KbStatus;
  /** Подпись к статусу, если стандартной мало: «под надзором Юссача». */
  statusNote?: string;
  facts?: KbFact[];
  body?: KbBlock[];
  tags?: string[];
  /** ID связанных карточек (из любого слоя). */
  related?: string[];
  /** Откуда сведения: документ и день кампании. */
  source?: string;
  /** Внешняя ссылка (карты на Google Диске). */
  link?: string;
  /** Тайна: степень раскрытия игроку. */
  reveal?: KbReveal;
  /** Черновик мастера, ещё не утверждённый гейм-мастером. */
  draft?: boolean;
}

export interface KbSection {
  id: string;
  title: string;
  description: string;
}

export interface KbLayerInfo {
  id: KbLayer;
  title: string;
  description: string;
  sections: KbSection[];
}

export const STATUS_LABEL: Record<KbStatus, string> = {
  active: "активен",
  ally: "союзник",
  vassal: "вассал",
  neutral: "нейтрален",
  watch: "под наблюдением",
  enemy: "враг",
  prisoner: "в плену",
  dead: "мёртв",
  open: "открыто",
  progress: "в процессе",
  done: "выполнено",
  failed: "провалено",
  planned: "запланировано",
};

export const REVEAL_LABEL: Record<KbReveal, string> = {
  hidden: "скрыто от игрока",
  hint: "игрок получил намёк",
  revealed: "раскрыто",
};
