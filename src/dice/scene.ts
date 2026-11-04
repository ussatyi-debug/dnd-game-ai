// 3D-сцена лотка (three.js): стол, бортики, кубы с подписями граней и проигрывание броска.

import * as THREE from "three";
import {
  cross,
  d4CornerValues,
  dot,
  labelFor,
  normalize,
  sub,
  type DieKind,
  type DieShape,
  type Vec3,
} from "./geometry";
import { FRAME_RATE, type Simulation, type TrayBounds } from "./simulate";

const TEXTURE_SIZE = 256;
const HALF_DEPTH = 4.6;
const WALL_HEIGHT = 0.9;
const WALL_THICKNESS = 0.35;

interface DieStyle {
  body: string;
  ink: string;
}

const STYLES: Record<DieKind, DieStyle> = {
  d4: { body: "#7a1622", ink: "#f1d48a" },
  d6: { body: "#7a1622", ink: "#f1d48a" },
  d8: { body: "#7a1622", ink: "#f1d48a" },
  d10: { body: "#7a1622", ink: "#f1d48a" },
  d10_tens: { body: "#24161f", ink: "#f1d48a" },
  d12: { body: "#7a1622", ink: "#f1d48a" },
  d20: { body: "#7a1622", ink: "#f1d48a" },
};

export class DiceScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  private readonly walls = new THREE.Group();
  private readonly dice = new THREE.Group();
  private readonly resizeObserver: ResizeObserver;
  private bounds: TrayBounds = { halfWidth: HALF_DEPTH, halfDepth: HALF_DEPTH };
  private animation = 0;
  private disposed = false;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color("#120d12");
    this.scene.add(new THREE.HemisphereLight(0xfff1dc, 0x1a0e14, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(5, 16, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    this.scene.add(sun);

    const felt = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: "#3b1f2a", roughness: 0.95 }),
    );
    felt.rotation.x = -Math.PI / 2;
    felt.receiveShadow = true;
    this.scene.add(felt, this.walls, this.dice);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  /** Границы лотка для физики — совпадают с видимыми бортиками. */
  getBounds(): TrayBounds {
    return { ...this.bounds };
  }

  /** Виден ли лоток (у скрытой вкладки нулевой размер). */
  isVisible(): boolean {
    return this.container.clientWidth > 0 && this.container.clientHeight > 0;
  }

  /**
   * Проигрывает просчитанный бросок. `values[i]` — разметка значений i-го куба
   * (по граням, для d4 — по вершинам), при которой сверху выпадает результат движка.
   */
  play(simulation: Simulation, values: number[][]): Promise<void> {
    this.clearDice();
    const meshes = simulation.dice.map((track, i) => {
      const mesh = buildDieMesh(track.shape, values[i] ?? track.shape.values);
      this.dice.add(mesh);
      return mesh;
    });

    cancelAnimationFrame(this.animation);
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now: number) => {
        if (this.disposed) {
          resolve();
          return;
        }
        const frame = Math.min(
          simulation.frames - 1,
          Math.floor(((now - start) / 1000) * FRAME_RATE),
        );
        simulation.dice.forEach((track, i) => {
          const mesh = meshes[i];
          if (!mesh) return;
          const p = frame * 3;
          const q = frame * 4;
          mesh.position.set(
            track.positions[p] ?? 0,
            track.positions[p + 1] ?? 0,
            track.positions[p + 2] ?? 0,
          );
          mesh.quaternion.set(
            track.quaternions[q] ?? 0,
            track.quaternions[q + 1] ?? 0,
            track.quaternions[q + 2] ?? 0,
            track.quaternions[q + 3] ?? 1,
          );
        });
        this.render();
        if (frame >= simulation.frames - 1) {
          resolve();
        } else {
          this.animation = requestAnimationFrame(tick);
        }
      };
      this.animation = requestAnimationFrame(tick);
    });
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animation);
    this.resizeObserver.disconnect();
    this.clearDice();
    this.clearWalls();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    const aspect = width / height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = aspect;

    const halfDepth = HALF_DEPTH;
    const halfWidth = Math.min(9, Math.max(3.4, halfDepth * aspect));
    this.bounds = { halfWidth, halfDepth };
    this.buildWalls();

    // Камера сверху под небольшим углом; расстояние — чтобы лоток помещался целиком.
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const distance = Math.max(
      ((halfDepth + 0.8) * 1.05) / tan,
      ((halfWidth + 0.8) * 1.05) / (tan * aspect),
    );
    this.camera.position.set(0, distance * 0.95, distance * 0.32);
    this.camera.lookAt(0, 0, 0.2);
    this.camera.updateProjectionMatrix();
    this.render();
  }

  private buildWalls(): void {
    this.clearWalls();
    const { halfWidth: hw, halfDepth: hd } = this.bounds;
    const material = new THREE.MeshStandardMaterial({ color: "#5b3a22", roughness: 0.6 });
    const t = WALL_THICKNESS;
    // [ширина, x, z, глубина]
    const pieces: [number, number, number, number][] = [
      [hw * 2 + t * 2, 0, -hd - t / 2, t],
      [hw * 2 + t * 2, 0, hd + t / 2, t],
      [t, -hw - t / 2, 0, hd * 2],
      [t, hw + t / 2, 0, hd * 2],
    ];
    for (const [w, x, z, d] of pieces) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_HEIGHT, d), material);
      wall.position.set(x, WALL_HEIGHT / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.walls.add(wall);
    }
  }

  private clearWalls(): void {
    for (const child of [...this.walls.children]) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        disposeMaterial(child.material);
      }
      this.walls.remove(child);
    }
  }

  private clearDice(): void {
    for (const child of [...this.dice.children]) {
      child.traverse((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
          node.geometry.dispose();
          disposeMaterial(node.material);
        }
      });
      this.dice.remove(child);
    }
  }

  private render(): void {
    if (this.isVisible()) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  for (const m of Array.isArray(material) ? material : [material]) {
    if (m instanceof THREE.MeshStandardMaterial) m.map?.dispose();
    m.dispose();
  }
}

/** Меш куба: по материалу с подписью на каждую грань и золотые рёбра. */
function buildDieMesh(shape: DieShape, values: number[]): THREE.Group {
  const style = STYLES[shape.kind];
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const geometry = new THREE.BufferGeometry();
  const materials: THREE.MeshStandardMaterial[] = [];
  let vertexCount = 0;

  shape.faces.forEach((face, f) => {
    const points = face.map((i) => shape.vertices[i] as Vec3);
    const center = shape.centers[f] as Vec3;
    const normal = shape.normals[f] as Vec3;
    const u = normalize(sub(points[0] as Vec3, center));
    const w = cross(normal, u);
    const radius = Math.max(...points.map((p) => Math.hypot(dot(sub(p, center), u), dot(sub(p, center), w))));
    const local = points.map((p) => {
      const d = sub(p, center);
      return [dot(d, u) / radius, dot(d, w) / radius] as const;
    });

    const start = vertexCount;
    for (let i = 1; i < points.length - 1; i++) {
      for (const k of [0, i, i + 1]) {
        const p = points[k] as Vec3;
        const l = local[k] ?? [0, 0];
        positions.push(p[0], p[1], p[2]);
        normals.push(normal[0], normal[1], normal[2]);
        uvs.push(0.5 + l[0] * 0.5, 0.5 + l[1] * 0.5);
        vertexCount++;
      }
    }
    geometry.addGroup(start, vertexCount - start, f);

    const texture = new THREE.CanvasTexture(
      drawFace(shape, values, f, local.map((l) => [l[0], l[1]] as [number, number]), style),
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    materials.push(
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35, metalness: 0.05 }),
    );
  });

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 20),
    new THREE.LineBasicMaterial({ color: style.ink, transparent: true, opacity: 0.55 }),
  );

  const group = new THREE.Group();
  group.add(mesh, edges);
  return group;
}

/** Текстура грани. `corners` — координаты вершин грани в её плоскости (от −1 до 1). */
function drawFace(
  shape: DieShape,
  values: number[],
  face: number,
  corners: [number, number][],
  style: DieStyle,
): HTMLCanvasElement {
  const size = TEXTURE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = style.body;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = style.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Координаты грани → холст (ось v текстуры направлена вверх, ось y холста — вниз).
  const toCanvas = (x: number, y: number): [number, number] => [
    (0.5 + x * 0.5) * size,
    (0.5 - y * 0.5) * size,
  ];

  if (shape.kind === "d4") {
    // На d4 у каждого угла — значение вершины; читается то, что у верхней вершины.
    const cornerValues = d4CornerValues(shape, values, face);
    ctx.font = `bold ${Math.round(size * 0.2)}px Georgia, serif`;
    corners.forEach(([x, y], i) => {
      const [cx, cy] = toCanvas(x * 0.55, y * 0.55);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.atan2(x, y));
      ctx.fillText(String(cornerValues[i] ?? ""), 0, 0);
      ctx.restore();
    });
    return canvas;
  }

  const label = labelFor(shape.kind, values[face] ?? 0);
  const fontScale =
    shape.kind === "d6" ? 0.42 : shape.faces[0]?.length === 3 ? 0.27 : label.length > 1 ? 0.26 : 0.32;
  const fontSize = Math.round(size * fontScale);
  ctx.font = `bold ${fontSize}px Georgia, serif`;
  const [cx, cy] = toCanvas(0, 0);
  ctx.fillText(label, cx, cy);
  if (label === "6" || label === "9") {
    // Черта под 6 и 9, чтобы их не перепутать.
    const width = ctx.measureText(label).width;
    ctx.fillRect(cx - width / 2, cy + fontSize * 0.42, width, Math.max(2, fontSize * 0.07));
  }
  return canvas;
}
