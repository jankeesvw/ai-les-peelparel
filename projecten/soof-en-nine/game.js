// === MIJN GAME ===

// Pak het canvas en de "pen" om mee te tekenen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// === GAME STATUS ===
let gameStatus = 'spelen'; // 'spelen', 'gewonnen', 'verloren'
let tijdOver = 47; // Tijd hangt af van het level
let laatsteTijd = Date.now();

// === LEVELS ===
let level = 1;
const etenPerLevel = ['🍪', '🍕', '🍔', '🍩', '🌭', '🍟', '🌮', '🍦'];

function getEten() {
  return etenPerLevel[(level - 1) % etenPerLevel.length];
}

// === SPELER ===
const speler = {
  x: 30,
  y: 30,
  breedte: 40,
  hoogte: 40,
  snelheid: 20
};

// === DOOLHOF MUREN PER LEVEL ===
let muren = [];

const doolhoven = [
  // Level 1 - Makkelijk (weinig muren)
  [
    { x: 150, y: 0, breedte: 20, hoogte: 200 },
    { x: 300, y: 150, breedte: 20, hoogte: 250 },
    { x: 0, y: 300, breedte: 200, hoogte: 20 },
    { x: 500, y: 200, breedte: 20, hoogte: 300 },
  ],
  // Level 2 - Iets moeilijker
  [
    { x: 100, y: 0, breedte: 20, hoogte: 200 },
    { x: 250, y: 100, breedte: 20, hoogte: 250 },
    { x: 0, y: 250, breedte: 180, hoogte: 20 },
    { x: 400, y: 0, breedte: 20, hoogte: 300 },
    { x: 400, y: 250, breedte: 200, hoogte: 20 },
    { x: 550, y: 350, breedte: 20, hoogte: 250 },
  ],
  // Level 3 - Medium
  [
    { x: 100, y: 0, breedte: 20, hoogte: 150 },
    { x: 200, y: 100, breedte: 20, hoogte: 200 },
    { x: 0, y: 200, breedte: 150, hoogte: 20 },
    { x: 300, y: 0, breedte: 20, hoogte: 250 },
    { x: 300, y: 200, breedte: 200, hoogte: 20 },
    { x: 400, y: 300, breedte: 20, hoogte: 200 },
    { x: 500, y: 100, breedte: 20, hoogte: 200 },
    { x: 100, y: 400, breedte: 20, hoogte: 200 },
    { x: 600, y: 250, breedte: 20, hoogte: 250 },
  ],
  // Level 4 - Simpel
  [
    { x: 200, y: 0, breedte: 20, hoogte: 300 },
    { x: 500, y: 200, breedte: 20, hoogte: 400 },
  ],
  // Level 5 - Nog simpel
  [
    { x: 150, y: 0, breedte: 20, hoogte: 250 },
    { x: 400, y: 150, breedte: 20, hoogte: 450 },
    { x: 600, y: 0, breedte: 20, hoogte: 350 },
  ],
  // Level 6+ - Makkelijk
  [
    { x: 180, y: 0, breedte: 20, hoogte: 280 },
    { x: 0, y: 400, breedte: 250, hoogte: 20 },
    { x: 400, y: 100, breedte: 20, hoogte: 400 },
    { x: 600, y: 0, breedte: 20, hoogte: 300 },
  ],
];

// Kies het doolhof voor het huidige level
function kiesDoolhof() {
  const index = Math.min(level - 1, doolhoven.length - 1);
  muren = doolhoven[index];
}

// Start met level 1 doolhof
kiesDoolhof();

// === FINISH ===
const finish = {
  x: 720,
  y: 520,
  breedte: 60,
  hoogte: 60
};

// === HONGERIGE HONDEN ===
let honden = [];

// Alle mogelijke startposities voor honden
const hondenStartPosities = [
  { x: 700, y: 100 },
  { x: 400, y: 500 },
  { x: 600, y: 400 },
  { x: 750, y: 300 },
  { x: 200, y: 550 },
  { x: 550, y: 50 },
];

// Maak honden voor het huidige level
function maakHonden() {
  honden = [];
  // Altijd 3 honden
  const aantalHonden = 3;
  const basisSnelheid = 0.4 + (level - 1) * 0.1;

  for (let i = 0; i < aantalHonden; i++) {
    honden.push({
      x: hondenStartPosities[i].x,
      y: hondenStartPosities[i].y,
      breedte: 35,
      hoogte: 35,
      snelheid: basisSnelheid + (i * 0.1)
    });
  }
}

// Start met 1 hond
maakHonden();

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

  // Druk spatie om door te gaan
  if (e.key === ' ' && gameStatus !== 'spelen') {
    // Bij winnen: ga naar volgend level
    if (gameStatus === 'gewonnen') {
      // Bij level 15 gewonnen: begin opnieuw
      if (level >= 15) {
        level = 1;
      } else {
        level += 1;
      }
    } else {
      // Bij verliezen: 1 level terug (maar niet onder level 1)
      level = Math.max(1, level - 1);
    }

    gameStatus = 'spelen';
    // Minder tijd per level (45 sec bij level 1, min 25 sec)
    tijdOver = Math.max(25, 50 - (level * 3));
    laatsteTijd = Date.now();
    speler.x = 30;
    speler.y = 30;

    // Maak nieuw doolhof en honden voor dit level
    kiesDoolhof();
    maakHonden();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') toetsen.omhoog = false;
  if (e.key === 'ArrowDown' || e.key === 's') toetsen.omlaag = false;
  if (e.key === 'ArrowLeft' || e.key === 'a') toetsen.links = false;
  if (e.key === 'ArrowRight' || e.key === 'd') toetsen.rechts = false;
});

// === CHECK OF TWEE DINGEN BOTSEN ===
function botst(a, b) {
  return a.x < b.x + b.breedte &&
         a.x + a.breedte > b.x &&
         a.y < b.y + b.hoogte &&
         a.y + a.hoogte > b.y;
}

// === UPDATE FUNCTIE ===
// Hier verandert alles in het spel
function update() {
  // Stop als het spel voorbij is
  if (gameStatus !== 'spelen') return;

  // Update de timer
  const nu = Date.now();
  if (nu - laatsteTijd >= 1000) {
    tijdOver -= 1;
    laatsteTijd = nu;
  }

  // Check of tijd op is
  if (tijdOver <= 0) {
    gameStatus = 'verloren';
    return;
  }

  // Onthoud oude positie
  const oudeX = speler.x;
  const oudeY = speler.y;

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

  // Check of speler tegen een muur botst
  for (const muur of muren) {
    if (botst(speler, muur)) {
      // Ga terug naar oude positie
      speler.x = oudeX;
      speler.y = oudeY;
      break;
    }
  }

  // Check of speler de finish bereikt
  if (botst(speler, finish)) {
    gameStatus = 'gewonnen';
  }

  // Beweeg de honden naar het koekje
  for (const hond of honden) {
    // Onthoud oude positie van de hond
    const oudeHondX = hond.x;
    const oudeHondY = hond.y;

    // Bereken richting naar speler
    const dx = speler.x - hond.x;
    const dy = speler.y - hond.y;
    const afstand = Math.sqrt(dx * dx + dy * dy);

    if (afstand > 0) {
      hond.x += (dx / afstand) * hond.snelheid;
      hond.y += (dy / afstand) * hond.snelheid;
    }

    // Check of hond tegen een muur botst
    for (const muur of muren) {
      if (botst(hond, muur)) {
        // Probeer alleen horizontaal te bewegen
        hond.x = oudeHondX;
        hond.y = oudeHondY;

        // Probeer links of rechts
        if (dx > 0) hond.x += hond.snelheid;
        else if (dx < 0) hond.x -= hond.snelheid;

        // Als dat ook botst, probeer omhoog of omlaag
        let botstNog = false;
        for (const m of muren) {
          if (botst(hond, m)) { botstNog = true; break; }
        }
        if (botstNog) {
          hond.x = oudeHondX;
          if (dy > 0) hond.y += hond.snelheid;
          else if (dy < 0) hond.y -= hond.snelheid;
        }
        break;
      }
    }

    // Check of hond het koekje pakt
    if (botst(speler, hond)) {
      gameStatus = 'verloren';
    }
  }
}

// === BOS ACHTERGROND ===
const bomen = [];
// Maak bomen aan de randen
for (let x = 0; x < 800; x += 60) {
  bomen.push({ x: x, y: -10 });      // Bovenkant
  bomen.push({ x: x, y: 560 });      // Onderkant
}
for (let y = 50; y < 560; y += 70) {
  bomen.push({ x: -10, y: y });      // Linkerkant
  bomen.push({ x: 760, y: y });      // Rechterkant
}

// === CONFETTI ===
const confetti = [];
const confettiKleuren = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088'];
for (let i = 0; i < 100; i++) {
  confetti.push({
    x: Math.random() * 800,
    y: Math.random() * 600,
    snelheid: 1 + Math.random() * 3,
    kleur: confettiKleuren[Math.floor(Math.random() * confettiKleuren.length)],
    grootte: 5 + Math.random() * 10
  });
}

function tekenConfetti() {
  for (const c of confetti) {
    ctx.fillStyle = c.kleur;
    ctx.fillRect(c.x, c.y, c.grootte, c.grootte);
    // Beweeg confetti naar beneden
    c.y += c.snelheid;
    // Als confetti onderaan is, ga terug naar boven
    if (c.y > 600) {
      c.y = -10;
      c.x = Math.random() * 800;
    }
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Teken bos achtergrond
  ctx.fillStyle = '#228B22';  // Bos groen
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Teken gras patroon
  ctx.fillStyle = '#32CD32';  // Licht groen
  for (let x = 0; x < 800; x += 40) {
    for (let y = 0; y < 600; y += 40) {
      ctx.fillRect(x, y, 20, 20);
    }
  }

  // Teken de bomen
  ctx.font = '50px Arial';
  for (const boom of bomen) {
    ctx.fillText('🌲', boom.x, boom.y + 45);
  }

  // Als je gewonnen hebt
  if (gameStatus === 'gewonnen') {
    // EINDSCHERM bij level 15!
    if (level >= 15) {
      ctx.fillStyle = '#FFD700';  // Goud
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      tekenConfetti();
      ctx.fillStyle = '#FF1493';
      ctx.font = '50px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 GEFELICITEERD! 🏆', canvas.width / 2, 150);
      ctx.font = '35px Arial';
      ctx.fillStyle = '#8B008B';
      ctx.fillText('JE HEBT DE HELE GAME GEWONNEN!', canvas.width / 2, 220);
      ctx.font = '80px Arial';
      ctx.fillText('🎉🎊🥳🎈🎁', canvas.width / 2, 320);
      ctx.font = '25px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Je bent een echte kampioen!', canvas.width / 2, 400);
      ctx.fillText('Alle 15 levels gehaald!', canvas.width / 2, 450);
      ctx.font = '20px Arial';
      ctx.fillText('Druk op SPATIE om opnieuw te beginnen', canvas.width / 2, 520);
      ctx.textAlign = 'left';
      return;
    }

    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 LEVEL ' + level + ' GEHAALD! 🎉', canvas.width / 2, 200);
    ctx.font = '25px Arial';
    const volgendEten = etenPerLevel[level % etenPerLevel.length];
    const volgendAantalHonden = 3;
    const volgendeTijd = Math.max(25, 50 - ((level + 1) * 3));
    ctx.fillText('Volgend level: red de ' + volgendEten, canvas.width / 2, 280);
    ctx.fillText('🐕 ' + volgendAantalHonden + ' honden - ⏱️ ' + volgendeTijd + ' seconden', canvas.width / 2, 330);
    ctx.font = '30px Arial';
    ctx.fillText('Druk op SPATIE voor level ' + (level + 1), canvas.width / 2, 420);
    ctx.textAlign = 'left';
    return;
  }

  // Als je verloren hebt
  if (gameStatus === 'verloren') {
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐕 VERLOREN! 🐕', canvas.width / 2, 250);
    ctx.font = '30px Arial';
    ctx.fillText('Een hond heeft je ' + getEten() + ' opgegeten!', canvas.width / 2, 320);
    ctx.fillText('Je was bij level ' + level, canvas.width / 2, 370);
    ctx.fillText('Druk op SPATIE om opnieuw te beginnen', canvas.width / 2, 430);
    ctx.textAlign = 'left';
    return;
  }

  // Teken de finish (groene vlag)
  ctx.font = '50px Arial';
  ctx.fillText('🏁', finish.x, finish.y + 45);

  // Teken alle muren (houten hekken)
  ctx.fillStyle = '#4a3000';
  for (const muur of muren) {
    ctx.fillRect(muur.x, muur.y, muur.breedte, muur.hoogte);
    // Lichtere rand voor 3D effect
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(muur.x + 2, muur.y + 2, muur.breedte - 4, muur.hoogte - 4);
    ctx.fillStyle = '#4a3000';
  }

  // Teken de speler (eten van dit level!)
  ctx.font = '40px Arial';
  ctx.fillText(getEten(), speler.x, speler.y + 35);

  // Teken de hongerige honden
  ctx.font = '35px Arial';
  for (const hond of honden) {
    ctx.fillText('🐕', hond.x, hond.y + 30);
  }

  // Teken de timer en level
  ctx.fillStyle = tijdOver <= 10 ? 'red' : 'black';
  ctx.font = '30px Arial';
  ctx.fillText('Tijd: ' + tijdOver, 650, 40);
  ctx.fillStyle = 'blue';
  ctx.fillText('Level: ' + level, 20, 40);
  ctx.fillStyle = 'brown';
  ctx.fillText('🐕 x ' + honden.length, 20, 80);
}

// === GAME LOOP ===
// Dit draait 60 keer per seconde
function gameLoop() {
  update();
  teken();
  requestAnimationFrame(gameLoop);
}

// Start het spel!
gameLoop();
