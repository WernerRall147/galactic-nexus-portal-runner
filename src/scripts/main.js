import * as THREE from 'https://esm.sh/three';
import { createCombatScene } from './combatWorld.js';

let currentScene = "nexus";

// Nexus Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.innerHTML = '';
document.body.appendChild(renderer.domElement);

createCombatScene(renderer);

// Lighting setup
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Player setup
const playerGeometry = new THREE.CapsuleGeometry(0.3, 0.7, 4, 8);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
scene.add(player);

// Ground plane
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Nexus platform
const nexusPlatform = new THREE.Mesh(
  new THREE.CylinderGeometry(5, 5, 0.2, 32),
  new THREE.MeshStandardMaterial({ color: 0x4444aa, emissive: 0x111133 })
);
nexusPlatform.position.y = 0.1;
scene.add(nexusPlatform);

// Central artifact
const centralArtifact = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.7, 0),
  new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0x550055 })
);
centralArtifact.position.y = 1.2;
scene.add(centralArtifact);

// Portal creation
const portals = [];
function createPortal(color, x, z, label, worldName) {
  const portal = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.15, 16, 100),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 })
  );
  portal.position.set(x, 1, z);
  portal.rotation.x = Math.PI / 2;
  scene.add(portal);

  // Label
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText(label, 10, 50);

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sprite.scale.set(2, 0.5, 1);
  sprite.position.set(x, 2.2, z);
  scene.add(sprite);

  portals.push({ mesh: portal, color, world: worldName });
}

// Only create each portal once clearly
createPortal(0xff5555, -3, -3, "🏎️ Racing World", "racing");
createPortal(0x55ff55, 0, -4, "✨ Magic/Puzzle World", "magic");
createPortal(0x5555ff, 3, -3, "⚔️ Combat World", "combat");

// Player movement controls
const keysPressed = {};
window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

function checkPortalCollision() {
  portals.forEach(portal => {
    if (player.position.distanceTo(portal.mesh.position) < 1) {
      portal.mesh.material.emissive.setHex(0xffffff);
      if (portal.world === "racing" && currentScene === "nexus") {
        switchToRacingWorld();
      }
    } else {
      portal.mesh.material.emissive.setHex(portal.color);
    }
  });
}

function updatePlayer() {
  if (keysPressed['w'] || keysPressed['ArrowUp']) player.position.z -= 0.05;
  if (keysPressed['s'] || keysPressed['ArrowDown']) player.position.z += 0.05;
  if (keysPressed['a'] || keysPressed['ArrowLeft']) player.position.x -= 0.05;
  if (keysPressed['d'] || keysPressed['ArrowRight']) player.position.x += 0.05;

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.lookAt(player.position);
  checkPortalCollision();
}

function rotateArtifact() {
  centralArtifact.rotation.y += 0.005;
}

// Animation loop
function animate() {
  if (currentScene === "nexus") {
    updatePlayer();
    rotateArtifact();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
}

animate();

// Switch to Racing World
function switchToRacingWorld() {
  currentScene = "racing";
  document.body.innerHTML = '';
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  createRacingScene(renderer);
}
