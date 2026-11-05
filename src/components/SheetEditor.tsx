// Правка листа игроком. Правки ложатся отдельным слоем поверх листа приложения:
// у изменённого поля — пометка «изменено» и кнопка «как в приложении».

import { useState, type ReactNode } from "react";
import {
  editSheet,
  errorText,
  revertSheetEdit,
  type Ability,
  type AttackInput,
  type CharacterSheet,
  type ProficiencyLevel,
  type SheetDetails,
  type SheetEditInput,
} from "../lib/engine";
import { Block } from "./SheetSections";

const input =
  "rounded-md border border-edge bg-ink px-2 py-1 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";
const save = "rounded-md border border-gold/70 px-2 py-1 text-xs text-gold hover:bg-gold/10 disabled:opacity-40";

const ABILITIES: { id: Ability; label: string }[] = [
  { id: "strength", label: "СИЛ" },
  { id: "dexterity", label: "ЛОВ" },
  { id: "constitution", label: "ТЕЛ" },
  { id: "intelligence", label: "ИНТ" },
  { id: "wisdom", label: "МДР" },
  { id: "charisma", label: "ХАР" },
];

interface Ctx {
  id: string;
  edited: Set<string>;
  run: (edit: SheetEditInput) => Promise<void>;
  revert: (key: string) => Promise<void>;
}

function Edited({ ctx, k }: { ctx: Ctx; k: string }) {
  if (!ctx.edited.has(k)) return null;
  return (
    <span className="ml-1 text-[11px] text-arcane">
      изменено ·{" "}
      <button type="button" onClick={() => void ctx.revert(k)} className="underline hover:text-parchment">
        как в приложении
      </button>
    </span>
  );
}

function Row({ label, children, ctx, k }: { label: string; children: ReactNode; ctx: Ctx; k: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted">
        {label}
        <Edited ctx={ctx} k={k} />
      </div>
      <div className="flex flex-wrap items-start gap-2">{children}</div>
    </div>
  );
}

function TextField({ ctx, field, label, value, area = false }: { ctx: Ctx; field: string; label: string; value: string; area?: boolean }) {
  const [v, setV] = useState(value);
  return (
    <Row label={label} ctx={ctx} k={field}>
      {area ? (
        <textarea value={v} onChange={(e) => setV(e.target.value)} rows={3} className={`${input} min-w-0 flex-1`} aria-label={label} />
      ) : (
        <input value={v} onChange={(e) => setV(e.target.value)} className={`${input} min-w-0 flex-1`} aria-label={label} />
      )}
      <button type="button" disabled={v === value} onClick={() => void ctx.run({ op: "text", field, value: v })} className={save}>
        Сохранить
      </button>
    </Row>
  );
}

function NumberField({ ctx, field, label, value }: { ctx: Ctx; field: string; label: string; value: number | null }) {
  const [v, setV] = useState(value === null ? "" : String(value));
  return (
    <Row label={label} ctx={ctx} k={field}>
      <input type="number" value={v} onChange={(e) => setV(e.target.value)} className={`${input} w-28`} aria-label={label} />
      <button
        type="button"
        disabled={v === (value === null ? "" : String(value)) || v.trim() === ""}
        onClick={() => void ctx.run({ op: "number", field, value: Number(v) })}
        className={save}
      >
        Сохранить
      </button>
    </Row>
  );
}

function Abilities({ ctx, sheet, details }: { ctx: Ctx; sheet: CharacterSheet; details: SheetDetails }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ABILITIES.map((a) => {
        const line = sheet.abilities.find((x) => x.ability === a.id);
        const saveLine = details.saves.find((x) => x.ability === a.id);
        return (
          <AbilityRow key={a.id} ctx={ctx} ability={a.id} label={a.label} score={line?.score ?? 10} proficient={saveLine?.proficient ?? false} />
        );
      })}
    </div>
  );
}

function AbilityRow({ ctx, ability, label, score, proficient }: { ctx: Ctx; ability: Ability; label: string; score: number; proficient: boolean }) {
  const [v, setV] = useState(String(score));
  return (
    <div className="rounded-md border border-edge p-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-10 font-medium">{label}</span>
        <input type="number" min={1} max={30} value={v} onChange={(e) => setV(e.target.value)} className={`${input} w-20`} aria-label={`Значение ${label}`} />
        <button type="button" disabled={v === String(score)} onClick={() => void ctx.run({ op: "ability", ability, score: Number(v) })} className={save}>
          ✓
        </button>
        <label className="ml-auto flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={proficient}
            onChange={(e) => void ctx.run({ op: "save", ability, proficient: e.target.checked })}
          />
          спасбросок
        </label>
      </div>
      <div className="text-[11px]">
        <Edited ctx={ctx} k={`ability.${label}`} />
        <Edited ctx={ctx} k={`save.${label}`} />
      </div>
    </div>
  );
}

function Skills({ ctx, details }: { ctx: Ctx; details: SheetDetails }) {
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
      {details.skills.map((s) => (
        <li key={s.skill} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0">
            {s.name}
            <Edited ctx={ctx} k={`skill.${s.name}`} />
          </span>
          <select
            value={s.proficiency}
            onChange={(e) => void ctx.run({ op: "skill", skill: s.skill, proficiency: e.target.value as ProficiencyLevel, source: "правка игрока" })}
            className={input}
            aria-label={`Владение: ${s.name}`}
          >
            <option value="none">—</option>
            <option value="proficient">владение</option>
            <option value="expertise">компетентность</option>
          </select>
        </li>
      ))}
    </ul>
  );
}

/** Список строк «ключ — текст» с добавлением и удалением. */
function ListEditor<T>({
  items,
  blank,
  render,
}: {
  items: T[];
  blank: T;
  render: (item: T, isNew: boolean, done: () => void) => ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i}>{render(item, false, () => undefined)}</div>
      ))}
      {adding ? (
        render(blank, true, () => setAdding(false))
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="rounded-md border border-dashed border-gold/60 px-3 py-1 text-xs text-gold">
          + Добавить
        </button>
      )}
    </div>
  );
}

function ProficiencyEditor({ ctx, kind, text, isNew, done }: { ctx: Ctx; kind: string; text: string; isNew: boolean; done: () => void }) {
  const [k, setK] = useState(kind);
  const [t, setT] = useState(text);
  return (
    <div className="rounded-md border border-edge p-2">
      <div className="flex flex-wrap gap-2">
        <input value={k} disabled={!isNew} onChange={(e) => setK(e.target.value)} placeholder="Вид: Языки, Оружие…" className={`${input} w-36`} aria-label="Вид владения" />
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Текст" className={`${input} min-w-0 flex-1`} aria-label="Владения" />
        <button type="button" disabled={!k.trim()} onClick={() => void ctx.run({ op: "proficiency", kind: k, text: t }).then(done)} className={save}>
          Сохранить
        </button>
        {!isNew && (
          <button type="button" onClick={() => void ctx.run({ op: "proficiency", kind: k, text: "" })} className="px-2 text-xs text-muted hover:text-fumble">
            ✕
          </button>
        )}
      </div>
      <Edited ctx={ctx} k={`proficiency.${kind}`} />
    </div>
  );
}

function FeatureEditor({ ctx, name, source, text, isNew, done }: { ctx: Ctx; name: string; source: string; text: string; isNew: boolean; done: () => void }) {
  const [n, setN] = useState(name);
  const [s, setS] = useState(source);
  const [t, setT] = useState(text);
  return (
    <div className="space-y-1 rounded-md border border-edge p-2">
      <div className="flex flex-wrap gap-2">
        <input value={n} disabled={!isNew} onChange={(e) => setN(e.target.value)} placeholder="Название" className={`${input} min-w-0 flex-1`} aria-label="Название умения" />
        <input value={s} onChange={(e) => setS(e.target.value)} placeholder="Источник" className={`${input} w-36`} aria-label="Источник умения" />
      </div>
      <textarea value={t} onChange={(e) => setT(e.target.value)} rows={2} placeholder="Описание" className={`${input} w-full`} aria-label="Описание умения" />
      <div className="flex items-center gap-2">
        <button type="button" disabled={!n.trim() || !t.trim()} onClick={() => void ctx.run({ op: "feature", name: n, source: s, text: t }).then(done)} className={save}>
          Сохранить
        </button>
        {!isNew && (
          <button type="button" onClick={() => void ctx.run({ op: "feature", name: n, source: s, text: "" })} className="text-xs text-muted hover:text-fumble">
            Убрать
          </button>
        )}
        <Edited ctx={ctx} k={`feature.${name}`} />
      </div>
    </div>
  );
}

function AttunementEditor({ ctx, name, effect, isNew, done }: { ctx: Ctx; name: string; effect: string; isNew: boolean; done: () => void }) {
  const [n, setN] = useState(name);
  const [e, setE] = useState(effect);
  return (
    <div className="rounded-md border border-edge p-2">
      <div className="flex flex-wrap gap-2">
        <input value={n} disabled={!isNew} onChange={(x) => setN(x.target.value)} placeholder="Предмет" className={`${input} min-w-0 flex-1`} aria-label="Настроенный предмет" />
        <input value={e} onChange={(x) => setE(x.target.value)} placeholder="Действие" className={`${input} min-w-0 flex-1`} aria-label="Действие предмета" />
        <button type="button" disabled={!n.trim()} onClick={() => void ctx.run({ op: "attunement", name: n, effect: e, remove: false }).then(done)} className={save}>
          Сохранить
        </button>
        {!isNew && (
          <button type="button" onClick={() => void ctx.run({ op: "attunement", name: n, effect: e, remove: true })} className="px-2 text-xs text-muted hover:text-fumble">
            Снять
          </button>
        )}
      </div>
      <Edited ctx={ctx} k={`attunement.${name}`} />
    </div>
  );
}

function AttackEditor({ ctx, attack, isNew, done }: { ctx: Ctx; attack: AttackInput; isNew: boolean; done: () => void }) {
  const [a, setA] = useState<AttackInput>(attack);
  const set = (patch: Partial<AttackInput>) => setA((x) => ({ ...x, ...patch }));
  return (
    <div className="space-y-1 rounded-md border border-edge p-2 text-sm">
      <input value={a.name} disabled={!isNew} onChange={(e) => set({ name: e.target.value })} placeholder="Название" className={`${input} w-full`} aria-label="Название атаки" />
      <div className="flex flex-wrap gap-2">
        <select value={a.ability ?? ""} onChange={(e) => set({ ability: (e.target.value || null) as Ability | null })} className={input} aria-label="Характеристика атаки">
          {ABILITIES.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
        <select
          value={a.proficient === null ? "unknown" : a.proficient ? "yes" : "no"}
          onChange={(e) => set({ proficient: e.target.value === "unknown" ? null : e.target.value === "yes" })}
          className={input}
          aria-label="Владение оружием"
        >
          <option value="yes">владение</option>
          <option value="no">без владения</option>
          <option value="unknown">не указано</option>
        </select>
        <label className="flex items-center gap-1 text-xs">
          магия
          <input type="number" value={a.magic} onChange={(e) => set({ magic: Number(e.target.value) })} className={`${input} w-16`} aria-label="Магический бонус" />
        </label>
        <input value={a.damage_dice} onChange={(e) => set({ damage_dice: e.target.value })} placeholder="1d8" className={`${input} w-20`} aria-label="Кость урона" />
        <input value={a.damage_type} onChange={(e) => set({ damage_type: e.target.value })} placeholder="рубящий" className={`${input} w-28`} aria-label="Вид урона" />
      </div>
      <input value={a.extra} onChange={(e) => set({ extra: e.target.value })} placeholder="Доп. урон и свойства" className={`${input} w-full`} aria-label="Дополнительно" />
      <div className="flex flex-wrap gap-2">
        <input value={a.range} onChange={(e) => set({ range: e.target.value })} placeholder="Дальность" className={`${input} w-32`} aria-label="Дальность" />
        <input value={a.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Примечания" className={`${input} min-w-0 flex-1`} aria-label="Примечания" />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={!a.name.trim()} onClick={() => void ctx.run({ op: "attack", attack: a, remove: false }).then(done)} className={save}>
          Сохранить
        </button>
        {!isNew && (
          <button type="button" onClick={() => void ctx.run({ op: "attack", attack: a, remove: true })} className="text-xs text-muted hover:text-fumble">
            Убрать
          </button>
        )}
        <Edited ctx={ctx} k={`attack.${attack.name}`} />
      </div>
    </div>
  );
}

const BLANK_ATTACK: AttackInput = {
  name: "",
  ability: "strength",
  caster_id: null,
  proficient: true,
  magic: 0,
  damage_dice: "",
  damage_type: "",
  add_ability_to_damage: true,
  damage_bonus: 0,
  extra: "",
  range: "",
  notes: "",
};

interface SheetEditorProps {
  sheet: CharacterSheet;
  details: SheetDetails;
  /** Исходные атаки (для формы правки); берутся из полного листа движка. */
  attacks: AttackInput[];
  onChanged: () => void;
}

export default function SheetEditor({ sheet, details, attacks, onChanged }: SheetEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const ctx: Ctx = {
    id: sheet.id,
    edited: new Set(details.edited),
    run: (edit) =>
      editSheet(sheet.id, edit)
        .then(() => {
          setError(null);
          onChanged();
        })
        .catch((e: unknown) => setError(errorText(e))),
    revert: (key) =>
      revertSheetEdit(sheet.id, key)
        .then(() => {
          setError(null);
          onChanged();
        })
        .catch((e: unknown) => setError(errorText(e))),
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        Правки хранятся поверх листа приложения и попадают в сохранение. У изменённого поля — пометка «изменено» и
        возврат к листу приложения.
      </p>
      {error && <p className="text-sm text-fumble">{error}</p>}
      <Block title="Сведения" open>
        <div className="space-y-2">
          <TextField ctx={ctx} field="background" label="Предыстория" value={details.background} area />
          <TextField ctx={ctx} field="alignment" label="Мировоззрение" value={details.alignment} />
          <TextField ctx={ctx} field="appearance" label="Внешность" value={details.appearance} area />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <NumberField ctx={ctx} field="xp" label="Опыт" value={details.xp} />
            <NumberField ctx={ctx} field="xp_next" label="Опыт до уровня" value={details.xp_next} />
          </div>
        </div>
      </Block>
      <Block title="КД, скорость, хиты" open>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <NumberField ctx={ctx} field="armor_class" label="КД" value={sheet.armor_class} />
          <NumberField ctx={ctx} field="speed_ft" label="Скорость, фт" value={sheet.speed_ft} />
          <NumberField ctx={ctx} field="hp_max" label="Максимум хитов" value={sheet.hit_points.max} />
        </div>
      </Block>
      <Block title="Характеристики и спасброски" open>
        <Abilities ctx={ctx} sheet={sheet} details={details} />
      </Block>
      <Block title="Навыки">
        <Skills ctx={ctx} details={details} />
      </Block>
      <Block title="Владения и языки" open>
        <ListEditor
          items={details.proficiencies}
          blank={{ kind: "", text: "", from_rules: false }}
          render={(p, isNew, done) => <ProficiencyEditor key={p.kind} ctx={ctx} kind={p.kind} text={p.text} isNew={isNew} done={done} />}
        />
      </Block>
      <Block title="Умения и черты">
        <ListEditor
          items={details.features}
          blank={{ name: "", source: "", text: "", resource_id: null }}
          render={(f, isNew, done) => (
            <FeatureEditor key={f.name} ctx={ctx} name={f.name} source={f.source} text={f.text} isNew={isNew} done={done} />
          )}
        />
      </Block>
      <Block title="Настройка">
        <ListEditor
          items={details.attunement}
          blank={{ name: "", effect: "" }}
          render={(a, isNew, done) => <AttunementEditor key={a.name} ctx={ctx} name={a.name} effect={a.effect} isNew={isNew} done={done} />}
        />
      </Block>
      <Block title="Атаки">
        <ListEditor
          items={attacks}
          blank={BLANK_ATTACK}
          render={(a, isNew, done) => <AttackEditor key={a.name} ctx={ctx} attack={a} isNew={isNew} done={done} />}
        />
      </Block>
    </div>
  );
}
