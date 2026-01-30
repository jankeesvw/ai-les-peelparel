// === SNAKE GAME ===

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Grootte van elk blokje
const blokGrootte = 30;

// === DE SLANG ===
const slang = {
  lichaam: [
    { x: 390, y: 300 },  // Kop
    { x: 360, y: 300 },  // Lichaam
    { x: 330, y: 300 }   // Staart
  ],
  richting: 'rechts',
  kleur: 'red'
};

// === FRUIT ===
const fruitSoorten = ['appel', 'sinaasappel', 'citroen', 'ananas', 'druif'];

const eten = {
  x: 180,
  y: 180,
  soort: 'appel'
};

function nieuwFruit() {
  eten.x = Math.floor(Math.random() * (canvas.width / blokGrootte)) * blokGrootte;
  eten.y = Math.floor(Math.random() * (canvas.height / blokGrootte)) * blokGrootte;
  eten.soort = fruitSoorten[Math.floor(Math.random() * fruitSoorten.length)];
}

// === SCORE ===
let score = 0;
let gameOver = false;

// === BESTURING ===
document.addEventListener('keydown', (e) => {
  // Opnieuw spelen met spatie
  if (e.key === ' ' && gameOver) {
    location.reload();
  }

  if ((e.key === 'ArrowUp' || e.key === 'w') && slang.richting !== 'omlaag') {
    slang.richting = 'omhoog';
  }
  if ((e.key === 'ArrowDown' || e.key === 's') && slang.richting !== 'omhoog') {
    slang.richting = 'omlaag';
  }
  if ((e.key === 'ArrowLeft' || e.key === 'a') && slang.richting !== 'rechts') {
    slang.richting = 'links';
  }
  if ((e.key === 'ArrowRight' || e.key === 'd') && slang.richting !== 'links') {
    slang.richting = 'rechts';
  }
});

// === UPDATE FUNCTIE ===
function update() {
  // Stop als game over is
  if (gameOver) return;

  // Bepaal nieuwe positie van de kop
  const kop = { ...slang.lichaam[0] };

  if (slang.richting === 'omhoog') kop.y -= blokGrootte;
  if (slang.richting === 'omlaag') kop.y += blokGrootte;
  if (slang.richting === 'links') kop.x -= blokGrootte;
  if (slang.richting === 'rechts') kop.x += blokGrootte;

  // Voeg nieuwe kop toe aan het begin
  slang.lichaam.unshift(kop);

  // Check of we eten pakken
  if (kop.x === eten.x && kop.y === eten.y) {
    score += 10;
    nieuwFruit();
  } else {
    // Verwijder staart (slang blijft even lang)
    slang.lichaam.pop();
  }

  // Kom aan de andere kant uit als je de muur raakt
  if (kop.x < 0) kop.x = canvas.width - blokGrootte;
  if (kop.x >= canvas.width) kop.x = 0;
  if (kop.y < 0) kop.y = canvas.height - blokGrootte;
  if (kop.y >= canvas.height) kop.y = 0;

  // Update de kop positie in het lichaam
  slang.lichaam[0] = kop;

  // Game over als je jezelf raakt
  for (let i = 1; i < slang.lichaam.length; i++) {
    if (kop.x === slang.lichaam[i].x && kop.y === slang.lichaam[i].y) {
      gameOver = true;
    }
  }
}

// === TEKEN FUNCTIE ===
function teken() {
  // Maak het scherm leeg (donkere achtergrond)
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Teken het fruit
  const fruitX = eten.x + blokGrootte / 2;
  const fruitY = eten.y + blokGrootte / 2;

  if (eten.soort === 'appel') {
    // Rode appel
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(fruitX, fruitY, blokGrootte / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'brown';
    ctx.fillRect(fruitX - 2, eten.y, 4, 6);

  } else if (eten.soort === 'sinaasappel') {
    // Oranje sinaasappel
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(fruitX, fruitY, blokGrootte / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'green';
    ctx.fillRect(fruitX - 3, eten.y, 6, 5);

  } else if (eten.soort === 'citroen') {
    // Gele citroen (ovaal)
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.ellipse(fruitX, fruitY, blokGrootte / 2 + 3, blokGrootte / 3, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (eten.soort === 'ananas') {
    // Ananas met blaadjes
    ctx.fillStyle = '#f4a020';
    ctx.beginPath();
    ctx.ellipse(fruitX, fruitY + 2, blokGrootte / 3, blokGrootte / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Blaadjes
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(fruitX, eten.y + 3);
    ctx.lineTo(fruitX - 6, eten.y - 5);
    ctx.lineTo(fruitX, eten.y);
    ctx.lineTo(fruitX + 6, eten.y - 5);
    ctx.fill();

  } else if (eten.soort === 'druif') {
    // Paarse druiven
    ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(fruitX - 4, fruitY, 5, 0, Math.PI * 2);
    ctx.arc(fruitX + 4, fruitY, 5, 0, Math.PI * 2);
    ctx.arc(fruitX, fruitY + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'green';
    ctx.fillRect(fruitX - 1, eten.y, 2, 5);
  }

  // Teken het lichaam van de slang (groen, ronde stukjes)
  slang.lichaam.forEach((deel, index) => {
    const centerX = deel.x + blokGrootte / 2;
    const centerY = deel.y + blokGrootte / 2;

    if (index === 0) {
      // === DE KOP ===
      ctx.fillStyle = '#2d8f2d'; // Donkergroen
      ctx.beginPath();
      ctx.arc(centerX, centerY, blokGrootte / 2 + 2, 0, Math.PI * 2);
      ctx.fill();

      // Ogen (wit)
      ctx.fillStyle = 'white';
      let oog1X, oog1Y, oog2X, oog2Y;

      if (slang.richting === 'rechts') {
        oog1X = centerX + 4; oog1Y = centerY - 5;
        oog2X = centerX + 4; oog2Y = centerY + 5;
      } else if (slang.richting === 'links') {
        oog1X = centerX - 4; oog1Y = centerY - 5;
        oog2X = centerX - 4; oog2Y = centerY + 5;
      } else if (slang.richting === 'omhoog') {
        oog1X = centerX - 5; oog1Y = centerY - 4;
        oog2X = centerX + 5; oog2Y = centerY - 4;
      } else {
        oog1X = centerX - 5; oog1Y = centerY + 4;
        oog2X = centerX + 5; oog2Y = centerY + 4;
      }

      ctx.beginPath();
      ctx.arc(oog1X, oog1Y, 4, 0, Math.PI * 2);
      ctx.arc(oog2X, oog2Y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Pupillen (zwart)
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(oog1X, oog1Y, 2, 0, Math.PI * 2);
      ctx.arc(oog2X, oog2Y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tongetje (rood, gespleten)
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (slang.richting === 'rechts') {
        ctx.moveTo(centerX + 10, centerY);
        ctx.lineTo(centerX + 18, centerY);
        ctx.lineTo(centerX + 22, centerY - 4);
        ctx.moveTo(centerX + 18, centerY);
        ctx.lineTo(centerX + 22, centerY + 4);
      } else if (slang.richting === 'links') {
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX - 18, centerY);
        ctx.lineTo(centerX - 22, centerY - 4);
        ctx.moveTo(centerX - 18, centerY);
        ctx.lineTo(centerX - 22, centerY + 4);
      } else if (slang.richting === 'omhoog') {
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY - 18);
        ctx.lineTo(centerX - 4, centerY - 22);
        ctx.moveTo(centerX, centerY - 18);
        ctx.lineTo(centerX + 4, centerY - 22);
      } else {
        ctx.moveTo(centerX, centerY + 10);
        ctx.lineTo(centerX, centerY + 18);
        ctx.lineTo(centerX - 4, centerY + 22);
        ctx.moveTo(centerX, centerY + 18);
        ctx.lineTo(centerX + 4, centerY + 22);
      }
      ctx.stroke();

    } else {
      // === HET LICHAAM ===
      // Afwisselend licht en donker groen
      ctx.fillStyle = index % 2 === 0 ? '#3cb043' : '#2d8f2d';
      ctx.beginPath();
      ctx.arc(centerX, centerY, blokGrootte / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Teken de score
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);

  // Game Over scherm
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 30);

    ctx.font = '20px Arial';
    ctx.fillText('Druk op SPATIE om opnieuw te spelen', canvas.width / 2, canvas.height / 2 + 70);

    ctx.textAlign = 'left';
  }
}

// === GAME LOOP ===
// Snake beweegt langzamer dan 60fps
let laatsteTijd = 0;
const snelheid = 150; // milliseconden tussen bewegingen (hoger = langzamer)

function gameLoop(tijd) {
  if (tijd - laatsteTijd > snelheid) {
    update();
    laatsteTijd = tijd;
  }
  teken();
  requestAnimationFrame(gameLoop);
}

// Start het spel!
gameLoop(0);
