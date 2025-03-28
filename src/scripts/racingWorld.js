import * as THREE from 'https://esm.sh/three';

let lapCompleted = false; // Clearly place this at the top

export function createRacingScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000022);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 0);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const neonLight = new THREE.DirectionalLight(0x00ffff, 1);
  neonLight.position.set(0, 10, 5);
  scene.add(neonLight);

  // Futuristic Hovercraft
  const vehicle = new THREE.Group();

  const mainBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.5, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x003366, metalness: 0.7 })
  );
  mainBody.rotation.x = Math.PI / 2;
  vehicle.add(mainBody);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 8),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x333333, metalness: 1 })
  );
  cockpit.position.set(0, 0.3, 0);
  vehicle.add(cockpit);

  vehicle.position.y = 0.5;
  scene.add(vehicle);

  // Neon oval racetrack
  const trackShape = new THREE.Shape();
  trackShape.absellipse(0, 0, 45, 24, 0, Math.PI * 2, false, 0);
  const holeShape = new THREE.Shape();
  holeShape.absellipse(0, 0, 42, 21, 0, Math.PI * 2, true, 0);
  trackShape.holes.push(holeShape);

  const trackGeometry = new THREE.ExtrudeGeometry(trackShape, { depth: 0.2, bevelEnabled: false });
  const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x222244, metalness: 0.6 });
  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = -Math.PI / 2;
  scene.add(track);

  const neonEdge = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(trackShape.getPoints(100)),
    new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
  );
  neonEdge.rotation.x = -Math.PI / 2;
  neonEdge.position.y = 0.25;
  scene.add(neonEdge);

  // Vehicle controls
  const keysPressed = {};
  window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
  window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

  let speed = 0;
  let angle = 0;

  function updateVehicle() {
    if (keysPressed['w'] || keysPressed['ArrowUp']) speed = Math.min(speed + 0.005, 0.3);
    else if (keysPressed['s'] || keysPressed['ArrowDown']) speed = Math.max(speed - 0.005, -0.1);
    else speed *= 0.98;

    if (keysPressed['a'] || keysPressed['ArrowLeft']) angle += 0.03;
    if (keysPressed['d'] || keysPressed['ArrowRight']) angle -= 0.03;

    vehicle.position.x += Math.sin(angle) * speed;
    vehicle.position.z += Math.cos(angle) * speed;
    vehicle.rotation.y = angle;

    camera.position.lerp(new THREE.Vector3(
      vehicle.position.x, vehicle.position.y + 6, vehicle.position.z + 12
    ), 0.1);
    camera.lookAt(vehicle.position);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // UI: Lap Timer
  const timerDiv = document.createElement('div');
  timerDiv.style.position = 'fixed';
  timerDiv.style.top = '10px';
  timerDiv.style.left = '10px';
  timerDiv.style.color = '#00ffff';
  timerDiv.style.fontFamily = 'Arial, sans-serif';
  timerDiv.style.fontSize = '20px';
  document.body.appendChild(timerDiv);

  let startTime = Date.now();
  function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    timerDiv.innerHTML = `⏱️ Time: ${elapsed.toFixed(2)}s`;
  }

  // Checkpoints
  const checkpoints = [
    new THREE.Vector3(0, 0, -30),
    new THREE.Vector3(30, 0, 0),
    new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(-30, 0, 0)
  ];

  let checkpointIndex = 0;

  checkpoints.forEach((pos) => {
    const checkpointMesh = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
    );
    checkpointMesh.position.copy(pos);
    checkpointMesh.rotation.x = -Math.PI / 2;
    scene.add(checkpointMesh);
  });

  function checkCheckpoint() {
    const distance = vehicle.position.distanceTo(checkpoints[checkpointIndex]);
    if (distance < 2) {
      checkpointIndex = (checkpointIndex + 1) % checkpoints.length;
      if (checkpointIndex === 0 && !lapCompleted) {
        lapCompleted = true; // clearly prevent multiple triggers
        const lapTime = ((Date.now() - startTime) / 1000).toFixed(2);
        alert(`🎉 Lap Completed! Time: ${lapTime}s`);
  
        // Clearly reset keys to avoid sticky controls
        for (const key in keysPressed) {
          keysPressed[key] = false;
        }
  
        startTime = Date.now();  // reset timer for the next lap
        setTimeout(() => { lapCompleted = false; }, 1000); // allow subsequent laps clearly
      }
    }
  }

// Return Portal Visual
const returnPortalGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
const returnPortalMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xaa00aa });
const returnPortal = new THREE.Mesh(returnPortalGeometry, returnPortalMaterial);
returnPortal.position.set(0, 1, -15);
returnPortal.rotation.x = Math.PI / 2;
scene.add(returnPortal);

// Return Label
const returnCanvas = document.createElement('canvas');
returnCanvas.width = 256; returnCanvas.height = 64;
const returnCtx = returnCanvas.getContext('2d');
returnCtx.fillStyle = "#ffffff";
returnCtx.font = "20px Arial";
returnCtx.fillText("🔙 Return to Nexus", 10, 50);

const returnSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(returnCanvas) }));
returnSprite.scale.set(4, 1, 1);
returnSprite.position.set(0, 3, -15);
scene.add(returnSprite);

// Check for portal collision
function checkReturnPortal() {
  const distance = vehicle.position.distanceTo(returnPortal.position);
  if (distance < 2) {
    window.location.reload(); // Simplest way to reset to Nexus
  }
}

  
  function animate() {
    requestAnimationFrame(animate);
    updateVehicle();
    updateTimer();
    checkCheckpoint();
    checkReturnPortal(); // <-- Clearly added here
    renderer.render(scene, camera);
  }

  animate();
}
