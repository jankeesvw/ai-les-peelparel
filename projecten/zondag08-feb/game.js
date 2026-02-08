// === SCHILPIE'S 3D GAME ===
import * as THREE from 'three';

// === SETUP 3D WERELD ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Blauwe lucht!

// Camera (kijkt van boven/schuin naar de wereld)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

// Renderer (tekent alles op het scherm)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Schaduwen aan!
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === LICHT ===
// Zonlicht (maakt schaduwen)
const zonLicht = new THREE.DirectionalLight(0xffffff, 1);
zonLicht.position.set(10, 20, 10);
zonLicht.castShadow = true;
zonLicht.shadow.camera.left = -30;
zonLicht.shadow.camera.right = 30;
zonLicht.shadow.camera.top = 30;
zonLicht.shadow.camera.bottom = -30;
zonLicht.shadow.mapSize.width = 2048;
zonLicht.shadow.mapSize.height = 2048;
scene.add(zonLicht);

// Omgevingslicht (zachter licht overal)
const omgevingsLicht = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(omgevingsLicht);

// === MAAK SCHILPIE (3D SCHILDPAD!) ===
const schilpie = new THREE.Group();

// Lichaam (geel)
const lichaamsMateriaal = new THREE.MeshStandardMaterial({ color: 0xFFD700 });

// Schild (bruin, glanzend)
const schildGeometry = new THREE.SphereGeometry(1.2, 16, 16);
schildGeometry.scale(1, 0.6, 1);
const schildMateriaal = new THREE.MeshStandardMaterial({
  color: 0x8B4513,
  roughness: 0.3,
  metalness: 0.2
});
const schild = new THREE.Mesh(schildGeometry, schildMateriaal);
schild.position.y = 0.5;
schild.castShadow = true;
schilpie.add(schild);

// Patroon op schild (zeshoeken)
const patroonMateriaal = new THREE.MeshStandardMaterial({ color: 0xA0522D });
for (let i = 0; i < 6; i++) {
  const hoek = (i / 6) * Math.PI * 2;
  const patroon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.1, 6),
    patroonMateriaal
  );
  patroon.position.set(
    Math.cos(hoek) * 0.6,
    0.7,
    Math.sin(hoek) * 0.6
  );
  patroon.rotation.x = Math.PI / 2;
  schilpie.add(patroon);
}

// Kopje (geel)
const kopGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const kop = new THREE.Mesh(kopGeometry, lichaamsMateriaal);
kop.position.set(0, 0.5, 1.2);
kop.castShadow = true;
schilpie.add(kop);

// Oogjes (zwart met witte glans)
const oogMateriaal = new THREE.MeshStandardMaterial({ color: 0x000000 });
const oogGlansMateriaal = new THREE.MeshStandardMaterial({ color: 0xffffff });

const linkerOog = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), oogMateriaal);
linkerOog.position.set(-0.25, 0.6, 1.5);
schilpie.add(linkerOog);

const rechterOog = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), oogMateriaal);
rechterOog.position.set(0.25, 0.6, 1.5);
schilpie.add(rechterOog);

// Glans in ogen
const linkerGlans = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), oogGlansMateriaal);
linkerGlans.position.set(-0.23, 0.65, 1.55);
schilpie.add(linkerGlans);

const rechterGlans = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), oogGlansMateriaal);
rechterGlans.position.set(0.27, 0.65, 1.55);
schilpie.add(rechterGlans);

// Pootjes (4 stuks, geel)
const pootGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
const pootPosities = [
  { x: -0.7, z: 0.5 },   // links voor
  { x: 0.7, z: 0.5 },    // rechts voor
  { x: -0.7, z: -0.5 },  // links achter
  { x: 0.7, z: -0.5 }    // rechts achter
];

pootPosities.forEach(pos => {
  const poot = new THREE.Mesh(pootGeometry, lichaamsMateriaal);
  poot.position.set(pos.x, 0, pos.z);
  poot.castShadow = true;
  schilpie.add(poot);
});

// Staartje (klein, geel)
const staartGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
const staart = new THREE.Mesh(staartGeometry, lichaamsMateriaal);
staart.position.set(0, 0.3, -1);
staart.rotation.x = Math.PI / 2;
schilpie.add(staart);

schilpie.position.set(0, 3, 0); // Start op het gouden platform!
scene.add(schilpie);

// === SPELER DATA ===
const speler = {
  snelheid: 0.12, // Langzamer!
  snelheidY: 0,
  springKracht: 0.55, // Hoger springen!
  zwaartekracht: 0.015,
  opDeGrond: false,
  richting: 1
};

// === CHECKPOINTS & SCORE ===
let laatsteCheckpoint = { x: 0, y: 3, z: 0 }; // Start positie
const checkpoints = [];
let checkpointsBehaald = 0;
let hoogsteHoogte = 0;
let startTijd = Date.now();

// === RUIMTE ITEMS ===
const kroontjes = [];
let kroontjesVerzameld = 0;

// === FEEST ===
let feestActief = false;
const confettiStukjes = [];

// === MAAK EEN PANDA FUNCTIE ===
function maakPanda() {
  const panda = new THREE.Group();

  const witMateriaal = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const zwartMateriaal = new THREE.MeshStandardMaterial({ color: 0x000000 });

  // Lichaam (wit, ovaal)
  const lichaamsGeometry = new THREE.SphereGeometry(0.6, 16, 16);
  lichaamsGeometry.scale(1, 1.2, 1);
  const lichaam = new THREE.Mesh(lichaamsGeometry, witMateriaal);
  lichaam.position.y = 0.4;
  lichaam.castShadow = true;
  panda.add(lichaam);

  // Hoofd (wit, rond)
  const hoofdGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const hoofd = new THREE.Mesh(hoofdGeometry, witMateriaal);
  hoofd.position.y = 1.3;
  hoofd.castShadow = true;
  panda.add(hoofd);

  // Oren (zwart)
  const oorGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const linkerOor = new THREE.Mesh(oorGeometry, zwartMateriaal);
  linkerOor.position.set(-0.35, 1.6, 0);
  panda.add(linkerOor);

  const rechterOor = new THREE.Mesh(oorGeometry, zwartMateriaal);
  rechterOor.position.set(0.35, 1.6, 0);
  panda.add(rechterOor);

  // Ogen (zwarte vlekken)
  const oogVlekGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  oogVlekGeometry.scale(1.2, 1, 0.5);

  const linkerOogVlek = new THREE.Mesh(oogVlekGeometry, zwartMateriaal);
  linkerOogVlek.position.set(-0.2, 1.35, 0.35);
  panda.add(linkerOogVlek);

  const rechterOogVlek = new THREE.Mesh(oogVlekGeometry, zwartMateriaal);
  rechterOogVlek.position.set(0.2, 1.35, 0.35);
  panda.add(rechterOogVlek);

  // Echte oogjes (wit in de zwarte vlekken)
  const echteOogGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const linkerEchteOog = new THREE.Mesh(echteOogGeometry, witMateriaal);
  linkerEchteOog.position.set(-0.2, 1.35, 0.42);
  panda.add(linkerEchteOog);

  const rechterEchteOog = new THREE.Mesh(echteOogGeometry, witMateriaal);
  rechterEchteOog.position.set(0.2, 1.35, 0.42);
  panda.add(rechterEchteOog);

  // Snuit (wit met zwarte neus)
  const snuitGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  snuitGeometry.scale(0.8, 0.7, 0.6);
  const snuit = new THREE.Mesh(snuitGeometry, witMateriaal);
  snuit.position.set(0, 1.15, 0.45);
  panda.add(snuit);

  // Neus (zwart)
  const neusGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const neus = new THREE.Mesh(neusGeometry, zwartMateriaal);
  neus.position.set(0, 1.2, 0.55);
  panda.add(neus);

  // Armen (zwart)
  const armGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.7, 8);

  const linkerArm = new THREE.Mesh(armGeometry, zwartMateriaal);
  linkerArm.position.set(-0.5, 0.5, 0.2);
  linkerArm.rotation.z = 0.3;
  linkerArm.castShadow = true;
  panda.add(linkerArm);

  const rechterArm = new THREE.Mesh(armGeometry, zwartMateriaal);
  rechterArm.position.set(0.5, 0.5, 0.2);
  rechterArm.rotation.z = -0.3;
  rechterArm.castShadow = true;
  panda.add(rechterArm);

  // Benen (zwart)
  const beenGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.5, 8);

  const linkerBeen = new THREE.Mesh(beenGeometry, zwartMateriaal);
  linkerBeen.position.set(-0.3, 0, 0.1);
  linkerBeen.castShadow = true;
  panda.add(linkerBeen);

  const rechterBeen = new THREE.Mesh(beenGeometry, zwartMateriaal);
  rechterBeen.position.set(0.3, 0, 0.1);
  rechterBeen.castShadow = true;
  panda.add(rechterBeen);

  return panda;
}

// === PLATFORMS EN PANDAS ===
const platforms = [];
const pandas = []; // Alle panda's voor animatie!
const platformMateriaal = new THREE.MeshStandardMaterial({
  color: 0x2ecc71,
  roughness: 0.8
});

// === BOUW EEN HOGE TOREN! ===

// Grond (start - veel groter!)
const grondGeometry = new THREE.BoxGeometry(60, 1, 60);
const grond = new THREE.Mesh(grondGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 }));
grond.position.set(0, -0.5, 0);
grond.receiveShadow = true;
scene.add(grond);
platforms.push({ mesh: grond, y: 0 });

// Start platform (groot en goudkleurig)
const startPlatformGeometry = new THREE.BoxGeometry(12, 0.5, 12);
const startPlatform = new THREE.Mesh(startPlatformGeometry, new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.8 }));
startPlatform.position.set(0, 0.5, 0);
startPlatform.castShadow = true;
startPlatform.receiveShadow = true;
scene.add(startPlatform);
platforms.push({ mesh: startPlatform, y: 0.75 });

// === TRAMPOLINE NAAR DE RUIMTE! 🚀 ===
// Gewoon NAAST het startplatform!
const trampolineGeometry = new THREE.BoxGeometry(4, 0.5, 4); // Vierkant platform is makkelijker!
const trampolineMateriaal = new THREE.MeshStandardMaterial({
  color: 0xFF1493,
  emissive: 0xFF1493,
  emissiveIntensity: 1, // SUPER helder!
  roughness: 0.3,
  metalness: 0.5
});
const trampoline = new THREE.Mesh(trampolineGeometry, trampolineMateriaal);
trampoline.position.set(8, 0.5, 0); // Direct rechts van start!
trampoline.castShadow = true;
trampoline.receiveShadow = true;
trampoline.userData.isTrampoline = true;
scene.add(trampoline);
platforms.push({ mesh: trampoline, y: 0.75 });

// Grote tekst erboven!
const canvas2d = document.createElement('canvas');
canvas2d.width = 512;
canvas2d.height = 256;
const ctx2d = canvas2d.getContext('2d');
ctx2d.fillStyle = '#FFFF00';
ctx2d.font = 'bold 80px Arial';
ctx2d.textAlign = 'center';
ctx2d.fillText('🚀 RUIMTE', 256, 100);
ctx2d.fillText('🚀', 256, 200);
const texture = new THREE.CanvasTexture(canvas2d);
const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
const sprite = new THREE.Sprite(spriteMaterial);
sprite.position.set(8, 4, 0);
sprite.scale.set(8, 4, 1);
scene.add(sprite);

// Bouw de toren in een spiraal naar boven! 🌀
const aantalPlatforms = 30; // 30 platforms omhoog!
const hoogtePerPlatform = 3; // Afstand tussen platforms
const spiraalStraal = 6; // Hoe ver van het midden (dicht bij elkaar!)

for (let i = 0; i < aantalPlatforms; i++) {
  const hoek = (i / 5) * Math.PI * 2; // Spiraal effect
  const hoogte = 3 + i * hoogtePerPlatform;

  const x = Math.cos(hoek) * spiraalStraal;
  const z = Math.sin(hoek) * spiraalStraal;

  // Wissel tussen grote en kleine platforms (nu groter!)
  const grootte = i % 3 === 0 ? 7 : 6;

  // Check of dit een checkpoint is (elke 7e platform)
  const isCheckpoint = i % 7 === 0 && i > 0;

  // Kleur gradient (groen naar blauw naar paars hoe hoger je komt)
  let kleur;
  if (isCheckpoint) {
    kleur = 0xff6b35; // Oranje voor checkpoints! 🚩
  } else if (i < 10) {
    kleur = 0x2ecc71; // Groen
  } else if (i < 20) {
    kleur = 0x3498db; // Blauw
  } else {
    kleur = 0x9b59b6; // Paars
  }

  const platformGeometry = new THREE.BoxGeometry(grootte, 0.5, grootte);
  const platformMateriaal = new THREE.MeshStandardMaterial({
    color: kleur,
    roughness: 0.8,
    emissive: isCheckpoint ? kleur : 0x000000,
    emissiveIntensity: isCheckpoint ? 0.3 : 0
  });
  const platform = new THREE.Mesh(platformGeometry, platformMateriaal);
  platform.position.set(x, hoogte, z);
  platform.castShadow = true;
  platform.receiveShadow = true;
  platform.userData.isCheckpoint = isCheckpoint;
  platform.userData.checkpointPos = { x, y: hoogte + 1, z };
  scene.add(platform);
  platforms.push({ mesh: platform, y: hoogte + 0.25 });

  // Checkpoint marker (vlag! 🚩)
  if (isCheckpoint) {
    const vlagStokGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const vlagStok = new THREE.Mesh(vlagStokGeometry, new THREE.MeshStandardMaterial({ color: 0x654321 }));
    vlagStok.position.set(x, hoogte + 2, z);
    scene.add(vlagStok);

    const vlagGeometry = new THREE.PlaneGeometry(1.5, 1);
    const vlag = new THREE.Mesh(vlagGeometry, new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      side: THREE.DoubleSide,
      emissive: 0xff6b35,
      emissiveIntensity: 0.4
    }));
    vlag.position.set(x + 0.75, hoogte + 3, z);
    scene.add(vlag);

    checkpoints.push({ vlag, originX: x + 0.75 });
  }

  // Panda op elk 3e platform! 🐼
  if (i % 3 === 0) {
    const panda = maakPanda();
    panda.position.set(x, hoogte + 0.5, z);
    panda.rotation.y = Math.random() * Math.PI * 2;
    panda.userData.startY = hoogte + 0.5; // Bewaar originele hoogte voor dans!
    panda.userData.dansOffset = Math.random() * Math.PI * 2; // Unieke dans timing
    scene.add(panda);
    pandas.push(panda); // Voeg toe aan dans-lijst!
  }
}

// FINISH PLATFORM bovenaan! 🏆
const finishGeometry = new THREE.BoxGeometry(14, 1, 14);
const finishPlatform = new THREE.Mesh(finishGeometry, new THREE.MeshStandardMaterial({
  color: 0xFFD700,
  emissive: 0xFFD700,
  emissiveIntensity: 0.3,
  roughness: 0.3,
  metalness: 0.5
}));
const finishHoogte = 3 + aantalPlatforms * hoogtePerPlatform;
finishPlatform.position.set(0, finishHoogte, 0);
finishPlatform.castShadow = true;
finishPlatform.receiveShadow = true;
scene.add(finishPlatform);
platforms.push({ mesh: finishPlatform, y: finishHoogte + 0.5 });

// Giant panda op de top! 🐼👑
const topPanda = maakPanda();
topPanda.scale.set(2, 2, 2); // 2x groter!
topPanda.position.set(0, finishHoogte + 1.5, 0);
topPanda.userData.startY = finishHoogte + 1.5;
topPanda.userData.dansOffset = 0;
topPanda.userData.isKing = true; // Deze danst extra wild!
scene.add(topPanda);
pandas.push(topPanda);

// Kroon op de panda 👑
const kroonGeometry = new THREE.ConeGeometry(0.6, 0.8, 8);
const kroon = new THREE.Mesh(kroonGeometry, new THREE.MeshStandardMaterial({
  color: 0xFFD700,
  emissive: 0xFFD700,
  emissiveIntensity: 0.5,
  metalness: 0.8
}));
kroon.position.set(0, finishHoogte + 4, 0);
scene.add(kroon);

// === RUIMTE GEBIED! 🌌 ===
const ruimteHoogte = 35; // Lager zodat je er makkelijk komt!

// Ruimte platform (paars/zwart)
const ruimtePlatformGeometry = new THREE.BoxGeometry(20, 1, 20);
const ruimtePlatform = new THREE.Mesh(ruimtePlatformGeometry, new THREE.MeshStandardMaterial({
  color: 0x1a0033,
  emissive: 0x4B0082,
  emissiveIntensity: 0.3
}));
ruimtePlatform.position.set(-8, ruimteHoogte, -8);
ruimtePlatform.receiveShadow = true;
scene.add(ruimtePlatform);
platforms.push({ mesh: ruimtePlatform, y: ruimteHoogte + 0.5 });

// DIKKE RUIMTE PANDA! 🐼🚀
const ruimtePanda = maakPanda();
ruimtePanda.scale.set(3, 3, 3); // 3x groter = super dik!
ruimtePanda.position.set(-8, ruimteHoogte + 2, -8);
ruimtePanda.userData.startY = ruimteHoogte + 2;
ruimtePanda.userData.dansOffset = 0;
ruimtePanda.userData.isKing = true;
scene.add(ruimtePanda);
pandas.push(ruimtePanda);

// Ruimte kroon op dikke panda 👑
const ruimteKroon = new THREE.Mesh(
  new THREE.ConeGeometry(1.2, 1.5, 8),
  new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    emissive: 0xFFD700,
    emissiveIntensity: 0.7,
    metalness: 0.9
  })
);
ruimteKroon.position.set(-8, ruimteHoogte + 6, -8);
scene.add(ruimteKroon);

// VLIEGENDE KROONTJES! 👑✨
for (let i = 0; i < 10; i++) {
  const hoek = (i / 10) * Math.PI * 2;
  const straal = 8;
  const x = -8 + Math.cos(hoek) * straal;
  const z = -8 + Math.sin(hoek) * straal;
  const y = ruimteHoogte + 5 + Math.sin(i * 0.5) * 3;

  const kroontjeGeometry = new THREE.ConeGeometry(0.4, 0.6, 8);
  const kroontje = new THREE.Mesh(kroontjeGeometry, new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    emissive: 0xFFD700,
    emissiveIntensity: 0.8,
    metalness: 1
  }));
  kroontje.position.set(x, y, z);
  kroontje.userData.startY = y;
  kroontje.userData.startHoek = hoek;
  kroontje.userData.straal = straal;
  kroontje.userData.verzameld = false;
  scene.add(kroontje);
  kroontjes.push(kroontje);
}

// Sterren in de ruimte! ⭐
for (let i = 0; i < 100; i++) {
  const sterGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const ster = new THREE.Mesh(sterGeometry, new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 1
  }));
  ster.position.set(
    -8 + (Math.random() - 0.5) * 40,
    ruimteHoogte + (Math.random() - 0.5) * 20,
    -8 + (Math.random() - 0.5) * 40
  );
  scene.add(ster);
}

// === MAAK CONFETTI FUNCTIE ===
function maakConfetti() {
  const kleuren = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffd700];

  for (let i = 0; i < 200; i++) {
    const confettiGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.05);
    const confetti = new THREE.Mesh(confettiGeometry, new THREE.MeshStandardMaterial({
      color: kleuren[Math.floor(Math.random() * kleuren.length)],
      emissive: kleuren[Math.floor(Math.random() * kleuren.length)],
      emissiveIntensity: 0.5
    }));

    confetti.position.set(
      (Math.random() - 0.5) * 20,
      finishHoogte + 10 + Math.random() * 10,
      (Math.random() - 0.5) * 20
    );

    confetti.userData.snelheidY = Math.random() * 0.1;
    confetti.userData.draaiSnelheid = (Math.random() - 0.5) * 0.2;

    scene.add(confetti);
    confettiStukjes.push(confetti);
  }
}

// === TOETSEN ===
const toetsen = {
  links: false,
  rechts: false,
  omhoog: false,
  omlaag: false
};

document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    if (speler.opDeGrond) {
      speler.snelheidY = speler.springKracht;
      speler.opDeGrond = false;
    }
  }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    toetsen.links = true;
  }
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    toetsen.rechts = true;
  }
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    e.preventDefault();
    toetsen.omhoog = true;
  }
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    e.preventDefault();
    toetsen.omlaag = true;
  }

  // RESET met R toets!
  if (e.key === 'r' || e.key === 'R') {
    if (feestActief) {
      location.reload(); // Herlaad de pagina = opnieuw beginnen!
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    toetsen.links = false;
  }
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    toetsen.rechts = false;
  }
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    toetsen.omhoog = false;
  }
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    toetsen.omlaag = false;
  }
});

// === GAME LOOP ===
let tijd = 0; // Voor dans animatie!

function animate() {
  requestAnimationFrame(animate);

  tijd += 0.05; // Tijd voor animaties

  // === PANDA DANS PARTY! ===
  pandas.forEach(panda => {
    const dansSnelheid = panda.userData.isKing ? 2 : 1; // Koning danst sneller!
    const dansAmplitude = panda.userData.isKing ? 0.5 : 0.3;

    // Op en neer bouncen! 🎵
    panda.position.y = panda.userData.startY + Math.sin(tijd * dansSnelheid + panda.userData.dansOffset) * dansAmplitude;

    // Draaien en zwiepen! 💃
    panda.rotation.y += Math.sin(tijd * dansSnelheid * 0.5) * 0.02;
    panda.rotation.z = Math.sin(tijd * dansSnelheid + panda.userData.dansOffset) * 0.1;

    // Koning panda doet extra moves!
    if (panda.userData.isKing) {
      panda.rotation.x = Math.sin(tijd * 2) * 0.1;
    }
  });

  // === CHECKPOINT VLAGGEN WAPPEREN! ===
  checkpoints.forEach(cp => {
    cp.vlag.position.x = cp.originX + Math.sin(tijd * 2) * 0.2;
    cp.vlag.rotation.y = Math.sin(tijd * 3) * 0.3;
  });

  // === TRAMPOLINE PIJL BOUNCY! ===
  if (window.trampolinePijl) {
    window.trampolinePijl.position.y = window.trampolinePijl.userData.startY + Math.sin(tijd * 3) * 1;
    window.trampolinePijl.rotation.y = tijd;
  }

  // === VLIEGENDE KROONTJES ANIMATIE! 👑 ===
  kroontjes.forEach((kroontje, index) => {
    if (kroontje.userData.verzameld) return;

    // Draaien!
    kroontje.rotation.y = tijd * 2;

    // Vliegen in een cirkel!
    const hoek = kroontje.userData.startHoek + tijd * 0.3;
    kroontje.position.x = -8 + Math.cos(hoek) * kroontje.userData.straal;
    kroontje.position.z = -8 + Math.sin(hoek) * kroontje.userData.straal;
    kroontje.position.y = kroontje.userData.startY + Math.sin(tijd * 2 + index) * 1;

    // Check of Schilpie het kroontje pakt!
    const afstand = Math.sqrt(
      (schilpie.position.x - kroontje.position.x) ** 2 +
      (schilpie.position.y - kroontje.position.y) ** 2 +
      (schilpie.position.z - kroontje.position.z) ** 2
    );

    if (afstand < 2) {
      kroontje.userData.verzameld = true;
      kroontjesVerzameld++;
      console.log('👑 Kroontje verzameld!', kroontjesVerzameld, '/ 10');
      // Maak kroontje onzichtbaar
      kroontje.visible = false;
    }
  });

  // === CONFETTI FEEST! 🎉 ===
  if (feestActief) {
    confettiStukjes.forEach(confetti => {
      confetti.position.y -= confetti.userData.snelheidY;
      confetti.rotation.x += confetti.userData.draaiSnelheid;
      confetti.rotation.y += confetti.userData.draaiSnelheid * 0.5;
      confetti.rotation.z += confetti.userData.draaiSnelheid * 0.3;

      // Reset als confetti te laag valt
      if (confetti.position.y < finishHoogte - 10) {
        confetti.position.y = finishHoogte + 15;
      }
    });

    // Alle panda's dansen SUPER WILD!
    pandas.forEach(panda => {
      panda.userData.isKing = true; // Maak ze allemaal koning voor wild dansen!
    });
  }

  // === UPDATE ===

  // Beweeg Schilpie in alle richtingen!
  if (toetsen.links) {
    schilpie.position.x -= speler.snelheid;
    schilpie.rotation.y = Math.PI / 2; // Kijk naar links
  }
  if (toetsen.rechts) {
    schilpie.position.x += speler.snelheid;
    schilpie.rotation.y = -Math.PI / 2; // Kijk naar rechts
  }
  if (toetsen.omhoog) {
    schilpie.position.z -= speler.snelheid;
    schilpie.rotation.y = 0; // Kijk vooruit
  }
  if (toetsen.omlaag) {
    schilpie.position.z += speler.snelheid;
    schilpie.rotation.y = Math.PI; // Kijk achteruit
  }

  // Diagonaal lopen (hoek aanpassen als 2 toetsen tegelijk)
  if (toetsen.omhoog && toetsen.rechts) {
    schilpie.rotation.y = -Math.PI / 4; // Rechts-vooruit
  }
  if (toetsen.omhoog && toetsen.links) {
    schilpie.rotation.y = Math.PI / 4; // Links-vooruit
  }
  if (toetsen.omlaag && toetsen.rechts) {
    schilpie.rotation.y = -3 * Math.PI / 4; // Rechts-achteruit
  }
  if (toetsen.omlaag && toetsen.links) {
    schilpie.rotation.y = 3 * Math.PI / 4; // Links-achteruit
  }

  // Beperk binnen wereld (veel ruimer!)
  if (schilpie.position.x < -25) schilpie.position.x = -25;
  if (schilpie.position.x > 25) schilpie.position.x = 25;
  if (schilpie.position.z < -25) schilpie.position.z = -25;
  if (schilpie.position.z > 25) schilpie.position.z = 25;

  // Zwaartekracht
  speler.snelheidY -= speler.zwaartekracht;
  schilpie.position.y += speler.snelheidY;

  // Reset opDeGrond
  speler.opDeGrond = false;

  // Check platforms (alleen als naar beneden aan het vallen)
  if (speler.snelheidY <= 0) {
    for (const platform of platforms) {
      const afstandX = Math.abs(schilpie.position.x - platform.mesh.position.x);
      const afstandZ = Math.abs(schilpie.position.z - platform.mesh.position.z);

      const platformBreedteHelft = platform.mesh.geometry.parameters.width / 2;
      const platformDiepteHelft = platform.mesh.geometry.parameters.depth / 2;

      // Check of Schilpie boven het platform is
      if (afstandX < platformBreedteHelft - 0.3 &&
          afstandZ < platformDiepteHelft - 0.3) {

        const platformTop = platform.y + 1;

        // Als Schilpie vlakbij het platform is
        if (schilpie.position.y < platformTop + 1 &&
            schilpie.position.y > platformTop - 0.5) {
          schilpie.position.y = platformTop;
          speler.snelheidY = 0;
          speler.opDeGrond = true;

          // CHECK: Is dit een checkpoint? 🚩
          if (platform.mesh.userData.isCheckpoint && !platform.mesh.userData.bereikt) {
            platform.mesh.userData.bereikt = true; // Tel maar 1x!
            laatsteCheckpoint = { ...platform.mesh.userData.checkpointPos };
            checkpointsBehaald++;

            // Laat het platform kort flikkeren!
            platform.mesh.material.emissiveIntensity = 0.8;
            setTimeout(() => {
              platform.mesh.material.emissiveIntensity = 0.3;
            }, 200);
          }

          // CHECK: Is dit de TRAMPOLINE? 🚀
          if (platform.mesh.userData.isTrampoline && !platform.mesh.userData.gebruikt) {
            platform.mesh.userData.gebruikt = true;
            // INSTANT TELEPORT NAAR DE RUIMTE!
            console.log('🚀 WHOOSH! TELEPORT NAAR DE RUIMTE!');
            schilpie.position.set(-8, ruimteHoogte + 1, -8);
            speler.snelheidY = 0;
            setTimeout(() => {
              platform.mesh.userData.gebruikt = false; // Reset na 2 seconden
            }, 2000);
          }

          // CHECK: Is dit het FINISH platform? 🎉
          if (schilpie.position.y > finishHoogte - 5 && !feestActief) {
            feestActief = true;
            maakConfetti();
            console.log('🎉🎊 JE HEBT HET GEHAALD! FEEST! 🎊🎉');
          }

          break; // Stop met checken als we een platform gevonden hebben
        }
      }
    }
  }

  // Als te ver gevallen, reset naar laatste checkpoint! 🚩
  if (schilpie.position.y < laatsteCheckpoint.y - 8) {
    console.log('💀 Gevallen! Terug naar checkpoint!');
    schilpie.position.set(laatsteCheckpoint.x, laatsteCheckpoint.y, laatsteCheckpoint.z);
    speler.snelheidY = 0;
    speler.opDeGrond = true;
  }

  // Camera volgt Schilpie omhoog door de toren! 📹
  camera.position.x += (schilpie.position.x - camera.position.x) * 0.03;
  camera.position.y += (schilpie.position.y + 10 - camera.position.y) * 0.05;
  camera.position.z += (schilpie.position.z + 15 - camera.position.z) * 0.03;
  camera.lookAt(schilpie.position);

  // === UPDATE SCORE UI ===
  if (schilpie.position.y > hoogsteHoogte) {
    hoogsteHoogte = schilpie.position.y;
  }

  const hoogte = Math.max(0, Math.floor(schilpie.position.y));
  const tijdInSeconden = Math.floor((Date.now() - startTijd) / 1000);

  document.getElementById('hoogte').textContent = hoogte;
  document.getElementById('checkpoints').textContent = checkpointsBehaald;
  document.getElementById('kroontjes').textContent = kroontjesVerzameld;
  document.getElementById('tijd').textContent = tijdInSeconden;

  // Toon feest bericht!
  if (feestActief) {
    document.getElementById('feestBericht').style.display = 'block';
  }

  // Teken alles!
  renderer.render(scene, camera);
}

// Pas aan als window grootte verandert
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start de game!
animate();
