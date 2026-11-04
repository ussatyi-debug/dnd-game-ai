// Физика броска (cannon-es). Бросок просчитывается заранее, целиком, а затем
// проигрывается как запись: так можно узнать, какая грань окажется сверху, и разметить
// куб так, чтобы на ней было значение, выбранное движком.

import * as CANNON from "cannon-es";
import { createDieShape, rotate, upIndex, type DieKind, type DieShape, type Quat } from "./geometry";

export interface TrayBounds {
  halfWidth: number;
  halfDepth: number;
}

export interface DieTrack {
  shape: DieShape;
  /** Позиции по кадрам: x, y, z подряд. */
  positions: Float32Array;
  /** Повороты по кадрам: x, y, z, w подряд. */
  quaternions: Float32Array;
  /** Индекс верхней грани (для d4 — вершины) в конце броска. */
  up: number;
}

export interface Simulation {
  frames: number;
  dice: DieTrack[];
}

export const FRAME_RATE = 60;
const MAX_FRAMES = FRAME_RATE * 6;
const MIN_FRAMES = FRAME_RATE / 2;
const CEILING = 9;
/** Насколько ровно куб должен лежать, чтобы результат читался без сомнений. */
const MIN_ALIGNMENT = 0.97;
const MAX_ATTEMPTS = 6;

/** Просчитывает бросок; повторяет, если какой-то куб остался стоять на ребре. */
export function simulateThrow(kinds: DieKind[], bounds: TrayBounds): Simulation {
  let last: Simulation | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const simulation = runOnce(kinds, bounds);
    last = simulation;
    if (simulation.dice.every((d) => alignment(d) >= MIN_ALIGNMENT)) {
      return simulation;
    }
  }
  if (!last) {
    throw new Error("Бросок без кубов");
  }
  return last;
}

function finalQuat(track: DieTrack): Quat {
  const i = (track.quaternions.length / 4 - 1) * 4;
  return [
    track.quaternions[i] ?? 0,
    track.quaternions[i + 1] ?? 0,
    track.quaternions[i + 2] ?? 0,
    track.quaternions[i + 3] ?? 1,
  ];
}

/** 1 — куб лежит ровно на грани; меньше — наклонён. */
function alignment(track: DieTrack): number {
  const q = finalQuat(track);
  const ys = track.shape.normals.map((n) => rotate(q, n)[1]);
  return track.shape.kind === "d4" ? -Math.min(...ys) : Math.max(...ys);
}

function runOnce(kinds: DieKind[], bounds: TrayBounds): Simulation {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -60, 0) });
  world.allowSleep = true;

  const diceMaterial = new CANNON.Material("dice");
  const floorMaterial = new CANNON.Material("floor");
  const wallMaterial = new CANNON.Material("wall");
  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMaterial, floorMaterial, { friction: 0.35, restitution: 0.3 }),
  );
  // Упругие бортики отбрасывают кубы обратно к центру лотка.
  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMaterial, wallMaterial, { friction: 0.05, restitution: 0.75 }),
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMaterial, diceMaterial, { friction: 0.1, restitution: 0.35 }),
  );

  const { halfWidth: hw, halfDepth: hd } = bounds;
  // Плоскость cannon-es смотрит нормалью в +Z; поворачиваем её внутрь лотка.
  addPlane(world, floorMaterial, [0, 0, 0], [1, 0, 0], -Math.PI / 2); // пол
  addPlane(world, wallMaterial, [0, CEILING, 0], [1, 0, 0], Math.PI / 2); // потолок
  addPlane(world, wallMaterial, [-hw, 0, 0], [0, 1, 0], Math.PI / 2); // левая стенка
  addPlane(world, wallMaterial, [hw, 0, 0], [0, 1, 0], -Math.PI / 2); // правая стенка
  addPlane(world, wallMaterial, [0, 0, -hd], [0, 1, 0], 0); // дальняя стенка
  addPlane(world, wallMaterial, [0, 0, hd], [0, 1, 0], Math.PI); // ближняя стенка

  const columns = 3;
  const rows = Math.ceil(kinds.length / columns);
  const bodies = kinds.map((kind, index) => {
    const shape = createDieShape(kind);
    const body = new CANNON.Body({
      mass: 1,
      material: diceMaterial,
      shape: new CANNON.ConvexPolyhedron({
        vertices: shape.vertices.map((v) => new CANNON.Vec3(v[0], v[1], v[2])),
        faces: shape.faces,
      }),
      linearDamping: 0.1,
      angularDamping: 0.1,
      allowSleep: true,
      sleepSpeedLimit: 0.2,
      sleepTimeLimit: 0.25,
    });
    const column = index % columns;
    const row = Math.floor(index / columns);
    body.position.set(
      -hw + 1.1 + column * 1.7,
      3 + (index % 2) * 1.4,
      (row - (rows - 1) / 2) * 1.8 + (Math.random() - 0.5) * 0.4,
    );
    body.quaternion.setFromEuler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    );
    body.velocity.set(18 + Math.random() * 10, -6 - Math.random() * 4, (Math.random() - 0.5) * 18);
    body.angularVelocity.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
    );
    world.addBody(body);
    return { shape, body };
  });

  const positions = bodies.map(() => new Float32Array(MAX_FRAMES * 3));
  const quaternions = bodies.map(() => new Float32Array(MAX_FRAMES * 4));
  let frames = 0;

  for (; frames < MAX_FRAMES; frames++) {
    world.step(1 / FRAME_RATE);
    bodies.forEach(({ body }, i) => {
      const p = positions[i];
      const q = quaternions[i];
      if (!p || !q) return;
      p.set([body.position.x, body.position.y, body.position.z], frames * 3);
      q.set([body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w], frames * 4);
    });
    const asleep = bodies.every(({ body }) => body.sleepState === CANNON.Body.SLEEPING);
    if (asleep && frames >= MIN_FRAMES) {
      frames++;
      break;
    }
  }

  const dice = bodies.map(({ shape }, i) => {
    const track: DieTrack = {
      shape,
      positions: (positions[i] ?? new Float32Array(0)).slice(0, frames * 3),
      quaternions: (quaternions[i] ?? new Float32Array(0)).slice(0, frames * 4),
      up: 0,
    };
    track.up = upIndex(shape, finalQuat(track));
    return track;
  });

  return { frames, dice };
}

function addPlane(
  world: CANNON.World,
  material: CANNON.Material,
  position: [number, number, number],
  axis: [number, number, number],
  angle: number,
) {
  const body = new CANNON.Body({ mass: 0, material, shape: new CANNON.Plane() });
  body.position.set(position[0], position[1], position[2]);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(axis[0], axis[1], axis[2]), angle);
  world.addBody(body);
}
