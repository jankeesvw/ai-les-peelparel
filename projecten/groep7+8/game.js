// === 3D NERD PANDA GAME ===

// === IRRITANTE MUZIEK ===
let muziekAan = true;
let audioContext = null;
let muziekInterval = null;

function startIrritanteMuziek() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Super irritant deuntje - dezelfde noten steeds opnieuw
  const noten = [523, 659, 784, 659, 523, 659, 784, 1047, 784, 659, 523, 392, 523, 659, 523, 392];
  let notenIndex = 0;

  function speelNoot() {
    if (!muziekAan || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Kies willekeurig geluidtype voor extra irritatie
    const types = ['square', 'sawtooth', 'triangle'];
    oscillator.type = types[Math.floor(Math.random() * types.length)];
    oscillator.frequency.setValueAtTime(noten[notenIndex], audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);

    notenIndex = (notenIndex + 1) % noten.length;
  }

  // Speel elke 150ms een noot (snel en irritant!)
  muziekInterval = setInterval(speelNoot, 150);
}

function toggleMuziek() {
  muziekAan = !muziekAan;
  document.getElementById('muziek-btn').textContent = muziekAan ? '🔊 Muziek UIT' : '🔇 Muziek AAN';

  if (muziekAan && !muziekInterval) {
    startIrritanteMuziek();
  } else if (!muziekAan && muziekInterval) {
    clearInterval(muziekInterval);
    muziekInterval = null;
  }
}

// Start muziek bij eerste klik (browser vereist user interaction)
document.addEventListener('click', function startMuziekEenmalig() {
  if (!audioContext && muziekAan) {
    startIrritanteMuziek();
  }
  document.removeEventListener('click', startMuziekEenmalig);
}, { once: true });

window.toggleMuziek = toggleMuziek;

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec8e3); // Mooie blauwe lucht
scene.fog = new THREE.Fog(0x7ec8e3, 50, 250); // Mist voor diepte - verder weg

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lichten
const zonlicht = new THREE.DirectionalLight(0xfffaf0, 1.2);
zonlicht.position.set(10, 20, 10);
zonlicht.castShadow = true;
zonlicht.shadow.mapSize.width = 2048;
zonlicht.shadow.mapSize.height = 2048;
scene.add(zonlicht);

const omgevingslicht = new THREE.AmbientLight(0x87ceeb, 0.6);
scene.add(omgevingslicht);

// Extra warm licht van de andere kant
const warmLicht = new THREE.DirectionalLight(0xffd700, 0.3);
warmLicht.position.set(-10, 15, -10);
scene.add(warmLicht);

// === SPELER ===
const speler = {
  x: 0,
  y: 2,
  z: 0,
  snelheid: 0.07,
  springKracht: 0.7,
  ySnelheid: 0,
  opGrond: false,
  mesh: null
};

// === LEVEL THEMA'S ===
const levelThemas = {
  1:  { naam: 'Gras',     lucht: 0x7ec8e3, gras: 0x228B22, grond: 0x8B4513 },
  2:  { naam: 'Sneeuw',   lucht: 0xd6eaf8, gras: 0xffffff, grond: 0xaed6f1 },
  3:  { naam: 'Woestijn', lucht: 0xfdebd0, gras: 0xf4d03f, grond: 0xd4ac0d },
  4:  { naam: 'Snoep',    lucht: 0xfce4ec, gras: 0xff69b4, grond: 0x9b59b6 },
  5:  { naam: 'Oceaan',   lucht: 0x85c1e9, gras: 0x1abc9c, grond: 0x2980b9 },
  6:  { naam: 'Lava',     lucht: 0x641e16, gras: 0xe74c3c, grond: 0x7b241c },
  7:  { naam: 'Bos',      lucht: 0xa9dfbf, gras: 0x196f3d, grond: 0x784212 },
  8:  { naam: 'Nacht',    lucht: 0x1a1a2e, gras: 0x4a4a6a, grond: 0x2d2d44 },
  9:  { naam: 'Regenboog',lucht: 0xe8daef, gras: 0xff6b6b, grond: 0xfeca57 },
  10: { naam: 'IJs',      lucht: 0xd4e6f1, gras: 0x85c1e9, grond: 0x5dade2 },
  11: { naam: 'Jungle',   lucht: 0x82e0aa, gras: 0x1d8348, grond: 0x6e2c00 },
  12: { naam: 'Ruimte',   lucht: 0x0a0a23, gras: 0x8e44ad, grond: 0x1a1a40 },
  13: { naam: 'Strand',   lucht: 0x87ceeb, gras: 0xf5cba7, grond: 0xd4ac0d },
  14: { naam: 'Herfst',   lucht: 0xfae5d3, gras: 0xe67e22, grond: 0x873600 },
  15: { naam: 'Goud',     lucht: 0xfff3cd, gras: 0xffd700, grond: 0xb8860b }
};

// === GAME STATE ===
let boekjesVerzameld = 0;
let brilletjesVerzameld = 0;
let huidigLevel = 1;
let levelGehaald = false;
let levens = 5;
let onkwetsbaar = false;
let gameOver = false;
let munten = 0;
let winkelOpen = false;
let eindAnimatieActief = false;
let eindAnimatieFase = 0;
let eindAnimatieTijd = 0;
let universiteitMesh = null;
let geslaagdPanda = null;

// === KLEDING WINKEL ===
const kledingItems = [
  // Strikken
  { naam: 'Rode Strik', prijs: 5, gekocht: false, aangetrokken: false, type: 'strik', kleur: 0xff0000 },
  { naam: 'Blauwe Strik', prijs: 5, gekocht: false, aangetrokken: false, type: 'strik', kleur: 0x0066ff },
  { naam: 'Gouden Strik', prijs: 15, gekocht: false, aangetrokken: false, type: 'strik', kleur: 0xffd700 },
  { naam: 'Regenboog Strik', prijs: 30, gekocht: false, aangetrokken: false, type: 'strik', kleur: 0xff00ff },

  // Hoeden
  { naam: 'Feesthoedje', prijs: 8, gekocht: false, aangetrokken: false, type: 'feesthoed', kleur: 0xff1493 },
  { naam: 'Cowboyhoed', prijs: 20, gekocht: false, aangetrokken: false, type: 'cowboyhoed', kleur: 0x8B4513 },
  { naam: 'Toveraarshoed', prijs: 35, gekocht: false, aangetrokken: false, type: 'toveraarshoed', kleur: 0x4B0082 },
  { naam: 'Gouden Kroon', prijs: 50, gekocht: false, aangetrokken: false, type: 'kroon', kleur: 0xffd700 },
  { naam: 'Diamanten Kroon', prijs: 100, gekocht: false, aangetrokken: false, type: 'kroon', kleur: 0x00ffff },

  // Brillen
  { naam: 'Coole Zonnebril', prijs: 10, gekocht: false, aangetrokken: false, type: 'zonnebril', kleur: 0x1a1a1a },
  { naam: 'Roze Hartjesbril', prijs: 15, gekocht: false, aangetrokken: false, type: 'zonnebril', kleur: 0xff69b4 },
  { naam: 'Gouden Zonnebril', prijs: 40, gekocht: false, aangetrokken: false, type: 'zonnebril', kleur: 0xffd700 },

  // Capes
  { naam: 'Roze Cape', prijs: 20, gekocht: false, aangetrokken: false, type: 'cape', kleur: 0xff69b4 },
  { naam: 'Blauwe Cape', prijs: 20, gekocht: false, aangetrokken: false, type: 'cape', kleur: 0x4169e1 },
  { naam: 'Rode Superhelden Cape', prijs: 35, gekocht: false, aangetrokken: false, type: 'cape', kleur: 0xff0000 },
  { naam: 'Regenboog Cape', prijs: 60, gekocht: false, aangetrokken: false, type: 'cape', kleur: 0xff00ff },

  // Medailles & Kettingen
  { naam: 'Bronzen Medaille', prijs: 15, gekocht: false, aangetrokken: false, type: 'medaille', kleur: 0xcd7f32 },
  { naam: 'Zilveren Medaille', prijs: 25, gekocht: false, aangetrokken: false, type: 'medaille', kleur: 0xc0c0c0 },
  { naam: 'Gouden Medaille', prijs: 40, gekocht: false, aangetrokken: false, type: 'medaille', kleur: 0xffd700 },
  { naam: 'Diamanten Ketting', prijs: 80, gekocht: false, aangetrokken: false, type: 'ketting', kleur: 0x00ffff },

  // Vleugels
  { naam: 'Engelen Vleugels', prijs: 50, gekocht: false, aangetrokken: false, type: 'vleugels', kleur: 0xffffff },
  { naam: 'Duivel Vleugels', prijs: 50, gekocht: false, aangetrokken: false, type: 'vleugels', kleur: 0x8b0000 },
  { naam: 'Regenboog Vleugels', prijs: 90, gekocht: false, aangetrokken: false, type: 'vleugels', kleur: 0xff00ff },

  // Speciale items
  { naam: 'Ninja Masker', prijs: 30, gekocht: false, aangetrokken: false, type: 'masker', kleur: 0x1a1a1a },
  { naam: 'Superhelden Masker', prijs: 35, gekocht: false, aangetrokken: false, type: 'masker', kleur: 0xff0000 },
  { naam: 'Gloeiende Aura', prijs: 120, gekocht: false, aangetrokken: false, type: 'aura', kleur: 0xffff00 },
  { naam: 'Regenboog Aura', prijs: 150, gekocht: false, aangetrokken: false, type: 'aura', kleur: 0xff00ff },
];

// === TOETSEN ===
const toetsen = {
  omhoog: false,
  links: false,
  rechts: false,
  vooruit: false,
  achteruit: false,
  spring: false
};

// === MUIS CAMERA ===
let cameraRotatieX = 0;
let cameraRotatieY = 0.5;
let muisIngedrukt = false;
let cameraAfstand = 10;

// === LEVEL GENERATOR ===
function genereerLevel(levelNummer) {
  const moeilijkheid = levelNummer;
  const platformAantal = 3 + Math.floor(levelNummer * 1.5);
  const boekjesAantal = 3 + levelNummer;
  const brilletjesAantal = 2 + Math.floor(levelNummer * 0.5);
  const muntenAantal = 5 + levelNummer * 2; // Meer munten per level!

  const platformen = [
    // Basis grond (wordt kleiner per level)
    { x: 0, y: 0, z: 0, breedte: Math.max(6, 15 - levelNummer * 0.5), hoogte: 1, diepte: Math.max(6, 15 - levelNummer * 0.5) }
  ];

  // Genereer platformen
  for (let i = 0; i < platformAantal; i++) {
    const hoek = (i / platformAantal) * Math.PI * 2;
    const afstand = 4 + Math.random() * (3 + levelNummer * 0.3);
    const hoogte = 1.5 + (i % 4) * 1.5 + Math.random() * 2;

    platformen.push({
      x: Math.cos(hoek) * afstand,
      y: hoogte,
      z: Math.sin(hoek) * afstand,
      breedte: Math.max(1.5, 3 - levelNummer * 0.1),
      hoogte: 0.5,
      diepte: Math.max(1.5, 3 - levelNummer * 0.1)
    });
  }

  // Genereer boekjes op platformen
  const boekjes = [];
  for (let i = 0; i < boekjesAantal; i++) {
    const platformIndex = i % platformen.length;
    const platform = platformen[platformIndex];
    boekjes.push({
      x: platform.x + (Math.random() - 0.5) * (platform.breedte * 0.5),
      y: platform.y + platform.hoogte + 0.5,
      z: platform.z + (Math.random() - 0.5) * (platform.diepte * 0.5)
    });
  }

  // Genereer brilletjes
  const brilletjes = [];
  for (let i = 0; i < brilletjesAantal; i++) {
    const platformIndex = (i * 2) % platformen.length;
    const platform = platformen[platformIndex];
    brilletjes.push({
      x: platform.x + (Math.random() - 0.5) * (platform.breedte * 0.3),
      y: platform.y + platform.hoogte + 0.5,
      z: platform.z + (Math.random() - 0.5) * (platform.diepte * 0.3)
    });
  }

  // Genereer munten overal!
  const muntjes = [];
  for (let i = 0; i < muntenAantal; i++) {
    const platformIndex = i % platformen.length;
    const platform = platformen[platformIndex];

    // Sommige munten zweven tussen platformen
    if (i % 3 === 0 && platformen.length > 1) {
      // Zwevende munt tussen platformen
      const nextPlatform = platformen[(platformIndex + 1) % platformen.length];
      muntjes.push({
        x: (platform.x + nextPlatform.x) / 2 + (Math.random() - 0.5) * 2,
        y: Math.max(platform.y, nextPlatform.y) + 1 + Math.random() * 2,
        z: (platform.z + nextPlatform.z) / 2 + (Math.random() - 0.5) * 2,
        waarde: 2 // Moeilijkere munten zijn meer waard!
      });
    } else {
      // Munt op platform
      muntjes.push({
        x: platform.x + (Math.random() - 0.5) * (platform.breedte * 0.8),
        y: platform.y + platform.hoogte + 0.5,
        z: platform.z + (Math.random() - 0.5) * (platform.diepte * 0.8),
        waarde: 1
      });
    }
  }

  return {
    platformen,
    boekjes,
    brilletjes,
    muntjes,
    nodig: { boekjes: boekjesAantal, brilletjes: brilletjesAantal }
  };
}

// === LEVELS (15 levels!) ===
const alleLevels = {};
for (let i = 1; i <= 15; i++) {
  alleLevels[i] = genereerLevel(i);
}

// Arrays voor 3D objecten
let platformMeshes = [];
let boekjeMeshes = [];
let brilletjeMeshes = [];
let bamboeStengels = [];
let vogels = [];
let muntMeshes = [];
let heuvels = [];

// === LOOP ANIMATIE ===
let loopAnimatie = 0;
let isAanHetLopen = false;

// === MAAK DE PANDA ===
function maakPanda() {
  const pandaGroep = new THREE.Group();

  // Lijf (zwart pak)
  const lijfGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const pakMateriaal = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const lijf = new THREE.Mesh(lijfGeo, pakMateriaal);
  lijf.scale.set(1, 1.2, 0.8);
  lijf.position.y = -0.3;
  lijf.name = 'lijf';
  pandaGroep.add(lijf);

  // Wit overhemd
  const overhemdGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
  const witMateriaal = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const overhemd = new THREE.Mesh(overhemdGeo, witMateriaal);
  overhemd.position.set(0, 0.1, 0.3);
  overhemd.rotation.x = Math.PI;
  pandaGroep.add(overhemd);

  // Stropdas
  const stropdasGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
  const roodMateriaal = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
  const stropdas = new THREE.Mesh(stropdasGeo, roodMateriaal);
  stropdas.position.set(0, -0.1, 0.4);
  stropdas.rotation.x = Math.PI;
  stropdas.name = 'stropdas';
  pandaGroep.add(stropdas);

  // Hoofd (wit)
  const hoofdGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const hoofdMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const hoofd = new THREE.Mesh(hoofdGeo, hoofdMat);
  hoofd.position.y = 0.7;
  pandaGroep.add(hoofd);

  // Oren (zwart)
  const oorGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const zwartMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const linkerOor = new THREE.Mesh(oorGeo, zwartMat);
  linkerOor.position.set(-0.35, 1.1, 0);
  pandaGroep.add(linkerOor);

  const rechterOor = new THREE.Mesh(oorGeo, zwartMat);
  rechterOor.position.set(0.35, 1.1, 0);
  pandaGroep.add(rechterOor);

  // Oogvlekken (zwart)
  const oogvlekGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const linkerOogvlek = new THREE.Mesh(oogvlekGeo, zwartMat);
  linkerOogvlek.position.set(-0.18, 0.75, 0.35);
  linkerOogvlek.scale.set(1, 1.3, 0.5);
  pandaGroep.add(linkerOogvlek);

  const rechterOogvlek = new THREE.Mesh(oogvlekGeo, zwartMat);
  rechterOogvlek.position.set(0.18, 0.75, 0.35);
  rechterOogvlek.scale.set(1, 1.3, 0.5);
  pandaGroep.add(rechterOogvlek);

  // Ogen (wit met zwart)
  const oogGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const linkerOog = new THREE.Mesh(oogGeo, witMateriaal);
  linkerOog.position.set(-0.18, 0.78, 0.45);
  pandaGroep.add(linkerOog);

  const rechterOog = new THREE.Mesh(oogGeo, witMateriaal);
  rechterOog.position.set(0.18, 0.78, 0.45);
  pandaGroep.add(rechterOog);

  // Pupillen
  const pupilGeo = new THREE.SphereGeometry(0.03, 16, 16);
  const linkerPupil = new THREE.Mesh(pupilGeo, zwartMat);
  linkerPupil.position.set(-0.18, 0.78, 0.5);
  pandaGroep.add(linkerPupil);

  const rechterPupil = new THREE.Mesh(pupilGeo, zwartMat);
  rechterPupil.position.set(0.18, 0.78, 0.5);
  pandaGroep.add(rechterPupil);

  // Neus
  const neusGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const neus = new THREE.Mesh(neusGeo, zwartMat);
  neus.position.set(0, 0.6, 0.45);
  neus.scale.set(1, 0.6, 0.6);
  pandaGroep.add(neus);

  // Armpjes (in groepen voor animatie)
  const armGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const handGeo = new THREE.SphereGeometry(0.1, 16, 16);

  // Linker arm groep
  const linkerArmGroep = new THREE.Group();
  linkerArmGroep.name = 'linkerArm';
  linkerArmGroep.position.set(-0.5, 0.1, 0);
  const linkerArm = new THREE.Mesh(armGeo, pakMateriaal);
  linkerArm.scale.set(1, 1.5, 1);
  linkerArm.position.y = -0.1;
  linkerArmGroep.add(linkerArm);
  const linkerHand = new THREE.Mesh(handGeo, zwartMat);
  linkerHand.position.set(0, -0.35, 0);
  linkerArmGroep.add(linkerHand);
  pandaGroep.add(linkerArmGroep);

  // Rechter arm groep
  const rechterArmGroep = new THREE.Group();
  rechterArmGroep.name = 'rechterArm';
  rechterArmGroep.position.set(0.5, 0.1, 0);
  const rechterArm = new THREE.Mesh(armGeo, pakMateriaal);
  rechterArm.scale.set(1, 1.5, 1);
  rechterArm.position.y = -0.1;
  rechterArmGroep.add(rechterArm);
  const rechterHand = new THREE.Mesh(handGeo, zwartMat);
  rechterHand.position.set(0, -0.35, 0);
  rechterArmGroep.add(rechterHand);
  pandaGroep.add(rechterArmGroep);

  // Benen (voor animatie)
  const beenGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.4, 16);
  const schoenGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const schoenMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });

  // Linker been groep
  const linkerBeenGroep = new THREE.Group();
  linkerBeenGroep.name = 'linkerBeen';
  linkerBeenGroep.position.set(-0.2, -0.7, 0);
  const linkerBeen = new THREE.Mesh(beenGeo, pakMateriaal);
  linkerBeen.position.y = -0.2;
  linkerBeenGroep.add(linkerBeen);
  const linkerSchoen = new THREE.Mesh(schoenGeo, schoenMat);
  linkerSchoen.position.set(0, -0.45, 0.05);
  linkerSchoen.scale.set(1, 0.6, 1.3);
  linkerBeenGroep.add(linkerSchoen);
  pandaGroep.add(linkerBeenGroep);

  // Rechter been groep
  const rechterBeenGroep = new THREE.Group();
  rechterBeenGroep.name = 'rechterBeen';
  rechterBeenGroep.position.set(0.2, -0.7, 0);
  const rechterBeen = new THREE.Mesh(beenGeo, pakMateriaal);
  rechterBeen.position.y = -0.2;
  rechterBeenGroep.add(rechterBeen);
  const rechterSchoen = new THREE.Mesh(schoenGeo, schoenMat);
  rechterSchoen.position.set(0, -0.45, 0.05);
  rechterSchoen.scale.set(1, 0.6, 1.3);
  rechterBeenGroep.add(rechterSchoen);
  pandaGroep.add(rechterBeenGroep);

  // Afstudeerhoed (begint onzichtbaar)
  const hoedGroep = new THREE.Group();
  hoedGroep.name = 'afstudeerhoed';
  hoedGroep.visible = false;

  const hoedTopGeo = new THREE.BoxGeometry(0.8, 0.08, 0.8);
  const hoedMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const hoedTop = new THREE.Mesh(hoedTopGeo, hoedMat);
  hoedTop.position.y = 1.35;
  hoedGroep.add(hoedTop);

  const hoedBasisGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 16);
  const hoedBasis = new THREE.Mesh(hoedBasisGeo, hoedMat);
  hoedBasis.position.y = 1.2;
  hoedGroep.add(hoedBasis);

  // Kwastje
  const kwastGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const goudMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  const kwast = new THREE.Mesh(kwastGeo, goudMat);
  kwast.position.set(0.4, 1.25, 0);
  hoedGroep.add(kwast);

  // Koordje
  const koordGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
  const koord = new THREE.Mesh(koordGeo, goudMat);
  koord.position.set(0.25, 1.3, 0);
  koord.rotation.z = Math.PI / 4;
  hoedGroep.add(koord);

  pandaGroep.add(hoedGroep);

  // Bril (begint onzichtbaar)
  const brilGroep = new THREE.Group();
  brilGroep.name = 'bril';
  brilGroep.visible = false;

  const brilMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const glasMat = new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5 });

  const ringGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
  const linkerRing = new THREE.Mesh(ringGeo, brilMat);
  linkerRing.position.set(-0.18, 0.78, 0.5);
  brilGroep.add(linkerRing);

  const rechterRing = new THREE.Mesh(ringGeo, brilMat);
  rechterRing.position.set(0.18, 0.78, 0.5);
  brilGroep.add(rechterRing);

  const glasGeo = new THREE.CircleGeometry(0.09, 16);
  const linkerGlas = new THREE.Mesh(glasGeo, glasMat);
  linkerGlas.position.set(-0.18, 0.78, 0.51);
  brilGroep.add(linkerGlas);

  const rechterGlas = new THREE.Mesh(glasGeo, glasMat);
  rechterGlas.position.set(0.18, 0.78, 0.51);
  brilGroep.add(rechterGlas);

  const brugGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
  const brug = new THREE.Mesh(brugGeo, brilMat);
  brug.position.set(0, 0.78, 0.5);
  brug.rotation.z = Math.PI / 2;
  brilGroep.add(brug);

  pandaGroep.add(brilGroep);

  pandaGroep.castShadow = true;
  return pandaGroep;
}

// === MAAK DE WERELD MOOI ===
function maakWereld() {
  // Hele grote groene grond
  const grondGeo = new THREE.PlaneGeometry(500, 500);
  const grondMat = new THREE.MeshLambertMaterial({ color: 0x3a7d32 });
  const grond = new THREE.Mesh(grondGeo, grondMat);
  grond.rotation.x = -Math.PI / 2;
  grond.position.y = -0.5;
  grond.receiveShadow = true;
  scene.add(grond);

  // Gras patches voor meer detail
  const grasKleuren = [0x4a8d42, 0x3a7d32, 0x2d6b27, 0x55a049];
  for (let i = 0; i < 500; i++) {
    const grasGeo = new THREE.CircleGeometry(0.5 + Math.random() * 2, 8);
    const grasMat = new THREE.MeshLambertMaterial({
      color: grasKleuren[Math.floor(Math.random() * grasKleuren.length)]
    });
    const gras = new THREE.Mesh(grasGeo, grasMat);
    gras.rotation.x = -Math.PI / 2;
    gras.position.set(
      (Math.random() - 0.5) * 200,
      -0.48,
      (Math.random() - 0.5) * 200
    );
    scene.add(gras);
  }

  // Heuvels verspreid over het landschap (buiten het speelveld)
  const heuvelKleuren = [0x4a8d42, 0x3d7a35, 0x55a049, 0x468f3f];
  for (let i = 0; i < 40; i++) {
    const heuvelBreedte = 8 + Math.random() * 15;
    const heuvelHoogte = 2 + Math.random() * 6;

    // Plaats heuvels in een ring buiten het speelveld (minimaal 25 afstand van centrum)
    const hoek = Math.random() * Math.PI * 2;
    const afstand = 30 + Math.random() * 70;
    const heuvelX = Math.cos(hoek) * afstand;
    const heuvelZ = Math.sin(hoek) * afstand;

    const heuvelGeo = new THREE.SphereGeometry(heuvelBreedte, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const heuvelMat = new THREE.MeshLambertMaterial({
      color: heuvelKleuren[Math.floor(Math.random() * heuvelKleuren.length)]
    });
    const heuvel = new THREE.Mesh(heuvelGeo, heuvelMat);
    heuvel.scale.y = heuvelHoogte / heuvelBreedte;
    heuvel.position.set(heuvelX, -0.5, heuvelZ);

    // Sla heuvel data op voor collision
    heuvel.userData = {
      x: heuvelX,
      z: heuvelZ,
      breedte: heuvelBreedte,
      hoogte: heuvelHoogte
    };

    heuvels.push(heuvel);
    scene.add(heuvel);
  }

  // Wolken - meer en verder verspreid
  for (let i = 0; i < 30; i++) {
    const wolkGroep = new THREE.Group();
    const wolkMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // Meerdere bollen voor pluizige wolk
    for (let j = 0; j < 5; j++) {
      const bolGeo = new THREE.SphereGeometry(2 + Math.random() * 3, 16, 16);
      const bol = new THREE.Mesh(bolGeo, wolkMat);
      bol.position.set(j * 2 - 4, Math.random() * 1, Math.random() * 2 - 1);
      wolkGroep.add(bol);
    }

    wolkGroep.position.set(
      (Math.random() - 0.5) * 200,
      25 + Math.random() * 20,
      (Math.random() - 0.5) * 200
    );
    wolkGroep.scale.set(2, 1, 1.5);
    scene.add(wolkGroep);
  }

  // Bloemen - meer verspreid
  const bloemKleuren = [0xff69b4, 0xffff00, 0xff6347, 0xffa500, 0xff1493];
  for (let i = 0; i < 300; i++) {
    const bloemGroep = new THREE.Group();

    // Steel
    const steelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const steel = new THREE.Mesh(steelGeo, steelMat);
    steel.position.y = 0.15;
    bloemGroep.add(steel);

    // Bloem
    const bloemGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const bloemMat = new THREE.MeshLambertMaterial({
      color: bloemKleuren[Math.floor(Math.random() * bloemKleuren.length)]
    });
    const bloem = new THREE.Mesh(bloemGeo, bloemMat);
    bloem.position.y = 0.35;
    bloemGroep.add(bloem);

    bloemGroep.position.set(
      (Math.random() - 0.5) * 150,
      -0.45,
      (Math.random() - 0.5) * 150
    );
    scene.add(bloemGroep);
  }

  // Grote bergen op de achtergrond - eerste ring
  for (let i = 0; i < 12; i++) {
    const bergGeo = new THREE.ConeGeometry(15 + Math.random() * 10, 30 + Math.random() * 20, 8);
    const bergMat = new THREE.MeshLambertMaterial({ color: 0x6b8e6b });
    const berg = new THREE.Mesh(bergGeo, bergMat);

    const hoek = (i / 12) * Math.PI * 2;
    berg.position.set(
      Math.cos(hoek) * 100,
      10,
      Math.sin(hoek) * 100
    );
    scene.add(berg);

    // Sneeuw top
    const sneeuwGeo = new THREE.ConeGeometry(5, 8, 8);
    const sneeuwMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const sneeuw = new THREE.Mesh(sneeuwGeo, sneeuwMat);
    sneeuw.position.set(
      Math.cos(hoek) * 100,
      35 + Math.random() * 10,
      Math.sin(hoek) * 100
    );
    scene.add(sneeuw);
  }

  // Nog grotere bergen verder weg - tweede ring
  for (let i = 0; i < 16; i++) {
    const bergGeo = new THREE.ConeGeometry(25 + Math.random() * 15, 50 + Math.random() * 30, 8);
    const bergMat = new THREE.MeshLambertMaterial({ color: 0x5a7d5a });
    const berg = new THREE.Mesh(bergGeo, bergMat);

    const hoek = (i / 16) * Math.PI * 2 + 0.2;
    berg.position.set(
      Math.cos(hoek) * 180,
      20,
      Math.sin(hoek) * 180
    );
    scene.add(berg);

    // Sneeuw top
    const sneeuwGeo = new THREE.ConeGeometry(10, 15, 8);
    const sneeuwMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const sneeuw = new THREE.Mesh(sneeuwGeo, sneeuwMat);
    sneeuw.position.set(
      Math.cos(hoek) * 180,
      60 + Math.random() * 15,
      Math.sin(hoek) * 180
    );
    scene.add(sneeuw);
  }
}

// === MAAK BAMBOE ===
function maakBamboe() {
  // Bamboe alleen aan de randen van het speelveld
  const posities = [];

  // Maak een cirkel van bamboe rondom het speelveld
  for (let i = 0; i < 40; i++) {
    const hoek = (i / 40) * Math.PI * 2;
    const afstand = 18 + Math.random() * 5;
    posities.push({
      x: Math.cos(hoek) * afstand,
      z: Math.sin(hoek) * afstand
    });
  }

  // Extra bamboe clusters
  for (let i = 0; i < 20; i++) {
    const hoek = Math.random() * Math.PI * 2;
    const afstand = 22 + Math.random() * 8;
    posities.push({
      x: Math.cos(hoek) * afstand,
      z: Math.sin(hoek) * afstand
    });
  }

  for (let pos of posities) {
    const bamboeGroep = new THREE.Group();

    // Stengel
    const stengelHoogte = 6 + Math.random() * 8;
    const stengelGeo = new THREE.CylinderGeometry(0.12, 0.18, stengelHoogte, 8);
    const stengelMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const stengel = new THREE.Mesh(stengelGeo, stengelMat);
    stengel.position.y = stengelHoogte / 2;
    stengel.castShadow = true;
    bamboeGroep.add(stengel);

    // Lichtere binnenkant
    const binnenGeo = new THREE.CylinderGeometry(0.08, 0.12, stengelHoogte, 8);
    const binnenMat = new THREE.MeshLambertMaterial({ color: 0x4a7c39 });
    const binnen = new THREE.Mesh(binnenGeo, binnenMat);
    binnen.position.y = stengelHoogte / 2;
    binnen.position.z = 0.03;
    bamboeGroep.add(binnen);

    // Segmenten (ringen)
    const segmentMat = new THREE.MeshLambertMaterial({ color: 0x1a3d18 });
    for (let j = 1; j < stengelHoogte; j += 1.2) {
      const segmentGeo = new THREE.TorusGeometry(0.16, 0.03, 8, 16);
      const segment = new THREE.Mesh(segmentGeo, segmentMat);
      segment.position.y = j;
      segment.rotation.x = Math.PI / 2;
      bamboeGroep.add(segment);
    }

    // Blaadjes
    const bladMat = new THREE.MeshLambertMaterial({ color: 0x3d8b37, side: THREE.DoubleSide });
    for (let j = 3; j < stengelHoogte; j += 1.5) {
      for (let k = 0; k < 3; k++) {
        const bladGeo = new THREE.PlaneGeometry(0.6 + Math.random() * 0.3, 0.15);
        const blad = new THREE.Mesh(bladGeo, bladMat);
        const bladHoek = (k / 3) * Math.PI * 2 + Math.random() * 0.5;
        blad.position.set(
          Math.cos(bladHoek) * 0.3,
          j + Math.random() * 0.3,
          Math.sin(bladHoek) * 0.3
        );
        blad.rotation.z = (Math.random() - 0.5) * 0.5;
        blad.rotation.y = bladHoek;
        bamboeGroep.add(blad);
      }
    }

    bamboeGroep.position.set(pos.x, -0.5, pos.z);
    scene.add(bamboeGroep);
    bamboeStengels.push(bamboeGroep);
  }
}

// === MAAK VOGEL ===
function maakVogel(x, y, z) {
  const vogelGroep = new THREE.Group();

  // Lichaam
  const lichaamGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const lichaamMat = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
  const lichaam = new THREE.Mesh(lichaamGeo, lichaamMat);
  lichaam.scale.set(1.2, 1, 1);
  vogelGroep.add(lichaam);

  // Hoofd
  const hoofdGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const hoofd = new THREE.Mesh(hoofdGeo, lichaamMat);
  hoofd.position.set(0.35, 0.1, 0);
  vogelGroep.add(hoofd);

  // Snavel (oranje)
  const snavelGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
  const snavelMat = new THREE.MeshLambertMaterial({ color: 0xff8c00 });
  const snavel = new THREE.Mesh(snavelGeo, snavelMat);
  snavel.position.set(0.55, 0.1, 0);
  snavel.rotation.z = -Math.PI / 2;
  vogelGroep.add(snavel);

  // Ogen (boos!)
  const oogMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const oogGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const linkerOog = new THREE.Mesh(oogGeo, oogMat);
  linkerOog.position.set(0.45, 0.18, 0.12);
  vogelGroep.add(linkerOog);

  const rechterOog = new THREE.Mesh(oogGeo, oogMat);
  rechterOog.position.set(0.45, 0.18, -0.12);
  vogelGroep.add(rechterOog);

  // Vleugels
  const vleugelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
  const vleugelGeo = new THREE.PlaneGeometry(0.5, 0.25);

  const linkerVleugel = new THREE.Mesh(vleugelGeo, vleugelMat);
  linkerVleugel.position.set(0, 0, 0.3);
  linkerVleugel.rotation.x = 0.3;
  linkerVleugel.name = 'linkerVleugel';
  vogelGroep.add(linkerVleugel);

  const rechterVleugel = new THREE.Mesh(vleugelGeo, vleugelMat);
  rechterVleugel.position.set(0, 0, -0.3);
  rechterVleugel.rotation.x = -0.3;
  rechterVleugel.name = 'rechterVleugel';
  vogelGroep.add(rechterVleugel);

  // Staart
  const staartGeo = new THREE.PlaneGeometry(0.3, 0.2);
  const staart = new THREE.Mesh(staartGeo, vleugelMat);
  staart.position.set(-0.4, 0, 0);
  staart.rotation.y = Math.PI / 2;
  vogelGroep.add(staart);

  vogelGroep.position.set(x, y, z);

  // Vogel data
  vogelGroep.userData = {
    startX: x,
    startY: y,
    startZ: z,
    hoek: Math.random() * Math.PI * 2,
    snelheid: 0.02 + Math.random() * 0.02,
    vliegRadius: 5 + Math.random() * 5,
    vleugelAnimatie: 0
  };

  scene.add(vogelGroep);
  return vogelGroep;
}

// === MAAK VOGELS VOOR LEVEL ===
function maakVogels(aantal) {
  // Verwijder oude vogels
  vogels.forEach(v => scene.remove(v));
  vogels = [];

  for (let i = 0; i < aantal; i++) {
    const hoek = (i / aantal) * Math.PI * 2;
    const afstand = 8 + Math.random() * 5;
    const x = Math.cos(hoek) * afstand;
    const z = Math.sin(hoek) * afstand;
    const y = 3 + Math.random() * 4;

    vogels.push(maakVogel(x, y, z));
  }
}

// === MAAK PLATFORM ===
function maakPlatform(data) {
  const geo = new THREE.BoxGeometry(data.breedte, data.hoogte, data.diepte);

  // Haal thema kleuren op
  const thema = levelThemas[huidigLevel];
  const grasKleur = thema.gras;
  const grondKleur = thema.grond;

  // Gras bovenop, grond aan de zijkanten
  const materialen = [
    new THREE.MeshLambertMaterial({ color: grondKleur }), // rechts
    new THREE.MeshLambertMaterial({ color: grondKleur }), // links
    new THREE.MeshLambertMaterial({ color: grasKleur }),  // boven (gras)
    new THREE.MeshLambertMaterial({ color: grondKleur }), // onder
    new THREE.MeshLambertMaterial({ color: grondKleur }), // voor
    new THREE.MeshLambertMaterial({ color: grondKleur }), // achter
  ];

  const mesh = new THREE.Mesh(geo, materialen);
  mesh.position.set(data.x, data.y, data.z);
  mesh.receiveShadow = true;
  mesh.userData = data;
  scene.add(mesh);
  return mesh;
}

// === MAAK MUNT ===
function maakMunt(data) {
  const muntGroep = new THREE.Group();

  // Gouden munt
  const muntGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32);
  const muntMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const munt = new THREE.Mesh(muntGeo, muntMat);
  munt.rotation.x = Math.PI / 2;
  muntGroep.add(munt);

  // Glanzende rand
  const randGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 32);
  const randMat = new THREE.MeshLambertMaterial({ color: 0xffec8b });
  const rand = new THREE.Mesh(randGeo, randMat);
  muntGroep.add(rand);

  // Dollar teken of ster in het midden
  const sterGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const sterMat = new THREE.MeshLambertMaterial({ color: 0xffa500 });
  const ster = new THREE.Mesh(sterGeo, sterMat);
  ster.position.z = 0.03;
  muntGroep.add(ster);

  // Glitter effect (kleine bolletjes)
  for (let i = 0; i < 4; i++) {
    const glitterGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const glitterMat = new THREE.MeshLambertMaterial({ color: 0xffffe0 });
    const glitter = new THREE.Mesh(glitterGeo, glitterMat);
    const hoek = (i / 4) * Math.PI * 2;
    glitter.position.set(Math.cos(hoek) * 0.15, Math.sin(hoek) * 0.15, 0.03);
    muntGroep.add(glitter);
  }

  muntGroep.position.set(data.x, data.y, data.z);
  muntGroep.userData = { type: 'munt', collected: false, waarde: data.waarde || 1 };
  scene.add(muntGroep);
  return muntGroep;
}

// === MAAK BOEKJE ===
function maakBoekje(data) {
  const boekGroep = new THREE.Group();

  // Boek kleuren (verschillende kleuren voor variatie)
  const boekKleuren = [0x8B4513, 0x2e4a1e, 0x4a1e1e, 0x1e2e4a, 0x4a3a1e];
  const kleur = boekKleuren[Math.floor(Math.random() * boekKleuren.length)];

  // Cover (volledig boek)
  const coverGeo = new THREE.BoxGeometry(0.4, 0.5, 0.15);
  const coverMat = new THREE.MeshLambertMaterial({ color: kleur });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  boekGroep.add(cover);

  // Paginas aan de zijkant
  const paginaGeo = new THREE.BoxGeometry(0.02, 0.45, 0.12);
  const paginaMat = new THREE.MeshLambertMaterial({ color: 0xFFFEF0 });
  const paginas = new THREE.Mesh(paginaGeo, paginaMat);
  paginas.position.x = 0.19;
  boekGroep.add(paginas);

  // Rug van het boek (donkerder)
  const rugGeo = new THREE.BoxGeometry(0.02, 0.5, 0.15);
  const rugMat = new THREE.MeshLambertMaterial({ color: 0x3d2817 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.x = -0.2;
  boekGroep.add(rug);

  // Titel streepje
  const titelGeo = new THREE.BoxGeometry(0.25, 0.05, 0.01);
  const titelMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const titel = new THREE.Mesh(titelGeo, titelMat);
  titel.position.set(0, 0.1, 0.08);
  boekGroep.add(titel);

  boekGroep.position.set(data.x, data.y, data.z);
  boekGroep.userData = { type: 'boekje', collected: false };
  scene.add(boekGroep);
  return boekGroep;
}

// === MAAK BRILLETJE ===
function maakBrilletje(data) {
  const brilGroep = new THREE.Group();

  const brilMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const glasMat = new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5 });

  // Linker glas
  const ringGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
  const linkerRing = new THREE.Mesh(ringGeo, brilMat);
  linkerRing.position.x = -0.2;
  brilGroep.add(linkerRing);

  const glasGeo = new THREE.CircleGeometry(0.13, 16);
  const linkerGlas = new THREE.Mesh(glasGeo, glasMat);
  linkerGlas.position.set(-0.2, 0, 0.01);
  brilGroep.add(linkerGlas);

  // Rechter glas
  const rechterRing = new THREE.Mesh(ringGeo, brilMat);
  rechterRing.position.x = 0.2;
  brilGroep.add(rechterRing);

  const rechterGlas = new THREE.Mesh(glasGeo, glasMat);
  rechterGlas.position.set(0.2, 0, 0.01);
  brilGroep.add(rechterGlas);

  // Brug
  const brugGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
  const brug = new THREE.Mesh(brugGeo, brilMat);
  brug.rotation.z = Math.PI / 2;
  brilGroep.add(brug);

  brilGroep.position.set(data.x, data.y, data.z);
  brilGroep.userData = { type: 'brilletje', collected: false };
  scene.add(brilGroep);
  return brilGroep;
}

// === LAAD LEVEL ===
function laadLevel(levelNummer) {
  // Verwijder oude objecten
  platformMeshes.forEach(m => scene.remove(m));
  boekjeMeshes.forEach(m => scene.remove(m));
  brilletjeMeshes.forEach(m => scene.remove(m));
  muntMeshes.forEach(m => scene.remove(m));

  platformMeshes = [];
  boekjeMeshes = [];
  brilletjeMeshes = [];
  muntMeshes = [];

  const level = alleLevels[levelNummer];

  // Pas thema toe
  const thema = levelThemas[levelNummer];
  scene.background = new THREE.Color(thema.lucht);
  scene.fog = new THREE.Fog(thema.lucht, 50, 250);

  // Maak platformen
  level.platformen.forEach(p => {
    platformMeshes.push(maakPlatform(p));
  });

  // Maak boekjes
  level.boekjes.forEach(b => {
    boekjeMeshes.push(maakBoekje(b));
  });

  // Maak brilletjes
  level.brilletjes.forEach(br => {
    brilletjeMeshes.push(maakBrilletje(br));
  });

  // Maak munten
  level.muntjes.forEach(m => {
    muntMeshes.push(maakMunt(m));
  });

  // Maak vogels (1 meer per level: level 1 = 1 vogel, level 15 = 15 vogels!)
  const aantalVogels = levelNummer;
  maakVogels(aantalVogels);

  // Reset speler
  speler.x = 0;
  speler.y = 2;
  speler.z = 0;
  speler.ySnelheid = 0;

  // Reset score
  boekjesVerzameld = 0;
  brilletjesVerzameld = 0;
  levelGehaald = false;

  // Update UI
  updateUI();

  // Verberg bril en hoed
  const bril = speler.mesh.getObjectByName('bril');
  const hoed = speler.mesh.getObjectByName('afstudeerhoed');
  if (bril) bril.visible = false;
  if (hoed) hoed.visible = false;

  // Verberg message
  document.getElementById('message').style.display = 'none';

  // Behoud kleding
  updateKledingOpPanda();
}

// === UPDATE UI ===
function updateUI() {
  const level = alleLevels[huidigLevel];
  document.getElementById('level-info').textContent = `Level ${huidigLevel} / 15`;
  document.getElementById('munten').textContent = `🪙 Munten: ${munten}`;

  // Hartjes voor levens (5 stuks)
  let hartjes = '';
  for (let i = 0; i < 5; i++) {
    if (i < levens) {
      hartjes += '❤️';
    } else {
      hartjes += '🖤';
    }
  }

  document.getElementById('score').innerHTML = `
    ${hartjes}<br>
    📚 Boekjes: ${boekjesVerzameld} / ${level.nodig.boekjes}<br>
    👓 Brilletjes: ${brilletjesVerzameld} / ${level.nodig.brilletjes}
  `;
}

// === WINKEL FUNCTIES ===
function toggleWinkel() {
  winkelOpen = !winkelOpen;
  const winkelElement = document.getElementById('winkel');
  winkelElement.style.display = winkelOpen ? 'block' : 'none';

  if (winkelOpen) {
    updateWinkel();
  }
}

function updateWinkel() {
  document.getElementById('winkel-munten').textContent = `🪙 Je hebt: ${munten} munten`;

  const itemsContainer = document.getElementById('winkel-items');
  itemsContainer.innerHTML = '';

  for (let i = 0; i < kledingItems.length; i++) {
    const item = kledingItems[i];
    const div = document.createElement('div');
    div.className = 'winkel-item' + (item.gekocht ? ' gekocht' : '') + (item.aangetrokken ? ' aangetrokken' : '');

    let knopHTML = '';
    if (!item.gekocht) {
      const kanKopen = munten >= item.prijs;
      knopHTML = `<button class="koop-btn kopen" ${kanKopen ? '' : 'disabled'} onclick="koopItem(${i})">🪙 ${item.prijs}</button>`;
    } else if (item.aangetrokken) {
      knopHTML = `<button class="koop-btn uittrekken" onclick="wisselKleding(${i})">Uittrekken</button>`;
    } else {
      knopHTML = `<button class="koop-btn aantrekken" onclick="wisselKleding(${i})">Aantrekken</button>`;
    }

    div.innerHTML = `
      <div class="item-info">
        <div class="item-naam">${item.naam}</div>
        <div class="item-prijs">${item.gekocht ? '✓ Gekocht' : `Prijs: ${item.prijs} munten`}</div>
      </div>
      ${knopHTML}
    `;

    itemsContainer.appendChild(div);
  }
}

function koopItem(index) {
  const item = kledingItems[index];
  if (munten >= item.prijs && !item.gekocht) {
    munten -= item.prijs;
    item.gekocht = true;
    updateUI();
    updateWinkel();
    updateKledingOpPanda();
  }
}

function wisselKleding(index) {
  const item = kledingItems[index];
  if (item.gekocht) {
    // Als het dezelfde type is, trek andere uit
    for (let i = 0; i < kledingItems.length; i++) {
      if (kledingItems[i].type === item.type && i !== index) {
        kledingItems[i].aangetrokken = false;
      }
    }
    item.aangetrokken = !item.aangetrokken;
    updateWinkel();
    updateKledingOpPanda();
  }
}

function updateKledingOpPanda() {
  // Verwijder oude kleding
  const oudeKleding = speler.mesh.getObjectByName('extraKleding');
  if (oudeKleding) {
    speler.mesh.remove(oudeKleding);
  }

  const kledingGroep = new THREE.Group();
  kledingGroep.name = 'extraKleding';

  for (let item of kledingItems) {
    if (item.aangetrokken) {
      switch (item.type) {
        case 'strik':
          // Strik onder de kin
          const strikMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const strikLinks = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), strikMat);
          strikLinks.position.set(-0.12, 0.35, 0.35);
          strikLinks.scale.set(1.5, 1, 0.5);
          kledingGroep.add(strikLinks);
          const strikRechts = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), strikMat);
          strikRechts.position.set(0.12, 0.35, 0.35);
          strikRechts.scale.set(1.5, 1, 0.5);
          kledingGroep.add(strikRechts);
          const strikMidden = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), strikMat);
          strikMidden.position.set(0, 0.35, 0.4);
          kledingGroep.add(strikMidden);
          break;

        case 'kroon':
          // Gouden kroon
          const kroonMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const kroonBasis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.15, 16), kroonMat);
          kroonBasis.position.y = 1.25;
          kledingGroep.add(kroonBasis);
          // Punten
          for (let p = 0; p < 5; p++) {
            const punt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), kroonMat);
            const hoek = (p / 5) * Math.PI * 2;
            punt.position.set(Math.cos(hoek) * 0.2, 1.4, Math.sin(hoek) * 0.2);
            kledingGroep.add(punt);
          }
          // Robijn
          const robijn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
          robijn.position.set(0, 1.28, 0.25);
          kledingGroep.add(robijn);
          break;

        case 'zonnebril':
          // Coole zonnebril
          const zonMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const glasMat = new THREE.MeshLambertMaterial({ color: 0x333333, transparent: true, opacity: 0.8 });
          // Frames
          const frameLinks = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), zonMat);
          frameLinks.position.set(-0.18, 0.78, 0.52);
          kledingGroep.add(frameLinks);
          const frameRechts = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), zonMat);
          frameRechts.position.set(0.18, 0.78, 0.52);
          kledingGroep.add(frameRechts);
          // Glazen
          const glasLinks = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), glasMat);
          glasLinks.position.set(-0.18, 0.78, 0.53);
          kledingGroep.add(glasLinks);
          const glasRechts = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), glasMat);
          glasRechts.position.set(0.18, 0.78, 0.53);
          kledingGroep.add(glasRechts);
          // Brug
          const brug = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), zonMat);
          brug.position.set(0, 0.78, 0.52);
          brug.rotation.z = Math.PI / 2;
          kledingGroep.add(brug);
          break;

        case 'cape':
          // Cape
          const capeMat = new THREE.MeshLambertMaterial({ color: item.kleur, side: THREE.DoubleSide });
          const capeGeo = new THREE.PlaneGeometry(0.8, 1.2);
          const cape = new THREE.Mesh(capeGeo, capeMat);
          cape.position.set(0, 0, -0.4);
          cape.rotation.x = 0.2;
          kledingGroep.add(cape);
          // Kraag
          const kraagMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
          const kraag = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 16), kraagMat);
          kraag.position.set(0, 0.5, 0);
          kraag.rotation.x = Math.PI / 2;
          kledingGroep.add(kraag);
          break;

        case 'medaille':
          // Gouden medaille
          const medMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const medaille = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), medMat);
          medaille.position.set(0, -0.1, 0.45);
          medaille.rotation.x = Math.PI / 2;
          kledingGroep.add(medaille);
          // Lint
          const lintMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
          const lint = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.3), lintMat);
          lint.position.set(0, 0.1, 0.42);
          kledingGroep.add(lint);
          // Ster
          const ster = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), medMat);
          ster.position.set(0, -0.1, 0.47);
          kledingGroep.add(ster);
          break;

        case 'feesthoed':
          // Feesthoedje
          const feestMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const hoed = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 16), feestMat);
          hoed.position.set(0, 1.4, 0);
          kledingGroep.add(hoed);
          // Pompom
          const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffff00 }));
          pompom.position.set(0, 1.65, 0);
          kledingGroep.add(pompom);
          // Strepen
          const streepMat = new THREE.MeshLambertMaterial({ color: 0x00ffff });
          for (let s = 0; s < 3; s++) {
            const streep = new THREE.Mesh(new THREE.TorusGeometry(0.12 - s * 0.03, 0.015, 8, 16), streepMat);
            streep.position.set(0, 1.2 + s * 0.12, 0);
            streep.rotation.x = Math.PI / 2;
            kledingGroep.add(streep);
          }
          break;

        case 'cowboyhoed':
          // Cowboyhoed
          const cowboyMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const cowboyTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.25, 16), cowboyMat);
          cowboyTop.position.y = 1.3;
          kledingGroep.add(cowboyTop);
          const cowboyRand = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16), cowboyMat);
          cowboyRand.position.y = 1.15;
          kledingGroep.add(cowboyRand);
          break;

        case 'toveraarshoed':
          // Toveraarshoed
          const tovMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const tovHoed = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 16), tovMat);
          tovHoed.position.y = 1.5;
          kledingGroep.add(tovHoed);
          const tovRand = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), tovMat);
          tovRand.position.y = 1.15;
          kledingGroep.add(tovRand);
          // Sterren
          const sterMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
          for (let st = 0; st < 5; st++) {
            const ster = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), sterMat);
            ster.position.set(Math.cos(st) * 0.15, 1.3 + st * 0.1, Math.sin(st) * 0.15);
            kledingGroep.add(ster);
          }
          break;

        case 'ketting':
          // Diamanten ketting
          const kettingMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
          const diamantMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const ketting = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 8, 32), kettingMat);
          ketting.position.set(0, 0.3, 0.35);
          ketting.rotation.x = Math.PI / 2;
          kledingGroep.add(ketting);
          // Diamant
          const diamant = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), diamantMat);
          diamant.position.set(0, 0.15, 0.45);
          kledingGroep.add(diamant);
          break;

        case 'vleugels':
          // Vleugels
          const vleugelMat = new THREE.MeshLambertMaterial({ color: item.kleur, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
          // Linker vleugel
          const linkerVleugel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), vleugelMat);
          linkerVleugel.position.set(-0.5, 0.2, -0.3);
          linkerVleugel.rotation.y = 0.5;
          kledingGroep.add(linkerVleugel);
          // Rechter vleugel
          const rechterVleugel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), vleugelMat);
          rechterVleugel.position.set(0.5, 0.2, -0.3);
          rechterVleugel.rotation.y = -0.5;
          kledingGroep.add(rechterVleugel);
          // Veren
          for (let v = 0; v < 3; v++) {
            const veer1 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), vleugelMat);
            veer1.position.set(-0.7 - v * 0.15, 0.1 + v * 0.1, -0.3);
            veer1.rotation.y = 0.3;
            veer1.rotation.z = v * 0.2;
            kledingGroep.add(veer1);
            const veer2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), vleugelMat);
            veer2.position.set(0.7 + v * 0.15, 0.1 + v * 0.1, -0.3);
            veer2.rotation.y = -0.3;
            veer2.rotation.z = -v * 0.2;
            kledingGroep.add(veer2);
          }
          break;

        case 'masker':
          // Masker
          const maskerMat = new THREE.MeshLambertMaterial({ color: item.kleur });
          const masker = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), maskerMat);
          masker.position.set(0, 0.78, 0.5);
          kledingGroep.add(masker);
          // Oog gaten
          const gatMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
          const linkerGat = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), gatMat);
          linkerGat.position.set(-0.12, 0.78, 0.56);
          kledingGroep.add(linkerGat);
          const rechterGat = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), gatMat);
          rechterGat.position.set(0.12, 0.78, 0.56);
          kledingGroep.add(rechterGat);
          break;

        case 'aura':
          // Gloeiende aura
          const auraMat = new THREE.MeshLambertMaterial({ color: item.kleur, transparent: true, opacity: 0.3 });
          const aura = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), auraMat);
          aura.position.y = 0.3;
          kledingGroep.add(aura);
          // Sparkles
          for (let sp = 0; sp < 10; sp++) {
            const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
            sparkle.position.set(
              (Math.random() - 0.5) * 1.5,
              Math.random() * 1.5,
              (Math.random() - 0.5) * 1.5
            );
            kledingGroep.add(sparkle);
          }
          break;
      }
    }
  }

  speler.mesh.add(kledingGroep);
}

// Maak toggleWinkel globaal beschikbaar
window.toggleWinkel = toggleWinkel;
window.koopItem = koopItem;
window.wisselKleding = wisselKleding;

// === EINDANIMATIE: UNIVERSITEIT ===
function maakUniversiteit() {
  const uniGroep = new THREE.Group();

  // Hoofdgebouw
  const gebouwMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
  const gebouw = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 8), gebouwMat);
  gebouw.position.y = 4;
  uniGroep.add(gebouw);

  // Dak
  const dakMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const dak = new THREE.Mesh(new THREE.ConeGeometry(8, 3, 4), dakMat);
  dak.position.y = 9.5;
  dak.rotation.y = Math.PI / 4;
  uniGroep.add(dak);

  // Pilaren
  const pilaarMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for (let i = 0; i < 4; i++) {
    const pilaar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 6, 16), pilaarMat);
    pilaar.position.set(-4.5 + i * 3, 3, 4.5);
    uniGroep.add(pilaar);
  }

  // Deur
  const deurMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
  const deur = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.2), deurMat);
  deur.position.set(0, 2, 4.1);
  uniGroep.add(deur);

  // Ramen
  const raamMat = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const raam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.1), raamMat);
      raam.position.set(-4 + col * 4, 3 + row * 2.5, 4.1);
      uniGroep.add(raam);
    }
  }

  // Bord "UNIVERSITEIT"
  const bordMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const bord = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 0.1), bordMat);
  bord.position.set(0, 7.5, 4.1);
  uniGroep.add(bord);

  // Trap
  const trapMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  for (let t = 0; t < 4; t++) {
    const trede = new THREE.Mesh(new THREE.BoxGeometry(5 - t * 0.3, 0.3, 1), trapMat);
    trede.position.set(0, t * 0.3, 5.5 + t * 0.5);
    uniGroep.add(trede);
  }

  // Vlaggen
  const vlagMat = new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const vlagstok1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 8), pilaarMat);
  vlagstok1.position.set(-5, 10, 0);
  uniGroep.add(vlagstok1);
  const vlag1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), vlagMat);
  vlag1.position.set(-4.2, 11, 0);
  uniGroep.add(vlag1);

  const vlagstok2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 8), pilaarMat);
  vlagstok2.position.set(5, 10, 0);
  uniGroep.add(vlagstok2);
  const vlag2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), vlagMat);
  vlag2.position.set(5.8, 11, 0);
  uniGroep.add(vlag2);

  // Boom links
  const stamMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const bladMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
  const stam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), stamMat);
  stam1.position.set(-8, 1.5, 3);
  uniGroep.add(stam1);
  const blad1 = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), bladMat);
  blad1.position.set(-8, 4, 3);
  uniGroep.add(blad1);

  // Boom rechts
  const stam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), stamMat);
  stam2.position.set(8, 1.5, 3);
  uniGroep.add(stam2);
  const blad2 = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), bladMat);
  blad2.position.set(8, 4, 3);
  uniGroep.add(blad2);

  uniGroep.position.set(0, 0, -20);
  return uniGroep;
}

function maakGeslaagdPanda() {
  // Maak een nieuwe panda met geslaagd hoed en tekst
  const pandaGroep = maakPanda();

  // Afstudeerhoed altijd zichtbaar
  const hoed = pandaGroep.getObjectByName('afstudeerhoed');
  if (hoed) hoed.visible = true;

  // "GESLAAGD" tekst op voorhoofd (met blokjes)
  const tekstGroep = new THREE.Group();
  const letterMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

  // Maak "GESLAAGD" met kleine blokjes
  const letters = [
    // G
    [[0,0], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1], [2,2], [2,1.5]],
    // E
    [[0,0], [0,1], [0,2], [1,0], [1,1], [1,2], [2,0], [2,2]],
    // S
    [[0,0], [0,2], [1,0], [1,1], [1,2], [2,0], [2,2]],
    // L
    [[0,0], [1,0], [2,0], [2,1], [2,2]],
    // A
    [[0,0], [0,1], [1,0], [1,1], [1,2], [2,0], [2,1]],
    // A
    [[0,0], [0,1], [1,0], [1,1], [1,2], [2,0], [2,1]],
    // G
    [[0,0], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1], [2,2], [2,1.5]],
    // D
    [[0,0], [0,1], [1,0], [1,2], [2,0], [2,1]]
  ];

  let xOffset = -0.35;
  letters.forEach((letter, li) => {
    letter.forEach(pos => {
      const blok = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), letterMat);
      blok.position.set(xOffset + pos[1] * 0.035, 0.95 - pos[0] * 0.035, 0.52);
      tekstGroep.add(blok);
    });
    xOffset += 0.12;
  });

  pandaGroep.add(tekstGroep);

  // Confetti toevoegen
  const confettiKleuren = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let c = 0; c < 30; c++) {
    const confetti = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.01),
      new THREE.MeshLambertMaterial({ color: confettiKleuren[c % confettiKleuren.length] })
    );
    confetti.position.set(
      (Math.random() - 0.5) * 2,
      1.5 + Math.random() * 1,
      (Math.random() - 0.5) * 1
    );
    confetti.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    confetti.name = 'confetti';
    pandaGroep.add(confetti);
  }

  return pandaGroep;
}

function startEindAnimatie() {
  eindAnimatieActief = true;
  eindAnimatieFase = 0;
  eindAnimatieTijd = 0;

  // Verberg normale UI
  document.getElementById('ui').style.display = 'none';
  document.getElementById('message').style.display = 'none';

  // Verwijder level objecten
  platformMeshes.forEach(m => scene.remove(m));
  boekjeMeshes.forEach(m => scene.remove(m));
  brilletjeMeshes.forEach(m => scene.remove(m));
  muntMeshes.forEach(m => scene.remove(m));
  vogels.forEach(v => scene.remove(v));
  bamboeStengels.forEach(b => scene.remove(b));

  // Verberg normale speler
  speler.mesh.visible = false;

  // Maak universiteit
  universiteitMesh = maakUniversiteit();
  scene.add(universiteitMesh);

  // Maak grond voor animatie
  const grondGeo = new THREE.PlaneGeometry(50, 50);
  const grondMat = new THREE.MeshLambertMaterial({ color: 0x3a7d32 });
  const animatieGrond = new THREE.Mesh(grondGeo, grondMat);
  animatieGrond.rotation.x = -Math.PI / 2;
  animatieGrond.position.y = -0.01;
  animatieGrond.name = 'animatieGrond';
  scene.add(animatieGrond);

  // Maak wandelende panda (zonder geslaagd)
  geslaagdPanda = maakPanda();
  geslaagdPanda.position.set(0, 1, 15);
  geslaagdPanda.rotation.y = Math.PI;
  scene.add(geslaagdPanda);

  // Speel muziek uit
  if (muziekInterval) {
    clearInterval(muziekInterval);
    muziekInterval = null;
  }
}

function updateEindAnimatie() {
  if (!eindAnimatieActief) return;

  eindAnimatieTijd += 1;

  // Camera volgt de actie
  if (eindAnimatieFase === 0) {
    // Fase 0: Panda loopt naar universiteit
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 3, -10);

    geslaagdPanda.position.z -= 0.08;
    isAanHetLopen = true;

    // Animeer benen van geslaagde panda
    const linkerBeen = geslaagdPanda.getObjectByName('linkerBeen');
    const rechterBeen = geslaagdPanda.getObjectByName('rechterBeen');
    const linkerArm = geslaagdPanda.getObjectByName('linkerArm');
    const rechterArm = geslaagdPanda.getObjectByName('rechterArm');
    if (linkerBeen) linkerBeen.rotation.x = Math.sin(eindAnimatieTijd * 0.2) * 0.5;
    if (rechterBeen) rechterBeen.rotation.x = -Math.sin(eindAnimatieTijd * 0.2) * 0.5;
    if (linkerArm) linkerArm.rotation.x = -Math.sin(eindAnimatieTijd * 0.2) * 0.4;
    if (rechterArm) rechterArm.rotation.x = Math.sin(eindAnimatieTijd * 0.2) * 0.4;

    if (geslaagdPanda.position.z < -15) {
      eindAnimatieFase = 1;
      eindAnimatieTijd = 0;
      geslaagdPanda.visible = false;
    }
  } else if (eindAnimatieFase === 1) {
    // Fase 1: Wacht even (panda is binnen)
    camera.position.set(0, 6, 15);
    camera.lookAt(0, 5, -20);

    if (eindAnimatieTijd > 120) {
      eindAnimatieFase = 2;
      eindAnimatieTijd = 0;

      // Verwijder oude panda en maak geslaagde versie
      scene.remove(geslaagdPanda);
      geslaagdPanda = maakGeslaagdPanda();
      geslaagdPanda.position.set(0, 1, -15);
      geslaagdPanda.rotation.y = 0;
      geslaagdPanda.visible = true;
      scene.add(geslaagdPanda);
    }
  } else if (eindAnimatieFase === 2) {
    // Fase 2: Panda komt naar buiten met GESLAAGD!
    camera.position.set(0, 4, 5);
    camera.lookAt(geslaagdPanda.position);

    geslaagdPanda.position.z += 0.05;

    // Animeer benen
    const linkerBeen = geslaagdPanda.getObjectByName('linkerBeen');
    const rechterBeen = geslaagdPanda.getObjectByName('rechterBeen');
    const linkerArm = geslaagdPanda.getObjectByName('linkerArm');
    const rechterArm = geslaagdPanda.getObjectByName('rechterArm');
    if (linkerBeen) linkerBeen.rotation.x = Math.sin(eindAnimatieTijd * 0.15) * 0.4;
    if (rechterBeen) rechterBeen.rotation.x = -Math.sin(eindAnimatieTijd * 0.15) * 0.4;
    if (linkerArm) linkerArm.rotation.x = -Math.sin(eindAnimatieTijd * 0.15) * 0.3;
    if (rechterArm) rechterArm.rotation.x = Math.sin(eindAnimatieTijd * 0.15) * 0.3;

    // Confetti animeren
    geslaagdPanda.children.forEach(child => {
      if (child.name === 'confetti') {
        child.position.y -= 0.02;
        child.rotation.x += 0.1;
        child.rotation.z += 0.15;
        if (child.position.y < -1) {
          child.position.y = 2;
          child.position.x = (Math.random() - 0.5) * 2;
        }
      }
    });

    if (geslaagdPanda.position.z > 5) {
      eindAnimatieFase = 3;
      eindAnimatieTijd = 0;
    }
  } else if (eindAnimatieFase === 3) {
    // Fase 3: Panda staat stil, feest!
    camera.position.set(2, 3, 8);
    camera.lookAt(geslaagdPanda.position);

    // Panda springt van vreugde
    geslaagdPanda.position.y = 1 + Math.abs(Math.sin(eindAnimatieTijd * 0.1)) * 0.5;
    geslaagdPanda.rotation.y = Math.sin(eindAnimatieTijd * 0.05) * 0.3;

    // Confetti blijft vallen
    geslaagdPanda.children.forEach(child => {
      if (child.name === 'confetti') {
        child.position.y -= 0.015;
        child.rotation.x += 0.1;
        child.rotation.z += 0.15;
        if (child.position.y < -1) {
          child.position.y = 2.5;
          child.position.x = (Math.random() - 0.5) * 3;
        }
      }
    });

    // Toon eindscherm na een tijdje
    if (eindAnimatieTijd > 180) {
      const msg = document.getElementById('message');
      msg.innerHTML = `
        <h1 style="font-size: 50px; color: gold;">🎓 GEFELICITEERD! 🎓</h1>
        <p style="font-size: 28px; color: #00ff00;">JE BENT GESLAAGD!</p>
        <p style="font-size: 20px;">Je hebt alle 15 levels gehaald!</p>
        <p style="font-size: 24px; margin: 20px 0;">🪙 Totaal verdiend: ${munten} munten</p>
        <p style="font-size: 60px;">🐼🎉📚👓🏆👑🎊</p>
        <p style="font-size: 16px; margin-top: 20px; color: #aaa;">Druk op SPATIE om opnieuw te spelen</p>
      `;
      msg.style.display = 'block';
      eindAnimatieFase = 4;
    }
  } else if (eindAnimatieFase === 4) {
    // Wacht op spatie om opnieuw te beginnen
    // Blijf confetti animeren
    if (geslaagdPanda) {
      geslaagdPanda.position.y = 1 + Math.abs(Math.sin(eindAnimatieTijd * 0.1)) * 0.3;
      geslaagdPanda.children.forEach(child => {
        if (child.name === 'confetti') {
          child.position.y -= 0.01;
          child.rotation.x += 0.05;
          if (child.position.y < -1) {
            child.position.y = 2.5;
          }
        }
      });
    }
    eindAnimatieTijd++;
  }
}

function stopEindAnimatie() {
  eindAnimatieActief = false;

  // Verwijder animatie objecten
  if (universiteitMesh) {
    scene.remove(universiteitMesh);
    universiteitMesh = null;
  }
  if (geslaagdPanda) {
    scene.remove(geslaagdPanda);
    geslaagdPanda = null;
  }

  // Verwijder animatie grond
  const animatieGrond = scene.getObjectByName('animatieGrond');
  if (animatieGrond) scene.remove(animatieGrond);

  // Toon UI weer
  document.getElementById('ui').style.display = 'block';
  document.getElementById('message').style.display = 'none';

  // Reset speler
  speler.mesh.visible = true;

  // Herbouw wereld
  maakBamboe();
}

// === LOOP ANIMATIE FUNCTIE ===
function animeerPanda() {
  if (!speler.mesh) return;

  const linkerArm = speler.mesh.getObjectByName('linkerArm');
  const rechterArm = speler.mesh.getObjectByName('rechterArm');
  const linkerBeen = speler.mesh.getObjectByName('linkerBeen');
  const rechterBeen = speler.mesh.getObjectByName('rechterBeen');
  const lijf = speler.mesh.getObjectByName('lijf');
  const stropdas = speler.mesh.getObjectByName('stropdas');

  if (isAanHetLopen) {
    // Coole swagger loop!
    loopAnimatie += 0.25;

    // Armen zwaaien (tegenovergesteld aan benen, cool en relaxed)
    if (linkerArm) {
      linkerArm.rotation.x = Math.sin(loopAnimatie) * 0.6;
      linkerArm.rotation.z = 0.1 + Math.sin(loopAnimatie * 0.5) * 0.1;
    }
    if (rechterArm) {
      rechterArm.rotation.x = -Math.sin(loopAnimatie) * 0.6;
      rechterArm.rotation.z = -0.1 - Math.sin(loopAnimatie * 0.5) * 0.1;
    }

    // Benen lopen
    if (linkerBeen) {
      linkerBeen.rotation.x = -Math.sin(loopAnimatie) * 0.5;
    }
    if (rechterBeen) {
      rechterBeen.rotation.x = Math.sin(loopAnimatie) * 0.5;
    }

    // Lijf wiebelt een beetje (swagger)
    if (lijf) {
      lijf.rotation.z = Math.sin(loopAnimatie) * 0.05;
      lijf.position.y = -0.3 + Math.abs(Math.sin(loopAnimatie * 2)) * 0.05;
    }

    // Stropdas zwaait mee
    if (stropdas) {
      stropdas.rotation.x = Math.PI + Math.sin(loopAnimatie * 2) * 0.1;
    }

    // Hoofd beweegt een beetje cool
    speler.mesh.children[3].rotation.z = Math.sin(loopAnimatie * 0.5) * 0.03; // hoofd

  } else {
    // Idle animatie - rustig ademen en relaxed staan
    loopAnimatie += 0.05;

    // Armen relaxed langs het lichaam
    if (linkerArm) {
      linkerArm.rotation.x = Math.sin(loopAnimatie) * 0.05;
      linkerArm.rotation.z = 0.15;
    }
    if (rechterArm) {
      rechterArm.rotation.x = Math.sin(loopAnimatie) * 0.05;
      rechterArm.rotation.z = -0.15;
    }

    // Benen stil
    if (linkerBeen) {
      linkerBeen.rotation.x = 0;
    }
    if (rechterBeen) {
      rechterBeen.rotation.x = 0;
    }

    // Ademen
    if (lijf) {
      lijf.scale.x = 1 + Math.sin(loopAnimatie) * 0.02;
      lijf.scale.z = 0.8 + Math.sin(loopAnimatie) * 0.02;
      lijf.rotation.z = 0;
      lijf.position.y = -0.3;
    }

    // Stropdas rustig
    if (stropdas) {
      stropdas.rotation.x = Math.PI;
    }
  }
}

// === TOETSENBORD ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') toetsen.vooruit = true;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') toetsen.achteruit = true;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') toetsen.links = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') toetsen.rechts = true;
  if (e.key === ' ') {
    if (eindAnimatieActief && eindAnimatieFase === 4) {
      // Na eindanimatie opnieuw beginnen
      stopEindAnimatie();
      gameOver = false;
      levens = 5;
      huidigLevel = 1;
      laadLevel(1);
      // Start muziek weer
      if (muziekAan && !muziekInterval) {
        startIrritanteMuziek();
      }
    } else if (gameOver) {
      // Opnieuw beginnen
      gameOver = false;
      levens = 5;
      huidigLevel = 1;
      laadLevel(1);
    } else if (levelGehaald && huidigLevel < 15) {
      huidigLevel++;
      laadLevel(huidigLevel);
    } else {
      toetsen.spring = true;
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') toetsen.vooruit = false;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') toetsen.achteruit = false;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') toetsen.links = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') toetsen.rechts = false;
  if (e.key === ' ') toetsen.spring = false;
});

// === MUIS BESTURING ===
document.addEventListener('mousedown', (e) => {
  muisIngedrukt = true;
});

document.addEventListener('mouseup', (e) => {
  muisIngedrukt = false;
});

document.addEventListener('mousemove', (e) => {
  if (muisIngedrukt) {
    cameraRotatieX -= e.movementX * 0.005;
    cameraRotatieY += e.movementY * 0.005;

    // Beperk de verticale rotatie
    cameraRotatieY = Math.max(0.1, Math.min(1.5, cameraRotatieY));
  }
});

// Scroll om in/uit te zoomen
document.addEventListener('wheel', (e) => {
  cameraAfstand += e.deltaY * 0.01;
  cameraAfstand = Math.max(5, Math.min(20, cameraAfstand));
});

// === UPDATE ===
function update() {
  if (levelGehaald || gameOver) return;

  // Bereken bewegingsrichting relatief aan camera
  let moveX = 0;
  let moveZ = 0;

  // Richting waar de camera naar kijkt (horizontaal)
  const vooruitX = -Math.sin(cameraRotatieX);
  const vooruitZ = -Math.cos(cameraRotatieX);
  const linksX = -Math.cos(cameraRotatieX);
  const linksZ = Math.sin(cameraRotatieX);

  if (toetsen.vooruit) {
    moveX += vooruitX;
    moveZ += vooruitZ;
  }
  if (toetsen.achteruit) {
    moveX -= vooruitX;
    moveZ -= vooruitZ;
  }
  if (toetsen.links) {
    moveX += linksX;
    moveZ += linksZ;
  }
  if (toetsen.rechts) {
    moveX -= linksX;
    moveZ -= linksZ;
  }

  // Normaliseer en pas snelheid toe
  if (moveX !== 0 || moveZ !== 0) {
    const lengte = Math.sqrt(moveX * moveX + moveZ * moveZ);
    speler.x += (moveX / lengte) * speler.snelheid;
    speler.z += (moveZ / lengte) * speler.snelheid;

    // Draai panda geleidelijk in looprichting (max 2 graden per keer)
    const doelRotatie = Math.atan2(moveX, moveZ);
    const verschil = doelRotatie - speler.mesh.rotation.y;
    const normaal = Math.atan2(Math.sin(verschil), Math.cos(verschil));
    const maxDraai = 2 * (Math.PI / 180); // 2 graden in radialen
    const draai = Math.max(-maxDraai, Math.min(maxDraai, normaal));
    speler.mesh.rotation.y += draai;

    // Aan het lopen!
    isAanHetLopen = true;
  } else {
    isAanHetLopen = false;
  }

  // Springen
  if (toetsen.spring && speler.opGrond && !eindAnimatieActief) {
    speler.ySnelheid = speler.springKracht;
    speler.opGrond = false;
  }

  // Zwaartekracht
  speler.ySnelheid -= 0.015;
  speler.y += speler.ySnelheid;

  // Platform collision
  speler.opGrond = false;
  for (let platform of platformMeshes) {
    const p = platform.userData;
    const halfB = p.breedte / 2;
    const halfD = p.diepte / 2;

    if (speler.x > p.x - halfB - 0.3 && speler.x < p.x + halfB + 0.3 &&
        speler.z > p.z - halfD - 0.3 && speler.z < p.z + halfD + 0.3) {
      const topY = p.y + p.hoogte / 2;
      if (speler.y <= topY + 1 && speler.y >= topY - 0.5 && speler.ySnelheid <= 0) {
        speler.y = topY + 1;
        speler.ySnelheid = 0;
        speler.opGrond = true;
      }
    }
  }

  // Heuvel collision - loop over heuvels heen
  let opHeuvel = false;
  for (let heuvel of heuvels) {
    const h = heuvel.userData;
    const dx = speler.x - h.x;
    const dz = speler.z - h.z;
    const afstand = Math.sqrt(dx * dx + dz * dz);

    if (afstand < h.breedte) {
      // Bereken hoogte op de heuvel (halve bol formule)
      const ratio = afstand / h.breedte;
      const heuvelY = Math.sqrt(1 - ratio * ratio) * h.hoogte - 0.5;

      if (speler.y <= heuvelY + 1 && speler.ySnelheid <= 0) {
        speler.y = heuvelY + 1;
        speler.ySnelheid = 0;
        speler.opGrond = true;
        opHeuvel = true;
      }
    }
  }

  // Grond collision - de panda kan ook op de grond staan
  if (!opHeuvel && speler.y <= 0.5 && speler.ySnelheid <= 0) {
    speler.y = 0.5;
    speler.ySnelheid = 0;
    speler.opGrond = true;
  }

  // Val reset (alleen als je heel ver valt, bijv. door een gat)
  if (speler.y < -50) {
    speler.x = 0;
    speler.y = 2;
    speler.z = 0;
    speler.ySnelheid = 0;
  }

  // Update mesh positie
  speler.mesh.position.set(speler.x, speler.y, speler.z);

  // Boekjes verzamelen
  for (let i = boekjeMeshes.length - 1; i >= 0; i--) {
    const boek = boekjeMeshes[i];
    if (!boek.userData.collected) {
      const dx = speler.x - boek.position.x;
      const dy = speler.y - boek.position.y;
      const dz = speler.z - boek.position.z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < 1) {
        boek.userData.collected = true;
        scene.remove(boek);
        boekjeMeshes.splice(i, 1);
        boekjesVerzameld++;
        updateUI();
      }
    }
  }

  // Brilletjes verzamelen
  for (let i = brilletjeMeshes.length - 1; i >= 0; i--) {
    const bril = brilletjeMeshes[i];
    if (!bril.userData.collected) {
      const dx = speler.x - bril.position.x;
      const dy = speler.y - bril.position.y;
      const dz = speler.z - bril.position.z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < 1) {
        bril.userData.collected = true;
        scene.remove(bril);
        brilletjeMeshes.splice(i, 1);
        brilletjesVerzameld++;
        updateUI();

        // Toon bril op panda
        const pandaBril = speler.mesh.getObjectByName('bril');
        if (pandaBril) pandaBril.visible = true;
      }
    }
  }

  // Check level gehaald
  const level = alleLevels[huidigLevel];
  if (boekjesVerzameld >= level.nodig.boekjes && brilletjesVerzameld >= level.nodig.brilletjes) {
    levelGehaald = true;

    // Geef 10 munten!
    munten += 10;
    updateUI();

    // Toon afstudeerhoed
    const hoed = speler.mesh.getObjectByName('afstudeerhoed');
    if (hoed) hoed.visible = true;

    // Toon bericht
    const msg = document.getElementById('message');
    if (huidigLevel < 15) {
      msg.innerHTML = `
        <h1>LEVEL ${huidigLevel} GEHAALD!</h1>
        <p>Je panda heeft de afstudeerhoed verdiend! 🎓</p>
        <p style="color: gold; font-size: 24px; margin: 15px 0;">+10 munten! 🪙</p>
        <p>Je hebt nu ${munten} munten - bezoek de winkel!</p>
        <p style="font-size: 14px; color: #ff6b6b;">⚠️ Volgende level: ${huidigLevel + 1} vogels!</p>
        <p class="next-level">Druk op SPATIE voor level ${huidigLevel + 1}</p>
      `;
    } else {
      // Level 15 gehaald! Start eindanimatie!
      setTimeout(() => {
        startEindAnimatie();
      }, 1500);

      msg.innerHTML = `
        <h1 style="font-size: 40px;">🎓 LEVEL 15 GEHAALD! 🎓</h1>
        <p style="font-size: 24px;">Je gaat nu afstuderen...</p>
        <p style="color: gold; font-size: 24px; margin: 15px 0;">+10 munten! 🪙</p>
      `;
    }
    msg.style.display = 'block';
  }

  // Animeer boekjes en brillen (draaien)
  boekjeMeshes.forEach(b => { b.rotation.y += 0.02; });
  brilletjeMeshes.forEach(b => { b.rotation.y += 0.03; });

  // Animeer en verzamel munten
  for (let i = muntMeshes.length - 1; i >= 0; i--) {
    const munt = muntMeshes[i];
    if (!munt.userData.collected) {
      // Draai en bob de munt
      munt.rotation.y += 0.05;
      munt.position.y += Math.sin(Date.now() * 0.005 + i) * 0.002;

      // Check collision
      const dx = speler.x - munt.position.x;
      const dy = speler.y - munt.position.y;
      const dz = speler.z - munt.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.2) {
        munt.userData.collected = true;
        scene.remove(munt);
        muntMeshes.splice(i, 1);
        munten += munt.userData.waarde;
        updateUI();

        // Leuk geluidje voor munt
        if (audioContext && muziekAan) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start();
          osc.stop(audioContext.currentTime + 0.2);
        }
      }
    }
  }

  // Update vogels
  for (let vogel of vogels) {
    const data = vogel.userData;

    // Vlieg in cirkels rond hun startpunt
    data.hoek += data.snelheid;

    // Beweeg naar de speler toe (langzaam)
    const richtingX = speler.x - data.startX;
    const richtingZ = speler.z - data.startZ;
    const afstand = Math.sqrt(richtingX * richtingX + richtingZ * richtingZ);

    if (afstand > 2) {
      data.startX += (richtingX / afstand) * 0.02;
      data.startZ += (richtingZ / afstand) * 0.02;
    }

    // Cirkelbeweging + op en neer
    vogel.position.x = data.startX + Math.cos(data.hoek) * data.vliegRadius;
    vogel.position.z = data.startZ + Math.sin(data.hoek) * data.vliegRadius;
    vogel.position.y = data.startY + Math.sin(data.hoek * 2) * 1;

    // Kijk in vliegrichting
    vogel.rotation.y = -data.hoek + Math.PI / 2;

    // Vleugel animatie
    data.vleugelAnimatie += 0.3;
    const linkerVleugel = vogel.getObjectByName('linkerVleugel');
    const rechterVleugel = vogel.getObjectByName('rechterVleugel');
    if (linkerVleugel && rechterVleugel) {
      linkerVleugel.rotation.x = 0.3 + Math.sin(data.vleugelAnimatie) * 0.5;
      rechterVleugel.rotation.x = -0.3 - Math.sin(data.vleugelAnimatie) * 0.5;
    }

    // Check collision met speler
    if (!onkwetsbaar) {
      const dx = speler.x - vogel.position.x;
      const dy = speler.y - vogel.position.y;
      const dz = speler.z - vogel.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.2) {
        // Geraakt!
        levens--;
        updateUI();

        // Maak speler even onkwetsbaar
        onkwetsbaar = true;

        // Laat panda knipperen
        let knipperTeller = 0;
        const knipperInterval = setInterval(() => {
          speler.mesh.visible = !speler.mesh.visible;
          knipperTeller++;
          if (knipperTeller > 10) {
            clearInterval(knipperInterval);
            speler.mesh.visible = true;
            onkwetsbaar = false;
          }
        }, 150);

        // Duw speler weg
        speler.x += (dx / dist) * 3;
        speler.z += (dz / dist) * 3;
        speler.ySnelheid = 0.2;

        // Check game over
        if (levens <= 0) {
          gameOver = true;
          const msg = document.getElementById('message');
          msg.innerHTML = `
            <h1 style="color: #ff4444;">GAME OVER!</h1>
            <p style="font-size: 24px;">De vogels hebben gewonnen... 🐦</p>
            <p class="next-level">Druk op SPATIE om opnieuw te beginnen</p>
          `;
          msg.style.display = 'block';
        }
      }
    }
  }
}

// === CAMERA UPDATE ===
function updateCamera() {
  // Camera volgt de panda van achteren
  if (speler.mesh) {
    // Draai de camera langzaam naar achter de panda
    const doelRotatie = speler.mesh.rotation.y + Math.PI;
    const verschil = doelRotatie - cameraRotatieX;
    // Normaliseer het verschil tussen -PI en PI
    const normaal = Math.atan2(Math.sin(verschil), Math.cos(verschil));
    cameraRotatieX += normaal * 0.05;
  }

  // Bereken camera positie rond de speler
  const cameraX = speler.x + Math.sin(cameraRotatieX) * Math.cos(cameraRotatieY) * cameraAfstand;
  const cameraY = speler.y + Math.sin(cameraRotatieY) * cameraAfstand;
  const cameraZ = speler.z + Math.cos(cameraRotatieX) * Math.cos(cameraRotatieY) * cameraAfstand;

  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(speler.x, speler.y + 1, speler.z);
}

// === GAME LOOP ===
function gameLoop() {
  if (eindAnimatieActief) {
    updateEindAnimatie();
  } else {
    update();
    animeerPanda();
    updateCamera();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}

// === WINDOW RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === START ===
speler.mesh = maakPanda();
scene.add(speler.mesh);
maakWereld();
maakBamboe();
laadLevel(1);
updateKledingOpPanda();
gameLoop();
