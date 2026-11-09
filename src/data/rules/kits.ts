// Стартовые наборы по ступеням (решение владельца 09.11.2026): скромно, но по уровню.
// Описания предметов — своими словами. Числовые эффекты учитывает лист героя (lib/creation.ts).
//
// Ступень 1–3: набор класса и предыстории; со 2 уровня +1 зелье лечения и +20 зм за уровень.
// Ступень 4–6: броня на ступень лучше, 2 зелья, 1 простой предмет, 100 зм + 25 зм за уровень.
// Ступень 7–9: лучшая обычная броня по владению, 3 зелья и большое зелье, простой и
//              необычный предметы, 300 зм + 50 зм за уровень.

export type KitEffect =
  | "weapon_plus1"
  | "armor_plus1"
  | "shield_plus1"
  | "cloak_protection"
  | "wand_war_mage"
  | "rod_pact_keeper"
  | "amulet_devout"
  | "moon_sickle"
  | "bracers_archery"
  | "boots_elvenkind"
  | "gloves_thievery"
  | "none";

export interface KitItem {
  id: string;
  name: string;
  rarity: "common" | "uncommon";
  text: string;
  effect: KitEffect;
  /** Требуется настройка. */
  attunement?: boolean;
  /** Нужно выбрать оружие из набора. */
  needsWeapon?: boolean;
  /** Нужен доспех или щит в наборе. */
  needs?: "armor" | "shield";
}

export const COMMON_ITEMS: KitItem[] = [
  { id: "moon_touched", name: "Оружие, тронутое луной", rarity: "common", effect: "none", needsWeapon: true, text: "Обнажённое в темноте, светится лунным светом: яркий свет 15 фт и тусклый ещё 15 фт. Считается магическим оружием." },
  { id: "armor_gleaming", name: "Сияющий доспех", rarity: "common", effect: "none", needs: "armor", text: "Доспех никогда не пачкается и не тускнеет, всегда выглядит начищенным." },
  { id: "shield_expression", name: "Щит самовыражения", rarity: "common", effect: "none", needs: "shield", text: "На щите нарисовано лицо, которое меняет выражение по желанию владельца (бонусным действием)." },
  { id: "ruby_war_mage", name: "Рубин боевого мага", rarity: "common", effect: "none", needsWeapon: true, text: "Камень, вделанный в оружие: оно становится магической фокусировкой для заклинаний." },
  { id: "candle_deep", name: "Свеча глубин", rarity: "common", effect: "none", text: "Пламя свечи не гаснет под водой; горит 1 час, давая свет 5 фт." },
  { id: "hat_wizardry", name: "Шляпа волшебства", rarity: "common", effect: "none", attunement: true, text: "Магическая фокусировка волшебника. Раз в день можно попытаться сотворить незнакомый заговор волшебника (проверка Магии КС 10)." },
  { id: "instrument_illusions", name: "Инструмент иллюзий", rarity: "common", effect: "none", attunement: true, text: "Пока на нём играют, вокруг возникают безобидные иллюзорные образы (бабочки, искры, огоньки) в радиусе 15 фт." },
  { id: "mystery_key", name: "Ключ-загадка", rarity: "common", effect: "none", text: "Ключ с вопросительным знаком: с шансом 5% открывает любой замок, после чего исчезает." },
];

export const UNCOMMON_ITEMS: KitItem[] = [
  { id: "weapon_plus1", name: "Оружие +1", rarity: "uncommon", effect: "weapon_plus1", needsWeapon: true, text: "+1 к броскам атаки и урона этим оружием." },
  { id: "armor_plus1", name: "Доспех +1", rarity: "uncommon", effect: "armor_plus1", needs: "armor", text: "+1 к КД, пока доспех надет." },
  { id: "shield_plus1", name: "Щит +1", rarity: "uncommon", effect: "shield_plus1", needs: "shield", text: "+1 к КД сверх обычного бонуса щита." },
  { id: "cloak_protection", name: "Плащ защиты", rarity: "uncommon", effect: "cloak_protection", attunement: true, text: "+1 к КД и ко всем спасброскам." },
  { id: "wand_war_mage", name: "Палочка боевого мага +1", rarity: "uncommon", effect: "wand_war_mage", attunement: true, text: "+1 к броскам атаки заклинаниями; атаки заклинаниями игнорируют укрытие на половину." },
  { id: "rod_pact_keeper", name: "Жезл хранителя договора +1", rarity: "uncommon", effect: "rod_pact_keeper", attunement: true, text: "+1 к атакам заклинаниями колдуна и к КС их спасбросков. Раз в длительный отдых — восстановить одну ячейку договора." },
  { id: "amulet_devout", name: "Амулет набожного +1", rarity: "uncommon", effect: "amulet_devout", attunement: true, text: "Священный символ: +1 к атакам заклинаниями и к КС спасбросков жреца или паладина." },
  { id: "moon_sickle", name: "Лунный серп +1", rarity: "uncommon", effect: "moon_sickle", attunement: true, text: "Серп +1 и фокусировка друида или следопыта: +1 к атакам заклинаниями и КС; лечебные заклинания восстанавливают дополнительно 1d4." },
  { id: "bracers_archery", name: "Наручи стрелка", rarity: "uncommon", effect: "bracers_archery", attunement: true, text: "Владение длинным и коротким луком; +2 к урону атак луком." },
  { id: "boots_elvenkind", name: "Сапоги эльфов", rarity: "uncommon", effect: "boots_elvenkind", text: "Шаги бесшумны: преимущество на проверки Ловкости (Скрытность), связанные с бесшумным передвижением." },
  { id: "gloves_thievery", name: "Перчатки вора", rarity: "uncommon", effect: "gloves_thievery", text: "Невидимы на руках; +5 к проверкам Ловкости рук и к проверкам вскрытия замков." },
  { id: "bag_of_holding", name: "Сумка хранения", rarity: "uncommon", effect: "none", text: "Внутри больше, чем снаружи: до 500 фунтов и 64 кубических футов, весит всегда 15 фунтов." },
];

/** Простые предметы по классу. */
export const COMMON_BY_CLASS: Record<string, string[]> = {
  barbarian: ["moon_touched", "candle_deep"],
  fighter: ["moon_touched", "armor_gleaming", "shield_expression"],
  paladin: ["moon_touched", "armor_gleaming", "shield_expression"],
  ranger: ["moon_touched", "armor_gleaming", "candle_deep"],
  monk: ["moon_touched", "candle_deep"],
  rogue: ["mystery_key", "moon_touched", "candle_deep"],
  bard: ["instrument_illusions", "ruby_war_mage", "candle_deep"],
  cleric: ["ruby_war_mage", "armor_gleaming", "candle_deep"],
  druid: ["ruby_war_mage", "candle_deep"],
  sorcerer: ["ruby_war_mage", "candle_deep"],
  warlock: ["ruby_war_mage", "candle_deep"],
  wizard: ["hat_wizardry", "ruby_war_mage", "candle_deep"],
};

/** Необычные предметы по классу (сумка хранения доступна всем). */
export const UNCOMMON_BY_CLASS: Record<string, string[]> = {
  barbarian: ["weapon_plus1", "cloak_protection"],
  fighter: ["weapon_plus1", "armor_plus1", "shield_plus1", "bracers_archery"],
  paladin: ["weapon_plus1", "shield_plus1", "amulet_devout"],
  ranger: ["weapon_plus1", "bracers_archery", "moon_sickle"],
  monk: ["weapon_plus1", "cloak_protection"],
  rogue: ["weapon_plus1", "boots_elvenkind", "gloves_thievery"],
  bard: ["wand_war_mage", "cloak_protection"],
  sorcerer: ["wand_war_mage", "cloak_protection"],
  wizard: ["wand_war_mage", "cloak_protection"],
  cleric: ["amulet_devout", "shield_plus1"],
  druid: ["moon_sickle", "cloak_protection"],
  warlock: ["rod_pact_keeper", "wand_war_mage"],
};

export const KIT_ITEM_BY_ID = new Map([...COMMON_ITEMS, ...UNCOMMON_ITEMS].map((i) => [i.id, i]));

/** Броня ступени 4–6: на ступень лучше той, что в наборе класса. */
export const ARMOR_UPGRADE_T2: Record<string, string> = {
  "Кожаный доспех": "Проклёпанный кожаный доспех",
  "Кольчужная рубаха": "Кираса",
  "Чешуйчатый доспех": "Кираса",
  "Кольчуга": "Наборный доспех",
};

/** Броня ступени 7–9: лучшая обычная броня того же типа. */
export const ARMOR_BEST: Record<"light" | "medium" | "heavy", string> = {
  light: "Проклёпанный кожаный доспех",
  medium: "Полулаты",
  heavy: "Латы",
};
