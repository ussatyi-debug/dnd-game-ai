// Полузаклинатели: паладин и следопыт (SRD 5.2.1). По правилам 2024 года ячейки есть с 1 уровня.

import type { ClassData } from "../types";
import { ALL_CANTRIPS_ZERO, asi, PREPARED_HALF, steps } from "./helpers.ts";

const mastery = {
  id: "weapon_mastery",
  label: "Мастерство оружия",
  kind: "weapon_mastery" as const,
  count: 0,
  column: "Мастерство оружия",
};

export const PALADIN: ClassData = {
  id: "paladin",
  name: "Паладин",
  source: "srd",
  summary: "Священный воин клятвы: наложение рук, божественная кара и защитные ауры.",
  hitDie: 10,
  primary: ["strength", "charisma"],
  saves: ["wisdom", "charisma"],
  skills: { count: 2, from: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"] },
  armor: "Лёгкие, средние и тяжёлые доспехи, щиты",
  armorTraining: ["light", "medium", "heavy", "shield"],
  weapons: "Простое и воинское оружие",
  weaponTraining: ["simple", "martial"],
  equipment: { items: ["Кольчуга", "Щит", "Длинный меч", "6 метательных копий", "Священный символ", "Набор священника"], gold: 9, altGold: 150 },
  spellcasting: {
    ability: "charisma",
    progression: "half",
    preparation: "prepared",
    spellClass: "paladin",
    cantrips: ALL_CANTRIPS_ZERO,
    prepared: PREPARED_HALF,
  },
  columns: [
    { name: "Божественный канал", values: steps([[1, "—"], [3, 2], [11, 3]]) },
    { name: "Мастерство оружия", values: steps([[1, 2]]) },
  ],
  asiLevels: [4, 8, 12, 16, 19],
  subclassLevel: 3,
  multiclass: { abilities: ["strength", "charisma"] },
  features: [
    {
      level: 1,
      name: "Наложение рук",
      text: "Запас исцеления = 5 × уровень паладина, восстанавливается после длительного отдыха. Бонусным действием касанием восстанавливает хиты из запаса; за 5 очков снимает отравление.",
      resource: { id: "paladin.lay_on_hands", name: "Наложение рук", max: { perLevel: 5 }, recovery: "long" },
    },
    { level: 1, name: "Использование заклинаний", text: "Заклинания паладина, Харизма. Готовит заклинания после длительного отдыха; одно можно заменить." },
    { level: 1, name: "Мастерство оружия", text: "Свойства мастерства двух видов оружия; после длительного отдыха можно сменить.", choices: [mastery] },
    { level: 2, name: "Боевой стиль", text: "Талант боевого стиля или «Благословлённый воин».", choices: [{ id: "paladin.style", label: "Боевой стиль", kind: "feat", count: 1, from: ["fighting_style"] }] },
    { level: 2, name: "Кара паладина", text: "«Божественная кара» всегда подготовлена; раз в длительный отдых творится без ячейки." },
    {
      level: 3,
      name: "Божественный канал",
      text: "Божественное чувство: бонусным действием на 10 минут чувствует исчадий, небожителей и нежить в 60 фт. Одно применение — после короткого отдыха, все — после длительного. КС = 8 + ХАР + бонус мастерства.",
      resource: { id: "paladin.channel_divinity", name: "Божественный канал", max: { column: "Божественный канал" }, recovery: "short_one" },
    },
    ...asi([4, 8, 12]),
    { level: 5, name: "Дополнительная атака", text: "Две атаки вместо одной действием Атака." },
    { level: 5, name: "Верный скакун", text: "«Призыв скакуна» всегда подготовлен; раз в длительный отдых творится без ячейки." },
    { level: 6, name: "Аура защиты", text: "Аура 10 фт: паладин и союзники добавляют модификатор Харизмы (минимум +1) к спасброскам. Не работает, если паладин недееспособен." },
    { level: 9, name: "Отречение от врагов", text: "Божественным каналом: существа на выбор в 60 фт (столько, каков модификатор ХАР) — спасбросок Мудрости или испуг на минуту; испуганные могут либо двигаться, либо действовать." },
    { level: 10, name: "Аура отваги", text: "В ауре паладина он и союзники иммунны к испугу; испуг снимается при входе в ауру." },
    { level: 11, name: "Сияющие удары", text: "Попадания рукопашным оружием и безоружным ударом наносят дополнительно 1d8 урона излучением." },
    { level: 14, name: "Восстанавливающее касание", text: "Наложением рук за 5 очков за каждое снимает ослепление, очарование, оглушение, паралич, ошеломление или испуг." },
  ],
  subclasses: [
    {
      id: "devotion",
      name: "Клятва преданности",
      source: "srd",
      summary: "Идеал благородного рыцаря: честь, справедливость и защита слабых.",
      spells: {
        3: ["protection-from-evil-and-good", "shield-of-faith"],
        5: ["aid", "zone-of-truth"],
        9: ["beacon-of-hope", "dispel-magic"],
        13: ["freedom-of-movement", "guardian-of-faith"],
      },
      features: [
        { level: 3, name: "Заклинания клятвы", text: "Заклинания клятвы преданности всегда подготовлены." },
        { level: 3, name: "Священное оружие", text: "Действием Атака и божественным каналом на 10 минут: + модификатор ХАР к атакам оружием, урон можно сделать излучением, оружие даёт свет 20 фт." },
        { level: 7, name: "Аура преданности", text: "Паладин и союзники в ауре иммунны к очарованию." },
        { level: 15, name: "Кара защиты", text: "Творя «Божественную кару», паладин и союзники в ауре получают укрытие на половину до начала его следующего хода." },
      ],
    },
  ],
};

export const RANGER: ClassData = {
  id: "ranger",
  name: "Следопыт",
  source: "srd",
  summary: "Охотник и разведчик диких земель: метка охотника, природная магия и меткость.",
  hitDie: 10,
  primary: ["dexterity", "wisdom"],
  saves: ["strength", "dexterity"],
  skills: { count: 3, from: ["animal_handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"] },
  armor: "Лёгкие и средние доспехи, щиты",
  armorTraining: ["light", "medium", "shield"],
  weapons: "Простое и воинское оружие",
  weaponTraining: ["simple", "martial"],
  equipment: { items: ["Проклёпанный кожаный доспех", "Скимитар", "Короткий меч", "Длинный лук", "20 стрел", "Колчан", "Фокусировка друидов (омела)", "Набор путешественника"], gold: 7, altGold: 150 },
  spellcasting: {
    ability: "wisdom",
    progression: "half",
    preparation: "prepared",
    spellClass: "ranger",
    cantrips: ALL_CANTRIPS_ZERO,
    prepared: PREPARED_HALF,
  },
  columns: [
    { name: "Избранный враг", values: steps([[1, 2], [5, 3], [9, 4], [13, 5], [17, 6]]) },
    { name: "Мастерство оружия", values: steps([[1, 2]]) },
  ],
  asiLevels: [4, 8, 12, 16, 19],
  subclassLevel: 3,
  multiclass: { abilities: ["dexterity", "wisdom"] },
  features: [
    { level: 1, name: "Использование заклинаний", text: "Заклинания следопыта, Мудрость. Готовит заклинания после длительного отдыха; одно можно заменить." },
    {
      level: 1,
      name: "Избранный враг",
      text: "«Метка охотника» всегда подготовлена; творится без ячейки столько раз, сколько указано в таблице, на длительный отдых.",
      resource: { id: "ranger.favored_enemy", name: "Избранный враг", max: { column: "Избранный враг" }, recovery: "long" },
    },
    { level: 1, name: "Мастерство оружия", text: "Свойства мастерства двух видов оружия; после длительного отдыха можно сменить.", choices: [mastery] },
    {
      level: 2,
      name: "Ловкий исследователь",
      text: "Экспертиза в одном навыке, которым владеет; два языка на выбор.",
      choices: [
        { id: "ranger.deft_expertise", label: "Экспертиза", kind: "expertise", count: 1 },
        { id: "ranger.languages", label: "Языки", kind: "language", count: 2 },
      ],
    },
    { level: 2, name: "Боевой стиль", text: "Талант боевого стиля или «Воин-друид».", choices: [{ id: "ranger.style", label: "Боевой стиль", kind: "feat", count: 1, from: ["fighting_style"] }] },
    ...asi([4, 8, 12]),
    { level: 5, name: "Дополнительная атака", text: "Две атаки вместо одной действием Атака." },
    { level: 6, name: "Странник", text: "Скорость +10 фт без тяжёлого доспеха; скорость лазания и плавания равна скорости." },
    { level: 9, name: "Экспертиза", text: "Экспертиза в двух навыках, которыми владеет.", choices: [{ id: "ranger.expertise.9", label: "Экспертиза", kind: "expertise", count: 2 }] },
    { level: 10, name: "Неутомимый", text: "Действием Магия получает временные хиты 1d8 + МДР (минимум 1), раз на модификатор МДР за длительный отдых. После короткого отдыха истощение снижается на 1." },
    { level: 13, name: "Неотступный охотник", text: "Урон не нарушает концентрацию на «Метке охотника»." },
    { level: 14, name: "Покров природы", text: "Бонусным действием становится невидимым до конца следующего хода. Раз на модификатор МДР (минимум 1) за длительный отдых.", resource: { id: "ranger.natures_veil", name: "Покров природы", max: { ability: "wisdom", min: 1 }, recovery: "long" } },
  ],
  subclasses: [
    {
      id: "hunter",
      name: "Охотник",
      source: "srd",
      summary: "Защитник рубежей, специалист по опасной добыче.",
      features: [
        { level: 3, name: "Знание охотника", text: "Цель «Метки охотника» раскрывает свои иммунитеты, сопротивления и уязвимости." },
        {
          level: 3,
          name: "Добыча охотника",
          text: "Один вариант (после отдыха можно сменить).",
          choices: [{ id: "hunter.prey", label: "Добыча охотника", kind: "option", count: 1, options: [
            { id: "colossus_slayer", name: "Убийца колоссов", text: "Раз в ход +1d8 урона по раненой цели (хиты ниже максимума)." },
            { id: "horde_breaker", name: "Сокрушитель орды", text: "Раз в ход дополнительная атака тем же оружием по другому существу в 5 фт от цели." },
          ] }],
        },
        {
          level: 7,
          name: "Оборонительная тактика",
          text: "Один вариант (после отдыха можно сменить).",
          choices: [{ id: "hunter.defense", label: "Оборонительная тактика", kind: "option", count: 1, options: [
            { id: "escape_the_horde", name: "Уйти от орды", text: "Атаки по возможности по вам — с помехой." },
            { id: "multiattack_defense", name: "Защита от мультиатаки", text: "После попадания по вам следующие атаки того же существа в этот ход — с помехой." },
          ] }],
        },
        { level: 11, name: "Превосходная добыча охотника", text: "Раз в ход урон «Метки охотника» можно нанести и второму существу в 30 фт от первой цели." },
        { level: 15, name: "Превосходная защита охотника", text: "Реакцией на урон получает сопротивление этому урону до конца хода." },
      ],
    },
  ],
};
