/* ═══════════════════════════════════════════════════════════
   记忆手提箱 · MEMORY SUITCASE
   3D 交互式 IP 官网
   ═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { WORLDS, CAST, FRAGMENTS, ARCHIVE, ENDINGS } from './data.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const MODEL_H = 1.72;          // 角色统一高度
const MODEL_DIR = './models/';

/* ───────────── 状态 ───────────── */
/* file:// 下部分浏览器禁用 localStorage，这里统一做安全存取 */
const store = {
  get(k, d) {
    try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* 忽略 */ }
  },
};

const state = {
  world: WORLDS[0],
  cast: CAST[0],
  autoRotate: true,
  unlocked: new Set(JSON.parse(store.get('ms_frag', '[]'))),
  ended: new Set(JSON.parse(store.get('ms_end', '[]'))),
  busy: false,
};

/* ───────────── 渲染器 / 场景 ───────────── */
const canvas = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0.62, 1.52, 4.05);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0.88, 0);
controls.minDistance = 1.6;
controls.maxDistance = 7.5;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

/* ───────────── 基础对象 ───────────── */
const worldGroup = new THREE.Group();   // 每切换世界线整体重建
scene.add(worldGroup);

const modelSlot = new THREE.Group();    // 角色挂载点
scene.add(modelSlot);
let currentModel = null;

/* 灯光（颜色随世界线变化） */
const hemi = new THREE.HemisphereLight(0xffffff, 0x0a0e14, 0.35);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(2.6, 4.2, 2.8);
scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 1.5);
rim.position.set(-3.0, 2.2, -2.6);
scene.add(rim);
const fill = new THREE.PointLight(0xffffff, 6, 12, 2);
fill.position.set(0, 1.0, 2.2);
scene.add(fill);

/* 接触阴影贴图 */
function makeBlobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 6, 128, 128, 126);
  grd.addColorStop(0, 'rgba(0,0,0,0.62)');
  grd.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData.shared = true; // 跨世界线复用，重建场景时不释放
  return t;
}
const blobTex = makeBlobTexture();

/* 柔光点贴图 */
function makeDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.userData.shared = true;
  return t;
}
const dotTex = makeDotTexture();

/* ───────────── 工具 ───────────── */
function labelSprite(text, color = '#ffffff', size = 46) {
  const pad = 16;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = `600 ${size}px "Noto Serif SC","Songti SC",serif`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + pad * 2;
  c.width = w; c.height = size + pad * 2;
  const g2 = c.getContext('2d');
  g2.font = font;
  g2.textBaseline = 'middle';
  g2.shadowColor = 'rgba(0,0,0,.85)';
  g2.shadowBlur = 12;
  g2.fillStyle = color;
  g2.fillText(text, pad, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set((c.width / c.height) * 0.17, 0.17, 1);
  sp.renderOrder = 10;
  return sp;
}

function disposeGroup(g) {
  g.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach((m) => {
        if (m.map && !m.map.userData.shared) m.map.dispose();
        m.dispose();
      });
    }
  });
  g.clear();
}

/* ───────────── 场景构建 ───────────── */
let relicOrbs = [];     // 记忆碎片（三条记忆线内）
let gateHits = [];      // 现实展厅的三件入口展品
let suitcaseHit = null; // 记忆手提箱
let animators = [];

function buildWorld(w) {
  disposeGroup(worldGroup);
  relicOrbs = [];
  gateHits = [];
  suitcaseHit = null;
  animators = [];

  const A = new THREE.Color(w.accent);
  const A2 = new THREE.Color(w.accent2);

  scene.background = new THREE.Color(w.bg);
  scene.fog = new THREE.FogExp2(w.fog, w.fogDensity);
  scene.environmentIntensity = w.envInt;
  renderer.toneMappingExposure = w.exposure;

  hemi.color.setHex(w.keyLight).multiplyScalar(1);
  hemi.groundColor.set(w.bg);
  hemi.intensity = 0.45;
  key.color.setHex(w.keyLight); key.intensity = 2.0;
  rim.color.setHex(w.rimLight); rim.intensity = 1.8;
  fill.color.setHex(w.accent); fill.intensity = 5.5;

  /* 地面 */
  const groundMat = new THREE.MeshStandardMaterial({
    color: w.ground, roughness: w.groundRough, metalness: w.groundMetal,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(11, 72), groundMat);
  ground.rotation.x = -Math.PI / 2;
  worldGroup.add(ground);

  /* 展台 */
  const ped = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.86, 0.34, 64),
    new THREE.MeshStandardMaterial({ color: w.pedestal, roughness: 0.45, metalness: 0.55 })
  );
  ped.position.y = -0.17;
  worldGroup.add(ped);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.80, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({ color: w.ring })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  worldGroup.add(ring);

  const ringGlow = new THREE.Mesh(
    new THREE.RingGeometry(0.82, 1.02, 96),
    new THREE.MeshBasicMaterial({ color: w.ring, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
  );
  ringGlow.rotation.x = -Math.PI / 2;
  ringGlow.position.y = 0.004;
  worldGroup.add(ringGlow);
  animators.push((t) => { ringGlow.material.opacity = 0.09 + Math.sin(t * 1.6) * 0.05; });

  /* 接触阴影 */
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.9 })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.008;
  worldGroup.add(blob);

  /* 主题道具 */
  ({ lobby: propsLobby, tang: propsTang, opera: propsOpera, neon: propsNeon }[w.props])(w, A, A2);

  /* 现实展厅：三件「入口展品」——触碰即被拉入对应平行世界 */
  if (w.id === 'lobby') buildGates(w);

  /* 记忆手提箱：IP 核心道具，现实线=随机穿梭，记忆线=拉回现实 */
  buildSuitcase(w);

  /* 记忆碎片（仅三条记忆线） */
  const frags = FRAGMENTS[w.id];
  if (frags) {
    frags.forEach((f, i) => {
      const done = state.unlocked.has(`${w.id}:${i}`);
      const grp = new THREE.Group();
      grp.position.set(...f.at);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.075, 1),
        new THREE.MeshStandardMaterial({
          color: done ? w.accent : 0x2a3240,
          emissive: done ? w.accent : w.accent2,
          emissiveIntensity: done ? 1.6 : 0.55,
          roughness: 0.25, metalness: 0.7,
        })
      );
      grp.add(core);

      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: dotTex, color: done ? w.accent : w.accent2,
        transparent: true, opacity: done ? 0.75 : 0.42,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      halo.scale.setScalar(done ? 0.62 : 0.5);
      grp.add(halo);

      const tag = labelSprite(done ? f.title : '？', done ? '#ffffff' : 'rgba(255,255,255,.55)', 40);
      tag.position.y = 0.19;
      grp.add(tag);

      /* 不可见的放大点击靶：核心只有 0.075，屏幕上太小，很难点中 */
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 12, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hit.userData = { frag: { world: w.id, i, ...f }, core };
      grp.add(hit);

      grp.userData.orb = core;

      worldGroup.add(grp);
      relicOrbs.push(hit);
      animators.push((t) => {
        grp.position.y = f.at[1] + Math.sin(t * 1.1 + i * 2.1) * 0.045;
        core.rotation.y = t * 0.5 + i;
        core.rotation.x = t * 0.3;
        const s = core.userData.hover ? 1.45 : 1;
        core.scale.setScalar(THREE.MathUtils.lerp(core.scale.x, s, 0.15));
        halo.material.opacity = (done ? 0.7 : 0.38) + Math.sin(t * 2.2 + i) * 0.14;
      });
    });
  }

  /* 粒子 */
  const n = w.particleCount;
  const pos = new Float32Array(n * 3);
  const spd = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = 1.2 + Math.random() * 6.5;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 4.5;
    pos[i * 3 + 2] = Math.sin(a) * r;
    spd[i] = 0.06 + Math.random() * 0.16;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({
    size: 0.035, map: dotTex, color: w.particle,
    transparent: true, opacity: 0.62, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(pg, pm);
  worldGroup.add(pts);
  animators.push((t, dt) => {
    const p = pg.attributes.position.array;
    for (let i = 0; i < n; i++) {
      p[i * 3 + 1] += spd[i] * dt;
      if (p[i * 3 + 1] > 4.6) p[i * 3 + 1] = -0.05;
    }
    pg.attributes.position.needsUpdate = true;
    pm.opacity = 0.5 + Math.sin(t * 0.8) * 0.14;
  });
}

/* —— 各世界线道具 —— */
function spotCone(color, x, y, z, h = 2.6, r = 0.72) {
  const g = new THREE.ConeGeometry(r, h, 32, 1, true);
  const m = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.075, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const c = new THREE.Mesh(g, m);
  c.position.set(x, y + h / 2, z); // 锥尖朝上 = 光源自上方洒落
  c.renderOrder = 2;
  return c;
}

function propsLobby(w, A, A2) {
  // 展柜立柱
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2b3543, roughness: 0.4, metalness: 0.8 })
    );
    p.position.set(Math.cos(a) * 3.1, 1.25, Math.sin(a) * 3.1);
    worldGroup.add(p);
  }
  // 玻璃罩（很淡，避免遮挡）
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 2.3, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xbcd6f0, transparent: true, opacity: 0.055, roughness: 0.06,
      metalness: 0.2, side: THREE.DoubleSide, depthWrite: false,
    })
  );
  glass.position.y = 1.15;
  worldGroup.add(glass);
  worldGroup.add(spotCone(w.accent, 0, 2.3, 0, 2.3, 1.0));
}

function propsTang(w, A, A2) {
  // 唐草纹屏风（三折）
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x5a2a1c, roughness: 0.7, metalness: 0.25 });
  for (let i = -1; i <= 1; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.9, 0.06), panelMat);
    p.position.set(i * 1.55, 1.45, -2.35 + Math.abs(i) * 0.5);
    p.rotation.y = -i * 0.42;
    worldGroup.add(p);
    // 金色纹样
    const orn = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.022, 6, 40),
      new THREE.MeshBasicMaterial({ color: 0xe0a63c })
    );
    orn.position.set(i * 1.55, 1.75, -2.30 + Math.abs(i) * 0.5);
    orn.rotation.y = -i * 0.42;
    worldGroup.add(orn);
  }
  // 宫灯
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.7;
    const g = new THREE.Group();
    g.position.set(Math.cos(a) * 2.7, 2.05 + Math.sin(i) * 0.28, Math.sin(a) * 2.7);
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc8102e, emissive: 0xc8102e, emissiveIntensity: 0.85, roughness: 0.5 })
    );
    g.add(body);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, color: 0xffb060, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(0.85);
    g.add(glow);
    worldGroup.add(g);
    animators.push((t) => {
      g.position.y = 2.05 + Math.sin(i) * 0.28 + Math.sin(t * 0.9 + i * 1.7) * 0.09;
      glow.material.opacity = 0.48 + Math.sin(t * 2.4 + i) * 0.16;
    });
  }
}

function propsOpera(w, A, A2) {
  // 幕布
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0x6d1526, roughness: 0.92, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const geo = new THREE.PlaneGeometry(2.1, 4.4, 16, 1);
    const p = geometryWave(geo, 0.16, 3.2);
    const m = new THREE.Mesh(p, curtainMat);
    m.position.set(s * 1.45, 2.2, -1.9);
    m.rotation.y = -s * 0.28;
    worldGroup.add(m);
  }
  // 顶部横檐
  const valance = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.34, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8e1b2e, roughness: 0.8 })
  );
  valance.position.set(0, 4.0, -1.75);
  worldGroup.add(valance);
  // 聚光灯锥
  worldGroup.add(spotCone(0xffe6b0, -1.25, 0.02, 1.35, 3.4, 0.62));
  worldGroup.add(spotCone(0xffe6b0, 1.25, 0.02, 1.35, 3.4, 0.62));
  // 飘浮乐谱
  const sheetMat = new THREE.MeshStandardMaterial({ color: 0xf3e8cf, roughness: 0.9, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.22), sheetMat);
    const a = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 1.9;
    s.position.set(Math.cos(a) * r, 0.5 + Math.random() * 2.4, Math.sin(a) * r);
    worldGroup.add(s);
    const ph = Math.random() * 6.3, sp = 0.25 + Math.random() * 0.4;
    animators.push((t) => {
      s.position.y += 0.0016 * sp;
      if (s.position.y > 3.4) s.position.y = 0.2;
      s.rotation.z = Math.sin(t * sp + ph) * 0.7;
      s.rotation.y = Math.sin(t * sp * 0.7 + ph) * 1.1;
    });
  }
}

function propsNeon(w, A, A2) {
  // 网格地面
  const grid = new THREE.GridHelper(22, 44, w.accent, 0x2a1a44);
  grid.material.transparent = true;
  grid.material.opacity = 0.30;
  grid.position.y = 0.012;
  worldGroup.add(grid);
  animators.push((t) => { grid.material.opacity = 0.22 + Math.sin(t * 1.4) * 0.1; });

  // 霓虹管
  for (const [s, col] of [[-1, w.accent], [1, w.accent2]]) {
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 3.6, 10),
      new THREE.MeshBasicMaterial({ color: col })
    );
    tube.position.set(s * 2.55, 1.8, -1.6);
    worldGroup.add(tube);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, color: col, transparent: true, opacity: 0.42,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(0.9, 3.9, 1);
    glow.position.copy(tube.position);
    worldGroup.add(glow);
    animators.push((t) => { tube.material.color.setHex(col); glow.material.opacity = 0.34 + Math.sin(t * 3 + s) * 0.14; });
  }

  // 街机柜
  for (const [x, z, ry] of [[-2.05, 0.85, 0.42], [2.05, 0.85, -0.42]]) {
    const cab = new THREE.Group();
    cab.position.set(x, 0, z);
    cab.rotation.y = ry;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.5, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x1b1030, roughness: 0.62, metalness: 0.35 })
    );
    body.position.y = 0.75;
    cab.add(body);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.36),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? w.accent : w.accent2 })
    );
    screen.position.set(0, 1.06, 0.281);
    cab.add(screen);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, color: screen.material.color.getHex(), transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(1.1);
    glow.position.set(0, 1.06, 0.34);
    cab.add(glow);
    worldGroup.add(cab);
    animators.push((t) => {
      const f = 0.35 + Math.abs(Math.sin(t * 4.2 + x)) * 0.45;
      glow.material.opacity = f;
      screen.material.color.setHex(Math.floor(t * 3 + x) % 2 ? w.accent : w.accent2);
    });
  }

  // 漂浮像素方块
  const cubeGeo = new THREE.BoxGeometry(0.085, 0.085, 0.085);
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? w.accent2 : w.accent, transparent: true, opacity: 0.75,
    }));
    const a = Math.random() * Math.PI * 2, r = 1.35 + Math.random() * 2.6;
    m.position.set(Math.cos(a) * r, 0.3 + Math.random() * 2.9, Math.sin(a) * r);
    worldGroup.add(m);
    const sp = 0.2 + Math.random() * 0.5, ph = Math.random() * 6.3;
    animators.push((t) => {
      m.rotation.x = t * sp * 0.5; m.rotation.y = t * sp * 0.7;
      m.position.y += 0.0022 * sp;
      if (m.position.y > 3.5) m.position.y = 0.15;
      m.material.opacity = 0.45 + Math.abs(Math.sin(t * sp + ph)) * 0.5;
    });
  }
}

/* —— 现实展厅的三件「入口展品」：触碰即被拉入对应平行世界 —— */
const GATES = [
  { world: 'tang',  name: '骆驼俑',   sub: '盛唐长安', at: [-1.75, 0, -0.55] },
  { world: 'opera', name: '残缺乐谱', sub: '最终彩排', at: [0.35, 0, -1.5] },
  { world: 'neon',  name: '街机',     sub: '霓虹地下', at: [0.90, 0, -2.30] },
];

function gateRelic(kind, tw) {
  const g = new THREE.Group();
  if (kind === 'tang') {
    /* 唐三彩骆驼俑：褐黄胎体 + 绿釉双峰 */
    const clay = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.62, metalness: 0.06 });
    const glaze = new THREE.MeshStandardMaterial({ color: 0x6f8f6a, roughness: 0.34, metalness: 0.16 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.028, 0.13), clay);
    base.position.y = -0.125;
    g.add(base);

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.13, 6, 16), clay);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.005;
    g.add(body);

    for (const s of [-0.052, 0.052]) {
      const hump = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        glaze
      );
      hump.position.set(s, 0.07, 0);
      g.add(hump);
    }

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.038, 0.14, 14), clay);
    neck.position.set(0.1, 0.08, 0);
    neck.rotation.z = -0.36;
    g.add(neck);

    const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.048, 5, 12), clay);
    head.position.set(0.15, 0.142, 0);
    head.rotation.z = Math.PI / 2 - 0.36;
    g.add(head);

    for (const [lx, lz] of [[0.058, 0.046], [0.058, -0.046], [-0.058, 0.046], [-0.058, -0.046]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.125, 12), clay);
      leg.position.set(lx, -0.062, lz);
      g.add(leg);
    }
  } else if (kind === 'opera') {
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xf3e8cf, roughness: 0.92, side: THREE.DoubleSide })
    );
    g.add(sheet);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x6b5b3e });
    for (let i = 0; i < 5; i++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.006), lineMat);
      line.position.set(0, 0.085 - i * 0.042, 0.002);
      g.add(line);
    }
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.44, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x1b1030, roughness: 0.6, metalness: 0.4 })
    );
    g.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.17), new THREE.MeshBasicMaterial({ color: tw.accent }));
    scr.position.set(0, 0.07, 0.133);
    g.add(scr);
    g.userData.screen = scr;
  }
  return g;
}

function buildGates(w) {
  GATES.forEach((gate, i) => {
    const tw = WORLDS.find((x) => x.id === gate.world);
    const grp = new THREE.Group();
    grp.position.set(gate.at[0], 0, gate.at[2]);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.34, 0.9, 40),
      new THREE.MeshStandardMaterial({ color: 0x1b232d, roughness: 0.45, metalness: 0.55 })
    );
    ped.position.y = 0.45;
    grp.add(ped);

    /* 展柜顶圈 + 顶部射灯锥：让它读起来像博物馆展柜，而不是黑柱子 */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.315, 0.009, 6, 48),
      new THREE.MeshBasicMaterial({ color: tw.accent, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.902;
    grp.add(ring);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.66, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0xbcd6f0, transparent: true, opacity: 0.04, roughness: 0.05,
        metalness: 0.2, side: THREE.DoubleSide, depthWrite: false,
      })
    );
    glass.position.y = 1.23;
    grp.add(glass);

    const relic = gateRelic(gate.world, tw);
    relic.position.y = 1.2;
    grp.add(relic);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, color: tw.accent, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(0.7);
    glow.position.y = 1.2;
    grp.add(glow);

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 12, 10),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.y = 1.2;
    hit.userData = { gate: gate.world, name: gate.name, sub: gate.sub, relic, glow };
    grp.add(hit);

    worldGroup.add(grp);
    gateHits.push(hit);
    animators.push((t) => {
      const hov = hit.userData.hover;
      relic.position.y = 1.2 + Math.sin(t * 1.2 + i * 2) * 0.04;
      relic.rotation.y = t * 0.35 + i;
      relic.scale.setScalar(THREE.MathUtils.lerp(relic.scale.x, hov ? 1.2 : 1, 0.15));
      glow.material.opacity = (hov ? 0.6 : 0.26) + Math.sin(t * 2 + i) * 0.08;
      if (relic.userData.screen) {
        relic.userData.screen.material.color.setHex(Math.floor(t * 2 + i) % 2 ? tw.accent : tw.accent2);
      }
    });
  });
}

/* —— 记忆手提箱：连通记忆时空的那把钥匙 —— */
function buildSuitcase(w) {
  const isLobby = w.id === 'lobby';
  const g = new THREE.Group();
  g.position.set(-1.05, 0, 0.88);
  g.rotation.y = 0.72;

  const leather = new THREE.MeshStandardMaterial({ color: 0x4a2f20, roughness: 0.68, metalness: 0.2 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x161b23, roughness: 0.5, metalness: 0.65 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79a4a, roughness: 0.26, metalness: 0.95 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.4, 0.24), leather);
  body.position.y = 0.2;
  g.add(body);

  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.575, 0.012, 0.248), trim);
  seam.position.y = 0.29;
  g.add(seam);

  for (const x of [-0.16, 0.16]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.415, 0.255), trim);
    band.position.set(x, 0.2, 0);
    g.add(band);
  }

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.013, 8, 24, Math.PI), trim);
  handle.position.y = 0.4;
  g.add(handle);

  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.03), brass);
  lock.position.set(0, 0.245, 0.128);
  g.add(lock);

  const lockGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: dotTex, color: w.accent, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  lockGlow.scale.setScalar(0.34);
  lockGlow.position.set(0, 0.245, 0.15);
  g.add(lockGlow);

  // 标签放在箱体左上方的空白带里：左侧角色坞会吃掉 x<202px 的区域
  const tag = labelSprite('手提箱', isLobby ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.72)', 30);
  tag.position.set(0.1, 0.92, 0);
  g.add(tag);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 12, 10),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.position.y = 0.26;
  hit.userData = { suit: true };
  g.add(hit);
  suitcaseHit = hit;

  const y0 = 0;
  animators.push((t) => {
    const hov = hit.userData.hover;
    g.position.y = y0 + Math.sin(t * 0.9) * 0.025 + (hov ? 0.05 : 0);
    g.rotation.y = 0.72 + Math.sin(t * 0.35) * 0.08;
    lockGlow.material.opacity = (hov ? 0.85 : 0.42) + Math.sin(t * 2.6) * 0.2;
    tag.material.opacity = THREE.MathUtils.lerp(tag.material.opacity, hov ? 1 : 0.72, 0.12);
  });

  worldGroup.add(g);
}

function geometryWave(geo, amp, freq) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, Math.sin((p.getX(i) / 2.1) * Math.PI * freq) * amp);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ───────────── 模型加载 ───────────── */
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const modelCache = new Map();

function modelKey(w, c) { return `${w.skin}${c.id}`; }

/* GLB → 场景中可用的对象：统一高度、居中、底部贴台面 */
function normalizeModel(gltf, k) {
  const obj = gltf.scene;
  obj.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = false;
      if (o.material) {
        o.material.envMapIntensity = 1.15;
        o.material.side = THREE.FrontSide;
      }
    }
  });
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const s = MODEL_H / (size.y || 1);
  obj.scale.setScalar(s);
  obj.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  modelCache.set(k, obj);
  return obj;
}

/* base64 → ArrayBuffer（单文件版离线内嵌模型用） */
function b64ToBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function loadModel(w, c, onProgress) {
  const k = modelKey(w, c);
  if (modelCache.has(k)) return Promise.resolve(modelCache.get(k));

  /* 单文件离线版：模型以 base64 内嵌在 window.__MS_MODELS__ 里 */
  const packed = window.__MS_MODELS__ && window.__MS_MODELS__[k];
  if (packed) {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(1);
      // 让出一帧，避免解码大文件时卡住首屏渲染
      setTimeout(() => {
        try {
          loader.parse(b64ToBuffer(packed), '', (gltf) => resolve(normalizeModel(gltf, k)), reject);
        } catch (err) { reject(err); }
      }, 0);
    });
  }

  const url = `${MODEL_DIR}${k}.glb`;
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(normalizeModel(gltf, k));
    }, (e) => { if (onProgress && e.total) onProgress(e.loaded / e.total); }, reject);
  });
}

function showModel(w, c, onProgress) {
  if (state.busy) return Promise.resolve();
  state.busy = true;
  $('#loadingMask').classList.add('on');
  return loadModel(w, c, onProgress).then((obj) => {
    if (currentModel && currentModel.parent) currentModel.parent.remove(currentModel);
    currentModel = obj;
    modelSlot.add(obj);
    obj.scale.multiplyScalar(1);
    // 入场动画
    const target = obj.scale.x;
    obj.scale.setScalar(target * 0.82);
    obj.position.y -= 0.22;
    const y0 = obj.position.y + 0.22;
    let t0 = performance.now();
    const step = () => {
      const p = Math.min((performance.now() - t0) / 620, 1);
      const e = 1 - Math.pow(1 - p, 3);
      obj.scale.setScalar(target * (0.82 + 0.18 * e));
      obj.position.y = y0 - 0.22 * (1 - e);
      if (p < 1) requestAnimationFrame(step);
    };
    step();
    state.busy = false;
    $('#loadingMask').classList.remove('on');
  }).catch((e) => {
    state.busy = false;
    $('#loadingMask').classList.remove('on');
    console.error('模型加载失败', e);
    toast('载入失败', '无法读取 ' + modelKey(w, c) + '.glb，请确认页面正通过本地服务器访问。');
  });
}

/* 后台预取当前角色的其余皮肤 */
function prefetch(c) {
  // 隐藏角色只有一套皮肤，只能预取它所在的世界线
  const pool = c.only ? WORLDS.filter((w) => w.id === c.only) : WORLDS;
  const rest = pool.filter((w) => !modelCache.has(modelKey(w, c)));
  let i = 0;
  const next = () => {
    if (i >= rest.length) return;
    const w = rest[i++];
    loadModel(w, c).then(next).catch(next);
  };
  setTimeout(next, 900);
}

/* ───────────── UI ───────────── */
function buildTabs() {
  $('#worldTabs').innerHTML = WORLDS.map((w) =>
    `<button class="wtab" data-w="${w.id}">${w.name}<i>${w.idx.replace('世界线 ', '')}</i></button>`
  ).join('');
  $$('#worldTabs .wtab').forEach((b) => b.addEventListener('click', () => switchWorld(b.dataset.w)));
}

/* 底部「本期展品」条：与 3D 展柜同为时空入口，也解决小屏点不中的问题 */
function buildGateStrip() {
  $('#gateStrip').innerHTML = '<span class="glabel">本期展品 · 点击穿越</span>' + GATES.map((g) => `
    <button class="gchip" data-w="${g.world}">
      <span class="dot"></span>
      <b>${g.name}</b>
      <i>${g.sub}</i>
    </button>`).join('');
  $$('#gateStrip .gchip').forEach((b) => b.addEventListener('click', () => {
    const g = GATES.find((x) => x.world === b.dataset.w);
    if (!g) return;
    flash();
    toast(`入口文物 · ${g.name}`, `你触碰了${g.name}，时空锁开启——正在被拉入「${g.sub}」。`);
    switchWorld(g.world);
  }));
}

function buildCast() {
  $('#charList').innerHTML = CAST.map((c) => `
    <button class="citem" data-c="${c.id}">
      <span class="cglyph${c.id.length > 1 ? ' two' : ''}">${c.id}</span>
      <span class="cbody">
        <span class="cname">${c.code}</span>
        <span class="crole">${c.hidden ? '地下城限定' : '主角团'}</span>
        ${c.hidden ? '<em class="hid">隐藏款</em>' : ''}
      </span>
    </button>`).join('');
  $$('#charList .citem').forEach((b) => b.addEventListener('click', () => switchCast(b.dataset.c)));
}

function paintWorld() {
  const w = state.world;
  document.body.dataset.world = w.id;
  $('#loreIndex').textContent = w.idx;
  $('#loreEn').textContent = w.en;
  $('#loreTitle').textContent = w.name;
  $('#loreDesc').textContent = w.desc;
  $('#loreRelic').textContent = w.relic;
  $('#loreSkin').textContent = w.skin;
  $('#loreMission').textContent = w.mission;
  $('#loreSymbols').innerHTML = w.symbols.map((s) => `<span class="sym">${s}</span>`).join('');
  $$('#worldTabs .wtab').forEach((b) => b.classList.toggle('on', b.dataset.w === w.id));
}

function paintCast() {
  const c = state.cast;
  $$('#charList .citem').forEach((b) => b.classList.toggle('on', b.dataset.c === c.id));
  $('#casterName').textContent = `${c.id} · ${c.code}`;
  $('#casterTrait').textContent = c.trait;
}

function paintFrag() {
  const total = Object.values(FRAGMENTS).reduce((n, a) => n + a.length, 0);
  const got = state.unlocked.size;
  $('#fragCount').textContent = `${got} / ${total}`;
  $('#fragBar').style.width = `${(got / total) * 100}%`;
}

function switchWorld(id, silent) {
  const w = WORLDS.find((x) => x.id === id);
  // 必须始终返回 Promise：drawBlindBox 里会 .then()，返回 undefined 会抛错
  if (!w || (w === state.world && !silent)) return Promise.resolve();
  // 隐藏角色只存在于自己的世界线，离开时换回主角团，避免去找不存在的模型
  if (state.cast.only && w.id !== state.cast.only) {
    const left = state.cast;
    state.cast = CAST[0];
    paintCast();
    toast('时空穿梭', `${left.id} 只留在「${WORLDS.find((x) => x.id === left.only).name}」，主角团由${CAST[0].id}继续带队。`);
  }
  state.world = w;
  paintWorld();
  buildWorld(w);
  return showModel(w, state.cast);
}

function switchCast(id) {
  const c = CAST.find((x) => x.id === id);
  if (!c || c === state.cast) return;
  state.cast = c;
  paintCast();
  prefetch(c);
  // 隐藏角色：先把它所在的世界线拉过来，再换装
  if (c.only && state.world.id !== c.only) {
    const w = WORLDS.find((x) => x.id === c.only);
    flash();
    toast(`隐藏角色 · ${c.id}`, `${c.id} 只出现在「${w.name}」——正在把你送过去。`);
    return switchWorld(c.only);
  }
  return showModel(state.world, c);
}

/* toast */
let toastTimer = null;
function toast(title, text) {
  const el = $('#toast');
  el.innerHTML = `<b>${title}</b>${text}`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 5200);
}

/* ───────────── 交互：点击记忆碎片 ───────────── */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let hovered = null;

function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ptr.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const targets = [...relicOrbs, ...gateHits];
  if (suitcaseHit) targets.push(suitcaseHit);
  const hits = ray.intersectObjects(targets, false);
  return hits.length ? hits[0].object : null;
}

const setHover = (o, v) => {
  if (!o) return;
  o.userData.hover = v;
  if (o.userData.core) o.userData.core.userData.hover = v;
};

canvas.addEventListener('pointermove', (ev) => {
  const o = pick(ev);
  if (hovered && hovered !== o) setHover(hovered, false);
  hovered = o;
  setHover(o, true);
  canvas.style.cursor = o ? 'pointer' : 'grab';
  // 悬停到碎片上时暂停自动旋转，避免「移动靶」难以点中
  controls.autoRotate = state.autoRotate && !o;
  // 展柜 ↔ 底部展品条联动高亮
  const gw = o && o.userData.gate;
  $$('#gateStrip .gchip').forEach((b) => b.classList.toggle('hot', !!gw && b.dataset.w === gw));
});

canvas.addEventListener('click', (ev) => {
  const o = pick(ev);
  if (!o) return;

  /* 现实展厅：触碰承载强烈情绪的展品 → 被拉入对应平行世界 */
  if (o.userData.gate) {
    const tw = WORLDS.find((x) => x.id === o.userData.gate);
    flash();
    toast(`入口文物 · ${o.userData.name}`, `你触碰了${o.userData.name}，时空锁开启——正在被拉入「${o.userData.sub}」。`);
    switchWorld(o.userData.gate);
    return;
  }

  /* 记忆手提箱：现实线随机穿梭，记忆线拉回现实 */
  if (o.userData.suit) { travel(); return; }

  const f = o.userData.frag;
  const core = o.userData.core || o;
  const key = `${f.world}:${f.i}`;
  const isNew = !state.unlocked.has(key);
  state.unlocked.add(key);
  store.set('ms_frag', JSON.stringify([...state.unlocked]));
  paintFrag();
  // 已解锁 → 常亮
  core.material.color.setHex(state.world.accent);
  core.material.emissive.setHex(state.world.accent);
  core.material.emissiveIntensity = 1.6;
  const label = o.parent.children.find((c) => c.isSprite && c.material.map && c.material.depthTest === false);
  if (label) {
    o.parent.remove(label);
    const nt = labelSprite(f.title, '#ffffff', 40);
    nt.position.y = 0.19;
    o.parent.add(nt);
  }
  toast(isNew ? `记忆碎片 · 已解锁（${state.unlocked.size}/${Object.values(FRAGMENTS).reduce((n, a) => n + a.length, 0)}）` : f.title, f.text);
  checkEnding(f.world);
});

/* ───────────── 时空穿梭 / 结局 ───────────── */
function flash() {
  const el = $('#flash');
  el.classList.remove('on');
  void el.offsetWidth;      // 强制重排，保证连续点击时动画会重播
  el.classList.add('on');
  setTimeout(() => el.classList.remove('on'), 720);
}

/* 开启手提箱：现实线随机去一条记忆线，记忆线则回到现实 */
function travel() {
  if (state.busy) return;
  const pool = WORLDS.filter((w) => w.id !== 'lobby' && w.id !== state.world.id);
  const target = state.world.id === 'lobby'
    ? pool[Math.floor(Math.random() * pool.length)]
    : WORLDS[0];
  flash();
  toast(
    state.world.id === 'lobby' ? '时空锁 · 开启' : '时空锁 · 归位',
    state.world.id === 'lobby'
      ? `手提箱替你选了一条线——正在被拉入「${target.name}」。`
      : '这一趟的记忆已经收好，正在回到现实展厅。'
  );
  return switchWorld(target.id);
}

/* 某条世界线的碎片全部集齐 → 解锁该线结局 */
function checkEnding(worldId) {
  const list = FRAGMENTS[worldId] || [];
  if (!list.length) return;
  const got = [...state.unlocked].filter((k) => k.startsWith(worldId + ':')).length;
  if (got < list.length || state.ended.has(worldId)) return;

  state.ended.add(worldId);
  store.set('ms_end', JSON.stringify([...state.ended]));
  setTimeout(() => {
    const e = ENDINGS[worldId];
    if (!e) return;
    $('#endTitle').textContent = e.title;
    $('#endSub').textContent = e.sub;
    $('#endText').textContent = e.text;
    $('#ending').classList.add('on');
    flash();
    if (state.ended.size === 3) {
      toast('三条世界线 · 全部走完', '时空不会被改写，但遗憾会被看见。');
    }
  }, 900);
}

/* ───────────── 档案 / 盲盒 ───────────── */
function buildArchive() {
  $('#ovNav').innerHTML = ARCHIVE.map((a, i) =>
    `<button class="ovnav-i${i === 0 ? ' on' : ''}" data-i="${i}">${a.tab}<u>${a.en}</u></button>`
  ).join('');
  $('#ovContent').innerHTML = ARCHIVE[0].render();
  $$('#ovNav .ovnav-i').forEach((b) => b.addEventListener('click', () => {
    $$('#ovNav .ovnav-i').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    $('#ovContent').innerHTML = ARCHIVE[+b.dataset.i].render();
    $('#ovContent').scrollTop = 0;
  }));
}

const MEMORY_WORLDS = WORLDS.filter((w) => w.id !== 'lobby');
const MAIN_CAST = CAST.filter((c) => !c.hidden);
const HIDDEN_CAST = CAST.find((c) => c.hidden);
const HIDDEN_RATE = 0.12;   // 隐藏款出率

function drawBlindBox() {
  const btn = $('#drawBtn');
  btn.disabled = true;
  const stage = $('#bbStage');
  stage.innerHTML = `<div class="bb-idle">正在开启…</div>`;
  setTimeout(() => {
    const isHidden = HIDDEN_CAST && Math.random() < HIDDEN_RATE;
    const c = isHidden ? HIDDEN_CAST : MAIN_CAST[Math.floor(Math.random() * MAIN_CAST.length)];
    const w = isHidden
      ? WORLDS.find((x) => x.id === HIDDEN_CAST.only)
      : MEMORY_WORLDS[Math.floor(Math.random() * MEMORY_WORLDS.length)];
    const price = isHidden ? 99 : [69, 72, 75, 79][Math.floor(Math.random() * 4)];
    stage.innerHTML = `
      <div class="bb-card${isHidden ? ' rare' : ''}">
        <div class="bb-orb">${c.id}</div>
        <h3>${c.id} · ${c.code}</h3>
        <div class="bb-line">${w.skin} SKIN · ${w.name}</div>
        <p class="bb-desc">${c.trait}</p>
        <div class="bb-tags">
          <span>${w.relic}</span><span>${w.symbols[0]}</span>
          <span>${isHidden ? '隐藏款 · 地下城限定' : '常规款'}</span>
        </div>
        <div class="bb-rare">${isHidden ? `隐藏款参考价 ¥${price} · 不出端盒` : `单盒参考价 ¥${price} · 端盒 ¥299`}</div>
      </div>`;
    btn.disabled = false;
    // 联动场景
    switchWorld(w.id).then(() => switchCast(c.id));
  }, 560);
}

/* ───────────── 主循环 ───────────── */
let lastT = performance.now();
let elapsed = 0;
function tick() {
  requestAnimationFrame(tick);
  const now = performance.now();
  const dt = Math.min((now - lastT) / 1000, 0.06);
  lastT = now;
  elapsed += dt;
  animators.forEach((f) => f(elapsed, dt));
  controls.update();
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ───────────── 启动 ───────────── */
function boot() {
  // 载入遮罩
  const mask = document.createElement('div');
  mask.className = 'loading-mask';
  mask.id = 'loadingMask';
  mask.textContent = '正在载入角色…';
  document.body.appendChild(mask);

  buildTabs();
  buildGateStrip();
  buildCast();
  buildArchive();
  paintWorld();
  paintCast();
  paintFrag();
  buildWorld(state.world);
  tick();

  // 首个模型载入进度 → 开场条
  const bar = $('#introBar');
  const pct = $('#introPct');
  let done = false;
  loadModel(state.world, state.cast, (p) => {
    bar.style.width = `${Math.round(p * 92)}%`;
    pct.textContent = `正在连接时空锁… ${Math.round(p * 92)}%`;
  }).then((obj) => {
    done = true;
    bar.style.width = '100%';
    pct.textContent = '时空锁已就绪';
    $('#enterBtn').disabled = false;
    // 直接就位（进入后再播动画）
    currentModel = obj;
    modelSlot.add(obj);
  }).catch((e) => {
    console.error(e);
    pct.textContent = '载入失败：请通过本地服务器访问本页';
  });

  $('#enterBtn').addEventListener('click', () => {
    if (!done) return;
    $('#intro').classList.add('gone');
    setTimeout(() => { $('#intro').style.display = 'none'; }, 950);
    prefetch(state.cast);
  });

  // 顶栏 / 工具
  $('#travelBtn').addEventListener('click', travel);
  $('#archiveBtn').addEventListener('click', () => $('#archive').classList.add('on'));
  $('#blindBtn').addEventListener('click', () => $('#blindbox').classList.add('on'));
  $$('.overlay [data-close]').forEach((b) =>
    b.addEventListener('click', () => $('#' + b.dataset.close).classList.remove('on'))
  );
  $$('.overlay').forEach((o) => o.addEventListener('click', (e) => {
    if (e.target === o) o.classList.remove('on');
  }));
  $('#drawBtn').addEventListener('click', drawBlindBox);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.overlay').forEach((o) => o.classList.remove('on'));
  });

  $('#autoBtn').addEventListener('click', (e) => {
    state.autoRotate = !state.autoRotate;
    controls.autoRotate = state.autoRotate;
    e.target.classList.toggle('active', state.autoRotate);
  });
  $('#resetBtn').addEventListener('click', () => {
    camera.position.set(0.62, 1.52, 4.05);
    controls.target.set(0, 0.88, 0);
    controls.update();
  });

  // 调试钩子（供自动化检查使用）
  window.__MS__ = {
    THREE, state, camera, scene, controls,
    orbs: () => relicOrbs,
    gates: () => gateHits,
    suit: () => suitcaseHit,
    travel,
  };
}

boot();
