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
  kleur: 'red',
  snelheid: 5
};

// === HOND ===
const hond = {
  x: 200,
  y: 200,
  snelheid: 3,
  opgegeten: false
};

// === SCORE ===
let score = 0;

// === LEVENS ===
let levens = 5;

// === SCHOOL ===
const school = {
  x: 500,
  y: 100
};

// === GAME OVER ===
let gameOver = false;

// === STITCH ===
const stitch = {
  x: 100,
  y: 450,
  opgegeten: false
};

// === HAAI ===
const haai = {
  x: 600,
  y: 400,
  kleur: 'gray',
  snelheid: 2,
  opgegeten: false
};

// === STELLETJE ===
const stelletje = {
  x: 350,
  y: 530,
  opgegeten: false
};

// === OMA EN OPA ===
const omaEnOpa = {
  x: 80,
  y: 320
};

// === GRASMAAIER ===
const grasmaaier = {
  x: 50,
  y: 500,
  snelheid: 2
};

// === TRAMPOLINE ===
const trampoline = {
  x: 700,
  y: 280
};

// === IN DE RUIMTE ===
let inDeRuimte = false;

// === STERREN ===
const sterren = [];
for (let i = 0; i < 100; i++) {
  sterren.push({
    x: Math.random() * 800,
    y: Math.random() * 600,
    grootte: Math.random() * 3 + 1
  });
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

  // Opnieuw beginnen met spatie
  if (e.key === ' ' && gameOver) {
    // Reset alles
    speler.x = 400;
    speler.y = 300;
    hond.x = 200;
    hond.y = 200;
    hond.opgegeten = false;
    haai.x = 600;
    haai.y = 400;
    haai.opgegeten = false;
    stitch.opgegeten = false;
    stelletje.opgegeten = false;
    grasmaaier.x = 50;
    grasmaaier.y = 500;
    score = 0;
    levens = 5;
    inDeRuimte = false;
    gameOver = false;
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
  // Stop als game over is
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

  // Check of speler de school raakt
  if (speler.x + speler.breedte > school.x &&
      speler.x < school.x + 200 &&
      speler.y + speler.hoogte > school.y &&
      speler.y < school.y + 120) {
    levens -= 1;
    speler.x = 400;
    speler.y = 300;
    if (levens <= 0) {
      gameOver = true;
    }
  }

  // Hond rent weg van de speler
  let afstandHondX = hond.x - (speler.x + 25);
  let afstandHondY = hond.y - (speler.y + 25);
  let afstandHond = Math.sqrt(afstandHondX * afstandHondX + afstandHondY * afstandHondY);

  // Als speler dichtbij is, rent de hond weg
  if (afstandHond < 150) {
    if (hond.x < speler.x + 25) hond.x -= hond.snelheid;
    if (hond.x > speler.x + 25) hond.x += hond.snelheid;
    if (hond.y < speler.y + 25) hond.y -= hond.snelheid;
    if (hond.y > speler.y + 25) hond.y += hond.snelheid;
  }

  // Houd hond binnen het scherm
  if (hond.x < 50) hond.x = 50;
  if (hond.x > canvas.width - 50) hond.x = canvas.width - 50;
  if (hond.y < 50) hond.y = 50;
  if (hond.y > canvas.height - 50) hond.y = canvas.height - 50;

  // Check of speler de hond aait (raakt)
  if (afstandHond < 50) {
    score += 1;
    // Zet hond op een nieuwe willekeurige plek
    hond.x = Math.random() * (canvas.width - 100) + 50;
    hond.y = Math.random() * (canvas.height - 100) + 50;
  }

  // Haai beweegt naar de speler en eet iedereen op (behalve grasmaaier)
  if (!haai.opgegeten) {
    // Haai zwemt naar de speler
    if (haai.x < speler.x + 25) haai.x += haai.snelheid;
    if (haai.x > speler.x + 25) haai.x -= haai.snelheid;
    if (haai.y < speler.y + 25) haai.y += haai.snelheid;
    if (haai.y > speler.y + 25) haai.y -= haai.snelheid;

    // Check of haai de speler opeet
    let afstandSpeler = Math.sqrt((haai.x - speler.x - 25) ** 2 + (haai.y - speler.y - 25) ** 2);
    if (afstandSpeler < 50) {
      levens -= 1;
      speler.x = 400;
      speler.y = 300;
      if (levens <= 0) {
        gameOver = true;
      }
    }

    // Check of haai de hond opeet
    if (!hond.opgegeten) {
      let afstandHondHaai = Math.sqrt((haai.x - hond.x) ** 2 + (haai.y - hond.y) ** 2);
      if (afstandHondHaai < 50) {
        hond.opgegeten = true;
      }
    }

    // Check of haai Stitch opeet
    if (!stitch.opgegeten) {
      let afstandStitch = Math.sqrt((haai.x - stitch.x) ** 2 + (haai.y - stitch.y) ** 2);
      if (afstandStitch < 50) {
        stitch.opgegeten = true;
      }
    }

    // Check of haai het stelletje opeet
    if (!stelletje.opgegeten) {
      let afstandStelletje = Math.sqrt((haai.x - stelletje.x) ** 2 + (haai.y - stelletje.y) ** 2);
      if (afstandStelletje < 50) {
        stelletje.opgegeten = true;
      }
    }
  }

  // Check of speler op de trampoline springt
  if (speler.x + speler.breedte > trampoline.x &&
      speler.x < trampoline.x + 60 &&
      speler.y + speler.hoogte > trampoline.y &&
      speler.y < trampoline.y + 20) {
    inDeRuimte = true;
  }

  // Grasmaaier beweegt naar de haai toe
  if (!haai.opgegeten) {
    if (grasmaaier.x < haai.x) grasmaaier.x += grasmaaier.snelheid;
    if (grasmaaier.x > haai.x) grasmaaier.x -= grasmaaier.snelheid;
    if (grasmaaier.y < haai.y) grasmaaier.y += grasmaaier.snelheid;
    if (grasmaaier.y > haai.y) grasmaaier.y -= grasmaaier.snelheid;

    // Check of grasmaaier de haai raakt
    let afstandX = grasmaaier.x - haai.x;
    let afstandY = grasmaaier.y - haai.y;
    let afstand = Math.sqrt(afstandX * afstandX + afstandY * afstandY);
    if (afstand < 50) {
      haai.opgegeten = true;
    }
  }
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Maak het scherm leeg
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Teken de achtergrond (oceaan of ruimte)
  if (inDeRuimte) {
    // RUIMTE!
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Teken sterren
    ctx.fillStyle = 'white';
    for (let ster of sterren) {
      ctx.beginPath();
      ctx.arc(ster.x, ster.y, ster.grootte, 0, Math.PI * 2);
      ctx.fill();
    }
    // Teken de aarde in de verte
    ctx.fillStyle = '#1E90FF';
    ctx.beginPath();
    ctx.arc(100, 500, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(80, 480, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(120, 520, 25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // OCEAAN
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Golven over het hele scherm
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 3;
    for (let y = 50; y < canvas.height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.quadraticCurveTo(x + 50, y - 15, x + 100, y);
      }
      ctx.stroke();
    }
  }

  // Teken het eiland onder de school
  if (!inDeRuimte) {
    // Zand eiland
    ctx.fillStyle = '#F4D03F';
    ctx.beginPath();
    ctx.ellipse(school.x + 100, school.y + 180, 150, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    // Palmboom
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(school.x - 30, school.y + 80, 15, 100);
    // Palmbladeren
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(school.x - 22, school.y + 70, 40, 15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(school.x - 22, school.y + 70, 40, 15, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(school.x - 22, school.y + 70, 15, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    // Kokosnoten
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(school.x - 25, school.y + 85, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(school.x - 15, school.y + 82, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken de school (achtergrond)
  // Gebouw
  ctx.fillStyle = '#D2691E';
  ctx.fillRect(school.x, school.y, 200, 120);
  // Dak (driehoek)
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.moveTo(school.x - 10, school.y);
  ctx.lineTo(school.x + 100, school.y - 50);
  ctx.lineTo(school.x + 210, school.y);
  ctx.fill();
  // Deur
  ctx.fillStyle = '#4a2c0a';
  ctx.fillRect(school.x + 80, school.y + 60, 40, 60);
  // Ramen
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(school.x + 20, school.y + 30, 35, 35);
  ctx.fillRect(school.x + 145, school.y + 30, 35, 35);
  // Tekst "SCHOOL"
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('SCHOOL', school.x + 65, school.y + 20);

  // Teken 5 meiden en 1 jongen op het eiland
  if (!inDeRuimte) {
    // Meisje 1 (roze jurk)
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(school.x + 10, school.y + 135, 15, 25);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 17, school.y + 125, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(school.x + 17, school.y + 120, 8, Math.PI, 0);
    ctx.fill();

    // Meisje 2 (paarse jurk)
    ctx.fillStyle = '#9370DB';
    ctx.fillRect(school.x + 40, school.y + 140, 15, 25);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 47, school.y + 130, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(school.x + 47, school.y + 125, 8, Math.PI, 0);
    ctx.fill();

    // Meisje 3 (gele jurk)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(school.x + 70, school.y + 135, 15, 25);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 77, school.y + 125, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(school.x + 77, school.y + 120, 8, Math.PI, 0);
    ctx.fill();

    // Meisje 4 (groene jurk)
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(school.x + 130, school.y + 140, 15, 25);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 137, school.y + 130, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(school.x + 137, school.y + 125, 8, Math.PI, 0);
    ctx.fill();

    // Meisje 5 (oranje jurk)
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(school.x + 160, school.y + 135, 15, 25);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 167, school.y + 125, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(school.x + 167, school.y + 120, 8, Math.PI, 0);
    ctx.fill();

    // Jongen (blauw shirt)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(school.x + 100, school.y + 138, 18, 28);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(school.x + 109, school.y + 128, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2F1810';
    ctx.beginPath();
    ctx.arc(school.x + 109, school.y + 123, 9, Math.PI, 0);
    ctx.fill();
  }

  // Teken de speler (schildpad)
  // Pootjes (groen)
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(speler.x + 5, speler.y + 10, 8, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(speler.x + 45, speler.y + 10, 8, 12, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(speler.x + 5, speler.y + 40, 8, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(speler.x + 45, speler.y + 40, 8, 12, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Staartje
  ctx.beginPath();
  ctx.moveTo(speler.x + 25, speler.y + 50);
  ctx.lineTo(speler.x + 25, speler.y + 58);
  ctx.lineTo(speler.x + 22, speler.y + 55);
  ctx.fill();
  // Schild (bruin)
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(speler.x + 25, speler.y + 25, 25, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Schild patroon (donkerder)
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.ellipse(speler.x + 25, speler.y + 25, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Kopje (groen)
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(speler.x + 25, speler.y - 5, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Oogjes
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(speler.x + 21, speler.y - 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(speler.x + 29, speler.y - 7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Teken de hond (alleen als niet opgegeten)
  if (!hond.opgegeten) {
    // Lichaam (bruin)
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(hond.x, hond.y + 20, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pootjes
    ctx.fillRect(hond.x - 25, hond.y + 35, 10, 20);
    ctx.fillRect(hond.x - 5, hond.y + 35, 10, 20);
    ctx.fillRect(hond.x + 15, hond.y + 35, 10, 20);
    // Staart
    ctx.beginPath();
    ctx.moveTo(hond.x + 30, hond.y + 15);
    ctx.quadraticCurveTo(hond.x + 50, hond.y, hond.x + 45, hond.y + 20);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#D2691E';
    ctx.stroke();
    // Hoofd
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(hond.x - 25, hond.y, 18, 0, Math.PI * 2);
    ctx.fill();
    // Oren (flaporen)
    ctx.beginPath();
    ctx.ellipse(hond.x - 40, hond.y - 5, 8, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hond.x - 15, hond.y - 12, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Snuit
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath();
    ctx.ellipse(hond.x - 35, hond.y + 5, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Neus
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(hond.x - 42, hond.y + 3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ogen
    ctx.beginPath();
    ctx.arc(hond.x - 30, hond.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hond.x - 20, hond.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken Stitch (alleen als niet opgegeten)
  if (!stitch.opgegeten) {
    // Grote oren
    ctx.fillStyle = '#2E5EAA';
    ctx.beginPath();
    ctx.ellipse(stitch.x - 30, stitch.y - 20, 15, 30, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(stitch.x + 30, stitch.y - 20, 15, 30, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Binnenkant oren (roze)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(stitch.x - 30, stitch.y - 20, 8, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(stitch.x + 30, stitch.y - 20, 8, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Hoofd
    ctx.fillStyle = '#2E5EAA';
    ctx.beginPath();
    ctx.arc(stitch.x, stitch.y, 35, 0, Math.PI * 2);
    ctx.fill();
    // Lichtblauwe vlek op gezicht
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(stitch.x, stitch.y + 10, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ogen (groot en zwart)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(stitch.x - 12, stitch.y - 5, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(stitch.x + 12, stitch.y - 5, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupillen (wit)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(stitch.x - 10, stitch.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(stitch.x + 14, stitch.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    // Neus
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(stitch.x, stitch.y + 8, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken de haai (alleen als hij niet opgegeten is)
  if (!haai.opgegeten) {
    ctx.fillStyle = haai.kleur;
    // Lichaam (ovaal)
    ctx.beginPath();
    ctx.ellipse(haai.x, haai.y, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rugvin (driehoek)
    ctx.beginPath();
    ctx.moveTo(haai.x, haai.y - 25);
    ctx.lineTo(haai.x - 15, haai.y - 25);
    ctx.lineTo(haai.x, haai.y - 50);
    ctx.fill();
    // Staartvin
    ctx.beginPath();
    ctx.moveTo(haai.x + 60, haai.y);
    ctx.lineTo(haai.x + 85, haai.y - 20);
    ctx.lineTo(haai.x + 85, haai.y + 20);
    ctx.fill();
    // Oog
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(haai.x - 35, haai.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken het stelletje (alleen als niet opgegeten)
  if (!stelletje.opgegeten) {
    // Persoon 1 (roze jurk)
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(stelletje.x - 30, stelletje.y, 20, 30);
    ctx.beginPath();
    ctx.arc(stelletje.x - 20, stelletje.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    // Haar persoon 1
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(stelletje.x - 20, stelletje.y - 15, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(stelletje.x - 28, stelletje.y - 15, 5, 15);
    ctx.fillRect(stelletje.x - 17, stelletje.y - 15, 5, 15);

    // Persoon 2 (blauw shirt)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(stelletje.x + 10, stelletje.y, 20, 30);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(stelletje.x + 20, stelletje.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    // Haar persoon 2
    ctx.fillStyle = '#2F1810';
    ctx.beginPath();
    ctx.arc(stelletje.x + 20, stelletje.y - 15, 10, Math.PI, 0);
    ctx.fill();

    // Hartje ertussen
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(stelletje.x - 3, stelletje.y - 25, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(stelletje.x + 3, stelletje.y - 25, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(stelletje.x - 9, stelletje.y - 23);
    ctx.lineTo(stelletje.x, stelletje.y - 10);
    ctx.lineTo(stelletje.x + 9, stelletje.y - 23);
    ctx.fill();
  }

  // Teken de trampoline (alleen als niet in de ruimte)
  if (!inDeRuimte) {
    // Springvlak
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(trampoline.x, trampoline.y, 60, 10);
    // Poten
    ctx.fillStyle = '#333';
    ctx.fillRect(trampoline.x + 5, trampoline.y + 10, 8, 25);
    ctx.fillRect(trampoline.x + 47, trampoline.y + 10, 8, 25);
    // Veren
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trampoline.x + 15, trampoline.y + 10);
    ctx.lineTo(trampoline.x + 20, trampoline.y + 20);
    ctx.lineTo(trampoline.x + 15, trampoline.y + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(trampoline.x + 45, trampoline.y + 10);
    ctx.lineTo(trampoline.x + 40, trampoline.y + 20);
    ctx.lineTo(trampoline.x + 45, trampoline.y + 30);
    ctx.stroke();
  }

  // Teken oma en opa die aan het kussen zijn
  if (!inDeRuimte) {
    // Kussentje
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(omaEnOpa.x, omaEnOpa.y + 30, 50, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Kussentje patroontje
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 20, omaEnOpa.y + 30, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 20, omaEnOpa.y + 30, 5, 0, Math.PI * 2);
    ctx.fill();

    // Opa (links)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(omaEnOpa.x - 35, omaEnOpa.y, 20, 30);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 25, omaEnOpa.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    // Opa grijs haar
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 25, omaEnOpa.y - 15, 10, Math.PI, 0);
    ctx.fill();
    // Opa bril
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 30, omaEnOpa.y - 10, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 20, omaEnOpa.y - 10, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Oma (rechts)
    ctx.fillStyle = '#DDA0DD';
    ctx.fillRect(omaEnOpa.x + 15, omaEnOpa.y, 20, 30);
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 25, omaEnOpa.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    // Oma grijs haar met knotje
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 25, omaEnOpa.y - 15, 10, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 25, omaEnOpa.y - 25, 7, 0, Math.PI * 2);
    ctx.fill();
    // Oma bril
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 20, omaEnOpa.y - 10, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 30, omaEnOpa.y - 10, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Kus hartjes
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 3, omaEnOpa.y - 35, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 3, omaEnOpa.y - 35, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(omaEnOpa.x - 8, omaEnOpa.y - 33);
    ctx.lineTo(omaEnOpa.x, omaEnOpa.y - 22);
    ctx.lineTo(omaEnOpa.x + 8, omaEnOpa.y - 33);
    ctx.fill();

    // Kleine hartjes eromheen
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(omaEnOpa.x - 40, omaEnOpa.y - 25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(omaEnOpa.x + 40, omaEnOpa.y - 30, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teken de grasmaaier
  // Lichaam (rood)
  ctx.fillStyle = '#CC0000';
  ctx.fillRect(grasmaaier.x - 25, grasmaaier.y - 15, 50, 30);
  // Wielen (zwart)
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(grasmaaier.x - 20, grasmaaier.y + 15, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(grasmaaier.x + 20, grasmaaier.y + 15, 8, 0, Math.PI * 2);
  ctx.fill();
  // Handvat
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(grasmaaier.x, grasmaaier.y - 15);
  ctx.lineTo(grasmaaier.x, grasmaaier.y - 35);
  ctx.lineTo(grasmaaier.x + 15, grasmaaier.y - 40);
  ctx.stroke();
  // Maaibalk (grijs met tanden)
  ctx.fillStyle = '#666';
  ctx.fillRect(grasmaaier.x - 30, grasmaaier.y + 10, 60, 8);

  // Toon de score
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 20, 30);

  // Toon de levens als hartjes
  ctx.fillStyle = 'red';
  for (let i = 0; i < levens; i++) {
    let hx = 20 + i * 30;
    let hy = 50;
    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + 10, hy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy + 3);
    ctx.lineTo(hx + 5, hy + 18);
    ctx.lineTo(hx + 18, hy + 3);
    ctx.fill();
  }

  // Toon GAME OVER als je dood bent
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '60px Arial';
    ctx.fillText('GAME OVER', 220, 350);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Druk op SPATIE om opnieuw te beginnen', 200, 400);
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
