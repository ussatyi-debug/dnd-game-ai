// Все классы правил 2024 года.

import type { ClassData } from "../types";
import { BARD, CLERIC, DRUID, SORCERER, WARLOCK, WIZARD } from "./casters.ts";
import { PALADIN, RANGER } from "./half.ts";
import { BARBARIAN, FIGHTER, MONK, ROGUE } from "./martial.ts";

export { INVOCATIONS, METAMAGIC } from "./casters.ts";

export const CLASSES: ClassData[] = [BARBARIAN, BARD, CLERIC, DRUID, FIGHTER, MONK, PALADIN, RANGER, ROGUE, SORCERER, WARLOCK, WIZARD];

export const CLASS_BY_ID = new Map(CLASSES.map((c) => [c.id, c]));
