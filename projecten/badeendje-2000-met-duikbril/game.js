// === MIJN GAME ===

// Pak het canvas en de "pen" om mee te tekenen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// === GELUIDSEFFECTEN ===
const audioCtx = new AudioContext();

function speelGeluid(frequentie, duur, type) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequentie;
  oscillator.type = type || 'sine';

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duur);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duur);
}

function fruitGeluid() {
  // Blij geluidje - hoge toon
  speelGeluid(880, 0.1, 'sine');
  setTimeout(() => speelGeluid(1100, 0.15, 'sine'), 100);
}

function auGeluid() {
  // Au geluidje - lage buzzer
  speelGeluid(150, 0.3, 'sawtooth');
}

// === ACHTERGRONDMUZIEK ===
let muziekSpeelt = false;
// Grappig badeend liedje! Kwak kwak kwak!
const melodie = [
  392, 392, 440, 392, 0,    // Kwak kwak kwaaak kwak (pauze)
  330, 330, 349, 330, 0,    // Kwek kwek kweek kwek (pauze)
  294, 330, 349, 392, 440,  // Badeend gaat omhoog!
  880, 440, 220, 440, 0     // Splash! Blub blub (pauze)
];
let nootIndex = 0;

function speelMuziek() {
  if (!muziekSpeelt || gameOver) return;

  // Sla pauzes over (0 = stilte)
  if (melodie[nootIndex] === 0) {
    nootIndex = (nootIndex + 1) % melodie.length;
    let snelheid = Math.max(150, 350 - (level * 25));
    setTimeout(speelMuziek, snelheid);
    return;
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = melodie[nootIndex];
  // Grappig retro geluid!
  oscillator.type = nootIndex % 3 === 0 ? 'square' : 'triangle';

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.3);

  nootIndex = (nootIndex + 1) % melodie.length;

  // Speel volgende noot - sneller bij hoger level!
  let snelheid = Math.max(150, 350 - (level * 25));
  setTimeout(speelMuziek, snelheid);
}

function startMuziek() {
  if (!muziekSpeelt) {
    muziekSpeelt = true;
    speelMuziek();
  }
}

// === SPELER ===
const speler = {
  x: 400,
  y: 300,
  breedte: 50,
  hoogte: 50,
  kleur: 'red',
  snelheid: 5
};

// === LEVENS EN SCORE ===
let levens = 3;
let score = 0;
let gameOver = false;
let level = 1;
let vorigeScore = 0;

// === FRUIT ===
const fruitSoorten = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍌', '🥝'];
const fruit = [];

// Maak 3 fruitjes
for (let i = 0; i < 3; i++) {
  fruit.push({
    x: Math.random() * 750,
    y: Math.random() * -300,
    snelheid: 1 + Math.random() * 2,
    soort: fruitSoorten[Math.floor(Math.random() * fruitSoorten.length)]
  });
}

// === VLAMMEN ===
const vlammen = [];

// Maak 5 vlammen op willekeurige plekken
for (let i = 0; i < 5; i++) {
  vlammen.push({
    x: Math.random() * 750,
    y: Math.random() * 550,
    snelheid: 2 + Math.random() * 2
  });
}

// === LAVA BUBBELS ===
const bubbels = [];

// Maak 20 lava bubbels
for (let i = 0; i < 20; i++) {
  bubbels.push({
    x: Math.random() * 800,
    y: Math.random() * 600,
    grootte: 20 + Math.random() * 40,
    snelheid: 0.5 + Math.random() * 1,
    kleur: Math.random() > 0.5 ? '#ff6600' : '#ffcc00'
  });
}

// === EILAND ===
const eiland = {
  x: 350,
  y: 250,
  breedte: 100,
  hoogte: 100
};

// === VOETBALSTADION ===
const stadion = {
  x: 500,
  y: 400,
  breedte: 280,
  hoogte: 180
};

// === GOAL ===
const goal = {
  x: 730,
  y: 450,
  breedte: 40,
  hoogte: 80
};

// === VOETBAL ===
const bal = {
  x: 600,
  y: 480,
  grootte: 30,
  snelheidX: 0,
  snelheidY: 0
};

// === ACHTERVOLGER ===
const vijand = {
  x: 100,
  y: 100,
  grootte: 45,
  snelheid: 1.5
};

// === WAPEN ===
const kogels = [];
let laatsteSchot = 0;

function schiet() {
  // Check cooldown (500ms tussen schoten)
  if (Date.now() - laatsteSchot < 500) return;
  laatsteSchot = Date.now();

  // Bereken richting naar vijand
  let dx = vijand.x - speler.x;
  let dy = vijand.y - speler.y;
  let afstand = Math.sqrt(dx * dx + dy * dy);

  // Maak nieuwe kogel
  kogels.push({
    x: speler.x + speler.breedte / 2,
    y: speler.y + speler.hoogte / 2,
    snelheidX: (dx / afstand) * 10,
    snelheidY: (dy / afstand) * 10,
    grootte: 15
  });

  // Schiet geluid!
  speelGeluid(600, 0.1, 'square');
}

// Check of speler op het eiland staat
function opEiland() {
  return speler.x + speler.breedte > eiland.x &&
         speler.x < eiland.x + eiland.breedte &&
         speler.y + speler.hoogte > eiland.y &&
         speler.y < eiland.y + eiland.hoogte;
}

// Check of speler op het stadion staat
function opStadion() {
  return speler.x + speler.breedte > stadion.x &&
         speler.x < stadion.x + stadion.breedte &&
         speler.y + speler.hoogte > stadion.y &&
         speler.y < stadion.y + stadion.hoogte;
}

// Check of speler op een veilige plek staat (eiland of stadion)
function opVeiligePlek() {
  return opEiland() || opStadion();
}

// Timer voor healing op eiland
let healingTeller = 0;

// === TOETSEN ===
const toetsen = {
  omhoog: false,
  omlaag: false,
  links: false,
  rechts: false
};

// Luister naar toetsenbord
document.addEventListener('keydown', (e) => {
  // Start de muziek bij eerste toetsdruk
  startMuziek();

  if (e.key === 'ArrowUp' || e.key === 'w') toetsen.omhoog = true;
  if (e.key === 'ArrowDown' || e.key === 's') toetsen.omlaag = true;
  if (e.key === 'ArrowLeft' || e.key === 'a') toetsen.links = true;
  if (e.key === 'ArrowRight' || e.key === 'd') toetsen.rechts = true;

  // Schieten met X of Shift
  if ((e.key === 'x' || e.key === 'X' || e.key === 'Shift') && !gameOver) {
    schiet();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') toetsen.omhoog = false;
  if (e.key === 'ArrowDown' || e.key === 's') toetsen.omlaag = false;
  if (e.key === 'ArrowLeft' || e.key === 'a') toetsen.links = false;
  if (e.key === 'ArrowRight' || e.key === 'd') toetsen.rechts = false;

  // Spatie om opnieuw te beginnen
  if (e.key === ' ' && gameOver) {
    levens = 3;
    score = 0;
    level = 1;
    vorigeScore = 0;
    gameOver = false;
    speler.x = 400;
    speler.y = 300;

    // Reset vlammen naar 5 stuks met normale snelheid
    vlammen.length = 0;
    for (let i = 0; i < 5; i++) {
      vlammen.push({
        x: Math.random() * 750,
        y: Math.random() * 550,
        snelheid: 2 + Math.random() * 2
      });
    }

    // Reset vijand
    vijand.x = 100;
    vijand.y = 100;
    vijand.snelheid = 1.5;

    // Start muziek weer
    speelMuziek();
  }
});

// === UPDATE FUNCTIE ===
// Hier verandert alles in het spel
function update() {
  // Beweeg de lava bubbels (altijd, ook bij game over)
  for (let bubbel of bubbels) {
    bubbel.y -= bubbel.snelheid;
    bubbel.x += Math.sin(bubbel.y / 30) * 0.5;
    // Als bubbel bovenaan is, zet hem onderaan terug
    if (bubbel.y < -bubbel.grootte) {
      bubbel.y = 600 + bubbel.grootte;
      bubbel.x = Math.random() * 800;
    }
  }

  // Check of we een level omhoog gaan (elke 100 punten)
  if (score >= level * 100 && score !== vorigeScore) {
    level += 1;
    vorigeScore = score;

    // Voeg een nieuwe vlam toe!
    vlammen.push({
      x: Math.random() * 750,
      y: -50,
      snelheid: 2 + Math.random() * 2 + level * 0.5
    });

    // Maak alle vlammen sneller
    for (let vlam of vlammen) {
      vlam.snelheid += 0.3;
    }

    // Maak de vijand ook sneller!
    vijand.snelheid += 0.3;

    // Speel een waarschuwingsgeluid
    speelGeluid(200, 0.3, 'square');
  }

  // Stop als game over
  if (gameOver) return;

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

  // Healing op het eiland
  if (opEiland()) {
    healingTeller += 1;
    // Elke 60 frames (1 seconde) krijg je een leven erbij
    if (healingTeller >= 60 && levens < 5) {
      levens += 1;
      healingTeller = 0;
      fruitGeluid(); // Blij geluidje!
    }
  } else {
    healingTeller = 0;
  }

  // Beweeg de vlammen naar beneden
  for (let vlam of vlammen) {
    vlam.y += vlam.snelheid;
    // Als vlam onderaan is, zet hem bovenaan terug
    if (vlam.y > canvas.height) {
      vlam.y = -50;
      vlam.x = Math.random() * 750;
    }

    // Check of speler de vlam raakt (niet als je op een veilige plek staat!)
    if (!opVeiligePlek() &&
        speler.x < vlam.x + 40 &&
        speler.x + speler.breedte > vlam.x &&
        speler.y < vlam.y + 40 &&
        speler.y + speler.hoogte > vlam.y) {
      // Au! Leven kwijt!
      levens -= 1;
      auGeluid();
      // Zet vlam ergens anders
      vlam.y = -50;
      vlam.x = Math.random() * 750;

      // Game over?
      if (levens <= 0) {
        gameOver = true;
      }
    }
  }

  // Beweeg het fruit naar beneden
  for (let f of fruit) {
    f.y += f.snelheid;
    // Als fruit onderaan is, zet hem bovenaan terug
    if (f.y > canvas.height) {
      f.y = -50;
      f.x = Math.random() * 750;
      f.soort = fruitSoorten[Math.floor(Math.random() * fruitSoorten.length)];
    }

    // Check of speler het fruit pakt
    if (speler.x < f.x + 40 &&
        speler.x + speler.breedte > f.x &&
        speler.y < f.y + 40 &&
        speler.y + speler.hoogte > f.y) {
      // Yum! Punten erbij!
      score += 10;
      fruitGeluid();
      // Zet fruit ergens anders
      f.y = -50;
      f.x = Math.random() * 750;
      f.soort = fruitSoorten[Math.floor(Math.random() * fruitSoorten.length)];
    }
  }

  // === VOETBAL LOGICA ===
  // Check of speler de bal raakt
  if (speler.x < bal.x + bal.grootte &&
      speler.x + speler.breedte > bal.x &&
      speler.y < bal.y + bal.grootte &&
      speler.y + speler.hoogte > bal.y) {
    // Schop de bal weg!
    bal.snelheidX = (bal.x - speler.x) * 0.2;
    bal.snelheidY = (bal.y - speler.y) * 0.2;
  }

  // Beweeg de bal
  bal.x += bal.snelheidX;
  bal.y += bal.snelheidY;

  // Bal vertraagt
  bal.snelheidX *= 0.98;
  bal.snelheidY *= 0.98;

  // Houd bal in het stadion
  if (bal.x < stadion.x) {
    bal.x = stadion.x;
    bal.snelheidX *= -0.5;
  }
  if (bal.x + bal.grootte > stadion.x + stadion.breedte) {
    bal.x = stadion.x + stadion.breedte - bal.grootte;
    bal.snelheidX *= -0.5;
  }
  if (bal.y < stadion.y) {
    bal.y = stadion.y;
    bal.snelheidY *= -0.5;
  }
  if (bal.y + bal.grootte > stadion.y + stadion.hoogte) {
    bal.y = stadion.y + stadion.hoogte - bal.grootte;
    bal.snelheidY *= -0.5;
  }

  // Check of bal in de goal is!
  if (bal.x + bal.grootte > goal.x &&
      bal.y > goal.y &&
      bal.y + bal.grootte < goal.y + goal.hoogte) {
    // GOAL! Muntjes erbij!
    score += 50;
    fruitGeluid();
    // Zet bal terug naar midden
    bal.x = 600;
    bal.y = 480;
    bal.snelheidX = 0;
    bal.snelheidY = 0;
  }

  // === KOGEL LOGICA ===
  for (let i = kogels.length - 1; i >= 0; i--) {
    let kogel = kogels[i];

    // Beweeg kogel
    kogel.x += kogel.snelheidX;
    kogel.y += kogel.snelheidY;

    // Verwijder kogel als die buiten scherm is
    if (kogel.x < 0 || kogel.x > 800 || kogel.y < 0 || kogel.y > 600) {
      kogels.splice(i, 1);
      continue;
    }

    // Check of kogel het monster raakt!
    if (kogel.x < vijand.x + vijand.grootte &&
        kogel.x + kogel.grootte > vijand.x &&
        kogel.y < vijand.y + vijand.grootte &&
        kogel.y + kogel.grootte > vijand.y) {
      // RAAK! Monster is dood!
      kogels.splice(i, 1);
      score += 25;

      // Monster explodeert geluid
      speelGeluid(100, 0.2, 'sawtooth');
      speelGeluid(80, 0.3, 'square');

      // Zet monster ver weg en reset
      vijand.x = Math.random() < 0.5 ? -100 : 900;
      vijand.y = Math.random() * 600;
    }
  }

  // === ACHTERVOLGER LOGICA ===
  // Beweeg vijand richting speler
  let dx = speler.x - vijand.x;
  let dy = speler.y - vijand.y;
  let afstand = Math.sqrt(dx * dx + dy * dy);

  if (afstand > 0) {
    vijand.x += (dx / afstand) * vijand.snelheid;
    vijand.y += (dy / afstand) * vijand.snelheid;
  }

  // Check of vijand de speler raakt (niet op veilige plek!)
  if (!opVeiligePlek() &&
      speler.x < vijand.x + vijand.grootte &&
      speler.x + speler.breedte > vijand.x &&
      speler.y < vijand.y + vijand.grootte &&
      speler.y + speler.hoogte > vijand.y) {
    // Gepakt! Leven kwijt!
    levens -= 1;
    auGeluid();
    // Zet vijand ver weg
    vijand.x = Math.random() < 0.5 ? -50 : 850;
    vijand.y = Math.random() * 600;

    // Game over?
    if (levens <= 0) {
      gameOver = true;
    }
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Teken de lava achtergrond met gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, 600);
  gradient.addColorStop(0, '#8B0000');
  gradient.addColorStop(0.5, '#ff4500');
  gradient.addColorStop(1, '#ff6600');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Teken de lava bubbels
  for (let bubbel of bubbels) {
    ctx.beginPath();
    ctx.arc(bubbel.x, bubbel.y, bubbel.grootte, 0, Math.PI * 2);
    ctx.fillStyle = bubbel.kleur;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Teken het eiland
  ctx.font = '80px Arial';
  ctx.fillText('🏝️', eiland.x, eiland.y + 80);

  // Teken het voetbalstadion (groen veld)
  ctx.fillStyle = '#228B22';
  ctx.fillRect(stadion.x, stadion.y, stadion.breedte, stadion.hoogte);

  // Teken de lijnen op het veld
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.strokeRect(stadion.x + 5, stadion.y + 5, stadion.breedte - 10, stadion.hoogte - 10);
  // Middenlijn
  ctx.beginPath();
  ctx.moveTo(stadion.x + stadion.breedte / 2, stadion.y + 5);
  ctx.lineTo(stadion.x + stadion.breedte / 2, stadion.y + stadion.hoogte - 5);
  ctx.stroke();

  // Teken de goal
  ctx.fillStyle = 'white';
  ctx.fillRect(goal.x, goal.y, goal.breedte, goal.hoogte);
  ctx.fillStyle = '#333';
  ctx.fillRect(goal.x + 5, goal.y + 5, goal.breedte - 10, goal.hoogte - 10);
  // Net patroon
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(goal.x + 5, goal.y + 5 + i * 20);
    ctx.lineTo(goal.x + goal.breedte - 5, goal.y + 5 + i * 20);
    ctx.stroke();
  }

  // Teken de voetbal
  ctx.font = '30px Arial';
  ctx.fillText('⚽', bal.x, bal.y + 25);

  // Teken de vlammen
  ctx.font = '40px Arial';
  for (let vlam of vlammen) {
    ctx.fillText('🔥', vlam.x, vlam.y + 40);
  }

  // Teken het fruit
  ctx.font = '35px Arial';
  for (let f of fruit) {
    ctx.fillText(f.soort, f.x, f.y + 35);
  }

  // Teken de speler (badeend met duikbril!)
  ctx.font = '50px Arial';
  ctx.fillText('🐤', speler.x, speler.y + speler.hoogte);
  // Duikbril op de badeend
  ctx.font = '25px Arial';
  ctx.fillText('🥽', speler.x + 12, speler.y + 25);

  // Teken de achtervolger (enge vijand!)
  // Rode gloed om het monster
  ctx.shadowColor = 'red';
  ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;

  // Monster trilt heen en weer
  let trilX = Math.random() * 4 - 2;
  let trilY = Math.random() * 4 - 2;

  // Monster wordt groter bij hogere levels!
  let monsterGrootte = 45 + level * 5;
  ctx.font = monsterGrootte + 'px Arial';

  // Teken het enge monster
  ctx.fillText('👿', vijand.x + trilX, vijand.y + vijand.grootte + trilY);

  // Enge ogen erbij
  ctx.font = '20px Arial';
  ctx.fillText('👁️', vijand.x + trilX - 5, vijand.y + 20 + trilY);
  ctx.fillText('👁️', vijand.x + trilX + 25, vijand.y + 20 + trilY);

  // Zet schaduw weer uit
  ctx.shadowBlur = 0;

  // Teken de kogels
  ctx.font = '20px Arial';
  for (let kogel of kogels) {
    ctx.fillText('🔴', kogel.x, kogel.y + 15);
  }

  // Teken de levens (hartjes)
  ctx.font = '30px Arial';
  for (let i = 0; i < levens; i++) {
    ctx.fillText('❤️', 10 + i * 35, 40);
  }

  // Teken de score en level
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Score: ' + score, 650, 35);
  ctx.fillStyle = 'yellow';
  ctx.fillText('Level ' + level, 650, 65);

  // Schiet instructie
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText('X = Schieten 🔴', 10, 590);

  // Game over scherm
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '60px Arial';
    ctx.fillText('GAME OVER', 220, 260);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score + '  -  Level: ' + level, 300, 310);
    ctx.fillText('Druk op SPATIE om opnieuw te spelen', 230, 360);
  }
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
