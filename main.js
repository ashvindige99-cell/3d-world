import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js?module";

// SCENE
let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 80);

// CAMERA
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 1.6;

// RENDERER
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// LIGHTS
const ambient = new THREE.AmbientLight(0xff00ff, 0.4);
scene.add(ambient);

const neonLight = new THREE.PointLight(0x00ffff, 2, 50);
neonLight.position.set(5, 5, 5);
scene.add(neonLight);

// FLOOR
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.8,
  roughness: 0.2,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// CONTROLS
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const overlay = document.getElementById("overlay");

// CLICK TO START
overlay.addEventListener("click", (e) => {
  e.preventDefault();
  controls.lock();
});

// LOCK EVENTS
controls.addEventListener("lock", () => {
  overlay.style.display = "none";
});

controls.addEventListener("unlock", () => {
  overlay.style.display = "flex";
});

// BACKUP CLICK (important)
window.addEventListener("click", () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

// MOVEMENT FLAGS
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const velocity = new THREE.Vector3();
const speed = 0.1;

// KEY INPUT
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") moveForward = true;
  if (e.code === "KeyS") moveBackward = true;
  if (e.code === "KeyA") moveLeft = true;
  if (e.code === "KeyD") moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") moveForward = false;
  if (e.code === "KeyS") moveBackward = false;
  if (e.code === "KeyA") moveLeft = false;
  if (e.code === "KeyD") moveRight = false;
});

// TEXTURES
const loader = new THREE.TextureLoader();

function createScreen(x, z, img) {
  const tex = loader.load(img);
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const geo = new THREE.PlaneGeometry(6, 3);
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(x, 2, z);
  scene.add(mesh);
}

// SCREENS (use correct paths)
createScreen(0, -10, "assets/images/screen1.jpg");
createScreen(10, -20, "assets/images/screen2.jpg");
createScreen(-10, -20, "assets/images/screen3.jpg");

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);

  velocity.x = 0;
  velocity.z = 0;

  if (moveForward) velocity.z -= speed;
  if (moveBackward) velocity.z += speed;
  if (moveLeft) velocity.x -= speed;
  if (moveRight) velocity.x += speed;

  controls.moveRight(velocity.x);
  controls.moveForward(velocity.z);

  renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});