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
   "Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects. You can't animate any object larger than Huge. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 hit points.",
   "As a bonus action, you can mentally command any creature you made with this spell if the creature is within 500 feet of you (if you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.",
   "##### Animated Object Statistics",
   "| Size | HP | AC | Attack | Str | Dex |",
   "|---|---|---|---|---|---|",
   "| Tiny | 20 | 18 | +8 to hit, 1d4 + 4 damage | 4 | 18 |",
   "| Small | 25 | 16 | +6 to hit, 1d8 + 2 damage | 6 | 14 |",
   "| Medium | 40 | 13 | +5 to hit, 2d6 + 1 damage | 10 | 12 |",
   "| Large | 50 | 10 | +6 to hit, 2d10 + 2 damage | 14 | 10 |",
   "| Huge | 80 | 10 | +8 to hit, 2d12 + 4 damage | 18 | 6 |",
   "An animated object is a construct with AC, hit points, attacks, Strength, and Dexterity determined by its size. Its Constitution is 10 and its Intelligence and Wisdom are 3, and its Charisma is 1. Its speed is 30 feet; if the object lacks legs or other appendages it can use for locomotion, it instead has a flying speed of 30 feet and can hover. If the object is securely attached to a surface or a larger object, such as a chain bolted to a wall, its speed is 0. It has blindsight with a radius of 30 feet and is blind beyond that distance. When the animated object drops to 0 hit points, it reverts to its original object form, and any remaining damage carries over to its original object form.",
   "If you command an object to attack, it can make a single melee attack against a creature within 5 feet of it. It makes a slam attack with an attack bonus and bludgeoning damage determined by its size. The GM might rule that a specific object inflicts slashing or piercing damage based on its form."
  ],
  "higher": [
   "If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th."
  ],
  "translated": false,
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
   "A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than undead and constructs. The barrier lasts for the duration.",
   "The barrier prevents an affected creature from passing or reaching through. An affected creature can cast spells or make attacks with ranged or reach weapons through the barrier.",
   "If you move so that an affected creature is forced to pass through the barrier, the spell ends."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A bit of bat fur.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "wizard"
  ],
  "desc": [
   "You create an invisible, magical eye within range that hovers in the air for the duration.",
   "You mentally receive visual information from the eye, which has normal vision and darkvision out to 30 feet. The eye can look in every direction.",
   "As an action, you can move the eye up to 30 feet in any direction. There is no limit to how far away from you the eye can move, but it can't enter another plane of existence. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (An eggshell and a snakeskin glove.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range. The hand lasts for the spell's duration, and it moves at your command, mimicking the movements of your own hand.",
   "The hand is an object that has AC 20 and hit points equal to your hit point maximum. If it drops to 0 hit points, the spell ends. It has a Strength of 26 (+8) and a Dexterity of 10 (+0). The hand doesn't fill its space.",
   "When you cast the spell and as a bonus action on your subsequent turns, you can move the hand up to 60 feet and then cause one of the following effects with it.",
   "***Clenched Fist.*** The hand strikes one creature or object within 5 feet of it. Make a melee spell attack for the hand using your game statistics. On a hit, the target takes 4d8 force damage.",
   "***Forceful Hand.*** The hand attempts to push a creature within 5 feet of it in a direction you choose. Make a check with the hand's Strength contested by the Strength (Athletics) check of the target. If the target is Medium or smaller, you have advantage on the check. If you succeed, the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target to remain within 5 feet of it.",
   "***Grasping Hand.*** The hand attempts to grapple a Huge or smaller creature within 5 feet of it. You use the hand's Strength score to resolve the grapple. If the target is Medium or smaller, you have advantage on the check. While the hand is grappling the target, you can use a bonus action to have the hand crush it. When you do so, the target takes bludgeoning damage equal to 2d6 + your spellcasting ability modifier.",
   "***Interposing Hand.*** The hand interposes itself between you and a creature you choose until you give the hand a different command. The hand moves to stay between you and the target, providing you with half cover against the target. The target can't move through the hand's space if its Strength score is less than or equal to the hand's Strength score. If its Strength score is higher than the hand's Strength score, the target can move toward you through the hand's space, but that space is difficult terrain for the target."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the damage from the clenched fist option increases by 2d8 and the damage from the grasping hand increases by 2d6 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, С, М (An agate worth at least 1,000 gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "druid"
  ],
  "desc": [
   "After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant. The target must have either no Intelligence score or an Intelligence of 3 or less. The target gains an Intelligence of 10. The target also gains the ability to speak one language you know. If the target is a plant, it gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. Your GM chooses statistics appropriate for the awakened plant, such as the statistics for the awakened shrub or the awakened tree.",
   "The awakened beast or plant is charmed by you for 30 days or until you or your companions do anything harmful to it. When the charmed condition ends, the awakened creature chooses whether to remain friendly to you, based on how you treated it while it was charmed."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (An item distasteful to the target.)",
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
   "You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a charisma saving throw or be banished.",
   "If the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.",
   "If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has passed, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. Otherwise, the target doesn't return."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th."
  ],
  "translated": false,
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
  "components": "В, С, М (A piece of tentacle from a giant octopus or a giant squid)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in the area into difficult terrain.",
   "When a creature enters the affected area for the first time on a turn or starts its turn there, the creature must succeed on a Dexterity saving throw or take 3d6 bludgeoning damage and be restrained by the tentacles until the spell ends. A creature that starts its turn in the area and is already restrained by the tentacles takes 3d6 bludgeoning damage.",
   "A creature restrained by the tentacles can use its action to make a Strength or Dexterity check (its choice) against your spell save DC. On a success, it frees itself."
  ],
  "higher": [],
  "translated": false,
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
   "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain.",
   "When a creature enters the wall's area for the first time on a turn or starts its turn there, the creature must make a dexterity saving throw. On a failed save, the creature takes 6d10 slashing damage. On a successful save, the creature takes half as much damage."
  ],
  "higher": [],
  "translated": false,
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
   "Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it. The target must make a constitution saving throw. The target takes 8d8 necrotic damage on a failed save, or half as much damage on a successful one. The spell has no effect on undead or constructs.",
   "If you target a plant creature or a magical plant, it makes the saving throw with disadvantage, and the spell deals maximum damage to it.",
   "If you target a nonmagical plant that isn't a creature, such as a tree or shrub, it doesn't make a saving throw; it simply withers and dies."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level of higher, the damage increases by 1d8 for each slot level above 4th."
  ],
  "translated": false,
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
  "components": "В, С, М (A bit of fur; a piece of amber, glass, or a crystal rod; and three silver pins.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts.",
   "A target must make a dexterity saving throw. The target takes 10d8 lightning damage on a failed save, or half as much damage on a successful one."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th."
  ],
  "translated": false,
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
  "components": "В, С, М (The powder of a crushed black pearl worth at least 500 gp.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "warlock",
   "wizard"
  ],
  "desc": [
   "A sphere of negative energy ripples out in a 60-foot radius sphere from a point within range. Each creature in that area must make a constitution saving throw. A target takes 8d6 necrotic damage on a failed save, or half as much damage on a successful one."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 2d6 for each slot level above 6th."
  ],
  "translated": false,
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
   "You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured.",
   "When a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a constitution saving throw. The creature takes 5d8 poison damage on a failed save, or half as much damage on a successful one. Creatures are affected even if they hold their breath or don't need to breathe.",
   "The fog moves 10 feet away from you at the start of each of your turns, rolling along the surface of the ground. The vapors, being heavier than air, sink to the lowest level of the land, even pouring down openings."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, С, М (Incense and a vial of holy or unholy water.)",
  "duration": "1 минута",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question.",
   "Divine beings aren't necessarily omniscient, so you might receive \"unclear\" as an answer if a question pertains to information that lies beyond the deity's knowledge. In a case where a one-word answer could be misleading or contrary to the deity's interests, the GM might offer a short phrase as an answer instead.",
   "If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer. The GM makes this roll in secret."
  ],
  "higher": [],
  "translated": false,
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
   "You briefly become one with nature and gain knowledge of the surrounding territory. In the outdoors, the spell gives you knowledge of the land within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn't function where nature has been replaced by construction, such as in dungeons and towns.",
   "You instantly gain knowledge of up to three facts of your choice about any of the following subjects as they relate to the area:",
   "- terrain and bodies of water",
   "- prevalent plants, minerals, animals, or peoples",
   "- powerful celestials, fey, fiends, elementals, or undead",
   "- influence from other planes of existence",
   "- buildings",
   "For example, you could determine the location of powerful undead in the area, the location of major sources of safe drinking water, and the location of any nearby towns."
  ],
  "higher": [],
  "translated": false,
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
   "Creatures of your choice that you can see within range and that can hear you must make a wisdom saving throw. A target automatically succeeds on this saving throw if it can't be charmed. On a failed save, a target is affected by this spell. Until the spell ends, you can use a bonus action on each of your turns to designate a direction that is horizontal to you. Each affected target must use as much of its movement as possible to move in that direction on its next turn. It can take any action before it moves. After moving in this way, it can make another Wisdom save to try to end the effect.",
   "A target isn't compelled to move into an obviously deadly hazard, such as a fire or a pit, but it will provoke opportunity attacks to move in the designated direction."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A small crystal or glass cone.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one.",
   "A creature killed by this spell becomes a frozen statue until it thaws."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, С, М (Three walnut shells.)",
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
   "This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled action. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it.",
   "An affected target can't take reactions and must roll a d10 at the start of each of its turns to determine its behavior for that turn.",
   "| d10 | Behavior |",
   "|---|---|",
   "| 1 | The creature uses all its movement to move in a random direction. To determine the direction, roll a d8 and assign a direction to each die face. The creature doesn't take an action this turn. |",
   "| 2-6 | The creature doesn't move or take actions this turn. |",
   "| 7-8 | The creature uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn. |",
   "| 9-10 | The creature can act and move normally. |",
   "At the end of each of its turns, an affected target can make a Wisdom saving throw. If it succeeds, this effect ends for that target."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th."
  ],
  "translated": false,
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
  "components": "В, С, М (Burning incense for air, soft clay for earth, sulfur and phosphorus for fire, or water and sand for water.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "wizard"
  ],
  "desc": [
   "You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range. An elemental of challenge rating 5 or lower appropriate to the area you chose appears in an unoccupied space within 10 feet of it. For example, a fire elemental emerges from a bonfire, and an earth elemental rises up from the ground. The elemental disappears when it drops to 0 hit points or when the spell ends.",
   "The elemental is friendly to you and your companions for the duration. Roll initiative for the elemental, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you). If you don't issue any commands to the elemental, it defends itself from hostile creatures but otherwise takes no actions.",
   "If your concentration is broken, the elemental doesn't disappear. Instead, you lose control of the elemental, it becomes hostile toward you and your companions, and it might attack. An uncontrolled elemental can't be dismissed by you, and it disappears 1 hour after you summoned it.",
   "The GM has the elemental's statistics."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th."
  ],
  "translated": false,
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
   "You summon a fey creature of challenge rating 6 or lower, or a fey spirit that takes the form of a beast of challenge rating 6 or lower. It appears in an unoccupied space that you can see within range. The fey creature disappears when it drops to 0 hit points or when the spell ends.",
   "The fey creature is friendly to you and your companions for the duration. Roll initiative for the creature, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you), as long as they don't violate its alignment. If you don't issue any commands to the fey creature, it defends itself from hostile creatures but otherwise takes no actions.",
   "If your concentration is broken, the fey creature doesn't disappear. Instead, you lose control of the fey creature, it becomes hostile toward you and your companions, and it might attack. An uncontrolled fey creature can't be dismissed by you, and it disappears 1 hour after you summoned it.",
   "The GM has the fey creature's statistics."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the challenge rating increases by 1 for each slot level above 6th."
  ],
  "translated": false,
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
   "You summon elementals that appear in unoccupied spaces that you can see within range. You choose one the following options for what appears:",
   "- One elemental of challenge rating 2 or lower",
   "- Two elementals of challenge rating 1 or lower",
   "- Four elementals of challenge rating 1/2 or lower",
   "- Eight elementals of challenge rating 1/4 or lower.",
   "An elemental summoned by this spell disappears when it drops to 0 hit points or when the spell ends.",
   "The summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which has its own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions.",
   "The GM has the creatures' statistics."
  ],
  "higher": [
   "When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  ],
  "translated": false,
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
  "components": "В, С, М (One holly berry per creature summoned.)",
  "duration": "Концентрация, вплоть до 1 часа",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "ranger"
  ],
  "desc": [
   "You summon fey creatures that appear in unoccupied spaces that you can see within range. Choose one of the following options for what appears:",
   "- One fey creature of challenge rating 2 or lower",
   "- Two fey creatures of challenge rating 1 or lower",
   "- Four fey creatures of challenge rating 1/2 or lower",
   "- Eight fey creatures of challenge rating 1/4 or lower",
   "A summoned creature disappears when it drops to 0 hit points or when the spell ends.",
   "The summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which have their own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions.",
   "The GM has the creatures' statistics."
  ],
  "higher": [
   "When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  ],
  "translated": false,
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
   "You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane. Contacting this extraplanar intelligence can strain or even break your mind. When you cast this spell, make a DC 15 intelligence saving throw. On a failure, you take 6d6 psychic damage and are insane until you finish a long rest. While insane, you can't take actions, can't understand what other creatures say, can't read, and speak only in gibberish. A greater restoration spell cast on you ends this effect.",
   "On a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The GM answers each question with one word, such as \"yes,\" \"no,\" \"maybe,\" \"never,\" \"irrelevant,\" or \"unclear\" (if the entity doesn't know the answer to the question). If a one-word answer would be misleading, the GM might instead offer a short phrase as an answer."
  ],
  "higher": [],
  "translated": false,
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
   "Your touch inflicts disease. Make a melee spell attack against a creature within your reach. On a hit, you afflict the creature with a disease of your choice from any of the ones described below.",
   "At the end of each of the target's turns, it must make a constitution saving throw. After failing three of these saving throws, the disease's effects last for the duration, and the creature stops making these saves. After succeeding on three of these saving throws, the creature recovers from the disease, and the spell ends.",
   "Since this spell induces a natural disease in its target, any effect that removes a disease or otherwise ameliorates a disease's effects apply to it.",
   "***Blinding Sickness.*** Pain grips the creature's mind, and its eyes turn milky white. The creature has disadvantage on wisdom checks and wisdom saving throws and is blinded.",
   "***Filth Fever.*** A raging fever sweeps through the creature's body. The creature has disadvantage on strength checks, strength saving throws, and attack rolls that use Strength.",
   "***Flesh Rot.*** The creature's flesh decays. The creature has disadvantage on Charisma checks and vulnerability to all damage.",
   "***Mindfire.*** The creature's mind becomes feverish. The creature has disadvantage on intelligence checks and intelligence saving throws, and the creature behaves as if under the effects of the confusion spell during combat.",
   "***Seizure.*** The creature is overcome with shaking. The creature has disadvantage on dexterity checks, dexterity saving throws, and attack rolls that use Dexterity.",
   "***Slimy Doom.*** The creature begins to bleed uncontrollably. The creature has disadvantage on constitution checks and constitution saving throws. In addition, whenever the creature takes damage, it is stunned until the end of its next turn."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A statuette of yourself carved from ivory and decorated with gems worth at least 1,500 gp.)",
  "duration": "10 дней",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Choose a spell of 5th level or lower that you can cast, that has a casting time of 1 action, and that can target you. You cast that spell--called the contingent spell--as part of casting contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain circumstance occurs. You describe that circumstance when you cast the two spells. For example, a contingency cast with water breathing might stipulate that water breathing comes into effect when you are engulfed in water or a similar liquid.",
   "The contingent spell takes effect immediately after the circumstance is met for the first time, whether or not you want it to. and then contingency ends.",
   "The contingent spell takes effect only on you, even if it can normally target others. You can use only one contingency spell at a time. If you cast this spell again, the effect of another contingency spell on you ends. Also, contingency ends on you if its material component is ever not on your person."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A drop of water and a pinch of dust.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "Until the spell ends, you control any freestanding water inside an area you choose that is a cube up to 100 feet on a side. You can choose from any of the following effects when you cast this spell. As an action on your turn, you can repeat the same effect or choose a different one.",
   "***Flood.*** You cause the water level of all standing water in the area to rise by as much as 20 feet. If the area includes a shore, the flooding water spills over onto dry land.",
   "If you choose an area in a large body of water, you instead create a 20-foot tall wave that travels from one side of the area to the other and then crashes down. Any Huge or smaller vehicles in the wave's path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing.",
   "The water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of your next turn while the flood effect lasts.",
   "***Part Water.*** You cause water in the area to move apart and create a trench. The trench extends across the spell's area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until the normal water level is restored.",
   "***Redirect Flow.*** You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell's area, it resumes its flow based on the terrain conditions. The water continues to move in the direction you chose until the spell ends or you choose a different effect.",
   "***Whirlpool.*** This effect requires a body of water at least 50 feet square and 25 feet deep. You cause a whirlpool to form in the center of the area. The whirlpool forms a vortex that is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature or object in the water and within 25 feet of the vortex is pulled 10 feet toward it. A creature can swim away from the vortex by making a Strength (Athletics) check against your spell save DC.",
   "When a creature enters the vortex for the first time on a turn or starts its turn there, it must make a strength saving throw. On a failed save, the creature takes 2d8 bludgeoning damage and is caught in the vortex until the spell ends. On a successful save, the creature takes half damage, and isn't caught in the vortex. A creature caught in the vortex can use its action to try to swim away from the vortex as described above, but has disadvantage on the Strength (Athletics) check to do so.",
   "The first time each turn that an object enters the vortex, the object takes 2d8 bludgeoning damage; this damage occurs each round it remains in the vortex."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (One clay pot filled with grave dirt, one clay pot filled with brackish water, and one 150 gp black onyx stone for each corpse.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "warlock",
   "wizard"
  ],
  "desc": [
   "You can cast this spell only at night. Choose up to three corpses of Medium or Small humanoids within range. Each corpse becomes a ghoul under your control. (The GM has game statistics for these creatures.)",
   "As a bonus action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.",
   "The creature is under your control for 24 hours, after which it stops obeying any command you have given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell, rather than animating new ones."
  ],
  "higher": [
   "When you cast this spell using a 7th-level spell slot, you can animate or reassert control over four ghouls. When you cast this spell using an 8th-level spell slot, you can animate or reassert control over five ghouls or two ghasts or wights. When you cast this spell using a 9th-level spell slot, you can animate or reassert control over six ghouls, three ghasts or wights, or two mummies."
  ],
  "translated": false,
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
  "components": "В, С, М (A tiny piece of matter of the same type of the item you plan to create.)",
  "duration": "Особая",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range: soft goods, rope, wood, or something similar. You can also use this spell to create mineral objects such as stone, crystal, or metal. The object created must be no larger than a 5-foot cube, and the object must be of a form and material that you have seen before.",
   "The duration depends on the object's material. If the object is composed of multiple materials, use the shortest duration.",
   "| Material | Duration |",
   "|---|---|",
   "| Vegetable matter | 1 day |",
   "| Stone or crystal | 12 hours |",
   "| Precious metals | 1 hour |",
   "| Gems | 10 minutes |",
   "| Adamantine or mithral | 1 minute |",
   "Using any material created by this spell as another spell's material component causes that spell to fail."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the cube increases by 5 feet for each slot level above 5th."
  ],
  "translated": false,
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
   "You touch a creature and grant it a measure of protection from death.",
   "The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends.",
   "If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends."
  ],
  "higher": [],
  "translated": false,
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
   "You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as \"200 feet straight downward\" or \"upward to the northwest at a 45-degree angle, 300 feet.\"",
   "You can bring along objects as long as their weight doesn't exceed what you can carry. You can also bring one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell.",
   "If you would arrive in a place already occupied by an object or a creature, you and any creature traveling with you each take 4d6 force damage, and the spell fails to teleport you."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A lodestone and a pinch of dust.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force.",
   "A creature targeted by this spell must make a dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated.",
   "A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. The creature can be restored to life only by means of a true resurrection or a wish spell.",
   "This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If the target is a Huge or larger object or creation of force, this spell disintegrates a 10-foot-cube portion of it. A magic item is unaffected by this spell."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th."
  ],
  "translated": false,
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
  "components": "В, С, М (Holy water or powdered silver and iron.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "paladin"
  ],
  "desc": [
   "Shimmering energy surrounds and protects you from fey, undead, and creatures originating from beyond the Material Plane. For the duration, celestials, elementals, fey, fiends, and undead have disadvantage on attack rolls against you.",
   "You can end the spell early by using either of the following special functions.",
   "***Break Enchantment.*** As your action, you touch a creature you can reach that is charmed, frightened, or possessed by a celestial, an elemental, a fey, a fiend, or an undead. The creature you touch is no longer charmed, frightened, or possessed by such creatures.",
   "***Dismissal.*** As your action, make a melee spell attack against a celestial, an elemental, a fey, a fiend, or an undead you can reach. On a hit, you attempt to drive the creature back to its home plane. The creature must succeed on a charisma saving throw or be sent back to its home plane (if it isn't there already). If they aren't on their home plane, undead are sent to the Shadowfell, and fey are sent to the Feywild."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Incense and a sacrificial offering appropriate to your religion, together worth at least 25gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": true,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen.",
   "The spell doesn't take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion.",
   "If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The GM makes this roll in secret."
  ],
  "higher": [],
  "translated": false,
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
   "You attempt to beguile a creature that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",
   "While the creature is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.",
   "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well. Each time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends."
  ],
  "higher": [
   "When you cast this spell with a 9th level spell slot, the duration is concentration, up to 8 hours."
  ],
  "translated": false,
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
   "You attempt to beguile a humanoid that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",
   "While the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.",
   "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time you can also cause the creature to use a reaction, but this requires you to use your own reaction as well.",
   "Each time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends."
  ],
  "higher": [
   "When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 8th level or higher, the duration is concentration, up to 8 hours."
  ],
  "translated": false,
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
  "components": "В, С, М (A handful of sand, a dab of ink, and a writing quill plucked from a sleeping bird.)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "warlock",
   "wizard"
  ],
  "desc": [
   "This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don't sleep, such as elves, can't be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger.",
   "While in the trance, the messenger is aware of his or her surroundings, but can't take actions or move.",
   "If the target is asleep, the messenger appears in the target's dreams and can converse with the target as long as it remains asleep, through the duration of the spell. The messenger can also shape the environment of the dream, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the effect of the spell early. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it, and can either end the trance (and the spell) or wait for the target to fall asleep, at which point the messenger appears in the target's dreams.",
   "You can make the messenger appear monstrous and terrifying to the target. If you do, the messenger can deliver a message of no more than ten words and then the target must make a wisdom saving throw. On a failed save, echoes of the phantasmal monstrosity spawn a nightmare that lasts the duration of the target's sleep and prevents the target from gaining any benefit from that rest. In addition, when the target wakes up, it takes 3d6 psychic damage.",
   "If you have a body part, lock of hair, clipping from a nail, or similar portion of the target's body, the target makes its saving throw with disadvantage."
  ],
  "higher": [],
  "translated": false,
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
   "For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can use your action to target another creature but can't target a creature again if it has succeeded on a saving throw against this casting of eyebite.",
   "***Asleep.*** The target falls unconscious. It wakes up if it takes any damage or if another creature uses its action to shake the sleeper awake.",
   "***Panicked.*** The target is frightened of you. On each of its turns, the frightened creature must take the Dash action and move away from you by the safest and shortest available route, unless there is nowhere to move. If the target moves to a place at least 60 feet away from you where it can no longer see you, this effect ends.",
   "***Sickened.*** The target has disadvantage on attack rolls and ability checks. At the end of each of its turns, it can make another wisdom saving throw. If it succeeds, the effect ends."
  ],
  "higher": [],
  "translated": false,
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
   "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, and clothes from flax or wool.",
   "Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot cube, or eight connected 5-foot cubes), given a sufficient quantity of raw material. If you are working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a single 5-foot cube). The quality of objects made by the spell is commensurate with the quality of the raw materials.",
   "Creatures or magic items can't be created or transmuted by this spell. You also can't use it to create items that ordinarily require a high degree of craftsmanship, such as jewelry, weapons, glass, or armor, unless you have proficiency with the type of artisan's tools used to craft such objects."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A tiny silver whistle, a piece of bone, and a thread)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You conjure a phantom watchdog in an unoccupied space that you can see within range, where it remains for the duration, until you dismiss it as an action, or until you move more than 100 feet away from it.",
   "The hound is invisible to all creatures except you and can't be harmed. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound sees invisible creatures and can see into the Ethereal Plane. It ignores illusions.",
   "At the start of each of your turns, the hound attempts to bite one creature within 5 feet of it that is hostile to you. The hound's attack bonus is equal to your spellcasting ability modifier + your proficiency bonus. On a hit, it deals 4d8 piercing damage."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A set of divinatory tools--such as bones, ivory sticks, cards, teeth, or carved runes--worth 100gp and an object from the location you wish to find.)",
  "duration": "Концентрация, вплоть до 24 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence. If you name a destination on another plane of existence, a destination that moves (such as a mobile fortress), or a destination that isn't specific (such as \"a green dragon's lair\"), the spell fails.",
   "For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. While you are traveling there, whenever you are presented with a choice of paths along the way, you automatically determine which path is the shortest and most direct route (but not necessarily the safest route) to the destination."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A little phosphorus or a firefly.)",
  "duration": "10 минут",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Thin and vaporous flame surround your body for the duration of the spell, radiating a bright light bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell using an action to make it disappear.",
   "The flames are around you a heat shield or cold, your choice. The heat shield gives you cold damage resistance and the cold resistance to fire damage.",
   "In addition, whenever a creature within 5 feet of you hits you with a melee attack, flames spring from the shield. The attacker then suffers 2d8 points of fire damage or cold, depending on the model."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Pinch of sulfur.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "A vertical column of divine fire roars down from the heavens in a location you specify. Each creature in a 10-foot-radius, 40-foot-high cylinder centered on a point within range must make a dexterity saving throw. A creature takes 4d6 fire damage and 4d6 radiant damage on a failed save, or half as much damage on a successful one."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the fire damage or the radiant damage (your choice) increases by 1d6 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, С, М (A pinch of lime, water, and earth.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "warlock",
   "wizard"
  ],
  "desc": [
   "You attempt to turn one creature that you can see within range into stone. If the target's body is made of flesh, the creature must make a constitution saving throw. On a failed save, it is restrained as its flesh begins to harden. On a successful save, the creature isn't affected.",
   "A creature restrained by this spell must make another constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and subjected to the petrified condition for the duration. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind.",
   "If the creature is physically broken while petrified, it suffers from similar deformities if it reverts to its original state.",
   "If you maintain your concentration on this spell for the entire possible duration, the creature is turned to stone until the effect is removed."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A sprinkling of holy water, rare incense, and powdered ruby worth at least 1,000 gp.)",
  "duration": "24 часа",
  "ritual": true,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, Ethereal Plane, Feywild, Shadowfell, or the plane shift spell.",
   "In addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: celestials, elementals, fey, fiends, and undead. When a chosen creature enters the spell's area for the first time on a turn or starts its turn there, the creature takes 5d10 radiant or necrotic damage (your choice when you cast this spell).",
   "When you cast this spell, you can designate a password. A creature that speaks the password as it enters the area takes no damage from the spell.",
   "The spell's area can't overlap with the area of another forbiddance spell. If you cast forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the material components are consumed on the last casting."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A leather strap, bound around the arm or a similar appendage.)",
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
   "You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's speed nor cause the target to be paralyzed or restrained.",
   "The target can also spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature that has it grappled. Finally, being underwater imposes no penalties on the target's movement or attacks."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A small crystal sphere.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "A frigid globe of cold energy streaks from your fingertips to a point of your choice within range, where it explodes in a 60-foot-radius sphere. Each creature within the area must make a constitution saving throw. On a failed save, a creature takes 10d6 cold damage. On a successful save, it takes half as much damage.",
   "If the globe strikes a body of water or a liquid that is principally water (not including water-based creatures), it freezes the liquid to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice. A trapped creature can use an action to make a Strength check against your spell save DC to break free.",
   "You can refrain from firing the globe after completing the spell, if you wish. A small globe about the size of a sling stone, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling's normal range). It shatters on impact, with the same effect as the normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn't already shattered, it explodes."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 1d6 for each slot level above 6th."
  ],
  "translated": false,
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
   "You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide. If the creature can understand you, it must succeed on a wisdom saving throw or become charmed by you for the duration. While the creature is charmed by you, it takes 5d10 psychic damage each time it acts in a manner directly counter to your instructions, but no more than once each day. A creature that can't understand you is unaffected by the spell.",
   "You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends.",
   "You can end the spell early by using an action to dismiss it. A remove curse, greater restoration, or wish spell also ends it."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th or 8th level, the duration is 1 year. When you cast this spell using a spell slot of 9th level, the spell lasts until it is ended by one of the spells mentioned above."
  ],
  "translated": false,
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
   "You transform up to ten centipedes, three spiders, five wasps, or one scorpion within range into giant versions of their natural forms for the duration. A centipede becomes a giant centipede, a spider becomes a giant spider, a wasp becomes a giant wasp, and a scorpion becomes a giant scorpion.",
   "Each creature obeys your verbal commands, and in combat, they act on your turn each round. The GM has the statistics for these creatures and resolves their actions and movement.",
   "A creature remains in its giant size for the duration, until it drops to 0 hit points, or until you use an action to dismiss the effect on it.",
   "The GM might allow you to choose different targets. For example, if you transform a bee, its giant version might have the same statistics as a giant wasp."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A glass or crystal bead that shatters when the spell ends.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration.",
   "Any spell of 5th level or lower cast from outside the barrier can't affect creatures or objects within it, even if the spell is cast using a higher level spell slot. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from the areas affected by such spells."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the barrier blocks spells of one level higher for each slot level above 6th."
  ],
  "translated": false,
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
   "You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Diamond dust worth at least 100gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "druid"
  ],
  "desc": [
   "You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target:",
   "- One effect that charmed or petrified the target",
   "- One curse, including the target's attunement to a cursed magic item",
   "- Any reduction to one of the target's ability scores",
   "- One effect reducing the target's hit point maximum"
  ],
  "higher": [],
  "translated": false,
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
   "A Large spectral guardian appears and hovers for the duration in an unoccupied space of your choice that you can see within range. The guardian occupies that space and is indistinct except for a gleaming sword and shield emblazoned with the symbol of your deity.",
   "Any creature hostile to you that moves to a space within 10 feet of the guardian for the first time on a turn must succeed on a dexterity saving throw. The creature takes 20 radiant damage on a failed save, or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Burning incense, a small measure of brimstone and oil, a knotted string, a small amount of umber hulk blood, and a small silver rod worth at least 10 gp.)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "You create a ward that protects up to 2,500 square feet of floor space (an area 50 feet square, or one hundred 5-foot squares or twenty-five 10-foot squares). The warded area can be up to 20 feet tall, and shaped as you desire. You can ward several stories of a stronghold by dividing the area among them, as long as you can walk into each contiguous area while you are casting the spell.",
   "When you cast this spell, you can specify individuals that are unaffected by any or all of the effects that you choose. You can also specify a password that, when spoken aloud, makes the speaker immune to these effects.",
   "Guards and wards creates the following effects within the warded area.",
   "***Corridors.*** Fog fills all the warded corridors, making them heavily obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you will believe it is going in the opposite direction from the one it chooses.",
   "***Doors.*** All doors in the warded area are magically locked, as if sealed by an arcane lock spell. In addition, you can cover up to ten doors with an illusion (equivalent to the illusory object function of the minor illusion spell) to make them appear as plain sections of wall.",
   "***Stairs.*** Webs fill all stairs in the warded area from top to bottom, as the web spell. These strands regrow in 10 minutes if they are burned or torn away while guards and wards lasts.",
   "***Other Spell Effect.*** You can place your choice of one of the following magical effects within the warded area of the stronghold.",
   "- Place dancing lights in four corridors. You can designate a simple program that the lights repeat as long as guards and wards lasts.",
   "- Place magic mouth in two locations.",
   "- Place stinking cloud in two locations. The vapors appear in the places you designate; they return within 10 minutes if dispersed by wind while guards and wards lasts.",
   "- Place a constant gust of wind in one corridor or room.",
   "- Place a suggestion in one location. You select an area of up to 5 feet square, and any creature that enters or passes through the area receives the suggestion mentally.",
   "The whole warded area radiates magic. A dispel magic cast on a specific effect, if successful, removes only that effect.",
   "You can create a permanently guarded and warded structure by casting this spell there every day for one year."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Herbs, oils, and incense worth at least 1,000 gp, which the spell consumes.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric"
  ],
  "desc": [
   "You touch a point and infuse an area around it with holy (or unholy) power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect a hallow spell. The affected area is subject to the following effects.",
   "First, celestials, elementals, fey, fiends, and undead can't enter the area, nor can such creatures charm, frighten, or possess creatures within it. Any creature charmed, frightened, or possessed by such a creature is no longer charmed, frightened, or possessed upon entering the area. You can exclude one or more of those types of creatures from this effect.",
   "Second, you can bind an extra effect to the area. Choose the effect from the following list, or choose an effect offered by the GM. Some of these effects apply to creatures in the area; you can designate whether the effect applies to all creatures, creatures that follow a specific deity or leader, or creatures of a specific sort, such as ores or trolls. When a creature that would be affected enters the spell's area for the first time on a turn or starts its turn there, it can make a charisma saving throw. On a success, the creature ignores the extra effect until it leaves the area.",
   "***Courage.*** Affected creatures can't be frightened while in the area.",
   "***Darkness.*** Darkness fills the area. Normal light, as well as magical light created by spells of a lower level than the slot you used to cast this spell, can't illuminate the area.",
   "***Daylight.*** Bright light fills the area. Magical darkness created by spells of a lower level than the slot you used to cast this spell can't extinguish the light.",
   "***Energy Protection.*** Affected creatures in the area have resistance to one damage type of your choice, except for bludgeoning, piercing, or slashing.",
   "***Energy Vulnerability.*** Affected creatures in the area have vulnerability to one damage type of your choice, except for bludgeoning, piercing, or slashing.",
   "***Everlasting Rest.*** Dead bodies interred in the area can't be turned into undead.",
   "***Extradimensional Interference.*** Affected creatures can't move or travel using teleportation or by extradimensional or interplanar means.",
   "***Fear.*** Affected creatures are frightened while in the area.",
   "***Silence.*** No sound can emanate from within the area, and no sound can reach into it.",
   "***Tongues.*** Affected creatures can communicate with any other creature in the area, even if they don't share a common language."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A stone, a twig, and a bit of green plant.)",
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
   "You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed in appearance.",
   "The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to see through the illusion. If the difference isn't obvious by touch, a creature carefully examining the illusion can attempt an Intelligence (Investigation) check against your spell save DC to disbelieve it. A creature who discerns the illusion for what it is, sees it as a vague image superimposed on the terrain."
  ],
  "higher": [],
  "translated": false,
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
   "You unleash a virulent disease on a creature that you can see within range. The target must make a constitution saving throw. On a failed save, it takes 14d6 necrotic damage, or half as much damage on a successful save. The damage can't reduce the target's hit points below 1. If the target fails the saving throw, its hit point maximum is reduced for 1 hour by an amount equal to the necrotic damage it took. Any effect that removes a disease allows a creature's hit point maximum to return to normal before that time passes."
  ],
  "higher": [],
  "translated": false,
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
   "Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points. This spell also ends blindness, deafness, and any diseases affecting the target. This spell has no effect on constructs or undead."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the amount of healing increases by 10 for each slot level above 6th."
  ],
  "translated": false,
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
  "components": "В, С, М (A gem-encrusted bowl worth at least 1,000gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid"
  ],
  "desc": [
   "You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve other creatures can partake of the feast.",
   "A creature that partakes of the feast gains several benefits. The creature is cured of all diseases and poison, becomes immune to poison and being frightened, and makes all wisdom saving throws with advantage. Its hit point maximum also increases by 2d10, and it gains the same number of hit points. These benefits last for 24 hours."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A small piece of iron.)",
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
   "Choose a creature you can see and reach. The target must make a saving throw of Wisdom or be paralyzed for the duration of the spell. This spell has no effect against the undead. At the end of each round, the target can make a new saving throw of Wisdom. If successful, the spell ends for the creature."
  ],
  "higher": [
   "When you cast this spell using a level 6 or higher location, you can target an additional creature for each level of location beyond the fifth. The creatures must be within 30 feet o f each other when you target them."
  ],
  "translated": false,
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
  "components": "В, С, М (A pinch of dust and a few drops of water.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a dexterity saving throw. A creature takes 2d8 bludgeoning damage and 4d6 cold damage on a failed save, or half as much damage on a successful one.",
   "Hailstones turn the storm's area of effect into difficult terrain until the end of your next turn."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, the bludgeoning damage increases by 1d8 for each slot level above 4th."
  ],
  "translated": false,
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
  "components": "В, С, М (A few grains of sugar, some kernels of grain, and a smear of fat.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "cleric",
   "druid",
   "sorcerer"
  ],
  "desc": [
   "Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain.",
   "When the area appears, each creature in it must make a constitution saving throw. A creature takes 4d10 piercing damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d10 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, С, М (A sapphire worth 1,000 gp.)",
  "duration": "Пока не рассеется",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You touch an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an invisible mark on its surface and invisibly inscribes the name of the item on the sapphire you use as the material component. Each time you cast this spell, you must use a different sapphire.",
   "At any time thereafter, you can use your action to speak the item's name and crush the sapphire. The item instantly appears in your hand regardless of physical or planar distances, and the spell ends.",
   "If another creature is holding or carrying the item, crushing the sapphire doesn't transport the item to you, but instead you learn who the creature possessing the object is and roughly where that creature is located at that moment.",
   "Dispel magic or a similar effect successfully applied to the sapphire ends this spell's effect."
  ],
  "higher": [],
  "translated": false,
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
   "Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration. Creatures that can't be charmed are immune to this spell.",
   "A dancing creature must use all its movement to dance without leaving its space and has disadvantage on dexterity saving throws and attack rolls. While the target is affected by this spell, other creatures have advantage on attack rolls against it. As an action, a dancing creature makes a wisdom saving throw to regain control of itself. On a successful save, the spell ends."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Incense worth at least 250 gp, which the spell consumes, and four ivory strips worth at least 50 gp each.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "wizard"
  ],
  "desc": [
   "Name or describe a person, place, or object. The spell brings to your mind a brief summary of the significant lore about the thing you named. The lore might consist of current tales, forgotten stories, or even secret lore that has never been widely known. If the thing you named isn't of legendary importance, you gain no information. The more information you already have about the thing, the more precise and detailed the information you receive is.",
   "The information you learn is accurate but might be couched in figurative language. For example, if you have a mysterious magic axe on hand the spell might yield this information: \"Woe to the evildoer whose hand touches the axe, for even the haft slices the hand of the evil ones. Only a true Child of Stone, lover and beloved of Moradin, may awaken the true powers of the axe, and only with the sacred word *Rudnogg* on the lips.\""
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A bit of fur from a bloodhound.)",
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
   "Describe or name a creature that is familiar to you. You sense the direction to the creature's location, as long as that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement.",
   "The spell can locate a specific creature known to you, or the nearest creature of a specific kind (such as a human or a unicorn), so long as you have seen such a creature up close--within 30 feet--at least once. If the creature you described or named is in a different form, such as being under the effects of a polymorph spell, this spell doesn't locate the creature.",
   "This spell can't locate a creature if running water at least 10 feet wide blocks a direct path between you and the creature."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A gem, crystal, reliquary, or some other ornamental container worth at least 500 gp.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. You can't move or use reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a humanoids body.",
   "You can attempt to possess any humanoid within 100 feet of you that you can see (creatures warded by a protection from evil and good or magic circle spell can't be possessed). The target must make a charisma saving throw. On a failure, your soul moves into the target's body, and the target's soul becomes trapped in the container. On a success, the target resists your efforts to possess it, and you can't attempt to possess it again for 24 hours.",
   "Once you possess a creature's body, you control it. Your game statistics are replaced by the statistics of the creature, though you retain your alignment and your Intelligence, Wisdom, and Charisma scores. You retain the benefit of your own class features. If the target has any class levels, you can't use any of its class features.",
   "Meanwhile, the possessed creature's soul can perceive from the container using its own senses, but it can't move or take actions at all.",
   "While possessing a body, you can use your action to return from the host body to the container if it is within 100 feet of you, returning the host creature's soul to its body. If the host body dies while you're in it, the creature dies, and you must make a charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die.",
   "If the container is destroyed or the spell ends, your soul immediately returns to your body. If your body is more than 100 feet away from you or if your body is dead when you attempt to return to it, you die. If another creature's soul is in the container when it is destroyed, the creature's soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies.",
   "When the spell ends, the container is destroyed."
  ],
  "higher": [],
  "translated": false,
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
   "A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th."
  ],
  "translated": false,
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
  "components": "В, М (A snake's tongue and either a bit of honeycomb or a drop of sweet oil.)",
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
   "You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act automatically negates the effect of the spell.",
   "Each target must make a wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do.",
   "You can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a group of soldiers give all their money to the first beggar they meet. If the condition isn't met before the spell ends, the activity isn't performed.",
   "If you or any of your companions damage a creature affected by this spell, the spell ends for that creature."
  ],
  "higher": [
   "When you cast this spell using a 7th-level spell slot, the duration is 10 days. When you use an 8th-level spell slot, the duration is 30 days. When you use a 9th-level spell slot, the duration is a year and a day."
  ],
  "translated": false,
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
   "You become invisible at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends if you attack or cast a spell.",
   "You can use your action to move your illusory double up to twice your speed and make it gesture, speak, and behave in whatever way you choose.",
   "You can see through its eyes and hear through its ears as if you were located where it is. On each of your turns as a bonus action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are blinded and deafened in regard to your own surroundings."
  ],
  "higher": [],
  "translated": false,
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
   "You attempt to reshape another creature's memories. One creature that you can see must make a wisdom saving throw. If you are fighting the creature, it has advantage on the saving throw. On a failed save, the target becomes charmed by you for the duration. The charmed target is incapacitated and unaware of its surroundings, though it can still hear you. If it takes any damage or is targeted by another spell, this spell ends, and none of the target's memories are modified.",
   "While this charm lasts, you can affect the target's memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity and exacting detail, change its memory of the details of the event, or create a memory of some other event.",
   "You must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you have finished describing the modified memories, the creature's memory isn't altered. Otherwise, the modified memories take hold when the spell ends.",
   "A modified memory doesn't necessarily affect how a creature behaves, particularly if the memory contradicts the creature's natural inclinations, alignment, or beliefs. An illogical modified memory, such as implanting a memory of how much the creature enjoyed dousing itself in acid, is dismissed, perhaps as a bad dream. The GM might deem a modified memory too nonsensical to affect a creature in a significant manner.",
   "A remove curse or greater restoration spell cast on the target restores the creature's true memory."
  ],
  "higher": [
   "If you cast this spell using a spell slot of 6th level or higher, you can alter the target's memories of an event that took place up to 7 days ago (6th level), 30 days ago (7th level), 1 year ago (8th level), or any time in the creature's past (9th level)."
  ],
  "translated": false,
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
  "components": "В, С, М (An iron blade and a small bag containing a mixture of soils--clay, loam, and sand.)",
  "duration": "Концентрация, вплоть до 2 часов",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can't exceed half the area's largest dimension. So, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square's elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete.",
   "At the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect.",
   "Because the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement.",
   "This spell can't manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse.",
   "Similarly, this spell doesn't directly affect plant growth. The moved earth carries any plants along with it."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A pinch of sesame seeds.)",
  "duration": "1 час",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface (such as a wall, a ceiling, or a floor) within range, and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it.",
   "When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell."
  ],
  "higher": [],
  "translated": false,
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
   "You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature. The target must make a wisdom saving throw. On a failed save, the target becomes frightened for the duration. At the start of each of the target's turns before the spell ends, the target must succeed on a wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th."
  ],
  "translated": false,
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
   "You beseech an otherworldly entity for aid. The being must be known to you: a god, a primordial, a demon prince, or some other being of cosmic power. That entity sends a celestial, an elemental, or a fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (GM's choice).",
   "When the creature appears, it is under no compulsion to behave in any particular way. You can ask the creature to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services.",
   "Payment can take a variety of forms. A celestial might require a sizable donation of gold or magic items to an allied temple, while a fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you.",
   "As a rule of thumb, a task that can be measured in minutes requires a payment worth 100 gp per minute. A task measured in hours requires 1,000 gp per hour. And a task measured in days (up to 10 days) requires 10,000 gp per day. The GM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal.",
   "After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you, if appropriate to the task and if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane.",
   "A creature enlisted to join your group counts as a member of it, receiving a full share of experience points awarded."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A jewel worth at least 1,000 gp, which the spell consumes.)",
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
   "With this spell, you attempt to bind a celestial, an elemental, a fey, or a fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of an inverted magic circle in order to keep it trapped while this spell is cast.) At the completion of the casting, the target must make a charisma saving throw. On a failed save, it is bound to serve you for the duration. If the creature was summoned or created by another spell, that spell's duration is extended to match the duration of this spell.",
   "A bound creature must follow your instructions to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. The creature obeys the letter of your instructions, but if the creature is hostile to you, it strives to twist your words to achieve its own objectives. If the creature carries out your instructions completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane of existence, it returns to the place where you bound it and remains there until the spell ends."
  ],
  "higher": [
   "When you cast this spell using a spell slot of a higher level, the duration increases to 10 days with a 6th-level slot, to 30 days with a 7th-level slot, to 180 days with an 8th-level slot, and to a year and a day with a 9th-level spell slot."
  ],
  "translated": false,
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
  "components": "В, С, М (A caterpillar cocoon.)",
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
   "This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a wisdom saving throw to avoid the effect. A shapechanger automatically succeeds on this saving throw.",
   "The transformation lasts for the duration, or until the target drops to 0 hit points or dies. The new form can be any beast whose challenge rating is equal to or less than the target's (or the target's level, if it doesn't have a challenge rating). The target's game statistics, including mental ability scores, are replaced by the statistics of the chosen beast. It retains its alignment and personality.",
   "The target assumes the hit points of its new form. When it reverts to its normal form, the creature returns to the number of hit points it had before it transformed. If it reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious.",
   "The creature is limited in the actions it can perform by the nature of its new form, and it can't speak, cast spells, or take any other action that requires hands or speech.",
   "The target's gear melds into the new form. The creature can't activate, use, wield, or otherwise benefit from any of its equipment."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A thin sheet of lead, a piece of opaque glass, a wad of cotton or cloth, and powdered chrysolite.)",
  "duration": "24 часа",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You make an area within range magically secure. The area is a cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration or until you use an action to dismiss it.",
   "When you cast the spell, you decide what sort of security the spell provides, choosing any or all of the following properties:",
   "- Sound can't pass through the barrier at the edge of the warded area.",
   "- The barrier of the warded area appears dark and foggy, preventing vision (including darkvision) through it.",
   "- Sensors created by divination spells can't appear inside the protected area or pass through the barrier at its perimeter.",
   "- Creatures in the area can't be targeted by divination spells.",
   "- Nothing can teleport into or out of the warded area.",
   "- Planar travel is blocked within the warded area.",
   "Casting this spell on the same spot every day for a year makes this effect permanent."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, you can increase the size of the cube by 100 feet for each slot level beyond 4th. Thus you could protect a cube that can be up to 200 feet on one side by using a spell slot of 5th level."
  ],
  "translated": false,
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
  "components": "В, С, М (A bit of fleece and jade dust worth at least 25 gp.)",
  "duration": "Пока не рассеется",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "wizard"
  ],
  "desc": [
   "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific condition occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes.",
   "When the condition you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes. After this time, the illusion can be activated again.",
   "The triggering condition can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door, or you could set the illusion to trigger only when a creature says the correct word or phrase.",
   "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A diamond worth at least 500gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "cleric",
   "paladin"
  ],
  "desc": [
   "You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 hit point.",
   "This spell also neutralizes any poisons and cures nonmagical diseases that affected the creature at the time it died. This spell doesn't, however, remove magical diseases, curses, or similar effects; if these aren't first removed prior to casting the spell, they take effect when the creature returns to life. The spell can't return an undead creature to life.",
   "This spell closes all mortal wounds, but it doesn't restore missing body parts. If the creature is lacking body parts or organs integral for its survival--its head, for instance--the spell automatically fails.",
   "Coming back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Rare oils and unguents worth at least 1,000 gp, which the spell consumes.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "You touch a dead humanoid or a piece of a dead humanoid. Provided that the creature has been dead no longer than 10 days, the spell forms a new adult body for it and then calls the soul to enter that body. If the target's soul isn't free or willing to do so, the spell fails.",
   "The magic fashions a new body for the creature to inhabit, which likely causes the creature's race to change. The GM rolls a d 100 and consults the following table to determine what form the creature takes when restored to life, or the GM chooses a form.",
   "| d100 | Race |",
   "|---|---|",
   "| 01-04 | Dragonborn |",
   "| 05-13 | Dwarf, hill |",
   "| 14-21 | Dwarf, mountain |",
   "| 22-25 | Elf, dark |",
   "| 26-34 | Elf, high |",
   "| 35-42 | Elf, wood |",
   "| 43-46 | Gnome, forest |",
   "| 47-52 | Gnome, rock |",
   "| 53-56 | Half-elf |",
   "| 57-60 | Half-orc |",
   "| 61-68 | Halfling, lightfoot |",
   "| 69-76 | Halfling, stout |",
   "| 77-96 | Human |",
   "| 97-00 | Tiefling |",
   "The reincarnated creature recalls its former life and experiences. It retains the capabilities it had in its original form, except it exchanges its original race for the new one and changes its racial traits accordingly."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A hemispherical piece of clear crystal and a matching hemispherical piece of gum arabic.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "A sphere of shimmering force encloses a creature or object of Large size or smaller within range. An unwilling creature must make a dexterity saving throw. On a failed save, the creature is enclosed for the duration.",
   "Nothing--not physical objects, energy, or other spell effects--can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it.",
   "The sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can use its action to push against the sphere's walls and thus roll the sphere at up to half the creature's speed. Similarly, the globe can be picked up and moved by other creatures.",
   "A disintegrate spell targeting the globe destroys it without harming anything inside it."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A focus worth at least 1,000 gp, such as a crystal ball, a silver mirror, or a font filled with holy water.)",
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
   "You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it. If a target knows you're casting this spell, it can fail the saving throw voluntarily if it wants to be observed.",
   "| Knowledge | Save Modifier |",
   "|---|---|",
   "| Secondhand (you have heard of the target) | +5 |",
   "| Firsthand (you have met the target) | +0 |",
   "| Familiar (you know the target well) | -5 |",
   "",
   "| Connection | Save Modifier |",
   "|---|---|",
   "| Likeness or picture | -2 |",
   "| Possession or garment | -4 |",
   "| Body part, lock of hair, bit of nail, or the like | -10 |",
   "On a successful save, the target isn't affected, and you can't use this spell against it again for 24 hours.",
   "On a failed save, the spell creates an invisible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. A creature that can see invisible objects sees the sensor as a luminous orb about the size of your fist.",
   "Instead of targeting a creature, you can choose a location you have seen before as the target of this spell. When you do, the sensor appears at that location and doesn't move."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (An exquisite chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth at least 5,000 gp, and a Tiny replica made from the same materials worth at least 50 gp.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You hide a chest, and all its contents, on the Ethereal Plane. You must touch the chest and the miniature replica that serves as a material component for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet).",
   "While the chest remains on the Ethereal Plane, you can use an action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by using an action and touching both the chest and the replica.",
   "After 60 days, there is a cumulative 5 percent chance per day that the spell's effect ends. This effect ends if you cast this spell again, if the smaller replica chest is destroyed, or if you choose to end the spell as an action. If the spell ends and the larger chest is on the Ethereal Plane, it is irretrievably lost."
  ],
  "higher": [],
  "translated": false,
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
   "This spell allows you to change the appearance of any number of creatures that you can see within range. You give each target you choose a new, illusory appearance. An unwilling target can make a charisma saving throw, and if it succeeds, it is unaffected by this spell.",
   "The spell disguises physical appearance as well as clothing, armor, weapons, and equipment. You can make each creature seem 1 foot shorter or taller and appear thin, fat, or in between. You can't change a target's body type, so you must choose a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you. The spell lasts for the duration, unless you use your action to dismiss it sooner.",
   "The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to a creature's outfit, objects pass through the hat, and anyone who touches it would feel nothing or would feel the creature's head and hair. If you use this spell to appear thinner than you are, the hand of someone who reaches out to touch you would bump into you while it was seemingly still in midair.",
   "A creature can use its action to inspect a target and make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Soft clay, to be crudely worked into the desired shape for the stone object.)",
  "duration": "Мгновенная",
  "ritual": false,
  "concentration": false,
  "classes": [
   "cleric",
   "druid",
   "wizard"
  ],
  "desc": [
   "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose. So, for example, you could shape a large rock into a weapon, idol, or coffer, or make a small passage through a wall, as long as the wall is less than 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Diamond dust worth 100 gp, which the spell consumes.)",
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
   "This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A magnifying glass.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line. Each creature in the line must make a constitution saving throw. On a failed save, a creature takes 6d8 radiant damage and is blinded until your next turn. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw.",
   "You can create a new line of radiance as your action on any turn until the spell ends.",
   "For the duration, a mote of brilliant radiance shines in your hand. It sheds bright light in a 30-foot radius and dim light for an additional 30 feet. This light is sunlight."
  ],
  "higher": [],
  "translated": false,
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
   "You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell, and as your action each round for the duration, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round, or choose a new one at any time. If you switch targets, the prior target is no longer affected by the spell.",
   "***Creature.*** You can try to move a Huge or smaller creature. Make an ability check with your spellcasting ability contested by the creature's Strength check. If you win the contest, you move the creature up to 30 feet in any direction, including upward but not beyond the range of this spell. Until the end of your next turn, the creature is restrained in your telekinetic grip. A creature lifted upward is suspended in mid-air.",
   "On subsequent rounds, you can use your action to attempt to maintain your telekinetic grip on the creature by repeating the contest.",
   "***Object.*** You can try to move an object that weighs up to 1,000 pounds. If the object isn't being worn or carried, you automatically move it up to 30 feet in any direction, but not beyond the range of this spell.",
   "If the object is worn or carried by a creature, you must make an ability check with your spellcasting ability contested by that creature's Strength check. If you succeed, you pull the object away from that creature and can move it up to 30 feet in any direction but not beyond the range of this spell.",
   "You can exert fine control on objects with your telekinetic grip, such as manipulating a simple tool, opening a door or a container, stowing or retrieving an item from an open container, or pouring the contents from a vial."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (Pieces of eggshell from two different kinds of creatures)",
  "duration": "1 час",
  "ritual": true,
  "concentration": false,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures with Intelligence scores of 2 or less aren't affected by this spell.",
   "Until the spell ends, the targets can communicate telepathically through the bond whether or not they have a common language. The communication is possible over any distance, though it can't extend to other planes of existence."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, М (Rare chalks and inks infused with precious gems with 50 gp, which the spell consumes.)",
  "duration": "1 раунд",
  "ritual": false,
  "concentration": false,
  "classes": [
   "bard",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "As you cast the spell, you draw a 10-foot-diameter circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied.",
   "Many major temples, guilds, and other important places have permanent teleportation circles inscribed somewhere within their confines. Each such circle includes a unique sigil sequence--a string of magical runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the GM. You can learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute.",
   "You can create a permanent teleportation circle by casting this spell in the same location every day for one year. You need not use the circle to teleport when you cast the spell in this way."
  ],
  "higher": [],
  "translated": false,
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
   "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."
  ],
  "higher": [],
  "translated": false,
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
   "You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet. Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and, as part of the move used to enter the tree, can either pass into one of those trees or step out of the tree you're in. You appear in a spot of your choice within 5 feet of the destination tree, using another 5 feet of movement. If you have no movement left, you appear within 5 feet of the tree you entered.",
   "You can use this transportation ability once per round for the duration. You must end each turn outside a tree."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (An ointment for the eyes that costs 25gp; is made from mushroom powder, saffron, and fat; and is consumed by the spell.)",
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
   "This spell gives the willing creature you touch the ability to see things as they actually are. For the duration, the creature has truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A small piece of phosphorus.)",
  "duration": "Концентрация, вплоть до 1 минуты",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration.",
   "When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 fire damage, or half as much damage on a successful save.",
   "One side of the wall, selected by you when you cast this spell, deals 5d8 fire damage to each creature that ends its turn within 10 feet o f that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage.",
   "The other side of the wall deals no damage."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th."
  ],
  "translated": false,
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
  "components": "В, С, М (A pinch of powder made by crushing a clear gemstone.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "An invisible wall of force springs into existence at a point you choose within range. The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. It can be free floating or resting on a solid surface. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. In any form, the wall is 1/4 inch thick. It lasts for the duration. If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (your choice which side).",
   "Nothing can physically pass through the wall. It is immune to all damage and can't be dispelled by dispel magic. A disintegrate spell destroys the wall instantly, however. The wall also extends into the Ethereal Plane, blocking ethereal travel through the wall."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A small piece of quartz.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "wizard"
  ],
  "desc": [
   "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration.",
   "If the wall cuts through a creature's space when it appears, the creature within its area is pushed to one side of the wall and must make a dexterity saving throw. On a failed save, the creature takes 10d6 cold damage, or half as much damage on a successful save.",
   "The wall is an object that can be damaged and thus breached. It has AC 12 and 30 hit points per 10-foot section, and it is vulnerable to fire damage. Reducing a 10-foot section of wall to 0 hit points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn must make a constitution saving throw. That creature takes 5d6 cold damage on a failed save, or half as much damage on a successful one."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, the damage the wall deals when it appears increases by 2d6, and the damage from passing through the sheet of frigid air increases by 1d6, for each slot level above 6th."
  ],
  "translated": false,
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
  "components": "В, С, М (A small block of granite.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid",
   "sorcerer",
   "wizard"
  ],
  "desc": [
   "A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with at least one other panel. Alternatively, you can create 10-foot-by-20-foot panels that are only 3 inches thick.",
   "If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (your choice). If a creature would be surrounded on all sides by the wall (or the wall and another solid surface), that creature can make a dexterity saving throw. On a success, it can use its reaction to move up to its speed so that it is no longer enclosed by the wall.",
   "The wall can have any shape you desire, though it can't occupy the same space as a creature or object. The wall doesn't need to be vertical or rest on any firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp.",
   "If you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create crenellations, battlements, and so on.",
   "The wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 hit points per inch of thickness. Reducing a panel to 0 hit points destroys it and might cause connected panels to collapse at the GM's discretion.",
   "If you maintain your concentration on this spell for its whole duration, the wall becomes permanent and can't be dispelled. Otherwise, the wall disappears when the spell ends."
  ],
  "higher": [],
  "translated": false,
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
  "components": "В, С, М (A handful of thorns.)",
  "duration": "Концентрация, вплоть до 10 минут",
  "ritual": false,
  "concentration": true,
  "classes": [
   "druid"
  ],
  "desc": [
   "You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.",
   "When the wall appears, each creature within its area must make a dexterity saving throw. On a failed save, a creature takes 7d8 piercing damage, or half as much damage on a successful save.",
   "A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters the wall on a turn or ends its turn there, the creature must make a dexterity saving throw. It takes 7d8 slashing damage on a failed save, or half as much damage on a successful one."
  ],
  "higher": [
   "When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th."
  ],
  "translated": false,
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
  "components": "В, С, М (Fire and holy water.)",
  "duration": "8 часов",
  "ritual": false,
  "concentration": false,
  "classes": [
   "druid"
  ],
  "desc": [
   "You and up to ten willing creatures you can see within range assume a gaseous form for the duration, appearing as wisps of cloud. While in this cloud form, a creature has a flying speed of 300 feet and has resistance to damage from nonmagical weapons. The only actions a creature can take in this form are the Dash action or to revert to its normal form. Reverting takes 1 minute, during which time a creature is incapacitated and can't move. Until the spell ends, a creature can revert to cloud form, which also requires the 1-minute transformation.",
   "If a creature is in cloud form and flying when the effect ends, the creature descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, the creature falls the remaining distance."
  ],
  "higher": [],
  "translated": false,
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
   "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect.",
   "You must designate a sanctuary by casting this spell within a location, such as a temple, dedicated to or strongly linked to your deity. If you attempt to cast the spell in this manner in an area that isn't dedicated to your deity, the spell has no effect."
  ],
  "higher": [],
  "translated": false,
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
