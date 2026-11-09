// Общие справочные данные: характеристики, навыки, языки, оружие, доспехи, опыт.

import type { AbilityId, ArmorData, SkillId, WeaponData } from "./types";

export const ABILITIES: { id: AbilityId; name: string; short: string }[] = [
  { id: "strength", name: "Сила", short: "СИЛ" },
  { id: "dexterity", name: "Ловкость", short: "ЛОВ" },
  { id: "constitution", name: "Телосложение", short: "ТЕЛ" },
  { id: "intelligence", name: "Интеллект", short: "ИНТ" },
  { id: "wisdom", name: "Мудрость", short: "МДР" },
  { id: "charisma", name: "Харизма", short: "ХАР" },
];

export const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name])) as Record<AbilityId, string>;
export const ABILITY_SHORT = Object.fromEntries(ABILITIES.map((a) => [a.id, a.short])) as Record<AbilityId, string>;

export const SKILLS: { id: SkillId; name: string; ability: AbilityId }[] = [
  { id: "athletics", name: "Атлетика", ability: "strength" },
  { id: "acrobatics", name: "Акробатика", ability: "dexterity" },
  { id: "sleight_of_hand", name: "Ловкость рук", ability: "dexterity" },
  { id: "stealth", name: "Скрытность", ability: "dexterity" },
  { id: "arcana", name: "Магия", ability: "intelligence" },
  { id: "history", name: "История", ability: "intelligence" },
  { id: "investigation", name: "Анализ", ability: "intelligence" },
  { id: "nature", name: "Природа", ability: "intelligence" },
  { id: "religion", name: "Религия", ability: "intelligence" },
  { id: "animal_handling", name: "Уход за животными", ability: "wisdom" },
  { id: "insight", name: "Проницательность", ability: "wisdom" },
  { id: "medicine", name: "Медицина", ability: "wisdom" },
  { id: "perception", name: "Внимательность", ability: "wisdom" },
  { id: "survival", name: "Выживание", ability: "wisdom" },
  { id: "deception", name: "Обман", ability: "charisma" },
  { id: "intimidation", name: "Запугивание", ability: "charisma" },
  { id: "performance", name: "Выступление", ability: "charisma" },
  { id: "persuasion", name: "Убеждение", ability: "charisma" },
];

export const SKILL_NAME = Object.fromEntries(SKILLS.map((s) => [s.id, s.name])) as Record<SkillId, string>;

export const STANDARD_LANGUAGES = [
  "Общий жестовый",
  "Драконий",
  "Дварфийский",
  "Эльфийский",
  "Великаний",
  "Гномий",
  "Гоблинский",
  "Язык полуросликов",
  "Орочий",
];

export const RARE_LANGUAGES = [
  "Бездны",
  "Небесный",
  "Глубинная речь",
  "Друидский",
  "Инфернальный",
  "Первичный",
  "Сильван",
  "Воровской жаргон",
  "Подземный",
];

export const ARTISAN_TOOLS = [
  "Инструменты алхимика",
  "Инструменты пивовара",
  "Инструменты каллиграфа",
  "Инструменты плотника",
  "Инструменты картографа",
  "Инструменты сапожника",
  "Инструменты повара",
  "Инструменты стеклодува",
  "Инструменты ювелира",
  "Инструменты кожевника",
  "Инструменты каменщика",
  "Инструменты художника",
  "Инструменты гончара",
  "Инструменты кузнеца",
  "Инструменты жестянщика",
  "Инструменты ткача",
  "Инструменты резчика по дереву",
];

export const GAMING_SETS = ["Кости", "Шахматы драконов", "Карты", "Ставка трёх драконов"];

export const MUSICAL_INSTRUMENTS = [
  "Волынка",
  "Барабан",
  "Цимбалы",
  "Флейта",
  "Рожок",
  "Лютня",
  "Лира",
  "Свирель",
  "Шалмей",
  "Виола",
];

export const OTHER_TOOLS = [
  "Набор для маскировки",
  "Набор для фальсификации",
  "Набор травника",
  "Навигационные инструменты",
  "Набор отравителя",
  "Воровские инструменты",
];

export const ALIGNMENTS = [
  "Законопослушный добрый",
  "Нейтральный добрый",
  "Хаотичный добрый",
  "Законопослушный нейтральный",
  "Нейтральный",
  "Хаотичный нейтральный",
  "Законопослушный злой",
  "Нейтральный злой",
  "Хаотичный злой",
];

/** Краткое описание мировоззрений (своими словами). */
export const ALIGNMENT_TEXT: Record<string, string> = {
  "Законопослушный добрый": "Поступает правильно, как того ждут порядок и долг: защищает слабых, держит слово.",
  "Нейтральный добрый": "Помогает другим как может, не держась ни за законы, ни за бунт против них.",
  "Хаотичный добрый": "Делает добро по велению сердца, не оглядываясь на правила и чужие ожидания.",
  "Законопослушный нейтральный": "Следует закону, традиции или личному кодексу превыше добра и зла.",
  "Нейтральный": "Избегает крайностей и чужих споров, поступает так, как кажется разумным сейчас.",
  "Хаотичный нейтральный": "Ценит свободу и собственные прихоти выше правил и чужого блага.",
  "Законопослушный злой": "Берёт своё методично, в рамках порядка, кодекса или иерархии.",
  "Нейтральный злой": "Делает что угодно ради своей выгоды, без жалости и без принципов.",
  "Хаотичный злой": "Жесток и своеволен, движим злобой, жаждой крови или жадностью.",
};

/** Опыт для каждого уровня 1–20. */
export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000,
  265000, 305000, 355000,
];

/** Бонус мастерства по уровню персонажа. */
export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4);
}

export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Покупка характеристик: стоимость значений 8–15, всего 27 очков. */
export const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const POINT_BUY_TOTAL = 27;
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const MASTERY: Record<string, { name: string; text: string }> = {
  cleave: { name: "Рассечение", text: "Попав рукопашной атакой, можно раз в ход атаковать тем же оружием второе существо в 5 фт от первой цели; урон без модификатора характеристики (если он положительный)." },
  graze: { name: "Задевание", text: "При промахе цель всё равно получает урон, равный модификатору характеристики атаки." },
  nick: { name: "Надрез", text: "Дополнительная атака лёгким оружием делается в рамках действия Атака, а не бонусным действием (раз в ход)." },
  push: { name: "Толчок", text: "При попадании можно оттолкнуть существо Большого размера или меньше на 10 фт от себя." },
  sap: { name: "Ослабление", text: "При попадании цель совершает следующий бросок атаки до начала вашего хода с помехой." },
  slow: { name: "Замедление", text: "При попадании и уроне скорость цели уменьшается на 10 фт до начала вашего следующего хода." },
  topple: { name: "Опрокидывание", text: "При попадании цель спасается Телосложением (КС 8 + модификатор атаки + бонус мастерства) или падает ничком." },
  vex: { name: "Изматывание", text: "При попадании и уроне ваш следующий бросок атаки по этой цели до конца следующего хода — с преимуществом." },
};

const w = (
  id: string,
  name: string,
  category: "simple" | "martial",
  ranged: boolean,
  damage: string,
  damageType: string,
  properties: string[],
  mastery: string,
  range?: string,
): WeaponData => ({ id, name, category, ranged, damage, damageType, properties, mastery, range });

export const WEAPONS: WeaponData[] = [
  w("club", "Дубинка", "simple", false, "1d4", "дробящий", ["лёгкое"], "slow"),
  w("dagger", "Кинжал", "simple", false, "1d4", "колющий", ["фехтовальное", "лёгкое", "метательное"], "nick", "20/60 фт"),
  w("greatclub", "Палица", "simple", false, "1d8", "дробящий", ["двуручное"], "push"),
  w("handaxe", "Ручной топор", "simple", false, "1d6", "рубящий", ["лёгкое", "метательное"], "vex", "20/60 фт"),
  w("javelin", "Метательное копьё", "simple", false, "1d6", "колющий", ["метательное"], "slow", "30/120 фт"),
  w("light_hammer", "Лёгкий молот", "simple", false, "1d4", "дробящий", ["лёгкое", "метательное"], "nick", "20/60 фт"),
  w("mace", "Булава", "simple", false, "1d6", "дробящий", [], "sap"),
  w("quarterstaff", "Боевой посох", "simple", false, "1d6", "дробящий", ["универсальное (1d8)"], "topple"),
  w("sickle", "Серп", "simple", false, "1d4", "рубящий", ["лёгкое"], "nick"),
  w("spear", "Копьё", "simple", false, "1d6", "колющий", ["метательное", "универсальное (1d8)"], "sap", "20/60 фт"),
  w("dart", "Дротик", "simple", true, "1d4", "колющий", ["фехтовальное", "метательное"], "vex", "20/60 фт"),
  w("light_crossbow", "Лёгкий арбалет", "simple", true, "1d8", "колющий", ["боеприпасы", "перезарядка", "двуручное"], "slow", "80/320 фт"),
  w("shortbow", "Короткий лук", "simple", true, "1d6", "колющий", ["боеприпасы", "двуручное"], "vex", "80/320 фт"),
  w("sling", "Праща", "simple", true, "1d4", "дробящий", ["боеприпасы"], "slow", "30/120 фт"),
  w("battleaxe", "Боевой топор", "martial", false, "1d8", "рубящий", ["универсальное (1d10)"], "topple"),
  w("flail", "Цеп", "martial", false, "1d8", "дробящий", [], "sap"),
  w("glaive", "Глефа", "martial", false, "1d10", "рубящий", ["тяжёлое", "досягаемость", "двуручное"], "graze"),
  w("greataxe", "Секира", "martial", false, "1d12", "рубящий", ["тяжёлое", "двуручное"], "cleave"),
  w("greatsword", "Двуручный меч", "martial", false, "2d6", "рубящий", ["тяжёлое", "двуручное"], "graze"),
  w("halberd", "Алебарда", "martial", false, "1d10", "рубящий", ["тяжёлое", "досягаемость", "двуручное"], "cleave"),
  w("lance", "Кавалерийское копьё", "martial", false, "1d10", "колющий", ["тяжёлое", "досягаемость", "двуручное (если не верхом)"], "topple"),
  w("longsword", "Длинный меч", "martial", false, "1d8", "рубящий", ["универсальное (1d10)"], "sap"),
  w("maul", "Молот", "martial", false, "2d6", "дробящий", ["тяжёлое", "двуручное"], "topple"),
  w("morningstar", "Моргенштерн", "martial", false, "1d8", "колющий", [], "sap"),
  w("pike", "Пика", "martial", false, "1d10", "колющий", ["тяжёлое", "досягаемость", "двуручное"], "push"),
  w("rapier", "Рапира", "martial", false, "1d8", "колющий", ["фехтовальное"], "vex"),
  w("scimitar", "Скимитар", "martial", false, "1d6", "рубящий", ["фехтовальное", "лёгкое"], "nick"),
  w("shortsword", "Короткий меч", "martial", false, "1d6", "колющий", ["фехтовальное", "лёгкое"], "vex"),
  w("trident", "Трезубец", "martial", false, "1d8", "колющий", ["метательное", "универсальное (1d10)"], "topple", "20/60 фт"),
  w("warhammer", "Боевой молот", "martial", false, "1d8", "дробящий", ["универсальное (1d10)"], "push"),
  w("war_pick", "Боевая кирка", "martial", false, "1d8", "колющий", ["универсальное (1d10)"], "sap"),
  w("whip", "Кнут", "martial", false, "1d4", "рубящий", ["фехтовальное", "досягаемость"], "slow"),
  w("blowgun", "Духовая трубка", "martial", true, "1", "колющий", ["боеприпасы", "перезарядка"], "vex", "25/100 фт"),
  w("hand_crossbow", "Ручной арбалет", "martial", true, "1d6", "колющий", ["боеприпасы", "лёгкое", "перезарядка"], "vex", "30/120 фт"),
  w("heavy_crossbow", "Тяжёлый арбалет", "martial", true, "1d10", "колющий", ["боеприпасы", "тяжёлое", "перезарядка", "двуручное"], "push", "100/400 фт"),
  w("longbow", "Длинный лук", "martial", true, "1d8", "колющий", ["боеприпасы", "тяжёлое", "двуручное"], "slow", "150/600 фт"),
  w("musket", "Мушкет", "martial", true, "1d12", "колющий", ["боеприпасы", "перезарядка", "двуручное"], "slow", "40/120 фт"),
  w("pistol", "Пистоль", "martial", true, "1d10", "колющий", ["боеприпасы", "перезарядка"], "vex", "30/90 фт"),
];

export const WEAPON_BY_NAME = new Map(WEAPONS.map((x) => [x.name, x]));

export const ARMOR: ArmorData[] = [
  { id: "padded", name: "Стёганый доспех", type: "light", ac: 11, dex: "all", stealthDisadvantage: true },
  { id: "leather", name: "Кожаный доспех", type: "light", ac: 11, dex: "all" },
  { id: "studded_leather", name: "Проклёпанный кожаный доспех", type: "light", ac: 12, dex: "all" },
  { id: "hide", name: "Шкурный доспех", type: "medium", ac: 12, dex: 2 },
  { id: "chain_shirt", name: "Кольчужная рубаха", type: "medium", ac: 13, dex: 2 },
  { id: "scale_mail", name: "Чешуйчатый доспех", type: "medium", ac: 14, dex: 2, stealthDisadvantage: true },
  { id: "breastplate", name: "Кираса", type: "medium", ac: 14, dex: 2 },
  { id: "half_plate", name: "Полулаты", type: "medium", ac: 15, dex: 2, stealthDisadvantage: true },
  { id: "ring_mail", name: "Колечный доспех", type: "heavy", ac: 14, dex: 0, stealthDisadvantage: true },
  { id: "chain_mail", name: "Кольчуга", type: "heavy", ac: 16, dex: 0, strength: 13, stealthDisadvantage: true },
  { id: "splint", name: "Наборный доспех", type: "heavy", ac: 17, dex: 0, strength: 15, stealthDisadvantage: true },
  { id: "plate", name: "Латы", type: "heavy", ac: 18, dex: 0, strength: 15, stealthDisadvantage: true },
  { id: "shield", name: "Щит", type: "shield", ac: 2, dex: 0 },
];

export const ARMOR_BY_NAME = new Map(ARMOR.map((x) => [x.name, x]));

/** Атрибуция SRD 5.2.1 (обязательна при показе текстов SRD). */
export const SRD52_ATTRIBUTION =
  "Содержит материалы System Reference Document 5.2.1 © Wizards of the Coast LLC, лицензия CC-BY-4.0. " +
  "Варианты Книги игрока 2024 года, которых нет в SRD, описаны своими словами.";
