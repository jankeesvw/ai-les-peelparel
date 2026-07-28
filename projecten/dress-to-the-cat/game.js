// Dress the Cat 😺 - een super schattige cartoon kat!
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Kleuren van de kat
const LIJN = '#3b2b20';        // dikke tekenlijn (donkerbruin)
const VACHT = '#ffb340';       // oranje vacht
const VACHT_LICHT = '#ffe0a3'; // lichte buik en snoetje
const OOR_ROZE = '#ffb3c6';    // binnenkant oortjes
const BLOS = '#ff9eb5';        // blosjes

// Waar staat de kat en hoe groot is hij? (kan veranderen als hij ergens gaat zitten)
let katX = 240;
let katY = 445;
let katSchaal = 0.6;
let zitBijKaptafel = false;  // zit de kat bij de make-up tafel?

// Welk gezichtje heeft de kat? En welke make-up?
let gezicht = 'blij';
const makeup = {
  lippen: false,
  wimpers: false,
  glitters: false,
  oogschaduw: false,
  sproetjes: false,
};

ctx.lineJoin = 'round';
ctx.lineCap = 'round';

// Handig: vorm tekenen met vulling én dikke lijn eromheen
function vulEnLijn(kleur, lijndikte = 8) {
  ctx.fillStyle = kleur;
  ctx.fill();
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = lijndikte;
  ctx.stroke();
}

function tekenSchaduw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.ellipse(400, 560, 160, 22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function tekenStaart() {
  ctx.beginPath();
  ctx.moveTo(495, 490);
  ctx.quadraticCurveTo(620, 470, 600, 350);
  ctx.quadraticCurveTo(595, 310, 560, 320);
  ctx.quadraticCurveTo(540, 330, 555, 365);
  ctx.quadraticCurveTo(560, 440, 480, 450);
  ctx.closePath();
  vulEnLijn(VACHT);

  // Puntje van de staart licht
  ctx.beginPath();
  ctx.arc(578, 335, 22, 0, Math.PI * 2);
  vulEnLijn(VACHT_LICHT, 6);
}

function tekenLijf() {
  // Rond, mollig lijfje
  ctx.beginPath();
  ctx.ellipse(400, 460, 115, 105, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT);

  // Lichte buik
  ctx.beginPath();
  ctx.ellipse(400, 480, 70, 65, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT_LICHT, 6);
}

function tekenPootjes() {
  // Achterpootjes (links en rechts onderaan)
  ctx.beginPath();
  ctx.ellipse(315, 540, 38, 26, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT, 7);
  ctx.beginPath();
  ctx.ellipse(485, 540, 38, 26, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT, 7);

  // Voorpootjes
  ctx.beginPath();
  ctx.ellipse(365, 550, 28, 20, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT_LICHT, 6);
  ctx.beginPath();
  ctx.ellipse(435, 550, 28, 20, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT_LICHT, 6);

  // Teentjes
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(357, 542); ctx.lineTo(357, 556);
  ctx.moveTo(373, 542); ctx.lineTo(373, 556);
  ctx.moveTo(427, 542); ctx.lineTo(427, 556);
  ctx.moveTo(443, 542); ctx.lineTo(443, 556);
  ctx.stroke();
}

function tekenOren() {
  // Linker oor
  ctx.beginPath();
  ctx.moveTo(295, 190);
  ctx.quadraticCurveTo(285, 90, 330, 105);
  ctx.quadraticCurveTo(370, 120, 390, 150);
  ctx.closePath();
  vulEnLijn(VACHT);

  // Rechter oor
  ctx.beginPath();
  ctx.moveTo(505, 190);
  ctx.quadraticCurveTo(515, 90, 470, 105);
  ctx.quadraticCurveTo(430, 120, 410, 150);
  ctx.closePath();
  vulEnLijn(VACHT);

  // Roze binnenkant oortjes
  ctx.beginPath();
  ctx.moveTo(315, 175);
  ctx.quadraticCurveTo(310, 120, 340, 130);
  ctx.quadraticCurveTo(360, 140, 370, 155);
  ctx.closePath();
  vulEnLijn(OOR_ROZE, 5);

  ctx.beginPath();
  ctx.moveTo(485, 175);
  ctx.quadraticCurveTo(490, 120, 460, 130);
  ctx.quadraticCurveTo(440, 140, 430, 155);
  ctx.closePath();
  vulEnLijn(OOR_ROZE, 5);
}

function tekenKop() {
  // Grote ronde kop (iets breder dan hoog = extra schattig)
  ctx.beginPath();
  ctx.ellipse(400, 250, 130, 115, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT);

  // Licht snoetje
  ctx.beginPath();
  ctx.ellipse(400, 300, 62, 42, 0, 0, Math.PI * 2);
  vulEnLijn(VACHT_LICHT, 6);
}

function tekenStreepjes() {
  // Streepjes op het hoofd (echt kattig!)
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(400, 142); ctx.lineTo(400, 172);
  ctx.moveTo(375, 148); ctx.lineTo(380, 175);
  ctx.moveTo(425, 148); ctx.lineTo(420, 175);
  ctx.stroke();
}

// Een open glimmend oog
function openOog(x) {
  ctx.beginPath();
  ctx.ellipse(x, 240, 26, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = LIJN;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 8, 230, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 7, 250, 4, 0, Math.PI * 2);
  ctx.fill();
}

// Een dicht oog (voor knipogen en slapen)
function dichtOog(x) {
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 22, 238);
  ctx.quadraticCurveTo(x, 258, x + 22, 238);
  ctx.stroke();
}

function tekenGezicht() {
  // Oogschaduw (achter de ogen)
  if (makeup.oogschaduw) {
    ctx.fillStyle = '#c8a2ff';
    ctx.beginPath();
    ctx.ellipse(345, 212, 28, 14, 0, Math.PI, 0);
    ctx.ellipse(455, 212, 28, 14, 0, Math.PI, 0);
    ctx.fill();
  }

  // De ogen veranderen per gezichtje!
  if (gezicht === 'verliefd') {
    hartje(345, 240, 1.4, '#ff4d6d');
    hartje(455, 240, 1.4, '#ff4d6d');
  } else if (gezicht === 'slaperig') {
    dichtOog(345);
    dichtOog(455);
  } else if (gezicht === 'knipoog') {
    openOog(345);
    dichtOog(455);
  } else if (gezicht === 'verrast') {
    for (const x of [345, 455]) {
      ctx.beginPath();
      ctx.arc(x, 240, 22, 0, Math.PI * 2);
      vulEnLijn('white', 5);
      ctx.fillStyle = LIJN;
      ctx.beginPath();
      ctx.arc(x, 242, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    openOog(345);
    openOog(455);
  }

  // Boze wenkbrauwen
  if (gezicht === 'boos') {
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(315, 200); ctx.lineTo(372, 218);
    ctx.moveTo(485, 200); ctx.lineTo(428, 218);
    ctx.stroke();
  }

  // Blosjes op de wangen
  ctx.fillStyle = BLOS;
  ctx.beginPath();
  ctx.ellipse(300, 290, 20, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(500, 290, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Roze neusje (hartjesvorm)
  ctx.beginPath();
  ctx.moveTo(400, 302);
  ctx.quadraticCurveTo(382, 278, 400, 282);
  ctx.quadraticCurveTo(418, 278, 400, 302);
  ctx.fillStyle = '#ff6f91';
  ctx.fill();
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Het mondje verandert ook per gezichtje!
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 5;
  if (gezicht === 'verrast') {
    // Open mondje: "Ooooh!"
    ctx.beginPath();
    ctx.ellipse(400, 318, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = LIJN;
    ctx.fill();
  } else if (gezicht === 'boos') {
    // Boos mondje
    ctx.beginPath();
    ctx.moveTo(372, 324);
    ctx.quadraticCurveTo(400, 304, 428, 324);
    ctx.stroke();
  } else if (gezicht === 'slaperig') {
    // Klein slaperig mondje
    ctx.beginPath();
    ctx.moveTo(385, 315);
    ctx.lineTo(415, 315);
    ctx.stroke();
  } else {
    // Blij mondje (w-vormpje)
    ctx.beginPath();
    ctx.moveTo(400, 305);
    ctx.quadraticCurveTo(388, 325, 372, 315);
    ctx.moveTo(400, 305);
    ctx.quadraticCurveTo(412, 325, 428, 315);
    ctx.stroke();
  }

  // Snorharen
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(310, 300); ctx.quadraticCurveTo(260, 292, 235, 280);
  ctx.moveTo(312, 315); ctx.quadraticCurveTo(262, 318, 235, 318);
  ctx.moveTo(490, 300); ctx.quadraticCurveTo(540, 292, 565, 280);
  ctx.moveTo(488, 315); ctx.quadraticCurveTo(538, 318, 565, 318);
  ctx.stroke();

  // Make-up! (aan en uit te klikken bij de kaptafel)
  if (makeup.lippen && gezicht !== 'verrast') {
    ctx.beginPath();
    ctx.ellipse(400, 316, 20, 10, 0, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
  }
  if (makeup.wimpers) {
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(322, 220); ctx.lineTo(310, 206);
    ctx.moveTo(336, 212); ctx.lineTo(328, 196);
    ctx.moveTo(478, 220); ctx.lineTo(490, 206);
    ctx.moveTo(464, 212); ctx.lineTo(472, 196);
    ctx.stroke();
  }
  if (makeup.glitters) {
    ster(295, 272, 7, 'white');
    ster(505, 272, 7, 'white');
    ster(400, 190, 6, 'white');
  }
  if (makeup.sproetjes) {
    ctx.fillStyle = '#b5773a';
    for (const [sx, sy] of [[352, 292], [364, 302], [448, 292], [436, 302]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function tekenKat() {
  // Verplaats en verklein de hele kat
  ctx.save();
  ctx.translate(katX, katY);
  ctx.scale(katSchaal, katSchaal);
  ctx.translate(-400, -350);

  tekenSchaduw();
  tekenStaart();
  tekenLijf();
  tekenPootjes();
  tekenOren();
  tekenKop();
  tekenStreepjes();
  tekenGezicht();

  ctx.restore();
}

// ----- De vier kledingkasten -----
const KAST_HOUT = '#b5773a';
const KAST_HOUT_DONKER = '#9a6230';

// Wat heeft de kat aan? (null = niks uit die kast)
const gedragen = {
  Hoedjes: null,
  Brillen: null,
  Shirtjes: null,
  Strikjes: null,
};

const kasten = [
  { x: 30,  y: 70, naam: 'Hoedjes',  spullen: ['hogeHoed', 'zonnehoed', 'pet', 'kroon', 'feestHoed'],                  schaal: 0.26, offsetY: 12 },
  { x: 220, y: 70, naam: 'Brillen',  spullen: ['zonnebril', 'bril', 'duikbril', 'hartjesbril', 'ooglap'],              schaal: 0.30, offsetY: 0 },
  { x: 410, y: 70, naam: 'Shirtjes', spullen: ['blauwShirt', 'streepShirt', 'hartShirt', 'sterShirt', 'regenboogShirt'], schaal: 0.24, offsetY: 0 },
  { x: 600, y: 70, naam: 'Strikjes', spullen: ['strik', 'vlinderdas', 'sjaal', 'ketting', 'medaille'],                 schaal: 0.40, offsetY: 0 },
];

// Waar ligt spulletje nummer i in de kast? (3 per plank, 2 planken)
function spulPositie(kast, i) {
  const spulAfstand = (KAST_BREEDTE - 24) / 3;
  const rij = Math.floor(i / 3);
  const kolom = i % 3;
  const aantalInRij = Math.min(kast.spullen.length - rij * 3, 3);
  const middenOffset = (3 - aantalInRij) * spulAfstand / 2;
  return {
    x: kast.x + 12 + middenOffset + spulAfstand * kolom + spulAfstand / 2,
    y: kast.y + 107 + rij * 65,
  };
}

// ----- Alle kleertjes, zelf getekend! -----
// Elk kledingstuk wordt getekend rond punt (0,0), precies op kat-maat.
const kledingTekenaars = {

  hogeHoed() {
    // Rand
    ctx.beginPath();
    ctx.ellipse(0, 2, 78, 13, 0, 0, Math.PI * 2);
    vulEnLijn('#2f3542', 6);
    // Hoge bol
    ctx.beginPath();
    ctx.roundRect(-46, -90, 92, 92, 8);
    vulEnLijn('#2f3542', 6);
    // Rode band
    ctx.beginPath();
    ctx.rect(-46, -32, 92, 16);
    vulEnLijn('#e94560', 4);
  },

  zonnehoed() {
    // Brede rand
    ctx.beginPath();
    ctx.ellipse(0, 2, 92, 15, 0, 0, Math.PI * 2);
    vulEnLijn('#ffd93b', 6);
    // Bolle bovenkant
    ctx.beginPath();
    ctx.arc(0, 0, 52, Math.PI, 0);
    ctx.closePath();
    vulEnLijn('#ffcd28', 6);
    // Roze band
    ctx.beginPath();
    ctx.rect(-52, -16, 104, 12);
    vulEnLijn('#ff6b81', 4);
    // Bloemetje
    ctx.beginPath();
    ctx.arc(36, -10, 9, 0, Math.PI * 2);
    vulEnLijn('white', 3);
    ctx.fillStyle = '#ffa502';
    ctx.beginPath();
    ctx.arc(36, -10, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  pet() {
    // Klep
    ctx.beginPath();
    ctx.ellipse(34, 2, 50, 12, 0, 0, Math.PI * 2);
    vulEnLijn('#1e90ff', 5);
    // Bolle bovenkant
    ctx.beginPath();
    ctx.arc(0, 0, 58, Math.PI, 0);
    ctx.closePath();
    vulEnLijn('#54a0ff', 6);
    // Knoopje
    ctx.beginPath();
    ctx.arc(0, -56, 7, 0, Math.PI * 2);
    vulEnLijn('#1e90ff', 3);
  },

  zonnebril() {
    // Pootjes en brug
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-54, -6); ctx.lineTo(-72, -12);
    ctx.moveTo(54, -6);  ctx.lineTo(72, -12);
    ctx.moveTo(-12, -6); ctx.lineTo(12, -6);
    ctx.stroke();
    // Donkere glazen
    ctx.beginPath();
    ctx.roundRect(-54, -20, 42, 36, 12);
    vulEnLijn('#2f3542', 5);
    ctx.beginPath();
    ctx.roundRect(12, -20, 42, 36, 12);
    vulEnLijn('#2f3542', 5);
    // Glansje
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-44, -12); ctx.lineTo(-34, -2);
    ctx.moveTo(22, -12);  ctx.lineTo(32, -2);
    ctx.stroke();
  },

  bril() {
    // Pootjes en brug
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-52, -2); ctx.lineTo(-72, -8);
    ctx.moveTo(52, -2);  ctx.lineTo(72, -8);
    ctx.moveTo(-14, -2); ctx.lineTo(14, -2);
    ctx.stroke();
    // Ronde blauwe glazen
    for (const bx of [-33, 33]) {
      ctx.beginPath();
      ctx.arc(bx, -2, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 230, 255, 0.55)';
      ctx.fill();
      ctx.strokeStyle = '#3742fa';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  },

  duikbril() {
    // Bandjes
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-58, 0); ctx.lineTo(-76, -4);
    ctx.moveTo(58, 0);  ctx.lineTo(76, -4);
    ctx.stroke();
    // Groene rand
    ctx.beginPath();
    ctx.roundRect(-58, -20, 116, 40, 18);
    vulEnLijn('#10ac84', 6);
    // Glas
    ctx.beginPath();
    ctx.roundRect(-46, -12, 92, 24, 10);
    vulEnLijn('#c8f0ff', 4);
  },

  blauwShirt() {
    shirtVorm('#54a0ff');
  },

  streepShirt() {
    shirtVorm('#ff6b6b');
    // Witte strepen
    ctx.fillStyle = 'white';
    ctx.fillRect(-64, -28, 128, 14);
    ctx.fillRect(-64, 2, 128, 14);
  },

  hartShirt() {
    shirtVorm('#2ed573');
    // Wit hartje
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.bezierCurveTo(-28, -8, -12, -28, 0, -10);
    ctx.bezierCurveTo(12, -28, 28, -8, 0, 14);
    ctx.fillStyle = 'white';
    ctx.fill();
  },

  strik() {
    strikVorm('#ff9ff3', false);
  },

  vlinderdas() {
    strikVorm('#e94560', true);
  },

  kroon() {
    // Gouden kroon met punten
    ctx.beginPath();
    ctx.moveTo(-55, 14);
    ctx.lineTo(-55, -18);
    ctx.lineTo(-28, -2);
    ctx.lineTo(0, -30);
    ctx.lineTo(28, -2);
    ctx.lineTo(55, -18);
    ctx.lineTo(55, 14);
    ctx.closePath();
    vulEnLijn('#ffd93b', 6);
    // Edelsteentjes
    ctx.beginPath();
    ctx.arc(0, 2, 6, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
    for (const gx of [-32, 32]) {
      ctx.beginPath();
      ctx.arc(gx, 4, 4, 0, Math.PI * 2);
      vulEnLijn('#3742fa', 3);
    }
  },

  feestHoed() {
    // Paarse feestmuts
    ctx.beginPath();
    ctx.moveTo(-40, 10);
    ctx.lineTo(0, -72);
    ctx.lineTo(40, 10);
    ctx.closePath();
    vulEnLijn('#a55eea', 6);
    // Witte stipjes
    ctx.fillStyle = 'white';
    for (const [sx, sy] of [[-12, -8], [10, -28], [-4, -46], [16, -2]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pompon bovenop
    ctx.beginPath();
    ctx.arc(0, -76, 10, 0, Math.PI * 2);
    vulEnLijn('#ff6b81', 4);
  },

  hartjesbril() {
    // Pootjes en brug
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-52, -4); ctx.lineTo(-72, -10);
    ctx.moveTo(52, -4);  ctx.lineTo(72, -10);
    ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
    ctx.stroke();
    // Hartvormige glazen
    hartje(-33, -2, 1.1, '#ff6b81');
    hartje(33, -2, 1.1, '#ff6b81');
  },

  ooglap() {
    // Bandje om het hoofd
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-52, -10); ctx.lineTo(-74, -16);
    ctx.moveTo(-14, -6);  ctx.lineTo(74, -12);
    ctx.stroke();
    // Zwart ooglapje (piraat!)
    ctx.beginPath();
    ctx.ellipse(-33, -2, 22, 24, 0, 0, Math.PI * 2);
    vulEnLijn('#2f3542', 5);
  },

  sterShirt() {
    shirtVorm('#ffd93b');
    ster(0, -2, 22, '#ffa502');
  },

  regenboogShirt() {
    shirtVorm('#ff6b6b');
    // Regenboogstrepen
    const kleuren = ['#ffa502', '#ffd93b', '#2ed573', '#54a0ff'];
    kleuren.forEach((kleur, i) => {
      ctx.fillStyle = kleur;
      ctx.fillRect(-64, -32 + i * 16, 128, 12);
    });
  },

  ketting() {
    // Pareltjes in een boogje
    for (let t = 0; t <= Math.PI; t += Math.PI / 8) {
      const px = 44 * Math.cos(t);
      const py = 14 * Math.sin(t) + 4;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      vulEnLijn('#fff5e0', 3);
    }
    // Roze hartje als hanger
    hartje(0, 26, 0.6, '#ff6b81');
  },

  medaille() {
    // Rood lint
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(0, 16);
    ctx.lineTo(16, -10);
    ctx.closePath();
    vulEnLijn('#e94560', 4);
    // Gouden munt met ster
    ctx.beginPath();
    ctx.arc(0, 26, 16, 0, Math.PI * 2);
    vulEnLijn('#ffd93b', 5);
    ster(0, 26, 9, '#ffa502');
  },

  sjaal() {
    // Band om de nek
    ctx.beginPath();
    ctx.roundRect(-52, -11, 104, 22, 11);
    vulEnLijn('#ff9f43', 5);
    // Hangend stuk
    ctx.beginPath();
    ctx.roundRect(14, 8, 22, 42, 8);
    vulEnLijn('#ff9f43', 5);
    // Gele streepjes
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-30, -8); ctx.lineTo(-26, 8);
    ctx.moveTo(-6, -8);  ctx.lineTo(-2, 8);
    ctx.moveTo(18, 20);  ctx.lineTo(32, 20);
    ctx.moveTo(18, 36);  ctx.lineTo(32, 36);
    ctx.stroke();
  },
};

// Hulpje: de vorm van een shirtje (lijf + mouwtjes + kraag)
function shirtVorm(kleur) {
  ctx.beginPath();
  ctx.roundRect(-94, -46, 32, 40, 12);
  vulEnLijn(kleur, 5);
  ctx.beginPath();
  ctx.roundRect(62, -46, 32, 40, 12);
  vulEnLijn(kleur, 5);
  ctx.beginPath();
  ctx.roundRect(-68, -52, 136, 104, 20);
  vulEnLijn(kleur, 6);
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -52, 16, 0, Math.PI);
  ctx.stroke();
}

// Hulpje: de vorm van een strik (twee vleugels + knoopje)
function strikVorm(kleur, metStippen) {
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(-44, -22);
  ctx.quadraticCurveTo(-52, 0, -44, 22);
  ctx.closePath();
  vulEnLijn(kleur, 5);
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(44, -22);
  ctx.quadraticCurveTo(52, 0, 44, 22);
  ctx.closePath();
  vulEnLijn(kleur, 5);
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  vulEnLijn(kleur, 4);
  if (metStippen) {
    ctx.fillStyle = 'white';
    for (const [sx, sy] of [[-30, -6], [-26, 10], [28, -8], [32, 8]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Hulpje: een hartje tekenen op plek (x, y) met grootte s
function hartje(x, y, s, kleur) {
  ctx.beginPath();
  ctx.moveTo(x, y + 14 * s);
  ctx.bezierCurveTo(x - 28 * s, y - 8 * s, x - 12 * s, y - 28 * s, x, y - 10 * s);
  ctx.bezierCurveTo(x + 12 * s, y - 28 * s, x + 28 * s, y - 8 * s, x, y + 14 * s);
  vulEnLijn(kleur, 4);
}

// Hulpje: een ster met 5 punten
function ster(x, y, r, kleur) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const straal = i % 2 === 0 ? r : r * 0.45;
    const hoek = -Math.PI / 2 + i * Math.PI / 5;
    const px = x + straal * Math.cos(hoek);
    const py = y + straal * Math.sin(hoek);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  vulEnLijn(kleur, 3);
}

function tekenKleding(naam) {
  kledingTekenaars[naam]();
}

const KAST_BREEDTE = 170;
const KAST_HOOGTE = 235;

function tekenKast(kast) {
  // Open deurtjes aan de zijkanten
  ctx.beginPath();
  ctx.roundRect(kast.x - 26, kast.y + 8, 26, KAST_HOOGTE - 16, 6);
  vulEnLijn(KAST_HOUT_DONKER, 5);
  ctx.beginPath();
  ctx.roundRect(kast.x + KAST_BREEDTE, kast.y + 8, 26, KAST_HOOGTE - 16, 6);
  vulEnLijn(KAST_HOUT_DONKER, 5);

  // Kast zelf
  ctx.beginPath();
  ctx.roundRect(kast.x, kast.y, KAST_BREEDTE, KAST_HOOGTE, 12);
  vulEnLijn(KAST_HOUT, 7);

  // Donkere binnenkant (want de kast staat open)
  ctx.beginPath();
  ctx.roundRect(kast.x + 12, kast.y + 40, KAST_BREEDTE - 24, KAST_HOOGTE - 52, 8);
  vulEnLijn('#6b4423', 5);

  // Twee plankjes waar de spulletjes op liggen
  ctx.strokeStyle = KAST_HOUT;
  ctx.lineWidth = 8;
  for (const plankY of [130, 195]) {
    ctx.beginPath();
    ctx.moveTo(kast.x + 14, kast.y + plankY);
    ctx.lineTo(kast.x + KAST_BREEDTE - 14, kast.y + plankY);
    ctx.stroke();
  }

  // De spulletjes in de kast (kleine versie van de echte kleertjes)
  kast.spullen.forEach((spul, i) => {
    const plek = spulPositie(kast, i);
    // Geel rondje achter het kledingstuk dat de kat aan heeft
    if (gedragen[kast.naam] === i) {
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.arc(plek.x, plek.y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(plek.x, plek.y + kast.offsetY);
    ctx.scale(kast.schaal, kast.schaal);
    tekenKleding(spul);
    ctx.restore();
  });

  // Plankje bovenop met de naam
  ctx.beginPath();
  ctx.roundRect(kast.x - 8, kast.y - 14, KAST_BREEDTE + 16, 34, 8);
  vulEnLijn(KAST_HOUT_DONKER, 6);
  ctx.font = 'bold 19px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText(kast.naam, kast.x + KAST_BREEDTE / 2, kast.y + 10);
}

// Hoe hoog zitten de kleertjes op de kat? (beweegt mee met de kat!)
const kleertjesHoogte = {
  Hoedjes:  150,  // bovenop het hoofd
  Brillen:  240,  // op de ogen
  Shirtjes: 453,  // om het lijf
  Strikjes: 353,  // om de nek
};

function tekenKleertjesOpKat() {
  const groei = katSchaal / 0.6;  // kleertjes krimpen mee met de kat
  for (const kast of kasten) {
    const i = gedragen[kast.naam];
    if (i !== null) {
      ctx.save();
      ctx.translate(katX, katY + (kleertjesHoogte[kast.naam] - 350) * katSchaal);
      ctx.scale(groei, groei);
      tekenKleding(kast.spullen[i]);
      ctx.restore();
    }
  }
}

// ----- De make-up tafel (kaptafel met spiegel) -----
// De spiegel (achter de kat)
function tekenSpiegel() {
  // Spiegel met gouden rand
  ctx.beginPath();
  ctx.ellipse(675, 410, 72, 74, 0, 0, Math.PI * 2);
  vulEnLijn('#ffd93b', 7);
  ctx.beginPath();
  ctx.ellipse(675, 410, 58, 60, 0, 0, Math.PI * 2);
  vulEnLijn('#dff6ff', 4);
  // Glans in de spiegel
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(650, 387); ctx.lineTo(672, 409);
  ctx.moveTo(662, 381); ctx.lineTo(694, 413);
  ctx.stroke();
  // Lampjes rond de spiegel
  for (const hoek of [3.49, 4.19, 5.24, 5.93]) {
    ctx.beginPath();
    ctx.arc(675 + 86 * Math.cos(hoek), 410 + 88 * Math.sin(hoek), 8, 0, Math.PI * 2);
    vulEnLijn('#fff3b0', 3);
  }
}

// De tafel zelf (vóór de kat, zodat hij er echt aan zit!)
function tekenTafel() {
  // Tafelblad
  ctx.beginPath();
  ctx.roundRect(568, 486, 214, 20, 8);
  vulEnLijn(KAST_HOUT, 6);
  // Poten
  ctx.beginPath();
  ctx.rect(586, 506, 16, 78);
  vulEnLijn(KAST_HOUT_DONKER, 5);
  ctx.beginPath();
  ctx.rect(748, 506, 16, 78);
  vulEnLijn(KAST_HOUT_DONKER, 5);
  // Lippenstift op de tafel
  ctx.beginPath();
  ctx.roundRect(608, 460, 12, 26, 3);
  vulEnLijn('#c56cf0', 3);
  ctx.beginPath();
  ctx.roundRect(609, 448, 10, 14, 4);
  vulEnLijn('#e94560', 3);
  // Parfumflesje
  ctx.beginPath();
  ctx.roundRect(728, 456, 22, 30, 6);
  vulEnLijn('#7bed9f', 3);
  ctx.beginPath();
  ctx.rect(734, 446, 10, 10);
  vulEnLijn('#ffd93b', 3);
}

// ----- Het make-up keuzepaneel (zichtbaar als de kat bij de kaptafel zit) -----
const gezichtKnoppen = ['blij', 'knipoog', 'verliefd', 'verrast', 'slaperig', 'boos'];
const makeupKnoppen = ['lippen', 'wimpers', 'glitters', 'oogschaduw', 'sproetjes'];

// Waar staat knopje nummer i van rij 0 (gezichtjes) of rij 1 (make-up)?
function knopPlek(rij, i) {
  return { x: 72 + i * 76, y: rij === 0 ? 398 : 508 };
}

function knopAchtergrond(plek, actief) {
  ctx.beginPath();
  ctx.roundRect(plek.x - 32, plek.y - 32, 64, 64, 12);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = actief ? '#ffd93b' : LIJN;
  ctx.lineWidth = actief ? 6 : 3;
  ctx.stroke();
}

function tekenMiniGezicht(soort, cx, cy) {
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  vulEnLijn(VACHT, 3);
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 3;
  ctx.fillStyle = LIJN;

  // Oogjes
  if (soort === 'verliefd') {
    hartje(cx - 9, cy - 5, 0.35, '#ff4d6d');
    hartje(cx + 9, cy - 5, 0.35, '#ff4d6d');
  } else if (soort === 'slaperig' || soort === 'knipoog') {
    if (soort === 'knipoog') {
      ctx.beginPath();
      ctx.arc(cx - 9, cy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 6);
      ctx.quadraticCurveTo(cx - 9, cy + 1, cx - 3, cy - 6);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy - 6);
    ctx.quadraticCurveTo(cx + 9, cy + 1, cx + 15, cy - 6);
    ctx.stroke();
  } else if (soort === 'verrast') {
    for (const dx of [-9, 9]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy - 5, 6, 0, Math.PI * 2);
      vulEnLijn('white', 2);
      ctx.fillStyle = LIJN;
      ctx.beginPath();
      ctx.arc(cx + dx, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    for (const dx of [-9, 9]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (soort === 'boos') {
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 16); ctx.lineTo(cx - 4, cy - 11);
      ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx + 4, cy - 11);
      ctx.stroke();
    }
  }

  // Mondje
  ctx.strokeStyle = LIJN;
  if (soort === 'verrast') {
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (soort === 'slaperig') {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 10); ctx.lineTo(cx + 6, cy + 10);
    ctx.stroke();
  } else if (soort === 'boos') {
    ctx.beginPath();
    ctx.arc(cx, cy + 16, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 8, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
}

function tekenMiniMakeup(naam, cx, cy) {
  if (naam === 'lippen') {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 16, 9, 0, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy); ctx.lineTo(cx + 14, cy);
    ctx.stroke();
  } else if (naam === 'wimpers') {
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 4);
    ctx.quadraticCurveTo(cx, cy + 14, cx + 12, cy + 4);
    ctx.moveTo(cx - 10, cy + 2); ctx.lineTo(cx - 14, cy - 8);
    ctx.moveTo(cx, cy + 5);      ctx.lineTo(cx, cy - 7);
    ctx.moveTo(cx + 10, cy + 2); ctx.lineTo(cx + 14, cy - 8);
    ctx.stroke();
  } else if (naam === 'glitters') {
    ster(cx - 4, cy + 2, 12, '#ffd93b');
    ster(cx + 13, cy - 11, 6, '#c8a2ff');
  } else if (naam === 'oogschaduw') {
    ctx.fillStyle = '#c8a2ff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 16, 10, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy); ctx.lineTo(cx + 16, cy);
    ctx.stroke();
  } else if (naam === 'sproetjes') {
    ctx.fillStyle = '#b5773a';
    for (const [dx, dy] of [[-10, -4], [0, 2], [10, -4], [-5, 8], [7, 8]]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function tekenMakeupPaneel() {
  ctx.beginPath();
  ctx.roundRect(24, 330, 505, 225, 16);
  vulEnLijn('#ffeef7', 5);

  ctx.textAlign = 'left';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText('Kies een gezichtje:', 44, 358);
  ctx.fillText('Kies make-up:', 44, 468);

  gezichtKnoppen.forEach((naam, i) => {
    const plek = knopPlek(0, i);
    knopAchtergrond(plek, gezicht === naam);
    tekenMiniGezicht(naam, plek.x, plek.y);
  });
  makeupKnoppen.forEach((naam, i) => {
    const plek = knopPlek(1, i);
    knopAchtergrond(plek, makeup[naam]);
    tekenMiniMakeup(naam, plek.x, plek.y);
  });
}

function tekenAlles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Eerst de spullen achteraan: de spiegel en de kasten
  tekenSpiegel();
  for (const kast of kasten) {
    tekenKast(kast);
  }
  if (zitBijKaptafel) {
    // De kat zit AAN de tafel: kat achter het tafelblad
    tekenKat();
    tekenKleertjesOpKat();
    tekenTafel();
    tekenMakeupPaneel();
  } else {
    // De kat staat gewoon in de kamer: alles achter de kat
    tekenTafel();
    tekenKat();
    tekenKleertjesOpKat();
  }
}

// Klikken op kleertjes in de kast
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const muisX = event.clientX - rect.left;
  const muisY = event.clientY - rect.top;

  // Klik op een knopje van het make-up paneel?
  if (zitBijKaptafel) {
    let ietsGekozen = false;
    gezichtKnoppen.forEach((naam, i) => {
      const plek = knopPlek(0, i);
      if (Math.abs(muisX - plek.x) < 32 && Math.abs(muisY - plek.y) < 32) {
        gezicht = naam;
        ietsGekozen = true;
      }
    });
    makeupKnoppen.forEach((naam, i) => {
      const plek = knopPlek(1, i);
      if (Math.abs(muisX - plek.x) < 32 && Math.abs(muisY - plek.y) < 32) {
        makeup[naam] = !makeup[naam];  // aan of weer uit
        ietsGekozen = true;
      }
    });
    if (ietsGekozen) {
      tekenAlles();
      return;
    }
  }

  for (const kast of kasten) {
    kast.spullen.forEach((spul, i) => {
      const plek = spulPositie(kast, i);
      const afstand = Math.hypot(muisX - plek.x, muisY - plek.y);
      if (afstand < 24) {
        // Zelfde kledingstuk? Dan doet de kat het weer uit!
        if (gedragen[kast.naam] === i) {
          gedragen[kast.naam] = null;
        } else {
          gedragen[kast.naam] = i;
        }
        tekenAlles();
      }
    });
  }

  // Klik op de make-up tafel? Dan gaat de kat er (weer uit) zitten!
  if (muisX > 560 && muisX < 795 && muisY > 335 && muisY < 590) {
    zitBijKaptafel = !zitBijKaptafel;
    if (zitBijKaptafel) {
      // De kat gaat voor de spiegel zitten
      katX = 645;
      katY = 528;
      katSchaal = 0.38;
    } else {
      // De kat gaat terug naar zijn plekje (make-up blijft op!)
      katX = 240;
      katY = 445;
      katSchaal = 0.6;
    }
    tekenAlles();
  }
});

// ----- Lopen met de pijltjes (of WASD) -----
const toetsen = {};

window.addEventListener('keydown', (event) => {
  toetsen[event.key.toLowerCase()] = true;
  // Zorg dat de pagina niet scrollt met de pijltjes
  if (event.key.startsWith('Arrow')) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  toetsen[event.key.toLowerCase()] = false;
});

function beweeg() {
  const snelheid = 5;
  const wilLopen =
    toetsen['arrowleft'] || toetsen['a'] ||
    toetsen['arrowright'] || toetsen['d'] ||
    toetsen['arrowup'] || toetsen['w'] ||
    toetsen['arrowdown'] || toetsen['s'];

  if (zitBijKaptafel && wilLopen) {
    // De kat staat op van de kaptafel en gaat weer lopen
    zitBijKaptafel = false;
    katSchaal = 0.6;
    katX = 520;
    katY = 445;
  }

  if (!zitBijKaptafel) {
    if (toetsen['arrowleft'] || toetsen['a'])  katX -= snelheid;
    if (toetsen['arrowright'] || toetsen['d']) katX += snelheid;
    if (toetsen['arrowup'] || toetsen['w'])    katY -= snelheid;
    if (toetsen['arrowdown'] || toetsen['s'])  katY += snelheid;

    // Niet van het scherm af lopen!
    katX = Math.max(90, Math.min(710, katX));
    katY = Math.max(350, Math.min(460, katY));
  }

  tekenAlles();
  requestAnimationFrame(beweeg);
}

beweeg();
