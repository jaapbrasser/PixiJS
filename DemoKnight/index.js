// index.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/PointerLockControls.js";
import * as PIXI from "https://unpkg.com/pixi.js@8.3.3/dist/pixi.min.mjs";

const DPR = Math.min(window.devicePixelRatio || 1, 2);

function getSize() {
  return { w: window.innerWidth, h: window.innerHeight };
}

const { w: WIDTH, h: HEIGHT } = getSize();

/** ---------------------------
 * Three.js setup (3D)
 * -------------------------- */
const threeRenderer = new THREE.WebGLRenderer({
  antialias: true,
  stencil: true,
  powerPreference: "high-performance",
});
threeRenderer.setPixelRatio(DPR);
threeRenderer.setSize(WIDTH, HEIGHT);
threeRenderer.setClearColor(0x02030a, 1);
document.body.appendChild(threeRenderer.domElement);

// Make canvas focusable so keyboard + pointer lock behave consistently
threeRenderer.domElement.tabIndex = 0;
threeRenderer.domElement.style.outline = "none";
threeRenderer.domElement.focus();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x02030a, 45, 140);

const camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 400);
camera.position.set(0, 8, 45);

const controls = new PointerLockControls(camera, threeRenderer.domElement);
scene.add(controls.getObject());

// Click to lock pointer and ensure focus for keyboard input
threeRenderer.domElement.addEventListener("click", () => {
  threeRenderer.domElement.focus();
  controls.lock();
});

// Debug (optional)
// controls.addEventListener("lock", () => console.log("Pointer locked"));
// controls.addEventListener("unlock", () => console.log("Pointer unlocked"));

/** ---------------------------
 * Input
 * -------------------------- */
const keys = {
  forward: false,
  back: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

const controlKeys = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "Space",
  "ShiftLeft",
  "ShiftRight",
]);

window.addEventListener("keydown", (e) => {
  if (controlKeys.has(e.code)) e.preventDefault();
  switch (e.code) {
    case "KeyW": keys.forward = true; break;
    case "KeyS": keys.back = true; break;
    case "KeyA": keys.left = true; break;
    case "KeyD": keys.right = true; break;
    case "Space": keys.up = true; break;
    case "ShiftLeft":
    case "ShiftRight": keys.down = true; break;
  }
}, { passive: false });

window.addEventListener("keyup", (e) => {
  if (controlKeys.has(e.code)) e.preventDefault();
  switch (e.code) {
    case "KeyW": keys.forward = false; break;
    case "KeyS": keys.back = false; break;
    case "KeyA": keys.left = false; break;
    case "KeyD": keys.right = false; break;
    case "Space": keys.up = false; break;
    case "ShiftLeft":
    case "ShiftRight": keys.down = false; break;
  }
}, { passive: false });

const direction = new THREE.Vector3();
const clock = new THREE.Clock();

/** ---------------------------
 * Lights / environment
 * -------------------------- */
const ambient = new THREE.AmbientLight(0x223355, 0.6);
scene.add(ambient);

const moonLight = new THREE.DirectionalLight(0xbfd8ff, 0.8);
moonLight.position.set(-30, 50, -20);
scene.add(moonLight);

/** Ground */
const groundGeo = new THREE.PlaneGeometry(260, 260, 1, 1);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0b1020,
  roughness: 1.0,
  metalness: 0.0,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

/** Moon */
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xdde8ff,
    emissive: 0xaabfff,
    emissiveIntensity: 0.25,
    roughness: 1.0,
  })
);
moon.position.set(-25, 35, -55);
scene.add(moon);

/** Stars */
function makeStars(count = 1200) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1) * 180;
    const y = Math.random() * 120 + 10;
    const z = -Math.random() * 220 - 30;
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xeef3ff, size: 0.6, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars());

/** ---------------------------
 * Castle
 * -------------------------- */
function makeCastle() {
  const castle = new THREE.Group();
  castle.position.set(0, 0, -85);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x2a2f3a,
    roughness: 1.0,
    metalness: 0.0,
  });

  const keep = new THREE.Mesh(new THREE.BoxGeometry(26, 18, 18), stoneMat);
  keep.position.set(0, 9, 0);
  castle.add(keep);

  const battlement = new THREE.Mesh(new THREE.BoxGeometry(28, 2, 20), stoneMat);
  battlement.position.set(0, 18.5, 0);
  castle.add(battlement);

  const wall = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 10), stoneMat);
  wall.position.set(0, 5, 20);
  castle.add(wall);

  const gate = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 11), stoneMat);
  gate.position.set(0, 5, 20);
  castle.add(gate);

  const gateInset = new THREE.Mesh(
    new THREE.BoxGeometry(7, 7, 1),
    new THREE.MeshStandardMaterial({ color: 0x0a0b10, roughness: 1 })
  );
  gateInset.position.set(0, 4, 25.6);
  castle.add(gateInset);

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 1 });

  const towerPositions = [
    [-24, 0, 18],
    [24, 0, 18],
    [-18, 0, -6],
    [18, 0, -6],
  ];

  for (const [tx, , tz] of towerPositions) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 16, 18), stoneMat);
    tower.position.set(tx, 8, tz);
    castle.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 6.5, 18), roofMat);
    roof.position.set(tx, 17.5, tz);
    castle.add(roof);
  }

  const torch1 = new THREE.PointLight(0xffa35a, 1.3, 50, 2);
  torch1.position.set(-8, 8, 26);
  const torch2 = new THREE.PointLight(0xffa35a, 1.3, 50, 2);
  torch2.position.set(8, 8, 26);
  castle.add(torch1, torch2);

  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffc27a,
    emissive: 0xff7b2f,
    emissiveIntensity: 1,
  });
  const flameGeo = new THREE.SphereGeometry(0.6, 12, 12);
  const flame1 = new THREE.Mesh(flameGeo, flameMat);
  flame1.position.copy(torch1.position);
  const flame2 = new THREE.Mesh(flameGeo, flameMat);
  flame2.position.copy(torch2.position);
  castle.add(flame1, flame2);

  castle.userData.torches = [torch1, torch2];
  return castle;
}

const castle = makeCastle();
scene.add(castle);

/** ---------------------------
 * Knight
 * -------------------------- */
function makeKnight() {
  const group = new THREE.Group();
  group.position.set(0, 0, -10);

  const armor = new THREE.MeshStandardMaterial({ color: 0xb9c4d2, roughness: 0.35, metalness: 0.7 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x28314a, roughness: 1.0, metalness: 0.0 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x2b1f18, roughness: 1.0, metalness: 0.0 });
  const redFlag = new THREE.MeshStandardMaterial({ color: 0xb8182a, roughness: 1.0, metalness: 0.0 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 3), leather);
  body.position.set(0, 2.2, 0);
  group.add(body);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.2), leather);
  neck.position.set(4.2, 3.2, 0);
  group.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 2.0), leather);
  head.position.set(5.8, 3.6, 0);
  group.add(head);

  const legGeo = new THREE.BoxGeometry(0.7, 2.2, 0.7);
  const legOffsets = [
    [-3, 0.9, -1.0],
    [-3, 0.9, 1.0],
    [3, 0.9, -1.0],
    [3, 0.9, 1.0],
  ];
  const legs = [];
  for (const [lx, ly, lz] of legOffsets) {
    const leg = new THREE.Mesh(legGeo, leather);
    leg.position.set(lx, ly, lz);
    group.add(leg);
    legs.push(leg);
  }

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.3), armor);
  torso.position.set(0.4, 4.5, 0);
  group.add(torso);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.75, 18, 18), armor);
  helmet.position.set(0.4, 6.0, 0);
  group.add(helmet);

  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.25, 20), cloth);
  shield.rotation.z = Math.PI / 2;
  shield.position.set(1.4, 4.7, -1.0);
  group.add(shield);

  const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 9.0, 10), armor);
  lance.rotation.z = Math.PI / 2;
  lance.position.set(2.5, 5.2, 0);
  group.add(lance);

  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4, 1, 1), redFlag);
  flag.position.set(0.8, 0.7, 0);

  const flagHolder = new THREE.Group();
  flagHolder.position.set(6.7, 5.2, 0);
  flagHolder.add(flag);
  group.add(flagHolder);

  group.userData = { legs, flag };
  return group;
}

const knight = makeKnight();
scene.add(knight);

/** ---------------------------
 * PixiJS overlay (shared WebGL context)
 * -------------------------- */
const pixiRenderer = new PIXI.WebGLRenderer();
await pixiRenderer.init({
  context: threeRenderer.getContext(),
  width: WIDTH,
  height: HEIGHT,
  clearBeforeRender: false,
  resolution: DPR,
});

const stage = new PIXI.Container();

const hudBg = new PIXI.Graphics()
  .roundRect(16, 16, 420, 70, 12)
  .fill({ color: 0x000000, alpha: 0.35 });
stage.addChild(hudBg);

const title = new PIXI.Text({
  text: "Night Patrol",
  style: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 18,
    fill: 0xeef3ff,
  },
});
title.position.set(28, 22);
stage.addChild(title);

const subtitle = new PIXI.Text({
  text: "Click canvas to look around • WASD move • Space/Shift up/down • ESC unlock",
  style: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 12,
    fill: 0xbfd0ff,
  },
});
subtitle.position.set(28, 46);
stage.addChild(subtitle);

/** ---------------------------
 * Animation loop
 * -------------------------- */
let t = 0;

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;

  // --- Movement FIRST (before rendering) ---
  direction.set(
    Number(keys.right) - Number(keys.left),
    Number(keys.up) - Number(keys.down),
    Number(keys.forward) - Number(keys.back)
  );

  if (controls.isLocked) {
    const speed = 24;

    if (direction.z !== 0) controls.moveForward(direction.z * speed * dt);
    if (direction.x !== 0) controls.moveRight(direction.x * speed * dt);

    if (direction.y !== 0) {
      controls.getObject().position.y += direction.y * (speed * 0.6) * dt;
    }

    // Keep above ground
    controls.getObject().position.y = Math.max(1.6, controls.getObject().position.y);
  }

  // --- Scene animation ---
  knight.position.x = Math.sin(t * 0.35) * 8;
  knight.position.z = -10 + Math.cos(t * 0.35) * 2;
  knight.rotation.y = Math.sin(t * 0.2) * 0.15;

  const legs = knight.userData.legs;
  for (let i = 0; i < legs.length; i++) {
    const phase = i % 2 === 0 ? 0 : Math.PI;
    legs[i].rotation.x = Math.sin(t * 4 + phase) * 0.35;
  }

  const flag = knight.userData.flag;
  flag.rotation.y = Math.sin(t * 6) * 0.25;
  flag.rotation.x = Math.sin(t * 5.2) * 0.08;

  const torches = castle.userData.torches;
  if (torches?.length) {
    const flickerA = 1 + (Math.sin(t * 18) * 0.15 + Math.sin(t * 27) * 0.1);
    const flickerB = 1 + (Math.sin(t * 16.2) * 0.15 + Math.sin(t * 25.5) * 0.1);
    torches[0].intensity = 1.2 * flickerA;
    torches[1].intensity = 1.2 * flickerB;
  }

  // --- Render Three then Pixi ---
  threeRenderer.resetState();
  threeRenderer.render(scene, camera);

  pixiRenderer.render({ container: stage });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

/** ---------------------------
 * Resize handling
 * -------------------------- */
window.addEventListener("resize", () => {
  const { w, h } = getSize();

  threeRenderer.setPixelRatio(DPR);
  threeRenderer.setSize(w, h);

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  // Pixi v8 resize
  pixiRenderer.resize(w, h);
});
