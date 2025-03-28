import * as THREE from 'https://esm.sh/three';

export function createCombatScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222211);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // Lighting setup
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const sunlight = new THREE.DirectionalLight(0xffeecc, 1);
  sunlight.position.set(10, 20, 10);
  scene.add(sunlight);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x444433 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Player placeholder
  const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.7, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x00ff88 })
  );
  player.position.y = 1;
  scene.add(player);

  // Controls
  const keysPressed = {};
  window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
  window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

  function updatePlayer() {
    if (keysPressed['w'] || keysPressed['ArrowUp']) player.position.z -= 0.05;
    if (keysPressed['s'] || keysPressed['ArrowDown']) player.position.z += 0.05;
    if (keysPressed['a'] || keysPressed['ArrowLeft']) player.position.x -= 0.05;
    if (keysPressed['d'] || keysPressed['ArrowRight']) player.position.x += 0.05;

    camera.position.set(player.position.x, player.position.y + 6, player.position.z + 8);
    camera.lookAt(player.position);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

// Enemy setup
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(0.7, 1, 0.7),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
enemy.position.set(5, 0.5, 5);
scene.add(enemy);

let enemyAlive = true;

function updateEnemy() {
  if (!enemyAlive) return;

  const direction = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
  enemy.position.addScaledVector(direction, 0.02);
}

function checkCombat() {
  if (!enemyAlive) return;

  const distance = player.position.distanceTo(enemy.position);
  if (distance < 1) {
    enemyAlive = false;
    enemy.material.color.setHex(0x555555); // enemy defeated visual
    spawnArtifact();
    alert('⚔️ Enemy Defeated! Artifact Spawned!');
  }
}

function spawnArtifact() {
  const artifact = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x006600 })
  );
  artifact.position.set(-5, 0.5, -5);
  artifact.name = 'artifact';
  scene.add(artifact);
}

function checkArtifactCollection() {
  const artifact = scene.getObjectByName('artifact');
  if (artifact && player.position.distanceTo(artifact.position) < 1.5) {
    alert('✨ Artifact Collected! Return to Nexus.');
    artifact.material.color.setHex(0xffffff);
    artifact.material.emissive.setHex(0xffffff);
  }
}

// Return Portal to Nexus (Combat World)
const returnPortal = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.2, 16, 100),
  new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xaaaa00 })
);
returnPortal.position.set(0, 1, -10);
returnPortal.rotation.x = Math.PI / 2;
scene.add(returnPortal);

// Portal Label
const portalCanvas = document.createElement('canvas');
portalCanvas.width = 256; portalCanvas.height = 64;
const portalCtx = portalCanvas.getContext('2d');
portalCtx.fillStyle = "#ffffff";
portalCtx.font = "20px Arial";
portalCtx.fillText("🔙 Return to Nexus", 10, 50);

const portalSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(portalCanvas) })
);
portalSprite.scale.set(4, 1, 1);
portalSprite.position.set(0, 2.5, -10);
scene.add(portalSprite);

// Check Return Portal Collision
function checkReturnPortal() {
  if (player.position.distanceTo(returnPortal.position) < 1.5) {
    window.location.reload(); // simplest clear return to Nexus
  }
}


  function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    updateEnemy();
    checkCombat();
    checkArtifactCollection();
    checkReturnPortal();  // <-- clearly add here
    renderer.render(scene, camera);
  }

  animate();
}
