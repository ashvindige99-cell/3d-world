import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/PointerLockControls.js";

let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000008, 0.016);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// SKY — dark gradient from near-black horizon to deep violet zenith
const skyGeo = new THREE.SphereGeometry(500, 32, 16);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    topColor:    { value: new THREE.Color(0x0d0035) },
    bottomColor: { value: new THREE.Color(0x000008) },
  },
  vertexShader: `
    varying float vY;
    void main() {
      vY = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying float vY;
    void main() {
      float t = clamp(vY / 400.0, 0.0, 1.0);
      t = t * t;
      gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
    }
  `,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// LIGHTS
const ambient = new THREE.AmbientLight(0x110022, 1.0);
scene.add(ambient);

const neonCyan = new THREE.PointLight(0x00ffff, 4, 45);
neonCyan.position.set(5, 5, 5);
scene.add(neonCyan);

const neonPink = new THREE.PointLight(0xff00aa, 3, 40);
neonPink.position.set(-8, 3, -15);
scene.add(neonPink);

const neonViolet = new THREE.PointLight(0x8800ff, 2.5, 35);
neonViolet.position.set(12, 4, -20);
scene.add(neonViolet);

// FLOOR — glossy dark purple
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x08001a,
  metalness: 0.95,
  roughness: 0.04,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// NEON HELPERS
function neonMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.0,
    roughness: 0.15,
    metalness: 0.1,
  });
}

function addLight(color, pos, intensity = 1.5, distance = 14) {
  const light = new THREE.PointLight(color, intensity, distance);
  light.position.set(...pos);
  scene.add(light);
}

// Neon bars
[
  { pos: [8,   3.0, -12], ry:  0.4, color: 0x00ffff, len: 6 },
  { pos: [-9,  2.0, -18], ry: -0.3, color: 0xff00aa, len: 5 },
  { pos: [3,   5.0, -25], ry:  0.7, color: 0x7700ff, len: 7 },
  { pos: [-5,  1.5,  -8], ry:  1.1, color: 0x00ff88, len: 4 },
  { pos: [15,  4.0, -15], ry: -0.5, color: 0xff5500, len: 6 },
  { pos: [-14, 3.5, -22], ry:  0.2, color: 0x00aaff, len: 5 },
].forEach(({ pos, ry, color, len }) => {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.07), neonMat(color));
  bar.position.set(...pos);
  bar.rotation.y = ry;
  scene.add(bar);
  addLight(color, pos, 1.8, 14);
});

// Neon rings
[
  { pos: [6,   2.5, -14], color: 0x00ffff, r: 1.0 },
  { pos: [-7,  3.0, -22], color: 0xff00aa, r: 0.8 },
  { pos: [14,  2.0, -10], color: 0x00ff44, r: 1.2 },
  { pos: [-11, 4.0, -17], color: 0xaa00ff, r: 0.9 },
].forEach(({ pos, color, r }) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 16, 80), neonMat(color));
  ring.position.set(...pos);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  addLight(color, pos, 1.2, 10);
});

// Neon floating orbs
[
  { pos: [-4,  4.0, -16], color: 0xff00ff },
  { pos: [10,  3.5, -24], color: 0x00ffff },
  { pos: [-12, 2.5, -10], color: 0xffaa00 },
  { pos: [7,   5.5, -30], color: 0xff0055 },
].forEach(({ pos, color }) => {
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), neonMat(color));
  orb.position.set(...pos);
  scene.add(orb);
  addLight(color, pos, 2.5, 12);
});

// Neon vertical pillars (thin boxes standing upright)
[
  { pos: [9,  1.5, -18], color: 0x00ffdd, h: 3 },
  { pos: [-6, 1.0, -27], color: 0xff0088, h: 2 },
  { pos: [18, 2.0, -12], color: 0x6600ff, h: 4 },
].forEach(({ pos, color, h }) => {
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), neonMat(color));
  pillar.position.set(pos[0], pos[1], pos[2]);
  scene.add(pillar);
  addLight(color, [pos[0], pos[1] + h / 2, pos[2]], 1.2, 10);
});

// PLAYER CONTROLS
const controls = new PointerLockControls(camera, document.body);

document.getElementById("overlay").onclick = () => controls.lock();
controls.addEventListener("lock",   () => { document.getElementById("overlay").style.display = "none"; });
controls.addEventListener("unlock", () => { document.getElementById("overlay").style.display = "flex"; });
scene.add(controls.getObject());

// MOVEMENT
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const speed = 0.1;

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") moveForward  = true;
  if (e.code === "KeyS") moveBackward = true;
  if (e.code === "KeyA") moveLeft     = true;
  if (e.code === "KeyD") moveRight    = true;
});
document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") moveForward  = false;
  if (e.code === "KeyS") moveBackward = false;
  if (e.code === "KeyA") moveLeft     = false;
  if (e.code === "KeyD") moveRight    = false;
});

// SCREENS
const loader = new THREE.TextureLoader();
function createScreen(x, z, img) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 3),
    new THREE.MeshBasicMaterial({ map: loader.load(img) })
  );
  mesh.position.set(x, 2, z);
  scene.add(mesh);
}
createScreen(0,   -10, "./assets/images/screen1.jpg");
createScreen(10,  -20, "./assets/images/screen2.jpg");
createScreen(-10, -20, "./assets/images/screen3.jpg");

// ANIMATE
function animate() {
  requestAnimationFrame(animate);
  velocity.set(0, 0, 0);
  if (moveForward)  velocity.z -= speed;
  if (moveBackward) velocity.z += speed;
  if (moveLeft)     velocity.x -= speed;
  if (moveRight)    velocity.x += speed;
  controls.moveRight(velocity.x);
  controls.moveForward(velocity.z);
  renderer.render(scene, camera);
}
animate();
  
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});