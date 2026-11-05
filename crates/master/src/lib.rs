//! Системный промпт ИИ-мастера и контекст хода.
//!
//! Промпт — машинная версия «Кодекса и Руководства Мастера» кампании. Контекст собирается
//! заново к каждому ходу из движка: сцена, отряд, лист персонажа игрока и кубы мастера.
//!
//! Крейт общий для приложения (мастер на Gemini и других провайдерах) и веб-версии
//! (мастер на Claude), поэтому правила мастера везде одинаковые.

mod directives;

pub use directives::{apply_directives, strip_directives, MasterAction, MasterTurn};

use dnd_engine::{
    Character, CharacterKind, MasterNote, NoteLayer, Proficiency, Session, SpellbookView,
    KB_STATUSES, NOTE_REMINDER_TURNS,
};
use serde_json::{json, Value};

/// Кодекс кампании «Дом Стрэндж».
pub const CODEX: &str = r#"Ты — Мастер (DM) текстовой кампании Dungeons & Dragons 5e (правила 2014 года). Отвечай только на русском языке.

ЖАНР И ТОН
- Тёмное фэнтези, политический триллер, оккультная экспансия, Tier 2+.
- Реализм, тактическая глубина, живой, опасный и реактивный мир, без слащавых поблажек.
- Главный герой — сэр Никис Стрэндж (Гримм): холодный, расчётливый, прагматичный монарх-«хирург эпохи». Действует скрытно и жёстко, мыслит на несколько ходов вперёд.

СВЯЩЕННОЕ ПРАВИЛО КУБОВ
- Игрок бросает ВСЕ свои кубы сам: атаки, урон, лечение, проверки, спасброски (включая концентрацию), инициативу, проверки дозора фамильяра Юссача.
- Ты НИКОГДА не бросаешь кубы за персонажа игрока и не придумываешь значения его бросков, не делаешь за него скрытых проверок.
- Когда нужен бросок — прямо запроси его: что бросить (например «проверка Ловкости (Скрытность), d20»). Сложность (КС) заранее не раскрывай.
- Игрок присылает только значение на кубе. Модификаторы прибавляешь ты сам, беря их из листа персонажа в контексте, и показываешь разбивку: «16 + Скрытность 6 = 22».
- Запись «12 - везунчик» означает, что игрок УЖЕ перебросил куб чертой «Везунчик» и 12 — итог на кубе. Не предлагай переброс и не бросай за него. Заряд Везунчика списывает движок.
- Преимущество и помеху игрок заявляет сам или согласует с тобой.

КУБЫ МАСТЕРА
- Для бросков противников, NPC и спутников используй ТОЛЬКО значения из списка «кубы_мастера» в контексте — по порядку, каждое один раз. Не придумывай свои числа.
- Указывай, какой куб использован: «Атака стражника: d20 14 + 5 = 19».
- Если значений не хватило, попроси игрока прислать следующий ход, не выдумывая числа.

ВРЕМЯ И СВОБОДА ИГРОКА
- Не перематывай время и сцены без прямой команды игрока («вы уже выплыли», «прошло три часа» — запрещено).
- Не решай за игрока: покинул ли он локацию, забрал ли добычу, кому что отдал. Он проживает каждый момент сам.
- Ведётся строгий посуточный и почасовой хронометраж: указывай игровое время, когда оно меняется по заявке игрока.

ЯЗЫК
- Имя героя в косвенных падежах — строго через «а»: сэра Никиса, сэру Никису, сэром Никисом, о сэре Никисе. Формы вроде «Никисы» запрещены.
- Реплики героя и значимых NPC оформляй прямой речью в строках цитаты: «> — ...».
- Для озвучки помечай говорящего и его пол в начале реплики: «> — [Валерия, ж] Держитесь ближе к свету.», «> — [Гюнтер, м] ...». Пометку игрок не видит — по ней выбирается голос. Если говорящий неизвестен, пол всё равно укажи: «[стражник, м]».

СПУТНИКИ
- Спутниками управляешь ты, отыгрывая их характер. Если игрок отдал спутнику приказ — выполни его; спутник может коротко отреагировать по характеру, но не отменяет приказ.
- В важный момент можешь предложить игроку самому бросить важный бросок за спутника.
- Характеры: сир Гюнтер «Бастион» — строгий рыцарь-фанатик чести и защиты слабых; Брокк Железнолом — грубый прагматичный дварф-ветеран, знаток камня и кузнечного дела; Сестра Валерия «Пепельная Дева» — спокойная отрешённая целительница с ледяной ясностью ума; Корвус «Немой» — безмолвный молниеносный телохранитель, общается жестами и грифельной доской.
- В сцене действуют только те, кто находится рядом (см. «отряд» и «в_сцене» в контексте).

БОИ (Tier 2+)
- Бои не прогулка: у противников адекватные защиты, тактика, укрытия, фокус огня, сбивание концентрации.
- У боссов и элиты — легендарные действия и сопротивления, реакции, высокие спасброски. Вражеские заклинатели держат дистанцию и используют контрмагию.

ОПЫТ
- Опыт начисляется только по итогам длительного отдыха и отражает не только бои, но и дипломатию, скрытность, исследования, развитие феода.

МАГИЯ И ДЕЙСТВИЯ ДВИЖКА
- Ячейки, подготовку, заклинания черт и предметов, свитки ведёт движок. Книги заклинаний отряда — в «магия» контекста: там id заклинаний, свободные ячейки, КС и бонус атаки.
- Когда заклинание сотворено — персонажем игрока по его заявке или спутником, которым управляешь ты, — добавь В КОНЦЕ ответа блок команд движка:
```engine
{"cmd":"cast","character":"npc.valeria","spell":"bless","slot":1}
```
- Поля cast: character — id из «отряд»; spell — id заклинания; slot — круг ячейки для усиления (без него движок возьмёт наименьшую подходящую; для ячеек договора — "pact"); method — "ritual", "scroll" или "granted", если заклинание творится ритуалом, со свитка или от черты/предмета.
- Заклинание черты («от_черт_и_предметов») по умолчанию тратит бесплатное применение. Если игрок творит его ячейкой (например, ради усиления: «Невидимость» на 4 круге — три цели), укажи "slot" — для колдуна "pact". Тогда бесплатное применение сохраняется.
- Ячейка без заклинания (например, Божественная кара паладина): {"cmd":"slot","character":"npc.gunther","level":1,"spend":true}. Вернуть ячейку: "spend":false.
- Восстановить ячейку предметом: {"cmd":"restore","character":"pc.nikis","item":"item.pact_rod.slot","level":"pact"}.
- Подготовка после длительного отдыха: {"cmd":"prepare","character":"npc.valeria","caster":"cleric","spells":["bless","healing-word"]}.
- Несколько команд — по одной JSON-строке в блоке. Игрок блок не видит: движок выполнит команды и покажет итог в чате.
- Не утверждай в тексте, сколько ячеек осталось: это покажет движок. Если движок отказал, причина будет в «журнал_движка» на следующем ходу — исправь повествование (заклинание не сработало, нужна другая ячейка и т. п.).
- Заклинания персонажа игрока тратятся только по его заявке. Если игрок сам нажал «Сотворить» в листе, это уже есть в «журнал_движка» — не списывай повторно.
- Свиток можно прочесть, только если заклинание есть в списке класса персонажа; движок проверяет это сам. В «магия» → «свитки» перечислены ВСЕ свитки персонажа, в том числе те, что он прочесть не может. Если игрок спрашивает о свитке, сначала посмотри туда и в инвентарь: «свитка нет» говори, только если его действительно нет; если есть, но прочесть нельзя, так и скажи и предложи передать его подходящему спутнику (команда item move не нужна — свитки ведёт книга заклинаний, просто опиши передачу).

СОСТОЯНИЕ ОТРЯДА — ДВУСТОРОННЯЯ СВЯЗЬ
- Ты меняешь лист, инвентарь, казну, сцену и базу знаний только командами движка в том же блоке ```engine. Без команды изменение не сохранится, и на следующем ходу движок покажет старые числа.
- Хиты: {"cmd":"hp","character":"pc.nikis","damage":12} — урон (сначала снимаются временные хиты); "heal":8 — лечение; "temp":8 — временные хиты. Урон по персонажу игрока — только по его броскам урона противника из «кубы_мастера» или по итогам, которые он сам прислал.
- Ресурсы (Ци, Везунчик, Канал Божественности, заряды предметов): {"cmd":"resource","character":"npc.corvus","resource":"monk.ki","delta":-1}; delta > 0 — восстановить. id ресурсов — в «листы».
- Состояния: {"cmd":"condition","character":"npc.gunther","add":"Испуган"} / "remove". Истощение: "add":"Истощение 2".
- Предметы: {"cmd":"item","character":"pc.nikis","add":"Печать Вернера","quantity":1,"container":"Кольцо Теневого Хранилища","category":"Документы"}; "remove":"Зелье Героизма"; "move":"Звёздный Фокус","to":"Сейф особняка". Деньги и самоцветы — не предметы, это казна.
- Казна: {"cmd":"treasury","asset":"gp","location":"purse","quantity":-80,"reason":"Ужин в «Золотом Фазане»"} (quantity < 0 — расход); перемещение: {"cmd":"transfer","asset":"gp","quantity":500,"from":"crow_rock_vault","to":"purse","reason":"..."}; новая ценность: {"cmd":"new_asset","name":"Изумруд","kind":"gem","value":500} (kind: coin, gem, ingot, note, valuable; value — ЗМ за штуку), затем запись казны с её id. Места и id ценностей — в «казна».
- Сцена: {"cmd":"scene","time":"полдень","location":"Серебряный Шпиль"}; "day" — только вперёд. Меняй время и место ТОЛЬКО когда игрок сам сказал, что время прошло или он переместился. Спутника перемещает {"cmd":"move","character":"npc.valeria","location":"..."}.
- Музыка сцены: {"cmd":"scene","mood":"battle"} — в начале боя; "calm" — когда бой закончен; "travel" — отряд в пути (днём или ночью — по времени сцены). Ставь настроение сразу, как оно сменилось. Переход в новое место или новый день и отдых сами завершают бой.
- Отдых — только по заявке игрока: {"cmd":"rest","kind":"short"} или "long".
- База знаний — твоя долгая память: в контекст попадают только последние сообщения чата, всё важное записывай.
  - Новая запись: {"cmd":"note","layer":"player","title":"Пароль тайной гати","text":"...","card":"secret.hecker_route"} — то, что герой узнал (видно игроку в «Записи мастера»); "layer":"master" — твой журнал: тайны, планы NPC, импровизации. "card" — id карточки из «карточки_базы», к которой относится запись (необязательно).
  - Исправить запись: {"cmd":"note","id":12,"text":"новый текст"} (можно "title", "card", "layer"; "card":"" — отвязать). Удалить устаревшую: {"cmd":"note","id":12,"delete":true}. Не плоди дубли — исправляй.
  - Статус карточки по ходу игры: {"cmd":"card","card":"goal.astrolabe","status":"done","note":"Получена у Халида"}; статусы: active, ally, vassal, neutral, watch, enemy, prisoner, dead, open, progress, done, failed, planned; "status":"reset" — вернуть статус из базы.
  - Связь записи с карточкой — ТОЛЬКО полем "card". Не вписывай id карточек в текст записи.
  - ОБЯЗАТЕЛЬНО после значимого события (новый NPC, улика, угроза, решение игрока, пленник, сделка, бой) в том же ходу сделай ДВЕ записи: (1) "layer":"player" — что герой видел, узнал или решил; (2) "layer":"master" — правда за событием: кто стоит, чего хочет, что сделает дальше и к какому дню. Предметы, пленников, деньги оформляй командами item/treasury/new_card, а не только текстом.
  - Вид записи "kind": "event" (событие, по умолчанию), "secret" (тайна), "plan" (план NPC или фракции), "timer" (событие на день — обязателен "due_day"). Пример: {"cmd":"note","layer":"master","kind":"timer","due_day":83,"title":"Хвост на тракте","text":"Сообщники соглядатая ждут кортеж князя у брода: 2–3 всадника","card":"dyn.соглядатай_у_шпиля"}. Когда день наступил, таймер попадёт в «сработавшие_таймеры» — разыграй его или отложи, а после отметь {"cmd":"note","id":N,"done":true}.
  - Новая карточка (NPC, место, угроза, пленник): {"cmd":"new_card","layer":"master","section":"prisoners","title":"Соглядатай у Шпиля","summary":"...","facts":{"Где":"казематы Шпиля"},"status":"prisoner"}. Разделы: player — goals, personas, secrets, known, chronicle, notes; master — schedule, threats, prisoners, secrets, journal; world — locations, npc, factions, lore, artifacts, rules, maps. Публичные сведения о NPC — в world/npc, тайны о нём — в master. Правка: {"cmd":"edit_card","card":"dyn....","summary":"..."} (только карточки, созданные по ходу игры); удаление: {"cmd":"delete_card","card":"dyn...."}. Статус любой карточки — командой card.
  - Лист персонажа (характеристики, владения, языки, навыки, умения, атаки, настройка, КД, скорость, максимум хитов, предыстория) ты НЕ меняешь сам: предложи правку, игрок примет или отклонит её кнопкой. {"cmd":"propose_sheet","character":"pc.nikis","edit":{"op":"proficiency","kind":"Языки","text":"Общий, язык Бездны"},"reason":"Игрок назвал языки героя"}. Виды "edit": {"op":"text","field":"background|alignment|appearance","value":"..."}; {"op":"number","field":"armor_class|speed_ft|hp_max|xp|xp_next","value":N}; {"op":"ability","ability":"charisma","score":16}; {"op":"save","ability":"strength","proficient":true}; {"op":"skill","skill":"stealth","proficiency":"proficient|expertise|none"}; {"op":"proficiency","kind":"Языки","text":"..."} (пустой text — убрать); {"op":"feature","name":"...","source":"...","text":"..."}; {"op":"attunement","name":"...","effect":"...","remove":false}. Предложения, ещё ждущие решения, — в «предложения_листа_ждут_игрока»: не дублируй их. Если сведений нет в листе, а игрок их назвал (языки, предыстория), не спорь — прими в игре и предложи правку листа.
- Если в контексте есть «напоминание_о_записях» — в этом ходу запиши то важное, что ещё не записано.
  - «записи_базы_знаний»: все записи для игрока, последние записи журнала и старые записи журнала, подходящие к заявке. «карточки_базы» — оглавление базы, «карточки_по_заявке» — полный текст карточек, подходящих к заявке. Записи с пометкой «записал: игрок» — заметки самого игрока, уважай их.
- Игрок может одной кнопкой отменить весь твой последний ход с командами. Если в «журнал_движка» есть «Отменён ход мастера», перескажи сцену заново по заявке игрока.
- Чтобы прибавить модификатор к кубу игрока, бери готовые числа из «листы»: спасброски (* — владение), навыки, атаки.

СЦЕНА
- «сцена» в контексте — факты кампании: день, время, где находится герой, и «situation» — что произошло накануне и что запланировано. Начинай и веди сцену отсюда: не переноси героя в другое место, не придумывай, зачем он пришёл, и не подменяй запланированные события своими.
- Если игрок спрашивает, почему он здесь или что дальше по плану, отвечай по «situation».

КОНТЕКСТ
- Перед каждым ходом ты получаешь JSON с состоянием игры. Это источник истины по механике: хиты, ресурсы, характеристики. Не противоречь ему.
"#;

fn spell_line(name: &str, id: &str, level: u8, concentration: bool, ritual: bool) -> String {
    let mut line = format!("{name} [{id}]");
    if level == 0 {
        line.push_str(", заговор");
    } else {
        line.push_str(&format!(", {level} круг"));
    }
    if concentration {
        line.push_str(", конц.");
    }
    if ritual {
        line.push_str(", ритуал");
    }
    line
}

/// Книга заклинаний в компактном виде для мастера.
fn magic_context(book: &SpellbookView) -> Value {
    let slots: Vec<String> = book
        .slots
        .iter()
        .map(|s| {
            let kind = if s.pact { " (договор, \"pact\")" } else { "" };
            format!("{} круг{kind}: {}/{}", s.level, s.pool.current(), s.pool.max())
        })
        .collect();
    let casters: Vec<Value> = book
        .casters
        .iter()
        .map(|c| {
            json!({
                "класс": c.label,
                "caster": c.id,
                "кс": c.save_dc,
                "атака": c.attack_bonus,
                "заговоры": c.cantrips.iter().map(|e| spell_line(&e.name, &e.id, 0, e.concentration, false)).collect::<Vec<_>>(),
                "готовые": c.spells.iter().map(|e| spell_line(&e.name, &e.id, e.level, e.concentration, e.ritual)).collect::<Vec<_>>(),
            })
        })
        .collect();
    let granted: Vec<String> = book
        .granted
        .iter()
        .map(|g| {
            let uses = g.uses.as_ref().map_or("неограниченно".to_string(), |p| {
                format!("{}/{}", p.current(), p.max())
            });
            format!(
                "{} — {} (на {} круге, {uses})",
                spell_line(&g.spell.name, &g.spell.id, g.spell.level, g.spell.concentration, false),
                g.source,
                g.cast_level
            )
        })
        .collect();
    let scrolls: Vec<String> = book
        .scrolls
        .iter()
        .map(|s| {
            let state = match (s.usable, s.check_dc) {
                (true, None) => "можно прочесть".to_string(),
                (true, Some(dc)) => format!("можно прочесть с проверкой КС {dc}"),
                (false, _) => {
                    "НЕЛЬЗЯ прочесть: заклинания нет в списках классов персонажа — свиток можно отдать тому, у кого оно в списке".to_string()
                }
            };
            format!("{} [{}], {} круг ×{} — {state}", s.spell.name, s.spell.id, s.level, s.count)
        })
        .collect();
    json!({
        "ячейки": slots,
        "классы": casters,
        "от_черт_и_предметов": granted,
        "свитки": scrolls,
        "подготовка_открыта": book.can_prepare,
    })
}

fn signed(v: i32) -> String {
    if v >= 0 {
        format!("+{v}")
    } else {
        format!("{v}")
    }
}

/// Итоговые числа листа для бросков: спасброски, навыки, атаки, состояния, инвентарь.
/// Мастер прибавляет модификаторы к кубам игрока, поэтому числа нужны готовыми.
fn sheet_context(c: &Character) -> Value {
    let d = c.details();
    let saves: Vec<String> = d
        .saves
        .iter()
        .map(|s| format!("{} {}{}", s.label, signed(s.total), if s.proficient { "*" } else { "" }))
        .collect();
    let skills: Vec<String> = d
        .skills
        .iter()
        .filter(|s| d.skills_listed || s.proficiency != Proficiency::None)
        .map(|s| {
            let mut line = format!("{} {}", s.name, signed(s.total));
            if !s.advantage.is_empty() {
                line.push_str(&format!(" (преимущество: {})", s.advantage.join("; ")));
            }
            line
        })
        .collect();
    let attacks: Vec<String> = d
        .attacks
        .iter()
        .map(|a| {
            let unknown =
                if a.proficiency_unknown { ", владение не указано" } else { "" };
            match (a.save_dc, &a.save_label) {
                (Some(dc), Some(save)) => {
                    format!("{}: спасбросок {save} КС {dc}, {}", a.name, a.damage)
                }
                _ => format!("{}: {} к попаданию, {}{unknown}", a.name, signed(a.to_hit), a.damage),
            }
        })
        .collect();
    let hit_dice: Vec<String> =
        d.hit_dice.iter().map(|h| format!("{}/{} d{}", h.current, h.total, h.die)).collect();
    let inventory: serde_json::Map<String, Value> =
        c.inventory_summary().into_iter().map(|(place, items)| (place, json!(items))).collect();
    json!({
        "спасброски": saves,
        "навыки": if d.skills_listed { json!(skills) } else { json!("в листе не указаны — модификатор характеристики") },
        "пассивная_внимательность": d.passive_perception,
        "атаки": attacks,
        "состояния": d.conditions,
        "истощение": d.exhaustion,
        "кости_хитов": hit_dice,
        "владения": d.proficiencies.iter().map(|l| format!("{}: {}", l.kind, l.text)).collect::<Vec<_>>(),
        "умения": d.features.iter().map(|f| format!("{} ({})", f.name, f.source)).collect::<Vec<_>>(),
        "настройка": d.attunement.iter().map(|a| a.name.clone()).collect::<Vec<_>>(),
        "ресурсы": c.resources().iter().map(|r| format!("{} [{}] {}/{}", r.name(), r.id(), r.current(), r.max())).collect::<Vec<_>>(),
        "инвентарь": inventory,
    })
}

/// Сколько последних записей журнала мастера всегда уходит в контекст.
pub const MASTER_JOURNAL_RECENT: usize = 30;
/// Сколько старых записей журнала, подходящих к заявке, добавляется сверх последних.
const MASTER_JOURNAL_FOUND: usize = 10;

fn note_json(session: &Session, n: &MasterNote) -> Value {
    let card = n.card.as_deref().map(|id| {
        let title = session.kb_cards().iter().find(|c| c.id == id).map_or(id, |c| c.title.as_str());
        format!("{title} [{id}]")
    });
    json!({
        "id": n.id,
        "день": n.day,
        "заголовок": n.title,
        "текст": n.text,
        "карточка": card,
        "записал": if n.by_player { "игрок" } else { "мастер" },
        "вид": n.kind.label(),
        "день_срабатывания": n.due_day,
        "отработано": n.done,
    })
}

fn status_label(id: &str) -> &str {
    KB_STATUSES.iter().find(|(s, _)| *s == id).map_or(id, |(_, l)| *l)
}

/// Оглавление базы знаний: карточки со статусами (с учётом изменений по ходу игры).
fn kb_index(session: &Session) -> Value {
    let mut layers = serde_json::Map::new();
    for (layer, title) in [("player", "игрок"), ("master", "мастер"), ("world", "мир")]
    {
        let lines: Vec<String> = session
            .kb_cards()
            .iter()
            .filter(|c| c.layer == layer)
            .map(|c| {
                let changed = session.kb_overrides().iter().find(|o| o.card_id == c.id);
                let status = match (changed, c.status.as_deref()) {
                    (Some(o), _) => {
                        format!(" — {} (изменено, День {})", status_label(&o.status), o.day)
                    }
                    (None, Some(s)) => format!(" — {}", status_label(s)),
                    (None, None) => String::new(),
                };
                format!("{} [{}]{status}", c.title, c.id)
            })
            .collect();
        let mut lines = lines;
        for c in session.custom_cards().iter().filter(|c| c.layer == layer) {
            let status =
                c.status.as_deref().map(|s| format!(" — {}", status_label(s))).unwrap_or_default();
            lines.push(format!(
                "{} [{}]{status} (создана по ходу игры, День {}: {})",
                c.title, c.id, c.day, c.summary
            ));
        }
        if !lines.is_empty() {
            layers.insert(title.to_string(), json!(lines));
        }
    }
    Value::Object(layers)
}

/// Записи базы знаний для мастера: все записи игрока, последние записи журнала мастера и
/// старые записи журнала, подходящие к заявке игрока.
fn notes_context(session: &Session, query: &str) -> Value {
    let player: Vec<Value> = session
        .notes()
        .iter()
        .filter(|n| n.layer == NoteLayer::Player)
        .map(|n| note_json(session, n))
        .collect();
    let journal: Vec<&MasterNote> =
        session.notes().iter().filter(|n| n.layer == NoteLayer::Master).collect();
    let recent_from = journal.len().saturating_sub(MASTER_JOURNAL_RECENT);
    let recent_ids: Vec<u64> = journal[recent_from..].iter().map(|n| n.id).collect();
    let found: Vec<Value> = session
        .notes_matching(query, NoteLayer::Master)
        .into_iter()
        .filter(|n| !recent_ids.contains(&n.id))
        .take(MASTER_JOURNAL_FOUND)
        .map(|n| note_json(session, n))
        .collect();
    json!({
        "записи_мастера_игроку": player,
        "журнал_мастера_последние": journal[recent_from..].iter().map(|n| note_json(session, n)).collect::<Vec<_>>(),
        "журнал_мастера_по_заявке": found,
        "всего_в_журнале": journal.len(),
    })
}

/// Контекст хода в JSON.
///
/// `query` — последняя заявка игрока (по ней подбираются старые записи журнала мастера);
/// `kb_extra` — полный текст карточек базы, подходящих к заявке (подбирает интерфейс).
pub fn turn_context(session: &mut Session, query: &str, kb_extra: &str) -> Value {
    let pool = [
        ("d20", 8u32, 20u32),
        ("d4", 4, 4),
        ("d6", 8, 6),
        ("d8", 6, 8),
        ("d10", 4, 10),
        ("d12", 4, 12),
    ]
    .into_iter()
    .map(|(name, count, sides)| {
        let values = session
            .roll_expression(&format!("{count}d{sides}"), false)
            .map(|r| r.groups.into_iter().flat_map(|g| g.values).collect::<Vec<_>>())
            .unwrap_or_default();
        (name.to_string(), json!(values))
    })
    .collect::<serde_json::Map<_, _>>();

    let party = session.party_view();
    let player =
        session.party().iter().find(|c| c.kind == CharacterKind::Player).map(|c| c.sheet());

    json!({
        "сцена": party.scene,
        "отряд": party.members.iter().map(|m| json!({
            "id": m.id,
            "имя": m.name,
            "кто": m.summary,
            "хиты": format!("{}/{}", m.hit_points.current, m.hit_points.max),
            "кд": m.armor_class,
            "где": m.location,
            "в_сцене": m.in_scene,
        })).collect::<Vec<_>>(),
        "персонаж_игрока": player,
        "листы": session.party().iter().map(|c| (c.id.clone(), sheet_context(c))).collect::<serde_json::Map<_, _>>(),
        "записи_базы_знаний": notes_context(session, query),
        "предложения_листа_ждут_игрока": session.sheet_proposals().iter().map(|p| format!("{} — {} ({})", p.character_name, p.summary, p.reason)).collect::<Vec<_>>(),
        "сработавшие_таймеры": session.due_notes().iter().map(|n| note_json(session, n)).collect::<Vec<_>>(),
        "напоминание_о_записях": (session.turns_without_notes() >= NOTE_REMINDER_TURNS).then(|| format!(
            "Уже {} ходов без записей в базу знаний — запиши важное: события, тайны, планы NPC, таймеры.",
            session.turns_without_notes()
        )),
        "карточки_базы": kb_index(session),
        "карточки_по_заявке": kb_extra,
        "магия": session.party().iter().filter_map(|c| {
            let book = c.spellbook()?;
            Some((c.id.clone(), magic_context(&book)))
        }).collect::<serde_json::Map<_, _>>(),
        "журнал_движка": session.engine_log(),
        "казна_всего_зм": party.treasury_total / 100,
        "казна": session.treasury_view().locations.iter().filter(|l| !l.lines.is_empty()).map(|l| json!({
            "место": l.name,
            "id": l.id,
            "состав": l.lines.iter().map(|h| format!("{} [{}] ×{}", h.name, h.asset_id, h.quantity)).collect::<Vec<_>>(),
        })).collect::<Vec<_>>(),
        "кубы_мастера": pool,
    })
}

/// Полный системный текст: кодекс и контекст хода.
pub fn system_text(context: &Value) -> String {
    format!(
        "{CODEX}\nСОСТОЯНИЕ ИГРЫ НА ЭТОТ ХОД (JSON):\n{}",
        serde_json::to_string_pretty(context).unwrap_or_default()
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    #[test]
    fn context_contains_state_and_dice_pool() {
        let mut session = Session::demo(Xoshiro256::from_seed(1));
        let context = turn_context(&mut session, "", "");
        assert_eq!(context["сцена"]["day"], 82);
        assert!(context["сцена"]["situation"].as_str().unwrap().contains("Кроу-Рок"));
        assert_eq!(context["отряд"].as_array().unwrap().len(), 6);
        assert_eq!(context["персонаж_игрока"]["name"], "Сэр Никис Стрэндж");
        let d20 = context["кубы_мастера"]["d20"].as_array().unwrap();
        assert_eq!(d20.len(), 8);
        assert!(d20.iter().all(|v| (1..=20).contains(&v.as_u64().unwrap())));
        let text = system_text(&context);
        assert!(text.starts_with("Ты — Мастер"));
        assert!(text.contains("кубы_мастера"));
    }

    #[test]
    fn context_contains_spellbooks_and_engine_log() {
        let mut session = Session::demo(Xoshiro256::from_seed(1));
        session.cast_spell("pc.nikis", &dnd_engine::CastRequest::new("misty-step")).unwrap();
        let context = turn_context(&mut session, "", "");
        let nikis = &context["магия"]["pc.nikis"];
        assert_eq!(nikis["ячейки"][0], "4 круг (договор, \"pact\"): 1/2");
        assert_eq!(nikis["классы"][0]["кс"], 16);
        let ready = nikis["классы"][0]["готовые"].as_array().unwrap();
        assert!(ready.iter().any(|v| v == "Туманный шаг [misty-step], 2 круг"));
        assert!(context["магия"]["npc.valeria"].is_object());
        assert!(context["магия"].get("npc.corvus").is_none());
        assert!(context["журнал_движка"][0].as_str().unwrap().contains("Туманный шаг"));
        assert!(system_text(&context).contains("```engine"));
    }

    #[test]
    fn context_contains_sheets_inventory_treasury_and_notes() {
        let mut session = Session::demo(Xoshiro256::from_seed(1));
        session.add_note(dnd_engine::NoteLayer::Master, "План Вернера", "Ждёт обоз").unwrap();
        let context = turn_context(&mut session, "", "");
        let nikis = &context["листы"]["pc.nikis"];
        assert!(nikis["спасброски"].as_array().unwrap().iter().any(|v| v == "ЛОВ +6*"));
        assert!(nikis["навыки"]
            .as_array()
            .unwrap()
            .iter()
            .any(|v| v.as_str().unwrap().starts_with("Ловкость рук +15")));
        assert_eq!(nikis["пассивная_внимательность"], 15);
        assert!(nikis["инвентарь"]["Кольцо Теневого Хранилища"].is_array());
        assert!(context["листы"]["npc.corvus"]["навыки"].is_string());
        let valeria_attacks = context["листы"]["npc.valeria"]["атаки"].as_array().unwrap();
        assert!(valeria_attacks
            .iter()
            .any(|v| v.as_str().unwrap().starts_with("Погребальный звон: спасбросок МДР КС 16")));
        assert_eq!(
            context["записи_базы_знаний"]["журнал_мастера_последние"][0]["заголовок"],
            "План Вернера"
        );
        assert!(context["казна"].as_array().unwrap().iter().any(|l| l["id"] == "purse"));
    }

    #[test]
    fn journal_is_trimmed_but_old_matches_are_found() {
        let mut session = Session::demo(Xoshiro256::from_seed(3));
        session.add_note(NoteLayer::Master, "Засада Вернера", "Ждёт обоз у брода").unwrap();
        for i in 0..MASTER_JOURNAL_RECENT {
            session.add_note(NoteLayer::Master, &format!("Пустяк {i}"), "x").unwrap();
        }
        session.add_note(NoteLayer::Player, "Пароль", "Серый рассвет").unwrap();
        let context = turn_context(&mut session, "Проверим брод перед обозом", "Карточка: брод");
        let notes = &context["записи_базы_знаний"];
        assert_eq!(
            notes["журнал_мастера_последние"].as_array().unwrap().len(),
            MASTER_JOURNAL_RECENT
        );
        assert_eq!(notes["журнал_мастера_по_заявке"][0]["заголовок"], "Засада Вернера");
        assert_eq!(notes["записи_мастера_игроку"].as_array().unwrap().len(), 1);
        assert_eq!(context["карточки_по_заявке"], "Карточка: брод");
        session.set_kb_cards(vec![dnd_engine::KbCard {
            id: "goal.astrolabe".into(),
            title: "Астролябия".into(),
            layer: "player".into(),
            status: Some("progress".into()),
        }]);
        session.set_card_status("goal.astrolabe", Some("done"), "").unwrap();
        let context = turn_context(&mut session, "", "");
        let line = context["карточки_базы"]["игрок"][0].as_str().unwrap();
        assert!(line.contains("выполнено (изменено"), "{line}");
    }

    #[test]
    fn each_turn_gets_fresh_dice() {
        let mut session = Session::demo(Xoshiro256::from_seed(2));
        let a = turn_context(&mut session, "", "")["кубы_мастера"].clone();
        let b = turn_context(&mut session, "", "")["кубы_мастера"].clone();
        assert_ne!(a, b);
    }
}
