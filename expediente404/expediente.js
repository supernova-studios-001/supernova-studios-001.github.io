// ==========================================
// EXPEDIENTE 404: JUEGO 3D WORLD CLIMA, FAUNA Y ADMIN PANEL
// ==========================================

let scene, camera, renderer;
let playerGroup;
let isGameInitialized = false;

// Estructura R15
let r15Parts = {};
let keys = { w: false, a: false, s: false, d: false, space: false, arrowleft: false, arrowright: false, shift: false };

// Físicas y Movimiento
let playerVelocityY = 0;
const gravity = -0.012;
const jumpStrength = 0.28; // Salto mas realista y nerfeado
let isJumping = false;
const floorY = 0.0;
let walkAnimTime = 0;

// Sistema de Estamina
let stamina = 100;
const maxStamina = 100;
let isSprinting = false;
let isStaminaExhausted = false;
let staminaCooldownTimer = 0;
let staminaBarFill, staminaBarContainer, staminaWarningEl;

// Estado de Natación y Límites
let isSwimming = false;
const islandRadius = 550;
const swimDepthRadius = 562;
const maxSwimRadius = 700;

// Cámara 360, Colisiones y Primera Persona
let isMouseDown = false;
let mouseX = 0, mouseY = 0;
let cameraAngleX = 0;
let cameraAngleY = 0.2;
let targetCameraDistance = 12;
let actualCameraDistance = 12;

// Elementos del Mundo e Iluminación
let waterMesh;
let clouds = [];
let colliders = [];
let buoysGroup;
let limitMessageEl;
let sunLight, ambientLight;
let firefliesGroup, fireflyParticles = [];

// Fauna y Estructuras
let rabbits = [];
let burrows = [];
// Fauna: Osos
let bears = [];
// Sistema de Clima, Tormentas e Invierno
let rainParticles, rainGeometry;
let snowParticles, snowGeometry;
let lightningLight;
let weatherState = 'clear'; // 'clear', 'cloudy', 'rain', 'snow'
let nextWeatherChange = Date.now() + 60000;

let isWinterActive = false;
let winterTimer = 0;
let snowAccumulation = 0; // De 0.0 (verde) a 1.0 (cubierto de nieve)

// Estado del Ciclo Día / Noche
let cycleTimeOffset = 0;

// CHUNKS Y OPTIMIZACIÓN
const CHUNK_SIZE = 50;
const RENDER_DISTANCE = 3;
const loadedChunks = new Map();

// Función de inicialización enlazada al botón de inicio del juego
function initGameEngine() {
  const container = document.getElementById('game-container');
  const canvas = document.getElementById('game-canvas');
  if (!container || !canvas || isGameInitialized) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x50b8ff);
  scene.fog = new THREE.Fog(0x50b8ff, 100, 450);

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1500);
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  // Sol con optimización de sombras para evitar tirones/lag al alargarse
  sunLight = new THREE.DirectionalLight(0xfff5cc, 1.2);
  sunLight.position.set(150, 200, 100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 600;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  lightningLight = new THREE.PointLight(0xb0e0ff, 0, 1000);
  lightningLight.position.set(0, 200, 0);
  scene.add(lightningLight);

  createUIOverlay(container);
  createStaminaUI(container);
  createAdminPanel(container);
  buildWaterAndBeachBase();
  buildBoundaryBuoys();
  createFireflies();
  initRainSystem();
  initSnowSystem();
  createR15Player();
  setupControls(canvas);

  isGameInitialized = true;
  animateGame();
}

// ------------------------------------------
// UI Y MENSAJES DE ADVERTENCIA
// ------------------------------------------
function createUIOverlay(container) {
  limitMessageEl = document.createElement('div');
  limitMessageEl.style.position = 'absolute';
  limitMessageEl.style.top = '15%';
  limitMessageEl.style.left = '50%';
  limitMessageEl.style.transform = 'translate(-50%, -50%)';
  limitMessageEl.style.padding = '12px 24px';
  limitMessageEl.style.backgroundColor = 'rgba(220, 38, 38, 0.85)';
  limitMessageEl.style.color = '#ffffff';
  limitMessageEl.style.fontFamily = 'Arial, sans-serif';
  limitMessageEl.style.fontWeight = 'bold';
  limitMessageEl.style.fontSize = '16px';
  limitMessageEl.style.borderRadius = '8px';
  limitMessageEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  limitMessageEl.style.pointerEvents = 'none';
  limitMessageEl.style.opacity = '0';
  limitMessageEl.style.transition = 'opacity 0.3s ease';
  limitMessageEl.style.zIndex = '1000';
  limitMessageEl.innerText = 'Límite alcanzado: Has llegado al final del área permitida para nadar';
  container.appendChild(limitMessageEl);
}

let limitTimer = null;
function showLimitWarning() {
  if (limitMessageEl) {
    limitMessageEl.style.opacity = '1';
    if (limitTimer) clearTimeout(limitTimer);
    limitTimer = setTimeout(() => {
      limitMessageEl.style.opacity = '0';
    }, 2000);
  }
}

// ------------------------------------------
// UI DE BARRA DE ESTAMINA
// ------------------------------------------
function createStaminaUI(container) {
  staminaBarContainer = document.createElement('div');
  staminaBarContainer.style.position = 'absolute';
  staminaBarContainer.style.bottom = '30px';
  staminaBarContainer.style.left = '50%';
  staminaBarContainer.style.transform = 'translateX(-50%)';
  staminaBarContainer.style.width = '220px';
  staminaBarContainer.style.height = '14px';
  staminaBarContainer.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
  staminaBarContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
  staminaBarContainer.style.borderRadius = '10px';
  staminaBarContainer.style.padding = '2px';
  staminaBarContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
  staminaBarContainer.style.zIndex = '1000';
  staminaBarContainer.style.display = 'flex';
  staminaBarContainer.style.alignItems = 'center';

  staminaBarFill = document.createElement('div');
  staminaBarFill.style.width = '100%';
  staminaBarFill.style.height = '100%';
  staminaBarFill.style.backgroundColor = '#38bdf8';
  staminaBarFill.style.borderRadius = '6px';
  staminaBarFill.style.transition = 'width 0.1s linear, background-color 0.3s ease';
  staminaBarContainer.appendChild(staminaBarFill);

  staminaWarningEl = document.createElement('div');
  staminaWarningEl.style.position = 'absolute';
  staminaWarningEl.style.bottom = '50px';
  staminaWarningEl.style.left = '50%';
  staminaWarningEl.style.transform = 'translateX(-50%)';
  staminaWarningEl.style.color = '#ef4444';
  staminaWarningEl.style.fontFamily = 'Arial, sans-serif';
  staminaWarningEl.style.fontSize = '12px';
  staminaWarningEl.style.fontWeight = 'bold';
  staminaWarningEl.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
  staminaWarningEl.style.opacity = '0';
  staminaWarningEl.style.transition = 'opacity 0.3s ease';
  staminaWarningEl.style.pointerEvents = 'none';
  staminaWarningEl.innerText = '¡AGOTADO! Recargando (20s)...';

  container.appendChild(staminaBarContainer);
  container.appendChild(staminaWarningEl);
}

function updateStaminaUI() {
  const pct = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));
  if (staminaBarFill) {
    staminaBarFill.style.width = `${pct}%`;
    if (isStaminaExhausted) {
      staminaBarFill.style.backgroundColor = '#ef4444';
    } else if (pct < 30) {
      staminaBarFill.style.backgroundColor = '#f59e0b';
    } else {
      staminaBarFill.style.backgroundColor = '#38bdf8';
    }
  }

  if (staminaWarningEl) {
    staminaWarningEl.style.opacity = isStaminaExhausted ? '1' : '0';
  }
}

// ------------------------------------------
// PANEL DE ADMINISTRACIÓN
// ------------------------------------------
function createAdminPanel(container) {
  const adminBtn = document.createElement('button');
  adminBtn.innerHTML = '⚙️ Admin Panel';
  adminBtn.style.position = 'absolute';
  adminBtn.style.top = '15px';
  adminBtn.style.right = '15px';
  adminBtn.style.padding = '10px 18px';
  adminBtn.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
  adminBtn.style.color = '#38bdf8';
  adminBtn.style.border = '1px solid #0284c7';
  adminBtn.style.borderRadius = '8px';
  adminBtn.style.cursor = 'pointer';
  adminBtn.style.fontWeight = 'bold';
  adminBtn.style.fontSize = '13px';
  adminBtn.style.zIndex = '2000';
  adminBtn.style.backdropFilter = 'blur(8px)';
  adminBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  container.appendChild(adminBtn);

  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.top = '60px';
  panel.style.right = '15px';
  panel.style.width = '230px';
  panel.style.backgroundColor = 'rgba(15, 23, 42, 0.92)';
  panel.style.color = '#ffffff';
  panel.style.padding = '18px';
  panel.style.borderRadius = '12px';
  panel.style.display = 'none';
  panel.style.flexDirection = 'column';
  panel.style.gap = '10px';
  panel.style.fontFamily = 'Arial, sans-serif';
  panel.style.fontSize = '13px';
  panel.style.zIndex = '2000';
  panel.style.border = '1px solid #334155';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
  panel.style.backdropFilter = 'blur(10px)';

  panel.innerHTML = `
    <div style="font-weight:bold; color:#38bdf8; text-align:center; font-size:15px; margin-bottom:4px; border-bottom:1px solid #334155; padding-bottom:6px;">
      🛠️ CONTROL DE MUNDO
    </div>
    
    <div style="font-size:11px; color:#94a3b8; font-weight:bold; text-transform:uppercase;">Tiempo y Ciclo:</div>
    <button id="btn-toggle-time" style="padding:8px; background:#0284c7; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;">
      ☀️ / 🌙 Alternar Día / Noche
    </button>

    <div style="font-size:11px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-top:6px;">Estado del Clima:</div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
      <button id="btn-weather-clear" style="padding:7px; background:#334155; color:white; border:none; border-radius:6px; cursor:pointer;">☀️ Despejado</button>
      <button id="btn-weather-cloudy" style="padding:7px; background:#334155; color:white; border:none; border-radius:6px; cursor:pointer;">☁️ Nublado</button>
      <button id="btn-weather-rain" style="padding:7px; background:#334155; color:white; border:none; border-radius:6px; cursor:pointer;">🌧️ Lluvia</button>
      <button id="btn-weather-snow" style="padding:7px; background:#0284c7; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">❄️ Invierno (3m)</button>
    </div>
  `;
  container.appendChild(panel);

  adminBtn.onclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  };

  document.getElementById('btn-toggle-time').onclick = () => {
    cycleTimeOffset += 390000;
  };

  document.getElementById('btn-weather-clear').onclick = () => { weatherState = 'clear'; };
  document.getElementById('btn-weather-cloudy').onclick = () => { weatherState = 'cloudy'; };
  document.getElementById('btn-weather-rain').onclick = () => { weatherState = 'rain'; };
  document.getElementById('btn-weather-snow').onclick = () => { triggerWinterEvent(); };
}

function triggerWinterEvent() {
  weatherState = 'snow';
  isWinterActive = true;
  winterTimer = Date.now() + 180000;
}

// ------------------------------------------
// MUNDO, PLAYA Y SISTEMAS DE CLIMA
// ------------------------------------------
function buildWaterAndBeachBase() {
  const waterGeo = new THREE.PlaneGeometry(3000, 3000, 32, 32);
  const waterMat = new THREE.MeshPhongMaterial({
    color: 0x0088cc,
    transparent: true,
    opacity: 0.8,
    shininess: 90,
    flatShading: true
  });
  waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = -0.8;
  scene.add(waterMesh);

  const beachWidth = 60;
  const beachGeo = new THREE.RingGeometry(islandRadius - beachWidth, islandRadius + 20, 128, 1);
  const beachMat = new THREE.MeshToonMaterial({ color: 0xe6c280, flatShading: true, side: THREE.DoubleSide });
  const beachMesh = new THREE.Mesh(beachGeo, beachMat);
  beachMesh.rotation.x = Math.PI / 2;
  beachMesh.position.y = 0.01;
  beachMesh.receiveShadow = true;
  scene.add(beachMesh);

  const baseGeo = new THREE.CylinderGeometry(islandRadius - 10, islandRadius - 10, 10, 64);
  const baseMat = new THREE.MeshToonMaterial({ color: 0x5bb343, flatShading: true });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -5;
  scene.add(baseMesh);

  for (let c = 0; c < 35; c++) {
    const cloudGroup = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let b = 0; b < 6; b++) {
      const part = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random() * 8 + 8, 1), mat);
      part.position.set(b * 5, Math.random() * 3, Math.random() * 5);
      cloudGroup.add(part);
    }
    cloudGroup.position.set(Math.random() * 800 - 400, 60 + Math.random() * 25, Math.random() * 800 - 400);
    scene.add(cloudGroup);
    clouds.push(cloudGroup);
  }
}

function initRainSystem() {
  const count = 1500;
  rainGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 300;
    positions[i + 1] = Math.random() * 100;
    positions[i + 2] = (Math.random() - 0.5) * 300;
  }
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.6,
    transparent: true,
    opacity: 0.6
  });
  rainParticles = new THREE.Points(rainGeometry, rainMat);
  rainParticles.visible = false;
  scene.add(rainParticles);
}

function initSnowSystem() {
  const count = 2000;
  snowGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 350;
    positions[i + 1] = Math.random() * 120;
    positions[i + 2] = (Math.random() - 0.5) * 350;
  }
  snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const snowMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    transparent: true,
    opacity: 0.85
  });
  snowParticles = new THREE.Points(snowGeometry, snowMat);
  snowParticles.visible = false;
  scene.add(snowParticles);
}

function createFireflies() {
  firefliesGroup = new THREE.Group();
  const count = 120;
  const fireflyGeo = new THREE.SphereGeometry(0.2, 8, 8);
  for (let i = 0; i < count; i++) {
    const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xccff33, transparent: true, opacity: 0.0 });
    const p = new THREE.Mesh(fireflyGeo, fireflyMat);
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (islandRadius - 20);
    p.position.set(Math.cos(angle) * dist, 1 + Math.random() * 4, Math.sin(angle) * dist);
    p.userData = { baseY: p.position.y, speed: 0.01 + Math.random() * 0.02, phase: Math.random() * Math.PI * 2 };
    firefliesGroup.add(p);
    fireflyParticles.push(p);
  }
  scene.add(firefliesGroup);
}

function buildBoundaryBuoys() {
  buoysGroup = new THREE.Group();
  const buoyCount = 72;
  const buoyGeo = new THREE.SphereGeometry(1.8, 12, 12);
  const buoyMat = new THREE.MeshToonMaterial({ color: 0xef4444, flatShading: true });
  const whiteBandMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const chainMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

  for (let i = 0; i < buoyCount; i++) {
    const angle = (i / buoyCount) * Math.PI * 2;
    const x = Math.cos(angle) * maxSwimRadius;
    const z = Math.sin(angle) * maxSwimRadius;
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.set(x, -0.2, z);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.5, 12), whiteBandMat);
    buoy.add(band);
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), chainMat);
    flagPole.position.y = 2;
    buoy.add(flagPole);
    buoysGroup.add(buoy);
  }
  scene.add(buoysGroup);
}

// ------------------------------------------
// GENERACIÓN DE CHUNKS Y MODELADO DE ÁRBOLES
// ------------------------------------------
function updateChunks(playerX, playerZ) {
  const currentChunkX = Math.floor((playerX + CHUNK_SIZE / 2) / CHUNK_SIZE);
  const currentChunkZ = Math.floor((playerZ + CHUNK_SIZE / 2) / CHUNK_SIZE);
  const activeKeys = new Set();

  for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
    for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
      const chunkX = currentChunkX + x;
      const chunkZ = currentChunkZ + z;
      const chunkKey = `${chunkX},${chunkZ}`;
      activeKeys.add(chunkKey);
      if (!loadedChunks.has(chunkKey)) {
        const chunkGroup = generateChunk(chunkX, chunkZ);
        scene.add(chunkGroup);
        loadedChunks.set(chunkKey, chunkGroup);
      }
    }
  }

  loadedChunks.forEach((chunkGroup, key) => {
    if (!activeKeys.has(key)) {
      scene.remove(chunkGroup);
      colliders = colliders.filter(c => c.chunkKey !== key);
      rabbits = rabbits.filter(r => r.chunkKey !== key);
      burrows = burrows.filter(b => b.chunkKey !== key);
      chunkGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      loadedChunks.delete(key);
    }
  });
}

function generateChunk(chunkX, chunkZ) {
  const chunkGroup = new THREE.Group();
  const chunkKey = `${chunkX},${chunkZ}`;
  const worldX = chunkX * CHUNK_SIZE;
  const worldZ = chunkZ * CHUNK_SIZE;
  const distFromCenter = Math.hypot(worldX, worldZ);

  if (distFromCenter <= islandRadius - 35) {
    const chunkGeo = new THREE.BoxGeometry(CHUNK_SIZE, 10, CHUNK_SIZE);
    const chunkMat = new THREE.MeshToonMaterial({ color: 0x5bb343, flatShading: true });
    const chunkMesh = new THREE.Mesh(chunkGeo, chunkMat);
    chunkMesh.position.set(worldX, -5, worldZ);
    chunkMesh.receiveShadow = true;
    chunkMesh.userData = { type: 'ground', baseColor: new THREE.Color(0x5bb343) };
    chunkGroup.add(chunkMesh);
  }

  if (distFromCenter < islandRadius - 55) {
    const treeCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < treeCount; i++) {
      const tx = worldX + (Math.random() - 0.5) * (CHUNK_SIZE - 10);
      const tz = worldZ + (Math.random() - 0.5) * (CHUNK_SIZE - 10);
      chunkGroup.add(createPineTreeMesh(tx, tz));
      colliders.push({ x: tx, z: tz, radius: 1.2, chunkKey });
    }

    if (Math.random() < 0.6) {
      const rx = worldX + (Math.random() - 0.5) * (CHUNK_SIZE - 10);
      const rz = worldZ + (Math.random() - 0.5) * (CHUNK_SIZE - 10);
      chunkGroup.add(createRockMesh(rx, rz));
      colliders.push({ x: rx, z: rz, radius: 1.5, chunkKey });
    }

    if (Math.random() < 0.12) {
      const bx = worldX + (Math.random() - 0.5) * (CHUNK_SIZE - 12);
      const bz = worldZ + (Math.random() - 0.5) * (CHUNK_SIZE - 12);
      const burrow = createBurrowMesh(bx, bz);
      chunkGroup.add(burrow);
      burrows.push({ x: bx, z: bz, chunkKey });

      const rabbit = createRabbitMesh(bx + 1.5, bz + 1.5);
      rabbit.userData = { homeX: bx, homeZ: bz, state: 'idle', animTime: Math.random() * 10, chunkKey };
      chunkGroup.add(rabbit);
      rabbits.push(rabbit);
    }
  }

  return chunkGroup;
}

function createPineTreeMesh(x, z) {
  const treeGroup = new THREE.Group();
  treeGroup.position.set(x, 0, z);

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 11, 8);
  const trunkMat = new THREE.MeshToonMaterial({ color: 0x2e180c, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 5.5;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  const leafMat = new THREE.MeshToonMaterial({ color: 0x1b4d2e, flatShading: true });
  const layers = 8;
  for (let i = 0; i < layers; i++) {
    const layerGroup = new THREE.Group();
    const progress = i / layers;
    const layerRadius = 4.2 * (1 - progress * 0.85);
    const yPos = 3.8 + i * 1.15;
    const branchCount = Math.floor(7 - progress * 3);

    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + (i * 0.7);
      const branchCone = new THREE.Mesh(new THREE.ConeGeometry(layerRadius * 0.55, 2.2, 5), leafMat);
      const dist = layerRadius * 0.45;
      branchCone.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      branchCone.rotation.x = 0.35;
      branchCone.rotation.y = angle;
      branchCone.castShadow = true;
      branchCone.userData = { type: 'foliage', baseColor: new THREE.Color(0x1b4d2e) };
      layerGroup.add(branchCone);
    }

    const centerCone = new THREE.Mesh(new THREE.ConeGeometry(layerRadius * 0.7, 2.5, 6), leafMat);
    centerCone.castShadow = true;
    centerCone.userData = { type: 'foliage', baseColor: new THREE.Color(0x1b4d2e) };
    layerGroup.add(centerCone);

    layerGroup.position.y = yPos;
    treeGroup.add(layerGroup);
  }

  return treeGroup;
}

function createRockMesh(x, z) {
  const rockGroup = new THREE.Group();
  rockGroup.position.set(x, 0, z);
  const rockGeo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 0.8, 1);
  const rockMat = new THREE.MeshToonMaterial({ color: 0x64748b, flatShading: true });
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.scale.set(1 + Math.random() * 0.4, 0.6 + Math.random() * 0.3, 1 + Math.random() * 0.4);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.position.y = 0.5;
  rock.castShadow = true;
  rock.receiveShadow = true;
  rockGroup.add(rock);
  return rockGroup;
}

function createBurrowMesh(x, z) {
  const burrowGroup = new THREE.Group();
  burrowGroup.position.set(x, 0, z);
  const moundGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.4, 12);
  const moundMat = new THREE.MeshToonMaterial({ color: 0x4a3525, flatShading: true });
  const mound = new THREE.Mesh(moundGeo, moundMat);
  mound.position.y = 0.2;
  burrowGroup.add(mound);

  const holeGeo = new THREE.CircleGeometry(0.65, 16);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f0a06 });
  const hole = new THREE.Mesh(holeGeo, holeMat);
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(0, 0.41, 0);
  burrowGroup.add(hole);
  return burrowGroup;
}

function createRabbitMesh(x, z) {
  const rabbitGroup = new THREE.Group();
  rabbitGroup.position.set(x, 0, z);
  const bodyMat = new THREE.MeshToonMaterial({ color: 0xf5f5f4, flatShading: true });
  const innerEarMat = new THREE.MeshToonMaterial({ color: 0xf472b6, flatShading: true });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), bodyMat);
  body.scale.set(0.9, 0.85, 1.1);
  body.position.y = 0.3;
  body.castShadow = true;
  rabbitGroup.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), bodyMat);
  head.position.set(0, 0.48, 0.22);
  head.castShadow = true;
  rabbitGroup.add(head);

  for (let side of [-1, 1]) {
    const earGroup = new THREE.Group();
    const earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.38, 8), bodyMat);
    const earInner = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.34, 8), innerEarMat);
    earInner.position.z = 0.01;
    earGroup.add(earOuter, earInner);
    earGroup.position.set(side * 0.1, 0.72, 0.2);
    earGroup.rotation.x = -0.15;
    earGroup.rotation.z = side * 0.15;
    rabbitGroup.add(earGroup);
  }

  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
    eye.position.set(side * 0.15, 0.52, 0.38);
    rabbitGroup.add(eye);
  }

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bodyMat);
  tail.position.set(0, 0.32, -0.42);
  rabbitGroup.add(tail);
  return rabbitGroup;
}

// ------------------------------------------
// PERSONAJE R15
// ------------------------------------------
function createR15Player() {
  playerGroup = new THREE.Group();
  playerGroup.position.set(0, floorY, 0);

  const skinMat = new THREE.MeshToonMaterial({ color: 0xffcd94, flatShading: true });
  const suitMat = new THREE.MeshToonMaterial({ color: 0x111116, flatShading: true });
  const shirtMat = new THREE.MeshToonMaterial({ color: 0x111116, flatShading: true });
  const tieMat = new THREE.MeshToonMaterial({ color: 0xffffff, flatShading: true });
  const shoeMat = new THREE.MeshToonMaterial({ color: 0x050505, flatShading: true });
  const hairMat = new THREE.MeshToonMaterial({ color: 0x1c1917, flatShading: true });
  const eyeColorMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  function createPart(geo, mat, parent, x, y, z) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.add(mesh);
    if (parent) parent.add(group);
    else playerGroup.add(group);
    return group;
  }

  r15Parts.lowerTorso = createPart(new THREE.CylinderGeometry(0.24, 0.22, 0.35, 14), suitMat, null, 0, 0.98, 0);
  r15Parts.upperTorso = createPart(new THREE.CylinderGeometry(0.35, 0.25, 0.65, 14), suitMat, r15Parts.lowerTorso, 0, 0.5, 0);

  const shirtFront = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.60, 0.08), shirtMat);
  shirtFront.position.set(0, 0.02, 0.23);
  shirtFront.rotation.x = -0.12;
  r15Parts.upperTorso.children[0].add(shirtFront);

  const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.06), tieMat);
  tieKnot.position.set(0, 0.24, 0.28);
  tieKnot.rotation.x = -0.12;
  r15Parts.upperTorso.children[0].add(tieKnot);

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.48, 0.05), tieMat);
  tie.position.set(0, -0.02, 0.28);
  tie.rotation.x = -0.12;
  r15Parts.upperTorso.children[0].add(tie);

  r15Parts.neck = createPart(new THREE.CylinderGeometry(0.10, 0.11, 0.18, 10), skinMat, r15Parts.upperTorso, 0, 0.4, 0);
  r15Parts.head = createPart(new THREE.SphereGeometry(0.32, 16, 16), skinMat, r15Parts.neck, 0, 0.24, 0);

  function createEye(x) {
    const eyeGroup = new THREE.Group();
    const eyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.02), whiteMat);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeColorMat);
    iris.position.set(0, 0, 0.015);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), pupilMat);
    pupil.position.set(0, 0, 0.03);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), whiteMat);
    shine.position.set(0.012, 0.012, 0.04);
    eyeGroup.add(eyeWhite, iris, pupil, shine);
    eyeGroup.position.set(x, 0.04, 0.29);
    return eyeGroup;
  }

  r15Parts.head.children[0].add(createEye(-0.11));
  r15Parts.head.children[0].add(createEye(0.11));

  const mouthShape = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.02), pupilMat);
  mouthShape.position.set(0, -0.11, 0.295);
  r15Parts.head.children[0].add(mouthShape);

  const hairGroup = new THREE.Group();
  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 12), hairMat);
  hairBase.position.set(0, 0.05, -0.02);
  hairGroup.add(hairBase);

  const topHair = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.25, 10), hairMat);
  topHair.position.set(0.02, 0.22, 0.02);
  topHair.rotation.z = -0.15;
  hairGroup.add(topHair);

  for (let i = -2; i <= 2; i++) {
    const strand = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), hairMat);
    strand.position.set(i * 0.05, 0.28, 0.12);
    strand.rotation.x = -0.7;
    strand.rotation.z = -0.1;
    hairGroup.add(strand);
  }
  r15Parts.head.children[0].add(hairGroup);

  r15Parts.leftUpperArm = createPart(new THREE.CylinderGeometry(0.12, 0.10, 0.38, 12), suitMat, r15Parts.upperTorso, -0.38, 0.12, 0);
  r15Parts.leftLowerArm = createPart(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 12), suitMat, r15Parts.leftUpperArm, 0, -0.34, 0);
  r15Parts.leftHand = createPart(new THREE.SphereGeometry(0.09, 10, 10), skinMat, r15Parts.leftLowerArm, 0, -0.22, 0);

  r15Parts.rightUpperArm = createPart(new THREE.CylinderGeometry(0.12, 0.10, 0.38, 12), suitMat, r15Parts.upperTorso, 0.38, 0.12, 0);
  r15Parts.rightLowerArm = createPart(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 12), suitMat, r15Parts.rightUpperArm, 0, -0.34, 0);
  r15Parts.rightHand = createPart(new THREE.SphereGeometry(0.09, 10, 10), skinMat, r15Parts.rightLowerArm, 0, -0.22, 0);

  r15Parts.leftUpperLeg = createPart(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 12), suitMat, r15Parts.lowerTorso, -0.13, -0.32, 0);
  r15Parts.leftLowerLeg = createPart(new THREE.CylinderGeometry(0.11, 0.09, 0.40, 12), suitMat, r15Parts.leftUpperLeg, 0, -0.42, 0);
  r15Parts.leftFoot = createPart(new THREE.BoxGeometry(0.14, 0.10, 0.30), shoeMat, r15Parts.leftLowerLeg, 0, -0.22, 0.05);

  r15Parts.rightUpperLeg = createPart(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 12), suitMat, r15Parts.lowerTorso, 0.13, -0.32, 0);
  r15Parts.rightLowerLeg = createPart(new THREE.CylinderGeometry(0.11, 0.09, 0.40, 12), suitMat, r15Parts.rightUpperLeg, 0, -0.42, 0);
  r15Parts.rightFoot = createPart(new THREE.BoxGeometry(0.14, 0.10, 0.30), shoeMat, r15Parts.rightLowerLeg, 0, -0.22, 0.05);

  scene.add(playerGroup);
}
// ==========================================
// CONTROLES Y EVENTOS
// ==========================================
function setupControls(canvas) {
  window.addEventListener('keydown', (e) => handleKey(e, true));
  window.addEventListener('keyup', (e) => handleKey(e, false));

  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => (isMouseDown = false));

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;
    cameraAngleX -= deltaX * 0.004;
    cameraAngleY += deltaY * 0.004;
    const maxPitch = Math.PI / 2 - 0.01;
    cameraAngleY = Math.max(-maxPitch, Math.min(maxPitch, cameraAngleY));
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetCameraDistance += e.deltaY * 0.02;
    targetCameraDistance = Math.max(0, Math.min(50, targetCameraDistance));
  }, { passive: false });
}

function handleKey(e, isPressed) {
  const key = e.key.toLowerCase();
  if (e.key === 'Shift') {
    keys.shift = isPressed;
  }

  const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'spacebar'];
  if (gameKeys.includes(key)) {
    e.preventDefault();
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    if (key === 'w' || key === 'arrowup') keys.w = isPressed;
    if (key === 's' || key === 'arrowdown') keys.s = isPressed;
    if (key === 'a') keys.a = isPressed;
    if (key === 'd') keys.d = isPressed;
    if (key === 'arrowleft') keys.arrowleft = isPressed;
    if (key === 'arrowright') keys.arrowright = isPressed;
    if (key === ' ' || key === 'spacebar') keys.space = isPressed;
  }
}

// ------------------------------------------
// CICLO DÍA / NOCHE Y CLIMA DINÁMICO
// ------------------------------------------
function updateDayNightCycle() {
  const dayMs = 480000;
  const nightMs = 300000;
  const totalCycle = dayMs + nightMs;
  const currentTime = (Date.now() + cycleTimeOffset) % totalCycle;

  let progress = 0;
  let isNightTime = false;

  if (currentTime < dayMs) {
    progress = (currentTime / dayMs) * 0.5;
  } else {
    progress = 0.5 + ((currentTime - dayMs) / nightMs) * 0.5;
    isNightTime = true;
  }

  const sunAngle = progress * Math.PI * 2;
  sunLight.position.x = playerGroup ? playerGroup.position.x + Math.cos(sunAngle) * 200 : Math.cos(sunAngle) * 200;
  sunLight.position.y = Math.sin(sunAngle) * 200 + 50;
  sunLight.position.z = playerGroup ? playerGroup.position.z + 100 : 100;
  if (playerGroup) {
    sunLight.target.position.copy(playerGroup.position);
    sunLight.target.updateMatrixWorld();
  }

  const dayColor = new THREE.Color(0x50b8ff);
  const sunsetColor = new THREE.Color(0xfdba74);
  const nightColor = new THREE.Color(0x060913);
  const cloudyColor = new THREE.Color(0x475569);
  const snowSkyColor = new THREE.Color(0xcbe3f0);

  let currentSkyColor = new THREE.Color();
  let sunIntensity = 1.2;
  let nightFactor = 0;

  if (progress < 0.45) {
    currentSkyColor.copy(dayColor);
    sunIntensity = 1.2;
    nightFactor = 0;
  } else if (progress < 0.5) {
    const t = (progress - 0.45) / 0.05;
    currentSkyColor.copy(dayColor).lerp(sunsetColor, t);
    sunIntensity = THREE.MathUtils.lerp(1.2, 0.2, t);
    nightFactor = t;
  } else if (progress < 0.95) {
    currentSkyColor.copy(nightColor);
    sunIntensity = 0.05;
    nightFactor = 1;
  } else {
    const t = (progress - 0.95) / 0.05;
    currentSkyColor.copy(nightColor).lerp(dayColor, t);
    sunIntensity = THREE.MathUtils.lerp(0.05, 1.2, t);
    nightFactor = 1 - t;
  }

  if (Date.now() > nextWeatherChange && !isWinterActive) {
    const rand = Math.random();
    if (rand < 0.4) weatherState = 'clear';
    else if (rand < 0.75) weatherState = 'cloudy';
    else weatherState = 'rain';
    nextWeatherChange = Date.now() + 60000 + Math.random() * 60000;
  }

  if (weatherState === 'cloudy' || weatherState === 'rain') {
    currentSkyColor.lerp(cloudyColor, 0.6);
    sunIntensity *= 0.5;
  } else if (weatherState === 'snow' || snowAccumulation > 0) {
    currentSkyColor.lerp(snowSkyColor, snowAccumulation * 0.7);
    sunIntensity *= (1 - snowAccumulation * 0.3);
  }

  scene.background.copy(currentSkyColor);
  scene.fog.color.copy(currentSkyColor);
  sunLight.intensity = sunIntensity;
  ambientLight.intensity = THREE.MathUtils.lerp(0.85, 0.15, nightFactor);

  if (weatherState === 'rain') {
    rainParticles.visible = true;
    snowParticles.visible = false;
    const positions = rainGeometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= 2.2;
      if (positions[i] < 0) positions[i] = 100;
    }
    rainGeometry.attributes.position.needsUpdate = true;
    rainParticles.position.set(playerGroup.position.x, 0, playerGroup.position.z);

    if (Math.random() < 0.015) {
      lightningLight.intensity = 8 + Math.random() * 10;
      const lx = playerGroup.position.x + (Math.random() - 0.5) * 400;
      const lz = playerGroup.position.z + (Math.random() - 0.5) * 400;
      lightningLight.position.set(lx, 150, lz);
    } else {
      lightningLight.intensity *= 0.7;
    }
  } else if (weatherState === 'snow' || snowAccumulation > 0) {
    rainParticles.visible = false;
    snowParticles.visible = true;
    const positions = snowGeometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= 0.35;
      if (positions[i] < 0) positions[i] = 100;
    }
    snowGeometry.attributes.position.needsUpdate = true;
    snowParticles.position.set(playerGroup.position.x, 0, playerGroup.position.z);
  } else {
    rainParticles.visible = false;
    snowParticles.visible = false;
    lightningLight.intensity = 0;
  }

  const time = Date.now() * 0.002;
  fireflyParticles.forEach((p) => {
    p.position.y = p.userData.baseY + Math.sin(time + p.userData.phase) * 0.5;
    p.position.x += Math.cos(time * 0.5 + p.userData.phase) * 0.02;
    p.position.z += Math.sin(time * 0.5 + p.userData.phase) * 0.02;
    const pulse = (Math.sin(time * 3 + p.userData.phase) + 1) / 2;
    p.material.opacity = pulse * nightFactor;
  });
}

// ------------------------------------------
// LÓGICA DE INVIERNO Y ACUMULACIÓN DE NIEVE
// ------------------------------------------
function updateWinterCycle() {
  if (isWinterActive) {
    if (snowAccumulation < 1.0) {
      snowAccumulation += 0.002;
    }
    if (Date.now() > winterTimer) {
      isWinterActive = false;
      weatherState = 'clear';
    }
  } else {
    if (snowAccumulation > 0) {
      snowAccumulation -= 0.001;
    }
  }

  const whiteSnowColor = new THREE.Color(0xf1f5f9);
  loadedChunks.forEach((chunkGroup) => {
    chunkGroup.traverse((child) => {
      if (child.isMesh && child.userData && child.userData.baseColor) {
        child.material.color.copy(child.userData.baseColor).lerp(whiteSnowColor, snowAccumulation * 0.85);
      }
    });
  });
}

// ------------------------------------------
// FAUNA (CONEJOS)
// ------------------------------------------
function updateRabbits() {
  if (!playerGroup) return;
  rabbits.forEach((rabbit) => {
    const distToPlayer = Math.hypot(
      playerGroup.position.x - rabbit.position.x,
      playerGroup.position.z - rabbit.position.z
    );

    if (distToPlayer < 12 && rabbit.userData.state !== 'inside') {
      rabbit.userData.state = 'fleeing';
    }

    if (rabbit.userData.state === 'fleeing') {
      rabbit.visible = true;
      const dirX = rabbit.userData.homeX - rabbit.position.x;
      const dirZ = rabbit.userData.homeZ - rabbit.position.z;
      const len = Math.hypot(dirX, dirZ);
      if (len > 0.4) {
        rabbit.position.x += (dirX / len) * 0.18;
        rabbit.position.z += (dirZ / len) * 0.18;
        rabbit.rotation.y = Math.atan2(dirX, dirZ);
        rabbit.position.y = Math.abs(Math.sin(Date.now() * 0.012)) * 0.4;
      } else {
        rabbit.userData.state = 'inside';
        rabbit.visible = false;
      }
    } else if (rabbit.userData.state === 'inside') {
      if (distToPlayer > 25) {
        rabbit.userData.state = 'idle';
        rabbit.position.set(rabbit.userData.homeX + 1, 0, rabbit.userData.homeZ + 1);
        rabbit.visible = true;
      }
    } else {
      rabbit.userData.animTime += 0.02;
      rabbit.position.y = 0;
      if (Math.sin(rabbit.userData.animTime) > 0.8) {
        rabbit.position.x += Math.sin(rabbit.userData.animTime * 2) * 0.02;
      }
    }
  });
}

// ------------------------------------------
// BUCLE PRINCIPAL DE ANIMACIÓN Y MOVIMIENTO
// ------------------------------------------
function animateGame() {
  requestAnimationFrame(animateGame);

  updateDayNightCycle();
  updateWinterCycle();
  updateRabbits();

  if (playerGroup) {
    const distFromCenter = Math.hypot(playerGroup.position.x, playerGroup.position.z);
    updateChunks(playerGroup.position.x, playerGroup.position.z);

    if (keys.arrowleft) cameraAngleX += 0.03;
    if (keys.arrowright) cameraAngleX -= 0.03;

    isSwimming = distFromCenter > swimDepthRadius;

    if (distFromCenter >= maxSwimRadius - 2) {
      const pushAngle = Math.atan2(playerGroup.position.z, playerGroup.position.x);
      playerGroup.position.x = Math.cos(pushAngle) * (maxSwimRadius - 3);
      playerGroup.position.z = Math.sin(pushAngle) * (maxSwimRadius - 3);
      showLimitWarning();
    }

    const isMovingInput = keys.w || keys.s || keys.a || keys.d;

    if (keys.shift && !isStaminaExhausted && stamina > 0 && isMovingInput) {
      isSprinting = true;
      stamina -= 0.35;
      if (stamina <= 0) {
        stamina = 0;
        isStaminaExhausted = true;
        staminaCooldownTimer = Date.now() + 20000;
      }
    } else {
      isSprinting = false;
      if (isStaminaExhausted) {
        if (Date.now() >= staminaCooldownTimer) {
          isStaminaExhausted = false;
        }
      } else if (stamina < maxStamina) {
        stamina += 0.2;
        if (stamina > maxStamina) stamina = maxStamina;
      }
    }

    updateStaminaUI();

    let moveSpeed = 0.15;
    if (isSwimming) {
      moveSpeed = isSprinting ? 0.18 : 0.12;
    } else {
      moveSpeed = isSprinting ? 0.32 : 0.15;
    }

    let isMoving = false;
    let inputX = 0;
    let inputZ = 0;

    if (keys.w) inputZ += 1;
    if (keys.s) inputZ -= 1;
    if (keys.a) inputX -= 1;
    if (keys.d) inputX += 1;

    if (inputX !== 0 || inputZ !== 0) {
      isMoving = true;

      const forwardX = -Math.sin(cameraAngleX);
      const forwardZ = -Math.cos(cameraAngleX);
      const rightX = Math.cos(cameraAngleX);
      const rightZ = -Math.sin(cameraAngleX);

      const dirX = forwardX * inputZ + rightX * inputX;
      const dirZ = forwardZ * inputZ + rightZ * inputX;

      const len = Math.hypot(dirX, dirZ);
      const normX = dirX / len;
      const normZ = dirZ / len;

      const nextX = playerGroup.position.x + normX * moveSpeed;
      const nextZ = playerGroup.position.z + normZ * moveSpeed;

      let canMove = true;
      for (const col of colliders) {
        if (Math.hypot(nextX - col.x, nextZ - col.z) < col.radius + 0.6) {
          canMove = false;
          break;
        }
      }

      if (canMove) {
        playerGroup.position.x = nextX;
        playerGroup.position.z = nextZ;
      }

      playerGroup.rotation.y = Math.atan2(normX, normZ);
      walkAnimTime += isSprinting ? 0.28 : 0.13;
    }

    if (isSwimming) {
      const floatY = -1.35 + Math.sin(Date.now() * 0.003) * 0.08;
      playerGroup.position.y += (floatY - playerGroup.position.y) * 0.1;
      isJumping = false;

      if (isMoving) {
        r15Parts.lowerTorso.rotation.x = THREE.MathUtils.lerp(r15Parts.lowerTorso.rotation.x, Math.PI / 2.6, 0.1);
        const swimTime = walkAnimTime * 0.8;
        r15Parts.leftUpperArm.rotation.x = Math.sin(swimTime) * 1.4;
        r15Parts.leftLowerArm.rotation.x = -Math.abs(Math.cos(swimTime)) * 0.8;
        r15Parts.rightUpperArm.rotation.x = -Math.sin(swimTime) * 1.4;
        r15Parts.rightLowerArm.rotation.x = -Math.abs(Math.sin(swimTime)) * 0.8;
        r15Parts.leftUpperLeg.rotation.x = -Math.sin(swimTime * 1.5) * 0.5;
        r15Parts.leftLowerLeg.rotation.x = -Math.abs(Math.cos(swimTime * 1.5)) * 0.4;
        r15Parts.rightUpperLeg.rotation.x = Math.sin(swimTime * 1.5) * 0.5;
        r15Parts.rightLowerLeg.rotation.x = -Math.abs(Math.cos(swimTime * 1.5)) * 0.4;
      } else {
        r15Parts.lowerTorso.rotation.x = THREE.MathUtils.lerp(r15Parts.lowerTorso.rotation.x, 0.12, 0.1);
        const idleTime = Date.now() * 0.004;
        r15Parts.leftUpperArm.rotation.x = 0.3 + Math.sin(idleTime) * 0.2;
        r15Parts.leftUpperArm.rotation.z = -0.4 + Math.cos(idleTime) * 0.15;
        r15Parts.leftLowerArm.rotation.x = -0.5;
        r15Parts.rightUpperArm.rotation.x = 0.3 + Math.cos(idleTime) * 0.2;
        r15Parts.rightUpperArm.rotation.z = 0.4 - Math.cos(idleTime) * 0.15;
        r15Parts.rightLowerArm.rotation.x = -0.5;
        r15Parts.leftUpperLeg.rotation.x = Math.sin(idleTime * 1.2) * 0.25;
        r15Parts.rightUpperLeg.rotation.x = -Math.sin(idleTime * 1.2) * 0.25;
        r15Parts.leftLowerLeg.rotation.x = -0.2;
        r15Parts.rightLowerLeg.rotation.x = -0.2;
      }
    } else {
      r15Parts.leftUpperArm.rotation.z = 0;
      r15Parts.rightUpperArm.rotation.z = 0;
      r15Parts.leftLowerArm.rotation.x = 0;
      r15Parts.rightLowerArm.rotation.x = 0;
      r15Parts.leftLowerLeg.rotation.x = 0;
      r15Parts.rightLowerLeg.rotation.x = 0;

      if (playerGroup.position.y < floorY && !isJumping) {
        playerGroup.position.y = THREE.MathUtils.lerp(playerGroup.position.y, floorY, 0.2);
      }

      if (isMoving) {
        if (isSprinting) {
          r15Parts.lowerTorso.rotation.x = THREE.MathUtils.lerp(r15Parts.lowerTorso.rotation.x, 0.22, 0.15);
          const swing = Math.sin(walkAnimTime) * 1.0;
          r15Parts.leftUpperArm.rotation.x = swing;
          r15Parts.rightUpperArm.rotation.x = -swing;
          r15Parts.leftUpperLeg.rotation.x = -swing * 0.85;
          r15Parts.rightUpperLeg.rotation.x = swing * 0.85;
        } else {
          r15Parts.lowerTorso.rotation.x = THREE.MathUtils.lerp(r15Parts.lowerTorso.rotation.x, 0, 0.15);
          const swing = Math.sin(walkAnimTime) * 0.45;
          r15Parts.leftUpperArm.rotation.x = swing;
          r15Parts.rightUpperArm.rotation.x = -swing;
          r15Parts.leftUpperLeg.rotation.x = -swing * 0.55;
          r15Parts.rightUpperLeg.rotation.x = swing * 0.55;
        }
      } else {
        r15Parts.lowerTorso.rotation.x = THREE.MathUtils.lerp(r15Parts.lowerTorso.rotation.x, 0, 0.15);
        r15Parts.leftUpperArm.rotation.x = 0;
        r15Parts.rightUpperArm.rotation.x = 0;
        r15Parts.leftUpperLeg.rotation.x = 0;
        r15Parts.rightUpperLeg.rotation.x = 0;
      }

      if (keys.space && !isJumping) {
        playerVelocityY = jumpStrength;
        isJumping = true;
      }

      if (isJumping || playerGroup.position.y > floorY) {
        playerGroup.position.y += playerVelocityY;
        playerVelocityY += gravity;

        if (playerGroup.position.y <= floorY) {
          playerGroup.position.y = floorY;
          playerVelocityY = 0;
          isJumping = false;
        }
      }
    }

    const headPosY = playerGroup.position.y + 1.8;
    const isFirstPerson = targetCameraDistance < 1.0;
    playerGroup.visible = !isFirstPerson;

    if (isFirstPerson) {
      camera.position.set(playerGroup.position.x, headPosY, playerGroup.position.z);
      camera.lookAt(
        playerGroup.position.x - Math.sin(cameraAngleX) * Math.cos(cameraAngleY) * 10,
        headPosY - Math.sin(cameraAngleY) * 10,
        playerGroup.position.z - Math.cos(cameraAngleX) * Math.cos(cameraAngleY) * 10
      );
    } else {
      actualCameraDistance = targetCameraDistance;

      let idealX = playerGroup.position.x + actualCameraDistance * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
      let idealY = headPosY + actualCameraDistance * Math.sin(cameraAngleY);
      let idealZ = playerGroup.position.z + actualCameraDistance * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);

      const minCameraY = 0.3;
      if (idealY < minCameraY) {
        const factor = (headPosY - minCameraY) / (headPosY - idealY);
        actualCameraDistance = Math.max(1.5, actualCameraDistance * Math.abs(factor));
        idealY = minCameraY;
        idealX = playerGroup.position.x + actualCameraDistance * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
        idealZ = playerGroup.position.z + actualCameraDistance * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
      }

      camera.position.set(idealX, idealY, idealZ);
      camera.lookAt(playerGroup.position.x, headPosY, playerGroup.position.z);
    }
  }

  const time = Date.now() * 0.002;
  if (buoysGroup) {
    buoysGroup.children.forEach((buoy, idx) => {
      buoy.position.y = -0.2 + Math.sin(time + idx) * 0.15;
    });
  }

  clouds.forEach(cloud => {
    cloud.position.x += 0.05;
    if (cloud.position.x > 400) cloud.position.x = -400;
  });

  renderer.render(scene, camera);
}