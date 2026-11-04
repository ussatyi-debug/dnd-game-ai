// Геометрия игральных кубов: многогранники d4–d20, грани и их значения.
//
// Модуль не зависит от 3D-библиотек: вершины и грани используются и физикой (cannon-es),
// и отрисовкой (three.js). Грани строятся как выпуклая оболочка вершин, поэтому порядок
// вершин в каждой грани всегда против часовой стрелки при взгляде снаружи.

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

/** Вид куба. `d10_tens` — десятки процентного броска (00–90), пара к обычному d10. */
export type DieKind = "d4" | "d6" | "d8" | "d10" | "d10_tens" | "d12" | "d20";

export interface DieShape {
  kind: DieKind;
  /** Число граней с результатами (для d4 — вершин). */
  sides: number;
  vertices: Vec3[];
  /** Грани: индексы вершин против часовой стрелки снаружи. */
  faces: number[][];
  normals: Vec3[];
  centers: Vec3[];
  /**
   * Значения 1..sides: для d4 — по вершинам (результат — верхняя вершина),
   * для остальных — по граням (результат — верхняя грань).
   */
  values: number[];
}

const EPS = 1e-5;

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const normalize = (a: Vec3): Vec3 => scale(a, 1 / length(a));

function at<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new RangeError(`Индекс ${index} вне диапазона 0..${items.length - 1}`);
  }
  return item;
}

/** Грани выпуклой оболочки набора точек (все точки — вершины многогранника). */
export function convexHullFaces(vertices: Vec3[]): number[][] {
  const planes: { normal: Vec3; offset: number }[] = [];
  const faces: number[][] = [];
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const a = at(vertices, i);
        const raw = cross(sub(at(vertices, j), a), sub(at(vertices, k), a));
        if (length(raw) < EPS) continue;
        let normal = normalize(raw);
        let offset = dot(normal, a);
        const distances = vertices.map((v) => dot(normal, v) - offset);
        if (distances.every((d) => d <= EPS)) {
          // нормаль уже наружу
        } else if (distances.every((d) => d >= -EPS)) {
          normal = scale(normal, -1);
          offset = -offset;
        } else {
          continue;
        }
        if (planes.some((p) => dot(p.normal, normal) > 1 - EPS)) continue;
        planes.push({ normal, offset });

        const members: number[] = [];
        vertices.forEach((v, index) => {
          if (Math.abs(dot(normal, v) - offset) < EPS) members.push(index);
        });
        faces.push(orderCounterClockwise(vertices, members, normal));
      }
    }
  }
  return faces;
}

function orderCounterClockwise(vertices: Vec3[], members: number[], normal: Vec3): number[] {
  const center = centroid(members.map((i) => at(vertices, i)));
  const u = normalize(sub(at(vertices, at(members, 0)), center));
  const w = cross(normal, u);
  const angle = (i: number) => {
    const d = sub(at(vertices, i), center);
    return Math.atan2(dot(d, w), dot(d, u));
  };
  return [...members].sort((a, b) => angle(a) - angle(b));
}

export function centroid(points: Vec3[]): Vec3 {
  const sum = points.reduce<Vec3>((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  return scale(sum, 1 / points.length);
}

const PHI = (1 + Math.sqrt(5)) / 2;

function baseVertices(kind: DieKind): Vec3[] {
  switch (kind) {
    case "d4":
      return [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1],
      ];
    case "d6": {
      const out: Vec3[] = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x, y, z]);
      return out;
    }
    case "d8":
      return [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1],
      ];
    case "d10":
    case "d10_tens": {
      // Пятиугольный трапецоэдр. Высота вершин подобрана так, чтобы грани-«дельтоиды»
      // были плоскими: h = z0 · (1 + cos 36°) / (1 − cos 36°).
      const z0 = 0.105;
      const c = Math.cos(Math.PI / 5);
      const h = (z0 * (1 + c)) / (1 - c);
      const out: Vec3[] = [
        [0, h, 0],
        [0, -h, 0],
      ];
      for (let k = 0; k < 5; k++) {
        const up = (k * 2 * Math.PI) / 5;
        const down = up + Math.PI / 5;
        out.push([Math.cos(up), z0, Math.sin(up)]);
        out.push([Math.cos(down), -z0, Math.sin(down)]);
      }
      return out;
    }
    case "d12": {
      const out: Vec3[] = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x, y, z]);
      const a = 1 / PHI;
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          out.push([0, s1 * a, s2 * PHI]);
          out.push([s1 * a, s2 * PHI, 0]);
          out.push([s1 * PHI, 0, s2 * a]);
        }
      }
      return out;
    }
    case "d20": {
      const out: Vec3[] = [];
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          out.push([0, s1, s2 * PHI]);
          out.push([s1, s2 * PHI, 0]);
          out.push([s2 * PHI, 0, s1]);
        }
      }
      return out;
    }
  }
}

/** Размер кубов (радиус описанной сферы) — подобран для одинакового визуального размера. */
const SIZE: Record<DieKind, number> = {
  d4: 0.86,
  d6: 0.72,
  d8: 0.75,
  d10: 0.75,
  d10_tens: 0.75,
  d12: 0.76,
  d20: 0.8,
};

const SIDES: Record<DieKind, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d10_tens: 10,
  d12: 12,
  d20: 20,
};

/** Строит куб: вершины, грани, нормали и стандартную разметку значений. */
export function createDieShape(kind: DieKind): DieShape {
  const raw = baseVertices(kind);
  const radius = Math.max(...raw.map(length));
  const vertices = raw.map((v) => scale(v, SIZE[kind] / radius));
  const faces = convexHullFaces(vertices);
  const centers = faces.map((f) => centroid(f.map((i) => at(vertices, i))));
  const normals = faces.map((f) => {
    const a = at(vertices, at(f, 0));
    return normalize(cross(sub(at(vertices, at(f, 1)), a), sub(at(vertices, at(f, 2)), a)));
  });
  const sides = SIDES[kind];
  const values = kind === "d4" ? [1, 2, 3, 4] : oppositePairValues(normals);
  return { kind, sides, vertices, faces, normals, centers, values };
}

/** Значения граней так, чтобы противоположные в сумме давали n + 1 (как у настоящих кубов). */
function oppositePairValues(normals: Vec3[]): number[] {
  const n = normals.length;
  const values = new Array<number>(n).fill(0);
  let next = 1;
  for (let i = 0; i < n; i++) {
    if (values[i] !== 0) continue;
    let partner = -1;
    let best = Infinity;
    for (let j = 0; j < n; j++) {
      if (j === i || values[j] !== 0) continue;
      const d = dot(at(normals, i), at(normals, j));
      if (d < best) {
        best = d;
        partner = j;
      }
    }
    values[i] = next;
    if (partner >= 0) values[partner] = n + 1 - next;
    next++;
  }
  return values;
}

/** Подпись значения на грани. */
export function labelFor(kind: DieKind, value: number): string {
  if (kind === "d10") return value === 10 ? "0" : String(value);
  if (kind === "d10_tens") return value === 10 ? "00" : String(value * 10);
  return String(value);
}

/** Поворот вектора кватернионом [x, y, z, w]. */
export function rotate(q: Quat, v: Vec3): Vec3 {
  const [x, y, z, w] = q;
  const u: Vec3 = [x, y, z];
  const uv = cross(u, v);
  const uuv = cross(u, uv);
  return [
    v[0] + 2 * (w * uv[0] + uuv[0]),
    v[1] + 2 * (w * uv[1] + uuv[1]),
    v[2] + 2 * (w * uv[2] + uuv[2]),
  ];
}

/** Индекс элемента, который смотрит вверх: вершины для d4, грани для остальных. */
export function upIndex(shape: DieShape, orientation: Quat): number {
  const items = shape.kind === "d4" ? shape.vertices : shape.normals;
  let best = 0;
  let bestY = -Infinity;
  items.forEach((item, index) => {
    const y = rotate(orientation, item)[1];
    if (y > bestY) {
      bestY = y;
      best = index;
    }
  });
  return best;
}

/**
 * Разметка значений, при которой элемент `up` показывает `value`: значение меняется местами
 * с тем элементом, на котором оно было. Так результат броска задаёт движок, а не физика.
 */
export function valuesShowing(shape: DieShape, up: number, value: number): number[] {
  if (value < 1 || value > shape.sides) {
    throw new RangeError(`Значение ${value} невозможно на ${shape.kind}`);
  }
  const values = [...shape.values];
  const from = values.indexOf(value);
  const current = at(values, up);
  values[up] = value;
  values[from] = current;
  return values;
}

/** Значения граней d4: на каждой грани у каждого угла — значение этой вершины. */
export function d4CornerValues(shape: DieShape, values: number[], face: number): number[] {
  return at(shape.faces, face).map((vertex) => at(values, vertex));
}

/** Разложение результата d100 (1–100) на десятки и единицы для пары d10. */
export function splitPercentile(value: number): { tens: number; units: number } {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new RangeError(`Результат d100 должен быть от 1 до 100, получено ${value}`);
  }
  const tensDigit = Math.floor((value % 100) / 10); // 0..9, где 0 — «00»
  const unitsDigit = value % 10; // 0..9, где 0 — «0»
  return { tens: tensDigit === 0 ? 10 : tensDigit, units: unitsDigit === 0 ? 10 : unitsDigit };
}
