import * as THREE from 'https://esm.sh/three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010); // Slightly off-black background for depth

// Camera setup (third-person view)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Basic lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Player (simple capsule or box placeholder)
const playerGeometry = new THREE.CapsuleGeometry(0.3, 0.7, 4, 8);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
scene.add(player);

// Movement controls
const keysPressed = {};
window.addEventListener('keydown', (event) => { keysPressed[event.key] = true; });
window.addEventListener('keyup', (event) => { keysPressed[event.key] = false; });

const playerSpeed = 0.05;

function updatePlayer() {
  if (keysPressed['w'] || keysPressed['ArrowUp']) player.position.z -= playerSpeed;
  if (keysPressed['s'] || keysPressed['ArrowDown']) player.position.z += playerSpeed;
  if (keysPressed['a'] || keysPressed['ArrowLeft']) player.position.x -= playerSpeed;
  if (keysPressed['d'] || keysPressed['ArrowRight']) player.position.x += playerSpeed;

  // Simple camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.lookAt(player.position.x, player.position.y, player.position.z);
}

// Handle responsive canvas
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ground plane (Nexus floor)
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Nexus platform (central circular area)
const nexusGeometry = new THREE.CylinderGeometry(5, 5, 0.2, 32);
const nexusMaterial = new THREE.MeshStandardMaterial({ color: 0x4444aa, emissive: 0x111133 });
const nexusPlatform = new THREE.Mesh(nexusGeometry, nexusMaterial);
nexusPlatform.position.y = 0.1;
scene.add(nexusPlatform);

// Portal creation function (AI-generated)
function createPortal(color, x, z, label) {
  const portalGeometry = new THREE.TorusGeometry(0.6, 0.15, 16, 100);
  const portalMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.7
  });
  const portal = new THREE.Mesh(portalGeometry, portalMaterial);
  portal.position.set(x, 1, z);
  portal.rotation.x = Math.PI / 2;
  scene.add(portal);

  // Label creation for clarity
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText(label, 10, 50);
  
  const texture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(labelMaterial);
  sprite.scale.set(2, 0.5, 1);
  sprite.position.set(x, 2.2, z);
  scene.add(sprite);
}

// Create three placeholder portals
createPortal(0xff5555, -3, -3, "🏎️ Racing World");
createPortal(0x55ff55, 0, -4, "✨ Magic/Puzzle World");
createPortal(0x5555ff, 3, -3, "⚔️ Combat World");


// Decorative central artifact (simple visual anchor)
const artifactGeometry = new THREE.IcosahedronGeometry(0.7, 0);
const artifactMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0x550055 });
const centralArtifact = new THREE.Mesh(artifactGeometry, artifactMaterial);
centralArtifact.position.y = 1.2;
scene.add(centralArtifact);

// Add subtle rotation animation to central artifact
function rotateArtifact() {
  centralArtifact.rotation.y += 0.005;
}

// Adjust lighting for a better atmosphere
scene.add(new THREE.PointLight(0xff00ff, 1.5, 15, 1));


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  rotateArtifact();  // <-- Add this new function call
  renderer.render(scene, camera);
}


animate();
