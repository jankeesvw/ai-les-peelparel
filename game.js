// === MIJN GAME ===

// Pak het canvas en de "pen" om mee te tekenen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// === SPELER ===
const speler = {
  x: 400,
  y: 300,
  breedte: 50,
  hoogte: 50,
  kleur: 'green',
  snelheid: 5
};

// === START SCHERM ===
let startScherm = true;

// === PARKOUR ===
let level = 1;
let muren = [];
const finish = { x: canvas.width - 80, y: canvas.height / 2 - 30, breedte: 60, hoogte: 60 };
let gewonnen = false;
let levelKlaar = false;

// Maak muren voor elk level - wordt steeds moeilijker!
function maakLevel(nr) {
  muren = [];
  // Hoe hoger het level, hoe smaller de openingen
  const opening = Math.max(100 - (nr * 3), 50);
  // Hoe hoger het level, hoe meer muren
  const aantalMuren = Math.min(2 + nr, 10);
  const afstand = (canvas.width - 150) / (aantalMuren + 1);

  for (let i = 0; i < aantalMuren; i++) {
    const muurX = 100 + afstand * (i + 1);
    // Wissel de positie van de opening af per muur en level
    const openingY = 50 + ((i + nr) % 4) * ((canvas.height - opening - 100) / 3);

    // Muur boven de opening
    if (openingY > 0) {
      muren.push({ x: muurX, y: 0, breedte: 20, hoogte: openingY });
    }
    // Muur onder de opening
    if (openingY + opening < canvas.height) {
      muren.push({ x: muurX, y: openingY + opening, breedte: 20, hoogte: canvas.height - openingY - opening });
    }
  }

  // Zet Schilpie terug aan de start
  speler.x = 30;
  speler.y = 270;
  levelKlaar = false;
  voerOpzak = 0;
  speler.snelheid = 5;
  maakVijanden(nr);
  maakVissenvoer(nr);
  maakVissen(nr);
}

// Level 1 wordt gestart na alle definities

// Check of twee dingen elkaar raken
function botst(a, b) {
  return a.x < b.x + b.breedte &&
         a.x + a.breedte > b.x &&
         a.y < b.y + b.hoogte &&
         a.y + a.hoogte > b.y;
}

// === ANDERE SCHILDPADDEN (vijanden) ===
let vijanden = [];

function maakVijanden(nr) {
  vijanden = [];
  const aantal = Math.min(1 + Math.floor(nr / 2), 8);
  for (let i = 0; i < aantal; i++) {
    vijanden.push({
      x: 150 + Math.random() * (canvas.width - 300),
      y: 50 + Math.random() * (canvas.height - 100),
      breedte: 40,
      hoogte: 40,
      snelheidX: (1 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1),
      snelheidY: (0.5 + Math.random() * 1) * (Math.random() < 0.5 ? 1 : -1),
      kleur: '#f5d442',
      vriendje: false
    });
  }
}

function tekenSchildpad(cx, cy, kleur, naam, schaal) {
  const s = schaal || 1;

  // Schaduw onder schildpad
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx + 2, cy + 3, 16*s, 18*s, 0, 0, Math.PI * 2); ctx.fill();

  // Zwempootjes met vinachtige vorm
  ctx.fillStyle = kleur;
  const pootWiggle = Math.sin(golftijd * 4 + cx) * 3 * s;
  // Linksvoor
  ctx.beginPath(); ctx.ellipse(cx - 14*s, cy - 15*s + pootWiggle, 7*s, 4*s, -0.4, 0, Math.PI * 2); ctx.fill();
  // Rechtsvoor
  ctx.beginPath(); ctx.ellipse(cx + 14*s, cy - 15*s - pootWiggle, 7*s, 4*s, 0.4, 0, Math.PI * 2); ctx.fill();
  // Linksachter
  ctx.beginPath(); ctx.ellipse(cx - 13*s, cy + 15*s - pootWiggle, 6*s, 4*s, -0.3, 0, Math.PI * 2); ctx.fill();
  // Rechtsachter
  ctx.beginPath(); ctx.ellipse(cx + 13*s, cy + 15*s + pootWiggle, 6*s, 4*s, 0.3, 0, Math.PI * 2); ctx.fill();

  // Staartje
  ctx.beginPath();
  ctx.moveTo(cx, cy + 17*s);
  ctx.quadraticCurveTo(cx + 3*s, cy + 24*s, cx - 1*s, cy + 26*s);
  ctx.quadraticCurveTo(cx - 4*s, cy + 22*s, cx, cy + 17*s);
  ctx.fill();

  // Schild - bruin gradient voor diepte
  const schildGrad = ctx.createRadialGradient(cx - 3*s, cy - 4*s, 2*s, cx, cy, 18*s);
  schildGrad.addColorStop(0, '#a0724e');
  schildGrad.addColorStop(0.5, '#7a5230');
  schildGrad.addColorStop(1, '#5a3a1a');
  ctx.fillStyle = schildGrad;
  ctx.beginPath(); ctx.ellipse(cx, cy, 16*s, 18*s, 0, 0, Math.PI * 2); ctx.fill();

  // Schildrand
  ctx.strokeStyle = '#3d2510';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.ellipse(cx, cy, 16*s, 18*s, 0, 0, Math.PI * 2); ctx.stroke();

  // Schildpatroon - zeshoekig patroon
  ctx.strokeStyle = 'rgba(61, 37, 16, 0.6)';
  ctx.lineWidth = 1 * s;
  // Middelste zeshoek
  ctx.beginPath(); ctx.ellipse(cx, cy, 7*s, 8*s, 0, 0, Math.PI * 2); ctx.stroke();
  // Lijnen naar de rand
  for (let i = 0; i < 6; i++) {
    const hoek = (i / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(hoek) * 7*s, cy + Math.sin(hoek) * 8*s);
    ctx.lineTo(cx + Math.cos(hoek) * 16*s, cy + Math.sin(hoek) * 18*s);
    ctx.stroke();
  }
  // Glans op het schild
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.ellipse(cx - 4*s, cy - 5*s, 7*s, 5*s, -0.3, 0, Math.PI * 2); ctx.fill();

  // Kopje met gradient
  const kopGrad = ctx.createRadialGradient(cx - 1*s, cy - 24*s, 1*s, cx, cy - 22*s, 8*s);
  kopGrad.addColorStop(0, kleur);
  kopGrad.addColorStop(1, darkenColor(kleur, 30));
  ctx.fillStyle = kopGrad;
  ctx.beginPath(); ctx.ellipse(cx, cy - 23*s, 7*s, 6*s, 0, 0, Math.PI * 2); ctx.fill();

  // Oogjes met pupil en glans
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(cx - 3*s, cy - 24*s, 2.5*s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 3*s, cy - 24*s, 2.5*s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(cx - 3*s, cy - 24*s, 1.3*s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 3*s, cy - 24*s, 1.3*s, 0, Math.PI * 2); ctx.fill();
  // Oogglans
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(cx - 3.5*s, cy - 24.5*s, 0.7*s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 2.5*s, cy - 24.5*s, 0.7*s, 0, Math.PI * 2); ctx.fill();

  // Mondje
  ctx.strokeStyle = darkenColor(kleur, 40);
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 21*s, 2*s, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Naam
  if (naam) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold ' + (11*s) + 'px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText(naam, cx + 1, cy - 32*s + 1);
    ctx.fillStyle = 'white';
    ctx.fillText(naam, cx, cy - 32*s);
  }
}

// Hulpfunctie om kleuren donkerder te maken
function darkenColor(kleur, amount) {
  const hex = kleur.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

maakVijanden(1);

// === VISSENVOER EN VISSEN ===
let vissenvoer = [];
let vissen = [];
let voerOpzak = 0;

function maakVissenvoer(nr) {
  vissenvoer = [];
  const aantal = Math.min(2 + Math.floor(nr / 3), 6);
  for (let i = 0; i < aantal; i++) {
    vissenvoer.push({
      x: 80 + Math.random() * (canvas.width - 160),
      y: 40 + Math.random() * (canvas.height - 100),
      breedte: 16,
      hoogte: 16,
      gepakt: false
    });
  }
}

function maakVissen(nr) {
  vissen = [];
  const aantal = Math.min(1 + Math.floor(nr / 2), 5);
  const visKleuren = ['#ff69b4', '#ff85c8', '#ff52a0', '#ff7eb8', '#ff99cc'];
  const visNamen = ['Nemo', 'Dory', 'Blubber', 'Goldie', 'Splash'];
  for (let i = 0; i < aantal; i++) {
    vissen.push({
      x: 100 + Math.random() * (canvas.width - 200),
      y: 50 + Math.random() * (canvas.height - 120),
      breedte: 30,
      hoogte: 20,
      snelheidX: (1.5 + Math.random() * 2) * (Math.random() < 0.5 ? 1 : -1),
      snelheidY: (0.5 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1),
      kleur: visKleuren[i % visKleuren.length],
      naam: visNamen[i % visNamen.length],
      getemd: false
    });
  }
}

function tekenVis(vx, vy, kleur, naam, getemd) {
  const richting = getemd ? 1 : (Math.sin(golftijd * 3 + vx) > 0 ? 1 : -1);
  const wiggle = Math.sin(golftijd * 6 + vx * 0.1) * 2;

  // Schaduw
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(vx + 1, vy + 2, 15, 8, 0, 0, Math.PI * 2); ctx.fill();

  // Staartvin met beweging
  const staartWiggle = Math.sin(golftijd * 8 + vx) * 3;
  ctx.fillStyle = darkenColor(kleur, 20);
  ctx.beginPath();
  ctx.moveTo(vx - 12 * richting, vy);
  ctx.quadraticCurveTo(vx - 18 * richting, vy - 10 + staartWiggle, vx - 24 * richting, vy - 8 + staartWiggle);
  ctx.quadraticCurveTo(vx - 18 * richting, vy, vx - 24 * richting, vy + 8 + staartWiggle);
  ctx.quadraticCurveTo(vx - 18 * richting, vy + 10 + staartWiggle, vx - 12 * richting, vy);
  ctx.fill();

  // Lichaam met gradient
  const visGrad = ctx.createRadialGradient(vx + 2 * richting, vy - 2, 2, vx, vy, 15);
  visGrad.addColorStop(0, lightenColor(kleur, 40));
  visGrad.addColorStop(0.6, kleur);
  visGrad.addColorStop(1, darkenColor(kleur, 30));
  ctx.fillStyle = visGrad;
  ctx.beginPath();
  ctx.ellipse(vx, vy, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Buik (lichtere onderkant)
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(vx - 1 * richting, vy + 3, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rugvin
  ctx.fillStyle = darkenColor(kleur, 10);
  ctx.beginPath();
  ctx.moveTo(vx - 3 * richting, vy - 8);
  ctx.quadraticCurveTo(vx + 2 * richting, vy - 16 + wiggle, vx + 7 * richting, vy - 8);
  ctx.closePath();
  ctx.fill();

  // Schubben effect
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 0.5;
  for (let sx = -8; sx < 8; sx += 4) {
    for (let sy = -4; sy < 4; sy += 4) {
      ctx.beginPath();
      ctx.arc(vx + sx * richting, vy + sy, 2, 0, Math.PI);
      ctx.stroke();
    }
  }

  // Oogje met meer detail
  ctx.fillStyle = '#ffffee';
  ctx.beginPath(); ctx.arc(vx + 8 * richting, vy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(vx + 8.5 * richting, vy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(vx + 8 * richting, vy - 2.8, 0.8, 0, Math.PI * 2); ctx.fill();

  // Hartje als getemd
  if (getemd) {
    ctx.fillStyle = '#ff4757';
    ctx.font = '12px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText('❤', vx, vy - 16);
  }

  // Naam met schaduw
  if (naam) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 10px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText(naam, vx + 1, vy - (getemd ? 24 : 16) + 1);
    ctx.fillStyle = 'white';
    ctx.fillText(naam, vx, vy - (getemd ? 24 : 16));
  }
}

// Hulpfunctie om kleuren lichter te maken
function lightenColor(kleur, amount) {
  const hex = kleur.replace('#', '');
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

// Start level 1
maakLevel(1);

// === ZEE ACHTERGROND ===
let belletjes = [];
let zeewier = [];
let golftijd = 0;

// Maak bubbels en zeewier aan
for (let i = 0; i < 20; i++) {
  belletjes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    grootte: 2 + Math.random() * 6,
    snelheid: 0.3 + Math.random() * 0.7
  });
}
for (let i = 0; i < 12; i++) {
  zeewier.push({
    x: 30 + Math.random() * (canvas.width - 60),
    hoogte: 40 + Math.random() * 80
  });
}

function tekenZee() {
  // Diepzee water met realistische gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0096c7');
  gradient.addColorStop(0.15, '#0077b6');
  gradient.addColorStop(0.4, '#005f8a');
  gradient.addColorStop(0.7, '#023e58');
  gradient.addColorStop(1, '#012a3a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  golftijd += 0.02;

  // Caustic lichtpatronen (licht dat door het water breekt)
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#90e0ef';
  for (let i = 0; i < 8; i++) {
    const cx = 50 + i * 100 + Math.sin(golftijd * 0.7 + i * 1.3) * 30;
    const cy = 30 + Math.sin(golftijd * 0.5 + i * 0.8) * 20;
    const breedte = 40 + Math.sin(golftijd + i) * 15;
    ctx.beginPath();
    ctx.ellipse(cx, cy, breedte, breedte * 0.6, golftijd * 0.3 + i, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lichtstralen van boven - zachter en breder
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 6; i++) {
    const lx = 70 + i * 130 + Math.sin(golftijd * 0.3 + i) * 15;
    const spread = 30 + Math.sin(golftijd * 0.5 + i * 2) * 10;
    const grad = ctx.createLinearGradient(lx, 0, lx, canvas.height);
    grad.addColorStop(0, '#caf0f8');
    grad.addColorStop(1, 'rgba(144,224,239,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(lx - spread / 2, 0);
    ctx.lineTo(lx + spread * 2, canvas.height);
    ctx.lineTo(lx - spread * 2, canvas.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Zwevende deeltjes (plankton)
  ctx.fillStyle = 'rgba(200, 230, 255, 0.25)';
  for (let i = 0; i < 15; i++) {
    const px = (i * 137 + golftijd * 8) % 820 - 10;
    const py = (i * 89 + Math.sin(golftijd + i) * 30) % canvas.height;
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Zandbodem met gradient
  const zandGrad = ctx.createLinearGradient(0, canvas.height - 30, 0, canvas.height);
  zandGrad.addColorStop(0, '#a08050');
  zandGrad.addColorStop(0.3, '#c9a96e');
  zandGrad.addColorStop(1, '#d4b878');
  ctx.fillStyle = zandGrad;
  // Golvende zandbodem
  ctx.beginPath();
  ctx.moveTo(0, 588);
  for (let x = 0; x <= canvas.width; x += 20) {
    ctx.lineTo(x, canvas.height - 15 + Math.sin(x * 0.02 + golftijd * 0.5) * 3);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Zand details - kleine steentjes en schelpen
  for (let i = 0; i < 25; i++) {
    const sx = 15 + i * 32;
    const sy = canvas.height - 10 + (i % 3) * 3 + Math.sin(sx * 0.02 + golftijd * 0.5) * 2;
    ctx.fillStyle = i % 7 === 0 ? '#e8d8b8' : '#a08050';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 2 + (i % 3), 1.5, i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Zeewier op de bodem - realistischer
  for (const plant of zeewier) {
    const sway = Math.sin(golftijd + plant.x * 0.01) * 10;
    // Meerdere stengels per plant
    for (let j = -1; j <= 1; j++) {
      const offset = j * 5;
      const h = plant.hoogte * (1 - Math.abs(j) * 0.3);
      const sw = sway * (1 + j * 0.2);

      const stengelGrad = ctx.createLinearGradient(plant.x + offset, canvas.height - 15, plant.x + offset + sw, canvas.height - 15 - h);
      stengelGrad.addColorStop(0, '#1b4332');
      stengelGrad.addColorStop(1, '#40916c');
      ctx.strokeStyle = stengelGrad;
      ctx.lineWidth = 3 - Math.abs(j);
      ctx.beginPath();
      ctx.moveTo(plant.x + offset, canvas.height - 15);
      ctx.bezierCurveTo(
        plant.x + offset + sw * 0.3, canvas.height - 15 - h * 0.3,
        plant.x + offset + sw * 0.7, canvas.height - 15 - h * 0.6,
        plant.x + offset + sw, canvas.height - 15 - h
      );
      ctx.stroke();

      // Blaadjes langs de stengel
      ctx.fillStyle = '#52b788';
      for (let k = 0.3; k < 0.9; k += 0.25) {
        const bx = plant.x + offset + sw * k;
        const by = canvas.height - 15 - h * k;
        const bladSway = Math.sin(golftijd * 1.5 + k * 3 + plant.x) * 5;
        ctx.beginPath();
        ctx.ellipse(bx + bladSway + (j >= 0 ? 6 : -6), by, 7, 3, bladSway * 0.08 + j * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Belletjes - realistischer
  for (const bel of belletjes) {
    bel.y -= bel.snelheid;
    bel.x += Math.sin(golftijd * 1.5 + bel.y * 0.015) * 0.4;
    if (bel.y < -10) { bel.y = canvas.height + 10; bel.x = Math.random() * canvas.width; }

    const g = bel.grootte;
    // Bubbel rand
    ctx.beginPath();
    ctx.arc(bel.x, bel.y, g, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Bubbel vulling
    const belGrad = ctx.createRadialGradient(bel.x - g * 0.3, bel.y - g * 0.3, g * 0.1, bel.x, bel.y, g);
    belGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    belGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
    ctx.fillStyle = belGrad;
    ctx.fill();
    // Glans
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(bel.x - g * 0.25, bel.y - g * 0.25, g * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

// === TOETSEN ===
const toetsen = {
  omhoog: false,
  omlaag: false,
  links: false,
  rechts: false
};

// Luister naar toetsenbord
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') toetsen.omhoog = true;
  if (e.key === 'ArrowDown' || e.key === 's') toetsen.omlaag = true;
  if (e.key === 'ArrowLeft' || e.key === 'a') toetsen.links = true;
  if (e.key === 'ArrowRight' || e.key === 'd') toetsen.rechts = true;
  if (e.key === 'r' && gewonnen) { level = 1; maakLevel(1); gewonnen = false; }
  if (e.key === ' ' && startScherm) { startScherm = false; }
  if (e.key === ' ' && levelKlaar) { level++; maakLevel(level); }
});

// Luister naar muisklikken - klik op voer om vissen te lokken
let actieveVoerPlek = null; // waar het voer is neergezet

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const muisX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const muisY = (e.clientY - rect.top) * (canvas.height / rect.height);
  const klik = { x: muisX - 12, y: muisY - 12, breedte: 24, hoogte: 24 };

  // Klik op vissenvoer - het voer valt op de plek en vissen zwemmen ernaartoe
  for (const voer of vissenvoer) {
    if (!voer.gepakt && botst(klik, voer)) {
      voer.gepakt = true;
      actieveVoerPlek = { x: voer.x, y: voer.y, breedte: 20, hoogte: 20 };
      // Alle wilde vissen zwemmen naar het voer!
      for (const vis of vissen) {
        if (!vis.getemd) {
          vis.aangetrokken = true;
          vis.doelX = voer.x;
          vis.doelY = voer.y;
        }
      }
      return;
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') toetsen.omhoog = false;
  if (e.key === 'ArrowDown' || e.key === 's') toetsen.omlaag = false;
  if (e.key === 'ArrowLeft' || e.key === 'a') toetsen.links = false;
  if (e.key === 'ArrowRight' || e.key === 'd') toetsen.rechts = false;
});

// === UPDATE FUNCTIE ===
// Hier verandert alles in het spel
function update() {
  // Beweeg de speler
  if (toetsen.omhoog) speler.y -= speler.snelheid;
  if (toetsen.omlaag) speler.y += speler.snelheid;
  if (toetsen.links) speler.x -= speler.snelheid;
  if (toetsen.rechts) speler.x += speler.snelheid;

  // Houd speler binnen het scherm
  if (speler.x < 0) speler.x = 0;
  if (speler.x + speler.breedte > canvas.width) speler.x = canvas.width - speler.breedte;
  if (speler.y < 0) speler.y = 0;
  if (speler.y + speler.hoogte > canvas.height) speler.y = canvas.height - speler.hoogte;

  // Check botsing met muren - ga terug als je een muur raakt
  for (const muur of muren) {
    if (muur.zichtbaar !== false && botst(speler, muur)) {
      if (toetsen.omhoog) speler.y += speler.snelheid;
      if (toetsen.omlaag) speler.y -= speler.snelheid;
      if (toetsen.links) speler.x += speler.snelheid;
      if (toetsen.rechts) speler.x -= speler.snelheid;
    }
  }

  // Beweeg de andere schildpadden
  let aantalVriendjes = 0;
  for (let i = 0; i < vijanden.length; i++) {
    const vijand = vijanden[i];

    if (vijand.vriendje) {
      // Vriendje zwemt achter Schilpie aan in een rijtje
      aantalVriendjes++;
      const doelX = speler.x - aantalVriendjes * 35;
      const doelY = speler.y + Math.sin(golftijd * 2 + i) * 5;
      vijand.x += (doelX - vijand.x) * 0.08;
      vijand.y += (doelY - vijand.y) * 0.08;
    } else {
      // Zwem vrij rond
      vijand.x += vijand.snelheidX;
      vijand.y += vijand.snelheidY;
      if (vijand.x < 0 || vijand.x + vijand.breedte > canvas.width) vijand.snelheidX *= -1;
      if (vijand.y < 0 || vijand.y + vijand.hoogte > canvas.height) vijand.snelheidY *= -1;

      // Raak een schildpad aan om vriendjes te worden!
      if (!levelKlaar && !gewonnen && botst(speler, vijand)) {
        vijand.vriendje = true;
      }
    }
  }

  // Vriendjes helpen: ze duwen zeewier weg! Hoe meer vriendjes, hoe meer muren verdwijnen
  const aantalWeg = aantalVriendjes;
  for (let i = 0; i < muren.length; i++) {
    muren[i].zichtbaar = i >= aantalWeg * 2;
  }

  // Pak vissenvoer op
  for (const voer of vissenvoer) {
    if (!voer.gepakt && botst(speler, voer)) {
      voer.gepakt = true;
      voerOpzak++;
    }
  }

  // Beweeg de vissen
  let aantalGetemdeVissen = 0;
  for (let i = 0; i < vissen.length; i++) {
    const vis = vissen[i];
    if (vis.getemd) {
      // Getemde vis zwemt achter Schilpie aan (aan de rechterkant)
      aantalGetemdeVissen++;
      const doelX = speler.x + speler.breedte + aantalGetemdeVissen * 30;
      const doelY = speler.y + Math.sin(golftijd * 3 + i * 2) * 10;
      vis.x += (doelX - vis.x) * 0.1;
      vis.y += (doelY - vis.y) * 0.1;
    } else if (vis.aangetrokken && actieveVoerPlek) {
      // Vis zwemt naar het voer!
      const dx = vis.doelX - vis.x;
      const dy = vis.doelY - vis.y;
      const afstand = Math.sqrt(dx * dx + dy * dy);
      const visSnelheid = 2.5 + Math.random() * 0.5;
      vis.x += (dx / afstand) * visSnelheid;
      vis.y += (dy / afstand) * visSnelheid;

      // Vis bereikt het voer - eerste vis wint!
      if (afstand < 15) {
        vis.getemd = true;
        vis.aangetrokken = false;
        actieveVoerPlek = null;
        speler.snelheid = 5 + vissen.filter(v => v.getemd).length;
        // Andere vissen stoppen met zwemmen naar voer
        for (const andereVis of vissen) {
          if (!andereVis.getemd) andereVis.aangetrokken = false;
        }
      }
    } else {
      // Wilde vis zwemt snel rond
      vis.x += vis.snelheidX;
      vis.y += vis.snelheidY;
      if (vis.x < 0 || vis.x + vis.breedte > canvas.width) vis.snelheidX *= -1;
      if (vis.y < 0 || vis.y + vis.hoogte > canvas.height) vis.snelheidY *= -1;
    }
  }

  // Check of alles verzameld is
  const alleVriendjes = vijanden.every(v => v.vriendje);
  const alleVissen = vissen.every(v => v.getemd);
  const allesKlaar = alleVriendjes && alleVissen;

  // Check of Schilpie de finish haalt!
  if (!levelKlaar && allesKlaar && botst(speler, finish)) {
    if (level >= 10) {
      gewonnen = true;
    } else {
      levelKlaar = true;
    }
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Teken de zee achtergrond
  tekenZee();

  // Teken de finish
  const alleVriendjesKlaar = vijanden.every(v => v.vriendje);
  const alleVissenKlaar = vissen.every(v => v.getemd);
  const finishOpen = alleVriendjesKlaar && alleVissenKlaar;

  const fx = finish.x + finish.breedte / 2;
  const fy = finish.y + finish.hoogte / 2;

  if (finishOpen) {
    // Onderwaterlicht dat pulseert vanuit de schatkist
    const pulseGrootte = 55 + Math.sin(golftijd * 2) * 10;
    const glow = ctx.createRadialGradient(fx, fy, 5, fx, fy, pulseGrootte);
    glow.addColorStop(0, 'rgba(255, 230, 150, 0.4)');
    glow.addColorStop(0.5, 'rgba(255, 200, 50, 0.15)');
    glow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(fx, fy, pulseGrootte, 0, Math.PI * 2); ctx.fill();

    // Schatkist - onderkant (donker hout)
    const kistGrad = ctx.createLinearGradient(finish.x, fy, finish.x, finish.y + finish.hoogte);
    kistGrad.addColorStop(0, '#6b3a1f');
    kistGrad.addColorStop(0.5, '#8b5a30');
    kistGrad.addColorStop(1, '#5a2a10');
    ctx.fillStyle = kistGrad;
    ctx.beginPath();
    ctx.roundRect(finish.x + 2, fy - 2, finish.breedte - 4, finish.hoogte / 2 + 4, [0, 0, 4, 4]);
    ctx.fill();

    // Schatkist - deksel (open, naar achteren gekanteld)
    const dekselGrad = ctx.createLinearGradient(finish.x, finish.y - 10, finish.x, fy);
    dekselGrad.addColorStop(0, '#9b6a3a');
    dekselGrad.addColorStop(1, '#7b4a20');
    ctx.fillStyle = dekselGrad;
    ctx.beginPath();
    ctx.moveTo(finish.x + 4, fy - 2);
    ctx.lineTo(finish.x + 2, finish.y + 5);
    ctx.quadraticCurveTo(fx, finish.y - 8, finish.x + finish.breedte - 2, finish.y + 5);
    ctx.lineTo(finish.x + finish.breedte - 4, fy - 2);
    ctx.closePath();
    ctx.fill();

    // Hout textuur lijnen
    ctx.strokeStyle = 'rgba(40, 20, 5, 0.3)';
    ctx.lineWidth = 0.7;
    for (let ly = fy + 2; ly < finish.y + finish.hoogte - 2; ly += 5) {
      ctx.beginPath();
      ctx.moveTo(finish.x + 5, ly);
      ctx.lineTo(finish.x + finish.breedte - 5, ly);
      ctx.stroke();
    }

    // Metalen banden om de kist
    ctx.fillStyle = '#c5a028';
    ctx.fillRect(finish.x + 1, fy - 3, finish.breedte - 2, 3);
    ctx.fillRect(finish.x + 1, fy + 12, finish.breedte - 2, 3);
    // Metaal glans
    ctx.fillStyle = 'rgba(255,255,200,0.3)';
    ctx.fillRect(finish.x + 5, fy - 3, finish.breedte - 20, 1.5);
    ctx.fillRect(finish.x + 5, fy + 12, finish.breedte - 20, 1.5);

    // Goud en edelstenen in de kist
    // Gouden munten
    for (let i = 0; i < 6; i++) {
      const mx = finish.x + 10 + i * 8 + Math.sin(i * 2) * 3;
      const my = fy + 2 + Math.cos(i * 3) * 3;
      const muntGrad = ctx.createRadialGradient(mx - 1, my - 1, 0.5, mx, my, 4);
      muntGrad.addColorStop(0, '#ffe566');
      muntGrad.addColorStop(1, '#c8960c');
      ctx.fillStyle = muntGrad;
      ctx.beginPath(); ctx.ellipse(mx, my, 4, 3.5, 0.1 * i, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(150, 100, 0, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Edelstenen bovenop de munten
    // Blauwe saffier
    const safGrad = ctx.createRadialGradient(fx - 6, fy - 1, 1, fx - 6, fy, 5);
    safGrad.addColorStop(0, '#7df3ff');
    safGrad.addColorStop(0.5, '#00b4d8');
    safGrad.addColorStop(1, '#0077b6');
    ctx.fillStyle = safGrad;
    ctx.beginPath();
    ctx.moveTo(fx - 6, fy - 5); ctx.lineTo(fx - 2, fy); ctx.lineTo(fx - 6, fy + 4); ctx.lineTo(fx - 10, fy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(fx - 6, fy - 5); ctx.lineTo(fx - 4, fy - 1); ctx.lineTo(fx - 8, fy - 1);
    ctx.closePath(); ctx.fill();

    // Rode robijn
    const robGrad = ctx.createRadialGradient(fx + 6, fy - 2, 1, fx + 6, fy, 5);
    robGrad.addColorStop(0, '#ff6b7a');
    robGrad.addColorStop(0.5, '#dc143c');
    robGrad.addColorStop(1, '#8b0000');
    ctx.fillStyle = robGrad;
    ctx.beginPath();
    ctx.moveTo(fx + 6, fy - 6); ctx.lineTo(fx + 10, fy - 1); ctx.lineTo(fx + 6, fy + 3); ctx.lineTo(fx + 2, fy - 1);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(fx + 6, fy - 6); ctx.lineTo(fx + 8, fy - 2); ctx.lineTo(fx + 4, fy - 2);
    ctx.closePath(); ctx.fill();

    // Groene smaragd in het midden bovenaan
    const smaGrad = ctx.createRadialGradient(fx, fy - 4, 1, fx, fy - 2, 5);
    smaGrad.addColorStop(0, '#69ff94');
    smaGrad.addColorStop(0.5, '#00b341');
    smaGrad.addColorStop(1, '#005e20');
    ctx.fillStyle = smaGrad;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 8); ctx.lineTo(fx + 4, fy - 3); ctx.lineTo(fx, fy + 1); ctx.lineTo(fx - 4, fy - 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 8); ctx.lineTo(fx + 2, fy - 4); ctx.lineTo(fx - 2, fy - 4);
    ctx.closePath(); ctx.fill();

    // Gouden slot op de voorkant van de kist
    ctx.fillStyle = '#d4a017';
    ctx.beginPath(); ctx.roundRect(fx - 5, fy + 5, 10, 8, 2); ctx.fill();
    ctx.fillStyle = '#a07810';
    ctx.beginPath(); ctx.arc(fx, fy + 8, 1.5, 0, Math.PI * 2); ctx.fill();

    // Lichtdeeltjes die uit de kist zweven
    for (let i = 0; i < 8; i++) {
      const t = (golftijd * 30 + i * 20) % 80;
      const sparkX = fx - 20 + i * 6 + Math.sin(golftijd * 2 + i * 1.5) * 8;
      const sparkY = fy - t;
      const sparkAlpha = Math.max(0, 1 - t / 60) * 0.7;
      const sparkSize = 1.5 + Math.sin(golftijd * 4 + i) * 0.5;
      ctx.globalAlpha = sparkAlpha;
      const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, sparkSize * 2);
      sparkGrad.addColorStop(0, '#fffbe6');
      sparkGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = sparkGrad;
      ctx.beginPath(); ctx.arc(sparkX, sparkY, sparkSize * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

  } else {
    // Gesloten schatkist op de zeebodem

    // Schaduw onder de kist
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(fx, finish.y + finish.hoogte + 2, 32, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Kist body (donker hout, oud en begroeid)
    const kistDichtGrad = ctx.createLinearGradient(finish.x, finish.y, finish.x, finish.y + finish.hoogte);
    kistDichtGrad.addColorStop(0, '#5a3a20');
    kistDichtGrad.addColorStop(0.5, '#4a2a15');
    kistDichtGrad.addColorStop(1, '#3a1a0a');
    ctx.fillStyle = kistDichtGrad;
    ctx.beginPath();
    ctx.roundRect(finish.x + 2, finish.y + 8, finish.breedte - 4, finish.hoogte - 8, [0, 0, 4, 4]);
    ctx.fill();

    // Deksel (dicht, bovenop)
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath();
    ctx.moveTo(finish.x + 2, finish.y + 10);
    ctx.quadraticCurveTo(fx, finish.y - 2, finish.x + finish.breedte - 2, finish.y + 10);
    ctx.lineTo(finish.x + finish.breedte - 2, finish.y + 14);
    ctx.lineTo(finish.x + 2, finish.y + 14);
    ctx.closePath();
    ctx.fill();

    // Hout textuur
    ctx.strokeStyle = 'rgba(20, 10, 0, 0.25)';
    ctx.lineWidth = 0.5;
    for (let ly = finish.y + 16; ly < finish.y + finish.hoogte - 2; ly += 5) {
      ctx.beginPath(); ctx.moveTo(finish.x + 5, ly); ctx.lineTo(finish.x + finish.breedte - 5, ly); ctx.stroke();
    }

    // Roestige metalen banden
    ctx.fillStyle = '#7a6830';
    ctx.fillRect(finish.x + 1, finish.y + 10, finish.breedte - 2, 3);
    ctx.fillRect(finish.x + 1, finish.y + finish.hoogte - 10, finish.breedte - 2, 3);

    // Roestig slot
    ctx.fillStyle = '#6a5820';
    ctx.beginPath(); ctx.roundRect(fx - 6, fy + 2, 12, 10, 2); ctx.fill();
    ctx.strokeStyle = '#6a5820';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(fx, fy + 2, 6, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#4a3810';
    ctx.beginPath(); ctx.arc(fx, fy + 7, 2, 0, Math.PI * 2); ctx.fill();

    // Beetje zeewier/algen op de kist
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 2;
    const kistSway = Math.sin(golftijd + fx * 0.01) * 4;
    ctx.beginPath();
    ctx.moveTo(finish.x + 5, finish.y + 12);
    ctx.quadraticCurveTo(finish.x - 5 + kistSway, finish.y, finish.x - 8 + kistSway, finish.y - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(finish.x + finish.breedte - 5, finish.y + 14);
    ctx.quadraticCurveTo(finish.x + finish.breedte + 3 - kistSway, finish.y + 2, finish.x + finish.breedte + 6 - kistSway, finish.y - 6);
    ctx.stroke();

    // Tekst
    ctx.fillStyle = 'rgba(180,170,140,0.6)';
    ctx.font = '8px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText('Verzamel', fx, fy + 20);
    ctx.fillText('alles!', fx, fy + 30);
  }

  // Teken de muren als dik zeewier (alleen zichtbare)
  for (const muur of muren) {
    if (muur.zichtbaar === false) continue;
    const sway = Math.sin(golftijd + muur.x * 0.02) * 5;

    // Donkere achtergrond voor diepte
    ctx.fillStyle = 'rgba(10, 40, 20, 0.3)';
    ctx.fillRect(muur.x - 2, muur.y, muur.breedte + 4, muur.hoogte);

    for (let s = -6; s <= 6; s += 3) {
      const stengelGrad = ctx.createLinearGradient(muur.x + 10 + s, muur.y + muur.hoogte, muur.x + 10 + s, muur.y);
      stengelGrad.addColorStop(0, '#1b4332');
      stengelGrad.addColorStop(0.5, '#2d6a4f');
      stengelGrad.addColorStop(1, '#40916c');
      ctx.strokeStyle = stengelGrad;
      ctx.lineWidth = 3 + Math.sin(s) * 1;
      ctx.beginPath();
      const bx = muur.x + 10 + s;
      const swayS = sway * (1 + s * 0.05);
      ctx.moveTo(bx, muur.y + muur.hoogte);
      ctx.bezierCurveTo(
        bx + swayS * 0.3, muur.y + muur.hoogte * 0.7,
        bx + swayS * 0.7, muur.y + muur.hoogte * 0.3,
        bx + swayS, muur.y
      );
      ctx.stroke();

      // Blaadjes langs de stengel
      for (let py = muur.y + 15; py < muur.y + muur.hoogte; py += 20) {
        const bladsway = Math.sin(golftijd * 1.2 + py * 0.04 + s) * 5;
        const bladKleur = (py + s) % 40 < 20 ? '#52b788' : '#40916c';
        ctx.fillStyle = bladKleur;
        ctx.beginPath();
        ctx.ellipse(bx + bladsway + (s > 0 ? 7 : -7), py, 7, 3, bladsway * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Teken vissenvoer
  for (const voer of vissenvoer) {
    if (voer.gepakt) continue;
    // Zakje vissenvoer
    ctx.fillStyle = '#e8a838';
    ctx.fillRect(voer.x, voer.y, voer.breedte, voer.breedte);
    ctx.fillStyle = '#c47f17';
    ctx.fillRect(voer.x, voer.y, voer.breedte, 5);
    // Visje op het zakje
    ctx.fillStyle = '#fff';
    ctx.font = '10px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText('🐟', voer.x + voer.breedte / 2, voer.y + 14);
  }

  // Teken actief voer op de grond (waar vissen naartoe zwemmen)
  if (actieveVoerPlek) {
    // Gloeiend voer
    const voerGlow = ctx.createRadialGradient(actieveVoerPlek.x + 8, actieveVoerPlek.y + 8, 2, actieveVoerPlek.x + 8, actieveVoerPlek.y + 8, 25);
    voerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
    voerGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = voerGlow;
    ctx.beginPath(); ctx.arc(actieveVoerPlek.x + 8, actieveVoerPlek.y + 8, 25, 0, Math.PI * 2); ctx.fill();
    // Voerdeeltjes
    ctx.fillStyle = '#e8a838';
    for (let i = 0; i < 5; i++) {
      const vdx = actieveVoerPlek.x + 4 + Math.sin(golftijd * 3 + i * 1.3) * 8;
      const vdy = actieveVoerPlek.y + 4 + Math.cos(golftijd * 2 + i * 1.7) * 8;
      ctx.beginPath(); ctx.arc(vdx, vdy, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Teken de vissen
  for (const vis of vissen) {
    tekenVis(vis.x + vis.breedte / 2, vis.y + vis.hoogte / 2, vis.kleur, vis.naam, vis.getemd);
  }

  // Teken de andere schildpadden
  const namen = ['Snappy', 'Turbo', 'Shelly', 'Koopa', 'Bubbles', 'Flipper', 'Splash', 'Koraal'];
  for (let i = 0; i < vijanden.length; i++) {
    const v = vijanden[i];
    tekenSchildpad(v.x + v.breedte / 2, v.y + v.hoogte / 2, v.kleur, namen[i % namen.length], 0.8);
  }

  // Teken Schilpie (de speler)
  const cx = speler.x + speler.breedte / 2;
  const cy = speler.y + speler.hoogte / 2;
  tekenSchildpad(cx, cy, '#f5d442', 'Schilpie', 1.2);

  // Level nummer en vriendjes teller
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px Verdana';
  ctx.textAlign = 'left';
  ctx.fillText('Level ' + level + ' / 10', 10, 30);
  const aantalVriendjes = vijanden.filter(v => v.vriendje).length;
  ctx.fillText('Vriendjes: ' + aantalVriendjes + ' / ' + vijanden.length, 10, 55);
  ctx.fillText('Vissenvoer: ' + voerOpzak, 10, 80);
  const getemdeVissen = vissen.filter(v => v.getemd).length;
  ctx.fillText('Vissen getemd: ' + getemdeVissen + ' / ' + vissen.length, 10, 105);

  // Level klaar tekst
  if (levelKlaar) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 44px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText('Level ' + level + ' gehaald!', canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 20px Verdana';
    ctx.fillStyle = 'white';
    ctx.fillText('Druk op SPATIE voor level ' + (level + 1), canvas.width / 2, canvas.height / 2 + 40);
  }

  // ULTIMATE DISCO PARTY!
  if (gewonnen) {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Disco achtergrond - knallende kleuren
    const discoKleur1 = `hsl(${(golftijd * 60) % 360}, 100%, 10%)`;
    const discoKleur2 = `hsl(${(golftijd * 60 + 180) % 360}, 100%, 5%)`;
    const bgGrad = ctx.createRadialGradient(midX, midY, 50, midX, midY, 500);
    bgGrad.addColorStop(0, discoKleur1);
    bgGrad.addColorStop(1, discoKleur2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Discobal bovenin
    const balX = midX;
    const balY = 70;
    const balR = 35;
    // Touw
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(balX, 0); ctx.lineTo(balX, balY - balR); ctx.stroke();
    // Bal
    const balGrad = ctx.createRadialGradient(balX - 10, balY - 10, 5, balX, balY, balR);
    balGrad.addColorStop(0, '#eee');
    balGrad.addColorStop(0.5, '#bbb');
    balGrad.addColorStop(1, '#666');
    ctx.fillStyle = balGrad;
    ctx.beginPath(); ctx.arc(balX, balY, balR, 0, Math.PI * 2); ctx.fill();
    // Spiegeltjes op de bal
    for (let row = -2; row <= 2; row++) {
      for (let col = 0; col < 10; col++) {
        const hoek = (col / 10) * Math.PI * 2 + golftijd * 2;
        const ry = row * 12;
        const rx = Math.cos(hoek) * (balR - 5) * Math.cos(ry / balR);
        const rry = Math.sin(ry / balR) * balR * 0.7;
        if (Math.cos(hoek) > -0.3) {
          const spiegelKleur = `hsl(${(golftijd * 100 + col * 36 + row * 70) % 360}, 100%, 80%)`;
          ctx.fillStyle = spiegelKleur;
          ctx.fillRect(balX + rx - 3, balY + rry - 3, 6, 6);
        }
      }
    }

    // Lichtstralen vanuit de discobal
    for (let i = 0; i < 12; i++) {
      const straalHoek = golftijd * 1.5 + i * (Math.PI * 2 / 12);
      const straalLen = 300 + Math.sin(golftijd * 3 + i) * 100;
      const straalKleur = `hsl(${(golftijd * 80 + i * 30) % 360}, 100%, 60%)`;
      ctx.globalAlpha = 0.15 + Math.sin(golftijd * 4 + i * 2) * 0.1;
      ctx.strokeStyle = straalKleur;
      ctx.lineWidth = 3 + Math.sin(golftijd * 5 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(balX, balY);
      ctx.lineTo(balX + Math.cos(straalHoek) * straalLen, balY + Math.sin(straalHoek) * straalLen);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Disco vloer onderaan
    for (let rx = 0; rx < 16; rx++) {
      for (let ry = 0; ry < 3; ry++) {
        const tegel = `hsl(${(golftijd * 120 + rx * 25 + ry * 80 + Math.floor(golftijd * 4) * 45) % 360}, 90%, ${40 + Math.sin(golftijd * 6 + rx + ry) * 20}%)`;
        ctx.fillStyle = tegel;
        ctx.fillRect(rx * 50, 500 + ry * 35, 48, 33);
      }
    }

    // MEGA SCHILPIE - super grote dansende schildpad!
    const dansX = midX;
    const dansY = 320;
    const megaSchaal = 4;
    const dansWiggle = Math.sin(golftijd * 6) * 15;
    const dansKantel = Math.sin(golftijd * 4) * 0.15;
    const bounce = Math.abs(Math.sin(golftijd * 5)) * 20;

    ctx.save();
    ctx.translate(dansX, dansY - bounce);
    ctx.rotate(dansKantel);

    // Schaduw
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 70 * megaSchaal / 4 + bounce, 25 * megaSchaal, 8 * megaSchaal, 0, 0, Math.PI * 2); ctx.fill();

    // Dansende pootjes!
    const s = megaSchaal;
    const pootL = Math.sin(golftijd * 8) * 8;
    const pootR = Math.sin(golftijd * 8 + Math.PI) * 8;
    ctx.fillStyle = '#f5d442';
    // Linksvoor - zwaait omhoog bij dansen!
    ctx.beginPath(); ctx.ellipse(-14*s, -15*s + pootL * s * 0.3, 7*s, 4*s, -0.4 + Math.sin(golftijd * 8) * 0.5, 0, Math.PI * 2); ctx.fill();
    // Rechtsvoor
    ctx.beginPath(); ctx.ellipse(14*s, -15*s + pootR * s * 0.3, 7*s, 4*s, 0.4 + Math.sin(golftijd * 8 + Math.PI) * 0.5, 0, Math.PI * 2); ctx.fill();
    // Linksachter
    ctx.beginPath(); ctx.ellipse(-13*s, 15*s + pootR * s * 0.2, 6*s, 4*s, -0.3 + Math.sin(golftijd * 6) * 0.3, 0, Math.PI * 2); ctx.fill();
    // Rechtsachter
    ctx.beginPath(); ctx.ellipse(13*s, 15*s + pootL * s * 0.2, 6*s, 4*s, 0.3 + Math.sin(golftijd * 6 + Math.PI) * 0.3, 0, Math.PI * 2); ctx.fill();

    // Staartje wiebelt mee
    ctx.beginPath();
    ctx.moveTo(0, 17*s);
    ctx.quadraticCurveTo(5*s + dansWiggle * 0.5, 24*s, -1*s + dansWiggle * 0.3, 26*s);
    ctx.quadraticCurveTo(-4*s, 22*s, 0, 17*s);
    ctx.fill();

    // DISCO SCHILD - regenboog!
    const schildHue = (golftijd * 50) % 360;
    const discoSchild = ctx.createRadialGradient(-3*s, -4*s, 2*s, 0, 0, 18*s);
    discoSchild.addColorStop(0, `hsl(${schildHue}, 80%, 55%)`);
    discoSchild.addColorStop(0.5, `hsl(${(schildHue + 60) % 360}, 80%, 40%)`);
    discoSchild.addColorStop(1, `hsl(${(schildHue + 120) % 360}, 80%, 30%)`);
    ctx.fillStyle = discoSchild;
    ctx.beginPath(); ctx.ellipse(0, 0, 16*s, 18*s, 0, 0, Math.PI * 2); ctx.fill();

    // Schild rand
    ctx.strokeStyle = `hsl(${(schildHue + 180) % 360}, 100%, 60%)`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(0, 0, 16*s, 18*s, 0, 0, Math.PI * 2); ctx.stroke();

    // Schildpatroon
    ctx.strokeStyle = `hsla(${(schildHue + 90) % 360}, 100%, 70%, 0.5)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.ellipse(0, 0, 7*s, 8*s, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const h = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(h) * 7*s, Math.sin(h) * 8*s);
      ctx.lineTo(Math.cos(h) * 16*s, Math.sin(h) * 18*s);
      ctx.stroke();
    }

    // Glans
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.ellipse(-4*s, -5*s, 7*s, 5*s, -0.3, 0, Math.PI * 2); ctx.fill();

    // Kopje
    const kopWiggle = Math.sin(golftijd * 6) * 5;
    ctx.fillStyle = '#f5d442';
    ctx.beginPath(); ctx.ellipse(kopWiggle, -23*s, 7*s, 6*s, 0, 0, Math.PI * 2); ctx.fill();

    // Blije oogjes (dichte blije ogen)
    const oogBlij = Math.sin(golftijd * 3) > 0.5;
    if (oogBlij) {
      // Dichtgeknepen blije ogen
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(-3*s + kopWiggle, -24*s, 2.5*s, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(3*s + kopWiggle, -24*s, 2.5*s, Math.PI, 0); ctx.stroke();
    } else {
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-3*s + kopWiggle, -24*s, 2.5*s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3*s + kopWiggle, -24*s, 2.5*s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-3*s + kopWiggle, -24*s, 1.3*s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3*s + kopWiggle, -24*s, 1.3*s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(-3.5*s + kopWiggle, -24.5*s, 0.7*s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.5*s + kopWiggle, -24.5*s, 0.7*s, 0, Math.PI * 2); ctx.fill();
    }

    // Grote glimlach!
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(kopWiggle, -21*s, 3*s, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Zonnebril!
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    // Linker glas
    ctx.beginPath(); ctx.roundRect(-7*s + kopWiggle, -27*s, 5*s, 4*s, 1*s); ctx.fill();
    // Rechter glas
    ctx.beginPath(); ctx.roundRect(2*s + kopWiggle, -27*s, 5*s, 4*s, 1*s); ctx.fill();
    // Brug
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(-2*s + kopWiggle, -25*s); ctx.lineTo(2*s + kopWiggle, -25*s); ctx.stroke();
    // Pootjes van de bril
    ctx.beginPath(); ctx.moveTo(-7*s + kopWiggle, -25.5*s); ctx.lineTo(-9*s + kopWiggle, -24*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7*s + kopWiggle, -25.5*s); ctx.lineTo(9*s + kopWiggle, -24*s); ctx.stroke();
    // Glans op de glazen
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath(); ctx.moveTo(-6*s + kopWiggle, -26.5*s); ctx.lineTo(-4*s + kopWiggle, -26.5*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3*s + kopWiggle, -26.5*s); ctx.lineTo(5*s + kopWiggle, -26.5*s); ctx.stroke();

    ctx.restore();

    // Confetti!
    for (let i = 0; i < 50; i++) {
      const confX = (i * 73 + golftijd * 60) % 850 - 25;
      const confY = (i * 47 + golftijd * 40 + Math.sin(i) * 100) % 650 - 25;
      const confHue = (i * 37 + golftijd * 30) % 360;
      const confRot = golftijd * 5 + i;
      ctx.save();
      ctx.translate(confX, confY);
      ctx.rotate(confRot);
      ctx.fillStyle = `hsl(${confHue}, 100%, 65%)`;
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }

    // Nootjes / muzieknoten
    ctx.fillStyle = 'white';
    ctx.font = '30px Verdana';
    ctx.textAlign = 'center';
    for (let i = 0; i < 6; i++) {
      const nootX = 80 + i * 130 + Math.sin(golftijd * 2 + i) * 20;
      const nootY = 150 + Math.sin(golftijd * 3 + i * 1.5) * 40;
      ctx.globalAlpha = 0.6 + Math.sin(golftijd * 4 + i) * 0.3;
      ctx.fillText(['♪', '♫', '♬'][i % 3], nootX, nootY);
    }
    ctx.globalAlpha = 1;

    // Tekst
    ctx.fillStyle = '#000';
    ctx.font = 'bold 46px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText('SCHILPIE IS DE KAMPIOEN!', midX + 2, 172);
    // Regenboog tekst
    const tekst = 'SCHILPIE IS DE KAMPIOEN!';
    ctx.font = 'bold 46px Verdana';
    const tekstBreedte = ctx.measureText(tekst).width;
    let startX = midX - tekstBreedte / 2;
    for (let i = 0; i < tekst.length; i++) {
      const letterKleur = `hsl(${(golftijd * 60 + i * 15) % 360}, 100%, 65%)`;
      ctx.fillStyle = letterKleur;
      const letter = tekst[i];
      const letterY = 170 + Math.sin(golftijd * 5 + i * 0.5) * 5;
      ctx.fillText(letter, startX + ctx.measureText(letter).width / 2, letterY);
      startX += ctx.measureText(letter).width;
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px Verdana';
    ctx.fillText('Alle 10 levels gehaald!', midX, 490);
    ctx.font = 'bold 16px Verdana';
    ctx.globalAlpha = 0.5 + Math.sin(golftijd * 3) * 0.5;
    ctx.fillText('Druk op R om opnieuw te spelen', midX, 480 + 40);
    ctx.globalAlpha = 1;
  }
}

// === GAME LOOP ===
// Dit draait 60 keer per seconde
function tekenStartScherm() {
  tekenZee();

  const midX = canvas.width / 2;
  const midY = canvas.height / 2;

  // Donkere overlay
  ctx.fillStyle = 'rgba(0, 20, 40, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grote Schilpie in het midden
  const schilpieY = midY + 30;
  const floatY = Math.sin(golftijd * 2) * 10;
  tekenSchildpad(midX, schilpieY + floatY, '#f5d442', null, 3.5);

  // Bubbels rond Schilpie
  for (let i = 0; i < 8; i++) {
    const bx = midX + Math.cos(golftijd * 1.5 + i * 0.8) * (120 + i * 15);
    const by = schilpieY + Math.sin(golftijd * 1.5 + i * 0.8) * (80 + i * 10) + floatY;
    ctx.beginPath();
    ctx.arc(bx, by, 4 + Math.sin(golftijd + i) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Titel
  ctx.textAlign = 'center';

  // Schaduw
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font = 'bold 60px Verdana';
  ctx.fillText('Schilpie', midX + 3, midY - 120 + 3);

  // Regenboog titel
  const titel = 'Schilpie';
  ctx.font = 'bold 60px Verdana';
  const titelBreedte = ctx.measureText(titel).width;
  let tx = midX - titelBreedte / 2;
  for (let i = 0; i < titel.length; i++) {
    const hue = (golftijd * 40 + i * 35) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    const ly = midY - 120 + Math.sin(golftijd * 3 + i * 0.5) * 5;
    ctx.fillText(titel[i], tx + ctx.measureText(titel[i]).width / 2, ly);
    tx += ctx.measureText(titel[i]).width;
  }

  // Ondertitel
  ctx.fillStyle = '#90e0ef';
  ctx.font = 'bold 22px Verdana';
  ctx.fillText('Het onderwateravontuur', midX, midY - 75);

  // Instructies
  ctx.font = 'bold 18px Verdana';
  ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + Math.sin(golftijd * 3) * 0.5) + ')';
  ctx.fillText('Druk op SPATIE om te beginnen!', midX, midY + 160);

  // Tips
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px Verdana';
  ctx.fillText('Beweeg met pijltjestoetsen of WASD', midX, midY + 200);
  ctx.fillText('Verzamel vriendjes, pak vissenvoer en tem vissen!', midX, midY + 225);

  // Kleine visjes zwemmen rond
  for (let i = 0; i < 4; i++) {
    const vx = midX + Math.cos(golftijd + i * 1.6) * (250 + i * 30);
    const vy = midY + 40 + Math.sin(golftijd * 1.3 + i * 1.6) * 100;
    tekenVis(vx, vy, ['#ff69b4', '#ff85c8', '#ff52a0', '#ff7eb8'][i], null, false);
  }
}

function gameLoop() {
  if (startScherm) {
    tekenStartScherm();
  } else {
    update();
    teken();
  }
  requestAnimationFrame(gameLoop);
}

// Start het spel!
gameLoop();
