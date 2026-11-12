// Места начала своей кампании по предыстории героя (обсуждение 11.11.2026): игрок выбирает
// из 2–3 подходящих мест; локации — из карточек мира, место внутри — общими словами.

export interface StartPlace {
  id: string;
  /** Город или крепость — название карточки мира. */
  location: string;
  /** Место внутри: где герой в начале игры. */
  spot: string;
}

const P = (id: string, location: string, spot: string): StartPlace => ({ id, location, spot });

export const START_PLACES: Record<string, StartPlace[]> = {
  acolyte: [
    P("acolyte.neustadt", "Нойштадт", "собор у дворцовой площади"),
    P("acolyte.weidenburg", "Вольный город Вейденбург", "портовый храм, куда приносят утопленников"),
    P("acolyte.crow", "Цитадель Кроу-Рок", "часовня гарнизона"),
  ],
  artisan: [
    P("artisan.blackwater", "Черноводье", "кузни и литейные дворы"),
    P("artisan.weidenburg", "Вольный город Вейденбург", "ремесленный квартал у ювелирных лавок"),
    P("artisan.neustadt", "Нойштадт", "цеховой квартал"),
  ],
  charlatan: [
    P("charlatan.weidenburg", "Вольный город Вейденбург", "рыночная площадь"),
    P("charlatan.mirra", "Вольный Город Мирра", "базар у гавани"),
    P("charlatan.neustadt", "Нойштадт", "ярмарка у городских ворот"),
  ],
  criminal: [
    P("criminal.weidenburg", "Вольный город Вейденбург", "доки и портовое подполье"),
    P("criminal.neustadt", "Нойштадт", "трущобы у реки"),
    P("criminal.mirra", "Вольный Город Мирра", "контрабандные причалы"),
  ],
  entertainer: [
    P("entertainer.weidenburg", "Вольный город Вейденбург", "портовая таверна со сценой"),
    P("entertainer.mirra", "Вольный Город Мирра", "театр на набережной"),
    P("entertainer.neustadt", "Нойштадт", "площадь перед ратушей в праздничный день"),
  ],
  farmer: [
    P("farmer.crow", "Цитадель Кроу-Рок", "хутор на земле феода"),
    P("farmer.steel", "Замок «Стальной Утёс»", "деревня у подножия замка"),
    P("farmer.blackwater", "Черноводье", "фермы на окраине"),
  ],
  guard: [
    P("guard.weidenburg", "Вольный город Вейденбург", "караульня городской стражи у ратуши"),
    P("guard.neustadt", "Нойштадт", "стража у городских ворот"),
    P("guard.crow", "Цитадель Кроу-Рок", "стены цитадели"),
  ],
  guide: [
    P("guide.mines", "Копи Семи Слёз", "горные тропы к копям"),
    P("guide.steel", "Замок «Стальной Утёс»", "перевал под замком"),
    P("guide.crow", "Цитадель Кроу-Рок", "тракт к цитадели"),
  ],
  hermit: [
    P("hermit.mines", "Копи Семи Слёз", "хижина в холмах над копями"),
    P("hermit.steel", "Замок «Стальной Утёс»", "скит в скалах"),
    P("hermit.silver", "Серебряный Шпиль", "лесная часовня в землях княжества"),
  ],
  merchant: [
    P("merchant.weidenburg", "Вольный город Вейденбург", "торговая контора у пристаней"),
    P("merchant.mirra", "Вольный Город Мирра", "гавань в день прихода каравана"),
    P("merchant.blackwater", "Черноводье", "склады металла"),
  ],
  noble: [
    P("noble.neustadt", "Нойштадт", "дворцовый квартал"),
    P("noble.silver", "Серебряный Шпиль", "двор князя Альт-Вардена"),
    P("noble.weidenburg", "Вольный город Вейденбург", "особняк на холме"),
  ],
  sage: [
    P("sage.neustadt", "Нойштадт", "университетский архив"),
    P("sage.silver", "Серебряный Шпиль", "княжеская библиотека"),
    P("sage.weidenburg", "Вольный город Вейденбург", "гильдия картографов"),
  ],
  sailor: [
    P("sailor.weidenburg", "Вольный город Вейденбург", "порт в дельте Изара"),
    P("sailor.mirra", "Вольный Город Мирра", "гавань Архипелага"),
  ],
  scribe: [
    P("scribe.neustadt", "Нойштадт", "имперская канцелярия"),
    P("scribe.weidenburg", "Вольный город Вейденбург", "ратуша, зал писарей"),
    P("scribe.silver", "Серебряный Шпиль", "канцелярия княжества"),
  ],
  soldier: [
    P("soldier.neustadt", "Нойштадт", "казармы имперского гарнизона"),
    P("soldier.crow", "Цитадель Кроу-Рок", "гарнизон цитадели"),
    P("soldier.blackwater", "Черноводье", "застава на тракте"),
  ],
  wayfarer: [
    P("wayfarer.neustadt", "Нойштадт", "постоялый двор у ворот"),
    P("wayfarer.crow", "Цитадель Кроу-Рок", "трактир на тракте"),
    P("wayfarer.blackwater", "Черноводье", "ночлежка у моста"),
  ],
};

export function startPlaces(backgroundId: string | null): StartPlace[] {
  return (backgroundId && START_PLACES[backgroundId]) || [];
}

/** Тон начальных целей по мировоззрению (подсказка мастеру). */
export function alignmentTone(alignment: string): string {
  const a = alignment.toLowerCase();
  const order = a.includes("законопослуш") ? "долг, клятвы, порядок" : a.includes("хаотич") ? "свобода, личные счёты, риск" : "";
  const moral = a.includes("добр") ? "защита слабых, помощь" : a.includes("зл") ? "выгода, власть, месть" : "";
  const parts = [order, moral].filter(Boolean);
  return parts.length ? parts.join("; ") : "личные интересы и баланс";
}
