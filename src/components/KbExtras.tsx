// База знаний: панель цели (шаги, срок, ход выполнения) и пароль слоя мастера.

import { useState } from "react";
import { errorText, updateCard, type CustomCard, type Goal, type GoalEditInput } from "../lib/engine";
import { gmClearPassword, gmPasswordSet, gmSetPassword, gmUnlock } from "../lib/kbState";

const input =
  "w-full rounded-md border border-edge bg-ink px-3 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";
const small = "rounded border border-edge px-2 py-1 text-xs hover:border-gold disabled:opacity-40";

/** Цель героя: заказчик, награда, срок, шаги с отметками и ход выполнения. */
export function GoalPanel({
  card,
  goal,
  today,
  onChanged,
}: {
  card: CustomCard;
  goal: Goal;
  today?: number;
  onChanged: () => void;
}) {
  const [line, setLine] = useState("");
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const closed = card.status === "done" || card.status === "failed";
  const overdue = !closed && goal.due_day != null && today != null && today > goal.due_day;

  function change(edit: GoalEditInput, after?: () => void) {
    setError(null);
    updateCard(card.id, { goal: edit })
      .then(() => {
        after?.();
        onChanged();
      })
      .catch((e: unknown) => setError(errorText(e)));
  }

  return (
    <section className="space-y-3 rounded-lg border border-gold/40 p-3 text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {goal.giver && (
          <span>
            <span className="text-muted">Поручил:</span> {goal.giver}
          </span>
        )}
        {goal.reward && (
          <span>
            <span className="text-muted">Награда:</span> {goal.reward}
          </span>
        )}
        {goal.due_day != null && (
          <span className={overdue ? "text-fumble" : undefined}>
            <span className="text-muted">Срок:</span> День {goal.due_day}
            {overdue ? " — просрочено" : ""}
          </span>
        )}
      </div>

      {goal.steps.length > 0 && (
        <ul className="space-y-1">
          {goal.steps.map((s, i) => (
            <li key={`${i}-${s.text}`}>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={s.done}
                  onChange={() => change(s.done ? { step_undone: i + 1 } : { step_done: i + 1 })}
                />
                <span className={s.done ? "text-muted line-through" : undefined}>{s.text}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={step}
          onChange={(e) => setStep(e.target.value)}
          placeholder="Новый шаг"
          aria-label="Новый шаг цели"
          className={input}
        />
        <button type="button" disabled={!step.trim()} onClick={() => change({ add_step: step }, () => setStep(""))} className={small}>
          Добавить
        </button>
      </div>

      {goal.log.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs text-muted">Ход выполнения</h4>
          <ul className="space-y-1 text-sm">
            {goal.log.map((l, i) => (
              <li key={i}>
                <span className="text-xs text-muted">День {l.day}:</span> {l.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Что продвинулось"
          aria-label="Запись о ходе цели"
          className={input}
        />
        <button type="button" disabled={!line.trim()} onClick={() => change({ log: line }, () => setLine(""))} className={small}>
          Записать
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {closed ? (
          <button type="button" onClick={() => change({ status: "active" })} className={small}>
            Вернуть в активные
          </button>
        ) : (
          <>
            <button type="button" onClick={() => change({ status: "done" })} className={small}>
              ✓ Выполнена
            </button>
            <button type="button" onClick={() => change({ status: "failed" })} className={small}>
              ✗ Провалена
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-fumble">{error}</p>}
    </section>
  );
}

/** Ввод пароля слоя мастера. */
export function MasterLock({ onUnlocked }: { onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);

  function submit() {
    gmUnlock(password)
      .then((ok) => {
        if (ok) onUnlocked();
        else setWrong(true);
      })
      .catch(() => setWrong(true));
  }

  return (
    <form
      className="mx-auto flex max-w-xs flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setWrong(false);
        }}
        placeholder="Пароль мастера"
        aria-label="Пароль мастера"
        autoComplete="off"
        className={input}
      />
      {wrong && <p className="text-xs text-fumble">Пароль не подошёл.</p>}
      <button type="submit" disabled={!password} className="rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-40">
        Открыть слой мастера
      </button>
    </form>
  );
}

/** Задать, сменить или убрать пароль слоя мастера (доступно, пока слой открыт). */
export function MasterPasswordButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [has, setHas] = useState(gmPasswordSet);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={small}>
        {has ? "🔒 Свой пароль" : "🔒 Сменить пароль"}
      </button>
    );
  }
  return (
    <form
      className="flex w-full flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (password.length < 4) {
          setError("Не короче 4 символов.");
          return;
        }
        gmSetPassword(password)
          .then(() => {
            setHas(true);
            setPassword("");
            setOpen(false);
          })
          .catch((err: unknown) => setError(errorText(err)));
      }}
    >
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        placeholder={has ? "Новый пароль" : "Пароль мастера"}
        aria-label="Пароль мастера"
        autoComplete="new-password"
        className={`${input} max-w-[14rem]`}
      />
      <button type="submit" className={small}>
        Сохранить
      </button>
      {has && (
        <button
          type="button"
          onClick={() => {
            gmClearPassword();
            setHas(false);
            setOpen(false);
          }}
          className={small}
        >
          Вернуть пароль по умолчанию
        </button>
      )}
      <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 text-xs text-muted">
        Отмена
      </button>
      <span className="w-full text-[11px] text-muted">
        Пароль спрашивается после каждого запуска игры. По умолчанию — пароль из README игры; свой хранится только на этом
        устройстве, забытый свой пароль не восстановить — только сбросом данных игры.
      </span>
      {error && <span className="w-full text-fumble">{error}</span>}
    </form>
  );
}
