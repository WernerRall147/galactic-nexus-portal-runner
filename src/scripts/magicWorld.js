import * as THREE from 'https://esm.sh/three';

// Check Artifact Collection
  let artifactCollected = false; // add clearly at the top with your other variables

export function createMagicScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x110022);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 10);

  // Lighting setup
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pointLight = new THREE.PointLight(0xffaaee, 1.5, 30);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  // Floor (Ancient Ruins Platform)
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x332244, emissive: 0x110022 })
  );
  scene.add(floor);

  // Player placeholder (simple sphere)
  const player = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
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

    camera.position.set(player.position.x, player.position.y + 5, player.position.z + 8);
    camera.lookAt(player.position);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

// Rune setup
const runes = [];
const activatedRunes = new Set();

function createRune(x, z, id) {
  const rune = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x8800ff, emissive: 0x220044 })
  );
  rune.position.set(x, 1, z);
  rune.userData = { id };
  scene.add(rune);
  runes.push(rune);
}

// Create two runes clearly placed
createRune(-3, 0, "rune1");
createRune(3, 0, "rune2");

// Check Rune Activation
function checkRunes() {
  runes.forEach(rune => {
    const distance = player.position.distanceTo(rune.position);
    if (distance < 1 && !activatedRunes.has(rune.userData.id)) {
      activatedRunes.add(rune.userData.id);
      rune.material.color.setHex(0x00ff00);
      rune.material.emissive.setHex(0x005500);
    }
  });

  if (activatedRunes.size === runes.length && !scene.getObjectByName('artifact')) {
    spawnArtifact();
  }
}

// Spawn artifact after runes activated
function spawnArtifact() {
    const artifact = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0x664400 })
    );
    artifact.position.y = 2;
    artifact.name = 'artifact';
    scene.add(artifact);
  }

  // Optimized artifact check
  function checkArtifact() {
    const artifact = scene.getObjectByName('artifact');
    if (!artifactCollected && artifact && player.position.distanceTo(artifact.position) < 1.5) {
      artifactCollected = true;
      alert('✨ Artifact Collected! Return to Nexus.');
  
      // Immediately reset all keys to prevent sticky movement clearly
      for (const key in keysPressed) {
        keysPressed[key] = false;
      }
  
      artifact.material.color.setHex(0xffffff);
      artifact.material.emissive.setHex(0xffffff);
    }
  }
  
  
// Return Portal to Nexus (Magic World)
const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.2, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00aaaa })
  );
  returnPortal.position.set(0, 1, 5);
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
  portalSprite.position.set(0, 2.5, 5);
  scene.add(portalSprite);
  
  // Check Portal Collision for Return
  function checkReturnPortal() {
    if (player.position.distanceTo(returnPortal.position) < 1.5) {
      window.location.reload(); // simplest clear return to Nexus
    }
  }
  

  function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    checkRunes();
    checkArtifact();
    checkReturnPortal();  // <-- clearly add this line
    renderer.render(scene, camera);
  }

  animate();
}
