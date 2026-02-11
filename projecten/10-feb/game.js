// === FARMING SIMULATOR ===

// === SCENE OPZETTEN ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Luchtige blauwe lucht

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// === LICHT ===
const zon = new THREE.DirectionalLight(0xffffff, 1);
zon.position.set(10, 20, 10);
zon.castShadow = true;
scene.add(zon);

const omgevingsLicht = new THREE.AmbientLight(0x404040, 0.5);
scene.add(omgevingsLicht);

// === GROND ===
const grondGeometrie = new THREE.PlaneGeometry(100, 100);
const grondMateriaal = new THREE.MeshLambertMaterial({ color: 0x4a8c2a });
const grond = new THREE.Mesh(grondGeometrie, grondMateriaal);
grond.rotation.x = -Math.PI / 2;
grond.receiveShadow = true;
scene.add(grond);

// === HEKKEN ===
const hekMateriaal = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
let hekStukken = [];
let weilandGrootte = 40;

function maakHek(startX, startZ, eindX, eindZ, aantal) {
  const stappen = aantal;
  for (let i = 0; i <= stappen; i++) {
    const x = startX + (eindX - startX) * (i / stappen);
    const z = startZ + (eindZ - startZ) * (i / stappen);

    // Paal
    const paalGeo = new THREE.CylinderGeometry(0.15, 0.15, 2);
    const paal = new THREE.Mesh(paalGeo, hekMateriaal);
    paal.position.set(x, 1, z);
    paal.castShadow = true;
    scene.add(paal);
    hekStukken.push(paal);
  }

  // Horizontale balken
  for (let h of [0.6, 1.3]) {
    const lengte = Math.sqrt((eindX - startX) ** 2 + (eindZ - startZ) ** 2);
    const balkGeo = new THREE.BoxGeometry(lengte, 0.1, 0.1);
    const balk = new THREE.Mesh(balkGeo, hekMateriaal);
    balk.position.set((startX + eindX) / 2, h, (startZ + eindZ) / 2);
    balk.rotation.y = Math.atan2(eindX - startX, eindZ - startZ) + Math.PI / 2;
    scene.add(balk);
    hekStukken.push(balk);
  }
}

function bouwHekken() {
  // Verwijder oude hekken
  for (const h of hekStukken) {
    scene.remove(h);
  }
  hekStukken = [];

  const g = weilandGrootte;
  const aantal = Math.max(4, Math.floor(g / 2));
  maakHek(-g, -g, g, -g, aantal);
  maakHek(-g, g, g, g, aantal);
  maakHek(-g, -g, -g, g, aantal);
  maakHek(g, -g, g, g, aantal);
}

// Eerste hekken
bouwHekken();

// === BLOEMEN ===
const bloemKleuren = [0xffff00, 0xff69b4, 0xffffff, 0xff4444, 0x9b59b6];
for (let i = 0; i < 60; i++) {
  const x = (Math.random() - 0.5) * 46;
  const z = (Math.random() - 0.5) * 46;
  const kleur = bloemKleuren[Math.floor(Math.random() * bloemKleuren.length)];

  // Stengel
  const stengelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
  const stengelMat = new THREE.MeshLambertMaterial({ color: 0x2d5a1e });
  const stengel = new THREE.Mesh(stengelGeo, stengelMat);
  stengel.position.set(x, 0.2, z);
  scene.add(stengel);

  // Bloem
  const bloemGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const bloemMat = new THREE.MeshLambertMaterial({ color: kleur });
  const bloem = new THREE.Mesh(bloemGeo, bloemMat);
  bloem.position.set(x, 0.45, z);
  scene.add(bloem);
}

// === HOOG GRAS ===
const grassKleuren = [0x3a7a1a, 0x4a8c2a, 0x2d6a1e, 0x5a9a3a];
const grassSprieten = [];

function maakGras() {
  // Losse sprieten
  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    const hoogte = 1 + Math.random() * 1.5;
    const kleur = grassKleuren[Math.floor(Math.random() * grassKleuren.length)];

    const grassGeo = new THREE.ConeGeometry(0.08, hoogte, 4);
    const grassMat = new THREE.MeshLambertMaterial({ color: kleur });
    const gras = new THREE.Mesh(grassGeo, grassMat);
    gras.position.set(x, hoogte / 2, z);
    gras.rotation.x = (Math.random() - 0.5) * 0.3;
    gras.rotation.z = (Math.random() - 0.5) * 0.3;
    scene.add(gras);
    grassSprieten.push(gras);
  }

  // Gras bosjes (dikke plukken)
  for (let i = 0; i < 1000; i++) {
    const bx = (Math.random() - 0.5) * 80;
    const bz = (Math.random() - 0.5) * 80;
    const kleur = grassKleuren[Math.floor(Math.random() * grassKleuren.length)];

    const aantal = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < aantal; j++) {
      const hoogte = 0.8 + Math.random() * 1.2;
      const offsetX = (Math.random() - 0.5) * 0.4;
      const offsetZ = (Math.random() - 0.5) * 0.4;

      const sprietGeo = new THREE.ConeGeometry(0.1, hoogte, 4);
      const sprietMat = new THREE.MeshLambertMaterial({ color: kleur });
      const spriet = new THREE.Mesh(sprietGeo, sprietMat);
      spriet.position.set(bx + offsetX, hoogte / 2, bz + offsetZ);
      spriet.rotation.x = (Math.random() - 0.5) * 0.4;
      spriet.rotation.z = (Math.random() - 0.5) * 0.4;
      scene.add(spriet);
      grassSprieten.push(spriet);
    }
  }
}

maakGras();
let gemaaidGras = 0;

// === KOEIEN ===
const koeien = [];

function maakKoe(x, z, draaiing) {
  const koeGroep = new THREE.Group();
  const wit = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const zwart = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const roze = new THREE.MeshLambertMaterial({ color: 0xffaaaa });

  // Lichaam (wit)
  const lichaamGeo = new THREE.BoxGeometry(1.8, 1.4, 3);
  const lichaam = new THREE.Mesh(lichaamGeo, wit);
  lichaam.position.set(0, 1.5, 0);
  lichaam.castShadow = true;
  koeGroep.add(lichaam);

  // Zwarte vlekken
  const vlek1Geo = new THREE.BoxGeometry(0.5, 0.6, 1);
  const vlek1 = new THREE.Mesh(vlek1Geo, zwart);
  vlek1.position.set(0.7, 1.8, 0.3);
  koeGroep.add(vlek1);

  const vlek2Geo = new THREE.BoxGeometry(0.6, 0.5, 0.8);
  const vlek2 = new THREE.Mesh(vlek2Geo, zwart);
  vlek2.position.set(-0.6, 1.4, -0.5);
  koeGroep.add(vlek2);

  // Hoofd
  const hoofdGeo = new THREE.BoxGeometry(1, 1, 1);
  const hoofd = new THREE.Mesh(hoofdGeo, wit);
  hoofd.position.set(0, 1.8, -2);
  koeGroep.add(hoofd);

  // Snuit (roze)
  const snuitGeo = new THREE.BoxGeometry(0.6, 0.4, 0.3);
  const snuit = new THREE.Mesh(snuitGeo, roze);
  snuit.position.set(0, 1.5, -2.5);
  koeGroep.add(snuit);

  // Oren
  for (let kant of [-0.5, 0.5]) {
    const oorGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    const oor = new THREE.Mesh(oorGeo, wit);
    oor.position.set(kant, 2.3, -1.9);
    koeGroep.add(oor);
  }

  // Poten (4 stuks)
  for (let px of [-0.6, 0.6]) {
    for (let pz of [-0.8, 0.8]) {
      const pootGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
      const poot = new THREE.Mesh(pootGeo, zwart);
      poot.position.set(px, 0.5, pz);
      poot.castShadow = true;
      koeGroep.add(poot);
    }
  }

  // Staart
  const staartGeo = new THREE.BoxGeometry(0.1, 0.1, 1.2);
  const staart = new THREE.Mesh(staartGeo, zwart);
  staart.position.set(0, 1.8, 1.8);
  staart.rotation.x = 0.3;
  koeGroep.add(staart);

  koeGroep.position.set(x, 0, z);
  koeGroep.rotation.y = draaiing;
  scene.add(koeGroep);
  koeien.push(koeGroep);
  return koeGroep;
}

// Plaats koeien verspreid over het weiland
maakKoe(-10, -8, 0.5);
maakKoe(12, 5, 2.1);
maakKoe(-5, 12, 1.2);
maakKoe(15, -12, 3.5);
maakKoe(-15, 0, 4.2);
maakKoe(5, -15, 0.8);

// === MF35 TRACTOR ===
const tractorGroep = new THREE.Group();

// Carrosserie (rood)
const carrosserieGeo = new THREE.BoxGeometry(2.5, 2, 3);
const carrosserieMat = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
const carrosserie = new THREE.Mesh(carrosserieGeo, carrosserieMat);
carrosserie.position.set(0, 1.5, 0);
carrosserie.castShadow = true;
tractorGroep.add(carrosserie);

// Motorkap (grijs)
const motorkapGeo = new THREE.BoxGeometry(2, 1.2, 2);
const motorkapMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
const motorkap = new THREE.Mesh(motorkapGeo, motorkapMat);
motorkap.position.set(0, 1.1, 2.2);
motorkap.castShadow = true;
tractorGroep.add(motorkap);

// Uitlaat
const uitlaatGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
const uitlaatMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
const uitlaat = new THREE.Mesh(uitlaatGeo, uitlaatMat);
uitlaat.position.set(0.7, 2.5, 2.5);
tractorGroep.add(uitlaat);

// Dak
const dakGeo = new THREE.BoxGeometry(2.2, 0.15, 2.5);
const dakMat = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
const dak = new THREE.Mesh(dakGeo, dakMat);
dak.position.set(0, 3.2, 0);
tractorGroep.add(dak);

// Dak steunen
for (let dx of [-0.9, 0.9]) {
  const steunGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.8);
  const steunMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const steun = new THREE.Mesh(steunGeo, steunMat);
  steun.position.set(dx, 2.8, 0.5);
  tractorGroep.add(steun);
}

// Grote achterwielen
for (let kant of [-1.5, 1.5]) {
  const wielGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16);
  const wielMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const wiel = new THREE.Mesh(wielGeo, wielMat);
  wiel.rotation.z = Math.PI / 2;
  wiel.position.set(kant, 1.2, -0.5);
  wiel.castShadow = true;
  tractorGroep.add(wiel);

  // Velg
  const velgGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.55, 16);
  const velgMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const velg = new THREE.Mesh(velgGeo, velgMat);
  velg.rotation.z = Math.PI / 2;
  velg.position.set(kant, 1.2, -0.5);
  tractorGroep.add(velg);
}

// Kleine voorwielen
for (let kant of [-1.1, 1.1]) {
  const wielGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
  const wielMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const wiel = new THREE.Mesh(wielGeo, wielMat);
  wiel.rotation.z = Math.PI / 2;
  wiel.position.set(kant, 0.6, 2.5);
  wiel.castShadow = true;
  tractorGroep.add(wiel);

  // Velg
  const velgGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 16);
  const velgMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const velg = new THREE.Mesh(velgGeo, velgMat);
  velg.rotation.z = Math.PI / 2;
  velg.position.set(kant, 0.6, 2.5);
  tractorGroep.add(velg);
}

tractorGroep.position.set(0, 0, 0);
scene.add(tractorGroep);

let tractor = {
  snelheid: 0,
  maxSnelheid: 0.2,
  draaiSnelheid: 0.03,
  hoek: 0
};

// === STIEREN ===
const stieren = [];
let stierSnelheid = 0.12;
let levens = 5;
let gameOver = false;
let level = 1;
let levelOvergang = false;

// Dode koeien bijhouden om op te ruimen
const dodeKoeien = [];

function volgendLevel() {
  levelOvergang = true;
  level++;

  // Ruim dode koeien op
  for (const koe of dodeKoeien) {
    scene.remove(koe);
  }
  dodeKoeien.length = 0;

  // Verwijder alle stieren
  for (const s of stieren) {
    scene.remove(s);
  }
  stieren.length = 0;

  // Weiland wordt langzaam kleiner! (minimum 15)
  weilandGrootte = Math.max(15, 40 - (level - 1) * 1);
  bouwHekken();

  // Maak nieuwe koeien (meer per level!)
  const aantalKoeien = 6 + (level - 1) * 2;
  const spawnGrootte = (weilandGrootte - 3) * 2;
  for (let i = 0; i < aantalKoeien; i++) {
    const x = (Math.random() - 0.5) * spawnGrootte;
    const z = (Math.random() - 0.5) * spawnGrootte;
    const draaiing = Math.random() * Math.PI * 2;
    maakKoe(x, z, draaiing);
  }

  // Stieren worden sneller per level!
  stierSnelheid = 0.12 + (level - 1) * 0.02;

  // Elke 2 levels een stier extra (level 1=1, level 2=1, level 3=2, level 4=2, ...)
  const aantalStieren = Math.ceil(level / 2);
  for (let i = 0; i < aantalStieren; i++) {
    maakStier();
  }

  // Zet tractor terug naar het midden
  tractorGroep.position.set(0, 0, 0);
  tractor.hoek = 0;
  tractor.snelheid = 0;

  levelOvergang = false;
}

function maakStier() {
  const stierGroep = new THREE.Group();
  const bruin = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const donkerBruin = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
  const wit = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

  // Lichaam (groot en sterk)
  const lichaamGeo = new THREE.BoxGeometry(2.2, 1.8, 3.5);
  const lichaam = new THREE.Mesh(lichaamGeo, bruin);
  lichaam.position.set(0, 1.6, 0);
  lichaam.castShadow = true;
  stierGroep.add(lichaam);

  // Hoofd
  const hoofdGeo = new THREE.BoxGeometry(1.3, 1.3, 1.2);
  const hoofd = new THREE.Mesh(hoofdGeo, donkerBruin);
  hoofd.position.set(0, 1.8, 2.2);
  stierGroep.add(hoofd);

  // Hoorns
  for (let kant of [-0.7, 0.7]) {
    const hoornGeo = new THREE.ConeGeometry(0.1, 0.8, 8);
    const hoornMat = new THREE.MeshLambertMaterial({ color: 0xfffff0 });
    const hoorn = new THREE.Mesh(hoornGeo, hoornMat);
    hoorn.position.set(kant, 2.6, 2.2);
    hoorn.rotation.z = kant > 0 ? -0.5 : 0.5;
    stierGroep.add(hoorn);
  }

  // Rode ogen
  for (let kant of [-0.3, 0.3]) {
    const oogGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const oogMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const oog = new THREE.Mesh(oogGeo, oogMat);
    oog.position.set(kant, 2.0, 2.8);
    stierGroep.add(oog);
  }

  // Poten (dik en sterk)
  for (let px of [-0.7, 0.7]) {
    for (let pz of [-1, 1]) {
      const pootGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
      const poot = new THREE.Mesh(pootGeo, donkerBruin);
      poot.position.set(px, 0.6, pz);
      poot.castShadow = true;
      stierGroep.add(poot);
    }
  }

  // Staart
  const staartGeo = new THREE.BoxGeometry(0.15, 0.15, 1.5);
  const staart = new THREE.Mesh(staartGeo, donkerBruin);
  staart.position.set(0, 1.8, -2);
  staart.rotation.x = -0.4;
  stierGroep.add(staart);

  // Spawn op een willekeurige plek aan de rand
  const kant = Math.floor(Math.random() * 4);
  if (kant === 0) stierGroep.position.set(-20, 0, Math.random() * 40 - 20);
  else if (kant === 1) stierGroep.position.set(20, 0, Math.random() * 40 - 20);
  else if (kant === 2) stierGroep.position.set(Math.random() * 40 - 20, 0, -20);
  else stierGroep.position.set(Math.random() * 40 - 20, 0, 20);

  scene.add(stierGroep);
  stieren.push(stierGroep);
}

// === HUD ===
const hud = document.createElement('div');
hud.style.position = 'fixed';
hud.style.top = '20px';
hud.style.left = '20px';
hud.style.color = 'white';
hud.style.fontFamily = 'Arial';
hud.style.fontSize = '24px';
hud.style.textShadow = '2px 2px 4px black';
document.body.appendChild(hud);

function updateHud() {
  let tekst = 'Level ' + level + '  |  ';
  tekst += '❤️'.repeat(levens) + '🖤'.repeat(5 - levens);
  tekst += '  |  Koeien over: ' + koeien.length;
  tekst += '  |  🌾 Gemaaid: ' + gemaaidGras;
  if (stieren.length === 1) tekst += '  |  ⚠️ PAS OP: STIER!';
  if (stieren.length > 1) tekst += '  |  ⚠️ PAS OP: ' + stieren.length + ' STIEREN!';
  if (koeien.length === 0 && !gameOver) tekst += '  |  🎉 LEVEL GEHAALD!';
  if (gameOver) tekst = '💀 GAME OVER! Je haalde level ' + level + '. Druk op R om opnieuw te spelen';
  hud.innerHTML = tekst;
}

// === TOETSEN ===
const toetsen = {};

document.addEventListener('keydown', (e) => {
  toetsen[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  toetsen[e.key] = false;
});

// Stier is er meteen! (level 1 = 1 stier)
maakStier();

// === GAME LOOP ===
function update() {
  // Herstart met R
  if (toetsen['r'] && gameOver) {
    location.reload();
    return;
  }

  if (gameOver) { updateHud(); return; }

  // Gas geven en remmen
  if (toetsen['ArrowUp'] || toetsen['w']) {
    tractor.snelheid = Math.min(tractor.snelheid + 0.005, tractor.maxSnelheid);
  } else if (toetsen['ArrowDown'] || toetsen['s']) {
    tractor.snelheid = Math.max(tractor.snelheid - 0.005, -tractor.maxSnelheid / 2);
  } else {
    // Langzaam afremmen
    tractor.snelheid *= 0.98;
  }

  // Sturen (alleen als je rijdt)
  if (toetsen['ArrowLeft'] || toetsen['a']) {
    tractor.hoek += tractor.draaiSnelheid;
  }
  if (toetsen['ArrowRight'] || toetsen['d']) {
    tractor.hoek -= tractor.draaiSnelheid;
  }

  // Beweeg de tractor in de richting waar hij heen kijkt
  tractorGroep.position.x += Math.sin(tractor.hoek) * tractor.snelheid;
  tractorGroep.position.z += Math.cos(tractor.hoek) * tractor.snelheid;
  tractorGroep.rotation.y = tractor.hoek;

  // Maai het gras! Als de tractor over gras rijdt verdwijnt het
  for (let i = grassSprieten.length - 1; i >= 0; i--) {
    const gras = grassSprieten[i];
    const dx = tractorGroep.position.x - gras.position.x;
    const dz = tractorGroep.position.z - gras.position.z;
    const afstand = Math.sqrt(dx * dx + dz * dz);

    if (afstand < 2.5) {
      scene.remove(gras);
      grassSprieten.splice(i, 1);
      gemaaidGras++;
    }
  }

  // Check of tractor een koe raakt
  for (let i = koeien.length - 1; i >= 0; i--) {
    const koe = koeien[i];
    const afstandX = tractorGroep.position.x - koe.position.x;
    const afstandZ = tractorGroep.position.z - koe.position.z;
    const afstand = Math.sqrt(afstandX * afstandX + afstandZ * afstandZ);

    if (afstand < 3) {
      koe.rotation.z = Math.PI / 2;
      koe.position.y = -0.5;
      koeien.splice(i, 1);
      dodeKoeien.push(koe);

      // Alle koeien dood? Volgend level!
      if (koeien.length === 0) {
        setTimeout(() => {
          volgendLevel();
        }, 1000);
      }
    }
  }

  // Stieren achtervolgen de tractor
  for (let i = stieren.length - 1; i >= 0; i--) {
    const s = stieren[i];
    const dx = tractorGroep.position.x - s.position.x;
    const dz = tractorGroep.position.z - s.position.z;
    const afstand = Math.sqrt(dx * dx + dz * dz);
    const hoek = Math.atan2(dx, dz);

    s.position.x += Math.sin(hoek) * stierSnelheid;
    s.position.z += Math.cos(hoek) * stierSnelheid;
    s.rotation.y = hoek;

    // Stier raakt tractor!
    if (afstand < 3.5) {
      levens--;
      // Duw tractor weg
      tractorGroep.position.x += Math.sin(hoek) * 5;
      tractorGroep.position.z += Math.cos(hoek) * 5;
      // Verwijder deze stier even
      scene.remove(s);
      stieren.splice(i, 1);

      if (levens <= 0) {
        gameOver = true;
      } else {
        // Stier komt opnieuw na 2 seconden
        setTimeout(() => {
          if (!gameOver) maakStier();
        }, 2000);
      }
    }
  }



  // Zorg dat de tractor in het weiland blijft
  const grens = weilandGrootte - 2;
  tractorGroep.position.x = Math.max(-grens, Math.min(grens, tractorGroep.position.x));
  tractorGroep.position.z = Math.max(-grens, Math.min(grens, tractorGroep.position.z));

  // Camera volgt de tractor van achteren
  const cameraAfstand = 15;
  const cameraHoogte = 8;
  camera.position.x = tractorGroep.position.x - Math.sin(tractor.hoek) * cameraAfstand;
  camera.position.z = tractorGroep.position.z - Math.cos(tractor.hoek) * cameraAfstand;
  camera.position.y = cameraHoogte;
  camera.lookAt(tractorGroep.position.x, 2, tractorGroep.position.z);

  updateHud();
}

function gameLoop() {
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}

// Pas aan als het scherm verandert
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start de game!
gameLoop();
