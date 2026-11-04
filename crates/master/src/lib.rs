//! Системный промпт ИИ-мастера и контекст хода.
//!
//! Промпт — машинная версия «Кодекса и Руководства Мастера» кампании. Контекст собирается
//! заново к каждому ходу из движка: сцена, отряд, лист персонажа игрока и кубы мастера.
//!
//! Крейт общий для приложения (мастер на Gemini и других провайдерах) и веб-версии
//! (мастер на Claude), поэтому правила мастера везде одинаковые.

mod directives;

pub use directives::{apply_directives, strip_directives, MasterAction, MasterTurn};

use dnd_engine::{CharacterKind, Session, SpellbookView};
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
- Ячейка без заклинания (например, Божественная кара паладина): {"cmd":"slot","character":"npc.gunther","level":1,"spend":true}. Вернуть ячейку: "spend":false.
- Восстановить ячейку предметом: {"cmd":"restore","character":"pc.nikis","item":"item.pact_rod.slot","level":"pact"}.
- Подготовка после длительного отдыха: {"cmd":"prepare","character":"npc.valeria","caster":"cleric","spells":["bless","healing-word"]}.
- Несколько команд — по одной JSON-строке в блоке. Игрок блок не видит: движок выполнит команды и покажет итог в чате.
- Не утверждай в тексте, сколько ячеек осталось: это покажет движок. Если движок отказал, причина будет в «журнал_движка» на следующем ходу — исправь повествование (заклинание не сработало, нужна другая ячейка и т. п.).
- Заклинания персонажа игрока тратятся только по его заявке. Если игрок сам нажал «Сотворить» в листе, это уже есть в «журнал_движка» — не списывай повторно.
- Свиток можно прочесть, только если заклинание есть в списке класса персонажа; движок проверяет это сам.

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
        .filter(|s| s.usable)
        .map(|s| format!("{} [{}], {} круг ×{}", s.spell.name, s.spell.id, s.level, s.count))
        .collect();
    json!({
        "ячейки": slots,
        "классы": casters,
        "от_черт_и_предметов": granted,
        "свитки_доступные": scrolls,
        "подготовка_открыта": book.can_prepare,
    })
}

/// Контекст хода в JSON.
pub fn turn_context(session: &mut Session) -> Value {
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
        "магия": session.party().iter().filter_map(|c| {
            let book = c.spellbook()?;
            Some((c.id.clone(), magic_context(&book)))
        }).collect::<serde_json::Map<_, _>>(),
        "журнал_движка": session.engine_log(),
        "казна_всего_зм": party.treasury_total / 100,
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
        let context = turn_context(&mut session);
        assert_eq!(context["сцена"]["day"], 82);
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
        let context = turn_context(&mut session);
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
    fn each_turn_gets_fresh_dice() {
        let mut session = Session::demo(Xoshiro256::from_seed(2));
        let a = turn_context(&mut session)["кубы_мастера"].clone();
        let b = turn_context(&mut session)["кубы_мастера"].clone();
        assert_ne!(a, b);
    }
}
