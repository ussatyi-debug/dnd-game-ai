// Проверка мастера создания: для каждого класса, вида и предыстории на разных уровнях
// черновик заполняется автоматически, собирается лист героя, и (если собран веб-движок)
// лист проверяет движок — так же, как при нажатии «Подтвердить и начать приключение».
// Запуск: node --experimental-strip-types scripts/test-creation.ts

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { BACKGROUNDS } from "../src/data/rules/backgrounds.ts";
import { CLASSES } from "../src/data/rules/classes/index.ts";
import { FEATS } from "../src/data/rules/feats.ts";
import { SPECIES } from "../src/data/rules/species.ts";
import {
  buildSpec,
  choiceSlots,
  featOptions,
  featSlots,
  levelUpDraft,
  maxHp,
  newDraft,
  pointsSpent,
  slotFeat,
  spellChoices,
  stepIssues,
  STEPS,
  type Draft,
} from "../src/lib/creation.ts";
import { QUICK_HEROES, quickDraft } from "../src/lib/quickstart.ts";

/** Заполняет черновик первыми подходящими вариантами (несколько проходов — выборы зависят друг от друга). */
function autofill(d: Draft, seed: number): void {
  for (let pass = 0; pass < 4; pass++) {
    const species = SPECIES.find((s) => s.id === d.speciesId);
    if (species?.lineage) d.picks["species.lineage"] = [species.lineage.options[seed % species.lineage.options.length]!.id];
    if (species?.lineage?.spellAbilityChoice) d.picks["species.ability"] = ["charisma"];
    d.picks["bg.mode"] = [seed % 2 ? "1-1-1" : "2-1"];
    const bg = BACKGROUNDS.find((b) => b.id === d.backgroundId)!;
    d.picks["bg.plus2"] = [bg.abilities[0]];
    d.picks["bg.plus1"] = [bg.abilities[1]];
    if (bg.tool.startsWith("choice:")) d.picks["bg.tool"] = ["Кости"];
    const cls = CLASSES.find((c) => c.id === d.classId)!;
    if (d.level >= cls.subclassLevel) d.picks["class.subclass"] = [cls.subclasses[0]!.id];
    for (const slot of featSlots(d)) {
      if (slot.fixed) {
        if (slot.fixed === "magic_initiate") d.picks[`${slot.key}:mi.ability`] = ["wisdom"];
        continue;
      }
      if (!slotFeat(d, slot)) {
        const options = featOptions(d, slot);
        const feat = options[(seed + slot.key.length) % options.length]!;
        d.picks[slot.key] = [feat.id];
      }
      const feat = slotFeat(d, slot)!;
      if (feat.abilityIncrease) {
        d.picks[`${slot.key}:abilities`] =
          feat.id === "ability_score_improvement"
            ? [cls.primary[0]!, cls.primary[0]!]
            : [feat.abilityIncrease[0]!];
      }
      if (feat.id === "magic_initiate") d.picks[`${slot.key}:mi.ability`] = ["intelligence"];
    }
    // Дважды: выбор предмета набора открывает выбор оружия для него.
    for (const c of [...choiceSlots(d), ...choiceSlots(d)]) {
      if (d.picks[c.key]?.length === c.count) continue;
      const taken = new Set(Object.entries(d.picks).filter(([k]) => k !== c.key).flatMap(([, v]) => v));
      const open = c.options.filter((o) => !o.disabled);
      const fresh = open.filter((o) => !taken.has(o.id));
      const pool = fresh.length >= c.count ? fresh : open;
      d.picks[c.key] = pool.slice(0, c.count).map((o) => o.id);
    }
    for (const c of spellChoices(d)) {
      const others = new Set(
        Object.entries(d.picks)
          .filter(([k]) => k.startsWith("spells.") && k !== c.key && k !== "spells.list" && k !== "spells.book")
          .flatMap(([, v]) => v),
      );
      d.picks[c.key] = c.options.filter((s) => !others.has(s.id)).slice(0, c.count).map((s) => s.id);
    }
  }
  d.base = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };
  d.name = "Проба";
  d.alignment = "Нейтральный";
}

type Engine = { call<T>(req: Record<string, unknown>): T };
let engine: Engine | null = null;
if (existsSync(new URL("../src/generated/engine-web.js", import.meta.url))) {
  const generated = await import("../src/generated/engine-web.js");
  const { createWebEngine } = await import("../src/lib/webBridge.ts");
  engine = createWebEngine(generated as never, [3, 9]) as Engine;
}

assert.equal(pointsSpent({ strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 }), 27);
assert.ok(FEATS.some((f) => f.id === "ability_score_improvement"));

let built = 0;
const failures: string[] = [];
CLASSES.forEach((cls, ci) => {
  for (const level of [1, 2, 3, 4, 5, 8, 9, 11, 15]) {
    const seed = ci + level;
    const d = newDraft();
    d.level = level;
    d.tier = level <= 3 ? 1 : level <= 6 ? 2 : 3;
    d.classId = cls.id;
    d.speciesId = SPECIES[seed % SPECIES.length]!.id;
    d.backgroundId = BACKGROUNDS[seed % BACKGROUNDS.length]!.id;
    d.hpMode = "average";
    autofill(d, seed);
    const label = `${cls.name} ${level} (${d.speciesId}, ${d.backgroundId})`;
    for (const step of STEPS) {
      if (step.id === "sheet") continue;
      const issues = stepIssues(d, step.id);
      if (issues.length) failures.push(`${label} / ${step.title}: ${issues.join("; ")}`);
    }
    const spec = buildSpec(d);
    assert.ok(maxHp(d) >= level, `${label}: хиты`);
    assert.equal(spec.classes[0]?.level, level);
    if (d.tier === 3) {
      assert.ok(spec.items.some((i) => i.name === "Большое зелье лечения"), `${label}: набор ступени 3`);
      assert.ok(spec.items.filter((i) => i.category === "Магические предметы").length >= 1, `${label}: магический предмет`);
    }
    if (engine) {
      const errors = engine.call<string[]>({ cmd: "validate_hero", spec });
      if (errors.length) failures.push(`${label} / движок: ${errors.join("; ")}`);
    }
    built++;
  }
});

if (engine) {
  const d = newDraft();
  d.classId = "wizard";
  d.speciesId = "elf";
  d.backgroundId = "sage";
  d.level = 3;
  autofill(d, 1);
  const spec = buildSpec(d);
  const party = engine.call<{ members: { id: string }[] }>({
    cmd: "start_campaign",
    campaign: { id: "camp-test", title: "Проба", heroes: [spec] },
    scene: { day: 30, time: null, location: "Перекрёсток", situation: "", mood: "calm" },
    gold: 40,
  });
  assert.equal(party.members.length, 1);
  const sheet = engine.call<{ name: string; level: number }>({ cmd: "character_sheet", id: "pc.hero" });
  assert.equal(sheet.level, 3);
  const save = engine.call<{ campaign: { id: string } | null }>({ cmd: "save_state" });
  assert.equal(save.campaign?.id, "camp-test");
  engine.call({ cmd: "restart_demo" });
  const nikis = engine.call<{ name: string }>({ cmd: "character_sheet", id: "pc.nikis" });
  assert.equal(nikis.name, "Сэр Никис Стрэндж");
}

// Быстрый старт: готовые герои проходят все шаги мастера и проверку движком.
for (const h of QUICK_HEROES) {
  const d = quickDraft(h);
  const label = `Быстрый старт: ${h.name}`;
  for (const step of STEPS) {
    if (step.id === "sheet") continue;
    const issues = stepIssues(d, step.id);
    if (issues.length) failures.push(`${label} / ${step.title}: ${issues.join("; ")}`);
  }
  const spec = buildSpec(d);
  assert.equal(spec.classes[0]?.level, h.level, `${label}: уровень`);
  assert.equal(spec.classes[0]?.subclass ? true : false, true, `${label}: подкласс`);
  const spellNames = spec.casters.flatMap((c) => (c as { spells?: { name: string }[] }).spells?.map((s) => s.name) ?? []);
  console.log(`${label}: хиты ${maxHp(d)}, КД ${spec.armor_class}${spellNames.length ? `, заклинания: ${spellNames.join(", ")}` : ""}`);
  if (engine) {
    const errors = engine.call<string[]>({ cmd: "validate_hero", spec });
    if (errors.length) failures.push(`${label} / движок: ${errors.join("; ")}`);
  }

  // Повышение уровня: прежние выборы и хиты сохранены, уровень +1.
  const up = levelUpDraft(spec);
  assert.equal(up.fromSheet, false, `${label}: черновик в листе`);
  assert.equal(up.draft.level, h.level + 1, `${label}: уровень после повышения`);
  assert.equal(up.draft.hpRolls.length, h.level, `${label}: хиты по уровням`);
  const upSpec = buildSpec(up.draft);
  assert.ok(upSpec.hp.rolls.slice(0, h.level - 1).every((v, i) => v === spec.hp.rolls[i]), `${label}: хиты прошлых уровней`);
  console.log(`${label}: повышение до ${h.level + 1} — хиты ${maxHp(up.draft)}, требует выбора: ${STEPS.flatMap((s) => (s.id === "sheet" ? [] : stepIssues(up.draft, s.id))).join("; ") || "ничего"}`);
  built++;
}

if (failures.length) {
  console.error(failures.slice(0, 40).join("\n"));
  console.error(`Ошибок: ${failures.length}`);
  process.exit(1);
}
console.log(`Мастер создания: собрано ${built} героев${engine ? ", движок принял все листы" : " (без движка)"}`);
