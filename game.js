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
  kleur: '#00ff88',
  snelheid: 5
};

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
}

// === TEKEN FUNCTIE ===
// Hier tekenen we alles op het scherm
function teken() {
  // Maak het scherm leeg
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Teken de speler
  ctx.fillStyle = speler.kleur;
  ctx.fillRect(speler.x, speler.y, speler.breedte, speler.hoogte);

  // Teken instructies
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Gebruik pijltjes of WASD om te bewegen!', 20, 30);
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
