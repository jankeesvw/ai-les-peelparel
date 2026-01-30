// === MIJN GAME ===

// Pak het canvas en de "pen" om mee te tekenen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// === GELUIDEN ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function speelGeluid(frequentie, duur, type = 'sine') {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequentie;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duur);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duur);
}

function hapGeluid() {
  // Smak smak eetgeluid met "chomp" effect
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
  gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc1.start();
  osc1.stop(audioCtx.currentTime + 0.1);

  // Tweede hap
  setTimeout(() => {
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.1);
  }, 120);
}

function muntGeluid() {
  // Bling! geluid
  speelGeluid(800, 0.1);
  setTimeout(() => speelGeluid(1000, 0.15), 80);
  setTimeout(() => speelGeluid(1200, 0.2), 160);
}

function winGeluid() {
  // Feestelijk geluid
  speelGeluid(523, 0.15);
  setTimeout(() => speelGeluid(659, 0.15), 150);
  setTimeout(() => speelGeluid(784, 0.15), 300);
  setTimeout(() => speelGeluid(1047, 0.3), 450);
}

function verliesGeluid() {
  // Treurig geluid
  speelGeluid(400, 0.2);
  setTimeout(() => speelGeluid(350, 0.2), 200);
  setTimeout(() => speelGeluid(300, 0.4), 400);
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

// === CUPCAKES ===
const donuts = [];

// Maak 5 donuts op willekeurige plekken
for (let i = 0; i < 5; i++) {
  donuts.push({
    x: Math.random() * 700 + 50,
    y: Math.random() * 500 + 50,
    grootte: 30,
    goud: false
  });
}

// 1 gouden donut!
donuts.push({
  x: Math.random() * 700 + 50,
  y: Math.random() * 500 + 50,
  grootte: 30,
  goud: true
});

// === SCORE ===
let score = 0;

// === STOFZUIGER ===
const stofzuiger = {
  x: 80,
  y: 520,
  snelheid: 2,
  doelX: 150,
  doelY: 450
};

let stofzuigerGeraakt = false;
let katIsSterk = false;
let sterkTimer = 0;
let spelTijd = 0; // Houdt bij hoe lang het level bezig is
let stofzuigerVernietigd = false;

// Kies elke 2 seconden een nieuw doel
setInterval(() => {
  stofzuiger.doelX = Math.random() * 600 + 100;
  stofzuiger.doelY = Math.random() * 300 + 200;
}, 2000);

// === MUNTEN ===
const munten = [];
let totaalMunten = 0;

// Maak 6 munten op willekeurige plekken
for (let i = 0; i < 6; i++) {
  munten.push({
    x: Math.random() * 700 + 50,
    y: Math.random() * 400 + 50
  });
}

// === TIMER ===
let tijd = 11; // wordt berekend per level
let gameGewonnen = false;
let gameVerloren = false;

// === LEVELS EN KLEDING ===
let level = 1;

// === CONFETTI ===
const confetti = [];
function maakConfetti() {
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: Math.random() * 800,
      y: Math.random() * -600,
      grootte: Math.random() * 10 + 5,
      kleur: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#ff69b4', '#ffd700'][Math.floor(Math.random() * 7)],
      snelheid: Math.random() * 3 + 2,
      draai: Math.random() * 360
    });
  }
}
const kleding = [
  'geen', // level 1: geen kleding
  'hoed', // level 2: een hoedje
  'strikje', // level 3: een strikje
  'sjaal', // level 4: een sjaal
  'kroon', // level 5: een kroon!
  'zonnebril', // level 6: coole zonnebril
  'cape', // level 7: superhelden cape
  'toverstaf', // level 8: magische toverstaf
  'vleugels', // level 9: engelenvleugels
  'regenboog' // level 10: regenboog aura!
];

// Hoeveel donuts per level en hoeveel tijd
function getCupcakesNodig() {
  const donutsPerLevel = [5, 6, 7, 8, 9, 7, 7, 8, 8, 9];
  return donutsPerLevel[level - 1] || 9;
}

function getTijd() {
  if (level <= 5) {
    return 14 - level; // level 1 = 13 sec, level 5 = 9 sec
  } else {
    return 12 - (level - 5); // level 6 = 11 sec, level 10 = 7 sec
  }
}

// Tel elke seconde af
setInterval(() => {
  if (!gameGewonnen && !gameVerloren && tijd > 0) {
    tijd--;
    if (tijd === 0 && score < getCupcakesNodig()) {
      gameVerloren = true;
      verliesGeluid();
    }
  }
}, 1000);

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

  // Spatie om verder te gaan of opnieuw te beginnen
  if (e.key === ' ' && (gameGewonnen || gameVerloren)) {
    if (gameGewonnen) {
      // Ga naar volgend level
      level++;
    }
    // Bij verlies: blijf op hetzelfde level, probeer opnieuw!

    // Reset voor nieuw level
    score = 0;
    tijd = getTijd();
    gameGewonnen = false;
    gameVerloren = false;
    speler.x = 400;
    speler.y = 300;
    spelTijd = 0; // Reset de speltijd
    stofzuigerVernietigd = false; // Stofzuiger komt terug
    stofzuiger.x = 80;
    stofzuiger.y = 520;

    // Maak nieuwe donuts (altijd 5 op het scherm + 1 gouden)
    donuts.length = 0;
    for (let i = 0; i < 5; i++) {
      donuts.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        grootte: 30,
        goud: false
      });
    }
    // 1 gouden donut!
    donuts.push({
      x: Math.random() * 700 + 50,
      y: Math.random() * 500 + 50,
      grootte: 30,
      goud: true
    });

    // Maak nieuwe munten
    munten.length = 0;
    for (let i = 0; i < 3; i++) {
      munten.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50
      });
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

  // Positie van de kat
  const katX = speler.x + speler.breedte / 2;
  const katY = speler.y + speler.hoogte / 2;

  // Tel speltijd op
  if (!gameGewonnen && !gameVerloren) {
    spelTijd += 1/60; // 60 fps
  }

  // Beweeg de stofzuiger naar zijn doel (pas na 5 seconden)
  if (!gameGewonnen && !gameVerloren && !stofzuigerVernietigd) {
    const dx = stofzuiger.doelX - stofzuiger.x;
    const dy = stofzuiger.doelY - stofzuiger.y;
    const afstand = Math.sqrt(dx * dx + dy * dy);

    if (afstand > 5) {
      stofzuiger.x += (dx / afstand) * stofzuiger.snelheid;
      stofzuiger.y += (dy / afstand) * stofzuiger.snelheid;
    }

    // Check of de kat de stofzuiger raakt (pas na 5 seconden)
    if (!stofzuigerVernietigd) {
      const stofzuigerAfstand = Math.sqrt((katX - stofzuiger.x) ** 2 + (katY - stofzuiger.y) ** 2);

      if (stofzuigerAfstand < 50 && spelTijd > 5) {
        if (katIsSterk) {
          // VERNIETIG de stofzuiger!
          stofzuigerVernietigd = true;
          winGeluid(); // Victorie geluid!
        } else {
          // Au! Stofzuiger geraakt!
          verliesGeluid();
          if (level > 1) {
            level--;
          }
          // Zet speler terug naar midden
          speler.x = 400;
          speler.y = 300;
          // Zet stofzuiger weg
          stofzuiger.x = 80;
          stofzuiger.y = 520;
          // Toon bericht
          stofzuigerGeraakt = true;
          setTimeout(() => {
            stofzuigerGeraakt = false;
          }, 2000);
        }
      }
    }
  }

  // Check of de kat de halter aanraakt
  const halterX = 680;
  const halterY = 435;
  const halterAfstand = Math.sqrt((katX - halterX) ** 2 + (katY - halterY) ** 2);

  if (halterAfstand < 60 && !katIsSterk && !gameGewonnen && !gameVerloren) {
    katIsSterk = true;
    sterkTimer = 5; // 5 seconden sterk
    muntGeluid(); // Power-up geluid
  }

  // Tel sterk timer af
  if (katIsSterk && sterkTimer > 0) {
    sterkTimer -= 1/60; // 60 fps
    if (sterkTimer <= 0) {
      katIsSterk = false;
    }
  }

  // Check of de kat een munt pakt
  for (let i = munten.length - 1; i >= 0; i--) {
    const munt = munten[i];
    const afstand = Math.sqrt((katX - munt.x) ** 2 + (katY - munt.y) ** 2);

    if (afstand < 35 && !gameGewonnen && !gameVerloren) {
      // Bling! Munt gepakt!
      muntGeluid();
      munten.splice(i, 1);
      totaalMunten++;
      tijd += 2; // 2 seconden extra tijd!

      // Nieuwe munt maken
      munten.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50
      });
    }
  }

  for (let i = donuts.length - 1; i >= 0; i--) {
    const donut = donuts[i];
    const afstand = Math.sqrt((katX - donut.x) ** 2 + (katY - donut.y) ** 2);

    if (afstand < 40 && !gameGewonnen && !gameVerloren) {
      // Nom nom! Donut opgegeten!
      hapGeluid();
      const wasGoud = donut.goud;
      donuts.splice(i, 1);

      // Gouden donut = 3 punten!
      if (wasGoud) {
        score += 3;
        muntGeluid(); // Extra geluid voor goud!
      } else {
        score++;
      }

      // Check of je gewonnen hebt
      if (score >= getCupcakesNodig()) {
        gameGewonnen = true;
        winGeluid();
        // Confetti bij level 10!
        if (level === 10) {
          maakConfetti();
        }
      } else {
        // Nieuwe donut maken (gouden als het een gouden was)
        donuts.push({
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
          grootte: 30,
          goud: wasGoud
        });
      }
    }
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Maak het scherm leeg
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === BAKKERIJ ACHTERGROND ===

  // Muur (lichtroze)
  ctx.fillStyle = '#ffe4e1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vloer (houten planken)
  ctx.fillStyle = '#deb887';
  ctx.fillRect(0, 450, canvas.width, 150);

  // Planken lijnen
  ctx.strokeStyle = '#cd853f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 450 + i * 40);
    ctx.lineTo(canvas.width, 450 + i * 40);
    ctx.stroke();
  }

  // Toonbank
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(0, 500, canvas.width, 20);

  // Raam
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(600, 50, 150, 120);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 8;
  ctx.strokeRect(600, 50, 150, 120);
  // Raamkruis
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(675, 50);
  ctx.lineTo(675, 170);
  ctx.moveTo(600, 110);
  ctx.lineTo(750, 110);
  ctx.stroke();

  // === HALTER / GEWICHT ===
  // Stang
  ctx.fillStyle = '#888888';
  ctx.fillRect(620, 430, 120, 10);

  // Linker gewichten
  ctx.fillStyle = '#333333';
  ctx.fillRect(600, 410, 25, 50);
  ctx.fillStyle = '#222222';
  ctx.fillRect(590, 415, 15, 40);

  // Rechter gewichten
  ctx.fillStyle = '#333333';
  ctx.fillRect(715, 410, 25, 50);
  ctx.fillStyle = '#222222';
  ctx.fillRect(735, 415, 15, 40);

  // Glans op stang
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(650, 432, 40, 3);

  // Tekst op gewicht
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('100', 605, 440);
  ctx.fillText('KG', 608, 452);

  // === STOFZUIGER (BEWEEGT!) ===
  if (!stofzuigerVernietigd) {
  const szX = stofzuiger.x;
  const szY = stofzuiger.y;

  // Lichaam van stofzuiger
  ctx.fillStyle = '#cc0000';
  ctx.beginPath();
  ctx.ellipse(szX, szY, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wieltjes
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(szX - 20, szY + 20, 8, 0, Math.PI * 2);
  ctx.arc(szX + 20, szY + 20, 8, 0, Math.PI * 2);
  ctx.fill();

  // Slang
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(szX + 20, szY - 10);
  ctx.quadraticCurveTo(szX + 70, szY - 40, szX + 90, szY - 100);
  ctx.stroke();

  // Mondstuk
  ctx.fillStyle = '#444444';
  ctx.fillRect(szX + 80, szY - 115, 30, 15);

  // Handvat
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(szX + 90, szY - 100);
  ctx.lineTo(szX + 120, szY - 140);
  ctx.stroke();

  // Knop op stofzuiger
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.arc(szX, szY - 10, 5, 0, Math.PI * 2);
  ctx.fill();
  } // Einde stofzuiger tekening (als niet vernietigd)

  // === SCHAPPEN MET BROOD ===

  // Schap 1 (linksboven)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(30, 150, 180, 10);
  // Brood op schap 1
  ctx.fillStyle = '#f4a460';
  ctx.beginPath();
  ctx.ellipse(70, 145, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d2691e';
  ctx.beginPath();
  ctx.ellipse(130, 145, 30, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#deb887';
  ctx.beginPath();
  ctx.ellipse(180, 145, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Schap 2 (linksonder)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(30, 250, 180, 10);
  // Brood op schap 2
  ctx.fillStyle = '#cd853f';
  ctx.beginPath();
  ctx.ellipse(60, 245, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4a460';
  ctx.beginPath();
  ctx.ellipse(110, 245, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d2691e';
  ctx.beginPath();
  ctx.ellipse(165, 245, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Schap 3 (links helemaal onder)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(30, 350, 180, 10);
  // Croissants op schap 3
  ctx.fillStyle = '#f5deb3';
  ctx.beginPath();
  ctx.ellipse(60, 345, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(100, 345, 18, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(140, 345, 18, 10, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(180, 345, 18, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === SCHAPPEN RECHTS ===

  // Schap 4 (rechtsboven)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(590, 200, 180, 10);
  // Stokbroden op schap 4
  ctx.fillStyle = '#deb887';
  ctx.fillRect(610, 170, 12, 30);
  ctx.fillRect(635, 175, 12, 25);
  ctx.fillRect(660, 172, 12, 28);
  ctx.fillRect(685, 178, 12, 22);
  ctx.fillRect(710, 170, 12, 30);
  ctx.fillRect(735, 175, 12, 25);

  // Schap 5 (rechtsmidden)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(590, 300, 180, 10);
  // Donuts op schap 5
  ctx.fillStyle = '#d2691e';
  ctx.beginPath();
  ctx.arc(620, 290, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe4e1';
  ctx.beginPath();
  ctx.arc(620, 290, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(660, 290, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe4e1';
  ctx.beginPath();
  ctx.arc(660, 290, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8b4513';
  ctx.beginPath();
  ctx.arc(700, 290, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe4e1';
  ctx.beginPath();
  ctx.arc(700, 290, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(740, 290, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe4e1';
  ctx.beginPath();
  ctx.arc(740, 290, 6, 0, Math.PI * 2);
  ctx.fill();

  // Schap 6 (rechtsonder)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(590, 400, 180, 10);
  // Taartjes op schap 6
  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(610, 380, 30, 20);
  ctx.fillStyle = '#ff1493';
  ctx.beginPath();
  ctx.arc(625, 375, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(660, 380, 30, 20);
  ctx.fillStyle = '#87ceeb';
  ctx.beginPath();
  ctx.arc(675, 375, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(710, 380, 30, 20);
  ctx.fillStyle = '#98fb98';
  ctx.beginPath();
  ctx.arc(725, 375, 12, 0, Math.PI * 2);
  ctx.fill();

  // Bordje "BAKKERIJ"
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(300, 80, 180, 50);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 3;
  ctx.strokeRect(300, 80, 180, 50);
  ctx.fillStyle = '#8b4513';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('BAKKERIJ', 320, 115);

  // === SCHILDERIJEN ===

  // Schilderij 1: Taart (links)
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(270, 180, 70, 55);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 4;
  ctx.strokeRect(270, 180, 70, 55);
  // Taart in schilderij
  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(290, 210, 30, 20);
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(305, 205, 15, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(305, 195, 4, 0, Math.PI * 2);
  ctx.fill();

  // Schilderij 2: Croissant (midden)
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(365, 180, 70, 55);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 4;
  ctx.strokeRect(365, 180, 70, 55);
  // Croissant in schilderij
  ctx.fillStyle = '#deb887';
  ctx.beginPath();
  ctx.moveTo(380, 215);
  ctx.quadraticCurveTo(400, 195, 420, 215);
  ctx.quadraticCurveTo(400, 225, 380, 215);
  ctx.fill();

  // Schilderij 3: Kat met koksmuts (rechts)
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(460, 180, 70, 55);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 4;
  ctx.strokeRect(460, 180, 70, 55);
  // Katje in schilderij
  ctx.fillStyle = '#ff9933';
  ctx.beginPath();
  ctx.arc(495, 215, 12, 0, Math.PI * 2);
  ctx.fill();
  // Oortjes
  ctx.beginPath();
  ctx.moveTo(485, 200);
  ctx.lineTo(488, 208);
  ctx.lineTo(482, 208);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(505, 200);
  ctx.lineTo(502, 208);
  ctx.lineTo(508, 208);
  ctx.fill();
  // Koksmuts
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(495, 195, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(488, 195, 14, 8);
  // Oogjes
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(491, 215, 2, 0, Math.PI * 2);
  ctx.arc(499, 215, 2, 0, Math.PI * 2);
  ctx.fill();

  // Teken alle donuts
  for (const donut of donuts) {
    // Schaduw onder donut
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(donut.x + 3, donut.y + 3, 25, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Donut (lichtbruin deeg, of goud voor gouden donut)
    ctx.fillStyle = donut.goud ? '#daa520' : '#d2691e';
    ctx.beginPath();
    ctx.arc(donut.x, donut.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Glazuur bovenop (goud of roze)
    ctx.fillStyle = donut.goud ? '#ffd700' : '#ff69b4';
    ctx.beginPath();
    ctx.ellipse(donut.x, donut.y - 3, 23, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gat in het midden
    ctx.fillStyle = donut.goud ? '#fff8dc' : '#ffe4e1';
    ctx.beginPath();
    ctx.arc(donut.x, donut.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sprinkles / hagelslag (sterren voor goud, kleurtjes voor normaal)
    if (donut.goud) {
      // Glitter sterretjes voor gouden donut
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 8; s++) {
        const hoek = (s / 8) * Math.PI * 2;
        const afstand = 14;
        const sx = donut.x + Math.cos(hoek) * afstand;
        const sy = donut.y - 3 + Math.sin(hoek) * afstand * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // "x3" tekst
      ctx.fillStyle = '#8b0000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('x3', donut.x - 10, donut.y + 5);
    } else {
      const sprinkleKleuren = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      for (let s = 0; s < 12; s++) {
        const hoek = (s / 12) * Math.PI * 2;
        const afstand = 14 + Math.sin(s * 3) * 3;
        const sx = donut.x + Math.cos(hoek) * afstand;
        const sy = donut.y - 3 + Math.sin(hoek) * afstand * 0.8;
        ctx.fillStyle = sprinkleKleuren[s % sprinkleKleuren.length];
        ctx.fillRect(sx - 2, sy - 1, 5, 2);
      }
    }

    // Glans
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(donut.x - 8, donut.y - 10, 6, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken alle munten
  for (const munt of munten) {
    // Schaduw
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(munt.x + 2, munt.y + 2, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gouden munt
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(munt.x, munt.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Rand van munt
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(munt.x, munt.y, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Binnenste cirkel
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(munt.x, munt.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Dollar teken
    ctx.fillStyle = '#daa520';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('$', munt.x - 5, munt.y + 6);

    // Glans
    ctx.fillStyle = '#ffec8b';
    ctx.beginPath();
    ctx.arc(munt.x - 5, munt.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken de score, timer en level
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText('Level: ' + level, 10, 30);
  ctx.fillText('Donuts: ' + score + ' / ' + getCupcakesNodig(), 10, 60);
  ctx.fillText('Tijd: ' + tijd + ' seconden', 10, 90);
  ctx.fillStyle = '#daa520';
  ctx.fillText('Munten: ' + totaalMunten, 10, 120);

  // Sterk indicator
  if (katIsSterk) {
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('💪 STERK! ' + Math.ceil(sterkTimer) + 's', 10, 150);
  }

  // Teken win of verlies bericht
  if (gameGewonnen) {
    // Speciaal scherm voor level 10 winnen!
    if (level === 10) {
      // Teken confetti
      for (const c of confetti) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.draai * Math.PI / 180);
        ctx.fillStyle = c.kleur;
        ctx.fillRect(-c.grootte / 2, -c.grootte / 2, c.grootte, c.grootte);
        ctx.restore();

        // Beweeg confetti naar beneden
        c.y += c.snelheid;
        c.draai += 5;
        // Confetti opnieuw bovenaan laten beginnen
        if (c.y > 650) {
          c.y = -20;
          c.x = Math.random() * 800;
        }
      }

      // Grote win tekst
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 72px Arial';
      ctx.fillText('JE HEBT', 250, 250);
      ctx.fillText('GEWONNEN!', 200, 340);

      // Schaduw effect
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 3;
      ctx.strokeText('JE HEBT', 250, 250);
      ctx.strokeText('GEWONNEN!', 200, 340);

      ctx.font = '28px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Je kat is de ULTIEME DONUT KONING!', 180, 400);
    } else {
      ctx.fillStyle = 'green';
      ctx.font = '48px Arial';
      ctx.fillText('LEVEL ' + level + ' GEHAALD!', 220, 280);
      ctx.font = '28px Arial';
      ctx.fillText('Je kat krijgt: ' + kleding[level], 260, 320);
    }
  }

  if (gameVerloren) {
    ctx.fillStyle = 'red';
    ctx.font = '48px Arial';
    ctx.fillText('HELAAS, TE LAAT!', 220, 300);
  }

  // Laat zien hoe je opnieuw kunt spelen
  if (gameGewonnen || gameVerloren) {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('Druk op SPATIE om opnieuw te spelen', 230, 350);
  }

  // Stofzuiger geraakt bericht - HELE SCHERM ZWART
  if (stofzuigerGeraakt) {
    // Hele scherm zwart
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Verdrietige smiley
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(400, 250, 60, 0, Math.PI * 2);
    ctx.fill();

    // Ogen (verdrietig)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(375, 235, 8, 0, Math.PI * 2);
    ctx.arc(425, 235, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tranen
    ctx.fillStyle = '#00bfff';
    ctx.beginPath();
    ctx.ellipse(368, 260, 6, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(432, 260, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Verdrietige mond
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 295, 20, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    // Tekst
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('JE BENT GERAAKT DOOR DE', 150, 380);
    ctx.fillText('STOFZUIGER!', 280, 430);
  }

  // Teken de dikke kat!
  const katX = speler.x + speler.breedte / 2;
  const katY = speler.y + speler.hoogte / 2;

  // Hoe dikker per level (level 1 = normaal, level 5 = super dik!)
  // Maar als de kat sterk is, wordt hij dunner!
  let dikheid = 1 + (level - 1) * 0.15;
  if (katIsSterk) {
    dikheid = 0.7; // Dun en gespierd!
  }

  // Blauwe beschermings-aura eerste 5 seconden
  if (spelTijd < 5 && !gameGewonnen && !gameVerloren) {
    // Gloeiende blauwe aura
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(katX, katY, 50 * dikheid, 0, Math.PI * 2);
    ctx.stroke();

    // Tweede ring
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(katX, katY, 58 * dikheid, 0, Math.PI * 2);
    ctx.stroke();

    // Derde ring (pulserend)
    ctx.strokeStyle = 'rgba(100, 220, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(katX, katY, 65 * dikheid + Math.sin(spelTijd * 5) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Level 7+: Cape (ACHTER de kat)
  if (level >= 7) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(katX - 20, katY);
    ctx.lineTo(katX - 35 * dikheid, katY + 45 * dikheid);
    ctx.lineTo(katX + 35 * dikheid, katY + 45 * dikheid);
    ctx.lineTo(katX + 20, katY);
    ctx.closePath();
    ctx.fill();
    // Cape rand
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Level 9+: Vleugels (ACHTER de kat)
  if (level >= 9) {
    // Linker vleugel
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(katX - 20, katY);
    // Grote buitenste veer
    ctx.quadraticCurveTo(katX - 70, katY - 50, katX - 80, katY - 10);
    // Middelste veer
    ctx.quadraticCurveTo(katX - 65, katY + 5, katX - 70, katY + 20);
    // Onderste veer
    ctx.quadraticCurveTo(katX - 50, katY + 15, katX - 45, katY + 30);
    // Terug naar lichaam
    ctx.quadraticCurveTo(katX - 30, katY + 20, katX - 20, katY);
    ctx.fill();
    // Veer details
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(katX - 25, katY);
    ctx.lineTo(katX - 70, katY - 30);
    ctx.moveTo(katX - 28, katY + 5);
    ctx.lineTo(katX - 60, katY + 10);
    ctx.moveTo(katX - 30, katY + 12);
    ctx.lineTo(katX - 50, katY + 25);
    ctx.stroke();

    // Rechter vleugel
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(katX + 20, katY);
    // Grote buitenste veer
    ctx.quadraticCurveTo(katX + 70, katY - 50, katX + 80, katY - 10);
    // Middelste veer
    ctx.quadraticCurveTo(katX + 65, katY + 5, katX + 70, katY + 20);
    // Onderste veer
    ctx.quadraticCurveTo(katX + 50, katY + 15, katX + 45, katY + 30);
    // Terug naar lichaam
    ctx.quadraticCurveTo(katX + 30, katY + 20, katX + 20, katY);
    ctx.fill();
    // Veer details
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(katX + 25, katY);
    ctx.lineTo(katX + 70, katY - 30);
    ctx.moveTo(katX + 28, katY + 5);
    ctx.lineTo(katX + 60, katY + 10);
    ctx.moveTo(katX + 30, katY + 12);
    ctx.lineTo(katX + 50, katY + 25);
    ctx.stroke();
  }

  // Staart (gekruld, dikker per level)
  ctx.strokeStyle = '#ff9933';
  ctx.lineWidth = 8 * dikheid;
  ctx.beginPath();
  ctx.moveTo(katX + 25 * dikheid, katY + 15);
  ctx.quadraticCurveTo(katX + 60 * dikheid, katY, katX + 50 * dikheid, katY - 20);
  ctx.stroke();

  // Dik lichaam (oranje, groeit per level!)
  ctx.fillStyle = '#ff9933';
  ctx.beginPath();
  ctx.ellipse(katX, katY + 10, 30 * dikheid, 25 * dikheid, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spieren als de kat sterk is!
  if (katIsSterk) {
    // Linker arm spier
    ctx.fillStyle = '#ff9933';
    ctx.beginPath();
    ctx.ellipse(katX - 35, katY + 5, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Bicep
    ctx.fillStyle = '#ff8020';
    ctx.beginPath();
    ctx.ellipse(katX - 38, katY + 2, 8, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Rechter arm spier
    ctx.fillStyle = '#ff9933';
    ctx.beginPath();
    ctx.ellipse(katX + 35, katY + 5, 12, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Bicep
    ctx.fillStyle = '#ff8020';
    ctx.beginPath();
    ctx.ellipse(katX + 38, katY + 2, 8, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Sixpack lijnen op buik
    ctx.strokeStyle = '#ff8020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(katX, katY);
    ctx.lineTo(katX, katY + 20);
    ctx.moveTo(katX - 8, katY + 5);
    ctx.lineTo(katX - 8, katY + 15);
    ctx.moveTo(katX + 8, katY + 5);
    ctx.lineTo(katX + 8, katY + 15);
    ctx.stroke();
  }

  // Hoofd (groeit een beetje mee)
  ctx.beginPath();
  ctx.arc(katX, katY - 15, 20 * (1 + (level - 1) * 0.05), 0, Math.PI * 2);
  ctx.fill();

  // Oren (grote driehoekjes die boven het hoofd uitsteken)
  ctx.beginPath();
  ctx.moveTo(katX - 12, katY - 45);
  ctx.lineTo(katX - 3, katY - 25);
  ctx.lineTo(katX - 21, katY - 25);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(katX + 12, katY - 45);
  ctx.lineTo(katX + 3, katY - 25);
  ctx.lineTo(katX + 21, katY - 25);
  ctx.closePath();
  ctx.fill();

  // Ogen
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(katX - 8, katY - 18, 5, 0, Math.PI * 2);
  ctx.arc(katX + 8, katY - 18, 5, 0, Math.PI * 2);
  ctx.fill();

  // Pupillen
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(katX - 8, katY - 18, 2, 0, Math.PI * 2);
  ctx.arc(katX + 8, katY - 18, 2, 0, Math.PI * 2);
  ctx.fill();

  // Neus (roze driehoekje)
  ctx.fillStyle = '#ff6b9d';
  ctx.beginPath();
  ctx.moveTo(katX, katY - 10);
  ctx.lineTo(katX - 4, katY - 5);
  ctx.lineTo(katX + 4, katY - 5);
  ctx.fill();

  // Snorharen
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(katX - 10, katY - 8);
  ctx.lineTo(katX - 25, katY - 12);
  ctx.moveTo(katX - 10, katY - 5);
  ctx.lineTo(katX - 25, katY - 5);
  ctx.moveTo(katX + 10, katY - 8);
  ctx.lineTo(katX + 25, katY - 12);
  ctx.moveTo(katX + 10, katY - 5);
  ctx.lineTo(katX + 25, katY - 5);
  ctx.stroke();

  // === KLEDING VOOR DE KAT ===

  // Level 2+: Hoedje
  if (level >= 2) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(katX, katY - 65);
    ctx.lineTo(katX - 15, katY - 45);
    ctx.lineTo(katX + 15, katY - 45);
    ctx.closePath();
    ctx.fill();
    // Rand van hoed
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(katX - 18, katY - 48, 36, 6);
  }

  // Level 3+: Strikje
  if (level >= 3) {
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.ellipse(katX - 10, katY + 5, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(katX + 10, katY + 5, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(katX, katY + 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level 4+: Sjaal
  if (level >= 4) {
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(katX - 25, katY, 50, 8);
    ctx.fillRect(katX + 20, katY, 8, 30);
    // Strepen op sjaal
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(katX - 20, katY + 2, 8, 4);
    ctx.fillRect(katX - 5, katY + 2, 8, 4);
    ctx.fillRect(katX + 10, katY + 2, 8, 4);
  }

  // Level 5+: Kroon
  if (level >= 5) {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(katX - 15, katY - 50);
    ctx.lineTo(katX - 15, katY - 65);
    ctx.lineTo(katX - 8, katY - 55);
    ctx.lineTo(katX, katY - 70);
    ctx.lineTo(katX + 8, katY - 55);
    ctx.lineTo(katX + 15, katY - 65);
    ctx.lineTo(katX + 15, katY - 50);
    ctx.closePath();
    ctx.fill();
    // Diamantjes op kroon
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(katX, katY - 58, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level 6+: Zonnebril
  if (level >= 6) {
    ctx.fillStyle = 'black';
    // Linker glas
    ctx.beginPath();
    ctx.ellipse(katX - 8, katY - 18, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rechter glas
    ctx.beginPath();
    ctx.ellipse(katX + 8, katY - 18, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Brug
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(katX - 2, katY - 18);
    ctx.lineTo(katX + 2, katY - 18);
    ctx.stroke();
  }

  // Level 8+: Toverstaf
  if (level >= 8) {
    // Staf
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(katX + 30 * dikheid, katY - 10);
    ctx.lineTo(katX + 50 * dikheid, katY - 40);
    ctx.stroke();
    // Ster
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(katX + 52 * dikheid, katY - 45, 8, 0, Math.PI * 2);
    ctx.fill();
    // Glitter
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(katX + 48 * dikheid, katY - 48, 2, 0, Math.PI * 2);
    ctx.arc(katX + 56 * dikheid, katY - 42, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level 10: Regenboog aura!
  if (level >= 10) {
    const regenboogKleuren = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    for (let i = 0; i < regenboogKleuren.length; i++) {
      ctx.strokeStyle = regenboogKleuren[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(katX, katY, 35 * dikheid + i * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
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
