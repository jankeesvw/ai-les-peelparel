// === BRAWL STARS GAME ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// === KNOKKERS ===
const knokkers = [
  {
    naam: 'Blitz',
    kleur: '#ff4444', randje: '#cc0000',
    snelheid: 4, straal: 14,
    beschrijving: 'Snel & gevaarlijk',
    oogKleur: '#ffcc00', kogelKleur: '#ff6666', schade: 15,
  },
  {
    naam: 'Tank',
    kleur: '#4488ff', randje: '#2255cc',
    snelheid: 2, straal: 18,
    beschrijving: 'Groot & sterk',
    oogKleur: '#ffffff', kogelKleur: '#66aaff', schade: 25,
  },
  {
    naam: 'Ninja',
    kleur: '#aa44ff', randje: '#7722cc',
    snelheid: 5, straal: 12,
    beschrijving: 'Supersnel & klein',
    oogKleur: '#ff4444', kogelKleur: '#cc66ff', schade: 10,
  },
  {
    naam: 'Toxic',
    kleur: '#44dd44', randje: '#22aa22',
    snelheid: 3, straal: 15,
    beschrijving: 'Giftig & gemeen',
    oogKleur: '#ffff00', kogelKleur: '#66ff66', schade: 18,
  },
  {
    naam: 'Flame',
    kleur: '#ff8800', randje: '#cc5500',
    snelheid: 3, straal: 14,
    beschrijving: 'Heet & vurig',
    oogKleur: '#ff0000', kogelKleur: '#ffaa33', schade: 20,
  },
];

let gekozenKnokker = 0;
let scherm = 'menu'; // 'menu', 'game', 'levelup', 'gameover'
let winnaar = '';

// === LEVELS ===
let level = 1;
const levels = [
  { naam: 'Kippen',  dier: 'kip',    aantal: 4,  hpHerstel: 20, kleur: '#ffffff' },
  { naam: 'Varkens', dier: 'varken', aantal: 5,  hpHerstel: 25, kleur: '#ffaaaa' },
  { naam: 'Schapen', dier: 'schaap', aantal: 6,  hpHerstel: 20, kleur: '#f0f0f0' },
  { naam: 'Koeien',  dier: 'koe',    aantal: 7,  hpHerstel: 30, kleur: '#ffffff' },
  { naam: 'Eenden',  dier: 'eend',   aantal: 8,  hpHerstel: 15, kleur: '#ffdd44' },
  { naam: 'Kikkers', dier: 'kikker', aantal: 10, hpHerstel: 15, kleur: '#44cc44' },
];
let levelUpTimer = 0;

// === MAP ===
const tegelGrootte = 40;
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,1,0,0,2,2,0,3,3,0,2,2,0,0,1,0,0,1],
  [1,2,0,0,0,0,2,2,0,3,3,0,2,2,0,0,0,0,2,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,2,0,0,0,0,2,2,0,3,3,0,2,2,0,0,0,0,2,1],
  [1,0,0,1,0,0,2,2,0,3,3,0,2,2,0,0,1,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const tegelKleuren = { 0: '#e8d5a3', 1: '#8B7355', 2: '#2d5a1b', 3: '#3a8fd4' };

// === SPELER ===
let speler = {
  x: 80, y: 80, straal: 14, snelheid: 3,
  kleur: '#ff4444', randje: '#cc0000',
  oogKleur: '#ffcc00', kogelKleur: '#ff6666',
  hp: 100, maxHp: 100, schade: 15, laatsteSchot: 0,
};

// === VIJAND (AI) ===
let vijand = {
  x: 700, y: 520, straal: 14, snelheid: 2.5,
  kleur: '#4488ff', randje: '#2255cc',
  oogKleur: '#ffffff', kogelKleur: '#66aaff',
  hp: 100, maxHp: 100, schade: 15, laatsteSchot: 0,
  richting: { x: 0, y: 0 }, richtingTimer: 0,
};

// === KOGELS ===
let kogels = [];
const kogelSnelheid = 7;
function schietIntervalVoor(schutter) {
  if (schutter === speler) return Math.max(150, 400 - winkelItems[3].gekocht * 60);
  return 400;
}

// === MUIS ===
let muisX = 400;
let muisY = 300;

// === DIEREN ===
let dieren = [];
let veertjes = [];

function maakDier() {
  let x, y;
  do {
    x = Math.floor(Math.random() * 18 + 1) * tegelGrootte + tegelGrootte / 2;
    y = Math.floor(Math.random() * 13 + 1) * tegelGrootte + tegelGrootte / 2;
  } while (isMuur(x, y));

  return {
    x, y, straal: 8, snelheid: 0.5 + Math.random() * 0.6,
    richting: Math.random() * Math.PI * 2,
    richtingTimer: 0, wipTimer: Math.random() * 10,
  };
}

function spawnDieren() {
  dieren = [];
  const lv = levels[Math.min(level - 1, levels.length - 1)];
  for (let i = 0; i < lv.aantal; i++) {
    dieren.push(maakDier());
  }
}

// === MUNTEN & WINKEL ===
let munten = 0;
let muntAnimaties = []; // vliegende muntjes op scherm

const winkelItems = [
  { naam: 'Extra HP',      icoon: '+HP',  prijs: 30, beschrijving: '+30 max HP',          gekocht: 0, effect: () => { speler.maxHp += 30; speler.hp = speler.maxHp; } },
  { naam: 'Meer Schade',   icoon: 'DMG',  prijs: 40, beschrijving: '+5 schade per kogel', gekocht: 0, effect: () => { speler.schade += 5; } },
  { naam: 'Sneller',       icoon: 'SPD',  prijs: 35, beschrijving: '+1 snelheid',         gekocht: 0, effect: () => { speler.snelheid += 1; } },
  { naam: 'Snel Schieten', icoon: 'RPM',  prijs: 50, beschrijving: 'Sneller schieten',    gekocht: 0, effect: () => { /* handled in schietInterval */ } },
  { naam: 'Heal Boost',    icoon: 'HEAL', prijs: 25, beschrijving: 'Dieren geven +10 HP', gekocht: 0, effect: () => { /* handled in dier HP */ } },
];
let winkelGekozen = 0;

// === SCORE ===
let scoreSpeler = 0;
let scoreVijand = 0;

// === TOETSEN ===
const toetsen = {};

document.addEventListener('keydown', (e) => {
  toetsen[e.key] = true;
  if (scherm === 'menu') {
    if (e.key === 'ArrowLeft' || e.key === 'a') gekozenKnokker = (gekozenKnokker - 1 + knokkers.length) % knokkers.length;
    if (e.key === 'ArrowRight' || e.key === 'd') gekozenKnokker = (gekozenKnokker + 1) % knokkers.length;
    if (e.key === 'Enter' || e.key === ' ') startGame();
  } else if (scherm === 'gameover' && (e.key === 'Enter' || e.key === ' ')) {
    level = 1; scherm = 'menu';
  } else if (scherm === 'levelup' && (e.key === 'Enter' || e.key === ' ')) {
    scherm = 'winkel';
  } else if (scherm === 'winkel') {
    if (e.key === 'ArrowUp' || e.key === 'w') winkelGekozen = Math.max(0, winkelGekozen - 1);
    if (e.key === 'ArrowDown' || e.key === 's') winkelGekozen = Math.min(winkelItems.length, winkelGekozen + 1);
    if (e.key === 'Enter') {
      if (winkelGekozen === winkelItems.length) { startVolgendLevel(); }
      else { koopItem(winkelGekozen); }
    }
  }
});

document.addEventListener('keyup', (e) => { toetsen[e.key] = false; });

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  muisX = e.clientX - rect.left;
  muisY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (scherm === 'menu') {
    const startX = 400 - ((knokkers.length * 120) / 2) + 60;
    for (let i = 0; i < knokkers.length; i++) {
      const kx = startX + i * 120;
      const afstand = Math.sqrt((mx - kx) ** 2 + (my - 300) ** 2);
      if (afstand < 45) { gekozenKnokker = i; return; }
    }
    if (mx > 300 && mx < 500 && my > 460 && my < 520) startGame();
  } else if (scherm === 'game') {
    schietKogel(speler, mx, my);
  } else if (scherm === 'gameover') {
    level = 1; scherm = 'menu';
  } else if (scherm === 'levelup') {
    scherm = 'winkel';
  } else if (scherm === 'winkel') {
    // Klik op winkel items
    for (let i = 0; i < winkelItems.length; i++) {
      const iy = 180 + i * 70;
      if (mx > 150 && mx < 650 && my > iy - 25 && my < iy + 25) {
        winkelGekozen = i;
        koopItem(i);
        return;
      }
    }
    // Klik op doorgaan knop
    const knopY = 180 + winkelItems.length * 70;
    if (mx > 250 && mx < 550 && my > knopY - 20 && my < knopY + 30) {
      startVolgendLevel();
    }
  }
});

function schietKogel(schutter, doelX, doelY) {
  const nu = Date.now();
  if (nu - schutter.laatsteSchot < schietIntervalVoor(schutter)) return;
  schutter.laatsteSchot = nu;
  const dx = doelX - schutter.x;
  const dy = doelY - schutter.y;
  const afstand = Math.sqrt(dx * dx + dy * dy);
  if (afstand === 0) return;
  kogels.push({
    x: schutter.x, y: schutter.y,
    vx: (dx / afstand) * kogelSnelheid, vy: (dy / afstand) * kogelSnelheid,
    kleur: schutter.kogelKleur, vanSpeler: schutter === speler, schade: schutter.schade,
  });
}

function startGame() {
  level = 1;
  scoreSpeler = 0;
  scoreVijand = 0;
  munten = 0;
  muntAnimaties = [];
  for (const item of winkelItems) item.gekocht = 0;
  startLevel();
}

function koopItem(index) {
  const item = winkelItems[index];
  const prijs = item.prijs + item.gekocht * 15; // wordt duurder
  if (munten >= prijs) {
    munten -= prijs;
    item.gekocht++;
    item.effect();
  }
}

function startVolgendLevel() {
  level++;
  startLevel();
}

function startLevel() {
  const knokker = knokkers[gekozenKnokker];
  speler.kleur = knokker.kleur;
  speler.randje = knokker.randje;
  speler.snelheid = knokker.snelheid;
  speler.straal = knokker.straal;
  speler.oogKleur = knokker.oogKleur;
  speler.kogelKleur = knokker.kogelKleur;
  speler.schade = knokker.schade;
  speler.x = 80; speler.y = 80;
  speler.hp = 100; speler.maxHp = 100;
  speler.laatsteSchot = 0;

  // Vijand wordt sterker per level
  let vijandIndex;
  do { vijandIndex = Math.floor(Math.random() * knokkers.length); } while (vijandIndex === gekozenKnokker);
  const vk = knokkers[vijandIndex];
  vijand.kleur = vk.kleur;
  vijand.randje = vk.randje;
  vijand.snelheid = vk.snelheid * (0.5 + level * 0.1);
  vijand.straal = vk.straal;
  vijand.oogKleur = vk.oogKleur;
  vijand.kogelKleur = vk.kogelKleur;
  vijand.schade = Math.max(5, vk.schade * 0.5 + level * 2);
  vijand.x = 700; vijand.y = 520;
  vijand.hp = 50 + level * 15;
  vijand.maxHp = 50 + level * 15;
  vijand.laatsteSchot = 0;
  vijand.naam = vk.naam;

  kogels = [];
  veertjes = [];
  spawnDieren();
  scherm = 'game';
}

// === BOTSING MET MUREN ===
function isMuur(x, y) {
  const kolom = Math.floor(x / tegelGrootte);
  const rij = Math.floor(y / tegelGrootte);
  if (rij < 0 || rij >= map.length || kolom < 0 || kolom >= map[0].length) return true;
  const tegel = map[rij][kolom];
  return tegel === 1 || tegel === 3;
}

function isSolide(x, y) {
  const kolom = Math.floor(x / tegelGrootte);
  const rij = Math.floor(y / tegelGrootte);
  if (rij < 0 || rij >= map.length || kolom < 0 || kolom >= map[0].length) return true;
  return map[rij][kolom] === 1;
}

function kanBewegen(x, y, straal) {
  return !isMuur(x - straal, y - straal) && !isMuur(x + straal, y - straal) &&
         !isMuur(x - straal, y + straal) && !isMuur(x + straal, y + straal);
}

// === VIJAND AI ===
function updateVijand() {
  vijand.richtingTimer--;
  if (vijand.richtingTimer <= 0) {
    const dx = speler.x - vijand.x;
    const dy = speler.y - vijand.y;
    const afstand = Math.sqrt(dx * dx + dy * dy);
    if (afstand > 0) {
      const r = (Math.random() - 0.5) * 2;
      vijand.richting.x = (dx / afstand) + r * 0.5;
      vijand.richting.y = (dy / afstand) + r * 0.5;
      const len = Math.sqrt(vijand.richting.x ** 2 + vijand.richting.y ** 2);
      vijand.richting.x /= len; vijand.richting.y /= len;
    }
    vijand.richtingTimer = 30 + Math.random() * 60;
  }

  const nx = vijand.x + vijand.richting.x * vijand.snelheid;
  const ny = vijand.y + vijand.richting.y * vijand.snelheid;
  if (kanBewegen(nx, vijand.y, vijand.straal)) vijand.x = nx; else vijand.richtingTimer = 0;
  if (kanBewegen(vijand.x, ny, vijand.straal)) vijand.y = ny; else vijand.richtingTimer = 0;

  const dx = speler.x - vijand.x;
  const dy = speler.y - vijand.y;
  const afstand = Math.sqrt(dx * dx + dy * dy);
  if (afstand < 300) {
    schietKogel(vijand, speler.x + (Math.random() - 0.5) * 30, speler.y + (Math.random() - 0.5) * 30);
  }
}

// === UPDATE ===
function huidigLevel() {
  return levels[Math.min(level - 1, levels.length - 1)];
}

function update() {
  if (scherm !== 'game') return;

  let nieuweX = speler.x;
  let nieuweY = speler.y;
  if (toetsen['ArrowUp'] || toetsen['w']) nieuweY -= speler.snelheid;
  if (toetsen['ArrowDown'] || toetsen['s']) nieuweY += speler.snelheid;
  if (toetsen['ArrowLeft'] || toetsen['a']) nieuweX -= speler.snelheid;
  if (toetsen['ArrowRight'] || toetsen['d']) nieuweX += speler.snelheid;
  if (kanBewegen(nieuweX, speler.y, speler.straal)) speler.x = nieuweX;
  if (kanBewegen(speler.x, nieuweY, speler.straal)) speler.y = nieuweY;

  // Auto-schieten met spatiebalk richting vijand
  if (toetsen[' ']) {
    schietKogel(speler, vijand.x, vijand.y);
  }

  updateVijand();

  // Dieren updaten
  for (const dier of dieren) {
    dier.richtingTimer--;
    dier.wipTimer += 0.15;
    if (dier.richtingTimer <= 0) {
      dier.richting = Math.random() * Math.PI * 2;
      dier.richtingTimer = 40 + Math.random() * 80;
    }
    const nx = dier.x + Math.cos(dier.richting) * dier.snelheid;
    const ny = dier.y + Math.sin(dier.richting) * dier.snelheid;
    if (kanBewegen(nx, dier.y, dier.straal)) dier.x = nx; else dier.richtingTimer = 0;
    if (kanBewegen(dier.x, ny, dier.straal)) dier.y = ny; else dier.richtingTimer = 0;
  }

  // Munt animaties updaten
  for (let i = muntAnimaties.length - 1; i >= 0; i--) {
    muntAnimaties[i].y -= 1;
    muntAnimaties[i].leven--;
    if (muntAnimaties[i].leven <= 0) muntAnimaties.splice(i, 1);
  }

  // Veertjes updaten
  for (let i = veertjes.length - 1; i >= 0; i--) {
    const v = veertjes[i];
    v.x += v.vx; v.y += v.vy; v.vy += 0.1; v.leven--;
    if (v.leven <= 0) veertjes.splice(i, 1);
  }

  const lv = huidigLevel();

  // Kogels updaten
  for (let i = kogels.length - 1; i >= 0; i--) {
    const k = kogels[i];
    k.x += k.vx; k.y += k.vy;

    if (isSolide(k.x, k.y)) { kogels.splice(i, 1); continue; }
    if (k.x < 0 || k.x > 800 || k.y < 0 || k.y > 600) { kogels.splice(i, 1); continue; }

    if (k.vanSpeler) {
      const dx = k.x - vijand.x, dy = k.y - vijand.y;
      if (Math.sqrt(dx * dx + dy * dy) < vijand.straal + 4) {
        vijand.hp -= k.schade; kogels.splice(i, 1);
        if (vijand.hp <= 0) {
          scoreSpeler++;
          const bonus = 25 + level * 10;
          munten += bonus;
          muntAnimaties.push({ x: vijand.x, y: vijand.y - 30, tekst: '+' + bonus, leven: 60 });
          winnaar = 'speler'; scherm = 'levelup'; levelUpTimer = Date.now();
        }
        continue;
      }
    }

    if (!k.vanSpeler) {
      const dx = k.x - speler.x, dy = k.y - speler.y;
      if (Math.sqrt(dx * dx + dy * dy) < speler.straal + 4) {
        speler.hp -= k.schade; kogels.splice(i, 1);
        if (speler.hp <= 0) { scoreVijand++; winnaar = 'vijand'; scherm = 'gameover'; }
        continue;
      }
    }

    // Kogel raakt dier
    for (let j = dieren.length - 1; j >= 0; j--) {
      const dier = dieren[j];
      const dx = k.x - dier.x, dy = k.y - dier.y;
      if (Math.sqrt(dx * dx + dy * dy) < dier.straal + 4) {
        for (let v = 0; v < 6; v++) {
          veertjes.push({
            x: dier.x, y: dier.y,
            vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1,
            kleur: Math.random() > 0.5 ? lv.kleur : '#f5deb3',
            leven: 30 + Math.random() * 20,
          });
        }
        if (k.vanSpeler) {
          const healBonus = winkelItems[4].gekocht * 10;
          speler.hp = Math.min(speler.maxHp, speler.hp + lv.hpHerstel + healBonus);
          munten += 10;
          muntAnimaties.push({ x: dier.x, y: dier.y - 20, tekst: '+10', leven: 40 });
        } else {
          vijand.hp = Math.min(vijand.maxHp, vijand.hp + lv.hpHerstel);
        }

        dieren.splice(j, 1);
        kogels.splice(i, 1);
        setTimeout(() => { if (scherm === 'game') dieren.push(maakDier()); }, 3000);
        break;
      }
    }
  }
}

// === TEKEN FUNCTIES ===
function tekenKnokkerFiguur(x, y, knokker, schaal) {
  const s = knokker.straal * schaal;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x, y + s - 2, s, 6 * schaal, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = knokker.kleur;
  ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = knokker.randje; ctx.lineWidth = 3 * schaal; ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - 5 * schaal, y - 3 * schaal, 5 * schaal, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5 * schaal, y - 3 * schaal, 5 * schaal, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = knokker.oogKleur || 'black';
  ctx.beginPath(); ctx.arc(x - 4 * schaal, y - 3 * schaal, 2.5 * schaal, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 6 * schaal, y - 3 * schaal, 2.5 * schaal, 0, Math.PI * 2); ctx.fill();
}

function tekenHPBalk(x, y, hp, maxHp, breedte) {
  const balkY = y - 25;
  ctx.fillStyle = '#333'; ctx.fillRect(x - breedte / 2, balkY, breedte, 6);
  const pct = Math.max(0, hp / maxHp);
  ctx.fillStyle = pct < 0.3 ? '#ff4444' : pct < 0.6 ? '#ffaa00' : '#44dd44';
  ctx.fillRect(x - breedte / 2, balkY, breedte * pct, 6);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(x - breedte / 2, balkY, breedte, 6);
}

// === DIER TEKENEN PER TYPE ===
function tekenKip(x, y, wip) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y + wip, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#dddddd'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#f0e8d0';
  ctx.beginPath(); ctx.ellipse(x - 7, y + 1 + wip, 4, 6, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 7, y + 1 + wip, 4, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y - 8 + wip, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff3333';
  ctx.beginPath(); ctx.arc(x - 2, y - 14 + wip, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2, y - 14 + wip, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 3, y - 8 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 8 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath(); ctx.moveTo(x, y - 7 + wip); ctx.lineTo(x - 3, y - 5 + wip); ctx.lineTo(x + 3, y - 5 + wip); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2;
  const pw = Math.sin(wip * 3) * 2;
  ctx.beginPath(); ctx.moveTo(x - 3, y + 9 + wip); ctx.lineTo(x - 4 + pw, y + 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 3, y + 9 + wip); ctx.lineTo(x + 4 - pw, y + 14); ctx.stroke();
}

function tekenVarken(x, y, wip) {
  // Lichaam (roze)
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath(); ctx.ellipse(x, y + 2 + wip, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#dd8888'; ctx.lineWidth = 1; ctx.stroke();
  // Kopje
  ctx.fillStyle = '#ffbbbb';
  ctx.beginPath(); ctx.arc(x, y - 7 + wip, 7, 0, Math.PI * 2); ctx.fill();
  // Oortjes
  ctx.fillStyle = '#ff9999';
  ctx.beginPath(); ctx.ellipse(x - 5, y - 13 + wip, 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y - 13 + wip, 3, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  // Snuit
  ctx.fillStyle = '#ff8888';
  ctx.beginPath(); ctx.ellipse(x, y - 5 + wip, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#cc6666';
  ctx.beginPath(); ctx.arc(x - 2, y - 5 + wip, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2, y - 5 + wip, 1, 0, Math.PI * 2); ctx.fill();
  // Oogjes
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 3, y - 9 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 9 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  // Pootjes
  ctx.fillStyle = '#ff9999';
  const pw = Math.sin(wip * 3) * 1.5;
  ctx.fillRect(x - 7 + pw, y + 9 + wip, 4, 5);
  ctx.fillRect(x + 3 - pw, y + 9 + wip, 4, 5);
  // Staartje (krulletje)
  ctx.strokeStyle = '#ff8888'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 10, y + 2 + wip, 4, 0, Math.PI * 1.5); ctx.stroke();
}

function tekenSchaap(x, y, wip) {
  // Wollig lichaam
  ctx.fillStyle = '#f0ece0';
  for (let i = 0; i < 6; i++) {
    const bx = x - 6 + (i % 3) * 6;
    const by = y - 2 + Math.floor(i / 3) * 7 + wip;
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
  }
  // Kopje (donkerder)
  ctx.fillStyle = '#555555';
  ctx.beginPath(); ctx.arc(x, y - 10 + wip, 5, 0, Math.PI * 2); ctx.fill();
  // Oortjes
  ctx.fillStyle = '#444';
  ctx.beginPath(); ctx.ellipse(x - 5, y - 12 + wip, 2, 4, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y - 12 + wip, 2, 4, 0.5, 0, Math.PI * 2); ctx.fill();
  // Oogjes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x - 2, y - 10 + wip, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2, y - 10 + wip, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 2, y - 10 + wip, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2, y - 10 + wip, 1, 0, Math.PI * 2); ctx.fill();
  // Pootjes
  ctx.fillStyle = '#555';
  const pw = Math.sin(wip * 3) * 1.5;
  ctx.fillRect(x - 6 + pw, y + 8 + wip, 3, 6);
  ctx.fillRect(x + 3 - pw, y + 8 + wip, 3, 6);
}

function tekenKoe(x, y, wip) {
  // Lichaam (wit met vlekken)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y + 2 + wip, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 1; ctx.stroke();
  // Vlekken
  ctx.fillStyle = '#333333';
  ctx.beginPath(); ctx.ellipse(x - 4, y + wip, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y + 4 + wip, 3, 4, -0.2, 0, Math.PI * 2); ctx.fill();
  // Kopje
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y - 9 + wip, 7, 0, Math.PI * 2); ctx.fill();
  // Hoorns
  ctx.strokeStyle = '#ccaa55'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 5, y - 15 + wip); ctx.lineTo(x - 7, y - 20 + wip); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 5, y - 15 + wip); ctx.lineTo(x + 7, y - 20 + wip); ctx.stroke();
  // Snuit
  ctx.fillStyle = '#ffccaa';
  ctx.beginPath(); ctx.ellipse(x, y - 5 + wip, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Neusgaten
  ctx.fillStyle = '#cc9988';
  ctx.beginPath(); ctx.arc(x - 2, y - 5 + wip, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2, y - 5 + wip, 1, 0, Math.PI * 2); ctx.fill();
  // Oogjes
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 3, y - 11 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 11 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  // Pootjes
  ctx.fillStyle = '#555';
  const pw = Math.sin(wip * 3) * 1.5;
  ctx.fillRect(x - 8 + pw, y + 10 + wip, 3, 6);
  ctx.fillRect(x + 5 - pw, y + 10 + wip, 3, 6);
}

function tekenEend(x, y, wip) {
  // Lichaam (geel)
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath(); ctx.ellipse(x, y + 2 + wip, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ddbb22'; ctx.lineWidth = 1; ctx.stroke();
  // Vleugeltjes
  ctx.fillStyle = '#eebb33';
  ctx.beginPath(); ctx.ellipse(x - 7, y + 2 + wip, 3, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 7, y + 2 + wip, 3, 5, 0.3, 0, Math.PI * 2); ctx.fill();
  // Kopje
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath(); ctx.arc(x, y - 8 + wip, 6, 0, Math.PI * 2); ctx.fill();
  // Snaveltje (plat, oranje)
  ctx.fillStyle = '#ff8800';
  ctx.beginPath(); ctx.ellipse(x, y - 5 + wip, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
  // Oogjes
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 3, y - 9 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 9 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  // Pootjes (oranje zwemvoeten)
  ctx.fillStyle = '#ff8800';
  const pw = Math.sin(wip * 3) * 2;
  ctx.beginPath(); ctx.moveTo(x - 3 + pw, y + 10 + wip); ctx.lineTo(x - 7, y + 15); ctx.lineTo(x + 1, y + 15); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 3 - pw, y + 10 + wip); ctx.lineTo(x - 1, y + 15); ctx.lineTo(x + 7, y + 15); ctx.closePath(); ctx.fill();
}

function tekenKikker(x, y, wip) {
  // Lichaam (groen)
  ctx.fillStyle = '#44bb44';
  ctx.beginPath(); ctx.ellipse(x, y + 2 + wip, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#339933'; ctx.lineWidth = 1; ctx.stroke();
  // Kopje (plat en breed)
  ctx.fillStyle = '#55cc55';
  ctx.beginPath(); ctx.ellipse(x, y - 6 + wip, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Grote ogen (bollen uit)
  ctx.fillStyle = '#88ee88';
  ctx.beginPath(); ctx.arc(x - 5, y - 10 + wip, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 10 + wip, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x - 5, y - 10 + wip, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 10 + wip, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x - 5, y - 10 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 10 + wip, 1.5, 0, Math.PI * 2); ctx.fill();
  // Mondje (brede glimlach)
  ctx.strokeStyle = '#228822'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y - 4 + wip, 4, 0.1, Math.PI - 0.1); ctx.stroke();
  // Achterpootjes (groot)
  ctx.fillStyle = '#44bb44';
  const pw = Math.sin(wip * 3) * 3;
  ctx.beginPath(); ctx.ellipse(x - 9 + pw, y + 7 + wip, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 9 - pw, y + 7 + wip, 5, 3, 0.5, 0, Math.PI * 2); ctx.fill();
}

function tekenDieren() {
  const lv = huidigLevel();
  for (const dier of dieren) {
    const wip = Math.sin(dier.wipTimer) * 2;

    // Schaduw
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(dier.x, dier.y + 12, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Teken het juiste dier
    if (lv.dier === 'kip') tekenKip(dier.x, dier.y, wip);
    else if (lv.dier === 'varken') tekenVarken(dier.x, dier.y, wip);
    else if (lv.dier === 'schaap') tekenSchaap(dier.x, dier.y, wip);
    else if (lv.dier === 'koe') tekenKoe(dier.x, dier.y, wip);
    else if (lv.dier === 'eend') tekenEend(dier.x, dier.y, wip);
    else if (lv.dier === 'kikker') tekenKikker(dier.x, dier.y, wip);

    // HP + munten tekst
    const healBonus = winkelItems[4].gekocht * 10;
    ctx.fillStyle = '#ff6688';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('+' + (lv.hpHerstel + healBonus) + ' HP  +10', dier.x, dier.y - 20 + wip);
  }
}

function tekenVeertjes() {
  for (const v of veertjes) {
    ctx.globalAlpha = v.leven / 50;
    ctx.fillStyle = v.kleur;
    ctx.beginPath(); ctx.ellipse(v.x, v.y, 2, 5, v.vx, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function tekenMenu() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 137 + 50) % canvas.width;
    const sy = (i * 97 + 30) % canvas.height;
    const flicker = 0.5 + 0.5 * Math.sin(Date.now() / 500 + i);
    ctx.globalAlpha = flicker * 0.6;
    ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
  ctx.strokeStyle = '#cc8800'; ctx.lineWidth = 4;
  ctx.strokeText('KIES JE KNOKKER!', 400, 80);
  ctx.fillText('KIES JE KNOKKER!', 400, 80);

  const startX = 400 - ((knokkers.length * 120) / 2) + 60;
  for (let i = 0; i < knokkers.length; i++) {
    const k = knokkers[i];
    const kx = startX + i * 120;
    const ky = 300;
    const g = i === gekozenKnokker;
    if (g) {
      ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(kx, ky, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#ffcc0066'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(kx, ky, 52, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = g ? '#2a2a4e' : '#16162e';
    ctx.beginPath(); ctx.arc(kx, ky, 44, 0, Math.PI * 2); ctx.fill();
    tekenKnokkerFiguur(kx, ky, k, g ? 2.5 : 1.8);
    ctx.fillStyle = g ? '#ffcc00' : '#888'; ctx.font = g ? 'bold 16px Arial' : '14px Arial';
    ctx.textAlign = 'center'; ctx.fillText(k.naam, kx, ky + 65);
  }

  const gekozen = knokkers[gekozenKnokker];
  ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.fillText(gekozen.naam, 400, 160);
  ctx.fillStyle = '#aaa'; ctx.font = '18px Arial'; ctx.fillText(gekozen.beschrijving, 400, 190);

  ctx.font = '16px Arial'; ctx.textAlign = 'left';
  ctx.fillStyle = '#888'; ctx.fillText('Snelheid:', 250, 220);
  ctx.fillStyle = '#333'; ctx.fillRect(340, 208, 100, 14);
  ctx.fillStyle = '#44dd44'; ctx.fillRect(340, 208, (gekozen.snelheid / 5) * 100, 14);
  ctx.fillStyle = '#888'; ctx.fillText('Schade:', 250, 242);
  ctx.fillStyle = '#333'; ctx.fillRect(340, 230, 100, 14);
  ctx.fillStyle = '#ff4444'; ctx.fillRect(340, 230, (gekozen.schade / 25) * 100, 14);
  ctx.fillStyle = '#888'; ctx.fillText('Grootte:', 250, 264);
  ctx.fillStyle = '#333'; ctx.fillRect(340, 252, 100, 14);
  ctx.fillStyle = '#4488ff'; ctx.fillRect(340, 252, (gekozen.straal / 18) * 100, 14);
  ctx.textAlign = 'center';

  const p = 1 + Math.sin(Date.now() / 300) * 0.03;
  ctx.save(); ctx.translate(400, 490); ctx.scale(p, p);
  ctx.fillStyle = '#44cc44';
  ctx.beginPath(); ctx.roundRect(-100, -30, 200, 60, 15); ctx.fill();
  ctx.strokeStyle = '#22aa22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-100, -30, 200, 60, 15); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Arial'; ctx.fillText('VECHT!', 0, 10);
  ctx.restore();

  ctx.fillStyle = '#666'; ctx.font = '14px Arial';
  ctx.fillText('Pijltjes/WASD = bewegen | Klik = schieten', 400, 560);
}

function tekenMap() {
  for (let rij = 0; rij < map.length; rij++) {
    for (let kolom = 0; kolom < map[rij].length; kolom++) {
      const tegel = map[rij][kolom];
      const x = kolom * tegelGrootte, y = rij * tegelGrootte;
      ctx.fillStyle = tegelKleuren[0]; ctx.fillRect(x, y, tegelGrootte, tegelGrootte);
      if (tegel === 1) {
        ctx.fillStyle = tegelKleuren[1]; ctx.fillRect(x, y, tegelGrootte, tegelGrootte);
        ctx.fillStyle = '#a08860'; ctx.fillRect(x + 2, y + 2, tegelGrootte - 4, tegelGrootte - 4);
        ctx.fillStyle = '#6b5b3a'; ctx.fillRect(x + 4, y + 4, tegelGrootte - 6, tegelGrootte - 6);
      } else if (tegel === 2) {
        ctx.fillStyle = '#3a7a22'; ctx.fillRect(x, y, tegelGrootte, tegelGrootte);
        ctx.fillStyle = '#2d5a1b';
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + 5 + i * 7, y + 5 + (i * 13) % 25, 6, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#4a9a32';
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 10 + i * 8, y + 12 + (i * 11) % 20, 5, 0, Math.PI * 2); ctx.fill(); }
      } else if (tegel === 3) {
        ctx.fillStyle = tegelKleuren[3]; ctx.fillRect(x, y, tegelGrootte, tegelGrootte);
        ctx.fillStyle = '#5ab0ee'; const t = Date.now() / 500;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 5 + i * 12, y + 15 + Math.sin(t + i) * 4, 4, 0, Math.PI); ctx.fill(); }
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.strokeRect(x, y, tegelGrootte, tegelGrootte);
    }
  }
}

function tekenKogels() {
  for (const k of kogels) {
    ctx.shadowColor = k.kleur; ctx.shadowBlur = 8;
    ctx.fillStyle = k.kleur; ctx.beginPath(); ctx.arc(k.x, k.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(k.x, k.y, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function tekenRichting() {
  const dx = muisX - speler.x, dy = muisY - speler.y;
  const a = Math.sqrt(dx * dx + dy * dy);
  if (a > 0) {
    const l = Math.min(a, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(speler.x, speler.y);
    ctx.lineTo(speler.x + (dx / a) * l, speler.y + (dy / a) * l); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function tekenMuntAnimaties() {
  for (const m of muntAnimaties) {
    ctx.globalAlpha = m.leven / 40;
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(m.tekst, m.x, m.y);
  }
  ctx.globalAlpha = 1;
}

function tekenLevelInfo() {
  const lv = huidigLevel();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, 200, 30);
  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'left';
  ctx.fillText('Level ' + level + ' - ' + lv.naam, 10, 20);

  // Munten rechtsboven
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(680, 0, 120, 30);
  ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'right';
  ctx.fillText(munten + ' munten', 790, 20);
}

function tekenLevelUp() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 56px Arial';
  ctx.strokeStyle = '#cc8800'; ctx.lineWidth = 4;
  ctx.strokeText('LEVEL ' + level + ' KLAAR!', 400, 200);
  ctx.fillText('LEVEL ' + level + ' KLAAR!', 400, 200);

  ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 24px Arial';
  ctx.fillText(munten + ' munten', 400, 270);

  ctx.fillStyle = '#aaa'; ctx.font = '18px Arial';
  ctx.fillText('Versla dieren voor munten - koop upgrades in de winkel!', 400, 320);

  const p = 1 + Math.sin(Date.now() / 300) * 0.03;
  ctx.save(); ctx.translate(400, 400); ctx.scale(p, p);
  ctx.fillStyle = '#44cc44';
  ctx.beginPath(); ctx.roundRect(-120, -25, 240, 50, 12); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial';
  ctx.fillText('NAAR DE WINKEL!', 0, 8);
  ctx.restore();
}

function tekenWinkel() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Titel
  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center';
  ctx.strokeStyle = '#cc8800'; ctx.lineWidth = 3;
  ctx.strokeText('WINKEL', 400, 55);
  ctx.fillText('WINKEL', 400, 55);

  // Munten
  ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 22px Arial';
  ctx.fillText(munten + ' munten', 400, 95);

  // Items
  for (let i = 0; i < winkelItems.length; i++) {
    const item = winkelItems[i];
    const y = 180 + i * 70;
    const gekozen = i === winkelGekozen;
    const prijs = item.prijs + item.gekocht * 15;
    const kanKopen = munten >= prijs;

    // Achtergrond
    ctx.fillStyle = gekozen ? '#2a2a5e' : '#1e1e3e';
    ctx.beginPath(); ctx.roundRect(150, y - 28, 500, 56, 10); ctx.fill();

    if (gekozen) {
      ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(150, y - 28, 500, 56, 10); ctx.stroke();
    }

    // Icoon
    ctx.fillStyle = kanKopen ? '#ffcc00' : '#555';
    ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
    ctx.fillText(item.icoon, 195, y + 6);

    // Naam
    ctx.fillStyle = kanKopen ? '#fff' : '#666';
    ctx.font = 'bold 18px Arial'; ctx.textAlign = 'left';
    ctx.fillText(item.naam, 230, y + 2);

    // Beschrijving
    ctx.fillStyle = kanKopen ? '#aaa' : '#555';
    ctx.font = '14px Arial';
    ctx.fillText(item.beschrijving, 230, y + 20);

    // Gekocht x keer
    if (item.gekocht > 0) {
      ctx.fillStyle = '#88ff88'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
      ctx.fillText('x' + item.gekocht, 420, y + 6);
    }

    // Prijs
    ctx.textAlign = 'right';
    ctx.fillStyle = kanKopen ? '#ffdd00' : '#ff4444';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(prijs + ' munten', 630, y + 6);
  }

  // Doorgaan knop
  const knopY = 180 + winkelItems.length * 70;
  const gekozen = winkelGekozen === winkelItems.length;
  const p = 1 + Math.sin(Date.now() / 300) * 0.03;

  ctx.save(); ctx.translate(400, knopY + 5); ctx.scale(p, p);
  ctx.fillStyle = gekozen ? '#44cc44' : '#338833';
  ctx.beginPath(); ctx.roundRect(-120, -22, 240, 44, 10); ctx.fill();
  if (gekozen) {
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-120, -22, 240, 44, 10); ctx.stroke();
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center';
  ctx.fillText('DOORGAAN >', 0, 7);
  ctx.restore();

  // Instructies
  ctx.fillStyle = '#555'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
  ctx.fillText('W/S of pijltjes = kiezen | ENTER = kopen/doorgaan', 400, 570);
}

function tekenGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ff4444'; ctx.font = 'bold 56px Arial';
  ctx.strokeStyle = '#aa0000'; ctx.lineWidth = 4;
  ctx.strokeText('GAME OVER!', 400, 220);
  ctx.fillText('GAME OVER!', 400, 220);

  ctx.fillStyle = '#fff'; ctx.font = '24px Arial';
  ctx.fillText('Je haalde level ' + level + '!', 400, 280);
  ctx.fillText('Vijanden verslagen: ' + scoreSpeler, 400, 320);

  ctx.fillStyle = '#aaa'; ctx.font = '20px Arial';
  ctx.fillText('Klik of druk ENTER om opnieuw te beginnen', 400, 400);
}

function teken() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scherm === 'menu') {
    tekenMenu();
  } else if (scherm === 'game') {
    tekenMap();
    tekenDieren();
    tekenKogels();
    tekenVeertjes();
    tekenKnokkerFiguur(vijand.x, vijand.y, vijand, 1);
    tekenHPBalk(vijand.x, vijand.y, vijand.hp, vijand.maxHp, 36);
    tekenKnokkerFiguur(speler.x, speler.y, speler, 1);
    tekenHPBalk(speler.x, speler.y, speler.hp, speler.maxHp, 36);
    tekenRichting();
    tekenMuntAnimaties();
    tekenLevelInfo();
  } else if (scherm === 'winkel') {
    tekenWinkel();
  } else if (scherm === 'levelup') {
    tekenMap();
    tekenLevelUp();
  } else if (scherm === 'gameover') {
    tekenMap();
    tekenGameOver();
  }
}

function gameLoop() {
  update();
  teken();
  requestAnimationFrame(gameLoop);
}

gameLoop();
