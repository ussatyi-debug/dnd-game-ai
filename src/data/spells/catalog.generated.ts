// Сгенерировано scripts/build-spells.ts из data/spells — не править вручную.
// Заклинания SRD 5.1 © Wizards of the Coast LLC, лицензия CC-BY-4.0
// (https://creativecommons.org/licenses/by/4.0/); перевод на русский — проект dnd-game-ai.

import type { SpellData } from "./types.ts";

export const SPELLS: SpellData[] = [
 {
  "id": "acid-arrow",
  "name": "Кислотная стрела",
  "nameEn": "Acid Arrow",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "90 фт",
  "components": "В, С, М (толчёный лист ревеня и желудок гадюки)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "К цели в пределах дистанции устремляется мерцающая зелёная стрела и разлетается брызгами кислоты. Совершите по цели дальнобойную атаку заклинанием. При попадании цель сразу получает 4d4 урона кислотой и ещё 2d4 урона кислотой в конце своего следующего хода. При промахе стрела обрызгивает цель кислотой: та получает половину начального урона и не получает урона в конце своего следующего хода."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон (и начальный, и последующий) увеличивается на 1d4 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "acid-splash",
  "name": "Брызги кислоты",
  "nameEn": "Acid Splash",
  "level": 0,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы бросаете пузырь кислоты. Выберите одно существо в пределах дистанции или двух существ в пределах дистанции, находящихся не дальше 5 футов друг от друга. Цель должна преуспеть в спасброске Ловкости, иначе получит 1d6 урона кислотой.",
   "Урон заклинания увеличивается на 1d6, когда вы достигаете 5-го уровня (2d6), 11-го уровня (3d6) и 17-го уровня (4d6)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "aid",
  "name": "Подмога",
  "nameEn": "Aid",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (крошечная полоска белой ткани)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Заклинание укрепляет стойкость и решимость ваших союзников. Выберите до трёх существ в пределах дистанции. Максимум и текущее значение хитов каждой цели увеличиваются на 5 на время действия заклинания."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, хиты цели увеличиваются ещё на 5 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "alarm",
  "name": "Тревога",
  "nameEn": "Alarm",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 минута",
  "range": "30 фт (куб 20 фт)",
  "components": "В, С, М (крошечный колокольчик и кусочек тонкой серебряной проволоки)",
  "duration": "8 часов",
  "ritual": true,
  "concentration": false,
  "classes": [
   "ranger",
   "wizard"
  ],
  "desc": [
   "Вы ставите сигнализацию от непрошеных гостей. Выберите дверь, окно или область в пределах дистанции размером не больше куба с ребром 20 футов. Пока заклинание действует, тревога оповещает вас каждый раз, когда существо размером Крошечное или больше касается охраняемой области или входит в неё. Накладывая заклинание, вы можете указать существ, которые тревогу не поднимут. Вы также выбираете, будет тревога мысленной или слышимой.",
   "Мысленная тревога оповещает вас звоном в голове, если вы находитесь не дальше 1 мили от охраняемой области. Этот звон будит вас, если вы спите.",
   "Слышимая тревога 10 секунд звучит как ручной колокольчик, слышный в пределах 60 футов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "alter-self",
  "name": "Изменение внешности",
  "nameEn": "Alter Self",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы принимаете иной облик. Накладывая заклинание, выберите один из вариантов ниже; его эффект длится, пока действует заклинание. Пока заклинание действует, вы можете действием прекратить один вариант и получить преимущества другого.",
   "***Водное приспособление.*** Ваше тело приспосабливается к водной среде: появляются жабры, между пальцами вырастают перепонки. Вы можете дышать под водой и получаете скорость плавания, равную скорости ходьбы.",
   "***Изменение внешности.*** Вы меняете свою внешность: рост, вес, черты лица, звук голоса, длину и цвет волос, особые приметы. Можно выглядеть представителем другой расы, но ваши параметры не меняются. Нельзя выглядеть существом другого размера, а базовое строение тела сохраняется: например, двуногий не может стать четвероногим. В любой момент действия заклинания вы можете действием снова изменить внешность этим способом.",
   "***Природное оружие.*** У вас вырастают когти, клыки, шипы, рога или иное природное оружие на ваш выбор. Ваши безоружные удары причиняют 1d6 дробящего, колющего или рубящего урона (по виду оружия), и вы владеете безоружными ударами. Природное оружие считается магическим и даёт бонус +1 к броскам атаки и урона."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "animal-friendship",
  "name": "Дружба с животными",
  "nameEn": "Animal Friendship",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (кусочек еды)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "Заклинание позволяет убедить зверя, что вы не желаете ему зла. Выберите видимого вами зверя в пределах дистанции. Он должен видеть и слышать вас. Если Интеллект зверя 4 или выше, заклинание не срабатывает. В остальных случаях зверь должен преуспеть в спасброске Мудрости, иначе будет очарован вами, пока действует заклинание. Если вы или ваши спутники причините цели вред, заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "animal-messenger",
  "name": "Посланник животных",
  "nameEn": "Animal Messenger",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (кусочек еды)",
  "duration": "24 часа",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "С помощью этого заклинания вы отправляете с животным послание. Выберите видимого вами Крошечного зверя в пределах дистанции — например, белку, сойку или летучую мышь. Вы указываете место, в котором уже бывали, и получателя по общему описанию, например «мужчина или женщина в форме городской стражи» или «рыжий дварф в остроконечной шляпе». Вы также произносите послание длиной до двадцати пяти слов. Пока действует заклинание, зверь движется к указанному месту, преодолевая около 50 миль за сутки, если летает, или 25 миль для остальных животных.",
   "Добравшись, посланник передаёт послание описанному вами существу, воспроизводя звук вашего голоса. Он обращается только к существу, подходящему под описание. Если посланник не доберётся до цели до окончания заклинания, послание теряется, а зверь возвращается туда, где вы наложили заклинание."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, длительность увеличивается на 48 часов за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "animal-shapes",
  "name": "Облик зверя",
  "nameEn": "Animal Shapes",
  "level": 8,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 24 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Your magic turns others into beasts. Choose any number of willing creatures that you can see within range. You transform each target into the form of a Large or smaller beast with a challenge rating of 4 or lower. On subsequent turns, you can use your action to transform affected creatures into new forms.",
   "The transformation lasts for the duration for each target, or until the target drops to 0 hit points or dies. You can choose a different form for each target. A target's game statistics are replaced by the statistics of the chosen beast, though the target retains its alignment and Intelligence, Wisdom, and Charisma scores. The target assumes the hit points of its new form, and when it reverts to its normal form, it returns to the number of hit points it had before it transformed. If it reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious. The creature is limited in the actions it can perform by the nature of its new form, and it can't speak or cast spells.",
   "The target's gear melds into the new form. The target can't activate, wield, or otherwise benefit from any of its equipment."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "animate-dead",
  "name": "Восставший труп",
  "nameEn": "Animate Dead",
  "level": 3,
  "school": "Некромантия",
  "castingTime": "1 минута",
  "range": "10 фт",
  "components": "В, С, М (капля крови, кусочек плоти и щепотка костной пыли)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "Заклинание создаёт слугу-нежить. Выберите в пределах дистанции груду костей или труп гуманоида Среднего или Маленького размера. Заклинание наделяет цель мерзким подобием жизни и поднимает её как нежить. Если вы выбрали кости, цель становится скелетом, если труп — зомби (параметры существа у Мастера).",
   "В каждый свой ход вы можете бонусным действием мысленно приказать любому существу, созданному этим заклинанием, если оно в пределах 60 футов от вас (если существ несколько, можно приказать любым или всем одновременно, отдав каждому один и тот же приказ). Вы решаете, какое действие существо совершит и куда переместится в свой следующий ход, или отдаёте общий приказ, например охранять определённый зал или коридор. Без приказов существо лишь защищается от враждебных существ. Получив приказ, существо выполняет его, пока задача не будет решена.",
   "Существо подчиняется вам 24 часа, после чего перестаёт выполнять ваши приказы. Чтобы сохранить контроль ещё на 24 часа, нужно снова наложить на существо это заклинание до окончания текущих суток. Такое накладывание возобновляет контроль над четырьмя существами, поднятыми этим заклинанием, вместо создания нового."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, за каждый круг ячейки выше 3-го вы поднимаете или возобновляете контроль над двумя дополнительными существами-нежитью. Каждое существо должно происходить из отдельного трупа или груды костей."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "animate-objects",
  "name": "Оживление вещей",
  "nameEn": "Animate Objects",
  "level": 5,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Предметы оживают по вашей команде. Выберите до десяти немагических предметов в пределах дистанции, которые никто не носит и не несёт. Средняя цель считается за два предмета, Большая — за четыре, Огромная — за восемь. Предметы крупнее Огромного оживить нельзя. Каждая цель оживает и становится существом под вашим контролем до окончания заклинания или пока её хиты не опустятся до 0.",
   "Бонусным действием вы можете мысленно приказать любому существу, созданному этим заклинанием, если оно в пределах 500 футов от вас (если существ несколько, можно приказать любым или всем одновременно, отдав каждому один и тот же приказ). Вы решаете, какое действие существо совершит и куда переместится в свой следующий ход, или отдаёте общий приказ, например охранять определённый зал или коридор. Без приказов существо лишь защищается от враждебных существ. Получив приказ, существо выполняет его, пока задача не будет решена.",
   "***Параметры оживлённых предметов***",
   "| Размер | Хиты | КД | Атака | Сил | Лов |\n|---|---|---|---|---|---|\n| Крошечный | 20 | 18 | +8 к попаданию, 1d4 + 4 урона | 4 | 18 |\n| Маленький | 25 | 16 | +6 к попаданию, 1d8 + 2 урона | 6 | 14 |\n| Средний | 40 | 13 | +5 к попаданию, 2d6 + 1 урона | 10 | 12 |\n| Большой | 50 | 10 | +6 к попаданию, 2d10 + 2 урона | 14 | 10 |\n| Огромный | 80 | 10 | +8 к попаданию, 2d12 + 4 урона | 18 | 6 |",
   "Оживлённый предмет — конструкт, у которого КД, хиты, атаки, Сила и Ловкость зависят от размера. Его Телосложение 10, Интеллект и Мудрость 3, Харизма 1. Скорость 30 футов; если у предмета нет ног или иных конечностей для передвижения, у него вместо этого скорость полёта 30 футов, и он может парить. Если предмет надёжно закреплён на поверхности или более крупном предмете (например, цепь, прикованная к стене), его скорость 0. У него слепое зрение в радиусе 30 футов, за этим пределом он слеп. Когда хиты оживлённого предмета опускаются до 0, он снова становится обычным предметом, а оставшийся урон переносится на этот предмет.",
   "Если вы приказываете предмету атаковать, он может совершить одну рукопашную атаку по существу в пределах 5 футов от себя — удар с бонусом атаки и дробящим уроном по его размеру. Мастер может решить, что конкретный предмет из-за своей формы причиняет рубящий или колющий урон."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, за каждый круг ячейки выше 5-го можно оживить на два предмета больше."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "antilife-shell",
  "name": "Преграда жизни",
  "nameEn": "Antilife Shell",
  "level": 5,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 10 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "От вас на 10 футов расходится мерцающий барьер. Он перемещается вместе с вами, оставаясь с центром на вас, и не подпускает существ, кроме нежити и конструктов. Барьер держится, пока действует заклинание.",
   "Затронутое существо не может пройти сквозь барьер или дотянуться через него. Оно может накладывать сквозь барьер заклинания и атаковать дальнобойным оружием или оружием с досягаемостью.",
   "Если вы перемещаетесь так, что затронутое существо вынуждено пройти сквозь барьер, заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "antimagic-field",
  "name": "Поле антимагии",
  "nameEn": "Antimagic Field",
  "level": 8,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 10 фт)",
  "components": "В, С, М (A pinch of powdered iron or iron filings.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you.",
   "Spells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can't protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration.",
   "***Targeted Effects.*** Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target.",
   "***Areas of Magic.*** The area of another spell or magical effect, such as fireball, can't extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed. For example, the flames created by a wall of fire are suppressed within the sphere, creating a gap in the wall if the overlap is large enough.",
   "***Spells.*** Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it.",
   "***Magic Items.*** The properties and powers of magic items are suppressed in the sphere. For example, a +1 longsword in the sphere functions as a nonmagical longsword.",
   "A magic weapon's properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or a piece of magic ammunition fully leaves the sphere (for example, if you fire a magic arrow or throw a magic spear at a target outside the sphere), the magic of the item ceases to be suppressed as soon as it exits.",
   "***Magical Travel.*** Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere.",
   "***Creatures and Objects.*** A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere.",
   "***Dispel Magic.*** Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don't nullify each other."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "antipathy-sympathy",
  "name": "Антипатия/симпатия",
  "nameEn": "Antipathy/Sympathy",
  "level": 8,
  "school": "Очарование",
  "castingTime": "1 час",
  "range": "60 фт (куб 200 фт)",
  "components": "В, С, М (Either a lump of alum soaked in vinegar for the antipathy effect or a drop of honey for the sympathy effect.)",
  "duration": "10 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "This spell attracts or repels creatures of your choice. You target something within range, either a Huge or smaller object or creature or an area that is no larger than a 200-foot cube. Then specify a kind of intelligent creature, such as red dragons, goblins, or vampires. You invest the target with an aura that either attracts or repels the specified creatures for the duration. Choose antipathy or sympathy as the aura's effect.",
   "***Antipathy.*** The enchantment causes creatures of the kind you designated to feel an intense urge to leave the area and avoid the target. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a wisdom saving throw or become frightened. The creature remains frightened while it can see the target or is within 60 feet of it. While frightened by the target, the creature must use its movement to move to the nearest safe spot from which it can't see the target. If the creature moves more than 60 feet from the target and can't see it, the creature is no longer frightened, but the creature becomes frightened again if it regains sight of the target or moves within 60 feet of it.",
   "***Sympathy.*** The enchantment causes the specified creatures to feel an intense urge to approach the target while within 60 feet of it or able to see it. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a wisdom saving throw or use its movement on each of its turns to enter the area or move within reach of the target. When the creature has done so, it can't willingly move away from the target.",
   "If the target damages or otherwise harms an affected creature, the affected creature can make a wisdom saving throw to end the effect, as described below.",
   "***Ending the Effect.*** If an affected creature ends its turn while not within 60 feet of the target or able to see it, the creature makes a wisdom saving throw. On a successful save, the creature is no longer affected by the target and recognizes the feeling of repugnance or attraction as magical. In addition, a creature affected by the spell is allowed another wisdom saving throw every 24 hours while the spell persists.",
   "A creature that successfully saves against this effect is immune to it for 1 minute, after which time it can be affected again."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "arcane-eye",
  "name": "Магический глаз",
  "nameEn": "Arcane Eye",
  "level": 4,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "30 фт (сфера радиусом 30 фт)",
  "components": "В, С, М (клочок шерсти летучей мыши)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "Вы создаёте в пределах дистанции невидимый магический глаз, который парит в воздухе, пока действует заклинание.",
   "Вы мысленно получаете зрительные образы от глаза. Он обладает обычным зрением и тёмным зрением на 30 футов и смотрит во все стороны сразу.",
   "Действием вы можете переместить глаз на расстояние до 30 футов в любом направлении. Глаз может удаляться от вас на любое расстояние, но не может перейти на другой план бытия. Сплошная преграда останавливает глаз, но он проходит сквозь отверстие диаметром от 1 дюйма."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "arcane-hand",
  "name": "Чародейская рука",
  "nameEn": "Arcane Hand",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (яичная скорлупа и перчатка из змеиной кожи)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы создаёте Большую руку из мерцающей полупрозрачной силы в видимом вами свободном пространстве в пределах дистанции. Рука существует, пока действует заклинание, и движется по вашей команде, повторяя движения вашей руки.",
   "Рука — предмет с КД 20 и хитами, равными максимуму ваших хитов. Если её хиты опускаются до 0, заклинание заканчивается. Её Сила 26 (+8), Ловкость 10 (+0). Рука не заполняет своё пространство.",
   "Накладывая заклинание и бонусным действием в последующие ходы, вы можете переместить руку на расстояние до 60 футов и вызвать ею один из эффектов ниже.",
   "***Сжатый кулак.*** Рука бьёт существо или предмет в пределах 5 футов от себя. Совершите за руку рукопашную атаку заклинанием, используя свои параметры. При попадании цель получает 4d8 урона силовым полем.",
   "***Сильная рука.*** Рука пытается оттолкнуть существо в пределах 5 футов от себя в выбранном вами направлении. Совершите проверку Силы руки против проверки Силы (Атлетика) цели. Если цель Средняя или меньше, вы совершаете проверку с преимуществом. При успехе рука отталкивает цель на 5 футов плюс расстояние в футах, равное пятикратному модификатору вашей заклинательной характеристики. Рука движется вместе с целью, оставаясь в пределах 5 футов от неё.",
   "***Хватающая рука.*** Рука пытается схватить существо размером Огромный или меньше в пределах 5 футов от себя. Для захвата используется Сила руки. Если цель Средняя или меньше, вы совершаете проверку с преимуществом. Пока рука держит цель, вы можете бонусным действием сдавить её; цель получает дробящий урон, равный 2d6 + модификатор вашей заклинательной характеристики.",
   "***Заслоняющая рука.*** Рука встаёт между вами и выбранным вами существом, пока вы не дадите ей другую команду. Она перемещается, оставаясь между вами и целью, и даёт вам укрытие на половину от цели. Цель не может пройти через пространство руки, если её Сила не выше Силы руки. Если Сила цели выше, она может двигаться к вам через пространство руки, но оно для неё — труднопроходимая местность."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, за каждый круг ячейки выше 5-го урон сжатого кулака увеличивается на 2d8, а урон хватающей руки — на 2d6."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "arcane-lock",
  "name": "Волшебный замок",
  "nameEn": "Arcane Lock",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (золотая пыль стоимостью не меньше 25 зм, которую заклинание расходует)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы касаетесь закрытой двери, окна, ворот, сундука или иного входа, и он оказывается заперт, пока действует заклинание. Вы и существа, указанные при накладывании, открываете его обычным образом. Можно также задать пароль: произнесённый в пределах 5 футов от предмета, он подавляет заклинание на 1 минуту. В остальных случаях пройти нельзя, пока предмет не сломают или заклинание не рассеют или не подавят. Заклинание «Открывание», наложенное на предмет, подавляет «Волшебный замок» на 10 минут.",
   "Пока действует заклинание, предмет труднее сломать или открыть силой: КС, чтобы сломать его или взломать любые его замки, увеличивается на 10."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "arcane-sword",
  "name": "Волшебный меч",
  "nameEn": "Arcane Sword",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (A miniature platinum sword with a grip and pommel of copper and zinc, worth 250 gp.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "You create a sword-shaped plane of force that hovers within range. It lasts for the duration.",
   "When the sword appears, you make a melee spell attack against a target of your choice within 5 feet of the sword. On a hit, the target takes 3d10 force damage. Until the spell ends, you can use a bonus action on each of your turns to move the sword up to 20 feet to a spot you can see and repeat this attack against the same target or a different one."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "arcanists-magic-aura",
  "name": "Магическая аура",
  "nameEn": "Arcanist's Magic Aura",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (маленький квадратный лоскут шёлка)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы накладываете иллюзию на существо или предмет, которого касаетесь, чтобы заклинания прорицания получали о нём ложные сведения. Целью может быть согласное существо или предмет, который никто не несёт и не носит.",
   "Накладывая заклинание, выберите один или оба эффекта ниже. Эффект длится, пока действует заклинание. Если 30 дней подряд накладывать заклинание на одно и то же существо или предмет с тем же эффектом, иллюзия держится, пока её не рассеют.",
   "***Ложная аура.*** Вы меняете то, как цель воспринимают заклинания и магические эффекты, обнаруживающие магические ауры, например «Обнаружение магии». Можно сделать немагический предмет магическим на вид, магический — немагическим, или изменить ауру так, чтобы она казалась принадлежащей выбранной вами школе магии. Используя эффект на предмете, вы можете сделать ложную магию заметной для любого, кто возьмёт предмет в руки.",
   "***Маска.*** Вы меняете то, как цель воспринимают заклинания и магические эффекты, определяющие вид существ, например Божественное чувство паладина или условие срабатывания заклинания «Символ». Выберите вид существ: другие заклинания и магические эффекты будут считать цель существом этого вида или этого мировоззрения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "armor-of-agathys",
  "name": "Доспех Агатиса",
  "nameEn": "Armor of Agathys",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (чаша воды)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "warlock"
  ],
  "desc": [
   "Тело заклинателя покрывает призрачная корка инея. Он получает 5 временных хитов на время действия заклинания.",
   "Пока эти временные хиты не закончились, любое существо, попавшее по заклинателю рукопашной атакой, получает 5 урона холодом.",
   "Заклинание заканчивается досрочно, когда временные хиты, полученные от него, израсходованы."
  ],
  "higher": [
   "За каждый круг ячейки выше 1-го и временные хиты, и урон холодом увеличиваются на 5."
  ],
  "translated": true,
  "source": "custom",
  "sourceNote": "Книга игрока (механика, описание своими словами)"
 },
 {
  "id": "astral-projection",
  "name": "Проекция в астрал",
  "nameEn": "Astral Projection",
  "level": 9,
  "school": "Некромантия",
  "castingTime": "1 час",
  "range": "10 фт",
  "components": "В, С, М (For each creature you affect with this spell, you must provide one jacinth worth at least 1,000gp and one ornately carved bar of silver worth at least 100gp, all of which the spell consumes.)",
  "duration": "Особая",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell fails and the casting is wasted if you are already on that plane). The material body you leave behind is unconscious and in a state of suspended animation; it doesn't need food or air and doesn't age.",
   "Your astral body resembles your mortal form in almost every way, replicating your game statistics and possessions. The principal difference is the addition of a silvery cord that extends from between your shoulder blades and trails behind you, fading to invisibility after 1 foot. This cord is your tether to your material body. As long as the tether remains intact, you can find your way home. If the cord is cut--something that can happen only when an effect specifically states that it does--your soul and body are separated, killing you instantly.",
   "Your astral form can freely travel through the Astral Plane and can pass through portals there leading to any other plane. If you enter a new plane or return to the plane you were on when casting this spell, your body and possessions are transported along the silver cord, allowing you to re-enter your body as you enter the new plane. Your astral form is a separate incarnation. Any damage or other effects that apply to it have no effect on your physical body, nor do they persist when you return to it.",
   "The spell ends for you and your companions when you use your action to dismiss it. When the spell ends, the affected creature returns to its physical body, and it awakens.",
   "The spell might also end early for you or one of your companions. A successful dispel magic spell used against an astral or physical body ends the spell for that creature. If a creature's original body or its astral form drops to 0 hit points, the spell ends for that creature. If the spell ends and the silver cord is intact, the cord pulls the creature's astral form back to its body, ending its state of suspended animation.",
   "If you are returned to your body prematurely, your companions remain in their astral forms and must find their own way back to their bodies, usually by dropping to 0 hit points."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "augury",
  "name": "Гадание",
  "nameEn": "Augury",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В, С, М (особым образом помеченные палочки, кости или подобные предметы стоимостью не меньше 25 зм)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Бросая палочки, инкрустированные самоцветами, кости дракона, раскладывая узорчатые карты или используя иной инструмент гадания, вы получаете от потусторонней сущности знамение о результатах конкретного действия, которое собираетесь совершить в ближайшие 30 минут. Мастер выбирает одно из знамений:",
   "- Удача — к хорошим последствиям",
   "- Беда — к плохим последствиям",
   "- Удача и беда — и к хорошим, и к плохим последствиям",
   "- Ничего — последствия ни особенно хороши, ни особенно плохи",
   "Заклинание не учитывает обстоятельства, способные изменить исход, например наложение других заклинаний или появление и потерю спутников.",
   "Если наложить заклинание два раза или больше до окончания следующего длительного отдыха, за каждое накладывание после первого появляется накопительный шанс 25 процентов получить случайный ответ. Мастер бросает его втайне."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "awaken",
  "name": "Пробуждение",
  "nameEn": "Awaken",
  "level": 5,
  "school": "Преобразование",
  "castingTime": "8 часов",
  "range": "Касание",
  "components": "В, С, М (агат стоимостью не меньше 1 000 зм, который заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid"
  ],
  "desc": [
   "Потратив время накладывания на вычерчивание магических путей внутри драгоценного камня, вы касаетесь зверя или растения размером Огромный или меньше. У цели не должно быть Интеллекта, либо он должен быть 3 или ниже. Цель получает Интеллект 10 и способность говорить на одном известном вам языке. Растение также получает способность двигать ветвями, корнями, лозами, побегами и прочим, и чувства, подобные человеческим. Мастер выбирает подходящие параметры пробуждённого растения, например пробуждённого куста или пробуждённого дерева.",
   "Пробуждённый зверь или растение очарован вами на 30 дней или пока вы или ваши спутники не причините ему вред. Когда очарование заканчивается, пробуждённое существо само решает, оставаться ли дружелюбным, в зависимости от того, как вы с ним обращались."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "bane",
  "name": "Порча",
  "nameEn": "Bane",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (капля крови)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric"
  ],
  "desc": [
   "До трёх выбранных вами видимых существ в пределах дистанции должны совершить спасброски Харизмы. Каждый раз, когда провалившая спасбросок цель до окончания заклинания совершает бросок атаки или спасбросок, она должна бросить d4 и вычесть выпавшее число из результата."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "banishment",
  "name": "Изгнание",
  "nameEn": "Banishment",
  "level": 4,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (предмет, неприятный цели)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь отправить одно видимое вами существо в пределах дистанции на другой план бытия. Цель должна преуспеть в спасброске Харизмы, иначе будет изгнана.",
   "Если цель родом с плана, на котором вы находитесь, вы изгоняете её на безопасный демиплан. Там цель недееспособна. Она остаётся там до окончания заклинания, а затем появляется в пространстве, которое покинула, или в ближайшем свободном, если оно занято.",
   "Если цель родом с другого плана бытия, она с тихим хлопком изгоняется на свой родной план. Если заклинание заканчивается раньше, чем пройдёт 1 минута, цель появляется в пространстве, которое покинула, или в ближайшем свободном, если оно занято. Иначе цель не возвращается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, за каждый круг ячейки выше 4-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "barkskin",
  "name": "Дубовая кора",
  "nameEn": "Barkskin",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (горсть дубовой коры)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы касаетесь согласного существа. До окончания заклинания его кожа становится грубой, похожей на кору, а КД цели не может быть ниже 16, какой бы доспех она ни носила."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "beacon-of-hope",
  "name": "Маяк надежды",
  "nameEn": "Beacon of Hope",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Заклинание дарует надежду и жизненные силы. Выберите любое количество существ в пределах дистанции. Пока действует заклинание, каждая цель совершает с преимуществом спасброски Мудрости и спасброски от смерти и восстанавливает максимально возможное количество хитов от любого лечения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "bestow-curse",
  "name": "Проклятие",
  "nameEn": "Bestow Curse",
  "level": 3,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь существа, и оно должно преуспеть в спасброске Мудрости, иначе будет проклято, пока действует заклинание. Накладывая заклинание, выберите природу проклятия:",
   "- Выберите характеристику. Пока цель проклята, она совершает с помехой проверки и спасброски этой характеристики.",
   "- Пока цель проклята, она совершает с помехой броски атаки по вам.",
   "- Пока цель проклята, в начале каждого своего хода она совершает спасбросок Мудрости. При провале она тратит действие этого хода впустую.",
   "- Пока цель проклята, ваши атаки и заклинания причиняют ей дополнительно 1d8 некротического урона.",
   "Заклинание «Снятие проклятья» оканчивает этот эффект. С разрешения Мастера можно выбрать иное проклятие, но не сильнее описанных; последнее слово о его действии за Мастером."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, длительность становится «концентрация, вплоть до 10 минут». С ячейкой 5-го круга или выше — 8 часов, 7-го круга или выше — 24 часа, 9-го круга — пока не рассеется. С ячейкой 5-го круга или выше концентрация не требуется."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "black-tentacles",
  "name": "Чёрные щупальца",
  "nameEn": "Black Tentacles",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "90 фт (куб 20 фт)",
  "components": "В, С, М (кусочек щупальца гигантского осьминога или гигантского кальмара)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Извивающиеся щупальца цвета эбенового дерева заполняют квадрат со стороной 20 футов на видимой вами земле в пределах дистанции. Пока действует заклинание, щупальца превращают землю в области в труднопроходимую местность.",
   "Когда существо впервые за ход входит в область или начинает в ней ход, оно должно преуспеть в спасброске Ловкости, иначе получит 3d6 дробящего урона и будет опутано щупальцами до окончания заклинания. Существо, начинающее ход в области уже опутанным, получает 3d6 дробящего урона.",
   "Опутанное существо может действием совершить проверку Силы или Ловкости (на свой выбор) против КС ваших заклинаний. При успехе оно освобождается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "blade-barrier",
  "name": "Барьер клинков",
  "nameEn": "Blade Barrier",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "90 фт (линия 100 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы создаёте вертикальную стену из вращающихся бритвенно-острых клинков магической энергии. Стена появляется в пределах дистанции и держится, пока действует заклинание. Это может быть прямая стена длиной до 100 футов, высотой 20 футов и толщиной 5 футов или кольцевая стена диаметром до 60 футов, высотой 20 футов и толщиной 5 футов. Стена даёт существам за ней укрытие на три четверти, а её пространство — труднопроходимая местность.",
   "Когда существо впервые за ход входит в область стены или начинает в ней ход, оно совершает спасбросок Ловкости. При провале существо получает 6d10 рубящего урона, при успехе — половину этого урона."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "bless",
  "name": "Благословение",
  "nameEn": "Bless",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (несколько капель святой воды)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы благословляете до трёх выбранных вами существ в пределах дистанции. Каждый раз, когда цель до окончания заклинания совершает бросок атаки или спасбросок, она может бросить d4 и добавить выпавшее число к результату."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "blight",
  "name": "Усыхание",
  "nameEn": "Blight",
  "level": 4,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Некромантическая энергия окатывает выбранное вами видимое существо в пределах дистанции, вытягивая из него влагу и жизненные силы. Цель совершает спасбросок Телосложения. При провале она получает 8d8 некротического урона, при успехе — половину этого урона. На нежить и конструктов заклинание не действует.",
   "Если цель — существо-растение или магическое растение, оно совершает спасбросок с помехой, а заклинание причиняет ему максимальный урон.",
   "Если цель — немагическое растение, не являющееся существом (дерево, куст), оно не совершает спасбросок, а просто увядает и гибнет."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 4-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "blindness-deafness",
  "name": "Слепота/глухота",
  "nameEn": "Blindness/Deafness",
  "level": 2,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы можете ослепить или оглушить врага. Выберите видимое вами существо в пределах дистанции: оно совершает спасбросок Телосложения. При провале цель ослеплена или оглохла (на ваш выбор), пока действует заклинание. В конце каждого своего хода цель может повторить спасбросок Телосложения; при успехе заклинание заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, за каждый круг ячейки выше 2-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "blink",
  "name": "Мерцание",
  "nameEn": "Blink",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, в конце каждого своего хода бросайте d20. При результате 11 или выше вы исчезаете с текущего плана бытия и появляетесь на Эфирном плане (если вы уже на нём, заклинание не срабатывает и накладывание тратится впустую). В начале своего следующего хода, а также когда заклинание заканчивается, если вы на Эфирном плане, вы возвращаетесь в выбранное вами видимое свободное пространство в пределах 10 футов от места, где исчезли. Если в этих пределах нет свободного пространства, вы появляетесь в ближайшем свободном (при нескольких равноудалённых — в случайном). Вы можете прекратить заклинание действием.",
   "На Эфирном плане вы видите и слышите план, с которого пришли, в оттенках серого, но не дальше 60 футов. Вы можете воздействовать только на существ на Эфирном плане и подвергаться воздействию только с их стороны. Существа вне его не воспринимают вас и не взаимодействуют с вами, если у них нет такой способности."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "blur",
  "name": "Размытый образ",
  "nameEn": "Blur",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Ваше тело для всех, кто вас видит, становится размытым, колеблющимся и дрожащим. Пока действует заклинание, любое существо совершает броски атаки по вам с помехой. Атакующий невосприимчив к этому эффекту, если не полагается на зрение (например, обладает слепым зрением) или видит сквозь иллюзии (например, обладает истинным зрением)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "branding-smite",
  "name": "Клеймящая кара",
  "nameEn": "Branding Smite",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "paladin"
  ],
  "desc": [
   "В следующий раз, когда до окончания заклинания вы попадёте по существу атакой оружием, оружие вспыхивает астральным сиянием. Атака причиняет цели дополнительно 2d6 урона излучением; невидимая цель становится видимой, испускает тусклый свет в радиусе 5 футов и не может стать невидимой, пока действует заклинание."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, дополнительный урон увеличивается на 1d6 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "burning-hands",
  "name": "Огненные ладони",
  "nameEn": "Burning Hands",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (конус 15 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы складываете ладони, соприкасаясь большими пальцами и растопырив остальные, и из кончиков пальцев вырывается тонкая завеса пламени. Каждое существо в конусе 15 футов совершает спасбросок Ловкости. При провале существо получает 3d6 урона огнём, при успехе — половину этого урона.",
   "Огонь поджигает в области все горючие предметы, которые никто не носит и не держит."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "call-lightning",
  "name": "Призыв молнии",
  "nameEn": "Call Lightning",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 5 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Появляется грозовая туча в форме цилиндра высотой 10 футов и радиусом 60 футов с центром в видимой вами точке в 100 футах прямо над вами. Заклинание не срабатывает, если вы не видите точки в воздухе, где могла бы появиться туча (например, если вы в помещении, где она не поместится).",
   "Накладывая заклинание, выберите видимую вами точку в пределах дистанции. Из тучи в эту точку бьёт молния. Каждое существо в пределах 5 футов от точки совершает спасбросок Ловкости. При провале оно получает 3d10 урона электричеством, при успехе — половину этого урона. В каждый свой ход до окончания заклинания вы можете действием снова призвать молнию в ту же или другую точку.",
   "Если в момент накладывания вы под открытым небом во время грозы, заклинание даёт вам власть над существующей грозой, а не создаёт новую. В таких условиях урон заклинания увеличивается на 1d10."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "calm-emotions",
  "name": "Умиротворение",
  "nameEn": "Calm Emotions",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric"
  ],
  "desc": [
   "Вы пытаетесь подавить сильные эмоции в группе людей. Каждый гуманоид в сфере радиусом 20 футов с центром в выбранной вами точке в пределах дистанции совершает спасбросок Харизмы; существо может провалить его добровольно. Для каждого провалившего существа выберите один из двух эффектов. Можно подавить любой эффект, из-за которого цель очарована или испугана. Когда заклинание заканчивается, подавленный эффект возобновляется, если его длительность за это время не истекла.",
   "Вместо этого можно сделать цель безразличной к выбранным вами существам, к которым она враждебна. Безразличие заканчивается, если цель атакуют или ранят заклинанием или если она видит, как вредят её друзьям. Когда заклинание заканчивается, существо снова становится враждебным, если Мастер не решит иначе."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "cause-fear",
  "name": "Вызывание страха",
  "nameEn": "Cause Fear",
  "level": 1,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинатель пробуждает в одном видимом существе в пределах дистанции ощущение близкой гибели. Цель совершает спасбросок Мудрости; при провале она испугана заклинателем до окончания действия заклинания. Конструкты и нежить от этого заклинания не страдают.",
   "Испуганная цель в конце каждого своего хода повторяет спасбросок и при успехе избавляется от эффекта."
  ],
  "higher": [
   "За каждый круг ячейки выше 1-го можно выбрать одну дополнительную цель. Все цели должны находиться не дальше 30 футов друг от друга."
  ],
  "translated": true,
  "source": "custom",
  "sourceNote": "Руководство Занатара (механика, описание своими словами)"
 },
 {
  "id": "chain-lightning",
  "name": "Цепная молния",
  "nameEn": "Chain Lightning",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "150 фт",
  "components": "В, С, М (клочок меха, кусочек янтаря, стекла или хрустальная палочка и три серебряные булавки)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте молнию, которая устремляется к выбранной вами видимой цели в пределах дистанции. Затем от этой цели перескакивают три молнии — к трём другим целям, каждая из которых должна быть в пределах 30 футов от первой. Целью может быть существо или предмет; в каждую цель может попасть только одна молния.",
   "Цель совершает спасбросок Ловкости. При провале цель получает 10d8 урона электричеством, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, за каждый круг ячейки выше 6-го от первой цели к ещё одной цели перескакивает дополнительная молния."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "charm-person",
  "name": "Очарование личности",
  "nameEn": "Charm Person",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь очаровать видимого вами гуманоида в пределах дистанции. Он совершает спасбросок Мудрости, причём с преимуществом, если вы или ваши спутники сражаетесь с ним. При провале он очарован вами, пока заклинание не закончится или пока вы или ваши спутники не причините ему вред. Очарованное существо считает вас дружелюбным знакомым. Когда заклинание заканчивается, существо знает, что вы его очаровали."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы можете выбрать целью одно дополнительное существо. В момент выбора цели должны находиться не дальше 30 футов друг от друга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "chill-touch",
  "name": "Леденящее прикосновение",
  "nameEn": "Chill Touch",
  "level": 0,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы создаёте призрачную скелетную руку в пространстве существа в пределах дистанции. Совершите по существу дальнобойную атаку заклинанием, чтобы окутать его холодом могилы. При попадании цель получает 1d8 некротического урона и не может восстанавливать хиты до начала вашего следующего хода. До этого момента рука держится за цель.",
   "Если вы попали по нежити, она также совершает броски атаки по вам с помехой до конца вашего следующего хода.",
   "Урон заклинания увеличивается на 1d8, когда вы достигаете 5-го уровня (2d8), 11-го уровня (3d8) и 17-го уровня (4d8)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "circle-of-death",
  "name": "Круг смерти",
  "nameEn": "Circle of Death",
  "level": 6,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "150 фт (сфера радиусом 60 фт)",
  "components": "В, С, М (порошок из истолчённой чёрной жемчужины стоимостью не меньше 500 зм)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Из точки в пределах дистанции расходится сфера отрицательной энергии радиусом 60 футов. Каждое существо в области совершает спасбросок Телосложения. При провале цель получает 8d6 некротического урона, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, урон увеличивается на 2d6 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "clairvoyance",
  "name": "Подсматривание",
  "nameEn": "Clairvoyance",
  "level": 3,
  "school": "Прорицание",
  "castingTime": "10 минут",
  "range": "1 миля",
  "components": "В, С, М (фокусировка стоимостью не меньше 100 зм: инкрустированный самоцветами рожок для слуха или стеклянный глаз для зрения)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте невидимый датчик в пределах дистанции — в знакомом вам месте (где вы бывали или которое видели) или в очевидном, но незнакомом месте (за дверью, за углом, в роще). Датчик остаётся на месте, пока действует заклинание; его нельзя атаковать или как-то иначе с ним взаимодействовать.",
   "Накладывая заклинание, выберите зрение или слух. Через датчик вы пользуетесь выбранным чувством так, будто находитесь в его пространстве. Действием можно переключаться между зрением и слухом.",
   "Существо, способное видеть датчик (например, под действием «Видения невидимого» или с истинным зрением), видит светящийся неосязаемый шар размером с ваш кулак."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "clone",
  "name": "Клон",
  "nameEn": "Clone",
  "level": 8,
  "school": "Некромантия",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (A diamond worth at least 1,000 gp and at least 1 cubic inch of flesh of the creature that is to be cloned, which the spell consumes, and a vessel worth at least 2,000 gp that has a sealable lid and is large enough to hold a Medium creature, such as a huge urn, coffin, mud-filled cyst in the ground, or crystal container filled with salt water.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "This spell grows an inert duplicate of a living creature as a safeguard against death. This clone forms inside a sealed vessel and grows to full size and maturity after 120 days; you can also choose to have the clone be a younger version of the same creature. It remains inert and endures indefinitely, as long as its vessel remains undisturbed.",
   "At any time after the clone matures, if the original creature dies, its soul transfers to the clone, provided that the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The original creature's physical remains, if they still exist, become inert and can't thereafter be restored to life, since the creature's soul is elsewhere."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "cloudkill",
  "name": "Смертельное облако",
  "nameEn": "Cloudkill",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте сферу ядовитого жёлто-зелёного тумана радиусом 20 футов с центром в выбранной вами точке в пределах дистанции. Туман огибает углы. Он держится, пока действует заклинание или пока сильный ветер не развеет его, окончив заклинание. Его область сильно заслонена.",
   "Когда существо впервые за ход входит в область заклинания или начинает в ней ход, оно совершает спасбросок Телосложения. При провале существо получает 5d8 урона ядом, при успехе — половину этого урона. Заклинание действует, даже если существо задерживает дыхание или вовсе не дышит.",
   "В начале каждого вашего хода туман смещается на 10 футов прочь от вас, стелясь по земле. Пары тяжелее воздуха и опускаются в самые низкие места, даже стекая в отверстия."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "color-spray",
  "name": "Сверкающие брызги",
  "nameEn": "Color Spray",
  "level": 1,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя (конус 15 фт)",
  "components": "В, С, М (щепотка красного, жёлтого и синего порошка или песка)",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Из вашей руки вырывается ослепительный веер мерцающего разноцветного света. Бросьте 6d10: сумма показывает, сколько хитов существ может затронуть заклинание. Существа в конусе 15 футов от вас затрагиваются в порядке возрастания их текущих хитов (существа без сознания и те, кто не может видеть, не учитываются).",
   "Начиная с существа с наименьшими текущими хитами, каждое затронутое существо ослеплено до окончания заклинания. Прежде чем перейти к следующему существу, вычтите хиты предыдущего из суммы. Существо затрагивается, только если его хиты не больше оставшейся суммы."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, бросьте дополнительно 2d10 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "command",
  "name": "Приказ",
  "nameEn": "Command",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы произносите приказ из одного слова, обращённый к видимому вами существу в пределах дистанции. Цель должна преуспеть в спасброске Мудрости, иначе в свой следующий ход выполнит приказ. Заклинание не действует, если цель — нежить, если она не понимает вашего языка или если приказ прямо вредит ей.",
   "Ниже описаны типичные приказы и их действие. Можно отдать и другой приказ — тогда поведение цели определяет Мастер. Если цель не может выполнить приказ, заклинание заканчивается.",
   "***Подойди.*** Цель движется к вам кратчайшим и самым прямым путём и заканчивает ход, если оказывается в пределах 5 футов от вас.",
   "***Брось.*** Цель роняет всё, что держит, и заканчивает ход.",
   "***Беги.*** Цель тратит ход на то, чтобы удалиться от вас самым быстрым доступным способом.",
   "***Падай.*** Цель падает ничком и заканчивает ход.",
   "***Стой.*** Цель не перемещается и не совершает действий. Летающее существо остаётся в воздухе, если может; если для этого нужно двигаться, оно пролетает минимальное расстояние, необходимое, чтобы не упасть."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы можете выбрать целью одно дополнительное существо. В момент выбора цели должны находиться не дальше 30 футов друг от друга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "commune",
  "name": "Общение",
  "nameEn": "Commune",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В, С, М (благовония и флакон святой или нечестивой воды)",
  "duration": "1 минута",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы связываетесь со своим божеством или его посланником и задаёте до трёх вопросов, на которые можно ответить «да» или «нет». Вопросы нужно задать до окончания заклинания. На каждый вы получаете верный ответ.",
   "Божественные существа не всеведущи, поэтому, если вопрос касается того, чего божество не знает, ответом может быть «неясно». Если однословный ответ мог бы ввести в заблуждение или противоречить интересам божества, Мастер может ответить короткой фразой.",
   "Если наложить заклинание два раза или больше до окончания следующего длительного отдыха, за каждое накладывание после первого появляется накопительный шанс 25 процентов не получить ответа. Мастер бросает его втайне."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "commune-with-nature",
  "name": "Общение с природой",
  "nameEn": "Commune With Nature",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы ненадолго становитесь единым целым с природой и узнаёте об окружающей местности. Под открытым небом заклинание даёт знания о земле в пределах 3 миль. В пещерах и иных природных подземельях радиус ограничен 300 футами. Заклинание не действует там, где природа уступила место постройкам, например в подземельях и городах.",
   "Вы мгновенно узнаёте до трёх фактов на ваш выбор о любых из следующих предметов в этой местности:",
   "- рельеф и водоёмы",
   "- преобладающие растения, минералы, животные или народы",
   "- могущественные небожители, феи, исчадия, элементали или нежить",
   "- влияние других планов бытия",
   "- постройки",
   "Например, можно узнать, где в округе могущественная нежить, где крупные источники безопасной питьевой воды и где ближайшие поселения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "comprehend-languages",
  "name": "Понимание языков",
  "nameEn": "Comprehend Languages",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (щепотка сажи и соли)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, вы понимаете буквальный смысл любой слышимой вами речи на любом языке. Вы также понимаете любой письменный язык, который видите, но должны при этом касаться поверхности с текстом. На чтение одной страницы уходит около 1 минуты.",
   "Заклинание не расшифровывает тайные послания в тексте и не позволяет прочесть символ (например, магическую печать), не являющийся частью письменного языка."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "compulsion",
  "name": "Принуждение",
  "nameEn": "Compulsion",
  "level": 4,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard"
  ],
  "desc": [
   "Выбранные вами видимые существа в пределах дистанции, которые слышат вас, совершают спасбросок Мудрости. Цель, которую нельзя очаровать, автоматически преуспевает. При провале цель попадает под действие заклинания. До его окончания вы можете бонусным действием в каждый свой ход указать горизонтальное направление. Каждая затронутая цель в свой следующий ход должна потратить как можно больше перемещения, двигаясь в этом направлении. Действие она может совершить до перемещения. Переместившись так, цель может повторить спасбросок Мудрости, чтобы избавиться от эффекта.",
   "Цель не обязана идти в явно смертельную опасность — в огонь или яму, — но ради движения в указанном направлении будет провоцировать атаки."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "cone-of-cold",
  "name": "Конус холода",
  "nameEn": "Cone of Cold",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (конус 60 фт)",
  "components": "В, С, М (маленький хрустальный или стеклянный конус)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Из ваших рук вырывается поток холодного воздуха. Каждое существо в конусе 60 футов совершает спасбросок Телосложения. При провале существо получает 8d8 урона холодом, при успехе — половину этого урона.",
   "Существо, убитое этим заклинанием, становится замёрзшей статуей, пока не оттает."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "confusion",
  "name": "Смятение",
  "nameEn": "Confusion",
  "level": 4,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "90 фт (сфера радиусом 10 фт)",
  "components": "В, С, М (три скорлупки грецкого ореха)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Заклинание атакует и искажает разум существ, порождая бред и вызывая неконтролируемые поступки. Каждое существо в сфере радиусом 10 футов с центром в выбранной вами точке в пределах дистанции должно преуспеть в спасброске Мудрости в момент накладывания, иначе попадает под действие заклинания.",
   "Затронутая цель не может совершать реакции и в начале каждого своего хода бросает d10, чтобы определить своё поведение в этот ход.",
   "| d10 | Поведение |\n|---|---|\n| 1 | Существо тратит всё перемещение, чтобы двигаться в случайном направлении. Для направления бросьте d8, назначив направление каждой грани. Действие в этот ход существо не совершает. |\n| 2–6 | Существо в этот ход не перемещается и не совершает действий. |\n| 7–8 | Существо действием совершает рукопашную атаку по случайному существу в пределах досягаемости. Если таких нет, существо в этот ход ничего не делает. |\n| 9–10 | Существо может действовать и перемещаться как обычно. |",
   "В конце каждого своего хода затронутая цель может совершить спасбросок Мудрости. При успехе эффект для неё заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, радиус сферы увеличивается на 5 футов за каждый круг ячейки выше 4-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-animals",
  "name": "Призыв животных",
  "nameEn": "Conjure Animals",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы призываете духов фей, которые принимают облик зверей и появляются в видимых вами свободных пространствах в пределах дистанции. Выберите, кто появится:",
   "- Один зверь с показателем опасности 2 или ниже",
   "- Два зверя с показателем опасности 1 или ниже",
   "- Четыре зверя с показателем опасности 1/2 или ниже",
   "- Восемь зверей с показателем опасности 1/4 или ниже",
   "Каждый зверь также считается феей и исчезает, когда его хиты опускаются до 0 или когда заклинание заканчивается.",
   "Призванные существа дружелюбны к вам и вашим спутникам. Бросьте инициативу для призванных существ одной группой; у неё свои ходы. Они выполняют любые ваши устные приказы (вам не нужно тратить действие). Без приказов они защищаются от враждебных существ, но иных действий не совершают.",
   "Параметры существ у Мастера."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячеек более высоких кругов, вы выбираете один из вариантов выше, и существ появляется больше: вдвое больше с ячейкой 5-го круга, втрое — с ячейкой 7-го круга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-celestial",
  "name": "Призыв небожителя",
  "nameEn": "Conjure Celestial",
  "level": 7,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "90 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric"
  ],
  "desc": [
   "You summon a celestial of challenge rating 4 or lower, which appears in an unoccupied space that you can see within range. The celestial disappears when it drops to 0 hit points or when the spell ends.",
   "The celestial is friendly to you and your companions for the duration. Roll initiative for the celestial, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you), as long as they don't violate its alignment. If you don't issue any commands to the celestial, it defends itself from hostile creatures but otherwise takes no actions.",
   "The GM has the celestial's statistics."
  ],
  "higher": [
   "When you cast this spell using a 9th-level spell slot, you summon a celestial of challenge rating 5 or lower."
  ],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-elemental",
  "name": "Призыв элементаля",
  "nameEn": "Conjure Elemental",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "90 фт (куб 10 фт)",
  "components": "В, С, М (горящие благовония для воздуха, мягкая глина для земли, сера и фосфор для огня или вода и песок для воды)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "Вы призываете слугу-элементаля. Выберите в пределах дистанции область воздуха, земли, огня или воды, заполняющую куб с ребром 10 футов. Подходящий этой области элементаль с показателем опасности 5 или ниже появляется в свободном пространстве в пределах 10 футов от неё. Например, огненный элементаль выходит из костра, а земляной поднимается из земли. Элементаль исчезает, когда его хиты опускаются до 0 или когда заклинание заканчивается.",
   "Пока действует заклинание, элементаль дружелюбен к вам и вашим спутникам. Бросьте для него инициативу; у него свои ходы. Он выполняет любые ваши устные приказы (вам не нужно тратить действие). Без приказов он защищается от враждебных существ, но иных действий не совершает.",
   "Если ваша концентрация прервана, элементаль не исчезает. Вместо этого вы теряете над ним контроль, он становится враждебным вам и вашим спутникам и может напасть. Вы не можете отпустить неподконтрольного элементаля; он исчезает через 1 час после призыва.",
   "Параметры элементаля у Мастера."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, показатель опасности увеличивается на 1 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-fey",
  "name": "Призыв фей",
  "nameEn": "Conjure Fey",
  "level": 6,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "90 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "warlock"
  ],
  "desc": [
   "Вы призываете фею с показателем опасности 6 или ниже или духа фей, принимающего облик зверя с показателем опасности 6 или ниже. Существо появляется в видимом вами свободном пространстве в пределах дистанции и исчезает, когда его хиты опускаются до 0 или когда заклинание заканчивается.",
   "Пока действует заклинание, фея дружелюбна к вам и вашим спутникам. Бросьте для неё инициативу; у неё свои ходы. Она выполняет любые ваши устные приказы (вам не нужно тратить действие), если они не противоречат её мировоззрению. Без приказов она защищается от враждебных существ, но иных действий не совершает.",
   "Если ваша концентрация прервана, фея не исчезает. Вместо этого вы теряете над ней контроль, она становится враждебной вам и вашим спутникам и может напасть. Вы не можете отпустить неподконтрольную фею; она исчезает через 1 час после призыва.",
   "Параметры феи у Мастера."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, показатель опасности увеличивается на 1 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-minor-elementals",
  "name": "Призыв малых элементалей",
  "nameEn": "Conjure Minor Elementals",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "90 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "Вы призываете элементалей, которые появляются в видимых вами свободных пространствах в пределах дистанции. Выберите, кто появится:",
   "- Один элементаль с показателем опасности 2 или ниже",
   "- Два элементаля с показателем опасности 1 или ниже",
   "- Четыре элементаля с показателем опасности 1/2 или ниже",
   "- Восемь элементалей с показателем опасности 1/4 или ниже",
   "Призванный элементаль исчезает, когда его хиты опускаются до 0 или когда заклинание заканчивается.",
   "Призванные существа дружелюбны к вам и вашим спутникам. Бросьте инициативу для призванных существ одной группой; у неё свои ходы. Они выполняют любые ваши устные приказы (вам не нужно тратить действие). Без приказов они защищаются от враждебных существ, но иных действий не совершают.",
   "Параметры существ у Мастера."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячеек более высоких кругов, вы выбираете один из вариантов выше, и существ появляется больше: вдвое больше с ячейкой 6-го круга, втрое — с ячейкой 8-го круга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "conjure-woodland-beings",
  "name": "Призыв лесных обитателей",
  "nameEn": "Conjure Woodland Beings",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (по одной ягоде остролиста на каждое призываемое существо)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы призываете фей, которые появляются в видимых вами свободных пространствах в пределах дистанции. Выберите, кто появится:",
   "- Одна фея с показателем опасности 2 или ниже",
   "- Две феи с показателем опасности 1 или ниже",
   "- Четыре феи с показателем опасности 1/2 или ниже",
   "- Восемь фей с показателем опасности 1/4 или ниже",
   "Призванное существо исчезает, когда его хиты опускаются до 0 или когда заклинание заканчивается.",
   "Призванные существа дружелюбны к вам и вашим спутникам. Бросьте инициативу для призванных существ одной группой; у неё свои ходы. Они выполняют любые ваши устные приказы (вам не нужно тратить действие). Без приказов они защищаются от враждебных существ, но иных действий не совершают.",
   "Параметры существ у Мастера."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячеек более высоких кругов, вы выбираете один из вариантов выше, и существ появляется больше: вдвое больше с ячейкой 6-го круга, втрое — с ячейкой 8-го круга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "contact-other-plane",
  "name": "Связь с иным планом",
  "nameEn": "Contact Other Plane",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В",
  "duration": "1 минута",
  "ritual": true,
  "concentration": false,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы мысленно связываетесь с полубогом, духом давно умершего мудреца или иной таинственной сущностью с другого плана. Контакт с этим внепланарным разумом может надломить или даже сломить ваш рассудок. Накладывая заклинание, совершите спасбросок Интеллекта с КС 15. При провале вы получаете 6d6 психического урона и безумны до окончания длительного отдыха. Безумным вы не можете совершать действия, не понимаете речь других существ, не можете читать и говорите только тарабарщину. Заклинание «Высшее восстановление», наложенное на вас, оканчивает этот эффект.",
   "При успехе вы можете задать сущности до пяти вопросов. Вопросы нужно задать до окончания заклинания. Мастер отвечает на каждый одним словом: «да», «нет», «возможно», «никогда», «неважно» или «неясно» (если сущность не знает ответа). Если однословный ответ ввёл бы в заблуждение, Мастер может ответить короткой фразой."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "contagion",
  "name": "Заражение",
  "nameEn": "Contagion",
  "level": 5,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "7 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Ваше прикосновение несёт болезнь. Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании вы заражаете существо одной из описанных ниже болезней на ваш выбор.",
   "В конце каждого своего хода цель совершает спасбросок Телосложения. После трёх проваленных спасбросков действие болезни длится всю длительность заклинания, и существо перестаёт совершать эти спасброски. После трёх успешных спасбросков существо выздоравливает, и заклинание заканчивается.",
   "Поскольку заклинание вызывает у цели естественную болезнь, на неё действуют любые эффекты, излечивающие болезни или облегчающие их течение.",
   "***Слепящая болезнь.*** Боль охватывает разум существа, а глаза его становятся молочно-белыми. Существо совершает с помехой проверки и спасброски Мудрости и ослеплено.",
   "***Грязная лихорадка.*** Тело существа охватывает жестокий жар. Существо совершает с помехой проверки и спасброски Силы и броски атаки, использующие Силу.",
   "***Гниение плоти.*** Плоть существа разлагается. Существо совершает с помехой проверки Харизмы и уязвимо ко всему урону.",
   "***Огонь разума.*** Разум существа охватывает лихорадка. Существо совершает с помехой проверки и спасброски Интеллекта и в бою ведёт себя так, будто находится под действием заклинания «Смятение».",
   "***Судороги.*** Существо бьёт дрожь. Оно совершает с помехой проверки и спасброски Ловкости и броски атаки, использующие Ловкость.",
   "***Липкая гибель.*** Существо начинает неудержимо кровоточить. Оно совершает с помехой проверки и спасброски Телосложения. Кроме того, каждый раз, получая урон, оно ошеломлено до конца своего следующего хода."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "contingency",
  "name": "Предосторожность",
  "nameEn": "Contingency",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "10 минут",
  "range": "На себя",
  "components": "В, С, М (ваша статуэтка, вырезанная из слоновой кости и украшенная самоцветами, стоимостью не меньше 1 500 зм)",
  "duration": "10 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Выберите заклинание 5-го круга или ниже, которое вы можете накладывать, со временем накладывания 1 действие и способное выбрать целью вас. Вы накладываете его — это заклинание называется отложенным — в процессе накладывания «Предосторожности», тратя ячейки на оба, но отложенное заклинание не вступает в силу. Оно срабатывает при определённом обстоятельстве, которое вы описываете, накладывая оба заклинания. Например, «Предосторожность» с «Подводным дыханием» может предусматривать, что «Подводное дыхание» вступит в силу, когда вас поглотит вода или иная подобная жидкость.",
   "Отложенное заклинание вступает в силу сразу после того, как обстоятельство наступит впервые, хотите вы того или нет, после чего «Предосторожность» заканчивается.",
   "Отложенное заклинание действует только на вас, даже если обычно может действовать на других. Одновременно может действовать только одна «Предосторожность». Если вы накладываете это заклинание снова, действие предыдущей «Предосторожности» на вас заканчивается. Кроме того, «Предосторожность» заканчивается, если её материальный компонент окажется не при вас."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "continual-flame",
  "name": "Вечный огонь",
  "nameEn": "Continual Flame",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (рубиновая пыль стоимостью 50 зм, которую заклинание расходует)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "Из предмета, которого вы касаетесь, вырывается пламя, яркое, как факел. Оно выглядит как обычный огонь, но не греет и не потребляет кислород. Вечный огонь можно накрыть или спрятать, но нельзя задушить или погасить."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "control-water",
  "name": "Контроль воды",
  "nameEn": "Control Water",
  "level": 4,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "300 фт (куб 100 фт)",
  "components": "В, С, М (капля воды и щепотка пыли)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "До окончания заклинания вы управляете любой стоячей или текучей водой внутри выбранной вами области — куба с ребром до 100 футов. Накладывая заклинание, выберите один из эффектов ниже. Действием в свой ход вы можете повторить тот же эффект или выбрать другой.",
   "***Наводнение.*** Уровень всей стоячей воды в области поднимается на высоту до 20 футов. Если в области есть берег, вода выплёскивается на сушу.",
   "Если вы выбрали область в большом водоёме, вместо этого вы создаёте волну высотой 20 футов, которая проходит от одного края области до другого и обрушивается. Транспорт размером Огромный и меньше на её пути переносится на другую сторону. Транспорт размером Огромный и меньше, по которому ударила волна, переворачивается с шансом 25 процентов.",
   "Уровень воды остаётся поднятым, пока не закончится заклинание или вы не выберете другой эффект. Если эффект создал волну, она повторяется в начале вашего следующего хода, пока длится наводнение.",
   "***Разделение воды.*** Вода в области расступается, образуя траншею. Траншея пересекает всю область заклинания, а раздвинутая вода стоит стенами по обе стороны. Траншея сохраняется, пока не закончится заклинание или вы не выберете другой эффект. Затем вода в течение следующего раунда медленно заполняет траншею, пока не восстановится обычный уровень.",
   "***Изменение течения.*** Текущая вода в области движется в выбранном вами направлении, даже если ей приходится течь через препятствия, вверх по стенам или иным неестественным образом. Вода в области движется, как вы указали, но за её пределами снова течёт в соответствии с местностью. Вода движется в выбранном направлении, пока не закончится заклинание или вы не выберете другой эффект.",
   "***Водоворот.*** Для этого эффекта нужен водоём площадью не меньше 50 на 50 футов и глубиной 25 футов. В центре области образуется водоворот: воронка шириной 5 футов у основания, до 50 футов вверху и высотой 25 футов. Каждое существо и предмет в воде в пределах 25 футов от воронки затягивается на 10 футов к ней. Существо может отплыть от воронки, совершив проверку Силы (Атлетика) против КС ваших заклинаний.",
   "Когда существо впервые за ход попадает в воронку или начинает в ней ход, оно совершает спасбросок Силы. При провале существо получает 2d8 дробящего урона и захвачено воронкой до окончания заклинания. При успехе — половину урона и не захвачено. Захваченное существо может действием попытаться отплыть, как описано выше, но совершает проверку Силы (Атлетика) с помехой.",
   "Предмет, впервые за ход попавший в воронку, получает 2d8 дробящего урона; этот урон повторяется каждый раунд, пока предмет остаётся в воронке."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "control-weather",
  "name": "Контроль погоды",
  "nameEn": "Control Weather",
  "level": 8,
  "school": "Преобразование",
  "castingTime": "10 минут",
  "range": "На себя",
  "components": "В, С, М (Burning incense and bits of earth and wood mixed in water.)",
  "duration": "Концентрация, вплоть до 8 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early.",
   "When you cast the spell, you change the current weather conditions, which are determined by the GM based on the climate and season. You can change precipitation, temperature, and wind. It takes 1d4 x 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal.",
   "When you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction.",
   "##### Precipitation",
   "| Stage | Condition |",
   "|---|---|",
   "| 1 | Clear |",
   "| 2 | Light clouds |",
   "| 3 | Overcast or ground fog |",
   "| 4 | Rain, hail, or snow |",
   "| 5 | Torrential rain, driving hail, or blizzard |",
   "##### Temperature",
   "| Stage | Condition |",
   "|---|---|",
   "| 1 | Unbearable heat |",
   "| 2 | Hot |",
   "| 3 | Warm |",
   "| 4 | Cool |",
   "| 5 | Cold |",
   "| 6 | Arctic cold |",
   "##### Wind",
   "| Stage | Condition |",
   "|---|---|",
   "| 1 | Calm |",
   "| 2 | Moderate wind |",
   "| 3 | Strong wind |",
   "| 4 | Gale |",
   "| 5 | Storm |"
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "counterspell",
  "name": "Контрзаклинание",
  "nameEn": "Counterspell",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 реакция",
  "range": "60 фт",
  "components": "С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь прервать существо в процессе накладывания заклинания. Если существо накладывает заклинание 3-го круга или ниже, его заклинание не срабатывает и не оказывает эффекта. Если оно накладывает заклинание 4-го круга или выше, совершите проверку своей заклинательной характеристики. КС равен 10 + круг заклинания. При успехе заклинание существа не срабатывает и не оказывает эффекта."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, прерываемое заклинание не оказывает эффекта, если его круг не выше круга использованной вами ячейки."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "create-food-and-water",
  "name": "Сотворение пищи и воды",
  "nameEn": "Create Food and Water",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "paladin"
  ],
  "desc": [
   "Вы создаёте 45 фунтов еды и 30 галлонов воды на земле или в ёмкостях в пределах дистанции — этого хватит пятнадцати гуманоидам или пяти скакунам на 24 часа. Еда пресная, но питательная, и портится, если её не съесть за 24 часа. Вода чистая и не портится."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "create-or-destroy-water",
  "name": "Сотворение или уничтожение воды",
  "nameEn": "Create or Destroy Water",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт (куб 30 фт)",
  "components": "В, С, М (капля воды для сотворения воды или несколько песчинок для её уничтожения)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Вы либо создаёте, либо уничтожаете воду.",
   "***Сотворение воды.*** Вы создаёте до 10 галлонов чистой воды в открытом контейнере в пределах дистанции. Вместо этого вода может пролиться дождём в кубе с ребром 30 футов в пределах дистанции.",
   "***Уничтожение воды.*** Вы уничтожаете до 10 галлонов воды в открытом контейнере в пределах дистанции. Вместо этого можно уничтожить туман в кубе с ребром 30 футов в пределах дистанции."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы создаёте или уничтожаете на 10 галлонов воды больше либо ребро куба увеличивается на 5 футов."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "create-undead",
  "name": "Сотворение нежити",
  "nameEn": "Create Undead",
  "level": 6,
  "school": "Некромантия",
  "castingTime": "1 минута",
  "range": "10 фт",
  "components": "В, С, М (по глиняному горшку с могильной землёй, глиняному горшку с солоноватой водой и чёрному ониксу стоимостью 150 зм на каждый труп)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Это заклинание можно накладывать только ночью. Выберите до трёх трупов гуманоидов Среднего или Маленького размера в пределах дистанции. Каждый труп становится упырём под вашим контролем (параметры у Мастера).",
   "В каждый свой ход вы можете бонусным действием мысленно приказать любому существу, поднятому этим заклинанием, если оно в пределах 120 футов от вас (если существ несколько, можно приказать любым или всем одновременно, отдав каждому один и тот же приказ). Вы решаете, какое действие существо совершит и куда переместится в свой следующий ход, или отдаёте общий приказ, например охранять определённый зал или коридор. Без приказов существо лишь защищается от враждебных существ. Получив приказ, существо выполняет его, пока задача не будет решена.",
   "Существо подчиняется вам 24 часа, после чего перестаёт выполнять ваши приказы. Чтобы сохранить контроль ещё на 24 часа, нужно наложить на существо это заклинание до окончания текущих суток. Такое накладывание возобновляет контроль над тремя существами, поднятыми этим заклинанием, вместо создания новых."
  ],
  "higher": [
   "С ячейкой 7-го круга вы поднимаете или возобновляете контроль над четырьмя упырями. С ячейкой 8-го круга — над пятью упырями или двумя гастами или умертвиями. С ячейкой 9-го круга — над шестью упырями, тремя гастами или умертвиями или двумя мумиями."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "creation",
  "name": "Сотворение",
  "nameEn": "Creation",
  "level": 5,
  "school": "Иллюзия",
  "castingTime": "1 минута",
  "range": "30 фт (куб 5 фт)",
  "components": "В, С, М (крошечный кусочек вещества того же рода, что и создаваемый предмет)",
  "duration": "Особая",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы вытягиваете клочья теневой материи из Царства Теней и создаёте в пределах дистанции неживой предмет из растительного вещества: ткань, верёвку, дерево или нечто подобное. Заклинанием можно также создавать минеральные предметы — из камня, хрусталя или металла. Предмет должен умещаться в кубе с ребром 5 футов и иметь форму и материал, которые вы уже видели.",
   "Длительность зависит от материала предмета. Если он состоит из нескольких материалов, используется самая короткая длительность.",
   "| Материал | Длительность |\n|---|---|\n| Растительное вещество | 1 день |\n| Камень или хрусталь | 12 часов |\n| Драгоценные металлы | 1 час |\n| Самоцветы | 10 минут |\n| Адамантин или мифрил | 1 минута |",
   "Если использовать вещество, созданное этим заклинанием, как материальный компонент другого заклинания, то заклинание не срабатывает."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, ребро куба увеличивается на 5 футов за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "cure-wounds",
  "name": "Лечение ран",
  "nameEn": "Cure Wounds",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "ranger"
  ],
  "desc": [
   "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + модификатор вашей заклинательной характеристики. На нежить и конструктов заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, лечение увеличивается на 1d8 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dancing-lights",
  "name": "Пляшущие огоньки",
  "nameEn": "Dancing Lights",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (кусочек фосфора или гнилушки либо светлячок)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте до четырёх огоньков размером с факел в пределах дистанции; они выглядят как факелы, фонари или светящиеся шары и висят в воздухе, пока действует заклинание. Можно также объединить четыре огонька в одну светящуюся фигуру Среднего размера, смутно похожую на гуманоида. Какую бы форму вы ни выбрали, каждый огонёк испускает тусклый свет в радиусе 10 футов.",
   "Бонусным действием в свой ход вы можете переместить огоньки на расстояние до 60 футов в новое место в пределах дистанции. Каждый огонёк должен находиться не дальше 20 футов от другого огонька, созданного этим заклинанием; огонёк гаснет, если оказывается за пределами дистанции заклинания."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "darkness",
  "name": "Тьма",
  "nameEn": "Darkness",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 15 фт)",
  "components": "В, М (шерсть летучей мыши и капля смолы или кусочек угля)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Из выбранной вами точки в пределах дистанции расползается магическая тьма и заполняет сферу радиусом 15 футов, пока действует заклинание. Тьма огибает углы. Существо с тёмным зрением не видит сквозь неё, а немагический свет не может её осветить.",
   "Если выбранная точка находится на предмете, который вы держите, или на предмете, который никто не несёт и не носит, тьма исходит от предмета и перемещается вместе с ним. Если полностью накрыть источник тьмы непрозрачным предметом, например миской или шлемом, тьма будет заслонена.",
   "Если область заклинания пересекается с областью света, созданного заклинанием 2-го круга или ниже, заклинание, создавшее свет, рассеивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "darkvision",
  "name": "Тёмное зрение",
  "nameEn": "Darkvision",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (щепотка сушёной моркови или агат)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь согласного существа и даёте ему способность видеть в темноте. Пока действует заклинание, существо обладает тёмным зрением на 60 футов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "daylight",
  "name": "Дневной свет",
  "nameEn": "Daylight",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 60 фт)",
  "components": "В, С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "paladin",
   "ranger",
   "sorcerer"
  ],
  "desc": [
   "Из выбранной вами точки в пределах дистанции расходится сфера света радиусом 60 футов. Внутри сферы яркий свет, и она испускает тусклый свет ещё на 60 футов.",
   "Если выбранная точка находится на предмете, который вы держите, или на предмете, который никто не несёт и не носит, свет исходит от предмета и перемещается вместе с ним. Если полностью накрыть предмет непрозрачным предметом, например миской или шлемом, свет будет заслонён.",
   "Если область заклинания пересекается с областью тьмы, созданной заклинанием 3-го круга или ниже, заклинание, создавшее тьму, рассеивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "death-ward",
  "name": "Защита от смерти",
  "nameEn": "Death Ward",
  "level": 4,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы касаетесь существа и даруете ему защиту от смерти.",
   "В первый раз, когда хиты цели должны опуститься до 0 в результате урона, они вместо этого опускаются до 1, и заклинание заканчивается.",
   "Если заклинание ещё действует, когда цель подвергается эффекту, который убил бы её мгновенно без урона, этот эффект против цели отменяется, и заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "delayed-blast-fireball",
  "name": "Огненный шар замедленного действия",
  "nameEn": "Delayed Blast Fireball",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "150 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (A tiny ball of bat guano and sulfur.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration. When the spell ends, either because your concentration is broken or because you decide to end it, the bead blossoms with a low roar into an explosion of flame that spreads around corners. Each creature in a 20-foot-radius sphere centered on that point must make a dexterity saving throw. A creature takes fire damage equal to the total accumulated damage on a failed save, or half as much damage on a successful one.",
   "The spell's base damage is 12d6. If at the end of your turn the bead has not yet detonated, the damage increases by 1d6.",
   "If the glowing bead is touched before the interval has expired, the creature touching it must make a dexterity saving throw. On a failed save, the spell ends immediately, causing the bead to erupt in flame. On a successful save, the creature can throw the bead up to 40 feet. When it strikes a creature or a solid object, the spell ends, and the bead explodes.",
   "The fire damages objects in the area and ignites flammable objects that aren't being worn or carried."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 8th level or higher, the base damage increases by 1d6 for each slot level above 7th."
  ],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "demiplane",
  "name": "Демиплан",
  "nameEn": "Demiplane",
  "level": 8,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "You create a shadowy door on a flat solid surface that you can see within range. The door is large enough to allow Medium creatures to pass through unhindered. When opened, the door leads to a demiplane that appears to be an empty room 30 feet in each dimension, made of wood or stone. When the spell ends, the door disappears, and any creatures or objects inside the demiplane remain trapped there, as the door also disappears from the other side.",
   "Each time you cast this spell, you can create a new demiplane, or have the shadowy door connect to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can have the shadowy door connect to its demiplane instead."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "detect-evil-and-good",
  "name": "Обнаружение добра и зла",
  "nameEn": "Detect Evil and Good",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Пока действует заклинание, вы знаете, есть ли в пределах 30 футов от вас аберрация, небожитель, элементаль, фея, исчадие или нежить, а также где именно находится это существо. Точно так же вы знаете, есть ли в пределах 30 футов от вас место или предмет, магически освящённые или осквернённые.",
   "Заклинание проникает сквозь большинство преград, но его блокируют 1 фут камня, 1 дюйм обычного металла, тонкий лист свинца или 3 фута дерева либо земли."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "detect-magic",
  "name": "Обнаружение магии",
  "nameEn": "Detect Magic",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": true,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, вы чувствуете присутствие магии в пределах 30 футов от себя. Почувствовав магию, вы можете действием увидеть слабую ауру вокруг любого видимого существа или предмета в области, несущего магию, и узнать её школу, если она есть.",
   "Заклинание проникает сквозь большинство преград, но его блокируют 1 фут камня, 1 дюйм обычного металла, тонкий лист свинца или 3 фута дерева либо земли."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "detect-poison-and-disease",
  "name": "Обнаружение болезней и яда",
  "nameEn": "Detect Poison and Disease",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 30 фт)",
  "components": "В, С, М (тисовый лист)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": true,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "paladin",
   "ranger"
  ],
  "desc": [
   "Пока действует заклинание, вы чувствуете присутствие и местонахождение ядов, ядовитых существ и болезней в пределах 30 футов от себя. Вы также узнаёте, какой это яд, какое ядовитое существо или какая болезнь.",
   "Заклинание проникает сквозь большинство преград, но его блокируют 1 фут камня, 1 дюйм обычного металла, тонкий лист свинца или 3 фута дерева либо земли."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "detect-thoughts",
  "name": "Обнаружение мыслей",
  "nameEn": "Detect Thoughts",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (медная монета)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, вы можете читать мысли определённых существ. Накладывая заклинание и действием в каждый ход до его окончания, вы можете сосредоточиться на одном видимом существе в пределах 30 футов от себя. Если у выбранного существа Интеллект 3 или ниже или оно не говорит ни на одном языке, заклинание на него не действует.",
   "Сначала вы узнаёте поверхностные мысли существа — то, что больше всего занимает его в этот момент. Действием вы можете либо переключиться на мысли другого существа, либо попытаться проникнуть глубже в разум того же. Если вы проникаете глубже, цель совершает спасбросок Мудрости. При провале вы понимаете ход её рассуждений (если они есть), её эмоциональное состояние и то, что занимает важное место в её разуме (что её тревожит, что она любит или ненавидит). При успехе заклинание заканчивается. В любом случае цель знает, что вы копаетесь в её разуме, и, если вы не переключились на другое существо, может действием в свой ход совершить проверку Интеллекта против вашей проверки Интеллекта; при её успехе заклинание заканчивается.",
   "Вопросы, обращённые к цели вслух, естественным образом направляют ход её мыслей, поэтому заклинание особенно полезно на допросе.",
   "Заклинанием можно также обнаружить присутствие мыслящих существ, которых вы не видите. Накладывая заклинание или действием во время его действия, вы можете искать мысли в пределах 30 футов от себя. Заклинание проникает сквозь преграды, но его блокируют 2 фута камня, 2 дюйма любого металла, кроме свинца, или тонкий лист свинца. Нельзя обнаружить существо с Интеллектом 3 или ниже или не говорящее ни на одном языке.",
   "Обнаружив так существо, вы можете до окончания заклинания читать его мысли, как описано выше, даже не видя его, но оно должно оставаться в пределах дистанции."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dimension-door",
  "name": "Переносящая дверь",
  "nameEn": "Dimension Door",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "500 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы телепортируетесь из текущего места в любое другое в пределах дистанции и оказываетесь ровно там, где хотели. Это может быть место, которое вы видите, можете представить или описать расстоянием и направлением, например «200 футов прямо вниз» или «вверх на северо-запад под углом 45 градусов, 300 футов».",
   "Вы можете взять с собой предметы, если их вес не превышает того, что вы способны нести. Можно также взять одно согласное существо вашего размера или меньше со снаряжением в пределах его грузоподъёмности. В момент накладывания существо должно быть в пределах 5 футов от вас.",
   "Если вы должны оказаться в месте, уже занятом предметом или существом, вы и путешествующее с вами существо получаете по 4d6 урона силовым полем, а телепортация не происходит."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "disguise-self",
  "name": "Маскировка",
  "nameEn": "Disguise Self",
  "level": 1,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы изменяете свой облик — вместе с одеждой, доспехами, оружием и прочими вещами при себе — до окончания заклинания или пока не прекратите его действием. Можно казаться на 1 фут ниже или выше, худым, толстым или средней комплекции. Строение тела изменить нельзя: облик должен сохранять то же расположение конечностей. В остальном вид иллюзии — на ваше усмотрение.",
   "Изменения не выдерживают физической проверки. Например, если вы добавили к наряду шляпу, предметы проходят сквозь неё, а коснувшийся её ничего не почувствует или нащупает вашу голову и волосы. Если вы кажетесь худее, чем есть, рука того, кто тянется к вам, наткнётся на вас, ещё не коснувшись видимого силуэта.",
   "Чтобы распознать маскировку, существо может действием осмотреть вас и должно преуспеть в проверке Интеллекта (Анализ) против КС ваших заклинаний."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "disintegrate",
  "name": "Распад",
  "nameEn": "Disintegrate",
  "level": 6,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт (куб 10 фт)",
  "components": "В, С, М (магнитный железняк и щепотка пыли)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Из вашего указующего пальца к видимой вами цели в пределах дистанции бьёт тонкий зелёный луч. Целью может быть существо, предмет или творение магической силы, например стена, созданная «Силовой стеной».",
   "Существо-цель совершает спасбросок Ловкости. При провале цель получает 10d6 + 40 урона силовым полем. Если этот урон опускает хиты цели до 0, она распадается.",
   "Распавшееся существо и всё, что на нём надето и что оно несёт, кроме магических предметов, превращается в горстку тонкой серой пыли. Вернуть такое существо к жизни можно только заклинанием «Истинное воскрешение» или «Исполнение желаний».",
   "Заклинание автоматически уничтожает немагический предмет размером Большой или меньше или творение магической силы. Если цель — предмет или творение силы размером Огромный или больше, заклинание уничтожает его часть объёмом куб с ребром 10 футов. На магические предметы заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, урон увеличивается на 3d6 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dispel-evil-and-good",
  "name": "Развеивание добра и зла",
  "nameEn": "Dispel Evil and Good",
  "level": 5,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (святая вода или порошок из серебра и железа)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вас окружает мерцающая энергия, защищая от фей, нежити и существ из-за пределов Материального плана. Пока действует заклинание, небожители, элементали, феи, исчадия и нежить совершают броски атаки по вам с помехой.",
   "Вы можете окончить заклинание досрочно, использовав одну из особых функций ниже.",
   "***Снятие чар.*** Действием вы касаетесь существа в пределах досягаемости, очарованного, испуганного или одержимого небожителем, элементалем, феей, исчадием или нежитью. Существо больше не очаровано, не испугано и не одержимо такими существами.",
   "***Изгнание.*** Действием совершите рукопашную атаку заклинанием по небожителю, элементалю, фее, исчадию или нежити в пределах досягаемости. При попадании вы пытаетесь изгнать существо на его родной план. Существо должно преуспеть в спасброске Харизмы, иначе отправляется на родной план (если оно не там). Нежить, если она не на родном плане, отправляется в Царство Теней, а феи — в Страну Фей."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dispel-magic",
  "name": "Рассеивание магии",
  "nameEn": "Dispel Magic",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Выберите одно существо, предмет или магический эффект в пределах дистанции. Любое заклинание 3-го круга или ниже, действующее на цель, заканчивается. Для каждого заклинания 4-го круга или выше на цели совершите проверку своей заклинательной характеристики. КС равен 10 + круг заклинания. При успехе заклинание заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, вы автоматически оканчиваете на цели эффекты заклинаний, круг которых не выше круга использованной ячейки."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "divination",
  "name": "Предсказание",
  "nameEn": "Divination",
  "level": 4,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (благовония и жертвенное подношение, подобающее вашей религии, общей стоимостью не меньше 25 зм; заклинание их расходует)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Магия и подношение связывают вас с божеством или его слугами. Вы задаёте один вопрос о конкретной цели, событии или деле, которые произойдут в ближайшие 7 дней. Мастер даёт правдивый ответ — короткую фразу, загадочное стихотворение или знамение.",
   "Заклинание не учитывает обстоятельства, способные изменить исход, например наложение других заклинаний или появление и потерю спутников.",
   "Если наложить заклинание два раза или больше до окончания следующего длительного отдыха, за каждое накладывание после первого появляется накопительный шанс 25 процентов получить случайный ответ. Мастер бросает его втайне."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "divine-favor",
  "name": "Божественная благосклонность",
  "nameEn": "Divine Favor",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "paladin"
  ],
  "desc": [
   "Ваша молитва наполняет вас божественным сиянием. Пока действует заклинание, ваши атаки оружием при попадании причиняют дополнительно 1d4 урона излучением."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "divine-word",
  "name": "Божественное слово",
  "nameEn": "Divine Word",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "30 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "You utter a divine word, imbued with the power that shaped the world at the dawn of creation. Choose any number of creatures you can see within range. Each creature that can hear you must make a Charisma saving throw. On a failed save, a creature suffers an effect based on its current hit points:",
   "- 50 hit points or fewer: deafened for 1 minute",
   "- 40 hit points or fewer: deafened and blinded for 10 minutes",
   "- 30 hit points or fewer: blinded, deafened, and stunned for 1 hour",
   "- 20 hit points or fewer: killed instantly",
   "Regardless of its current hit points, a celestial, an elemental, a fey, or a fiend that fails its save is forced back to its plane of origin (if it isn't there already) and can't return to your current plane for 24 hours by any means short of a wish spell."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dominate-beast",
  "name": "Подчинение зверя",
  "nameEn": "Dominate Beast",
  "level": 4,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer"
  ],
  "desc": [
   "Вы пытаетесь подчинить видимого вами зверя в пределах дистанции. Он должен преуспеть в спасброске Мудрости, иначе будет очарован вами, пока действует заклинание. Если вы или дружественные вам существа сражаетесь с ним, он совершает спасбросок с преимуществом.",
   "Пока зверь очарован, у вас с ним телепатическая связь, если вы на одном плане бытия. Через неё вы можете, находясь в сознании, отдавать ему приказы (действие не требуется), и он изо всех сил их выполняет. Можно задать простой общий образ действий, например «Атакуй это существо», «Беги туда» или «Принеси этот предмет». Выполнив приказ и не получив новых указаний, зверь защищается и бережёт себя как может.",
   "Действием вы можете взять над целью полный и точный контроль. До конца вашего следующего хода существо совершает только выбранные вами действия и не делает ничего без вашего позволения. В это время вы можете заставить существо совершить реакцию, но для этого тратите и свою реакцию. Каждый раз, когда цель получает урон, она повторяет спасбросок Мудрости против заклинания. При успехе заклинание заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга, длительность — концентрация, вплоть до 10 минут. С ячейкой 6-го круга — вплоть до 1 часа. С ячейкой 7-го круга или выше — вплоть до 8 часов."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dominate-monster",
  "name": "Подчинение чудовища",
  "nameEn": "Dominate Monster",
  "level": 8,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You attempt to beguile a creature that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",
   "While the creature is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.",
   "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well.",
   "Each time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends."
  ],
  "higher": [
   "When you cast this spell with a 9th-level spell slot, the duration is concentration, up to 8 hours."
  ],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dominate-person",
  "name": "Подчинение личности",
  "nameEn": "Dominate Person",
  "level": 5,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь подчинить видимого вами гуманоида в пределах дистанции. Он должен преуспеть в спасброске Мудрости, иначе будет очарован вами, пока действует заклинание. Если вы или дружественные вам существа сражаетесь с ним, он совершает спасбросок с преимуществом.",
   "Пока цель очарована, у вас с ней телепатическая связь, если вы на одном плане бытия. Через неё вы можете, находясь в сознании, отдавать ей приказы (действие не требуется), и она изо всех сил их выполняет. Можно задать простой общий образ действий, например «Атакуй это существо», «Беги туда» или «Принеси этот предмет». Выполнив приказ и не получив новых указаний, существо защищается и бережёт себя как может.",
   "Действием вы можете взять над целью полный и точный контроль. До конца вашего следующего хода существо совершает только выбранные вами действия и не делает ничего без вашего позволения. В это время вы можете заставить существо совершить реакцию, но для этого тратите и свою реакцию.",
   "Каждый раз, когда цель получает урон, она повторяет спасбросок Мудрости против заклинания. При успехе заклинание заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга, длительность — концентрация, вплоть до 10 минут. С ячейкой 7-го круга — вплоть до 1 часа. С ячейкой 8-го круга или выше — вплоть до 8 часов."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "dream",
  "name": "Сон",
  "nameEn": "Dream",
  "level": 5,
  "school": "Иллюзия",
  "castingTime": "1 минута",
  "range": "Особая",
  "components": "В, С, М (горсть песка, капля чернил и писчее перо, выдернутое у спящей птицы)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинание формирует сны существа. Выберите целью известное вам существо. Оно должно быть на одном с вами плане бытия. С существами, которые не спят (например, эльфами), этим заклинанием связаться нельзя. Вы или согласное существо, которого вы касаетесь, впадаете в транс, становясь посланником.",
   "В трансе посланник осознаёт окружающее, но не может совершать действия и перемещаться.",
   "Если цель спит, посланник появляется в её снах и может беседовать с ней, пока она спит, в течение длительности заклинания. Посланник может также менять обстановку сна, создавая пейзажи, предметы и иные образы. Посланник может в любой момент выйти из транса, досрочно окончив заклинание. Проснувшись, цель отлично помнит сон. Если цель бодрствует в момент накладывания, посланник знает об этом и может либо выйти из транса (окончив заклинание), либо ждать, пока цель заснёт, и тогда появиться в её снах.",
   "Вы можете сделать облик посланника чудовищным и пугающим для цели. Тогда посланник может передать послание не длиннее десяти слов, после чего цель совершает спасбросок Мудрости. При провале отголоски призрачного чудовища порождают кошмар, длящийся весь сон цели и лишающий её всех преимуществ этого отдыха. Кроме того, проснувшись, цель получает 3d6 психического урона.",
   "Если у вас есть часть тела цели — прядь волос, обрезок ногтя или нечто подобное, — цель совершает спасбросок с помехой."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "druidcraft",
  "name": "Искусство друидов",
  "nameEn": "Druidcraft",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Шепча духам природы, вы создаёте в пределах дистанции один из следующих эффектов:",
   "- Крошечный безвредный сенсорный эффект, предсказывающий погоду в вашем месте на ближайшие 24 часа. Он может выглядеть как золотой шар при ясной погоде, облачко при дожде, падающие снежинки при снеге и так далее. Эффект длится 1 раунд.",
   "- Вы мгновенно заставляете распуститься цветок, раскрыться стручок с семенами или лопнуть древесную почку.",
   "- Вы создаёте мгновенный безвредный сенсорный эффект: падающие листья, порыв ветра, звук маленького животного или слабый запах скунса. Эффект должен умещаться в кубе с длиной ребра 5 футов.",
   "- Вы мгновенно зажигаете или гасите свечу, факел или небольшой костёр."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "earthquake",
  "name": "Землетрясение",
  "nameEn": "Earthquake",
  "level": 8,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "500 фт (сфера радиусом 100 фт)",
  "components": "В, С, М (A pinch of dirt, a piece of rock, and a lump of clay.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "sorcerer"
  ],
  "desc": [
   "You create a seismic disturbance at a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point and shakes creatures and structures in contact with the ground in that area.",
   "The ground in the area becomes difficult terrain. Each creature on the ground that is concentrating must make a constitution saving throw. On a failed save, the creature's concentration is broken.",
   "When you cast this spell and at the end of each turn you spend concentrating on it, each creature on the ground in the area must make a dexterity saving throw. On a failed save, the creature is knocked prone.",
   "This spell can have additional effects depending on the terrain in the area, as determined by the GM.",
   "Fissures. Fissures open throughout the spell's area at the start of your next turn after you cast the spell. A total of 1d6 such fissures open in locations chosen by the GM. Each is 1d10 x 10 feet deep, 10 feet wide, and extends from one edge of the spell's area to the opposite side. A creature standing on a spot where a fissure opens must succeed on a dexterity saving throw or fall in. A creature that successfully saves moves with the fissure's edge as it opens.",
   "A fissure that opens beneath a structure causes it to automatically collapse (see below).",
   "Structures. The tremor deals 50 bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the start of each of your turns until the spell ends. If a structure drops to 0 hit points, it collapses and potentially damages nearby creatures. A creature within half the distance of a structure's height must make a dexterity saving throw. On a failed save, the creature takes 5d6 bludgeoning damage, is knocked prone, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. The GM can adjust the DC higher or lower, depending on the nature of the rubble. On a successful save, the creature takes half as much damage and doesn't fall prone or become buried."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "eldritch-blast",
  "name": "Мистический заряд",
  "nameEn": "Eldritch Blast",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "warlock"
  ],
  "desc": [
   "К существу в пределах дистанции устремляется луч потрескивающей энергии. Совершите по цели дальнобойную атаку заклинанием. При попадании цель получает 1d10 урона силовым полем. С ростом уровня заклинание создаёт больше лучей: два луча на 5-м уровне, три на 11-м и четыре на 17-м. Лучи можно направить в одну цель или в разные. Для каждого луча совершается отдельный бросок атаки."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "enhance-ability",
  "name": "Улучшение характеристики",
  "nameEn": "Enhance Ability",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (шерсть или перо зверя)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "sorcerer"
  ],
  "desc": [
   "Вы касаетесь существа и наделяете его магическим усилением. Выберите один из эффектов ниже; цель получает его до окончания заклинания.",
   "***Выносливость медведя.*** Цель совершает проверки Телосложения с преимуществом. Она также получает 2d6 временных хитов, которые теряются, когда заклинание заканчивается.",
   "***Сила быка.*** Цель совершает проверки Силы с преимуществом, а её грузоподъёмность удваивается.",
   "***Грация кошки.*** Цель совершает проверки Ловкости с преимуществом. Кроме того, если она не недееспособна, она не получает урона от падения с высоты 20 футов или меньше.",
   "***Великолепие орла.*** Цель совершает проверки Харизмы с преимуществом.",
   "***Хитрость лисы.*** Цель совершает проверки Интеллекта с преимуществом.",
   "***Мудрость совы.*** Цель совершает проверки Мудрости с преимуществом."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, за каждый круг ячейки выше 2-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "enlarge-reduce",
  "name": "Увеличение/уменьшение",
  "nameEn": "Enlarge/Reduce",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (щепотка железного порошка)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы заставляете видимое вами существо или предмет в пределах дистанции увеличиться или уменьшиться на время действия заклинания. Выберите существо или предмет, который никто не несёт и не носит. Несогласная цель может совершить спасбросок Телосложения; при успехе заклинание не действует.",
   "Если цель — существо, всё, что на нём надето и что оно несёт, меняет размер вместе с ним. Предмет, выпущенный затронутым существом, сразу возвращается к обычному размеру.",
   "***Увеличение.*** Размеры цели удваиваются во всех измерениях, а вес увеличивается в восемь раз. Категория размера растёт на одну — например, со Среднего до Большого. Если места не хватает, существо или предмет достигает наибольшего размера, возможного в доступном пространстве. До окончания заклинания цель также совершает с преимуществом проверки и спасброски Силы. Оружие цели тоже вырастает; пока оно увеличено, атаки им причиняют дополнительно 1d4 урона.",
   "***Уменьшение.*** Размеры цели уменьшаются вдвое во всех измерениях, а вес — до одной восьмой. Категория размера уменьшается на одну — например, со Среднего до Маленького. До окончания заклинания цель совершает с помехой проверки и спасброски Силы. Оружие цели тоже уменьшается; пока оно уменьшено, атаки им причиняют на 1d4 урона меньше (но не меньше 1)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "entangle",
  "name": "Опутывание",
  "nameEn": "Entangle",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "90 фт (куб 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Из земли в квадрате со стороной 20 футов, начинающемся от точки в пределах дистанции, вырастают цепкие сорняки и лозы. Пока действует заклинание, растения превращают землю в области в труднопроходимую местность.",
   "Существо, находящееся в области в момент накладывания, должно преуспеть в спасброске Силы, иначе будет опутано растениями до окончания заклинания. Опутанное существо может действием совершить проверку Силы против КС ваших заклинаний и при успехе освобождается.",
   "Когда заклинание заканчивается, призванные растения увядают."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "enthrall",
  "name": "Завораживание",
  "nameEn": "Enthrall",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "warlock"
  ],
  "desc": [
   "Вы плетёте отвлекающую речь, и выбранные вами видимые существа в пределах дистанции, которые слышат вас, совершают спасбросок Мудрости. Существо, которое нельзя очаровать, автоматически преуспевает, а существо, с которым сражаетесь вы или ваши спутники, совершает спасбросок с преимуществом. При провале цель совершает с помехой проверки Мудрости (Внимательность), чтобы заметить кого-либо, кроме вас, пока не закончится заклинание или пока цель не перестанет вас слышать. Заклинание заканчивается, если вы становитесь недееспособны или больше не можете говорить."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "etherealness",
  "name": "Эфирность",
  "nameEn": "Etherealness",
  "level": 7,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can see and hear the plane you originated from, but everything there looks gray, and you can't see anything more than 60 feet away.",
   "While on the Ethereal Plane, you can only affect and be affected by other creatures on that plane. Creatures that aren't on the Ethereal Plane can't perceive you and can't interact with you, unless a special ability or magic has given them the ability to do so.",
   "You ignore all objects and effects that aren't on the Ethereal Plane, allowing you to move through objects you perceive on the plane you originated from.",
   "When the spell ends, you immediately return to the plane you originated from in the spot you currently occupy. If you occupy the same spot as a solid object or creature when this happens, you are immediately shunted to the nearest unoccupied space that you can occupy and take force damage equal to twice the number of feet you are moved.",
   "This spell has no effect if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 8th level or higher, you can target up to three willing creatures (including you) for each slot level above 7th. The creatures must be within 10 feet of you when you cast the spell."
  ],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "expeditious-retreat",
  "name": "Поспешное отступление",
  "nameEn": "Expeditious Retreat",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинание позволяет вам двигаться с невероятной скоростью. Накладывая его, а затем бонусным действием в каждый свой ход до окончания заклинания, вы можете совершать действие «Рывок»."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "eyebite",
  "name": "Разящее око",
  "nameEn": "Eyebite",
  "level": 6,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, ваши глаза становятся чернильной пустотой, наполненной жуткой силой. Одно выбранное вами видимое существо в пределах 60 футов должно преуспеть в спасброске Мудрости, иначе на время действия заклинания попадает под один из эффектов ниже на ваш выбор. В каждый свой ход до окончания заклинания вы можете действием выбрать целью другое существо, но не существо, уже преуспевшее в спасброске против этого накладывания.",
   "***Сон.*** Цель теряет сознание. Она просыпается, если получает любой урон или если другое существо действием растормошит её.",
   "***Паника.*** Цель испугана вами. В каждый свой ход испуганное существо должно совершать действие «Рывок» и удаляться от вас самым безопасным и коротким доступным путём, если есть куда двигаться. Если цель оказывается в месте не ближе 60 футов от вас, откуда больше вас не видит, эффект заканчивается.",
   "***Недомогание.*** Цель совершает с помехой броски атаки и проверки характеристик. В конце каждого своего хода она может повторить спасбросок Мудрости; при успехе эффект заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fabricate",
  "name": "Изготовление",
  "nameEn": "Fabricate",
  "level": 4,
  "school": "Преобразование",
  "castingTime": "10 минут",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы превращаете сырьё в изделия из того же материала. Например, можно изготовить деревянный мост из рощицы, верёвку из пучка конопли, одежду из льна или шерсти.",
   "Выберите видимое вами сырьё в пределах дистанции. При достаточном количестве сырья можно изготовить предмет размером Большой или меньше (умещающийся в кубе с ребром 10 футов или в восьми соединённых кубах с ребром 5 футов). Если вы работаете с металлом, камнем или иным минералом, изделие может быть не больше Среднего (умещающееся в одном кубе с ребром 5 футов). Качество изделий соответствует качеству сырья.",
   "Этим заклинанием нельзя создать или преобразовать существ или магические предметы. Нельзя также изготовить предметы, обычно требующие высокого мастерства, — украшения, оружие, стекло или доспехи, — если вы не владеете соответствующими инструментами ремесленника."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "faerie-fire",
  "name": "Огонь фей",
  "nameEn": "Faerie Fire",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт (куб 20 фт)",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Каждый предмет в кубе с ребром 20 футов в пределах дистанции очерчивается синим, зелёным или фиолетовым светом (на ваш выбор). Каждое существо в области в момент накладывания тоже очерчивается светом, если провалит спасбросок Ловкости. Пока действует заклинание, предметы и затронутые существа испускают тусклый свет в радиусе 10 футов.",
   "Броски атаки по затронутому существу или предмету совершаются с преимуществом, если атакующий видит цель, а невидимость не даёт затронутому существу или предмету никаких преимуществ."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "faithful-hound",
  "name": "Верный пёс",
  "nameEn": "Faithful Hound",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (крошечный серебряный свисток, кусочек кости и нитка)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы призываете призрачного сторожевого пса в видимое вами свободное пространство в пределах дистанции. Он остаётся там, пока действует заклинание, пока вы не прогоните его действием или пока вы не удалитесь от него больше чем на 100 футов.",
   "Пёс невидим для всех, кроме вас, и неуязвим. Когда существо размером Маленькое или больше приближается к нему ближе 30 футов, не назвав заданный вами при накладывании пароль, пёс начинает громко лаять. Пёс видит невидимых существ и Эфирный план и игнорирует иллюзии.",
   "В начале каждого вашего хода пёс пытается укусить одно враждебное вам существо в пределах 5 футов от себя. Его бонус атаки равен модификатору вашей заклинательной характеристики + ваш бонус мастерства. При попадании он причиняет 4d8 колющего урона."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "false-life",
  "name": "Псевдожизнь",
  "nameEn": "False Life",
  "level": 1,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (немного спирта или крепкого напитка)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Укрепляя себя некромантическим подобием жизни, вы получаете 1d4 + 4 временных хита на время действия заклинания."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы получаете на 5 временных хитов больше."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fear",
  "name": "Ужас",
  "nameEn": "Fear",
  "level": 3,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя (конус 30 фт)",
  "components": "В, С, М (белое перо или сердце курицы)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы проецируете призрачный образ самых страшных кошмаров существ. Каждое существо в конусе 30 футов должно преуспеть в спасброске Мудрости, иначе роняет всё, что держит, и становится испуганным, пока действует заклинание.",
   "Испуганное этим заклинанием существо в каждый свой ход должно совершать действие «Рывок» и удаляться от вас самым безопасным доступным путём, если есть куда двигаться. Если существо заканчивает ход там, откуда не видит вас, оно может совершить спасбросок Мудрости. При успехе заклинание для него заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "feather-fall",
  "name": "Падение пёрышком",
  "nameEn": "Feather Fall",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 реакция",
  "range": "60 фт",
  "components": "В, М (маленькое пёрышко или клочок пуха)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Выберите до пяти падающих существ в пределах дистанции. Пока действует заклинание, скорость падения существа снижается до 60 футов за раунд. Если существо приземляется до окончания заклинания, оно не получает урона от падения, может приземлиться на ноги, и заклинание для него заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "feeblemind",
  "name": "Слабоумие",
  "nameEn": "Feeblemind",
  "level": 8,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "150 фт",
  "components": "В, С, М (A handful of clay, crystal, glass, or mineral spheres.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 psychic damage and must make an intelligence saving throw.",
   "On a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way. The creature can, however, identify its friends, follow them, and even protect them.",
   "At the end of every 30 days, the creature can repeat its saving throw against this spell. If it succeeds on its saving throw, the spell ends.",
   "The spell can also be ended by greater restoration, heal, or wish."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "find-familiar",
  "name": "Поиск фамильяра",
  "nameEn": "Find Familiar",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 час",
  "range": "10 фт",
  "components": "В, С, М (уголь, благовония и травы стоимостью 10 зм, сжигаемые в латунной жаровне)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вам начинает служить фамильяр — дух, принимающий выбранный вами облик животного: летучей мыши, кошки, краба, лягушки (жабы), ястреба, ящерицы, осьминога, совы, ядовитой змеи, рыбы (квиппера), крысы, ворона, морского конька, паука или ласки. Фамильяр появляется в свободном пространстве в пределах дистанции и обладает параметрами выбранного облика, но является не зверем, а небожителем, феей или исчадием (на ваш выбор).",
   "Фамильяр действует независимо от вас, но всегда подчиняется вашим командам. В бою он совершает собственный бросок инициативы и действует в свой ход. Фамильяр не может атаковать, но может совершать другие действия как обычно.",
   "Когда хиты фамильяра опускаются до 0, он исчезает, не оставляя тела, и появляется снова, когда вы повторно накладываете это заклинание.",
   "Пока фамильяр находится в пределах 100 футов от вас, вы можете телепатически общаться с ним. Кроме того, действием вы можете до начала своего следующего хода видеть его глазами и слышать то, что слышит он, получая преимущества его особых чувств. В это время вы слепы и глухи в отношении собственных чувств.",
   "Действием вы можете временно отпустить фамильяра: он исчезает в карманном измерении и ждёт призыва. Можно отпустить его и навсегда. Пока фамильяр временно отпущен, вы можете действием вернуть его в любое свободное пространство в пределах 30 футов от себя.",
   "Одновременно у вас может быть только один фамильяр. Если вы накладываете заклинание, уже имея фамильяра, вы вместо этого меняете его облик на один из перечисленных выше.",
   "Наконец, когда вы накладываете заклинание с дистанцией «касание», ваш фамильяр может доставить его, как если бы накладывал сам. Фамильяр должен быть в пределах 100 футов от вас и потратить реакцию в момент накладывания. Если заклинание требует броска атаки, используйте свой модификатор атаки."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "find-steed",
  "name": "Поиск скакуна",
  "nameEn": "Find Steed",
  "level": 2,
  "school": "Вызов",
  "castingTime": "10 минут",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "paladin"
  ],
  "desc": [
   "Вы призываете духа, который принимает облик необычайно умного, сильного и верного скакуна, и создаёте с ним долгую связь. Скакун появляется в свободном пространстве в пределах дистанции в выбранном вами облике — боевого коня, пони, верблюда, лося или мастифа (Мастер может разрешить и других животных). Скакун обладает параметрами выбранного облика, но является небожителем, феей или исчадием (на ваш выбор) вместо своего обычного вида. Кроме того, если Интеллект скакуна 5 или ниже, он становится равным 6, и скакун начинает понимать один известный вам язык на ваш выбор.",
   "Скакун служит вам ездовым животным в бою и вне его, а инстинктивная связь позволяет вам сражаться как единое целое. Пока вы верхом на скакуне, любое заклинание, которое вы накладываете только на себя, может также действовать на скакуна.",
   "Когда хиты скакуна опускаются до 0, он исчезает, не оставляя тела. Вы также можете в любой момент действием отпустить скакуна, и он исчезнет. В обоих случаях повторное накладывание заклинания призывает того же скакуна с полным запасом хитов.",
   "Пока скакун находится в пределах 1 мили от вас, вы можете общаться с ним телепатически.",
   "Одновременно у вас может быть только один скакун, связанный этим заклинанием. Действием вы можете в любой момент освободить скакуна от связи, и он исчезнет."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "find-the-path",
  "name": "Поиск пути",
  "nameEn": "Find the Path",
  "level": 6,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В, С, М (набор гадательных принадлежностей — кости, палочки из слоновой кости, карты, зубы или резные руны — стоимостью 100 зм и предмет из места, которое вы хотите найти)",
  "duration": "Концентрация, вплоть до 24 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "Заклинание позволяет найти кратчайший и самый прямой физический путь к определённому неподвижному месту на том же плане бытия, которое вам знакомо. Если назвать место на другом плане, движущееся место (например, передвижную крепость) или неконкретное место (например, «логово зелёного дракона»), заклинание не срабатывает.",
   "Пока действует заклинание и пока вы на одном плане бытия с целью, вы знаете, как далеко она и в каком направлении. В пути каждый раз, когда перед вами выбор дорог, вы автоматически определяете, какая из них кратчайшая и самая прямая (но не обязательно самая безопасная)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "find-traps",
  "name": "Поиск ловушек",
  "nameEn": "Find Traps",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы чувствуете присутствие любой ловушки в пределах дистанции и в пределах прямой видимости. Ловушкой для этого заклинания считается всё, что внезапно или неожиданно причиняет эффект, который вы считаете вредным или нежелательным, и было задумано создателем именно так. Заклинание почувствует область «Тревоги», «Охранные руны» или механическую ловушку-яму, но не выявит природную слабость пола, неустойчивый потолок или скрытую карстовую воронку.",
   "Заклинание лишь сообщает, что ловушка есть. Вы не узнаёте, где находится каждая ловушка, но узнаёте общую природу опасности от замеченной ловушки."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "finger-of-death",
  "name": "Перст смерти",
  "nameEn": "Finger of Death",
  "level": 7,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one.",
   "A humanoid killed by this spell rises at the start of your next turn as a zombie that is permanently under your command, following your verbal orders to the best of its ability."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fire-bolt",
  "name": "Огненный снаряд",
  "nameEn": "Fire Bolt",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы бросаете сгусток огня в существо или предмет в пределах дистанции. Совершите по цели дальнобойную атаку заклинанием. При попадании цель получает 1d10 урона огнём. Горючий предмет, в который попало заклинание, воспламеняется, если его никто не носит и не держит.",
   "Урон заклинания увеличивается на 1d10, когда вы достигаете 5-го уровня (2d10), 11-го уровня (3d10) и 17-го уровня (4d10)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fire-shield",
  "name": "Огненный щит",
  "nameEn": "Fire Shield",
  "level": 4,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 5 фт)",
  "components": "В, С, М (немного фосфора или светлячок)",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, ваше тело окутывают тонкие призрачные языки пламени, испуская яркий свет в радиусе 10 футов и тусклый свет ещё на 10 футов. Вы можете окончить заклинание досрочно действием.",
   "Пламя образует вокруг вас тёплый или холодный щит — на ваш выбор. Тёплый щит даёт сопротивление урону холодом, холодный — сопротивление урону огнём.",
   "Кроме того, каждый раз, когда существо в пределах 5 футов от вас попадает по вам рукопашной атакой, из щита вырывается пламя. Атакующий получает 2d8 урона огнём от тёплого щита или 2d8 урона холодом от холодного."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fire-storm",
  "name": "Огненная буря",
  "nameEn": "Fire Storm",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "150 фт (куб 100 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "sorcerer"
  ],
  "desc": [
   "A storm made up of sheets of roaring flame appears in a location you choose within range. The area of the storm consists of up to ten 10-foot cubes, which you can arrange as you wish. Each cube must have at least one face adjacent to the face of another cube. Each creature in the area must make a dexterity saving throw. It takes 7d10 fire damage on a failed save, or half as much damage on a successful one.",
   "The fire damages objects in the area and ignites flammable objects that aren't being worn or carried. If you choose, plant life in the area is unaffected by this spell."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fireball",
  "name": "Огненный шар",
  "nameEn": "Fireball",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "150 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (крошечный шарик из гуано летучей мыши и серы)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Из вашего указующего пальца к выбранной вами точке в пределах дистанции устремляется яркая полоса и с глухим рёвом расцветает огненным взрывом. Каждое существо в сфере радиусом 20 футов с центром в этой точке совершает спасбросок Ловкости. При провале цель получает 8d6 урона огнём, при успехе — половину этого урона.",
   "Огонь огибает углы. Он поджигает в области горючие предметы, которые никто не носит и не держит."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "flame-blade",
  "name": "Пылающий клинок",
  "nameEn": "Flame Blade",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В, С, М (лист сумаха)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "В вашей свободной руке появляется пылающий клинок размером и формой со скимитар; он существует, пока действует заклинание. Если выпустить клинок, он исчезает, но его можно снова призвать бонусным действием.",
   "Действием вы можете совершить пылающим клинком рукопашную атаку заклинанием. При попадании цель получает 3d6 урона огнём.",
   "Пылающий клинок испускает яркий свет в радиусе 10 футов и тусклый свет ещё на 10 футов."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d6 за каждые два круга ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "flame-strike",
  "name": "Небесный огонь",
  "nameEn": "Flame Strike",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт (цилиндр радиусом 40 фт)",
  "components": "В, С, М (щепотка серы)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "В указанном вами месте с небес с рёвом обрушивается вертикальный столб божественного огня. Каждое существо в цилиндре радиусом 10 футов и высотой 40 футов с центром в точке в пределах дистанции совершает спасбросок Ловкости. При провале существо получает 4d6 урона огнём и 4d6 урона излучением, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, урон огнём или урон излучением (на ваш выбор) увеличивается на 1d6 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "flaming-sphere",
  "name": "Пылающий шар",
  "nameEn": "Flaming Sphere",
  "level": 2,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (кусочек сала, щепотка серы и железная пыль)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "В выбранном вами свободном пространстве в пределах дистанции появляется огненная сфера диаметром 5 футов и существует, пока действует заклинание. Каждое существо, заканчивающее ход в пределах 5 футов от сферы, совершает спасбросок Ловкости. При провале оно получает 2d6 урона огнём, при успехе — половину этого урона.",
   "Бонусным действием вы можете переместить сферу на расстояние до 30 футов. Если вы направляете сферу в существо, оно совершает спасбросок против урона сферы, а сфера в этот ход прекращает движение.",
   "Перемещая сферу, можно перекатить её через препятствия высотой до 5 футов и перепрыгнуть ямы шириной до 10 футов. Сфера поджигает горючие предметы, которые никто не носит и не держит, и испускает яркий свет в радиусе 20 футов и тусклый свет ещё на 20 футов."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "flesh-to-stone",
  "name": "Окаменение",
  "nameEn": "Flesh to Stone",
  "level": 6,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (щепотка извести, вода и земля)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь превратить одно видимое вами существо в пределах дистанции в камень. Если тело цели из плоти, она совершает спасбросок Телосложения. При провале она опутана: её плоть начинает твердеть. При успехе существо не затронуто.",
   "Опутанное этим заклинанием существо в конце каждого своего хода повторяет спасбросок Телосложения. После трёх успехов заклинание заканчивается. После трёх провалов существо превращается в камень и окаменевает на время действия заклинания. Успехи и провалы не обязательно должны идти подряд; учитывайте и те и другие, пока цель не наберёт три одинаковых.",
   "Если окаменевшее существо физически повредить, то, вернувшись в обычное состояние, оно получит подобные увечья.",
   "Если вы поддерживаете концентрацию на заклинании всю возможную длительность, существо остаётся камнем, пока эффект не снимут."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "floating-disk",
  "name": "Парящий диск",
  "nameEn": "Floating Disk",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (капля ртути)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Заклинание создаёт круглую горизонтальную плоскость силового поля диаметром 3 фута и толщиной 1 дюйм. Она парит в 3 футах над землёй в выбранном вами видимом свободном пространстве в пределах дистанции. Диск существует, пока действует заклинание, и выдерживает до 500 фунтов. Если нагрузить его сильнее, заклинание заканчивается, и всё, что было на диске, падает на землю.",
   "Пока вы находитесь в пределах 20 футов от диска, он неподвижен. Если вы удаляетесь дальше, диск следует за вами, держась в пределах 20 футов. Он может перемещаться по неровной местности, вверх и вниз по лестницам, склонам и тому подобному, но не может преодолеть перепад высоты в 10 футов и больше. Например, диск не перелетит яму глубиной 10 футов и не выберется из неё, если был создан на дне.",
   "Если вы удаляетесь от диска больше чем на 100 футов (обычно потому, что он не может обогнуть препятствие), заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fly",
  "name": "Полёт",
  "nameEn": "Fly",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (маховое перо любой птицы)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь согласного существа. Пока действует заклинание, цель получает скорость полёта 60 футов. Когда заклинание заканчивается, цель, если она ещё в воздухе, падает, если не может предотвратить падение."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, за каждый круг ячейки выше 3-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "fog-cloud",
  "name": "Туманное облако",
  "nameEn": "Fog Cloud",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте сферу тумана радиусом 20 футов с центром в точке в пределах дистанции. Сфера огибает углы, а её область сильно заслонена. Туман держится, пока действует заклинание или пока его не развеет ветер умеренной силы или сильнее (не меньше 10 миль в час)."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, радиус тумана увеличивается на 20 футов за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "forbiddance",
  "name": "Запрет",
  "nameEn": "Forbiddance",
  "level": 6,
  "school": "Ограждение",
  "castingTime": "10 минут",
  "range": "Касание (куб 40000 фт)",
  "components": "В, С, М (несколько капель святой воды, редкие благовония и рубиновый порошок стоимостью не меньше 1 000 зм)",
  "duration": "24 часа",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы создаёте защиту от магических перемещений, охраняющую до 40 000 квадратных футов площади пола на высоту до 30 футов. Пока действует заклинание, существа не могут телепортироваться в область или входить в неё через порталы, например созданные «Вратами». Заклинание защищает область от межпланарных перемещений и не даёт попасть в неё через Астральный план, Эфирный план, Страну Фей, Царство Теней или заклинанием «Уход в иной мир».",
   "Кроме того, заклинание причиняет урон существам видов, выбранных при накладывании: одного или нескольких из небожителей, элементалей, фей, исчадий и нежити. Когда выбранное существо впервые за ход входит в область или начинает в ней ход, оно получает 5d10 урона излучением или некротического урона (выбирается при накладывании).",
   "При накладывании можно задать пароль. Существо, произносящее пароль при входе в область, не получает урона от заклинания.",
   "Область заклинания не может пересекаться с областью другого «Запрета». Если накладывать «Запрет» каждый день 30 дней подряд на одном месте, он действует, пока его не рассеют, а материальные компоненты расходуются при последнем накладывании."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "forcecage",
  "name": "Силовая клетка",
  "nameEn": "Forcecage",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "100 фт (куб 20 фт)",
  "components": "В, С, М (Ruby dust worth 1,500 gp.)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "An immobile, invisible, cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box, as you choose.",
   "A prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart.",
   "A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out from the area.",
   "When you cast the spell, any creature that is completely inside the cage's area is trapped. Creatures only partially within the area, or those too large to fit inside the area, are pushed away from the center of the area until they are completely outside the area.",
   "A creature inside the cage can't leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave the cage, it must first make a charisma saving throw. On a success, the creature can use that magic to exit the cage. On a failure, the creature can't exit the cage and wastes the use of the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel.",
   "This spell can't be dispelled by dispel magic."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "foresight",
  "name": "Предвидение",
  "nameEn": "Foresight",
  "level": 9,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "В, С, М (A hummingbird feather.)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can't be surprised and has advantage on attack rolls, ability checks, and saving throws. Additionally, other creatures have disadvantage on attack rolls against the target for the duration.",
   "This spell immediately ends if you cast it again before its duration ends."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "freedom-of-movement",
  "name": "Свобода перемещения",
  "nameEn": "Freedom of Movement",
  "level": 4,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (кожаный ремешок, обёрнутый вокруг руки или иной конечности)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы касаетесь согласного существа. Пока действует заклинание, труднопроходимая местность не влияет на перемещение цели, а заклинания и иные магические эффекты не могут ни уменьшить её скорость, ни парализовать или опутать её.",
   "Цель также может потратить 5 футов перемещения, чтобы автоматически освободиться от немагических пут, например кандалов или хватки существа. Наконец, нахождение под водой не накладывает штрафов на перемещение и атаки цели."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "freezing-sphere",
  "name": "Леденящая сфера",
  "nameEn": "Freezing Sphere",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "300 фт (сфера радиусом 60 фт)",
  "components": "В, С, М (маленькая хрустальная сфера)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Из кончиков ваших пальцев к выбранной вами точке в пределах дистанции летит ледяной шар холодной энергии и взрывается сферой радиусом 60 футов. Каждое существо в области совершает спасбросок Телосложения. При провале существо получает 10d6 урона холодом, при успехе — половину этого урона.",
   "Если шар попадает в водоём или жидкость, состоящую в основном из воды (кроме водных существ), он замораживает её на глубину 6 дюймов на площади 30 на 30 футов. Лёд держится 1 минуту. Существа, плававшие на поверхности замёрзшей воды, вмерзают в лёд. Вмёрзшее существо может действием совершить проверку Силы против КС ваших заклинаний, чтобы освободиться.",
   "Закончив накладывание, вы можете не выпускать шар. Тогда в вашей руке появляется маленький шарик размером с камень для пращи, холодный на ощупь. В любой момент вы или существо, которому вы его отдали, можете бросить шарик (на 40 футов) или метнуть пращой (на её обычную дистанцию). При ударе он разбивается с тем же эффектом, что и при обычном накладывании. Шарик можно и положить, не разбив. Через 1 минуту, если он ещё не разбит, он взрывается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "gaseous-form",
  "name": "Газообразная форма",
  "nameEn": "Gaseous Form",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (кусочек марли и струйка дыма)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы превращаете согласное существо, которого касаетесь, вместе со всем, что на нём надето и что оно несёт, в облако тумана на время действия заклинания. Заклинание заканчивается, если хиты существа опускаются до 0. На бестелесных существ заклинание не действует.",
   "В этом облике цель может передвигаться только полётом со скоростью 10 футов. Она может входить в пространство другого существа и находиться в нём. Цель обладает сопротивлением немагическому урону и совершает с преимуществом спасброски Силы, Ловкости и Телосложения. Она может проходить сквозь небольшие отверстия, узкие проходы и даже трещины, но жидкости для неё — твёрдые поверхности. Цель не может упасть и продолжает парить в воздухе, даже будучи ошеломлённой или недееспособной по иной причине.",
   "В облике облака цель не может говорить и манипулировать предметами, а предметы, которые она несла или держала, нельзя уронить, использовать или как-то иначе с ними взаимодействовать. Цель не может атаковать и накладывать заклинания."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "gate",
  "name": "Врата",
  "nameEn": "Gate",
  "level": 9,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (A diamond worth at least 5,000gp.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration.",
   "The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal.",
   "Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains.",
   "When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn't work). If that creature is on a plane other than the one you are on, the portal opens in the named creature's immediate vicinity and draws the creature through it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the GM deems appropriate. It might leave, attack you, or help you."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "geas",
  "name": "Обет",
  "nameEn": "Geas",
  "level": 5,
  "school": "Очарование",
  "castingTime": "1 минута",
  "range": "60 фт",
  "components": "В",
  "duration": "30 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "wizard"
  ],
  "desc": [
   "Вы налагаете магический приказ на видимое вами существо в пределах дистанции, заставляя его выполнить некую службу или воздерживаться от некоего действия или образа действий — на ваше усмотрение. Если существо понимает вас, оно должно преуспеть в спасброске Мудрости, иначе будет очаровано вами, пока действует заклинание. Пока существо очаровано, каждый раз, когда оно действует прямо вопреки вашим указаниям, оно получает 5d10 психического урона, но не чаще раза в день. На существо, не понимающее вас, заклинание не действует.",
   "Вы можете отдать любой приказ, кроме ведущего к верной смерти. Если вы отдаёте самоубийственный приказ, заклинание заканчивается.",
   "Вы можете окончить заклинание досрочно действием. Его также оканчивают заклинания «Снятие проклятья», «Высшее восстановление» и «Исполнение желаний»."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го или 8-го круга, длительность — 1 год. С ячейкой 9-го круга заклинание действует, пока его не окончит одно из перечисленных выше заклинаний."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "gentle-repose",
  "name": "Нетленные останки",
  "nameEn": "Gentle Repose",
  "level": 2,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (щепотка соли и по медной монете на каждый глаз трупа; монеты должны лежать там всё время действия заклинания)",
  "duration": "10 дней",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь трупа или иных останков. Пока действует заклинание, цель защищена от разложения и не может стать нежитью.",
   "Заклинание также фактически продлевает срок, в который цель можно вернуть к жизни: дни под действием этого заклинания не засчитываются в ограничение по времени для таких заклинаний, как «Оживление»."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "giant-insect",
  "name": "Гигантское насекомое",
  "nameEn": "Giant Insect",
  "level": 4,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Вы превращаете до десяти многоножек, трёх пауков, пяти ос или одного скорпиона в пределах дистанции в гигантские версии их природного облика на время действия заклинания: многоножка становится гигантской многоножкой, паук — гигантским пауком, оса — гигантской осой, скорпион — гигантским скорпионом.",
   "Каждое существо выполняет ваши устные приказы, а в бою действует в ваш ход каждый раунд. Параметры этих существ у Мастера, он же определяет их действия и перемещение.",
   "Существо остаётся гигантским, пока действует заклинание, пока его хиты не опустятся до 0 или пока вы действием не прекратите эффект на нём.",
   "Мастер может разрешить выбрать иные цели. Например, гигантская пчела может иметь параметры гигантской осы."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "glibness",
  "name": "Красноречие",
  "nameEn": "Glibness",
  "level": 8,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "warlock"
  ],
  "desc": [
   "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "globe-of-invulnerability",
  "name": "Сфера неуязвимости",
  "nameEn": "Globe of Invulnerability",
  "level": 6,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 10 фт)",
  "components": "В, С, М (стеклянная или хрустальная бусина, которая разбивается, когда заклинание заканчивается)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вокруг вас в радиусе 10 футов возникает неподвижный, слегка мерцающий барьер и держится, пока действует заклинание.",
   "Любое заклинание 5-го круга или ниже, наложенное снаружи барьера, не может затронуть существ и предметы внутри него, даже если наложено ячейкой более высокого круга. Такое заклинание может выбрать целью существ и предметы внутри барьера, но не оказывает на них эффекта. Точно так же область внутри барьера исключается из областей действия таких заклинаний."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, за каждый круг ячейки выше 6-го барьер блокирует заклинания на один круг выше."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "glyph-of-warding",
  "name": "Охранные руны",
  "nameEn": "Glyph of Warding",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (благовония и алмазная пыль стоимостью не меньше 200 зм, которые заклинание расходует)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "Накладывая заклинание, вы начертываете символ, причиняющий вред другим существам, — на поверхности (столе, участке пола или стены) или внутри закрывающегося предмета (книги, свитка, сундука с сокровищами), чтобы спрятать его. На поверхности символ может занимать область диаметром не больше 10 футов. Предмет с символом должен оставаться на месте: если его переместить больше чем на 10 футов от места накладывания, символ ломается, и заклинание заканчивается, не сработав.",
   "Символ почти невидим; чтобы найти его, нужна успешная проверка Интеллекта (Анализ) против КС ваших заклинаний.",
   "При накладывании вы решаете, что приводит символ в действие. Для символа на поверхности типичные условия — прикосновение к нему или наступание на него, снятие предмета, закрывающего символ, приближение к символу на определённое расстояние или манипуляции с предметом, на котором он начертан. Для символа внутри предмета — открытие предмета, приближение к нему на определённое расстояние, взгляд на символ или его прочтение. Сработав, символ оканчивает заклинание.",
   "Условие можно уточнить так, чтобы заклинание срабатывало только при определённых обстоятельствах, по физическим признакам (росту, весу), виду существ (например, только на аберраций или дроу) или мировоззрению. Можно также указать существ, на которых символ не срабатывает, например тех, кто назовёт пароль.",
   "Начертывая символ, выберите *взрывные руны* или *символ заклинания*.",
   "***Взрывные руны.*** Сработав, символ взрывается магической энергией в сфере радиусом 20 футов с центром на символе. Сфера огибает углы. Каждое существо в области совершает спасбросок Ловкости. При провале существо получает 5d8 урона кислотой, холодом, огнём, электричеством или звуком (выбирается при создании символа), при успехе — половину этого урона.",
   "***Символ заклинания.*** Вы можете поместить в символ подготовленное заклинание 3-го круга или ниже, наложив его в процессе создания символа. Заклинание должно действовать на одно существо или область. Заклинание, наложенное так, не оказывает немедленного эффекта. Когда символ срабатывает, хранимое заклинание накладывается. Если у него есть цель, целью становится существо, вызвавшее срабатывание. Если оно действует на область, центр области — на этом существе. Если заклинание призывает враждебных существ или создаёт вредоносные предметы или ловушки, они появляются как можно ближе к нарушителю и атакуют его. Если заклинание требует концентрации, оно действует всю свою длительность."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон взрывных рун увеличивается на 1d8 за каждый круг ячейки выше 3-го. В символ заклинания можно поместить заклинание любого круга не выше круга ячейки, использованной для «Охранных рун»."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "goodberry",
  "name": "Чудо-ягоды",
  "nameEn": "Goodberry",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (веточка омелы)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "В вашей руке появляется до десяти ягод, наполненных магией на время действия заклинания. Существо может действием съесть одну ягоду. Съеденная ягода восстанавливает 1 хит и насыщает существо на целый день.",
   "Ягоды теряют силу, если их не съесть в течение 24 часов после накладывания заклинания."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "grease",
  "name": "Скольжение",
  "nameEn": "Grease",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт (куб 10 фт)",
  "components": "В, С, М (кусочек свиной шкурки или масла)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Скользкий жир покрывает землю в квадрате со стороной 10 футов с центром в точке в пределах дистанции и превращает её в труднопроходимую местность на время действия заклинания.",
   "Когда жир появляется, каждое существо, стоящее в области, должно преуспеть в спасброске Ловкости, иначе падает ничком. Существо, входящее в область или заканчивающее в ней ход, тоже должно преуспеть в спасброске Ловкости, иначе падает ничком."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "greater-invisibility",
  "name": "Высшая невидимость",
  "nameEn": "Greater Invisibility",
  "level": 4,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы или существо, которого вы касаетесь, становитесь невидимыми до окончания заклинания. Всё, что цель носит и несёт, невидимо, пока находится при ней."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "greater-restoration",
  "name": "Высшее восстановление",
  "nameEn": "Greater Restoration",
  "level": 5,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (алмазная пыль стоимостью не меньше 100 зм, которую заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "Вы наполняете существо, которого касаетесь, положительной энергией, снимая изнуряющий эффект. Можно снизить степень истощения цели на один или окончить на ней один из эффектов:",
   "- Один эффект, очаровавший или окаменивший цель",
   "- Одно проклятие, включая настройку цели на проклятый магический предмет",
   "- Любое уменьшение одной из характеристик цели",
   "- Один эффект, уменьшающий максимум хитов цели"
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "guardian-of-faith",
  "name": "Страж веры",
  "nameEn": "Guardian of Faith",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "30 фт (цилиндр радиусом 10 фт)",
  "components": "В",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "В выбранном вами видимом свободном пространстве в пределах дистанции появляется Большой призрачный страж и парит там, пока действует заклинание. Страж занимает это пространство; виден он смутно, кроме сверкающего меча и щита с символом вашего божества.",
   "Каждое враждебное вам существо, впервые за ход переместившееся в пространство в пределах 10 футов от стража, должно преуспеть в спасброске Ловкости. При провале существо получает 20 урона излучением, при успехе — половину этого урона. Страж исчезает, когда причинит в сумме 60 урона."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "guards-and-wards",
  "name": "Охрана и защита",
  "nameEn": "Guards and Wards",
  "level": 6,
  "school": "Ограждение",
  "castingTime": "10 минут",
  "range": "Касание (куб 2500 фт)",
  "components": "В, С, М (горящие благовония, немного серы и масла, верёвка с узлами, немного крови бурого увальня и маленький серебряный жезл стоимостью не меньше 10 зм)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы создаёте защиту, охраняющую до 2 500 квадратных футов площади пола (квадрат 50 на 50 футов, сто квадратов 5 на 5 футов или двадцать пять квадратов 10 на 10 футов). Высота охраняемой области — до 20 футов, форма — на ваш выбор. Можно защитить несколько этажей крепости, распределив площадь между ними, если вы можете пройти в каждую смежную область, пока накладываете заклинание.",
   "При накладывании вы можете указать лиц, на которых не действует любой или все выбранные эффекты. Можно также задать пароль: произнёсший его вслух становится невосприимчив к этим эффектам.",
   "«Охрана и защита» создаёт в охраняемой области следующие эффекты.",
   "***Коридоры.*** Все охраняемые коридоры заполняет туман, делая их сильно заслонёнными. Кроме того, на каждом перекрёстке или развилке существо, кроме вас, с шансом 50 процентов считает, что идёт в направлении, противоположном выбранному.",
   "***Двери.*** Все двери в охраняемой области магически заперты, как «Волшебным замком». Кроме того, до десяти дверей можно скрыть иллюзией (как образом предмета «Малой иллюзии»), чтобы они выглядели обычными участками стены.",
   "***Лестницы.*** Все лестницы в охраняемой области сверху донизу заполняет паутина, как от заклинания «Паутина». Пока действует «Охрана и защита», сожжённые или разорванные нити отрастают за 10 минут.",
   "***Иной эффект заклинания.*** Вы можете поместить в охраняемой области крепости один из следующих магических эффектов на ваш выбор.",
   "- «Пляшущие огоньки» в четырёх коридорах. Можно задать простую программу, которую огоньки повторяют, пока действует «Охрана и защита».",
   "- «Волшебные уста» в двух местах.",
   "- «Зловонное облако» в двух местах. Пары появляются в указанных вами местах; если их развеет ветер, они возвращаются в течение 10 минут, пока действует «Охрана и защита».",
   "- Постоянный «Порыв ветра» в одном коридоре или комнате.",
   "- «Внушение» в одном месте. Вы выбираете область размером до 5 на 5 футов, и любое существо, входящее в неё или проходящее через неё, мысленно получает внушение.",
   "Вся охраняемая область излучает магию. Успешное «Рассеивание магии», наложенное на конкретный эффект, снимает только этот эффект.",
   "Постоянно охраняемое строение можно создать, накладывая на нём это заклинание каждый день в течение года."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "guidance",
  "name": "Указание",
  "nameEn": "Guidance",
  "level": 0,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Вы касаетесь одного согласного существа. Один раз до окончания заклинания цель может бросить d4 и добавить выпавшее число к одной проверке характеристики по своему выбору. Кость можно бросить до или после проверки. После этого заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "guiding-bolt",
  "name": "Направленный снаряд",
  "nameEn": "Guiding Bolt",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "К выбранному вами существу в пределах дистанции устремляется вспышка света. Совершите по цели дальнобойную атаку заклинанием. При попадании цель получает 4d6 урона излучением, а следующий бросок атаки по ней до конца вашего следующего хода совершается с преимуществом: до тех пор на цели мерцает мистический тусклый свет."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "gust-of-wind",
  "name": "Порыв ветра",
  "nameEn": "Gust of Wind",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (линия 60 фт)",
  "components": "В, С, М (семя бобового растения)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, от вас в выбранном направлении бьёт линия сильного ветра длиной 60 футов и шириной 10 футов. Каждое существо, начинающее ход в линии, должно преуспеть в спасброске Силы, иначе отталкивается на 15 футов от вас вдоль линии.",
   "Существо в линии, движущееся к вам, тратит 2 фута перемещения на каждый фут.",
   "Порыв разгоняет газы и пары и гасит в области свечи, факелы и подобное незащищённое пламя. Защищённое пламя, например в фонарях, бешено пляшет и гаснет с шансом 50 процентов.",
   "Бонусным действием в каждый свой ход до окончания заклинания вы можете изменить направление, в котором от вас бьёт линия."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hallow",
  "name": "Святилище",
  "nameEn": "Hallow",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "24 часа",
  "range": "Касание (сфера радиусом 60 фт)",
  "components": "В, С, М (травы, масла и благовония стоимостью не меньше 1 000 зм, которые заклинание расходует)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы касаетесь точки и наполняете область вокруг неё святой (или нечестивой) силой. Радиус области — до 60 футов. Заклинание не срабатывает, если в радиус попадает область, уже находящаяся под действием «Святилища». На затронутую область действуют следующие эффекты.",
   "Во-первых, небожители, элементали, феи, исчадия и нежить не могут войти в область и не могут очаровать, испугать существ внутри неё или вселиться в них. Существо, очарованное, испуганное или одержимое таким существом, войдя в область, освобождается от этого. Вы можете исключить из этого эффекта один или несколько из этих видов существ.",
   "Во-вторых, вы можете привязать к области дополнительный эффект — из списка ниже или предложенный Мастером. Некоторые эффекты действуют на существ в области; вы указываете, действует ли эффект на всех, на последователей определённого божества или вождя или на существ определённого рода, например орков или троллей. Когда существо, на которое должен действовать эффект, впервые за ход входит в область или начинает в ней ход, оно может совершить спасбросок Харизмы. При успехе существо игнорирует дополнительный эффект, пока не покинет область.",
   "***Отвага.*** Затронутых существ нельзя испугать, пока они в области.",
   "***Тьма.*** Область заполняет тьма. Обычный свет, а также магический свет заклинаний ниже круга ячейки, использованной для этого заклинания, не может её осветить.",
   "***Дневной свет.*** Область заполняет яркий свет. Магическая тьма заклинаний ниже круга ячейки, использованной для этого заклинания, не может его погасить.",
   "***Защита от энергии.*** Затронутые существа в области обладают сопротивлением одному виду урона на ваш выбор, кроме дробящего, колющего и рубящего.",
   "***Уязвимость к энергии.*** Затронутые существа в области уязвимы к одному виду урона на ваш выбор, кроме дробящего, колющего и рубящего.",
   "***Вечный покой.*** Тела, погребённые в области, нельзя превратить в нежить.",
   "***Пространственные помехи.*** Затронутые существа не могут перемещаться телепортацией или внепространственными и межпланарными способами.",
   "***Страх.*** Затронутые существа испуганы, пока находятся в области.",
   "***Тишина.*** Из области не исходит ни один звук, и ни один звук не проникает в неё.",
   "***Языки.*** Затронутые существа могут общаться с любым другим существом в области, даже если у них нет общего языка."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hallucinatory-terrain",
  "name": "Мираж",
  "nameEn": "Hallucinatory Terrain",
  "level": 4,
  "school": "Иллюзия",
  "castingTime": "10 минут",
  "range": "300 фт (куб 150 фт)",
  "components": "В, С, М (камень, веточка и кусочек зелёного растения)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Природная местность в кубе с ребром 150 футов в пределах дистанции выглядит, звучит и пахнет как местность другого рода. Открытое поле или дорогу можно сделать похожими на болото, холм, расщелину или иную труднопроходимую или непроходимую местность. Пруд может казаться травянистым лугом, обрыв — пологим склоном, усеянный камнями овраг — широкой гладкой дорогой. Постройки, снаряжение и существа в области свой вид не меняют.",
   "Осязаемые свойства местности не меняются, поэтому вошедшие в область существа, скорее всего, распознают иллюзию. Если разница не очевидна на ощупь, существо, внимательно изучающее иллюзию, может совершить проверку Интеллекта (Анализ) против КС ваших заклинаний, чтобы её раскрыть. Распознавшее иллюзию существо видит её как смутный образ поверх настоящей местности."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "harm",
  "name": "Вред",
  "nameEn": "Harm",
  "level": 6,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы насылаете на видимое вами существо в пределах дистанции жестокую болезнь. Цель совершает спасбросок Телосложения. При провале она получает 14d6 некротического урона, при успехе — половину этого урона. Урон не может опустить хиты цели ниже 1. Если цель провалила спасбросок, её максимум хитов на 1 час уменьшается на величину полученного некротического урона. Любой эффект, излечивающий болезни, возвращает максимум хитов к норме раньше этого срока."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "haste",
  "name": "Ускорение",
  "nameEn": "Haste",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (стружка корня солодки)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Выберите согласное видимое вами существо в пределах дистанции. До окончания заклинания скорость цели удваивается, она получает бонус +2 к КД, совершает с преимуществом спасброски Ловкости и в каждый свой ход получает дополнительное действие. Это действие можно использовать только для «Атаки» (только одна атака оружием), «Рывка», «Отхода», «Засады» или «Использования предмета».",
   "Когда заклинание заканчивается, на цель накатывает волна вялости: до конца своего следующего хода она не может перемещаться и совершать действия."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "heal",
  "name": "Полное исцеление",
  "nameEn": "Heal",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Выберите видимое вами существо в пределах дистанции. Волна положительной энергии проходит сквозь него, восстанавливая 70 хитов. Заклинание также оканчивает слепоту, глухоту и любые болезни цели. На конструктов и нежить заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, лечение увеличивается на 10 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "healing-word",
  "name": "Лечащее слово",
  "nameEn": "Healing Word",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "Выбранное вами видимое существо в пределах дистанции восстанавливает количество хитов, равное 1d4 + модификатор вашей заклинательной характеристики. На нежить и конструктов заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, лечение увеличивается на 1d4 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "heat-metal",
  "name": "Раскалённый металл",
  "nameEn": "Heat Metal",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (кусочек железа и пламя)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "druid"
  ],
  "desc": [
   "Выберите видимый вами рукотворный металлический предмет в пределах дистанции — например, металлическое оружие или средний или тяжёлый металлический доспех. Предмет раскаляется докрасна. Любое существо, физически соприкасающееся с ним, получает 2d8 урона огнём, когда вы накладываете заклинание. До окончания заклинания вы можете бонусным действием в каждый последующий свой ход снова причинять этот урон.",
   "Если существо держит или носит предмет и получает от него урон, оно должно преуспеть в спасброске Телосложения, иначе роняет предмет, если может. Если существо предмет не роняет, оно совершает с помехой броски атаки и проверки характеристик до начала вашего следующего хода."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hellish-rebuke",
  "name": "Адское возмездие",
  "nameEn": "Hellish Rebuke",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 реакция",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "warlock"
  ],
  "desc": [
   "Вы указываете пальцем, и существо, причинившее вам урон, на миг окутывает адское пламя. Существо совершает спасбросок Ловкости. При провале оно получает 2d10 урона огнём, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "heroes-feast",
  "name": "Пир героев",
  "nameEn": "Heroes' Feast",
  "level": 6,
  "school": "Вызов",
  "castingTime": "10 минут",
  "range": "30 фт",
  "components": "В, С, М (инкрустированная самоцветами чаша стоимостью не меньше 1 000 зм, которую заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Вы создаёте великий пир с превосходной едой и питьём. Пир длится 1 час и исчезает по его окончании, а благотворное действие наступает только после этого часа. Пировать могут до двенадцати других существ.",
   "Участник пира получает несколько преимуществ. Он излечивается от всех болезней и ядов, становится невосприимчив к яду и испугу и совершает все спасброски Мудрости с преимуществом. Его максимум хитов также увеличивается на 2d10, и он получает столько же хитов. Эти преимущества действуют 24 часа."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "heroism",
  "name": "Героизм",
  "nameEn": "Heroism",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "paladin"
  ],
  "desc": [
   "Согласное существо, которого вы касаетесь, наполняется храбростью. Пока действует заклинание, оно невосприимчиво к испугу и в начале каждого своего хода получает временные хиты, равные модификатору вашей заклинательной характеристики. Когда заклинание заканчивается, цель теряет оставшиеся временные хиты от него."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hideous-laughter",
  "name": "Жуткий смех",
  "nameEn": "Hideous Laughter",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (крошечные пирожные и пёрышко, которым машут в воздухе)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Выбранное вами видимое существо в пределах дистанции, на которое подействует заклинание, находит всё вокруг уморительно смешным и заходится в приступах хохота. Цель должна преуспеть в спасброске Мудрости, иначе падает ничком, становится недееспособной и не может встать, пока действует заклинание. На существ с Интеллектом 4 или ниже заклинание не действует.",
   "В конце каждого своего хода и каждый раз, когда цель получает урон, она может повторить спасбросок Мудрости. Если спасбросок вызван уроном, он совершается с преимуществом. При успехе заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hold-monster",
  "name": "Удержание чудовища",
  "nameEn": "Hold Monster",
  "level": 5,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "90 фт",
  "components": "В, С, М (маленький кусочек железа)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Выберите видимое вами существо в пределах дистанции. Цель должна преуспеть в спасброске Мудрости, иначе будет парализована, пока действует заклинание. На нежить заклинание не действует. В конце каждого своего хода цель может повторить спасбросок Мудрости; при успехе заклинание для неё заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, за каждый круг ячейки выше 5-го вы можете выбрать целью одно дополнительное существо. В момент выбора существа должны находиться не дальше 30 футов друг от друга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hold-person",
  "name": "Удержание личности",
  "nameEn": "Hold Person",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (небольшой прямой кусочек железа)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Выберите видимого вами гуманоида в пределах дистанции. Цель должна преуспеть в спасброске Мудрости, иначе будет парализована, пока действует заклинание. В конце каждого своего хода цель может повторить спасбросок Мудрости; при успехе заклинание для неё заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, за каждый круг ячейки выше 2-го вы можете выбрать целью одного дополнительного гуманоида. В момент выбора гуманоиды должны находиться не дальше 30 футов друг от друга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "holy-aura",
  "name": "Священная аура",
  "nameEn": "Holy Aura",
  "level": 8,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 30 фт)",
  "components": "В, С, М (A tiny reliquary worth at least 1,000gp containing a sacred relic, such as a scrap of cloth from a saint's robe or a piece of parchment from a religious text.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends. In addition, when a fiend or an undead hits an affected creature with a melee attack, the aura flashes with brilliant light. The attacker must succeed on a constitution saving throw or be blinded until the spell ends."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hunger-of-hadar",
  "name": "Голод Хадара",
  "nameEn": "Hunger of Hadar",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "150 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (маринованное щупальце осьминога)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock"
  ],
  "desc": [
   "Заклинатель открывает проход в ледяную пустоту между звёздами. В выбранной точке в пределах дистанции появляется сфера чёрной тьмы радиусом 20 футов; она держится, пока действует заклинание.",
   "В сфере нет никакого света, даже тёмное зрение её не пробивает, а звуки в ней глохнут. Для существ внутри сфера считается сильно заслонённой местностью и труднопроходимой местностью, а сами они ослеплены.",
   "Существо, начинающее ход внутри сферы, получает 2d6 урона холодом. Существо, заканчивающее ход внутри сферы, совершает спасбросок Ловкости и при провале получает 2d6 урона кислотой: незримые щупальца сжимают и разъедают его."
  ],
  "higher": [],
  "translated": true,
  "source": "custom",
  "sourceNote": "Книга игрока (механика, описание своими словами)"
 },
 {
  "id": "hunters-mark",
  "name": "Метка охотника",
  "nameEn": "Hunter's Mark",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 бонусное действие",
  "range": "90 фт",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "ranger"
  ],
  "desc": [
   "Вы выбираете видимое вами существо в пределах дистанции и мистически помечаете его как свою добычу. Пока действует заклинание, вы причиняете цели дополнительно 1d6 урона каждый раз, когда попадаете по ней атакой оружием, и совершаете с преимуществом проверки Мудрости (Внимательность) и Мудрости (Выживание), чтобы её найти. Если хиты цели опускаются до 0 до окончания заклинания, в один из последующих ходов вы можете бонусным действием пометить новое существо."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го или 4-го круга, вы можете поддерживать концентрацию на нём до 8 часов. При ячейке 5-го круга или выше — до 24 часов."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "hypnotic-pattern",
  "name": "Гипнотический узор",
  "nameEn": "Hypnotic Pattern",
  "level": 3,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "С, М (тлеющая палочка благовоний или хрустальный флакон с фосфоресцирующим веществом)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы создаёте извивающийся узор цветов, который сплетается в воздухе внутри куба с ребром 30 футов в пределах дистанции. Узор появляется на миг и исчезает. Каждое существо в области, видящее узор, совершает спасбросок Мудрости. При провале существо очаровано, пока действует заклинание. Очарованное этим заклинанием существо недееспособно, и его скорость равна 0.",
   "Заклинание для затронутого существа заканчивается, если оно получает любой урон или если кто-то другой действием выводит его из оцепенения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "ice-storm",
  "name": "Град",
  "nameEn": "Ice Storm",
  "level": 4,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "300 фт (цилиндр радиусом 20 фт)",
  "components": "В, С, М (щепотка пыли и несколько капель воды)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Град из твёрдого как камень льда обрушивается на землю в цилиндре радиусом 20 футов и высотой 40 футов с центром в точке в пределах дистанции. Каждое существо в цилиндре совершает спасбросок Ловкости. При провале существо получает 2d8 дробящего урона и 4d6 урона холодом, при успехе — половину этого урона.",
   "Градины превращают область бури в труднопроходимую местность до конца вашего следующего хода."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, дробящий урон увеличивается на 1d8 за каждый круг ячейки выше 4-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "identify",
  "name": "Опознание",
  "nameEn": "Identify",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "В, С, М (жемчужина стоимостью не меньше 100 зм и совиное перо)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы выбираете один предмет и касаетесь его всё время накладывания. Если это магический предмет или иной предмет, наполненный магией, вы узнаёте его свойства и как ими пользоваться, требует ли он настройки и сколько у него зарядов, если они есть. Вы узнаёте, действуют ли на предмет заклинания и какие именно. Если предмет создан заклинанием, вы узнаёте, каким.",
   "Если вместо предмета вы всё время накладывания касаетесь существа, вы узнаёте, какие заклинания действуют на него сейчас, если такие есть."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "illusory-script",
  "name": "Иллюзорный текст",
  "nameEn": "Illusory Script",
  "level": 1,
  "school": "Иллюзия",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "С, М (чернила на основе свинца стоимостью не меньше 10 зм, которые заклинание расходует)",
  "duration": "10 дней",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы пишете на пергаменте, бумаге или другом подходящем материале и наделяете написанное мощной иллюзией, которая держится, пока действует заклинание.",
   "Для вас и существ, которых вы укажете при накладывании, текст выглядит обычным, написанным вашей рукой, и передаёт тот смысл, который вы в него вложили. Для всех остальных текст выглядит записанным неизвестным или магическим письмом и непонятен. Вместо этого можно сделать так, чтобы текст выглядел совсем другим посланием, написанным иным почерком и на другом языке, но этот язык должен быть вам известен.",
   "Если заклинание рассеять, исчезают и исходный текст, и иллюзия.",
   "Существо с истинным зрением может прочесть скрытое послание."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "imprisonment",
  "name": "Заточение",
  "nameEn": "Imprisonment",
  "level": 9,
  "school": "Ограждение",
  "castingTime": "1 минута",
  "range": "30 фт",
  "components": "В, С, М (A vellum depiction or a carved statuette in the likeness of the target, and a special component that varies according to the version of the spell you choose, worth at least 500gp per Hit Die of the target.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "You create a magical restraint to hold a creature that you can see within range. The target must succeed on a wisdom saving throw or be bound by the spell; if it succeeds, it is immune to this spell if you cast it again. While affected by this spell, the creature doesn't need to breathe, eat, or drink, and it doesn't age. Divination spells can't locate or perceive the target.",
   "When you cast the spell, you choose one of the following forms of imprisonment.",
   "***Burial.*** The target is entombed far beneath the earth in a sphere of magical force that is just large enough to contain the target. Nothing can pass through the sphere, nor can any creature teleport or use planar travel to get into or out of it.",
   "The special component for this version of the spell is a small mithral orb.",
   "***Chaining.*** Heavy chains, firmly rooted in the ground, hold the target in place. The target is restrained until the spell ends, and it can't move or be moved by any means until then.",
   "The special component for this version of the spell is a fine chain of precious metal.",
   "***Hedged Prison.*** The spell transports the target into a tiny demiplane that is warded against teleportation and planar travel. The demiplane can be a labyrinth, a cage, a tower, or any similar confined structure or area of your choice.",
   "The special component for this version of the spell is a miniature representation of the prison made from jade.",
   "***Minimus Containment.*** The target shrinks to a height of 1 inch and is imprisoned inside a gemstone or similar object. Light can pass through the gemstone normally (allowing the target to see out and other creatures to see in), but nothing else can pass through, even by means of teleportation or planar travel. The gemstone can't be cut or broken while the spell remains in effect.",
   "The special component for this version of the spell is a large, transparent gemstone, such as a corundum, diamond, or ruby.",
   "***Slumber.*** The target falls asleep and can't be awoken.",
   "The special component for this version of the spell consists of rare soporific herbs.",
   "***Ending the Spell.*** During the casting of the spell, in any of its versions, you can specify a condition that will cause the spell to end and release the target. The condition can be as specific or as elaborate as you choose, but the GM must agree that the condition is reasonable and has a likelihood of coming to pass. The conditions can be based on a creature's name, identity, or deity but otherwise must be based on observable actions or qualities and not based on intangibles such as level, class, or hit points.",
   "A dispel magic spell can end the spell only if it is cast as a 9th-level spell, targeting either the prison or the special component used to create it.",
   "You can use a particular special component to create only one prison at a time. If you cast the spell again using the same component, the target of the first casting is immediately freed from its binding."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "incendiary-cloud",
  "name": "Воспламеняющееся облако",
  "nameEn": "Incendiary Cloud",
  "level": 8,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "150 фт (сфера радиусом 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range. The cloud spreads around corners and is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it.",
   "When the cloud appears, each creature in it must make a dexterity saving throw. A creature takes 10d8 fire damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there.",
   "The cloud moves 10 feet directly away from you in a direction that you choose at the start of each of your turns."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "inflict-wounds",
  "name": "Нанесение ран",
  "nameEn": "Inflict Wounds",
  "level": 1,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании цель получает 3d10 некротического урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "insect-plague",
  "name": "Нашествие насекомых",
  "nameEn": "Insect Plague",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "300 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (несколько крупинок сахара, несколько зёрен и капля жира)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "sorcerer"
  ],
  "desc": [
   "Рой кусающейся саранчи заполняет сферу радиусом 20 футов с центром в выбранной вами точке в пределах дистанции. Сфера огибает углы и держится, пока действует заклинание; её область слегка заслонена и является труднопроходимой местностью.",
   "Когда область появляется, каждое существо в ней совершает спасбросок Телосложения. При провале существо получает 4d10 колющего урона, при успехе — половину этого урона. Тот же спасбросок существо совершает, когда впервые за ход входит в область заклинания или заканчивает в ней ход."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "instant-summons",
  "name": "Мгновенный вызов",
  "nameEn": "Instant Summons",
  "level": 6,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "В, С, М (сапфир стоимостью 1 000 зм)",
  "duration": "Пока не рассеется",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы касаетесь предмета весом не больше 10 фунтов и длиной не больше 6 футов. Заклинание оставляет на его поверхности невидимую метку и невидимо вписывает название предмета в сапфир, служащий материальным компонентом. Для каждого накладывания нужен новый сапфир.",
   "В любой момент после этого вы можете действием произнести название предмета и раздавить сапфир. Предмет мгновенно появляется в вашей руке, каким бы ни было физическое или межпланарное расстояние, и заклинание заканчивается.",
   "Если предмет держит или несёт другое существо, раздавленный сапфир не переносит предмет к вам, но вы узнаёте, у кого он, и примерно где это существо находится в этот момент.",
   "Успешное «Рассеивание магии» или подобный эффект, применённый к сапфиру, оканчивает действие заклинания."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "invisibility",
  "name": "Невидимость",
  "nameEn": "Invisibility",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (ресница, запечатанная в гуммиарабик)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Существо, которого вы касаетесь, становится невидимым до окончания заклинания. Всё, что цель носит и несёт, невидимо, пока находится при ней. Заклинание для цели заканчивается, если она атакует или накладывает заклинание."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, за каждый круг ячейки выше 2-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "irresistible-dance",
  "name": "Неудержимая пляска",
  "nameEn": "Irresistible Dance",
  "level": 6,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Выберите одно видимое вами существо в пределах дистанции. Пока действует заклинание, цель исполняет на месте комичный танец: шаркает, притопывает и выделывает коленца. Существа, которых нельзя очаровать, невосприимчивы к этому заклинанию.",
   "Танцующее существо должно тратить всё перемещение на танец, не покидая своего пространства, и совершает с помехой спасброски Ловкости и броски атаки. Пока цель под действием заклинания, другие существа совершают броски атаки по ней с преимуществом. Действием танцующее существо может совершить спасбросок Мудрости, чтобы вернуть контроль над собой. При успехе заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "jump",
  "name": "Прыжок",
  "nameEn": "Jump",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (задняя лапка кузнечика)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь существа. Пока действует заклинание, дальность его прыжков утраивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "knock",
  "name": "Открывание",
  "nameEn": "Knock",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Выберите видимый вами предмет в пределах дистанции: дверь, ящик, сундук, кандалы, навесной замок или иной предмет, доступ к которому преграждает обычное или магическое средство.",
   "Цель, закрытая обычным замком, застрявшая или запертая на засов, отпирается, высвобождается или освобождается от засова. Если на предмете несколько замков, отпирается только один.",
   "Если вы выбрали цель, запертую «Волшебным замком», это заклинание подавляется на 10 минут, и всё это время цель можно открывать и закрывать обычным образом.",
   "Когда вы накладываете заклинание, от предмета раздаётся громкий стук, слышный на расстоянии до 300 футов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "legend-lore",
  "name": "Знание легенд",
  "nameEn": "Legend Lore",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "10 минут",
  "range": "На себя",
  "components": "В, С, М (благовония стоимостью не меньше 250 зм, которые заклинание расходует, и четыре пластинки слоновой кости стоимостью не меньше 50 зм каждая)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "Назовите или опишите человека, место или предмет. Заклинание приносит вам в разум краткую сводку значимых преданий о названном: это могут быть ходящие ныне истории, забытые сказания или даже тайные знания, никогда не бывшие широко известными. Если названное не имеет легендарного значения, вы ничего не узнаёте. Чем больше вы уже знаете о предмете, тем точнее и подробнее сведения.",
   "Полученные сведения верны, но могут быть облечены в образный язык. Например, о загадочном магическом топоре в ваших руках заклинание может поведать: «Горе злодею, чья рука коснётся топора, ибо даже топорище режет руку нечестивца. Лишь истинное Дитя Камня, любящее и любимое Морадином, пробудит истинную силу топора — и лишь со священным словом *Рудногг* на устах»."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "lesser-restoration",
  "name": "Малое восстановление",
  "nameEn": "Lesser Restoration",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "ranger"
  ],
  "desc": [
   "Вы касаетесь существа и можете окончить одну болезнь или одно состояние, от которого оно страдает: ослепление, глухоту, паралич или отравление."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "levitate",
  "name": "Левитация",
  "nameEn": "Levitate",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (маленькая кожаная петля или кусочек золотой проволоки, согнутый чашечкой с длинным черенком на одном конце)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Выбранное вами видимое существо или предмет в пределах дистанции поднимается вертикально на высоту до 20 футов и висит там, пока действует заклинание. Заклинание поднимает цель весом до 500 фунтов. Несогласное существо, преуспевшее в спасброске Телосложения, не затрагивается.",
   "Цель может перемещаться, только отталкиваясь или подтягиваясь за неподвижный предмет или поверхность в пределах досягаемости (стену, потолок), — как если бы карабкалась. В свой ход вы можете изменить высоту цели на 20 футов вверх или вниз. Если цель — вы, вы можете подниматься и опускаться как часть своего перемещения. Иначе вы можете перемещать цель действием; она должна оставаться в пределах дистанции.",
   "Когда заклинание заканчивается, цель, если она всё ещё в воздухе, плавно опускается на землю."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "light",
  "name": "Свет",
  "nameEn": "Light",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, М (светлячок или светящийся мох)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь одного предмета, ни одно измерение которого не превышает 10 футов. Пока заклинание действует, предмет испускает яркий свет в радиусе 20 футов и тусклый свет ещё на 20 футов. Цвет света — на ваш выбор. Если полностью накрыть предмет чем-то непрозрачным, свет будет заслонён. Заклинание заканчивается, если вы накладываете его снова или прекращаете его действием.",
   "Если вы выбираете целью предмет, который держит или носит враждебное существо, это существо может избежать заклинания успешным спасброском Ловкости."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "lightning-bolt",
  "name": "Молния",
  "nameEn": "Lightning Bolt",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (линия 100 фт)",
  "components": "В, С, М (клочок меха и палочка из янтаря, хрусталя или стекла)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "От вас в выбранном направлении бьёт молния, образуя линию длиной 100 футов и шириной 5 футов. Каждое существо в линии совершает спасбросок Ловкости. При провале существо получает 8d6 урона электричеством, при успехе — половину этого урона.",
   "Молния поджигает в области горючие предметы, которые никто не носит и не держит."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "locate-animals-or-plants",
  "name": "Поиск животных или растений",
  "nameEn": "Locate Animals or Plants",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (клочок шерсти бладхаунда)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "Опишите или назовите определённый вид зверя или растения. Сосредоточившись на голосе окружающей природы, вы узнаёте направление и расстояние до ближайшего существа или растения этого вида в пределах 5 миль, если такие есть."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "locate-creature",
  "name": "Поиск существа",
  "nameEn": "Locate Creature",
  "level": 4,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (клочок шерсти бладхаунда)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "ranger",
   "wizard"
  ],
  "desc": [
   "Опишите или назовите знакомое вам существо. Вы чувствуете направление на него, если оно находится в пределах 1 000 футов от вас. Если существо движется, вы знаете направление его движения.",
   "Заклинание находит конкретное известное вам существо или ближайшее существо определённого рода (например, человека или единорога), если вы хотя бы раз видели такое существо вблизи — в пределах 30 футов. Если описанное или названное существо в другом облике, например под действием «Превращения», заклинание его не находит.",
   "Заклинание не находит существо, если прямой путь между вами преграждает текучая вода шириной не меньше 10 футов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "locate-object",
  "name": "Поиск предмета",
  "nameEn": "Locate Object",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (раздвоенная веточка)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "paladin",
   "ranger",
   "wizard"
  ],
  "desc": [
   "Опишите или назовите знакомый вам предмет. Вы чувствуете направление на его местонахождение, если предмет находится в пределах 1 000 футов от вас. Если предмет движется, вы знаете направление его движения.",
   "Заклинание находит конкретный известный вам предмет, если вы хотя бы раз видели его вблизи — в пределах 30 футов. Вместо этого заклинание может найти ближайший предмет определённого рода: определённый вид одежды, украшения, мебели, инструмента или оружия.",
   "Заклинание не находит предмет, если прямой путь между вами и ним преграждает свинец любой толщины, даже тонкий лист."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "longstrider",
  "name": "Скороход",
  "nameEn": "Longstrider",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (щепотка земли)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь существа. Пока действует заклинание, его скорость увеличивается на 10 футов."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го вы можете выбрать целью одно дополнительное существо."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mage-armor",
  "name": "Доспехи мага",
  "nameEn": "Mage Armor",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (кусочек выделанной кожи)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь согласного существа без доспехов, и до окончания заклинания его окружает защитная магическая сила. Базовый КД цели становится равен 13 + её модификатор Ловкости. Заклинание заканчивается, если цель надевает доспех или если вы прекращаете заклинание действием."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mage-hand",
  "name": "Волшебная рука",
  "nameEn": "Mage Hand",
  "level": 0,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "В выбранной вами точке в пределах дистанции появляется призрачная парящая рука. Она существует, пока действует заклинание или пока вы не прогоните её действием. Рука исчезает, если оказывается дальше 30 футов от вас или если вы накладываете это заклинание снова.",
   "Действием вы можете управлять рукой: манипулировать предметом, открыть незапертую дверь или контейнер, убрать предмет в открытый контейнер или достать его оттуда, вылить содержимое флакона. При каждом использовании руку можно переместить на расстояние до 30 футов.",
   "Рука не может атаковать, активировать магические предметы или переносить больше 10 фунтов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magic-circle",
  "name": "Магический круг",
  "nameEn": "Magic Circle",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 минута",
  "range": "10 фт (цилиндр радиусом 10 фт)",
  "components": "В, С, М (святая вода или порошок из серебра и железа стоимостью не меньше 100 зм, которые заклинание расходует)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы создаёте цилиндр магической энергии радиусом 10 футов и высотой 20 футов с центром в видимой вами точке на земле в пределах дистанции. Там, где цилиндр пересекает пол или иную поверхность, появляются светящиеся руны.",
   "Выберите один или несколько видов существ: небожителей, элементалей, фей, исчадий или нежить. Круг действует на существо выбранного вида так:",
   "- Существо не может по своей воле войти в цилиндр немагическим способом. Если оно пытается сделать это телепортацией или межпланарным перемещением, оно сначала должно преуспеть в спасброске Харизмы.",
   "- Существо совершает с помехой броски атаки по целям внутри цилиндра.",
   "- Существо не может очаровать, испугать цели внутри цилиндра или вселиться в них.",
   "Накладывая заклинание, вы можете обратить его действие: тогда оно не даёт существу указанного вида покинуть цилиндр и защищает цели снаружи."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, длительность увеличивается на 1 час за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magic-jar",
  "name": "Волшебный сосуд",
  "nameEn": "Magic Jar",
  "level": 6,
  "school": "Некромантия",
  "castingTime": "1 минута",
  "range": "На себя",
  "components": "В, С, М (самоцвет, хрусталь, реликварий или иное декоративное вместилище стоимостью не меньше 500 зм)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Ваше тело впадает в оцепенение: душа покидает его и вселяется во вместилище, служащее материальным компонентом. Пока душа во вместилище, вы осознаёте окружающее, как если бы находились в его пространстве. Вы не можете перемещаться и совершать реакции. Единственное доступное действие — выбросить душу из вместилища на расстояние до 100 футов, чтобы вернуться в своё живое тело (окончив заклинание) или попытаться вселиться в тело гуманоида.",
   "Вы можете попытаться вселиться в любого видимого вами гуманоида в пределах 100 футов (в существ, защищённых «Защитой от добра и зла» или «Магическим кругом», вселиться нельзя). Цель совершает спасбросок Харизмы. При провале ваша душа переходит в тело цели, а душа цели оказывается заточена во вместилище. При успехе цель сопротивляется, и 24 часа вы не можете снова попытаться в неё вселиться.",
   "Вселившись в тело существа, вы управляете им. Ваши игровые параметры заменяются параметрами существа, но вы сохраняете мировоззрение, Интеллект, Мудрость и Харизму. Вы сохраняете преимущества собственных классовых умений. Если у цели есть уровни класса, вы не можете пользоваться её классовыми умениями.",
   "Тем временем душа одержимого существа может воспринимать окружающее из вместилища своими чувствами, но не может ни перемещаться, ни совершать действия.",
   "Находясь в теле, вы можете действием вернуться из него во вместилище, если оно в пределах 100 футов, возвращая душу хозяина в его тело. Если тело хозяина умирает, пока вы в нём, существо умирает, а вы совершаете спасбросок Харизмы против собственного КС заклинаний. При успехе вы возвращаетесь во вместилище, если оно в пределах 100 футов. Иначе вы умираете.",
   "Если вместилище уничтожено или заклинание заканчивается, ваша душа немедленно возвращается в ваше тело. Если тело дальше 100 футов или мертво, когда вы пытаетесь вернуться, вы умираете. Если во вместилище в момент уничтожения находится душа другого существа, она возвращается в своё тело, если оно живо и в пределах 100 футов. Иначе это существо умирает.",
   "Когда заклинание заканчивается, вместилище разрушается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magic-missile",
  "name": "Волшебная стрела",
  "nameEn": "Magic Missile",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте три светящихся дротика магической силы. Каждый дротик попадает в выбранное вами видимое существо в пределах дистанции и причиняет ему 1d4 + 1 урона силовым полем. Все дротики попадают одновременно; их можно направить в одно существо или в нескольких."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, за каждый круг ячейки выше 1-го заклинание создаёт на один дротик больше."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magic-mouth",
  "name": "Волшебные уста",
  "nameEn": "Magic Mouth",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 минута",
  "range": "30 фт",
  "components": "В, С, М (кусочек сотового мёда и нефритовая пыль стоимостью не меньше 10 зм, которые заклинание расходует)",
  "duration": "Пока не рассеется",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы вкладываете послание в предмет в пределах дистанции; оно прозвучит, когда выполнится условие срабатывания. Выберите видимый вами предмет, который никто не носит и не несёт. Затем произнесите послание — не больше 25 слов, но звучать оно может до 10 минут. Наконец, задайте обстоятельства, при которых заклинание передаст послание.",
   "Когда условие выполняется, на предмете появляется магический рот и произносит послание вашим голосом и тем же тоном, каким вы его наговаривали. Если у предмета есть рот или нечто похожее, например рот статуи, магический рот появляется именно там, создавая впечатление, что говорит сам предмет.",
   "Накладывая заклинание, вы решаете, закончится ли оно после передачи послания или будет повторять его каждый раз, когда выполнится условие.",
   "Условие может быть сколь угодно общим или подробным, но должно основываться на видимых или слышимых явлениях в пределах 30 футов от предмета. Например, рот может заговорить, когда любое существо подойдёт к предмету ближе 30 футов или когда в пределах 30 футов от него зазвонит серебряный колокольчик."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magic-weapon",
  "name": "Магическое оружие",
  "nameEn": "Magic Weapon",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 бонусное действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "paladin",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь немагического оружия. До окончания заклинания оно становится магическим оружием с бонусом +1 к броскам атаки и урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, бонус увеличивается до +2. При ячейке 6-го круга или выше — до +3."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "magnificent-mansion",
  "name": "Великолепный особняк",
  "nameEn": "Magnificent Mansion",
  "level": 7,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "300 фт (куб 5 фт)",
  "components": "В, С, М (A miniature portal carved from ivory, a small piece of polished marble, and a tiny silver spoon, each item worth at least 5 gp.)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "You conjure an extradimensional dwelling in range that lasts for the duration. You choose where its one entrance is located. The entrance shimmers faintly and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the portal remains open. You can open or close the portal if you are within 30 feet of it. While closed, the portal is invisible.",
   "Beyond the portal is a magnificent foyer with numerous chambers beyond. The atmosphere is clean, fresh, and warm.",
   "You can create any floor plan you like, but the space can't exceed 50 cubes, each cube being 10 feet on each side. The place is furnished and decorated as you choose. It contains sufficient food to serve a nine course banquet for up to 100 people. A staff of 100 near-transparent servants attends all who enter. You decide the visual appearance of these servants and their attire. They are completely obedient to your orders. Each servant can perform any task a normal human servant could perform, but they can't attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can go anywhere in the mansion but can't leave it. Furnishings and other objects created by this spell dissipate into smoke if removed from the mansion. When the spell ends, any creatures inside the extradimensional space are expelled into the open spaces nearest to the entrance."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "major-image",
  "name": "Образ",
  "nameEn": "Major Image",
  "level": 3,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (клочок овечьей шерсти)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы создаёте образ предмета, существа или иного видимого явления, умещающийся в кубе с ребром 20 футов. Образ появляется в видимом вами месте в пределах дистанции и существует, пока действует заклинание. Он выглядит совершенно настоящим, со звуками, запахами и температурой, подходящими изображённому. Нельзя создать жар или холод, причиняющие урон, звук, достаточно громкий для урона звуком или оглушения, или запах, способный вызвать тошноту (как вонь троглодита).",
   "Пока вы в пределах дистанции иллюзии, вы можете действием переместить образ в любое другое место в пределах дистанции. При этом можно менять его вид, чтобы движение выглядело естественно: например, созданное существо может идти. Точно так же иллюзия может издавать разные звуки в разное время и даже вести разговор.",
   "Физическое взаимодействие с образом выдаёт иллюзию, потому что предметы проходят сквозь него. Существо, потратившее действие на изучение образа, может понять, что это иллюзия, преуспев в проверке Интеллекта (Анализ) против КС ваших заклинаний. Распознавшее иллюзию существо видит сквозь образ, а прочие его сенсорные свойства для него слабеют."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, заклинание действует, пока его не рассеют, и не требует концентрации."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mass-cure-wounds",
  "name": "Множественное лечение ран",
  "nameEn": "Mass Cure Wounds",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "Из выбранной вами точки в пределах дистанции расходится волна целительной энергии. Выберите до шести существ в сфере радиусом 30 футов с центром в этой точке. Каждая цель восстанавливает количество хитов, равное 3d8 + модификатор вашей заклинательной характеристики. На нежить и конструктов заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, лечение увеличивается на 1d8 за каждый круг ячейки выше 5-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mass-heal",
  "name": "Множественное полное исцеление",
  "nameEn": "Mass Heal",
  "level": 9,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "A flood of healing energy flows from you into injured creatures around you. You restore up to 700 hit points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell are also cured of all diseases and any effect making them blinded or deafened. This spell has no effect on undead or constructs."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mass-healing-word",
  "name": "Множественное лечащее слово",
  "nameEn": "Mass Healing Word",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы выкрикиваете слова исцеления, и до шести выбранных вами видимых существ в пределах дистанции восстанавливают количество хитов, равное 1d4 + модификатор вашей заклинательной характеристики. На нежить и конструктов заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, лечение увеличивается на 1d4 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mass-suggestion",
  "name": "Множественное внушение",
  "nameEn": "Mass Suggestion",
  "level": 6,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, М (змеиный язык и кусочек сотового мёда или капля сладкого масла)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы предлагаете образ действий (не длиннее одного-двух предложений) и магически влияете на выбранных вами видимых существ в пределах дистанции, числом до двенадцати, которые слышат и понимают вас. Существа, которых нельзя очаровать, невосприимчивы к этому эффекту. Внушение должно быть сформулировано так, чтобы действие казалось разумным. Если предложить существу заколоть себя, броситься на копьё, сжечь себя или совершить иное очевидно вредное действие, эффект заклинания автоматически отменяется.",
   "Каждая цель совершает спасбросок Мудрости. При провале она следует описанному образу действий как может. Внушённое действие может продолжаться всё время действия заклинания. Если его можно выполнить быстрее, заклинание заканчивается, когда цель сделает то, о чём её просили.",
   "Можно также задать условие, при котором цели совершат особое действие во время действия заклинания. Например, внушить отряду солдат отдать все деньги первому встречному нищему. Если условие не выполнится до окончания заклинания, действие не совершается.",
   "Если вы или ваши спутники причиняете урон затронутому существу, заклинание для него заканчивается."
  ],
  "higher": [
   "С ячейкой 7-го круга длительность — 10 дней, с ячейкой 8-го — 30 дней, с ячейкой 9-го — год и один день."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "maze",
  "name": "Лабиринт",
  "nameEn": "Maze",
  "level": 8,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze.",
   "The target can use its action to attempt to escape. When it does so, it makes a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends (a minotaur or goristro demon automatically succeeds).",
   "When the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "meld-into-stone",
  "name": "Слияние с камнем",
  "nameEn": "Meld Into Stone",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "8 часов",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы входите в каменный предмет или поверхность, достаточно большие, чтобы целиком вместить ваше тело, и сливаетесь с камнем вместе со всем снаряжением на время действия заклинания. Вы входите в камень, используя перемещение, в точке, которой можете коснуться. Никаких следов вашего присутствия не видно и не обнаружить немагическими чувствами.",
   "Слившись с камнем, вы не видите, что происходит снаружи, а проверки Мудрости (Внимательность), чтобы услышать звуки снаружи, совершаете с помехой. Вы сохраняете ощущение времени и можете накладывать заклинания на себя. Используя перемещение, вы можете выйти из камня там, где вошли, что оканчивает заклинание. Иначе двигаться вы не можете.",
   "Незначительные повреждения камня вам не вредят, но частичное его разрушение или изменение формы (так, что вы больше не помещаетесь) выталкивает вас наружу и причиняет вам 6d6 дробящего урона. Полное разрушение камня (или превращение в иное вещество) выталкивает вас и причиняет 50 дробящего урона. Вытолкнутый, вы падаете ничком в ближайшем свободном пространстве к месту, где вошли."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mending",
  "name": "Починка",
  "nameEn": "Mending",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "В, С, М (два магнитных железняка)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Это заклинание устраняет одну поломку или прореху в предмете, которого вы касаетесь, — например, в сломанном ключе, порванном плаще или протекающем бурдюке. Если поломка или прореха не больше 1 фута в любом измерении, вы чините её, не оставляя следов прежнего повреждения.",
   "Заклинание может физически починить магический предмет или конструкт, но не способно вернуть такому предмету магию."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "message",
  "name": "Сообщение",
  "nameEn": "Message",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (короткий кусок медной проволоки)",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы указываете пальцем на существо в пределах дистанции и шёпотом произносите сообщение. Цель — и только она — слышит сообщение и может ответить шёпотом, который услышите только вы.",
   "Заклинание можно наложить сквозь твёрдые предметы, если вы знакомы с целью и знаете, что она находится за преградой. Заклинание блокируют магическая тишина, 1 фут камня, 1 дюйм обычного металла, тонкий лист свинца или 3 фута дерева. Заклинанию не нужно распространяться по прямой: оно свободно огибает углы и проходит через проёмы."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "meteor-swarm",
  "name": "Метеоритный дождь",
  "nameEn": "Meteor Swarm",
  "level": 9,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "1 миля (сфера радиусом 40 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a dexterity saving throw. The sphere spreads around corners. A creature takes 20d6 fire damage and 20d6 bludgeoning damage on a failed save, or half as much damage on a successful one. A creature in the area of more than one fiery burst is affected only once.",
   "The spell damages objects in the area and ignites flammable objects that aren't being worn or carried."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mind-blank",
  "name": "Непроницаемый разум",
  "nameEn": "Mind Blank",
  "level": 8,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Until the spell ends, one willing creature you touch is immune to psychic damage, any effect that would sense its emotions or read its thoughts, divination spells, and the charmed condition. The spell even foils wish spells and spells or effects of similar power used to affect the target's mind or to gain information about the target."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "minor-illusion",
  "name": "Малая иллюзия",
  "nameEn": "Minor Illusion",
  "level": 0,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "С, М (клочок овечьей шерсти)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы создаёте в пределах дистанции звук или образ предмета, который существует, пока действует заклинание. Иллюзия также заканчивается, если вы прекращаете её действием или накладываете это заклинание снова.",
   "Звук может быть любой громкости — от шёпота до крика. Это может быть ваш голос, чужой голос, рык льва, бой барабанов или любой другой звук по вашему выбору. Звук может звучать непрерывно всё время действия заклинания, а может раздаваться отдельными звуками в разное время до окончания заклинания.",
   "Образ предмета — например, стула, грязных следов или небольшого сундука — должен умещаться в кубе с ребром 5 футов. Образ не издаёт звуков, не светится, не пахнет и не создаёт иных сенсорных эффектов. Физическое взаимодействие с образом выдаёт иллюзию, потому что предметы проходят сквозь него.",
   "Существо, потратившее действие на изучение звука или образа, может понять, что это иллюзия, преуспев в проверке Интеллекта (Анализ) против КС ваших заклинаний. Если существо распознало иллюзию, для него она становится бледной и полупрозрачной."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mirage-arcane",
  "name": "Колдовской мираж",
  "nameEn": "Mirage Arcane",
  "level": 7,
  "school": "Иллюзия",
  "castingTime": "10 минут",
  "range": "В пределах видимости (куб 5280 фт)",
  "components": "В, С",
  "duration": "10 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "wizard"
  ],
  "desc": [
   "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. The terrain's general shape remains the same, however. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road.",
   "Similarly, you can alter the appearance of structures, or add them where none are present. The spell doesn't disguise, conceal, or add creatures.",
   "The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into difficult terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell's area disappears immediately.",
   "Creatures with truesight can see through the illusion to the terrain's true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion's presence, the creature can still physically interact with the illusion."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mirror-image",
  "name": "Зеркальные отражения",
  "nameEn": "Mirror Image",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "В вашем пространстве появляются три ваших иллюзорных двойника. До окончания заклинания двойники перемещаются вместе с вами и повторяют ваши действия, меняясь местами так, что невозможно уследить, какой образ настоящий. Действием вы можете прогнать двойников.",
   "Каждый раз, когда во время действия заклинания существо выбирает вас целью атаки, бросьте d20, чтобы определить, не попадёт ли атака в одного из двойников.",
   "При трёх двойниках атака переходит на двойника при результате 6 или выше, при двух — 8 или выше, при одном — 11 или выше.",
   "КД двойника равен 10 + ваш модификатор Ловкости. Если атака попадает по двойнику, он уничтожается. Двойника можно уничтожить только попавшей по нему атакой; остальной урон и эффекты он игнорирует. Заклинание заканчивается, когда уничтожены все три двойника.",
   "Заклинание не действует на существо, которое не может видеть, полагается на иные чувства, чем зрение (например, слепое зрение), или распознаёт иллюзии (например, истинным зрением)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "mislead",
  "name": "Фальшивый двойник",
  "nameEn": "Mislead",
  "level": 5,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы становитесь невидимым, и одновременно там, где вы стоите, появляется ваш иллюзорный двойник. Двойник существует, пока действует заклинание, но невидимость заканчивается, если вы атакуете или накладываете заклинание.",
   "Действием вы можете переместить двойника на расстояние до удвоенной вашей скорости и заставить его жестикулировать, говорить и вести себя как угодно.",
   "Вы можете видеть его глазами и слышать его ушами, как если бы находились на его месте. В каждый свой ход бонусным действием вы можете переключаться между его чувствами и своими. Пока вы пользуетесь его чувствами, в отношении собственного окружения вы слепы и глухи."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "misty-step",
  "name": "Туманный шаг",
  "nameEn": "Misty Step",
  "level": 2,
  "school": "Вызов",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "На миг окутанный серебристым туманом, вы телепортируетесь на расстояние до 30 футов в видимое вами свободное пространство."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "modify-memory",
  "name": "Изменение памяти",
  "nameEn": "Modify Memory",
  "level": 5,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы пытаетесь изменить воспоминания другого существа. Одно видимое вами существо совершает спасбросок Мудрости. Если вы сражаетесь с ним, оно совершает спасбросок с преимуществом. При провале цель очарована вами, пока действует заклинание. Очарованная цель недееспособна и не осознаёт окружающего, но слышит вас. Если она получает любой урон или становится целью другого заклинания, заклинание заканчивается, и воспоминания не меняются.",
   "Пока длится очарование, вы можете повлиять на воспоминание цели о событии, которое она пережила в последние 24 часа и которое длилось не больше 10 минут. Можно навсегда стереть всё воспоминание о событии, позволить цели вспомнить его с идеальной ясностью и во всех подробностях, изменить её память о деталях события или создать воспоминание о другом событии.",
   "Чтобы описать изменения, вы должны говорить с целью, а она — понимать ваш язык, иначе изменённые воспоминания не приживутся. Пробелы в вашем описании её разум заполняет сам. Если заклинание заканчивается раньше, чем вы закончили описание, память существа не меняется. Иначе изменённые воспоминания укореняются, когда заклинание заканчивается.",
   "Изменённое воспоминание не обязательно влияет на поведение существа, особенно если противоречит его природным склонностям, мировоззрению или убеждениям. Нелогичное изменённое воспоминание — например, о том, как существу нравилось обливаться кислотой, — отбрасывается, возможно, как дурной сон. Мастер может решить, что изменение слишком бессмысленно, чтобы заметно повлиять на существо.",
   "Заклинание «Снятие проклятья» или «Высшее восстановление», наложенное на цель, возвращает существу истинную память."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 6-го круга или выше, можно изменить воспоминания о событии давностью до 7 дней (6-й круг), 30 дней (7-й круг), 1 года (8-й круг) или любой давности в прошлом существа (9-й круг)."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "moonbeam",
  "name": "Лунный луч",
  "nameEn": "Moonbeam",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт (цилиндр радиусом 5 фт)",
  "components": "В, С, М (несколько семян любого луносемянника и кусочек опалесцирующего полевого шпата)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Серебристый луч бледного света падает вниз, образуя цилиндр радиусом 5 футов и высотой 40 футов с центром в точке в пределах дистанции. До окончания заклинания цилиндр заполнен тусклым светом.",
   "Когда существо впервые за ход входит в область заклинания или начинает в ней ход, его охватывает призрачное пламя, причиняющее жгучую боль, и оно совершает спасбросок Телосложения. При провале оно получает 2d10 урона излучением, при успехе — половину этого урона.",
   "Перевёртыш совершает этот спасбросок с помехой. При провале он также мгновенно принимает исходный облик и не может принять другой, пока не покинет свет заклинания.",
   "В каждый свой ход после накладывания заклинания вы можете действием переместить луч на 60 футов в любом направлении."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "move-earth",
  "name": "Перемещение почвы",
  "nameEn": "Move Earth",
  "level": 6,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "120 фт (конус 40 фт)",
  "components": "В, С, М (железное лезвие и мешочек со смесью почв — глины, суглинка и песка)",
  "duration": "Концентрация, вплоть до 2 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Выберите в пределах дистанции участок местности со стороной не больше 40 футов. Пока действует заклинание, вы можете как угодно изменять форму земли, песка или глины на этом участке: поднять или опустить его, вырыть или засыпать траншею, возвести или сровнять вал, создать столб. Размах изменений не может превышать половины наибольшего измерения участка. Так, на квадрате 40 на 40 футов можно создать столб высотой до 20 футов, поднять или опустить участок на 20 футов, вырыть траншею глубиной до 20 футов и так далее. Изменения завершаются за 10 минут.",
   "По окончании каждых 10 минут концентрации на заклинании можно выбрать новый участок местности.",
   "Поскольку преобразование происходит медленно, существа в области обычно не могут оказаться в ловушке или пострадать от движения земли.",
   "Заклинание не действует на природный камень и каменные постройки. Камни и строения смещаются, приспосабливаясь к новому рельефу. Если изменения делают постройку неустойчивой, она может обрушиться.",
   "Точно так же заклинание не влияет напрямую на рост растений: перемещаемая земля переносит растения вместе с собой."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "nondetection",
  "name": "Необнаружимость",
  "nameEn": "Nondetection",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (щепотка алмазной пыли стоимостью 25 зм, которой посыпают цель; заклинание её расходует)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "ranger",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, вы скрываете цель, которой касаетесь, от магии прорицания. Целью может быть согласное существо, место или предмет не больше 10 футов в любом измерении. Цель нельзя выбрать целью магии прорицания или увидеть через магические датчики наблюдения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "pass-without-trace",
  "name": "Бесследное передвижение",
  "nameEn": "Pass Without Trace",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (пепел сожжённого листа омелы и еловая веточка)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "От вас расходится покров теней и тишины, скрывающий вас и ваших спутников. Пока действует заклинание, каждое выбранное вами существо в пределах 30 футов от вас (включая вас) получает бонус +10 к проверкам Ловкости (Скрытность), и его нельзя выследить без магии. Существо с этим бонусом не оставляет следов и иных признаков своего прохода."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "passwall",
  "name": "Создание прохода",
  "nameEn": "Passwall",
  "level": 5,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (щепотка кунжутных семян)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "В выбранной вами видимой точке на деревянной, оштукатуренной или каменной поверхности (стене, потолке или полу) в пределах дистанции появляется проход и существует, пока действует заклинание. Вы выбираете размеры проёма: до 5 футов в ширину, 8 футов в высоту и 20 футов в глубину. Проход не нарушает устойчивости окружающей конструкции.",
   "Когда проём исчезает, все существа и предметы, ещё находящиеся в проходе, безопасно выталкиваются в ближайшее свободное пространство у поверхности, на которую вы наложили заклинание."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "phantasmal-killer",
  "name": "Призрачный убийца",
  "nameEn": "Phantasmal Killer",
  "level": 4,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы проникаете в кошмары видимого вами существа в пределах дистанции и создаёте иллюзорное воплощение его глубочайших страхов, видимое только ему. Цель совершает спасбросок Мудрости. При провале она испугана, пока действует заклинание. В начале каждого своего хода до окончания заклинания цель должна преуспеть в спасброске Мудрости, иначе получит 4d10 психического урона. При успехе заклинание заканчивается."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, урон увеличивается на 1d10 за каждый круг ячейки выше 4-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "phantom-steed",
  "name": "Призрачный скакун",
  "nameEn": "Phantom Steed",
  "level": 3,
  "school": "Иллюзия",
  "castingTime": "1 минута",
  "range": "30 фт",
  "components": "В, С",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "В выбранном вами свободном пространстве на земле в пределах дистанции появляется Большое полуреальное существо, похожее на лошадь. Вы решаете, как оно выглядит, но у него всегда есть седло, удила и уздечка. Любое созданное заклинанием снаряжение исчезает в облачке дыма, если его унести дальше 10 футов от скакуна.",
   "Пока действует заклинание, на скакуне можете ездить вы или выбранное вами существо. Скакун использует параметры ездовой лошади, но его скорость 100 футов, и он преодолевает 10 миль в час или 13 миль при быстром темпе. Когда заклинание заканчивается, скакун постепенно тает, давая всаднику 1 минуту, чтобы спешиться. Заклинание заканчивается, если вы прекращаете его действием или если скакун получает любой урон."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "planar-ally",
  "name": "Союзник с другого плана",
  "nameEn": "Planar Ally",
  "level": 6,
  "school": "Вызов",
  "castingTime": "10 минут",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы молите потустороннюю сущность о помощи. Она должна быть вам известна: бог, изначальный, принц демонов или иное существо космической мощи. Сущность посылает вам на помощь верного ей небожителя, элементаля или исчадие, и оно появляется в свободном пространстве в пределах дистанции. Если вы знаете имя конкретного существа, можно произнести его при накладывании, чтобы попросить именно его, но может явиться и другое (на усмотрение Мастера).",
   "Явившееся существо не обязано вести себя каким-то определённым образом. Вы можете попросить его о службе за плату, но оно не обязано соглашаться. Задача может быть простой («перенеси нас через пропасть», «помоги в битве») или сложной («шпионь за врагами», «защищай нас в подземелье»). Чтобы торговаться о службе, вы должны иметь возможность общаться с существом.",
   "Плата бывает разной. Небожитель может потребовать крупного пожертвования золотом или магическими предметами союзному храму, а исчадие — живой жертвы или дара сокровищами. Некоторые существа согласятся служить в обмен на задание, которое выполните вы.",
   "Ориентировочно задача, измеряемая минутами, стоит 100 зм за минуту; задача, измеряемая часами, — 1 000 зм за час; задача, измеряемая днями (до 10 дней), — 10 000 зм за день. Мастер может менять плату в зависимости от обстоятельств. Если задача соответствует убеждениям существа, плата может быть уменьшена вдвое или вовсе отменена. Безопасные задачи обычно стоят половину, а особо опасные могут потребовать большего дара. На явно самоубийственные задачи существа соглашаются редко.",
   "Выполнив задачу или по истечении оговорённого срока службы, существо, если это уместно и возможно, докладывает вам и возвращается на свой родной план. Если о цене договориться не удалось, существо сразу возвращается на родной план.",
   "Существо, присоединившееся к вашей группе, считается её участником и получает полную долю опыта."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "planar-binding",
  "name": "Планарные узы",
  "nameEn": "Planar Binding",
  "level": 5,
  "school": "Ограждение",
  "castingTime": "1 час",
  "range": "60 фт",
  "components": "В, С, М (драгоценный камень стоимостью не меньше 1 000 зм, который заклинание расходует)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "Этим заклинанием вы пытаетесь привязать к службе небожителя, элементаля, фею или исчадие. Существо должно находиться в пределах дистанции всё время накладывания (обычно его сначала призывают в центр обращённого «Магического круга», чтобы удержать, пока накладывается это заклинание). По завершении накладывания цель совершает спасбросок Харизмы. При провале она обязана служить вам, пока действует заклинание. Если существо было призвано или создано другим заклинанием, длительность того заклинания продлевается до длительности этого.",
   "Связанное существо должно изо всех сил выполнять ваши указания. Можно приказать ему сопровождать вас в приключении, охранять место или доставить послание. Существо исполняет указания буквально, но, если оно враждебно вам, старается извратить ваши слова в своих целях. Если существо полностью выполнило указания до окончания заклинания и вы на одном плане бытия, оно приходит к вам доложить. Если вы на другом плане, оно возвращается туда, где вы его связали, и остаётся там до окончания заклинания."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки более высокого круга, длительность увеличивается до 10 дней с ячейкой 6-го круга, 30 дней с ячейкой 7-го, 180 дней с ячейкой 8-го и до года и одного дня с ячейкой 9-го круга."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "plane-shift",
  "name": "Уход в иной мир",
  "nameEn": "Plane Shift",
  "level": 7,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (A forked, metal rod worth at least 250 gp, attuned to a particular plane of existence.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination. If you are trying to reach the City of Brass, for example, you might arrive in its Street of Steel, before its Gate of Ashes, or looking at the city from across the Sea of Fire, at the GM's discretion.",
   "Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle.",
   "You can use this spell to banish an unwilling creature to another plane. Choose a creature within your reach and make a melee spell attack against it. On a hit, the creature must make a charisma saving throw. If the creature fails this save, it is transported to a random location on the plane of existence you specify. A creature so transported must find its own way back to your current plane of existence."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "plant-growth",
  "name": "Рост растений",
  "nameEn": "Plant Growth",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "150 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "Заклинание направляет жизненную силу в растения в определённой области. Его можно использовать двумя способами — с немедленным или долгосрочным эффектом.",
   "Если вы накладываете заклинание за 1 действие, выберите точку в пределах дистанции. Все обычные растения в радиусе 100 футов от неё густо разрастаются. Существо, движущееся через область, тратит 4 фута перемещения на каждый фут.",
   "Вы можете исключить из действия заклинания одну или несколько областей любого размера внутри его области.",
   "Если вы накладываете заклинание в течение 8 часов, вы обогащаете землю. Все растения в радиусе полумили от точки в пределах дистанции становятся плодородными на 1 год: при сборе они дают вдвое больше урожая."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "poison-spray",
  "name": "Ядовитые брызги",
  "nameEn": "Poison Spray",
  "level": 0,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "10 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы протягиваете руку к видимому вами существу в пределах дистанции и выпускаете из ладони облачко ядовитого газа. Существо должно преуспеть в спасброске Телосложения, иначе получит 1d12 урона ядом.",
   "Урон заклинания увеличивается на 1d12, когда вы достигаете 5-го уровня (2d12), 11-го уровня (3d12) и 17-го уровня (4d12)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "polymorph",
  "name": "Превращение",
  "nameEn": "Polymorph",
  "level": 4,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (кокон гусеницы)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Заклинание превращает видимое вами существо в пределах дистанции в новый облик. Несогласное существо совершает спасбросок Мудрости, чтобы избежать эффекта. Перевёртыш автоматически преуспевает.",
   "Превращение длится, пока действует заклинание или пока хиты цели не опустятся до 0 или она не умрёт. Новым обликом может быть любой зверь с показателем опасности не выше, чем у цели (или не выше её уровня, если показателя опасности нет). Игровые параметры цели, включая ментальные характеристики, заменяются параметрами выбранного зверя. Мировоззрение и личность сохраняются.",
   "Цель получает хиты нового облика. Вернувшись в обычный облик, существо возвращается к количеству хитов, которое было до превращения. Если оно вернулось, потому что хиты опустились до 0, избыточный урон переносится на обычный облик. Если избыточный урон не опускает хиты обычного облика до 0, существо не теряет сознание.",
   "Действия существа ограничены природой нового облика: оно не может говорить, накладывать заклинания и совершать действия, требующие рук или речи.",
   "Снаряжение цели сливается с новым обликом. Существо не может активировать, использовать, держать в руках снаряжение или получать от него иные преимущества."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "power-word-kill",
  "name": "Слово силы: смерть",
  "nameEn": "Power Word Kill",
  "level": 9,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you choose has 100 hit points or fewer, it dies. Otherwise, the spell has no effect."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "power-word-stun",
  "name": "Слово силы: ошеломление",
  "nameEn": "Power Word Stun",
  "level": 8,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect.",
   "The stunned target must make a constitution saving throw at the end of each of its turns. On a successful save, this stunning effect ends."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "prayer-of-healing",
  "name": "Молитва лечения",
  "nameEn": "Prayer of Healing",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "10 минут",
  "range": "30 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "До шести выбранных вами видимых существ в пределах дистанции восстанавливают количество хитов, равное 2d8 + модификатор вашей заклинательной характеристики. На нежить и конструктов заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, лечение увеличивается на 1d8 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "prestidigitation",
  "name": "Фокусы",
  "nameEn": "Prestidigitation",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "10 фт",
  "components": "В, С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Это простенький магический фокус, на котором тренируются начинающие заклинатели. Вы создаёте в пределах дистанции один из следующих магических эффектов:",
   "Мгновенный безвредный сенсорный эффект: сноп искр, порыв ветра, тихие музыкальные ноты или странный запах.",
   "Вы мгновенно зажигаете или гасите свечу, факел или небольшой костёр.",
   "Вы мгновенно очищаете или пачкаете предмет объёмом не больше 1 кубического фута.",
   "Вы охлаждаете, нагреваете или придаёте вкус неживому веществу объёмом до 1 кубического фута на 1 час.",
   "На предмете или поверхности на 1 час появляется цвет, небольшая метка или символ.",
   "Вы создаёте немагическую безделушку или иллюзорный образ, умещающиеся в ладони; они существуют до конца вашего следующего хода.",
   "Если наложить заклинание несколько раз, одновременно могут действовать до трёх его немгновенных эффектов; любой из них можно прекратить действием."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "prismatic-spray",
  "name": "Радужные брызги",
  "nameEn": "Prismatic Spray",
  "level": 7,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (конус 60 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Eight multicolored rays of light flash from your hand. Each ray is a different color and has a different power and purpose. Each creature in a 60-foot cone must make a dexterity saving throw. For each target, roll a d8 to determine which color ray affects it.",
   "***1. Red.*** The target takes 10d6 fire damage on a failed save, or half as much damage on a successful one.",
   "***2. Orange.*** The target takes 10d6 acid damage on a failed save, or half as much damage on a successful one.",
   "***3. Yellow.*** The target takes 10d6 lightning damage on a failed save, or half as much damage on a successful one.",
   "***4. Green.*** The target takes 10d6 poison damage on a failed save, or half as much damage on a successful one.",
   "***5. Blue.*** The target takes 10d6 cold damage on a failed save, or half as much damage on a successful one.",
   "***6. Indigo.*** On a failed save, the target is restrained. It must then make a constitution saving throw at the end of each of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it permanently turns to stone and is subjected to the petrified condition. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind.",
   "***7. Violet.*** On a failed save, the target is blinded. It must then make a wisdom saving throw at the start of your next turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane of existence of the GM's choosing and is no longer blinded. (Typically, a creature that is on a plane that isn't its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.)",
   "***8. Special.*** The target is struck by two rays. Roll twice more, rerolling any 8."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "prismatic-wall",
  "name": "Радужная стена",
  "nameEn": "Prismatic Wall",
  "level": 9,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "60 фт (линия 90 фт)",
  "components": "В, С",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "A shimmering, multicolored plane of light forms a vertical opaque wall--up to 90 feet long, 30 feet high, and 1 inch thick--centered on a point you can see within range. Alternatively, you can shape the wall into a sphere up to 30 feet in diameter centered on a point you choose within range. The wall remains in place for the duration. If you position the wall so that it passes through a space occupied by a creature, the spell fails, and your action and the spell slot are wasted.",
   "The wall sheds bright light out to a range of 100 feet and dim light for an additional 100 feet. You and creatures you designate at the time you cast the spell can pass through and remain near the wall without harm. If another creature that can see the wall moves to within 20 feet of it or starts its turn there, the creature must succeed on a constitution saving throw or become blinded for 1 minute.",
   "The wall consists of seven layers, each with a different color. When a creature attempts to reach into or pass through the wall, it does so one layer at a time through all the wall's layers. As it passes or reaches through each layer, the creature must make a dexterity saving throw or be affected by that layer's properties as described below.",
   "The wall can be destroyed, also one layer at a time, in order from red to violet, by means specific to each layer. Once a layer is destroyed, it remains so for the duration of the spell. A rod of cancellation destroys a prismatic wall, but an antimagic field has no effect on it.",
   "***1. Red.*** The creature takes 10d6 fire damage on a failed save, or half as much damage on a successful one. While this layer is in place, nonmagical ranged attacks can't pass through the wall. The layer can be destroyed by dealing at least 25 cold damage to it.",
   "***2. Orange.*** The creature takes 10d6 acid damage on a failed save, or half as much damage on a successful one. While this layer is in place, magical ranged attacks can't pass through the wall. The layer is destroyed by a strong wind.",
   "***3. Yellow.*** The creature takes 10d6 lightning damage on a failed save, or half as much damage on a successful one. This layer can be destroyed by dealing at least 60 force damage to it.",
   "***4. Green.*** The creature takes 10d6 poison damage on a failed save, or half as much damage on a successful one. A passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer.",
   "***5. Blue.*** The creature takes 10d6 cold damage on a failed save, or half as much damage on a successful one. This layer can be destroyed by dealing at least 25 fire damage to it.",
   "***6. Indigo.*** On a failed save, the creature is restrained. It must then make a constitution saving throw at the end of each of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it permanently turns to stone and is subjected to the petrified condition. The successes and failures don't need to be consecutive; keep track of both until the creature collects three of a kind.",
   "While this layer is in place, spells can't be cast through the wall. The layer is destroyed by bright light shed by a daylight spell or a similar spell of equal or higher level.",
   "***7. Violet.*** On a failed save, the creature is blinded. It must then make a wisdom saving throw at the start of your next turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane of the GM's choosing and is no longer blinded. (Typically, a creature that is on a plane that isn't its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.) This layer is destroyed by a dispel magic spell or a similar spell of equal or higher level that can end spells and magical effects."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "private-sanctum",
  "name": "Личное убежище",
  "nameEn": "Private Sanctum",
  "level": 4,
  "school": "Ограждение",
  "castingTime": "10 минут",
  "range": "120 фт (куб 100 фт)",
  "components": "В, С, М (тонкий лист свинца, кусочек непрозрачного стекла, комок хлопка или ткани и порошок хризолита)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы магически защищаете область в пределах дистанции — куб с ребром от 5 до 100 футов. Заклинание действует всю свою длительность или пока вы не прекратите его действием.",
   "Накладывая заклинание, вы решаете, какую защиту оно даёт, выбирая любые или все свойства:",
   "- Звук не проходит сквозь барьер на границе защищённой области.",
   "- Барьер выглядит тёмным и туманным и не даёт видеть сквозь него (в том числе тёмным зрением).",
   "- Датчики заклинаний прорицания не могут появиться внутри защищённой области или пройти сквозь барьер по её периметру.",
   "- Существ в области нельзя выбрать целью заклинаний прорицания.",
   "- Ничто не может телепортироваться в защищённую область или из неё.",
   "- Межпланарные перемещения внутри защищённой области заблокированы.",
   "Если накладывать заклинание на одно и то же место каждый день в течение года, эффект становится постоянным."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, за каждый круг ячейки выше 4-го ребро куба можно увеличить на 100 футов. Так, ячейкой 5-го круга можно защитить куб с ребром до 200 футов."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "produce-flame",
  "name": "Сотворение пламени",
  "nameEn": "Produce Flame",
  "level": 0,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "В вашей руке появляется мерцающее пламя. Оно остаётся там, пока действует заклинание, и не вредит ни вам, ни вашему снаряжению. Пламя испускает яркий свет в радиусе 10 футов и тусклый свет ещё на 10 футов. Заклинание заканчивается, если вы прекращаете его действием или накладываете снова.",
   "Пламенем можно и атаковать, но тогда заклинание заканчивается. Накладывая заклинание или действием в один из последующих ходов, вы можете метнуть пламя в существо в пределах 30 футов. Совершите дальнобойную атаку заклинанием. При попадании цель получает 1d8 урона огнём.",
   "Урон заклинания увеличивается на 1d8, когда вы достигаете 5-го уровня (2d8), 11-го уровня (3d8) и 17-го уровня (4d8)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "programmed-illusion",
  "name": "Программируемая иллюзия",
  "nameEn": "Programmed Illusion",
  "level": 6,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт (куб 30 фт)",
  "components": "В, С, М (клочок овечьей шерсти и нефритовая пыль стоимостью не меньше 25 зм)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вы создаёте в пределах дистанции иллюзию предмета, существа или иного видимого явления, которая срабатывает при определённом условии. До тех пор иллюзию невозможно заметить. Она должна умещаться в кубе с ребром 30 футов; при накладывании вы решаете, как она будет себя вести и какие звуки издавать. Это представление может длиться до 5 минут.",
   "Когда заданное условие выполняется, иллюзия появляется и разыгрывает описанное представление. Закончив, она исчезает и бездействует 10 минут, после чего может сработать снова.",
   "Условие может быть сколь угодно общим или подробным, но должно основываться на видимых или слышимых явлениях в пределах 30 футов от области. Например, можно создать иллюзию самого себя, которая появится и предупредит тех, кто пытается открыть дверь с ловушкой, или настроить иллюзию срабатывать, только когда существо произнесёт нужное слово или фразу.",
   "Физическое взаимодействие с образом выдаёт иллюзию, потому что предметы проходят сквозь него. Существо, потратившее действие на изучение образа, может понять, что это иллюзия, преуспев в проверке Интеллекта (Анализ) против КС ваших заклинаний. Распознавшее иллюзию существо видит сквозь образ, а все звуки иллюзии кажутся ему пустыми."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "project-image",
  "name": "Проекция",
  "nameEn": "Project Image",
  "level": 7,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "500 миль",
  "components": "В, С, М (A small replica of you made from materials worth at least 5 gp.)",
  "duration": "Концентрация, вплоть до 24 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you but is intangible. If the illusion takes any damage, it disappears, and the spell ends.",
   "You can use your action to move this illusion up to twice your speed, and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly.",
   "You can see through its eyes and hear through its ears as if you were in its space. On your turn as a bonus action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are blinded and deafened in regard to your own surroundings.",
   "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "protection-from-energy",
  "name": "Защита от энергии",
  "nameEn": "Protection From Energy",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, согласное существо, которого вы касаетесь, обладает сопротивлением одному виду урона на ваш выбор: кислоте, холоду, огню, электричеству или звуку."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "protection-from-evil-and-good",
  "name": "Защита от добра и зла",
  "nameEn": "Protection from Evil and Good",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (святая вода или порошок из серебра и железа, которые заклинание расходует)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin",
   "warlock",
   "wizard"
  ],
  "desc": [
   "До окончания заклинания одно согласное существо, которого вы касаетесь, защищено от определённых видов существ: аберраций, небожителей, элементалей, фей, исчадий и нежити.",
   "Защита даёт несколько преимуществ. Существа этих видов совершают броски атаки по цели с помехой. Кроме того, они не могут очаровать, испугать или вселиться в цель. Если цель уже очарована, испугана или одержима таким существом, она совершает с преимуществом каждый новый спасбросок против этого эффекта."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "protection-from-poison",
  "name": "Защита от яда",
  "nameEn": "Protection from Poison",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "paladin",
   "ranger"
  ],
  "desc": [
   "Вы касаетесь существа. Если оно отравлено, вы нейтрализуете яд. Если цель поражена несколькими ядами, вы нейтрализуете один известный вам яд или один случайный.",
   "Пока действует заклинание, цель совершает с преимуществом спасброски от отравления и обладает сопротивлением урону ядом."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "purify-food-and-drink",
  "name": "Очищение пищи и питья",
  "nameEn": "Purify Food and Drink",
  "level": 1,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "10 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "paladin"
  ],
  "desc": [
   "Вся немагическая еда и питьё в сфере радиусом 5 футов с центром в выбранной вами точке в пределах дистанции очищаются от ядов и болезней."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "raise-dead",
  "name": "Оживление",
  "nameEn": "Raise Dead",
  "level": 5,
  "school": "Некромантия",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (алмаз стоимостью не меньше 500 зм, который заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы возвращаете к жизни мёртвое существо, которого касаетесь, если оно мертво не дольше 10 дней. Если душа существа согласна и свободна вернуться в тело, оно оживает с 1 хитом.",
   "Заклинание также нейтрализует любые яды и излечивает немагические болезни, поражавшие существо в момент смерти. Магические болезни, проклятия и подобные эффекты оно не снимает; если их не снять до накладывания, они начинают действовать, когда существо оживает. Нежить этим заклинанием вернуть к жизни нельзя.",
   "Заклинание закрывает все смертельные раны, но не восстанавливает утраченные части тела. Если у существа нет частей тела или органов, необходимых для жизни (например, головы), заклинание автоматически не срабатывает.",
   "Возвращение из мёртвых — тяжёлое испытание. Цель получает штраф −4 ко всем броскам атаки, спасброскам и проверкам характеристик. После каждого длительного отдыха штраф уменьшается на 1, пока не исчезнет."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "ray-of-enfeeblement",
  "name": "Луч слабости",
  "nameEn": "Ray of Enfeeblement",
  "level": 2,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "Из вашего пальца к существу в пределах дистанции бьёт чёрный луч изнуряющей энергии. Совершите по цели дальнобойную атаку заклинанием. При попадании до окончания заклинания цель причиняет атаками оружием, использующими Силу, только половину урона.",
   "В конце каждого своего хода цель может совершить спасбросок Телосложения против заклинания; при успехе заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "ray-of-frost",
  "name": "Луч холода",
  "nameEn": "Ray of Frost",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "К существу в пределах дистанции устремляется ледяной луч бело-голубого света. Совершите по цели дальнобойную атаку заклинанием. При попадании цель получает 1d8 урона холодом, а её скорость уменьшается на 10 футов до начала вашего следующего хода.",
   "Урон заклинания увеличивается на 1d8, когда вы достигаете 5-го уровня (2d8), 11-го уровня (3d8) и 17-го уровня (4d8)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "regenerate",
  "name": "Регенерация",
  "nameEn": "Regenerate",
  "level": 7,
  "school": "Преобразование",
  "castingTime": "1 минута",
  "range": "Касание",
  "components": "В, С, М (A prayer wheel and holy water.)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "You touch a creature and stimulate its natural healing ability. The target regains 4d8 + 15 hit points. For the duration of the spell, the target regains 1 hit point at the start of each of its turns (10 hit points each minute).",
   "The target's severed body members (fingers, legs, tails, and so on), if any, are restored after 2 minutes. If you have the severed part and hold it to the stump, the spell instantaneously causes the limb to knit to the stump."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "reincarnate",
  "name": "Реинкарнация",
  "nameEn": "Reincarnate",
  "level": 5,
  "school": "Преобразование",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (редкие масла и притирания стоимостью не меньше 1 000 зм, которые заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Вы касаетесь мёртвого гуманоида или его части. Если существо мертво не дольше 10 дней, заклинание создаёт для него новое взрослое тело и призывает в него душу. Если душа цели не свободна или не желает этого, заклинание не срабатывает.",
   "Магия создаёт новое тело, из-за чего раса существа, скорее всего, изменится. Мастер бросает d100 и сверяется с таблицей, чтобы определить облик воскрешённого существа, или выбирает облик сам.",
   "| d100 | Раса |\n|---|---|\n| 01–04 | Драконорождённый |\n| 05–13 | Дварф, холмовой |\n| 14–21 | Дварф, горный |\n| 22–25 | Эльф, тёмный |\n| 26–34 | Эльф, высший |\n| 35–42 | Эльф, лесной |\n| 43–46 | Гном, лесной |\n| 47–52 | Гном, скальный |\n| 53–56 | Полуэльф |\n| 57–60 | Полуорк |\n| 61–68 | Полурослик, легконогий |\n| 69–76 | Полурослик, коренастый |\n| 77–96 | Человек |\n| 97–00 | Тифлинг |",
   "Перевоплощённое существо помнит прежнюю жизнь и опыт. Оно сохраняет прежние способности, но меняет расу на новую и соответственно меняет расовые особенности."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "remove-curse",
  "name": "Снятие проклятья",
  "nameEn": "Remove Curse",
  "level": 3,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin",
   "warlock",
   "wizard"
  ],
  "desc": [
   "От вашего прикосновения заканчиваются все проклятия, действующие на одно существо или предмет. Если предмет — проклятый магический предмет, его проклятие остаётся, но заклинание разрывает настройку владельца на предмет, чтобы его можно было снять или выбросить."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "resilient-sphere",
  "name": "Упругая сфера",
  "nameEn": "Resilient Sphere",
  "level": 4,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (полусферический кусочек прозрачного хрусталя и такая же полусфера из гуммиарабика)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Сфера мерцающей силы заключает в себя существо или предмет размером Большой или меньше в пределах дистанции. Несогласное существо совершает спасбросок Ловкости. При провале существо заключено в сферу, пока действует заклинание.",
   "Ничто — ни предметы, ни энергия, ни эффекты других заклинаний — не проходит сквозь барьер ни внутрь, ни наружу, но существо внутри может дышать. Сфера невосприимчива ко всему урону; атаки и эффекты снаружи не могут повредить существу или предмету внутри, а существо внутри не может повредить ничему снаружи.",
   "Сфера невесома и ровно такого размера, чтобы вместить содержимое. Заключённое существо может действием толкать стенки и катить сферу со скоростью до половины своей. Точно так же сферу могут поднять и переместить другие существа.",
   "Заклинание «Распад», направленное на сферу, разрушает её, не причиняя вреда содержимому."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "resistance",
  "name": "Сопротивление",
  "nameEn": "Resistance",
  "level": 0,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (миниатюрный плащ)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "Вы касаетесь одного согласного существа. Один раз до окончания заклинания цель может бросить d4 и добавить выпавшее число к одному спасброску по своему выбору. Кость можно бросить до или после спасброска. После этого заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "resurrection",
  "name": "Воскрешение",
  "nameEn": "Resurrection",
  "level": 7,
  "school": "Некромантия",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (A diamond worth at least 1,000gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric"
  ],
  "desc": [
   "You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't undead. If its soul is free and willing, the target returns to life with all its hit points.",
   "This spell neutralizes any poisons and cures normal diseases afflicting the creature when it died. It doesn't, however, remove magical diseases, curses, and the like; if such effects aren't removed prior to casting the spell, they afflict the target on its return to life.",
   "This spell closes all mortal wounds and restores any missing body parts.",
   "Coming back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears.",
   "Casting this spell to restore life to a creature that has been dead for one year or longer taxes you greatly. Until you finish a long rest, you can't cast spells again, and you have disadvantage on all attack rolls, ability checks, and saving throws."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "reverse-gravity",
  "name": "Обратная гравитация",
  "nameEn": "Reverse Gravity",
  "level": 7,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "100 фт (цилиндр радиусом 50 фт)",
  "components": "В, С, М (A lodestone and iron filings.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "This spell reverses gravity in a 50-foot-radius, 100-foot high cylinder centered on a point within range. All creatures and objects that aren't somehow anchored to the ground in the area fall upward and reach the top of the area when you cast this spell. A creature can make a dexterity saving throw to grab onto a fixed object it can reach, thus avoiding the fall.",
   "If some solid object (such as a ceiling) is encountered in this fall, falling objects and creatures strike it just as they would during a normal downward fall. If an object or creature reaches the top of the area without striking anything, it remains there, oscillating slightly, for the duration.",
   "At the end of the duration, affected objects and creatures fall back down."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "revivify",
  "name": "Возрождение",
  "nameEn": "Revivify",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (алмазы стоимостью 300 зм, которые заклинание расходует)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы касаетесь существа, умершего в течение последней минуты. Оно возвращается к жизни с 1 хитом. Заклинание не возвращает к жизни умерших от старости и не восстанавливает утраченные части тела."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "rope-trick",
  "name": "Верёвочный трюк",
  "nameEn": "Rope Trick",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (порошок из кукурузного экстракта и скрученная петля пергамента)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы касаетесь верёвки длиной до 60 футов. Один её конец поднимается в воздух, пока вся верёвка не повиснет перпендикулярно земле. На верхнем конце верёвки открывается незримый вход во внепространственное убежище, которое существует до окончания заклинания.",
   "В убежище можно попасть, взобравшись на верх верёвки. Оно вмещает до восьми существ Среднего размера или меньше. Верёвку можно втянуть внутрь, и снаружи она исчезнет из виду.",
   "Атаки и заклинания не проходят через вход ни внутрь, ни наружу, но находящиеся внутри видят происходящее снаружи, как через окно 3 на 5 футов с центром на верёвке.",
   "Когда заклинание заканчивается, всё, что было в убежище, выпадает наружу."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sacred-flame",
  "name": "Священное пламя",
  "nameEn": "Sacred Flame",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "На видимое вами существо в пределах дистанции нисходит сияние, похожее на пламя. Цель должна преуспеть в спасброске Ловкости, иначе получит 1d8 урона излучением. Укрытие не даёт цели преимуществ при этом спасброске.",
   "Урон заклинания увеличивается на 1d8, когда вы достигаете 5-го уровня (2d8), 11-го уровня (3d8) и 17-го уровня (4d8)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sanctuary",
  "name": "Убежище",
  "nameEn": "Sanctuary",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 бонусное действие",
  "range": "30 фт",
  "components": "В, С, М (маленькое серебряное зеркальце)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы защищаете существо в пределах дистанции от нападений. Пока действует заклинание, любое существо, выбирающее защищённое существо целью атаки или вредоносного заклинания, сначала должно совершить спасбросок Мудрости. При провале оно должно выбрать новую цель или потерять атаку либо заклинание. Заклинание не защищает от эффектов, действующих на область, например от взрыва огненного шара.",
   "Если защищённое существо атакует или накладывает заклинание, затрагивающее враждебное существо, заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "scorching-ray",
  "name": "Палящий луч",
  "nameEn": "Scorching Ray",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте три огненных луча и бросаете их в цели в пределах дистанции — в одну или в несколько.",
   "Совершите дальнобойную атаку заклинанием для каждого луча. При попадании цель получает 2d6 урона огнём."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, за каждый круг ячейки выше 2-го создаётся один дополнительный луч."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "scrying",
  "name": "Наблюдение",
  "nameEn": "Scrying",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "10 минут",
  "range": "На себя",
  "components": "В, С, М (фокусировка стоимостью не меньше 1 000 зм — хрустальный шар, серебряное зеркало или чаша со святой водой)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы можете видеть и слышать выбранное вами существо на одном с вами плане бытия. Цель совершает спасбросок Мудрости, модификатор которого зависит от того, насколько хорошо вы её знаете и какая у вас с ней физическая связь. Если цель знает, что вы накладываете заклинание, она может добровольно провалить спасбросок, если хочет, чтобы за ней наблюдали.",
   "| Знакомство | Модификатор спасброска |\n|---|---|\n| Понаслышке (вы слышали о цели) | +5 |\n| Лично (вы встречали цель) | +0 |\n| Близко (вы хорошо знаете цель) | −5 |",
   "| Связь | Модификатор спасброска |\n|---|---|\n| Портрет или изображение | −2 |\n| Вещь или одежда | −4 |\n| Часть тела, прядь волос, обрезок ногтя и т. п. | −10 |",
   "При успешном спасброске цель не затронута, и 24 часа вы не можете снова применить к ней это заклинание.",
   "При провале заклинание создаёт невидимый датчик в пределах 10 футов от цели. Через датчик вы видите и слышите, как если бы были там. Датчик перемещается вместе с целью, оставаясь в пределах 10 футов от неё всё время действия заклинания. Существо, способное видеть невидимые предметы, видит датчик как светящийся шар размером с ваш кулак.",
   "Вместо существа целью заклинания можно выбрать место, которое вы уже видели. Тогда датчик появляется в этом месте и не перемещается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "secret-chest",
  "name": "Потайной сундук",
  "nameEn": "Secret Chest",
  "level": 4,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (изысканный сундук размером 3 на 2 на 2 фута из редких материалов стоимостью не меньше 5 000 зм и его Крошечная копия из тех же материалов стоимостью не меньше 50 зм)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы прячете сундук со всем содержимым на Эфирном плане. Для этого нужно коснуться сундука и его миниатюрной копии, служащей материальным компонентом. Сундук вмещает до 12 кубических футов неживого вещества (3 на 2 на 2 фута).",
   "Пока сундук на Эфирном плане, вы можете действием, коснувшись копии, вызвать его. Он появляется в свободном пространстве на земле в пределах 5 футов от вас. Отправить сундук обратно можно действием, коснувшись и сундука, и копии.",
   "Через 60 дней появляется накопительный шанс 5 процентов в день, что эффект заклинания закончится. Эффект заканчивается, если вы снова накладываете это заклинание, если копия уничтожена или если вы оканчиваете заклинание действием. Если заклинание заканчивается, когда большой сундук на Эфирном плане, он безвозвратно потерян."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "see-invisibility",
  "name": "Видение невидимого",
  "nameEn": "See Invisibility",
  "level": 2,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (щепотка талька и немного серебряного порошка)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Пока действует заклинание, вы видите невидимых существ и предметы так, будто они видимы, и видите Эфирный план. Эфирные существа и предметы выглядят призрачными и полупрозрачными."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "seeming",
  "name": "Притворство",
  "nameEn": "Seeming",
  "level": 5,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Заклинание позволяет изменить внешность любого количества видимых вами существ в пределах дистанции. Каждой выбранной цели вы придаёте новый иллюзорный облик. Несогласная цель может совершить спасбросок Харизмы и при успехе не затрагивается.",
   "Заклинание маскирует внешность, а также одежду, доспехи, оружие и снаряжение. Каждое существо можно сделать на 1 фут ниже или выше, худым, толстым или средней комплекции. Строение тела изменить нельзя: облик должен сохранять то же расположение конечностей. В остальном вид иллюзии — на ваше усмотрение. Заклинание действует всю длительность, если вы раньше не прекратите его действием.",
   "Изменения не выдерживают физической проверки. Например, если вы добавили к наряду существа шляпу, предметы проходят сквозь неё, а коснувшийся её ничего не почувствует или нащупает голову и волосы существа. Если вы кажетесь худее, чем есть, рука того, кто тянется к вам, наткнётся на вас, ещё не коснувшись видимого силуэта.",
   "Существо может действием осмотреть цель и совершить проверку Интеллекта (Анализ) против КС ваших заклинаний. При успехе оно понимает, что цель замаскирована."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sending",
  "name": "Послание",
  "nameEn": "Sending",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "Без ограничений",
  "components": "В, С, М (короткий кусок тонкой медной проволоки)",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "Вы отправляете короткое послание из двадцати пяти слов или меньше знакомому вам существу. Существо слышит послание в своём разуме, узнаёт в вас отправителя, если знает вас, и может сразу ответить тем же способом. Заклинание позволяет понять смысл вашего послания существам с Интеллектом не ниже 1.",
   "Послание можно отправить на любое расстояние и даже на другие планы бытия, но если цель на другом плане, с шансом 5 процентов послание не доходит."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sequester",
  "name": "Изоляция",
  "nameEn": "Sequester",
  "level": 7,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (A powder composed of diamond, emerald, ruby, and sapphire dust worth at least 5,000 gp, which the spell consumes.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration. When you cast the spell and touch the target, it becomes invisible and can't be targeted by divination spells or perceived through scrying sensors created by divination spells.",
   "If the target is a creature, it falls into a state of suspended animation. Time ceases to flow for it, and it doesn't grow older.",
   "You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include \"after 1,000 years\" or \"when the tarrasque awakens.\" This spell also ends if the target takes any damage."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shadow-blade",
  "name": "Теневой клинок",
  "nameEn": "Shadow Blade",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 бонусное действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "В свободной руке заклинателя сгущается клинок из уплотнённой тени. Он действует до окончания заклинания и считается простым рукопашным оружием, которым заклинатель владеет. Клинок причиняет 2d8 психического урона при попадании и обладает свойствами «фехтовальное», «лёгкое» и «метательное» (дистанция 20/60 фт).",
   "Если клинок выпустить из руки или бросить, он рассеивается в конце хода. Пока заклинание действует, заклинатель может бонусным действием призвать клинок обратно в руку.",
   "Если цель атаки находится в тусклом свете или темноте, бросок атаки клинком совершается с преимуществом."
  ],
  "higher": [
   "Урон клинка растёт: 3d8 при ячейке 3-го или 4-го круга, 4d8 при ячейке 5-го или 6-го круга, 5d8 при ячейке 7-го круга и выше."
  ],
  "translated": true,
  "source": "custom",
  "sourceNote": "Руководство Занатара (механика, описание своими словами)"
 },
 {
  "id": "shapechange",
  "name": "Смена облика",
  "nameEn": "Shapechange",
  "level": 9,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (A jade circlet worth at least 1,500 gp, which you must place on your head before you cast the spell.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "You assume the form of a different creature for the duration. The new form can be of any creature with a challenge rating equal to your level or lower. The creature can't be a construct or an undead, and you must have seen the sort of creature at least once. You transform into an average example of that creature, one without any class levels or the Spellcasting trait.",
   "Your game statistics are replaced by the statistics of the chosen creature, though you retain your alignment and Intelligence, Wisdom, and Charisma scores. You also retain all of your skill and saving throw proficiencies, in addition to gaining those of the creature. If the creature has the same proficiency as you and the bonus listed in its statistics is higher than yours, use the creature's bonus in place of yours. You can't use any legendary actions or lair actions of the new form.",
   "You assume the hit points and Hit Dice of the new form. When you revert to your normal form, you return to the number of hit points you had before you transformed. If you revert as a result of dropping to 0 hit points, any excess damage carries over to your normal form. As long as the excess damage doesn't reduce your normal form to 0 hit points, you aren't knocked unconscious.",
   "You retain the benefit of any features from your class, race, or other source and can use them, provided that your new form is physically capable of doing so. You can't use any special senses you have (for example, darkvision) unless your new form also has that sense. You can only speak if the creature can normally speak.",
   "When you transform, you choose whether your equipment falls to the ground, merges into the new form, or is worn by it. Worn equipment functions as normal. The GM determines whether it is practical for the new form to wear a piece of equipment, based on the creature's shape and size. Your equipment doesn't change shape or size to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge into your new form. Equipment that merges has no effect in that state.",
   "During this spell's duration, you can use your action to assume a different form following the same restrictions and rules for the original form, with one exception: if your new form has more hit points than your current one, your hit points remain at their current value."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shatter",
  "name": "Дребезги",
  "nameEn": "Shatter",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 10 фт)",
  "components": "В, С, М (осколок слюды)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Из выбранной вами точки в пределах дистанции раздаётся внезапный громкий, мучительно пронзительный звон. Каждое существо в сфере радиусом 10 футов с центром в этой точке совершает спасбросок Телосложения. При провале существо получает 3d8 урона звуком, при успехе — половину этого урона. Существо из неорганического материала — камня, кристалла или металла — совершает этот спасбросок с помехой.",
   "Немагический предмет, который никто не носит и не несёт, тоже получает урон, если находится в области заклинания."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shield",
  "name": "Щит",
  "nameEn": "Shield",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 реакция",
  "range": "На себя",
  "components": "В, С",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Появляется незримый барьер магической силы и защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД, в том числе против вызвавшей заклинание атаки, и не получаете урона от «Волшебной стрелы»."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shield-of-faith",
  "name": "Щит веры",
  "nameEn": "Shield of Faith",
  "level": 1,
  "school": "Ограждение",
  "castingTime": "1 бонусное действие",
  "range": "60 фт",
  "components": "В, С, М (клочок пергамента с отрывком священного текста)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Мерцающее поле окружает выбранное вами существо в пределах дистанции и даёт ему бонус +2 к КД на время действия заклинания."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shillelagh",
  "name": "Дубинка",
  "nameEn": "Shillelagh",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 бонусное действие",
  "range": "Касание",
  "components": "В, С, М (омела, лист трилистника и дубинка или боевой посох)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Древесину дубинки или боевого посоха, которые вы держите, наполняет сила природы. Пока действует заклинание, для бросков атаки и урона рукопашными атаками этим оружием вы можете использовать свою заклинательную характеристику вместо Силы, а кость урона оружия становится d8. Если оружие не было магическим, оно становится магическим. Заклинание заканчивается, если вы накладываете его снова или выпускаете оружие из рук."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "shocking-grasp",
  "name": "Электрошок",
  "nameEn": "Shocking Grasp",
  "level": 0,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "С вашей руки срывается молния и бьёт током существо, которого вы пытаетесь коснуться. Совершите по цели рукопашную атаку заклинанием. Если на цели доспех из металла, вы совершаете бросок атаки с преимуществом. При попадании цель получает 1d8 урона электричеством и не может совершать реакции до начала своего следующего хода.",
   "Урон заклинания увеличивается на 1d8, когда вы достигаете 5-го уровня (2d8), 11-го уровня (3d8) и 17-го уровня (4d8)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "silence",
  "name": "Тишина",
  "nameEn": "Silence",
  "level": 2,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 20 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": true,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "ranger"
  ],
  "desc": [
   "Пока действует заклинание, в сфере радиусом 20 футов с центром в выбранной вами точке в пределах дистанции не может возникнуть ни один звук, и никакой звук не проходит сквозь неё. Существа и предметы, полностью находящиеся внутри сферы, невосприимчивы к урону звуком, а существа внутри неё оглохшие.",
   "Накладывать там заклинания с вербальным компонентом невозможно."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "silent-image",
  "name": "Безмолвный образ",
  "nameEn": "Silent Image",
  "level": 1,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "60 фт (куб 15 фт)",
  "components": "В, С, М (клочок овечьей шерсти)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте образ предмета, существа или иного видимого явления, умещающийся в кубе с ребром 15 футов. Образ появляется в точке в пределах дистанции и существует, пока действует заклинание. Он чисто визуальный: без звука, запаха и иных сенсорных эффектов.",
   "Действием вы можете переместить образ в любое место в пределах дистанции. При этом можно менять его вид, чтобы движение выглядело естественно. Например, созданное существо может выглядеть идущим.",
   "Физическое взаимодействие с образом выдаёт иллюзию, потому что предметы проходят сквозь него. Существо, потратившее действие на изучение образа, может понять, что это иллюзия, преуспев в проверке Интеллекта (Анализ) против КС ваших заклинаний. Распознавшее иллюзию существо видит сквозь образ."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "simulacrum",
  "name": "Подобие",
  "nameEn": "Simulacrum",
  "level": 7,
  "school": "Иллюзия",
  "castingTime": "12 часов",
  "range": "Касание",
  "components": "В, С, М (Snow or ice in quantities sufficient to made a life-size copy of the duplicated creature; some hair, fingernail clippings, or other piece of that creature's body placed inside the snow or ice; and powdered ruby worth 1,500 gp, sprinkled over the duplicate and consumed by the spell.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You shape an illusory duplicate of one beast or humanoid that is within range for the entire casting time of the spell. The duplicate is a creature, partially real and formed from ice or snow, and it can take actions and otherwise be affected as a normal creature. It appears to be the same as the original, but it has half the creature's hit point maximum and is formed without any equipment. Otherwise, the illusion uses all the statistics of the creature it duplicates.",
   "The simulacrum is friendly to you and creatures you designate. It obeys your spoken commands, moving and acting in accordance with your wishes and acting on your turn in combat. The simulacrum lacks the ability to learn or become more powerful, so it never increases its level or other abilities, nor can it regain expended spell slots.",
   "If the simulacrum is damaged, you can repair it in an alchemical laboratory, using rare herbs and minerals worth 100 gp per hit point it regains. The simulacrum lasts until it drops to 0 hit points, at which point it reverts to snow and melts instantly.",
   "If you cast this spell again, any currently active duplicates you created with this spell are instantly destroyed."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sleep",
  "name": "Усыпление",
  "nameEn": "Sleep",
  "level": 1,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "90 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (щепотка мелкого песка, лепестки розы или сверчок)",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Заклинание погружает существ в магический сон. Бросьте 5d8: сумма показывает, сколько хитов существ может затронуть заклинание. Существа в пределах 20 футов от выбранной вами точки в пределах дистанции затрагиваются в порядке возрастания их текущих хитов (существа без сознания не учитываются).",
   "Начиная с существа с наименьшими текущими хитами, каждое затронутое существо теряет сознание, пока не закончится заклинание, пока спящий не получит урон или пока кто-нибудь действием не растормошит его или не даст пощёчину. Прежде чем перейти к следующему существу, вычтите хиты предыдущего из суммы. Существо затрагивается, только если его хиты не больше оставшейся суммы.",
   "На нежить и существ, невосприимчивых к очарованию, заклинание не действует."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, бросьте дополнительно 2d8 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sleet-storm",
  "name": "Метель",
  "nameEn": "Sleet Storm",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "150 фт (цилиндр радиусом 40 фт)",
  "components": "В, С, М (щепотка пыли и несколько капель воды)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "До окончания заклинания в цилиндре высотой 20 футов и радиусом 40 футов с центром в выбранной вами точке в пределах дистанции идёт ледяной дождь со снегом. Область сильно заслонена, а открытое пламя в ней гаснет.",
   "Земля в области покрывается скользким льдом и становится труднопроходимой местностью. Когда существо впервые за ход входит в область заклинания или начинает в ней ход, оно совершает спасбросок Ловкости. При провале оно падает ничком.",
   "Существо, поддерживающее концентрацию в области заклинания, должно преуспеть в спасброске Телосложения против КС ваших заклинаний, иначе теряет концентрацию."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "slow",
  "name": "Замедление",
  "nameEn": "Slow",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "120 фт (куб 40 фт)",
  "components": "В, С, М (капля патоки)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы изменяете время вокруг шести выбранных вами существ в кубе с ребром 40 футов в пределах дистанции. Каждая цель должна преуспеть в спасброске Мудрости, иначе попадает под действие заклинания на всё его время.",
   "Скорость затронутой цели уменьшается вдвое, она получает штраф −2 к КД и спасброскам Ловкости и не может совершать реакции. В свой ход она может совершить либо действие, либо бонусное действие, но не оба. Независимо от умений и магических предметов, за ход она может совершить не больше одной рукопашной или дальнобойной атаки.",
   "Если существо пытается наложить заклинание со временем накладывания 1 действие, бросьте d20. При результате 11 или выше заклинание вступает в силу только в следующий ход существа, и в этот ход оно должно потратить действие на завершение заклинания. Если оно не может, заклинание тратится впустую.",
   "Затронутое существо в конце своего хода повторяет спасбросок Мудрости. При успехе эффект для него заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "spare-the-dying",
  "name": "Уход за умирающим",
  "nameEn": "Spare the Dying",
  "level": 0,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы касаетесь живого существа, у которого 0 хитов. Существо становится стабилизированным. На нежить и конструктов заклинание не действует."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "speak-with-animals",
  "name": "Разговор с животными",
  "nameEn": "Speak with Animals",
  "level": 1,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "10 минут",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "Пока действует заклинание, вы понимаете зверей и можете говорить с ними. Знания и восприятие многих зверей ограничены их интеллектом, но как минимум звери могут рассказать о ближайших местах и чудовищах, включая всё, что они видят сейчас или видели за последние сутки. По решению Мастера зверя можно уговорить оказать вам небольшую услугу."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "speak-with-dead",
  "name": "Разговор с мёртвыми",
  "nameEn": "Speak with Dead",
  "level": 3,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "10 фт",
  "components": "В, С, М (горящие благовония)",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric"
  ],
  "desc": [
   "Вы наделяете выбранный вами труп в пределах дистанции подобием жизни и разума, и он может отвечать на ваши вопросы. У трупа должен сохраниться рот, и он не может быть нежитью. Заклинание не срабатывает, если этот труп был целью этого заклинания в последние 10 дней.",
   "До окончания заклинания вы можете задать трупу до пяти вопросов. Труп знает только то, что знал при жизни, включая известные ему языки. Ответы обычно кратки, загадочны или однообразны, и труп не обязан говорить правду, если вы враждебны ему или он признаёт в вас врага. Заклинание не возвращает в тело душу существа — только оживляющий его дух. Поэтому труп не может узнать ничего нового, не понимает того, что произошло после его смерти, и не может строить догадки о будущем."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "speak-with-plants",
  "name": "Разговор с растениями",
  "nameEn": "Speak with Plants",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы наделяете растения в пределах 30 футов от себя ограниченным разумом и подвижностью: они могут общаться с вами и выполнять простые приказы. Можно расспросить растения о событиях в области заклинания за последние сутки и узнать о проходивших существах, погоде и прочих обстоятельствах.",
   "Вы также можете превратить труднопроходимую местность, созданную растениями (заросли, подлесок), в обычную на время действия заклинания. Или превратить обычную местность с растениями в труднопроходимую на время действия заклинания — например, чтобы лозы и ветви мешали преследователям.",
   "По решению Мастера растения могут выполнить для вас и другие поручения. Заклинание не позволяет растениям вырвать корни и передвигаться, но они могут свободно шевелить ветвями, усиками и стеблями.",
   "Если в области есть существо-растение, вы можете общаться с ним, как если бы у вас был общий язык, но не получаете магической власти над ним.",
   "Заклинание может заставить растения, созданные «Опутыванием», отпустить опутанное существо."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "spider-climb",
  "name": "Паук",
  "nameEn": "Spider Climb",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (капля битума и паук)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "До окончания заклинания одно согласное существо, которого вы касаетесь, может передвигаться вверх, вниз и поперёк по вертикальным поверхностям и вниз головой по потолку, оставляя руки свободными. Цель также получает скорость лазания, равную скорости ходьбы."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "spike-growth",
  "name": "Шипастая поросль",
  "nameEn": "Spike Growth",
  "level": 2,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "150 фт (цилиндр радиусом 20 фт)",
  "components": "В, С, М (семь острых шипов или семь маленьких заострённых веточек)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Земля в радиусе 20 футов с центром в точке в пределах дистанции вздыбливается и покрывается твёрдыми шипами и колючками. Пока действует заклинание, область становится труднопроходимой местностью. Когда существо входит в область или передвигается внутри неё, оно получает 2d4 колющего урона за каждые пройденные 5 футов.",
   "Изменённая земля выглядит естественно. Существо, не видевшее область в момент накладывания, может перед тем, как войти, совершить проверку Мудрости (Внимательность) против КС ваших заклинаний, чтобы распознать опасность."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "spirit-guardians",
  "name": "Духовные стражи",
  "nameEn": "Spirit Guardians",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С, М (священный символ)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы призываете духов для своей защиты. Пока действует заклинание, они кружат вокруг вас на расстоянии до 15 футов. Если вы добры или нейтральны, их призрачный облик ангельский или волшебный (на ваш выбор). Если вы злы, они выглядят как исчадия.",
   "Накладывая заклинание, вы можете указать любое количество видимых вами существ, на которых оно не действует. Скорость затронутого существа в области уменьшается вдвое, а когда оно впервые за ход входит в область или начинает в ней ход, оно совершает спасбросок Мудрости. При провале существо получает 3d8 урона излучением (если вы добры или нейтральны) или 3d8 некротического урона (если вы злы). При успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "spiritual-weapon",
  "name": "Духовное оружие",
  "nameEn": "Spiritual Weapon",
  "level": 2,
  "school": "Воплощение",
  "castingTime": "1 бонусное действие",
  "range": "60 фт",
  "components": "В, С",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы создаёте в пределах дистанции парящее призрачное оружие, которое существует, пока действует заклинание или пока вы не наложите его снова. Накладывая заклинание, вы можете совершить рукопашную атаку заклинанием по существу в пределах 5 футов от оружия. При попадании цель получает урон силовым полем, равный 1d8 + модификатор вашей заклинательной характеристики.",
   "Бонусным действием в свой ход вы можете переместить оружие на расстояние до 20 футов и повторить атаку по существу в пределах 5 футов от него.",
   "Оружие может принять любую форму по вашему выбору. Жрецы божеств, связанных с определённым оружием, придают ему вид этого оружия."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 3-го круга или выше, урон увеличивается на 1d8 за каждые два круга ячейки выше 2-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "stinking-cloud",
  "name": "Зловонное облако",
  "nameEn": "Stinking Cloud",
  "level": 3,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "90 фт (сфера радиусом 20 фт)",
  "components": "В, С, М (тухлое яйцо или несколько листьев вонючей капусты)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте сферу жёлтого тошнотворного газа радиусом 20 футов с центром в точке в пределах дистанции. Облако огибает углы, а его область сильно заслонена. Облако висит в воздухе, пока действует заклинание.",
   "Каждое существо, полностью находящееся в облаке в начале своего хода, совершает спасбросок Телосложения от яда. При провале существо тратит действие этого хода на рвоту и шатание. Существа, которым не нужно дышать или которые невосприимчивы к яду, автоматически преуспевают.",
   "Умеренный ветер (не меньше 10 миль в час) рассеивает облако за 4 раунда, сильный (не меньше 20 миль в час) — за 1 раунд."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "stone-shape",
  "name": "Изменение формы камня",
  "nameEn": "Stone Shape",
  "level": 4,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (мягкая глина, которой грубо придают нужную форму каменного предмета)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "Вы касаетесь каменного предмета размером Средний или меньше либо участка камня не больше 5 футов в любом измерении и придаёте ему любую нужную форму. Например, можно превратить большой валун в оружие, идола или ларец или проделать небольшой проход в стене толщиной меньше 5 футов. Можно также изменить форму каменной двери или её косяка, чтобы намертво запечатать дверь. У созданного предмета может быть до двух петель и защёлка, но более тонкие механические детали невозможны."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "stoneskin",
  "name": "Каменная кожа",
  "nameEn": "Stoneskin",
  "level": 4,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (алмазная пыль стоимостью 100 зм, которую заклинание расходует)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Заклинание делает плоть согласного существа, которого вы касаетесь, твёрдой, как камень. До окончания заклинания цель обладает сопротивлением немагическому дробящему, колющему и рубящему урону."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "storm-of-vengeance",
  "name": "Шторм возмездия",
  "nameEn": "Storm of Vengeance",
  "level": 9,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "В пределах видимости (сфера радиусом 360 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet. Lightning flashes in the area, thunder booms, and strong winds roar. Each creature under the cloud (no more than 5,000 feet beneath the cloud) when it appears must make a constitution saving throw. On a failed save, a creature takes 2d6 thunder damage and becomes deafened for 5 minutes.",
   "Each round you maintain concentration on this spell, the storm produces additional effects on your turn.",
   "***Round 2.*** Acidic rain falls from the cloud. Each creature and object under the cloud takes 1d6 acid damage.",
   "***Round 3.*** You call six bolts of lightning from the cloud to strike six creatures or objects of your choice beneath the cloud. A given creature or object can't be struck by more than one bolt. A struck creature must make a dexterity saving throw. The creature takes 10d6 lightning damage on a failed save, or half as much damage on a successful one.",
   "***Round 4.*** Hailstones rain down from the cloud. Each creature under the cloud takes 2d6 bludgeoning damage.",
   "***Round 5-10.*** Gusts and freezing rain assail the area under the cloud. The area becomes difficult terrain and is heavily obscured. Each creature there takes 1d6 cold damage. Ranged weapon attacks in the area are impossible. The wind and rain count as a severe distraction for the purposes of maintaining concentration on spells. Finally, gusts of strong wind (ranging from 20 to 50 miles per hour) automatically disperse fog, mists, and similar phenomena in the area, whether mundane or magical."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "suggestion",
  "name": "Внушение",
  "nameEn": "Suggestion",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, М (змеиный язык и кусочек сотового мёда или капля сладкого масла)",
  "duration": "Концентрация, вплоть до 8 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы предлагаете образ действий (не длиннее одного-двух предложений) и магически влияете на видимое вами существо в пределах дистанции, которое слышит и понимает вас. Существа, которых нельзя очаровать, невосприимчивы к этому эффекту. Внушение должно быть сформулировано так, чтобы действие казалось разумным. Если предложить существу заколоть себя, броситься на копьё, сжечь себя или совершить иное очевидно вредное действие, заклинание заканчивается.",
   "Цель совершает спасбросок Мудрости. При провале она следует описанному образу действий как может. Внушённое действие может продолжаться всё время действия заклинания. Если его можно выполнить быстрее, заклинание заканчивается, когда цель сделает то, о чём её просили.",
   "Можно также задать условие, при котором цель совершит особое действие во время действия заклинания. Например, внушить рыцарю отдать боевого коня первому встречному нищему. Если условие не выполнится до окончания заклинания, действие не совершается.",
   "Если вы или ваши спутники причиняете цели урон, заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sunbeam",
  "name": "Солнечный луч",
  "nameEn": "Sunbeam",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (линия 60 фт)",
  "components": "В, С, М (увеличительное стекло)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Из вашей руки вырывается луч ослепительного света — линия шириной 5 футов и длиной 60 футов. Каждое существо в линии совершает спасбросок Телосложения. При провале существо получает 6d8 урона излучением и ослеплено до вашего следующего хода. При успехе — половину урона и не ослеплено. Нежить и слизи совершают этот спасбросок с помехой.",
   "До окончания заклинания в любой свой ход вы можете действием создать новую линию сияния.",
   "Пока действует заклинание, в вашей руке сияет искра ослепительного света. Она испускает яркий свет в радиусе 30 футов и тусклый свет ещё на 30 футов. Этот свет считается солнечным."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "sunburst",
  "name": "Солнечный ожог",
  "nameEn": "Sunburst",
  "level": 8,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "150 фт (цилиндр радиусом 60 фт)",
  "components": "В, С, М (Fire and a piece of sunstone.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw.",
   "A creature blinded by this spell makes another constitution saving throw at the end of each of its turns. On a successful save, it is no longer blinded.",
   "This spell dispels any darkness in its area that was created by a spell."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "symbol",
  "name": "Символ",
  "nameEn": "Symbol",
  "level": 7,
  "school": "Ограждение",
  "castingTime": "1 минута",
  "range": "Касание (куб 10 фт)",
  "components": "В, С, М (Mercury, phosphorus, and powdered diamond and opal with a total value of at least 1,000 gp, which the spell consumes.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "When you cast this spell, you inscribe a harmful glyph either on a surface (such as a section of floor, a wall, or a table) or within an object that can be closed to conceal the glyph (such as a book, a scroll, or a treasure chest). If you choose a surface, the glyph can cover an area of the surface no larger than 10 feet in diameter. If you choose an object, that object must remain in its place; if the object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.",
   "The glyph is nearly invisible, requiring an Intelligence (Investigation) check against your spell save DC to find it.",
   "You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, the most typical triggers include touching or stepping on the glyph, removing another object covering it, approaching within a certain distance of it, or manipulating the object that holds it. For glyphs inscribed within an object, the most common triggers are opening the object, approaching within a certain distance of it, or seeing or reading the glyph.",
   "You can further refine the trigger so the spell is activated only under certain circumstances or according to a creature's physical characteristics (such as height or weight), or physical kind (for example, the ward could be set to affect hags or shapechangers). You can also specify creatures that don't trigger the glyph, such as those who say a certain password.",
   "When you inscribe the glyph, choose one of the options below for its effect. Once triggered, the glyph glows, filling a 60-foot-radius sphere with dim light for 10 minutes, after which time the spell ends. Each creature in the sphere when the glyph activates is targeted by its effect, as is a creature that enters the sphere for the first time on a turn or ends its turn there.",
   "***Death.*** Each target must make a constitution saving throw, taking 10d 10 necrotic damage on a failed save, or half as much damage on a successful save.",
   "***Discord.*** Each target must make a constitution saving throw. On a failed save, a target bickers and argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has disadvantage on attack rolls and ability checks.",
   "***Fear.*** Each target must make a wisdom saving throw and becomes frightened for 1 minute on a failed save. While frightened, the target drops whatever it is holding and must move at least 30 feet away from the glyph on each of its turns, if able.",
   "***Hopelessness.*** Each target must make a charisma saving throw. On a failed save, the target is overwhelmed with despair for 1 minute. During this time, it can't attack or target any creature with harmful abilities, spells, or other magical effects.",
   "***Insanity.*** Each target must make an intelligence saving throw. On a failed save, the target is driven insane for 1 minute. An insane creature can't take actions, can't understand what other creatures say, can't read, and speaks only in gibberish. The GM controls its movement, which is erratic.",
   "***Pain.*** Each target must make a constitution saving throw and becomes incapacitated with excruciating pain for 1 minute on a failed save.",
   "***Sleep.*** Each target must make a wisdom saving throw and falls unconscious for 10 minutes on a failed save. A creature awakens if it takes damage or if someone uses an action to shake or slap it awake.",
   "***Stunning.*** Each target must make a wisdom saving throw and becomes stunned for 1 minute on a failed save."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "telekinesis",
  "name": "Телекинез",
  "nameEn": "Telekinesis",
  "level": 5,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы получаете способность силой мысли перемещать существ и предметы и управлять ими. Накладывая заклинание и действием в каждый раунд до его окончания, вы можете воздействовать на одно видимое вами существо или предмет в пределах дистанции, вызывая соответствующий эффект ниже. Можно воздействовать на одну цель раунд за раундом или в любой момент выбрать новую. При смене цели прежняя больше не затронута.",
   "***Существо.*** Вы можете попытаться переместить существо размером Огромный или меньше. Совершите проверку заклинательной характеристики против проверки Силы существа. При победе вы перемещаете существо на расстояние до 30 футов в любом направлении, в том числе вверх, но не за пределы дистанции. До конца вашего следующего хода существо опутано вашей телекинетической хваткой. Поднятое вверх существо висит в воздухе.",
   "В последующих раундах вы можете действием попытаться удержать хватку, повторив состязание.",
   "***Предмет.*** Вы можете попытаться переместить предмет весом до 1 000 фунтов. Если его никто не носит и не несёт, вы автоматически перемещаете его на расстояние до 30 футов в любом направлении, но не за пределы дистанции.",
   "Если предмет носит или несёт существо, совершите проверку заклинательной характеристики против проверки Силы этого существа. При успехе вы вырываете предмет и можете переместить его на расстояние до 30 футов в любом направлении, но не за пределы дистанции.",
   "Телекинетической хваткой можно тонко управлять предметами: пользоваться простым инструментом, открыть дверь или контейнер, убрать предмет в открытый контейнер или достать его оттуда, вылить содержимое флакона."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "telepathic-bond",
  "name": "Телепатическая связь",
  "nameEn": "Telepathic Bond",
  "level": 5,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (кусочки скорлупы яиц двух разных видов существ)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы создаёте телепатическую связь между выбранными вами согласными существами в пределах дистанции, числом до восьми, мысленно связывая каждое со всеми остальными на время действия заклинания. На существ с Интеллектом 2 или ниже заклинание не действует.",
   "До окончания заклинания цели могут телепатически общаться через связь, есть у них общий язык или нет. Общение возможно на любом расстоянии, но не между разными планами бытия."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "teleport",
  "name": "Телепортация",
  "nameEn": "Teleport",
  "level": 7,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "10 фт (куб 10 фт)",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can't be held or carried by an unwilling creature.",
   "The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The GM rolls d100 and consults the table.",
   "| Familiarity | Mishap | Similar Area | Off Target | On Target |",
   "|---|---|---|---|---|",
   "| Permanent circle | -- | -- | -- | 01-100 |",
   "| Associated object | -- | -- | -- | 01-100 |",
   "| Very familiar | 01-05 | 06-13 | 14-24 | 25-100 |",
   "| Seen casually | 01-33 | 34-43 | 44-53 | 54-100 |",
   "| Viewed once | 01-43 | 44-53 | 54-73 | 74-100 |",
   "| Description | 01-43 | 44-53 | 54-73 | 74-100 |",
   "| False destination | 01-50 | 51-100 | -- | -- |",
   "***Familiarity.*** \"Permanent circle\" means a permanent teleportation circle whose sigil sequence you know.",
   "\"Associated object\" means that you possess an object taken from the desired destination within the last six months, such as a book from a wizard's library, bed linen from a royal suite, or a chunk of marble from a lich's secret tomb.",
   "\"Very familiar\" is a place you have been very often, a place you have carefully studied, or a place you can see when you cast the spell.",
   "\"Seen casually\" is someplace you have seen more than once but with which you aren't very familiar.",
   "\"Viewed once\" is a place you have seen once, possibly using magic.",
   "\"Description\" is a place whose location and appearance you know through someone else's description, perhaps from a map.",
   "\"False destination\" is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a familiar location that no longer exists.",
   "***On Target.*** You and your group (or the target object) appear where you want to.",
   "***Off Target.*** You and your group (or the target object) appear a random distance away from the destination in a random direction. Distance off target is 1d10 x 1d10 percent of the distance that was to be traveled. For example, if you tried to travel 120 miles, landed off target, and rolled a 5 and 3 on the two d10s, then you would be off target by 15 percent, or 18 miles. The GM determines the direction off target randomly by rolling a d8 and designating 1 as north, 2 as northeast, 3 as east, and so on around the points of the compass.  If you were teleporting to a coastal city and wound up 18 miles out at sea, you could be in trouble.",
   "***Similar Area.*** You and your group (or the target object) wind up in a different area that's visually or thematically similar to the target area. If you are heading for your home laboratory, for example, you might wind up in another wizard's laboratory or in an alchemical supply shop that has many of the same tools and implements as your laboratory. Generally, you appear in the closest similar place, but since the spell has no range limit, you could conceivably wind up anywhere on the plane.",
   "***Mishap.*** The spell's unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 force damage, and the GM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time)."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "teleportation-circle",
  "name": "Круг телепортации",
  "nameEn": "Teleportation Circle",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 минута",
  "range": "10 фт (сфера радиусом 10 фт)",
  "components": "В, М (редкие мелки и чернила с примесью драгоценных камней стоимостью 50 зм, которые заклинание расходует)",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Накладывая заклинание, вы чертите на земле круг диаметром 10 футов с символами, связывающими ваше место с выбранным постоянным кругом телепортации на том же плане бытия, последовательность символов которого вы знаете. Внутри начерченного круга открывается мерцающий портал и остаётся открытым до конца вашего следующего хода. Любое существо, вошедшее в портал, мгновенно появляется в пределах 5 футов от круга назначения или в ближайшем свободном пространстве, если это занято.",
   "Во многих крупных храмах, гильдиях и других важных местах где-то есть постоянные круги телепортации. У каждого такого круга уникальная последовательность символов — цепочка магических рун в определённом порядке. Получив способность накладывать это заклинание, вы узнаёте последовательности двух мест назначения на Материальном плане по выбору Мастера. Другие последовательности можно узнать в приключениях. Новую последовательность можно запомнить, изучая её 1 минуту.",
   "Постоянный круг телепортации можно создать, накладывая это заклинание на одном и том же месте каждый день в течение года. При этом пользоваться кругом для телепортации не обязательно."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "thaumaturgy",
  "name": "Чудотворство",
  "nameEn": "Thaumaturgy",
  "level": 0,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В",
  "duration": "1 минута",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы являете малое чудо, знак сверхъестественной силы. В пределах дистанции вы создаёте один из следующих магических эффектов:",
   "- Ваш голос на 1 минуту становится втрое громче обычного.",
   "- На 1 минуту пламя начинает мерцать, разгорается, тускнеет или меняет цвет.",
   "- На 1 минуту земля начинает безвредно дрожать.",
   "- Из выбранной вами точки в пределах дистанции раздаётся мгновенный звук: раскат грома, крик ворона или зловещий шёпот.",
   "- Незапертая дверь или окно мгновенно распахивается или захлопывается.",
   "- На 1 минуту меняется вид ваших глаз.",
   "Если наложить заклинание несколько раз, одновременно могут действовать до трёх его минутных эффектов; любой из них можно прекратить действием."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "thunderwave",
  "name": "Волна грома",
  "nameEn": "Thunderwave",
  "level": 1,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "На себя (куб 15 фт)",
  "components": "В, С",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "От вас расходится волна громовой силы. Каждое существо в кубе с ребром 15 футов, исходящем от вас, совершает спасбросок Телосложения. При провале существо получает 2d8 урона звуком и отталкивается на 10 футов от вас. При успехе — половину урона и не отталкивается.",
   "Кроме того, незакреплённые предметы, полностью находящиеся в области, автоматически отталкиваются на 10 футов от вас, а заклинание издаёт громовой раскат, слышный на расстоянии до 300 футов."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 2-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 1-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "time-stop",
  "name": "Остановка времени",
  "nameEn": "Time Stop",
  "level": 9,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal.",
   "This spell ends if one of the actions you use during this period, or any effects that you create during this period, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "tiny-hut",
  "name": "Крошечная хижина",
  "nameEn": "Tiny Hut",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 минута",
  "range": "На себя (сфера радиусом 10 фт)",
  "components": "В, С, М (маленькая хрустальная бусина)",
  "duration": "8 часов",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "Вокруг и над вами возникает неподвижный силовой купол радиусом 10 футов и стоит на месте, пока действует заклинание. Заклинание заканчивается, если вы покидаете его область.",
   "Под куполом вместе с вами помещаются девять существ Среднего размера или меньше. Заклинание не срабатывает, если в его области есть существо крупнее или больше девяти существ. Существа и предметы, находившиеся под куполом в момент накладывания, свободно проходят сквозь него. Всем остальным существам и предметам проход закрыт. Заклинания и другие магические эффекты не проходят сквозь купол, и через него нельзя накладывать заклинания. Внутри сухо и комфортно, какая бы погода ни стояла снаружи.",
   "До окончания заклинания вы можете приказать, чтобы внутри было тускло освещено или темно. Снаружи купол непрозрачен и любого цвета на ваш выбор, изнутри — прозрачен."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "tongues",
  "name": "Языки",
  "nameEn": "Tongues",
  "level": 3,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, М (маленькая глиняная модель зиккурата)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинание даёт существу, которого вы касаетесь, способность понимать любую слышимую речь на любом языке. Кроме того, когда цель говорит, любое существо, знающее хотя бы один язык и слышащее цель, понимает её."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "transport-via-plants",
  "name": "Перемещение через растения",
  "nameEn": "Transport via Plants",
  "level": 6,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "10 фт",
  "components": "В, С",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Заклинание создаёт магическую связь между неодушевлённым растением размером Большой или больше в пределах дистанции и другим растением на любом расстоянии на том же плане бытия. Растение назначения вы должны были хотя бы раз видеть или касаться. Пока действует заклинание, любое существо может, потратив 5 футов перемещения, войти в растение-цель и выйти из растения назначения."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "tree-stride",
  "name": "Древесный путь",
  "nameEn": "Tree Stride",
  "level": 5,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Вы получаете способность входить в дерево и перемещаться изнутри него внутрь другого дерева того же вида в пределах 500 футов. Оба дерева должны быть живыми и не меньше вас размером. Чтобы войти в дерево, нужно потратить 5 футов перемещения. Вы мгновенно узнаёте, где находятся все деревья того же вида в пределах 500 футов, и, в рамках перемещения, потраченного на вход, можете перейти в одно из них или выйти из дерева, в котором находитесь. Вы появляетесь в выбранном вами месте в пределах 5 футов от дерева назначения, потратив ещё 5 футов перемещения. Если перемещения не осталось, вы появляетесь в пределах 5 футов от дерева, в которое вошли.",
   "Пока действует заклинание, этой способностью можно пользоваться раз в раунд. Каждый ход нужно заканчивать вне дерева."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "true-polymorph",
  "name": "Истинное превращение",
  "nameEn": "True Polymorph",
  "level": 9,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (A drop of mercury, a dollop of gum arabic, and a wisp of smoke.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Choose one creature or nonmagical object that you can see within range. You transform the creature into a different creature, the creature into an object, or the object into a creature (the object must be neither worn nor carried by another creature). The transformation lasts for the duration, or until the target drops to 0 hit points or dies. If you concentrate on this spell for the full duration, the transformation becomes permanent.",
   "Shapechangers aren't affected by this spell. An unwilling creature can make a wisdom saving throw, and if it succeeds, it isn't affected by this spell.",
   "***Creature into Creature.*** If you turn a creature into another kind of creature, the new form can be any kind you choose whose challenge rating is equal to or less than the target's (or its level, if the target doesn't have a challenge rating). The target's game statistics, including mental ability scores, are replaced by the statistics of the new form. It retains its alignment and personality.",
   "The target assumes the hit points of its new form, and when it reverts to its normal form, the creature returns to the number of hit points it had before it transformed. If it reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious.",
   "The creature is limited in the actions it can perform by the nature of its new form, and it can't speak, cast spells, or take any other action that requires hands or speech unless its new form is capable of such actions.",
   "The target's gear melds into the new form. The creature can't activate, use, wield, or otherwise benefit from any of its equipment.",
   "***Object into Creature.*** You can turn an object into any kind of creature, as long as the creature's size is no larger than the object's size and the creature's challenge rating is 9 or lower. The creature is friendly to you and your companions. It acts on each of your turns. You decide what action it takes and how it moves. The GM has the creature's statistics and resolves all of its actions and movement.",
   "If the spell becomes permanent, you no longer control the creature. It might remain friendly to you, depending on how you have treated it.",
   "***Creature into Object.*** If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form. The creature's statistics become those of the object, and the creature has no memory of time spent in this form, after the spell ends and it returns to its normal form."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "true-resurrection",
  "name": "Истинное воскрешение",
  "nameEn": "True Resurrection",
  "level": 9,
  "school": "Некромантия",
  "castingTime": "1 час",
  "range": "Касание",
  "components": "В, С, М (A sprinkle of holy water and diamonds worth at least 25,000gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature's soul is free and willing, the creature is restored to life with all its hit points.",
   "This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs.",
   "The spell can even provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "true-seeing",
  "name": "Истинное зрение",
  "nameEn": "True Seeing",
  "level": 6,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (мазь для глаз стоимостью 25 зм из грибного порошка, шафрана и жира, которую заклинание расходует)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинание даёт согласному существу, которого вы касаетесь, способность видеть вещи такими, какие они есть. Пока действует заклинание, существо обладает истинным зрением, замечает потайные двери, скрытые магией, и видит Эфирный план — всё в пределах 120 футов."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "true-strike",
  "name": "Меткий удар",
  "nameEn": "True Strike",
  "level": 0,
  "school": "Прорицание",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "С",
  "duration": "Концентрация, вплоть до 1 раунда",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Вы протягиваете руку и указываете пальцем на цель в пределах дистанции. Магия на миг открывает вам слабые места в её защите. В свой следующий ход вы совершаете с преимуществом первый бросок атаки по этой цели, если заклинание к тому моменту не закончилось."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "unseen-servant",
  "name": "Невидимый слуга",
  "nameEn": "Unseen Servant",
  "level": 1,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (кусочек верёвки и кусочек дерева)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "Заклинание создаёт невидимую, лишённую разума и формы силу, которая выполняет простые поручения, пока действует заклинание. Слуга появляется в свободном пространстве на земле в пределах дистанции. У него КД 10, 1 хит и Сила 2; атаковать он не может. Если хиты слуги опускаются до 0, заклинание заканчивается.",
   "Один раз в каждый свой ход бонусным действием вы можете мысленно приказать слуге переместиться на расстояние до 15 футов и взаимодействовать с предметом. Слуга выполняет простые дела, какие мог бы делать слуга-человек: приносить вещи, убирать, чинить, складывать одежду, разводить огонь, подавать еду, наливать вино. Получив приказ, слуга выполняет его как может, пока не закончит, а затем ждёт следующего приказа.",
   "Если вы приказываете слуге сделать что-то, из-за чего он удалится от вас больше чем на 60 футов, заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "vampiric-touch",
  "name": "Прикосновение вампира",
  "nameEn": "Vampiric Touch",
  "level": 3,
  "school": "Некромантия",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "Прикосновение вашей окутанной тенью руки вытягивает жизненную силу из других, исцеляя ваши раны. Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании цель получает 3d6 некротического урона, а вы восстанавливаете хиты, равные половине причинённого некротического урона. До окончания заклинания вы можете действием повторять эту атаку в каждый свой ход."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 4-го круга или выше, урон увеличивается на 1d6 за каждый круг ячейки выше 3-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "vicious-mockery",
  "name": "Злая насмешка",
  "nameEn": "Vicious Mockery",
  "level": 0,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard"
  ],
  "desc": [
   "Вы осыпаете видимое вами существо в пределах дистанции оскорблениями, пропитанными тонкими чарами. Если цель слышит вас (понимать необязательно), она должна преуспеть в спасброске Мудрости, иначе получит 1d4 психического урона и совершит с помехой следующий бросок атаки до конца своего следующего хода.",
   "Урон заклинания увеличивается на 1d4, когда вы достигаете 5-го уровня (2d4), 11-го уровня (3d4) и 17-го уровня (4d4)."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-fire",
  "name": "Огненная стена",
  "nameEn": "Wall of Fire",
  "level": 4,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт (линия 60 фт)",
  "components": "В, С, М (маленький кусочек фосфора)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте стену огня на твёрдой поверхности в пределах дистанции. Это может быть стена длиной до 60 футов, высотой 20 футов и толщиной 1 фут или кольцевая стена диаметром до 20 футов, высотой 20 футов и толщиной 1 фут. Стена непрозрачна и держится, пока действует заклинание.",
   "Когда стена появляется, каждое существо в её области совершает спасбросок Ловкости. При провале существо получает 5d8 урона огнём, при успехе — половину этого урона.",
   "Одна сторона стены, выбранная вами при накладывании, причиняет 5d8 урона огнём каждому существу, заканчивающему ход в пределах 10 футов от этой стороны или внутри стены. Тот же урон получает существо, впервые за ход входящее в стену или заканчивающее в ней ход. Другая сторона стены урона не причиняет."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 5-го круга или выше, урон увеличивается на 1d8 за каждый круг ячейки выше 4-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-force",
  "name": "Силовая стена",
  "nameEn": "Wall of Force",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (щепотка порошка из истолчённого прозрачного самоцвета)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "В выбранной вами точке в пределах дистанции возникает невидимая силовая стена. Она может быть расположена как угодно — горизонтально, вертикально или под углом, — парить в воздухе или опираться на твёрдую поверхность. Ей можно придать форму полусферического купола или сферы радиусом до 10 футов либо плоской поверхности из десяти панелей размером 10 на 10 футов; каждая панель должна примыкать к другой. В любой форме толщина стены — 1/4 дюйма. Стена держится, пока действует заклинание. Если при появлении стена проходит через пространство существа, существо выталкивается на одну из её сторон (на ваш выбор).",
   "Ничто не может физически пройти сквозь стену. Она невосприимчива ко всему урону и не может быть рассеяна «Рассеиванием магии». Однако заклинание «Распад» мгновенно уничтожает её. Стена также простирается на Эфирный план, перекрывая эфирное перемещение сквозь неё."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-ice",
  "name": "Ледяная стена",
  "nameEn": "Wall of Ice",
  "level": 6,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 10 фт)",
  "components": "В, С, М (маленький кусочек кварца)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Вы создаёте стену льда на твёрдой поверхности в пределах дистанции. Ей можно придать форму полусферического купола или сферы радиусом до 10 футов либо плоской поверхности из десяти панелей 10 на 10 футов; каждая панель должна примыкать к другой. В любой форме толщина стены 1 фут; она держится, пока действует заклинание.",
   "Если при появлении стена проходит через пространство существа, оно выталкивается на одну из сторон стены и совершает спасбросок Ловкости. При провале существо получает 10d6 урона холодом, при успехе — половину этого урона.",
   "Стена — предмет, который можно повредить и пробить. У каждой секции длиной 10 футов КД 12 и 30 хитов, и она уязвима к урону огнём. Секция с 0 хитов разрушается, оставляя на своём месте завесу ледяного воздуха. Существо, впервые за ход проходящее сквозь завесу, совершает спасбросок Телосложения. При провале оно получает 5d6 урона холодом, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, за каждый круг ячейки выше 6-го урон при появлении стены увеличивается на 2d6, а урон от прохода сквозь завесу ледяного воздуха — на 1d6."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-stone",
  "name": "Каменная стена",
  "nameEn": "Wall of Stone",
  "level": 5,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт",
  "components": "В, С, М (небольшой кусок гранита)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "В выбранной вами точке в пределах дистанции возникает немагическая стена из сплошного камня толщиной 6 дюймов из десяти панелей размером 10 на 10 футов. Каждая панель должна примыкать хотя бы к одной другой. Вместо этого можно создать панели 10 на 20 футов толщиной всего 3 дюйма.",
   "Если при появлении стена проходит через пространство существа, оно выталкивается на одну из её сторон (на ваш выбор). Если существо оказывается окружено стеной со всех сторон (или стеной и другой твёрдой поверхностью), оно может совершить спасбросок Ловкости. При успехе оно может реакцией переместиться на расстояние до своей скорости, чтобы больше не быть замурованным.",
   "Стене можно придать любую форму, но она не может занимать пространство существа или предмета. Стена не обязана быть вертикальной или стоять на прочном основании, но должна сливаться с существующим камнем и надёжно на него опираться. Так заклинанием можно перекинуть мост через пропасть или создать пандус.",
   "Если пролёт длиннее 20 футов, размер каждой панели нужно уменьшить вдвое, чтобы создать опоры. Стене можно грубо придать зубцы, бойницы и тому подобное.",
   "Стена — каменный предмет, который можно повредить и пробить. У каждой панели КД 15 и 30 хитов на каждый дюйм толщины. Панель с 0 хитов разрушается, а по решению Мастера могут обрушиться и соединённые с ней панели.",
   "Если вы поддерживаете концентрацию на заклинании всю его длительность, стена становится постоянной и не может быть рассеяна. Иначе стена исчезает, когда заклинание заканчивается."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-thorns",
  "name": "Стена шипов",
  "nameEn": "Wall of Thorns",
  "level": 6,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "120 фт (линия 60 фт)",
  "components": "В, С, М (горсть шипов)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "Вы создаёте стену из жёсткого, гибкого, спутанного кустарника, ощетинившегося иглами-шипами. Стена появляется на твёрдой поверхности в пределах дистанции и держится, пока действует заклинание. Это может быть стена длиной до 60 футов, высотой 10 футов и толщиной 5 футов или кольцо диаметром 20 футов, высотой до 20 футов и толщиной 5 футов. Стена перекрывает обзор.",
   "Когда стена появляется, каждое существо в её области совершает спасбросок Ловкости. При провале существо получает 7d8 колющего урона, при успехе — половину этого урона.",
   "Сквозь стену можно пройти, хоть медленно и мучительно: на каждый фут перемещения сквозь стену тратится 4 фута. Кроме того, когда существо впервые за ход входит в стену или заканчивает в ней ход, оно совершает спасбросок Ловкости. При провале оно получает 7d8 рубящего урона, при успехе — половину этого урона."
  ],
  "higher": [
   "Если вы накладываете это заклинание с помощью ячейки 7-го круга или выше, оба вида урона увеличиваются на 1d8 за каждый круг ячейки выше 6-го."
  ],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wall-of-water",
  "name": "Водяная стена",
  "nameEn": "Wall of Water",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "60 фт",
  "components": "В, С, М (капля воды)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "На видимой точке земли в пределах дистанции поднимается стена воды. Это может быть прямая стена длиной до 30 футов, высотой 10 футов и толщиной 1 фут, либо кольцо диаметром до 20 футов, высотой 20 футов и толщиной 1 фут. Стена исчезает, когда заклинание заканчивается. Её пространство — труднопроходимая местность.",
   "Дальнобойные атаки оружием, пересекающие стену, совершаются с помехой. Урон огнём, проходящий сквозь стену, уменьшается вдвое. Заклинания с уроном холодом, задевающие стену, замораживают её участок 5×5 футов: у такого участка КД 5 и 15 хитов, урон огнём против него удваивается, а при падении хитов до 0 участок разрушается и стена там не восстанавливается."
  ],
  "higher": [],
  "translated": true,
  "source": "custom",
  "sourceNote": "Руководство Занатара (механика, описание своими словами)"
 },
 {
  "id": "warding-bond",
  "name": "Охраняющая связь",
  "nameEn": "Warding Bond",
  "level": 2,
  "school": "Ограждение",
  "castingTime": "1 действие",
  "range": "Касание",
  "components": "В, С, М (пара платиновых колец стоимостью не меньше 50 зм каждое, которые вы и цель носите всё время действия заклинания)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Заклинание защищает согласное существо, которого вы касаетесь, и до окончания заклинания создаёт между вами мистическую связь. Пока цель находится в пределах 60 футов от вас, она получает бонус +1 к КД и спасброскам и сопротивление всему урону. При этом каждый раз, когда цель получает урон, вы получаете столько же урона.",
   "Заклинание заканчивается, если ваши хиты опускаются до 0 или если вы и цель оказываетесь дальше 60 футов друг от друга.",
   "Оно также заканчивается, если заклинание снова наложено на любое из связанных существ. Вы можете прекратить заклинание действием."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "water-breathing",
  "name": "Подводное дыхание",
  "nameEn": "Water Breathing",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (короткий кусочек тростника или соломинка)",
  "duration": "24 часа",
  "ritual": true,
  "concentration": false,
  "classes": [
   "druid",
   "ranger",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "До окончания заклинания до десяти согласных видимых вами существ в пределах дистанции получают способность дышать под водой. Затронутые существа сохраняют и обычное дыхание."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "water-walk",
  "name": "Хождение по воде",
  "nameEn": "Water Walk",
  "level": 3,
  "school": "Преобразование",
  "castingTime": "1 действие",
  "range": "30 фт",
  "components": "В, С, М (кусочек пробки)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "ranger",
   "sorcerer"
  ],
  "desc": [
   "Заклинание позволяет передвигаться по поверхности любой жидкости — воды, кислоты, грязи, снега, зыбучего песка или лавы — как по безопасной твёрдой земле (идущие по раскалённой лаве всё равно могут получить урон от жара). Этой способностью на время действия заклинания наделяются до десяти согласных видимых вами существ в пределах дистанции.",
   "Если цель погружена в жидкость, заклинание поднимает её к поверхности со скоростью 60 футов за раунд."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "web",
  "name": "Паутина",
  "nameEn": "Web",
  "level": 2,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "60 фт (куб 20 фт)",
  "components": "В, С, М (кусочек паутины)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Вы создаёте в выбранной вами точке в пределах дистанции массу толстой липкой паутины. Паутина заполняет куб с ребром 20 футов от этой точки, пока действует заклинание. Паутина — труднопроходимая местность и слегка заслоняет свою область.",
   "Если паутина не закреплена между двумя твёрдыми массами (стенами, деревьями) или не натянута по полу, стене или потолку, она опадает, и заклинание заканчивается в начале вашего следующего хода. Паутина, натянутая по плоской поверхности, имеет толщину 5 футов.",
   "Каждое существо, начинающее ход в паутине или входящее в неё в свой ход, совершает спасбросок Ловкости. При провале оно опутано, пока остаётся в паутине или пока не вырвется.",
   "Опутанное паутиной существо может действием совершить проверку Силы против КС ваших заклинаний. При успехе оно больше не опутано.",
   "Паутина горюча. Любой куб паутины с ребром 5 футов, на который попал огонь, сгорает за 1 раунд, причиняя 2d4 урона огнём каждому существу, начинающему ход в огне."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "weird",
  "name": "Смертный ужас",
  "nameEn": "Weird",
  "level": 9,
  "school": "Иллюзия",
  "castingTime": "1 действие",
  "range": "120 фт (сфера радиусом 30 фт)",
  "components": "В, С",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them. Each creature in a 30-foot-radius sphere centered on a point of your choice within range must make a wisdom saving throw. On a failed save, a creature becomes frightened for the duration. The illusion calls on the creature's deepest fears, manifesting its worst nightmares as an implacable threat. At the start of each of the frightened creature's turns, it must succeed on a wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends for that creature."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wind-walk",
  "name": "Хождение по ветру",
  "nameEn": "Wind Walk",
  "level": 6,
  "school": "Преобразование",
  "castingTime": "1 минута",
  "range": "30 фт",
  "components": "В, С, М (огонь и святая вода)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Вы и до десяти согласных видимых вами существ в пределах дистанции принимаете газообразную форму на время действия заклинания, выглядя как клочья облаков. В облачной форме существо обладает скоростью полёта 300 футов и сопротивлением урону от немагического оружия. Единственные действия, доступные в этой форме, — «Рывок» и возвращение в обычный облик. Возвращение занимает 1 минуту, в течение которой существо недееспособно и не может перемещаться. До окончания заклинания существо может снова принять облачную форму, на что тоже уходит 1 минута.",
   "Если существо в облачной форме летит, когда эффект заканчивается, оно 1 минуту опускается со скоростью 60 футов за раунд, пока благополучно не приземлится. Если за 1 минуту приземлиться не удалось, оно падает с оставшейся высоты."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wind-wall",
  "name": "Стена ветра",
  "nameEn": "Wind Wall",
  "level": 3,
  "school": "Воплощение",
  "castingTime": "1 действие",
  "range": "120 фт (линия 50 фт)",
  "components": "В, С, М (крошечный веер и перо экзотической птицы)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "Из земли в выбранной вами точке в пределах дистанции поднимается стена сильного ветра длиной до 50 футов, высотой 15 футов и толщиной 1 фут. Стене можно придать любую форму, если она образует одну непрерывную линию по земле. Стена держится, пока действует заклинание.",
   "Когда стена появляется, каждое существо в её области совершает спасбросок Силы. При провале существо получает 3d8 дробящего урона, при успехе — половину этого урона.",
   "Сильный ветер не пропускает туман, дым и другие газы. Летающие существа и предметы размером Маленький и меньше не могут пройти сквозь стену. Попавшие в стену лёгкие сыпучие материалы взлетают вверх. Стрелы, болты и другие обычные снаряды, выпущенные в цели за стеной, отклоняются вверх и автоматически промахиваются (на валуны, брошенные великанами или осадными машинами, и подобные снаряды это не действует). Существа в газообразной форме не могут пройти сквозь стену."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "wish",
  "name": "Исполнение желаний",
  "nameEn": "Wish",
  "level": 9,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "На себя",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.",
   "The basic use of this spell is to duplicate any other spell of 8th level or lower. You don't need to meet any requirements in that spell, including costly components. The spell simply takes effect.",
   "Alternatively, you can create one of the following effects of your choice:",
   "- You create one object of up to 25,000 gp in value that isn't a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space you can see on the ground.",
   "- You allow up to twenty creatures that you can see to regain all hit points, and you end all effects on them described in the greater restoration spell.",
   "- You grant up to ten creatures that you can see resistance to a damage type you choose.",
   "- You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours. For instance, you could make yourself and all your companions immune to a lich's life drain attack.",
   "- You undo a single recent event by forcing a reroll of any roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a wish spell could undo an opponent's successful save, a foe's critical hit, or a friend's failed save. You can force the reroll to be made with advantage or disadvantage, and you can choose whether to use the reroll or the original roll.",
   "You might be able to achieve something beyond the scope of the above examples. State your wish to the GM as precisely as possible. The GM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might only be partly achieved, or you might suffer some unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game. Similarly, wishing for a legendary magic item or artifact might instantly transport you to the presence of the item's current owner.",
   "The stress of casting this spell to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a long rest, you take 1d10 necrotic damage per level of that spell. This damage can't be reduced or prevented in any way. In addition, your Strength drops to 3, if it isn't 3 or lower already, for 2d4 days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast wish ever again if you suffer this stress."
  ],
  "higher": [],
  "translated": false,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "word-of-recall",
  "name": "Слово возврата",
  "nameEn": "Word of Recall",
  "level": 6,
  "school": "Вызов",
  "castingTime": "1 действие",
  "range": "5 фт (сфера радиусом 5 фт)",
  "components": "В",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "Вы и до пяти согласных существ в пределах 5 футов от вас мгновенно телепортируетесь в заранее назначенное святилище. Вы и все телепортировавшиеся с вами появляетесь в ближайшем свободном пространстве к месту, которое вы указали, готовя святилище (см. ниже). Если накладывать заклинание, не подготовив святилище, оно не действует.",
   "Чтобы назначить святилище, нужно наложить это заклинание в месте, посвящённом вашему божеству или тесно с ним связанном, например в храме. Если попытаться сделать это в месте, не посвящённом вашему божеству, заклинание не действует."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 },
 {
  "id": "zone-of-truth",
  "name": "Область истины",
  "nameEn": "Zone of Truth",
  "level": 2,
  "school": "Очарование",
  "castingTime": "1 действие",
  "range": "60 фт (сфера радиусом 15 фт)",
  "components": "В, С",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "paladin"
  ],
  "desc": [
   "Вы создаёте магическую зону, защищающую от обмана, — сферу радиусом 15 футов с центром в выбранной вами точке в пределах дистанции. До окончания заклинания существо, впервые за ход входящее в область или начинающее в ней ход, совершает спасбросок Харизмы. При провале существо не может намеренно лгать, пока находится в радиусе. Вы знаете, преуспело ли каждое существо в спасброске.",
   "Затронутое существо знает о заклинании и потому может уклоняться от ответов на вопросы, на которые обычно ответило бы ложью. Такое существо может отвечать уклончиво, пока не выходит за рамки правды."
  ],
  "higher": [],
  "translated": true,
  "source": "srd",
  "sourceNote": "SRD 5.1"
 }
];
