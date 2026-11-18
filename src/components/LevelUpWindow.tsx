import { useEffect, useMemo, useState } from "react";
import { characterSheet, errorText, levelUpClass, type CharacterSheet } from "../lib/engine";
import { averageRoll, buildGain, castingAt, classOptions, featuresAt, findSubclass } from "../lib/levelUp";
import Modal from "./Modal";

interface LevelUpWindowProps {
  id: string;
  /** Тот же класс можно повысить мастером создания (герой своей кампании с одним классом). */
  wizard: boolean;
  onClose: () => void;
  onOpenWizard: () => void;
  onDone: (line: string) => void;
}

const PROGRESSION_LABEL: Record<string, string> = {
  full: "полный заклинатель",
  half_2024: "половинный заклинатель",
  third: "треть заклинателя",
  pact: "магия договора",
};

/** Повышение уровня: выбор класса (тот же или новый — мультикласс), подкласс, хиты, умения. */
export default function LevelUpWindow({ id, wizard, onClose, onOpenWizard, onDone }: LevelUpWindowProps) {
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [subId, setSubId] = useState<string>("");
  const [hpMode, setHpMode] = useState<"average" | "roll">("average");
  const [hpRoll, setHpRoll] = useState<number>(1);
  const [hpBonus, setHpBonus] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    characterSheet(id)
      .then((s) => {
        setSheet(s);
        if (/дварф/i.test(s.race)) setHpBonus(1);
      })
      .catch((e: unknown) => setError(errorText(e)));
  }, [id]);

  const options = useMemo(() => (sheet ? classOptions(sheet) : []), [sheet]);
  useEffect(() => {
    const first = options[0];
    if (!classId && first) setClassId(first.cls.id);
  }, [options, classId]);

  const option = options.find((o) => o.cls.id === classId);
  const ownSub = option ? findSubclass(option.cls, option.subclassName) : undefined;
  const choosesSub = option ? option.level === option.cls.subclassLevel && !ownSub : false;
  const sub = choosesSub ? option?.cls.subclasses.find((s) => s.id === subId) : ownSub;
  const features = option ? featuresAt(option.cls, sub, option.level) : [];
  const casting = option ? castingAt(option.cls, sub, option.level) : null;
  const con = sheet?.abilities.find((a) => a.ability === "constitution")?.modifier ?? 0;
  const die = option?.cls.hitDie ?? 8;
  const roll = hpMode === "average" ? averageRoll(die) : Math.min(Math.max(hpRoll, 1), die);
  const hpGain = Math.max(1, roll + con) + hpBonus;
  const sameClassWizard = wizard && option?.current && (sheet?.classes.length ?? 0) === 1;

  async function confirm() {
    if (!option) return;
    if (sameClassWizard) {
      onOpenWizard();
      return;
    }
    if (choosesSub && !sub) {
      setError("Выберите подкласс.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const gain = buildGain(option, sub, hpMode === "average" ? null : roll, hpBonus);
      const line = await levelUpClass(id, gain);
      onDone(line);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  }

  return (
    <Modal title={sheet ? `${sheet.name}: ${sheet.level + 1} уровень` : "Повышение уровня"} onClose={onClose} size="lg">
      <div className="space-y-4 p-4 text-sm">
        {!sheet && !error && <p className="text-muted">Загрузка листа…</p>}
        {sheet && (
          <>
            <p className="text-muted">
              Сейчас: {sheet.classes.map((c) => `${c.class} ${c.level}`).join(" / ")}. Новый уровень можно взять в
              своём классе или в новом (мультикласс: 13+ в основной характеристике и прежнего, и нового класса).
            </p>
            <section>
              <h3 className="mb-2 font-serif text-gold">Класс</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((o) => (
                  <button
                    key={o.cls.id}
                    type="button"
                    disabled={!!o.blocked}
                    onClick={() => {
                      setClassId(o.cls.id);
                      setSubId("");
                    }}
                    title={o.blocked || o.cls.summary}
                    className={`rounded-lg border px-3 py-2 text-left ${
                      o.cls.id === classId ? "border-gold bg-gold/10" : "border-edge"
                    } ${o.blocked ? "opacity-40" : "hover:border-gold/60"}`}
                  >
                    <div className="text-parchment">
                      {o.cls.name} {o.level}
                      {o.current ? "" : " · мультикласс"}
                    </div>
                    <div className="text-xs text-muted">{o.blocked || `кость хитов d${o.cls.hitDie}`}</div>
                  </button>
                ))}
              </div>
            </section>

            {option && choosesSub && (
              <section>
                <h3 className="mb-2 font-serif text-gold">Подкласс</h3>
                <select
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  className="w-full rounded-md border border-edge bg-ink px-2 py-1.5 text-parchment"
                >
                  <option value="">— выберите —</option>
                  {option.cls.subclasses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {sub && <p className="mt-1 text-xs text-muted">{sub.summary}</p>}
              </section>
            )}

            {option && !sameClassWizard && (
              <section>
                <h3 className="mb-2 font-serif text-gold">Хиты</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={hpMode === "average"} onChange={() => setHpMode("average")} />
                    среднее d{die} = {averageRoll(die)}
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={hpMode === "roll"} onChange={() => setHpMode("roll")} />
                    выпало
                    <input
                      type="number"
                      min={1}
                      max={die}
                      value={hpRoll}
                      onChange={(e) => {
                        setHpMode("roll");
                        setHpRoll(Number(e.target.value));
                      }}
                      className="w-14 rounded border border-edge bg-ink px-1 text-parchment"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    прибавка за уровень
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={hpBonus}
                      onChange={(e) => setHpBonus(Math.max(0, Number(e.target.value)))}
                      className="w-12 rounded border border-edge bg-ink px-1 text-parchment"
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted">
                  +{hpGain} к максимуму хитов (кость {roll}, ТЕЛ {con >= 0 ? `+${con}` : con}
                  {hpBonus ? `, +${hpBonus} дварф или «Крепкий»` : ""}).
                </p>
              </section>
            )}

            {option && casting && !sameClassWizard && (
              <p className="text-xs text-muted">
                Магия: {PROGRESSION_LABEL[casting.progression]}, заговоров {casting.max_cantrips},{" "}
                {casting.max_known !== null
                  ? `известных заклинаний ${casting.max_known}`
                  : `подготовка ${casting.max_prepared}`}
                . Ячейки пересчитаются по таблице мультикласса; новые заклинания выберите в книге заклинаний.
              </p>
            )}

            {option && !sameClassWizard && (
              <section>
                <h3 className="mb-2 font-serif text-gold">Умения уровня</h3>
                {features.length === 0 && <p className="text-muted">Новых умений на этом уровне нет.</p>}
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={`${f.source}-${f.name}`}>
                      <span className="text-parchment">{f.name}</span>{" "}
                      <span className="text-xs text-muted">({f.source})</span>
                      <p className="text-xs text-muted">{f.text}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Выборы умений (талант, повышение характеристик, манёвры) отметьте после повышения правкой листа.
                </p>
              </section>
            )}

            {sameClassWizard && (
              <p className="text-muted">
                Уровень в своём классе собирается мастером создания — со всеми выборами уровня.
              </p>
            )}
          </>
        )}
        {error && <p className="text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-edge px-4 py-2 text-muted">
            Отмена
          </button>
          <button
            type="button"
            disabled={!option || busy || !!option?.blocked}
            onClick={() => void confirm()}
            className="rounded-md bg-gold px-4 py-2 font-semibold text-ink disabled:opacity-50"
          >
            {sameClassWizard ? "Открыть мастер создания" : busy ? "Повышаю…" : "Повысить уровень"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
