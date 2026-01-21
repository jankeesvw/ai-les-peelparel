// === MIJN GAME ===

// Pak het canvas en de "pen" om mee te tekenen
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// === SPELER ===
const speler = {
  x: 50,
  y: 440,
  breedte: 50,
  hoogte: 50,
  kleur: 'red',
  snelheid: 5,
  isGeschoren: false
};

// === KAPPER ===
const kapper = {
  x: 700,
  y: 280,
  breedte: 80,
  hoogte: 90
};

// === KOGELS ===
const kogels = [];

// === VIJANDEN (WOLVEN) ===
const wolven = [];
let wolfTimer = 0;

// === SCORE ===
let score = 0;

// === WOLKEN (parallax) ===
const wolken = [
  { x: 100, y: 60, grootte: 1, snelheid: 0.3 },
  { x: 500, y: 80, grootte: 0.8, snelheid: 0.2 },
  { x: 300, y: 40, grootte: 1.2, snelheid: 0.5 },
  { x: 650, y: 100, grootte: 0.6, snelheid: 0.15 }
];

// === BOMMEN ===
const bommen = [];
let bomTimer = 0;

// === EXPLOSIES ===
const explosies = [];

// === TIJDBALK ===
let tijdOver = 100; // 100% vol
const maxTijd = 100;

// === LEVENS ===
let levens = 3;
let gameOver = false;
let onkwetsbaar = 0; // Korte onkwetsbaarheid na geraakt worden

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

  // Schieten met spatiebalk
  if (e.key === ' ') {
    if (gameOver) {
      // Herstart het spel
      levens = 3;
      score = 0;
      tijdOver = 100;
      gameOver = false;
      speler.x = 50;
      speler.y = 440;
      speler.isGeschoren = false;
      wolven.length = 0;
      kogels.length = 0;
      bommen.length = 0;
      explosies.length = 0;
    } else {
      kogels.push({
        x: speler.x + speler.breedte,
        y: speler.y + speler.hoogte / 2,
        snelheid: 10
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

  // Check of schaapje bij de kapper is
  if (speler.x + speler.breedte > kapper.x &&
      speler.x < kapper.x + kapper.breedte &&
      speler.y + speler.hoogte > kapper.y &&
      speler.y < kapper.y + kapper.hoogte) {
    speler.isGeschoren = true;
  }

  // === KOGELS BEWEGEN ===
  for (let i = kogels.length - 1; i >= 0; i--) {
    kogels[i].x += kogels[i].snelheid;
    // Verwijder kogels die buiten beeld zijn
    if (kogels[i].x > canvas.width) {
      kogels.splice(i, 1);
    }
  }

  // === WOLVEN SPAWNEN ===
  wolfTimer++;
  if (wolfTimer > 90) { // Elke 1.5 seconde een nieuwe wolf
    wolven.push({
      x: canvas.width,
      y: 420 + Math.random() * 100,
      snelheid: 2 + Math.random() * 2
    });
    wolfTimer = 0;
  }

  // === WOLVEN BEWEGEN ===
  for (let i = wolven.length - 1; i >= 0; i--) {
    wolven[i].x -= wolven[i].snelheid;
    // Verwijder wolven die links buiten beeld zijn
    if (wolven[i].x < -50) {
      wolven.splice(i, 1);
    }
  }

  // === KOGEL RAAKT WOLF ===
  for (let ki = kogels.length - 1; ki >= 0; ki--) {
    for (let wi = wolven.length - 1; wi >= 0; wi--) {
      if (kogels[ki] && wolven[wi]) {
        const k = kogels[ki];
        const w = wolven[wi];
        if (k.x > w.x && k.x < w.x + 50 &&
            k.y > w.y && k.y < w.y + 40) {
          // Raak!
          kogels.splice(ki, 1);
          wolven.splice(wi, 1);
          score += 10;
          break;
        }
      }
    }
  }

  // === WOLKEN BEWEGEN (parallax) ===
  for (const wolk of wolken) {
    wolk.x += wolk.snelheid;
    // Als wolk rechts buiten beeld is, weer links beginnen
    if (wolk.x > canvas.width + 100) {
      wolk.x = -100;
    }
  }

  // === BOMMEN SPAWNEN (elke 10 seconden = 600 frames) ===
  bomTimer++;
  if (bomTimer >= 600) {
    bommen.push({
      x: 100 + Math.random() * 600,
      y: -30,
      snelheid: 3
    });
    bomTimer = 0;
  }

  // === BOMMEN LATEN VALLEN ===
  for (let i = bommen.length - 1; i >= 0; i--) {
    bommen[i].y += bommen[i].snelheid;
    bommen[i].snelheid += 0.1; // Versnelling (zwaartekracht)

    // Als bom de grond raakt - EXPLOSIE!
    if (bommen[i].y > 480) {
      // Maak een explosie
      explosies.push({
        x: bommen[i].x,
        y: 480,
        grootte: 0,
        maxGrootte: 150,
        fase: 0
      });
      bommen.splice(i, 1);
    }
  }

  // === EXPLOSIES UPDATEN ===
  for (let i = explosies.length - 1; i >= 0; i--) {
    explosies[i].fase += 1;
    explosies[i].grootte = Math.min(explosies[i].grootte + 8, explosies[i].maxGrootte);

    // Explosie verdwijnt na 60 frames
    if (explosies[i].fase > 60) {
      explosies.splice(i, 1);
    }
  }

  // === TIJD LOOPT AF ===
  if (tijdOver > 0) {
    tijdOver -= 0.05; // Langzaam aftellen
  }

  // === ONKWETSBAARHEID AFTELLEN ===
  if (onkwetsbaar > 0) {
    onkwetsbaar--;
  }

  // === CHECK OF STITCH SPELER RAAKT ===
  if (onkwetsbaar === 0) {
    for (let i = wolven.length - 1; i >= 0; i--) {
      const w = wolven[i];
      if (speler.x < w.x + 50 &&
          speler.x + speler.breedte > w.x &&
          speler.y < w.y + 50 &&
          speler.y + speler.hoogte > w.y) {
        // Geraakt door Stitch!
        levens--;
        onkwetsbaar = 120; // 2 seconden onkwetsbaar
        wolven.splice(i, 1);
        if (levens <= 0) {
          gameOver = true;
        }
        break;
      }
    }
  }

  // === CHECK OF EXPLOSIE SPELER RAAKT ===
  if (onkwetsbaar === 0) {
    for (const exp of explosies) {
      const afstand = Math.sqrt(
        Math.pow(speler.x + speler.breedte/2 - exp.x, 2) +
        Math.pow(speler.y + speler.hoogte/2 - exp.y, 2)
      );
      if (afstand < exp.grootte * 0.8) {
        // Geraakt door explosie!
        levens--;
        onkwetsbaar = 120;
        if (levens <= 0) {
          gameOver = true;
        }
        break;
      }
    }
  }

  // === TIJD OP = GAME OVER ===
  if (tijdOver <= 0 && !gameOver) {
    gameOver = true;
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Maak het scherm leeg
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === STAD ACHTERGROND ===

  // Lucht
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wolken (parallax - realistisch met schaduwen)
  for (const wolk of wolken) {
    const g = wolk.grootte;
    const wx = wolk.x;
    const wy = wolk.y;

    // Schaduw onderaan de wolk
    ctx.fillStyle = 'rgba(180, 180, 190, 0.6)';
    ctx.beginPath();
    ctx.arc(wx + 5 * g, wy + 12 * g, 28 * g, 0, Math.PI * 2);
    ctx.arc(wx + 35 * g, wy + 8 * g, 32 * g, 0, Math.PI * 2);
    ctx.arc(wx + 65 * g, wy + 12 * g, 26 * g, 0, Math.PI * 2);
    ctx.fill();

    // Hoofdvorm van de wolk (lichtgrijs)
    ctx.fillStyle = 'rgba(245, 245, 250, 0.95)';
    ctx.beginPath();
    ctx.arc(wx, wy, 30 * g, 0, Math.PI * 2);
    ctx.arc(wx + 25 * g, wy - 15 * g, 28 * g, 0, Math.PI * 2);
    ctx.arc(wx + 55 * g, wy - 8 * g, 32 * g, 0, Math.PI * 2);
    ctx.arc(wx + 75 * g, wy + 5 * g, 24 * g, 0, Math.PI * 2);
    ctx.arc(wx + 40 * g, wy + 5 * g, 26 * g, 0, Math.PI * 2);
    ctx.fill();

    // Lichte highlights bovenop
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(wx + 20 * g, wy - 20 * g, 20 * g, 0, Math.PI * 2);
    ctx.arc(wx + 50 * g, wy - 15 * g, 22 * g, 0, Math.PI * 2);
    ctx.fill();

    // Extra pluizige details
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(wx - 10 * g, wy + 5 * g, 15 * g, 0, Math.PI * 2);
    ctx.arc(wx + 80 * g, wy + 10 * g, 12 * g, 0, Math.PI * 2);
    ctx.fill();
  }

  // === REALISTISCHE STAD ===

  // Achterste gebouwen (silhouetten voor diepte)
  ctx.fillStyle = 'rgba(100, 110, 130, 0.4)';
  ctx.fillRect(0, 200, 30, 170);
  ctx.fillRect(600, 180, 40, 190);
  ctx.fillRect(780, 220, 30, 150);

  // Gebouw 1 - Blauw appartement met baksteen effect
  // Schaduw
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(25, 185, 80, 190);
  // Hoofdgebouw
  ctx.fillStyle = '#3D6B99';
  ctx.fillRect(20, 180, 80, 190);
  // Lichtere zijkant
  ctx.fillStyle = '#5A8ABF';
  ctx.fillRect(20, 180, 15, 190);
  // Dakrand
  ctx.fillStyle = '#2C4F73';
  ctx.fillRect(18, 175, 84, 8);
  // Ramen met kozijnen en reflectie
  for (let ry = 0; ry < 4; ry++) {
    for (let rx = 0; rx < 2; rx++) {
      // Kozijn
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(28 + rx * 40, 193 + ry * 45, 29, 34);
      // Glas met gradient effect
      ctx.fillStyle = '#1a3a5c';
      ctx.fillRect(30 + rx * 40, 195 + ry * 45, 25, 30);
      // Licht reflectie
      ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
      ctx.fillRect(30 + rx * 40, 195 + ry * 45, 10, 30);
      // Warm licht binnen (sommige ramen)
      if ((ry + rx) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 220, 150, 0.6)';
        ctx.fillRect(32 + rx * 40, 197 + ry * 45, 21, 26);
      }
    }
  }

  // Gebouw 2 - Bakstenen huis
  // Schaduw
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(125, 235, 70, 140);
  // Hoofdgebouw
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(120, 230, 70, 140);
  // Bakstenen textuur
  ctx.fillStyle = 'rgba(139, 90, 43, 0.8)';
  for (let by = 0; by < 14; by++) {
    for (let bx = 0; bx < 7; bx++) {
      if (by % 2 === 0) {
        ctx.fillRect(121 + bx * 10, 232 + by * 10, 9, 9);
      } else {
        ctx.fillRect(126 + bx * 10, 232 + by * 10, 9, 9);
      }
    }
  }
  // Dak met schaduw
  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  ctx.moveTo(110, 230);
  ctx.lineTo(155, 175);
  ctx.lineTo(200, 230);
  ctx.fill();
  ctx.fillStyle = '#5d4a3a';
  ctx.beginPath();
  ctx.moveTo(110, 230);
  ctx.lineTo(155, 175);
  ctx.lineTo(155, 230);
  ctx.fill();
  // Schoorsteen
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(165, 185, 12, 30);
  // Raam met kozijn
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(133, 248, 44, 34);
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(135, 250, 40, 30);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(135, 250, 15, 30);
  // Raamkruis
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(153, 250, 3, 30);
  ctx.fillRect(135, 263, 40, 3);
  // Deur met details
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(145, 318, 25, 52);
  ctx.fillStyle = '#3d2820';
  ctx.fillRect(147, 320, 21, 48);
  // Deurknop
  ctx.fillStyle = '#c9a030';
  ctx.beginPath();
  ctx.arc(163, 347, 3, 0, Math.PI * 2);
  ctx.fill();

  // Gebouw 3 - Moderne winkel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(215, 265, 90, 110);
  ctx.fillStyle = '#4a8068';
  ctx.fillRect(210, 260, 90, 110);
  // Lichtere zijkant
  ctx.fillStyle = '#5DAE8B';
  ctx.fillRect(210, 260, 12, 110);
  // Luifel met schaduw
  ctx.fillStyle = '#2d5c4a';
  ctx.fillRect(208, 250, 94, 15);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(210, 265, 90, 8);
  // Grote etalage met reflectie
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(218, 278, 74, 54);
  ctx.fillStyle = '#1a4a5c';
  ctx.fillRect(220, 280, 70, 50);
  // Reflectie
  ctx.fillStyle = 'rgba(135, 206, 235, 0.25)';
  ctx.beginPath();
  ctx.moveTo(220, 280);
  ctx.lineTo(250, 280);
  ctx.lineTo(220, 330);
  ctx.fill();
  // Winkel deur
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(243, 328, 34, 42);
  ctx.fillStyle = '#2a5a6c';
  ctx.fillRect(245, 330, 30, 38);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(245, 330, 12, 38);

  // Gebouw 4 - Hoge flat
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(325, 155, 70, 220);
  ctx.fillStyle = '#7a5a8a';
  ctx.fillRect(320, 150, 70, 220);
  ctx.fillStyle = '#9B72AA';
  ctx.fillRect(320, 150, 12, 220);
  // Dakrand
  ctx.fillStyle = '#5a4a6a';
  ctx.fillRect(318, 145, 74, 8);
  // Ramen
  for (let ry = 0; ry < 5; ry++) {
    for (let rx = 0; rx < 2; rx++) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(333 + rx * 25, 163 + ry * 40, 22, 28);
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(335 + rx * 25, 165 + ry * 40, 18, 24);
      ctx.fillStyle = 'rgba(135, 206, 235, 0.2)';
      ctx.fillRect(335 + rx * 25, 165 + ry * 40, 7, 24);
      if (ry % 2 === rx % 2) {
        ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.fillRect(337 + rx * 25, 167 + ry * 40, 14, 20);
      }
    }
  }

  // Gebouw 5 - Gele winkel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(415, 295, 80, 80);
  ctx.fillStyle = '#c4a030';
  ctx.fillRect(410, 290, 80, 80);
  ctx.fillStyle = '#e4c040';
  ctx.fillRect(410, 290, 12, 80);
  // Luifel
  ctx.fillStyle = '#b58900';
  ctx.fillRect(408, 280, 84, 15);
  // Ramen
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(418, 303, 27, 27);
  ctx.fillRect(453, 303, 27, 27);
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(420, 305, 23, 23);
  ctx.fillRect(455, 305, 23, 23);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(420, 305, 8, 23);
  ctx.fillRect(455, 305, 8, 23);
  // Deur
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(438, 338, 27, 32);
  ctx.fillStyle = '#3d2820';
  ctx.fillRect(440, 340, 23, 28);

  // Gebouw 6 - Bakkerij
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(515, 275, 75, 100);
  ctx.fillStyle = '#d4899a';
  ctx.fillRect(510, 270, 75, 100);
  ctx.fillStyle = '#e8a0b0';
  ctx.fillRect(510, 270, 12, 100);
  // Dak
  ctx.fillStyle = '#a06070';
  ctx.beginPath();
  ctx.moveTo(505, 270);
  ctx.lineTo(547, 225);
  ctx.lineTo(590, 270);
  ctx.fill();
  ctx.fillStyle = '#b87080';
  ctx.beginPath();
  ctx.moveTo(505, 270);
  ctx.lineTo(547, 225);
  ctx.lineTo(547, 270);
  ctx.fill();
  // Ramen
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(523, 288, 22, 27);
  ctx.fillRect(553, 288, 22, 27);
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(525, 290, 18, 23);
  ctx.fillRect(555, 290, 18, 23);
  ctx.fillStyle = 'rgba(255, 200, 150, 0.4)';
  ctx.fillRect(527, 292, 14, 19);
  ctx.fillRect(557, 292, 14, 19);
  // Deur
  ctx.fillStyle = '#4a2a20';
  ctx.fillRect(533, 333, 27, 37);
  ctx.fillStyle = '#5a3a30';
  ctx.fillRect(535, 335, 23, 33);
  // Brood uithangbord
  ctx.fillStyle = '#c9a030';
  ctx.beginPath();
  ctx.ellipse(547, 315, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === TIJDBALK (waar het gras was) ===
  const balkBreedte = 150;
  const balkHoogte = 25;
  const balkX = 10;
  const balkY = 372;
  const vulling = (tijdOver / maxTijd) * balkBreedte;

  // Achtergrond van de balk (leeg/donker)
  ctx.fillStyle = '#333';
  ctx.fillRect(balkX, balkY, balkBreedte, balkHoogte);

  // Gekleurde vulling (verandert van groen naar rood)
  let kleur;
  if (tijdOver > 60) {
    kleur = '#4CAF50'; // Groen
  } else if (tijdOver > 30) {
    kleur = '#FFC107'; // Geel/oranje
  } else {
    kleur = '#F44336'; // Rood
  }
  ctx.fillStyle = kleur;
  ctx.fillRect(balkX, balkY, vulling, balkHoogte);

  // Glans effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(balkX, balkY, vulling, balkHoogte / 3);

  // Rand om de balk
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(balkX, balkY, balkBreedte, balkHoogte);

  // Tekst "TIJD"
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('TIJD', balkX + 55, balkY + 17);

  // Knipperen als tijd bijna op is
  if (tijdOver < 20 && Math.floor(Date.now() / 200) % 2 === 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(balkX, balkY, balkBreedte, balkHoogte);
  }

  // Stoep met tegels
  ctx.fillStyle = '#a0a0a0';
  ctx.fillRect(0, 400, canvas.width, 30);
  ctx.fillStyle = '#b8b8b8';
  for (let tx = 0; tx < 20; tx++) {
    ctx.fillRect(tx * 42, 402, 40, 26);
  }
  // Stoeprand
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 428, canvas.width, 4);

  // Weg met asfalt textuur
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 432, canvas.width, 168);
  // Asfalt details
  ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
  for (let i = 0; i < 50; i++) {
    ctx.fillRect(Math.random() * canvas.width, 435 + Math.random() * 160, 3, 2);
  }

  // Witte strepen op de weg
  ctx.fillStyle = '#f0f0f0';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(20 + i * 85, 512, 50, 6);
  }
  // Gele lijnen aan de zijkant
  ctx.fillStyle = '#e8c030';
  ctx.fillRect(0, 435, canvas.width, 3);
  ctx.fillRect(0, 595, canvas.width, 5);


  // === SCHOOL ===
  const schoolX = 595;
  const schoolY = 200;

  // Schaduw
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(schoolX + 5, schoolY + 5, 200, 170);

  // Hoofdgebouw (rood bakstenen)
  ctx.fillStyle = '#a63c32';
  ctx.fillRect(schoolX, schoolY, 200, 170);

  // Lichtere zijkant
  ctx.fillStyle = '#c64c42';
  ctx.fillRect(schoolX, schoolY, 20, 170);

  // Bakstenen textuur
  ctx.fillStyle = 'rgba(140, 50, 40, 0.5)';
  for (let by = 0; by < 17; by++) {
    for (let bx = 0; bx < 20; bx++) {
      if (by % 2 === 0) {
        ctx.fillRect(schoolX + 1 + bx * 10, schoolY + 2 + by * 10, 9, 9);
      } else {
        ctx.fillRect(schoolX + 6 + bx * 10, schoolY + 2 + by * 10, 9, 9);
      }
    }
  }

  // Dak
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(schoolX - 5, schoolY - 15, 210, 20);
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(schoolX - 5, schoolY - 15, 210, 8);

  // Ramen (3x2 grid)
  for (let ry = 0; ry < 2; ry++) {
    for (let rx = 0; rx < 3; rx++) {
      // Kozijn
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(schoolX + 20 + rx * 60, schoolY + 40 + ry * 60, 42, 45);
      // Glas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(schoolX + 22 + rx * 60, schoolY + 42 + ry * 60, 38, 41);
      // Raamkruis
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(schoolX + 40 + rx * 60, schoolY + 42 + ry * 60, 3, 41);
      ctx.fillRect(schoolX + 22 + rx * 60, schoolY + 60 + ry * 60, 38, 3);
      // Reflectie
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(schoolX + 23 + rx * 60, schoolY + 43 + ry * 60, 12, 38);
    }
  }

  // Grote ingang
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(schoolX + 80, schoolY + 120, 45, 50);
  ctx.fillStyle = '#3d2820';
  ctx.fillRect(schoolX + 82, schoolY + 122, 41, 46);
  // Deur details (twee deuren)
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(schoolX + 102, schoolY + 122, 2, 46);
  // Raam in deur
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(schoolX + 86, schoolY + 128, 14, 20);
  ctx.fillRect(schoolX + 106, schoolY + 128, 14, 20);

  // Trap naar de ingang
  ctx.fillStyle = '#808080';
  ctx.fillRect(schoolX + 70, schoolY + 165, 65, 8);
  ctx.fillStyle = '#909090';
  ctx.fillRect(schoolX + 75, schoolY + 160, 55, 8);

  // Klok boven de deur
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(schoolX + 102, schoolY + 25, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(schoolX + 102, schoolY + 25, 15, 0, Math.PI * 2);
  ctx.stroke();
  // Wijzers
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(schoolX + 102, schoolY + 25);
  ctx.lineTo(schoolX + 102, schoolY + 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(schoolX + 102, schoolY + 25);
  ctx.lineTo(schoolX + 110, schoolY + 25);
  ctx.stroke();

  // Bord "SCHOOL"
  ctx.fillStyle = '#2a5a2a';
  ctx.fillRect(schoolX + 60, schoolY - 10, 85, 22);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('SCHOOL', schoolX + 70, schoolY + 6);

  // Vlaggenstok
  ctx.fillStyle = '#888';
  ctx.fillRect(schoolX + 190, schoolY - 50, 4, 60);
  // Vlag (Nederlands)
  ctx.fillStyle = '#AE1C28';
  ctx.fillRect(schoolX + 194, schoolY - 48, 30, 8);
  ctx.fillStyle = 'white';
  ctx.fillRect(schoolX + 194, schoolY - 40, 30, 8);
  ctx.fillStyle = '#21468B';
  ctx.fillRect(schoolX + 194, schoolY - 32, 30, 8);

  // Schoolbel
  ctx.fillStyle = '#c9a030';
  ctx.beginPath();
  ctx.arc(schoolX + 130, schoolY + 115, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a08020';
  ctx.fillRect(schoolX + 128, schoolY + 108, 4, 8);

  // Lantaarnpaal realistisch
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(299, 318, 8, 82);
  // Arm
  ctx.fillRect(295, 318, 20, 5);
  // Lamp behuizing
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(292, 308, 12, 12);
  // Lichtbol
  ctx.fillStyle = '#fff8e0';
  ctx.beginPath();
  ctx.arc(298, 314, 6, 0, Math.PI * 2);
  ctx.fill();
  // Lichtgloed
  ctx.fillStyle = 'rgba(255, 250, 200, 0.15)';
  ctx.beginPath();
  ctx.arc(298, 314, 25, 0, Math.PI * 2);
  ctx.fill();

  // === EINDE STAD ===

  // === TEKEN AARDBEIEN (kogels) ===
  for (const kogel of kogels) {
    // Rode aardbei vorm
    ctx.fillStyle = '#FF3333';
    ctx.beginPath();
    ctx.moveTo(kogel.x, kogel.y - 8);
    ctx.bezierCurveTo(kogel.x - 10, kogel.y - 4, kogel.x - 8, kogel.y + 10, kogel.x, kogel.y + 12);
    ctx.bezierCurveTo(kogel.x + 8, kogel.y + 10, kogel.x + 10, kogel.y - 4, kogel.x, kogel.y - 8);
    ctx.fill();

    // Groene blaadjes
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(kogel.x - 4, kogel.y - 9, 4, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(kogel.x + 4, kogel.y - 9, 4, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(kogel.x, kogel.y - 10, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zaadjes
    ctx.fillStyle = '#FFFF99';
    ctx.beginPath();
    ctx.ellipse(kogel.x - 3, kogel.y, 1.5, 1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(kogel.x + 3, kogel.y + 2, 1.5, 1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(kogel.x, kogel.y + 6, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === TEKEN STITCH ===
  for (const wolf of wolven) {
    const sx = wolf.x + 25;
    const sy = wolf.y + 20;

    // Schaduw
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 28, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grote oren (achter het hoofd)
    ctx.fillStyle = '#2856a4';
    ctx.beginPath();
    ctx.ellipse(sx - 22, sy - 15, 12, 22, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 22, sy - 15, 12, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Oor binnenkant (roze)
    ctx.fillStyle = '#e8a0c0';
    ctx.beginPath();
    ctx.ellipse(sx - 22, sy - 15, 6, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 22, sy - 15, 6, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Lijf (blauw)
    ctx.fillStyle = '#3a6fd8';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 12, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Buik (lichtblauw)
    ctx.fillStyle = '#7eb8ff';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 14, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pootjes
    ctx.fillStyle = '#3a6fd8';
    ctx.beginPath();
    ctx.ellipse(sx - 10, sy + 25, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 10, sy + 25, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armpjes
    ctx.beginPath();
    ctx.ellipse(sx - 18, sy + 10, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 18, sy + 10, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Hoofd
    ctx.fillStyle = '#3a6fd8';
    ctx.beginPath();
    ctx.ellipse(sx, sy - 5, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gezichtsvlak (lichtblauw)
    ctx.fillStyle = '#7eb8ff';
    ctx.beginPath();
    ctx.ellipse(sx, sy - 2, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ogen (groot en zwart)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(sx - 7, sy - 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 7, sy - 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Oog glinstering
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(sx - 5, sy - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + 9, sy - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Neus
    ctx.fillStyle = '#4a2a60';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Neus glans
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(sx - 1, sy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mond (grote grijns)
    ctx.strokeStyle = '#2a1a40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy + 5, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Haar/antennes op hoofd
    ctx.fillStyle = '#2856a4';
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 20);
    ctx.lineTo(sx - 8, sy - 30);
    ctx.lineTo(sx - 2, sy - 20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + 5, sy - 20);
    ctx.lineTo(sx + 8, sy - 30);
    ctx.lineTo(sx + 2, sy - 20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx - 1, sy - 20);
    ctx.lineTo(sx, sy - 32);
    ctx.lineTo(sx + 1, sy - 20);
    ctx.fill();
  }

  // === TEKEN NUKE BOMMEN ===
  for (const bom of bommen) {
    const bx = bom.x;
    const by = bom.y;

    // Schaduw
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 45, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raket body (grijs/metaal)
    ctx.fillStyle = '#606060';
    ctx.beginPath();
    ctx.moveTo(bx, by - 35);
    ctx.lineTo(bx - 12, by + 20);
    ctx.lineTo(bx + 12, by + 20);
    ctx.closePath();
    ctx.fill();

    // Neus (punt - rood)
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(bx, by - 35);
    ctx.lineTo(bx - 6, by - 15);
    ctx.lineTo(bx + 6, by - 15);
    ctx.closePath();
    ctx.fill();

    // Body details
    ctx.fillStyle = '#808080';
    ctx.fillRect(bx - 10, by - 10, 20, 25);

    // Glans op de raket
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(bx - 8, by - 30, 5, 45);

    // Radioactief symbool
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();

    // Vinnen (staart)
    ctx.fillStyle = '#cc0000';
    // Linker vin
    ctx.beginPath();
    ctx.moveTo(bx - 10, by + 15);
    ctx.lineTo(bx - 20, by + 35);
    ctx.lineTo(bx - 10, by + 25);
    ctx.closePath();
    ctx.fill();
    // Rechter vin
    ctx.beginPath();
    ctx.moveTo(bx + 10, by + 15);
    ctx.lineTo(bx + 20, by + 35);
    ctx.lineTo(bx + 10, by + 25);
    ctx.closePath();
    ctx.fill();

    // Vuur uit de raket
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(bx - 6, by + 20);
    ctx.lineTo(bx, by + 40);
    ctx.lineTo(bx + 6, by + 20);
    ctx.fill();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + 20);
    ctx.lineTo(bx, by + 32);
    ctx.lineTo(bx + 4, by + 20);
    ctx.fill();
  }

  // === TEKEN EXPLOSIES ===
  for (const exp of explosies) {
    const g = exp.grootte;
    const fade = 1 - (exp.fase / 60);

    // Paddenstoel wolk - stam
    ctx.fillStyle = `rgba(80, 80, 80, ${fade * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(exp.x - 20, exp.y);
    ctx.lineTo(exp.x - 30 - g * 0.2, exp.y - g * 0.8);
    ctx.lineTo(exp.x + 30 + g * 0.2, exp.y - g * 0.8);
    ctx.lineTo(exp.x + 20, exp.y);
    ctx.fill();

    // Vuurbal (groot)
    ctx.fillStyle = `rgba(255, 100, 0, ${fade * 0.7})`;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y - g * 0.8, g * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Oranje gloed
    ctx.fillStyle = `rgba(255, 150, 0, ${fade * 0.6})`;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y - g * 0.8, g * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Gele kern
    ctx.fillStyle = `rgba(255, 255, 0, ${fade * 0.8})`;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y - g * 0.8, g * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Witte hitte kern
    ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y - g * 0.8, g * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Paddenstoel kop (bovenste wolk)
    ctx.fillStyle = `rgba(100, 100, 100, ${fade * 0.6})`;
    ctx.beginPath();
    ctx.arc(exp.x - g * 0.3, exp.y - g, g * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(exp.x + g * 0.3, exp.y - g, g * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(exp.x, exp.y - g * 1.1, g * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Schokgolf ring
    ctx.strokeStyle = `rgba(255, 200, 100, ${fade * 0.5})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, g * 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === TEKEN SCORE ===
  ctx.fillStyle = 'white';
  ctx.fillRect(10, 10, 120, 35);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 120, 35);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Score: ' + score, 20, 35);

  // === TEKEN LEVENS (hartjes) ===
  for (let i = 0; i < 3; i++) {
    const hx = 150 + i * 35;
    const hy = 27;

    if (i < levens) {
      // Vol hartje (rood)
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 5);
      ctx.bezierCurveTo(hx, hy, hx - 12, hy, hx - 12, hy + 8);
      ctx.bezierCurveTo(hx - 12, hy + 15, hx, hy + 22, hx, hy + 25);
      ctx.bezierCurveTo(hx, hy + 22, hx + 12, hy + 15, hx + 12, hy + 8);
      ctx.bezierCurveTo(hx + 12, hy, hx, hy, hx, hy + 5);
      ctx.fill();

      // Glans
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(hx - 5, hy + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Leeg hartje (grijs/outline)
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 5);
      ctx.bezierCurveTo(hx, hy, hx - 12, hy, hx - 12, hy + 8);
      ctx.bezierCurveTo(hx - 12, hy + 15, hx, hy + 22, hx, hy + 25);
      ctx.bezierCurveTo(hx, hy + 22, hx + 12, hy + 15, hx + 12, hy + 8);
      ctx.bezierCurveTo(hx + 12, hy, hx, hy, hx, hy + 5);
      ctx.stroke();
    }
  }

  // === GAME OVER SCHERM ===
  if (gameOver) {
    // Donkere overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over tekst
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

    // Score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);

    // Druk op spatie
    ctx.font = '20px Arial';
    ctx.fillText('Druk op SPATIE om opnieuw te spelen', canvas.width / 2, canvas.height / 2 + 70);

    ctx.textAlign = 'left';
  }

  // === KNIPPEREN ALS ONKWETSBAAR ===
  if (onkwetsbaar > 0 && Math.floor(onkwetsbaar / 10) % 2 === 0) {
    // Rode gloed om het schaapje als het knippert
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(speler.x + speler.breedte/2, speler.y + speler.hoogte/2, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken de kapperszaak
  // Gebouw
  ctx.fillStyle = '#E8D4C4';
  ctx.fillRect(kapper.x, kapper.y, kapper.breedte, kapper.hoogte);

  // Dak
  ctx.fillStyle = '#C9302C';
  ctx.beginPath();
  ctx.moveTo(kapper.x - 10, kapper.y);
  ctx.lineTo(kapper.x + kapper.breedte / 2, kapper.y - 30);
  ctx.lineTo(kapper.x + kapper.breedte + 10, kapper.y);
  ctx.fill();

  // Deur
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(kapper.x + 35, kapper.y + 60, 30, 60);

  // Raam
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(kapper.x + 15, kapper.y + 20, 25, 25);
  ctx.fillRect(kapper.x + 60, kapper.y + 20, 25, 25);

  // Schaar boven de deur
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(kapper.x + 43, kapper.y + 50, 8, 0.5, 2.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(kapper.x + 57, kapper.y + 50, 8, 0.6 + Math.PI, 2.6 + Math.PI);
  ctx.stroke();

  // Bordje "KAPPER"
  ctx.fillStyle = 'white';
  ctx.fillRect(kapper.x + 20, kapper.y - 15, 60, 18);
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  ctx.fillText('KAPPER', kapper.x + 25, kapper.y - 2);

  // Teken het schaapje
  const x = speler.x + speler.breedte / 2;
  const y = speler.y + speler.hoogte / 2;

  // Pootjes (bruin)
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(x - 18, y + 15, 8, 15);
  ctx.fillRect(x + 10, y + 15, 8, 15);

  // Lijf
  if (speler.isGeschoren) {
    // Geschoren lijf (roze/kaal)
    ctx.fillStyle = '#FFCEB5';
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Wollig lijf (witte/crème cirkels)
    ctx.fillStyle = '#FFFEF0';
    ctx.beginPath();
    ctx.arc(x - 12, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 12, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 8, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + 8, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hoofdje (beige/roze)
  ctx.fillStyle = '#FFE4C9';
  ctx.beginPath();
  ctx.arc(x, y - 22, 12, 0, Math.PI * 2);
  ctx.fill();

  // Oortjes
  ctx.fillStyle = '#FFCEB5';
  ctx.beginPath();
  ctx.ellipse(x - 14, y - 24, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 14, y - 24, 5, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Oogjes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - 5, y - 24, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y - 24, 3, 0, Math.PI * 2);
  ctx.fill();

  // Glinstering in oogjes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x - 4, y - 25, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6, y - 25, 1, 0, Math.PI * 2);
  ctx.fill();

  // Neusje
  ctx.fillStyle = '#FFB6A3';
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

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
