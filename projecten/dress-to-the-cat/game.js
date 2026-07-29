// Dress the Cat 😺 - een super schattige cartoon kat!
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Kleuren van de kat
const LIJN = '#3b2b20';        // dikke tekenlijn (donkerbruin)
const VACHT = '#a4b0be';       // grijze vacht
const VACHT_LICHT = '#ffffff'; // witte buik en snoetje
const OOR_ROZE = '#ffb3c6';    // binnenkant oortjes
const BLOS = '#ff9eb5';        // blosjes

// Waar staat de kat en hoe groot is hij? (kan veranderen als hij ergens gaat zitten)
let katX = 240;
let katY = 445;
let katSchaal = 0.6;
let zitBijKaptafel = false;  // zit de kat bij de make-up tafel?
let inSpiegel = false;       // kijken we in de spiegel? (close-up van het gezicht)

// De tijd! Binnen 1:30 moet de kat helemaal aangekleed zijn
let tijdOver = 90;           // seconden (1:30)
let spelStatus = 'spelen';   // 'spelen', 'catwalk' of 'jury'

// De catwalk-show!
let poseActief = null;       // welke pose doet de kat nu?
let poseTimer = 0;           // hoe lang de pose al bezig is
let poseHoek = 0;            // schuin staan tijdens een pose
let posesGedaan = 0;         // hoeveel poses je al gedaan hebt
let jurySterren = 0;         // hoeveel sterren de jury geeft

// Opgeslagen sterren (blijven bewaard, ook als je de pagina sluit!)
let besteSterren = Number(localStorage.getItem('dressTheCat.beste')) || 0;
let totaalSterren = Number(localStorage.getItem('dressTheCat.totaal')) || 0;

// De thema's! Elke ronde krijg je er eentje — kleed je erbij aan!
const themas = [
  { naam: 'Piraten',        items: ['piratenHoed', 'piratenShirt', 'halsdoek', 'ooglap', 'streepShirt'] },
  { naam: 'Prinsessen',     items: ['prinsessenHoed', 'prinsessenJurk', 'parelStrik', 'kroon', 'diamantenKroon', 'ketting', 'hartjesbril', 'hartShirt'] },
  { naam: 'Goud & Glitter', items: ['goudenShirt', 'goudenBril', 'diamantenKroon', 'kroon', 'diamantKetting', 'sterrenbril', 'medaille', 'regenboogKetting'] },
  { naam: 'Regenboog',      items: ['regenboogShirt', 'regenboogStrik', 'regenboogKetting', 'sterrenbril', 'feestHoed', 'bloemenKrans'] },
  { naam: 'Stoer',          items: ['zonnebril', 'pet', 'ooglap', 'robotBril', 'piratenHoed', 'streepShirt', 'cowboyHoed', 'vikingHelm', 'voetbalShirt'] },
  { naam: 'Feest',          items: ['feestHoed', 'vlinderdas', 'sterShirt', 'medaille', 'sterrenbril', 'drieDBril', 'belletjesKetting', 'smoking', 'bloemenKrans'] },
  { naam: 'Winter',         items: ['kerstMuts', 'winterTrui', 'winterSjaal', 'sjaal', 'kristallenVlinder'] },
  { naam: 'Superhelden',    items: ['heldenMasker', 'heldenPak', 'heldenCape', 'robotBril'] },
  { naam: 'Ruimte',         items: ['astronautenHelm', 'galaxyShirt', 'robotBril', 'sterrenbril'] },
];

let huidigThema = themas[Math.floor(Math.random() * themas.length)];
let juryThemaAantal = 0;  // hoeveel kleren pasten bij het thema

function kiesThema() {
  huidigThema = themas[Math.floor(Math.random() * themas.length)];
}

const poseKnoppen = [
  { naam: 'Zwaai',  pose: 'zwaai' },
  { naam: 'Spring', pose: 'spring' },
  { naam: 'Draai',  pose: 'draai' },
];
let kijkRichting = 1;        // 1 = naar rechts kijken, -1 = naar links
let loopTijd = 0;            // telt op tijdens het lopen (voor het huppelen)
let huppel = 0;              // hoe hoog de kat nu huppelt

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
  // Verplaats en verklein de hele kat (en spiegel hem als hij naar links kijkt)
  ctx.save();
  ctx.translate(katX, katY - huppel);
  ctx.rotate(poseHoek);
  ctx.scale(katSchaal * kijkRichting, katSchaal);
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

// ----- De Sterren-Winkel! -----
let inWinkel = false;  // zijn we in de winkel?

const winkelSpullen = [
  { kastNaam: 'Brillen',  id: 'sterrenbril',    naam: 'Sterrenbril',    prijs: 2 },
  { kastNaam: 'Hoedjes',  id: 'tovenaarsHoed',  naam: 'Tovenaarshoed',  prijs: 3 },
  { kastNaam: 'Strikjes', id: 'regenboogStrik', naam: 'Regenboogstrik', prijs: 4 },
  { kastNaam: 'Shirtjes', id: 'goudenShirt',    naam: 'Gouden shirt',   prijs: 5 },
  { kastNaam: 'Brillen',  id: 'robotBril',      naam: 'Robotbril',      prijs: 6 },
  { kastNaam: 'Strikjes', id: 'diamantKetting', naam: 'Diamanten ketting', prijs: 7 },
  { kastNaam: 'Hoedjes',  id: 'eenhoornHoorn',  naam: 'Eenhoorn-hoorn', prijs: 8 },
  { kastNaam: 'Shirtjes', id: 'koningsMantel',  naam: 'Koningsmantel',  prijs: 10 },
  // Bladzijde 2!
  { kastNaam: 'Brillen',  id: 'monocle',          naam: 'Monocle',           prijs: 3 },
  { kastNaam: 'Hoedjes',  id: 'cowboyHoed',       naam: 'Cowboyhoed',        prijs: 4 },
  { kastNaam: 'Brillen',  id: 'drieDBril',        naam: '3D-bril',           prijs: 4 },
  { kastNaam: 'Strikjes', id: 'bloemenKrans',     naam: 'Bloemenkrans',      prijs: 4 },
  { kastNaam: 'Strikjes', id: 'belletjesKetting', naam: 'Belletjesketting',  prijs: 5 },
  { kastNaam: 'Shirtjes', id: 'voetbalShirt',     naam: 'Voetbalshirt',      prijs: 5 },
  { kastNaam: 'Hoedjes',  id: 'vikingHelm',       naam: 'Vikinghelm',        prijs: 6 },
  { kastNaam: 'Shirtjes', id: 'smoking',          naam: 'Smoking',           prijs: 7 },
];

let winkelPagina = 0;  // welke bladzijde van de kleren-tab (0 of 1)

// De luxe-afdeling: superduur, maar oh zo mooi!
const winkelLuxe = [
  { kastNaam: 'Brillen',  id: 'goudenBril',        naam: 'Gouden bril',       prijs: 15 },
  { kastNaam: 'Hoedjes',  id: 'diamantenKroon',    naam: 'Diamanten kroon',   prijs: 20 },
  { kastNaam: 'Brillen',  id: 'diamantenBril',     naam: 'Diamanten bril',    prijs: 22 },
  { kastNaam: 'Strikjes', id: 'regenboogKetting',  naam: 'Regenboogketting',  prijs: 25 },
  { kastNaam: 'Strikjes', id: 'kristallenVlinder', naam: 'Kristallen vlinder', prijs: 26 },
  { kastNaam: 'Shirtjes', id: 'galaxyShirt',       naam: 'Galaxy shirt',      prijs: 30 },
  { kastNaam: 'Hoedjes',  id: 'astronautenHelm',   naam: 'Astronautenhelm',   prijs: 35 },
  { kastNaam: 'Shirtjes', id: 'ridderHarnas',      naam: 'Ridderharnas',      prijs: 40 },
];

// Complete sets: alles past bij elkaar!
const winkelSets = [
  { id: 'piratenSet', naam: 'Piratenset', prijs: 12, items: [
    { kastNaam: 'Hoedjes',  id: 'piratenHoed' },
    { kastNaam: 'Shirtjes', id: 'piratenShirt' },
    { kastNaam: 'Strikjes', id: 'halsdoek' },
  ]},
  { id: 'prinsessenSet', naam: 'Prinsessenset', prijs: 15, items: [
    { kastNaam: 'Hoedjes',  id: 'prinsessenHoed' },
    { kastNaam: 'Shirtjes', id: 'prinsessenJurk' },
    { kastNaam: 'Strikjes', id: 'parelStrik' },
  ]},
  { id: 'winterSet', naam: 'Winterset', prijs: 14, items: [
    { kastNaam: 'Hoedjes',  id: 'kerstMuts' },
    { kastNaam: 'Shirtjes', id: 'winterTrui' },
    { kastNaam: 'Strikjes', id: 'winterSjaal' },
  ]},
  { id: 'heldenSet', naam: 'Superheldenset', prijs: 18, items: [
    { kastNaam: 'Brillen',  id: 'heldenMasker' },
    { kastNaam: 'Shirtjes', id: 'heldenPak' },
    { kastNaam: 'Strikjes', id: 'heldenCape' },
  ]},
];

let winkelTab = 'kleren';  // welk tabblad: 'kleren' of 'sets'
let openKast = null;       // welke kast staat er open? (null = geen)

// Wat je gekocht hebt, blijft van jou (opgeslagen!)
const gekocht = JSON.parse(localStorage.getItem('dressTheCat.gekocht') || '[]');
for (const spul of [...winkelSpullen, ...winkelLuxe]) {
  if (gekocht.includes(spul.id)) {
    kasten.find(kast => kast.naam === spul.kastNaam).spullen.push(spul.id);
  }
}
for (const set of winkelSets) {
  if (gekocht.includes(set.id)) {
    for (const item of set.items) {
      kasten.find(kast => kast.naam === item.kastNaam).spullen.push(item.id);
    }
  }
}

function koop(spul) {
  if (gekocht.includes(spul.id) || totaalSterren < spul.prijs) return;
  totaalSterren -= spul.prijs;
  gekocht.push(spul.id);
  localStorage.setItem('dressTheCat.totaal', totaalSterren);
  localStorage.setItem('dressTheCat.gekocht', JSON.stringify(gekocht));
  // Het nieuwe kledingstuk ligt meteen in de kast!
  kasten.find(kast => kast.naam === spul.kastNaam).spullen.push(spul.id);
}

function koopSet(set) {
  if (gekocht.includes(set.id) || totaalSterren < set.prijs) return;
  totaalSterren -= set.prijs;
  gekocht.push(set.id);
  for (const item of set.items) {
    gekocht.push(item.id);  // telt ook mee voor jury-bonus!
    kasten.find(kast => kast.naam === item.kastNaam).spullen.push(item.id);
  }
  localStorage.setItem('dressTheCat.totaal', totaalSterren);
  localStorage.setItem('dressTheCat.gekocht', JSON.stringify(gekocht));
}

// Waar ligt spulletje nummer i in de kast? (4 per plank, 2 planken)
function spulPositie(kast, i) {
  const spulAfstand = (KAST_BREEDTE - 24) / 4;
  const rij = Math.floor(i / 4);
  const kolom = i % 4;
  const aantalInRij = Math.min(kast.spullen.length - rij * 4, 4);
  const middenOffset = (4 - aantalInRij) * spulAfstand / 2;
  return {
    x: kast.x + 12 + middenOffset + spulAfstand * kolom + spulAfstand / 2,
    y: kast.y + 100 + rij * 50,
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

  tovenaarsHoed() {
    // Paarse punthoed met sterren
    ctx.beginPath();
    ctx.ellipse(0, 2, 70, 13, 0, 0, Math.PI * 2);
    vulEnLijn('#6c5ce7', 6);
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(0, -95);
    ctx.lineTo(45, 0);
    ctx.closePath();
    vulEnLijn('#6c5ce7', 6);
    ster(12, -28, 8, '#ffd93b');
    ster(-13, -52, 6, '#ffd93b');
  },

  sterrenbril() {
    // Pootjes en brug
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-52, -2); ctx.lineTo(-72, -8);
    ctx.moveTo(52, -2);  ctx.lineTo(72, -8);
    ctx.moveTo(-14, -2); ctx.lineTo(14, -2);
    ctx.stroke();
    // Ster-vormige glazen!
    ster(-33, -2, 26, '#ffd93b');
    ster(33, -2, 26, '#ffd93b');
  },

  goudenShirt() {
    shirtVorm('#ffd93b');
    // Glinsterende sterretjes
    ster(-30, -20, 7, 'white');
    ster(25, 12, 8, 'white');
    ster(5, -32, 5, 'white');
  },

  regenboogStrik() {
    // Drie strikken over elkaar = regenboog!
    strikVorm('#ff6b6b', false);
    ctx.save();
    ctx.scale(0.72, 0.72);
    strikVorm('#ffd93b', false);
    ctx.restore();
    ctx.save();
    ctx.scale(0.45, 0.45);
    strikVorm('#54a0ff', false);
    ctx.restore();
  },

  eenhoornHoorn() {
    // Gouden hoorn met roze spiraal
    ctx.beginPath();
    ctx.moveTo(-16, 5);
    ctx.lineTo(0, -70);
    ctx.lineTo(16, 5);
    ctx.closePath();
    vulEnLijn('#ffd93b', 5);
    ctx.strokeStyle = '#ff9ff3';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-12, -10); ctx.lineTo(12, -16);
    ctx.moveTo(-9, -28);  ctx.lineTo(9, -33);
    ctx.moveTo(-5, -46);  ctx.lineTo(5, -50);
    ctx.stroke();
    ster(26, -40, 6, '#ff9ff3');
    ster(-26, -22, 5, '#54a0ff');
  },

  robotBril() {
    // Bandjes naar de oren
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, -2); ctx.lineTo(-78, -8);
    ctx.moveTo(60, -2);  ctx.lineTo(78, -8);
    ctx.stroke();
    // Donkere robotband
    ctx.beginPath();
    ctx.roundRect(-60, -18, 120, 36, 10);
    vulEnLijn('#2f3542', 5);
    // Gloeiende streep
    ctx.beginPath();
    ctx.roundRect(-50, -10, 100, 20, 8);
    vulEnLijn('#00d2d3', 3);
    // Rood lampje
    ctx.beginPath();
    ctx.arc(66, -14, 6, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
  },

  koningsMantel() {
    shirtVorm('#e94560');
    // Witte koningskraag met zwarte stipjes
    ctx.beginPath();
    ctx.roundRect(-70, -60, 140, 20, 8);
    vulEnLijn('white', 4);
    ctx.fillStyle = LIJN;
    for (const sx of [-50, -25, 0, 25, 50]) {
      ctx.beginPath();
      ctx.arc(sx, -50, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Gouden rand onderaan
    ctx.beginPath();
    ctx.roundRect(-68, 40, 136, 12, 5);
    vulEnLijn('#ffd93b', 3);
  },

  diamantKetting() {
    // Zilveren kettinkje
    for (let t = 0; t <= Math.PI; t += Math.PI / 10) {
      const px = 44 * Math.cos(t);
      const py = 14 * Math.sin(t) + 2;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      vulEnLijn('#dcdde1', 2);
    }
    // Glimmende diamant
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(-13, 27);
    ctx.lineTo(0, 46);
    ctx.lineTo(13, 27);
    ctx.closePath();
    vulEnLijn('#7ed6df', 4);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-5, 24); ctx.lineTo(3, 32);
    ctx.stroke();
  },

  piratenHoed() {
    // Zwarte piratenhoed met omhoog gekrulde randen
    ctx.beginPath();
    ctx.moveTo(-78, 0);
    ctx.quadraticCurveTo(-40, -60, 0, -62);
    ctx.quadraticCurveTo(40, -60, 78, 0);
    ctx.quadraticCurveTo(40, -18, 0, -16);
    ctx.quadraticCurveTo(-40, -18, -78, 0);
    ctx.closePath();
    vulEnLijn('#2f3542', 6);
    // Doodshoofdje
    ctx.beginPath();
    ctx.arc(0, -38, 9, 0, Math.PI * 2);
    vulEnLijn('white', 3);
    ctx.fillStyle = LIJN;
    ctx.beginPath();
    ctx.arc(-3, -40, 1.8, 0, Math.PI * 2);
    ctx.arc(3, -40, 1.8, 0, Math.PI * 2);
    ctx.fill();
  },

  piratenShirt() {
    shirtVorm('white');
    // Zwarte piratenstrepen
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-64, -38, 128, 12);
    ctx.fillRect(-64, -12, 128, 12);
    ctx.fillRect(-64, 14, 128, 12);
  },

  halsdoek() {
    // Rode piratenhalsdoek
    ctx.beginPath();
    ctx.moveTo(-42, -6);
    ctx.lineTo(42, -6);
    ctx.lineTo(0, 40);
    ctx.closePath();
    vulEnLijn('#e94560', 5);
    ctx.fillStyle = 'white';
    for (const [sx, sy] of [[-14, 4], [12, 6], [0, 22]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  prinsessenHoed() {
    // Roze puntmuts met wapperende sluier
    ctx.strokeStyle = '#ffe3ec';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(2, -78);
    ctx.quadraticCurveTo(45, -52, 58, -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-35, 5);
    ctx.lineTo(0, -85);
    ctx.lineTo(35, 5);
    ctx.closePath();
    vulEnLijn('#ff9ff3', 5);
    ster(0, -30, 8, '#ffd93b');
  },

  prinsessenJurk() {
    shirtVorm('#ff9ff3');
    // Glitters en een gouden randje
    ster(-28, -22, 6, 'white');
    ster(22, 4, 7, 'white');
    ster(-6, 24, 5, 'white');
    ctx.beginPath();
    ctx.roundRect(-68, 40, 136, 12, 5);
    vulEnLijn('#ffd93b', 3);
  },

  parelStrik() {
    // Zachtroze strik met witte stipjes
    strikVorm('#ffc2d1', true);
    // Grote parel op het knoopje
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    vulEnLijn('white', 2);
  },

  diamantenKroon() {
    // Grote gouden kroon
    ctx.beginPath();
    ctx.moveTo(-60, 14);
    ctx.lineTo(-60, -20);
    ctx.lineTo(-32, -4);
    ctx.lineTo(0, -36);
    ctx.lineTo(32, -4);
    ctx.lineTo(60, -20);
    ctx.lineTo(60, 14);
    ctx.closePath();
    vulEnLijn('#ffd93b', 6);
    // Grote diamant op de top
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(-8, -42);
    ctx.lineTo(0, -32);
    ctx.lineTo(8, -42);
    ctx.closePath();
    vulEnLijn('#7ed6df', 3);
    // Diamantjes op de zijpunten
    for (const dx of [-60, 60]) {
      ctx.beginPath();
      ctx.arc(dx, -24, 6, 0, Math.PI * 2);
      vulEnLijn('#7ed6df', 3);
    }
    // Edelstenen op de band
    ctx.beginPath();
    ctx.arc(-30, 4, 5, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
    ctx.beginPath();
    ctx.arc(0, 2, 5, 0, Math.PI * 2);
    vulEnLijn('#2ed573', 3);
    ctx.beginPath();
    ctx.arc(30, 4, 5, 0, Math.PI * 2);
    vulEnLijn('#a55eea', 3);
  },

  goudenBril() {
    // Gouden pootjes en brug
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-52, -2); ctx.lineTo(-72, -8);
    ctx.moveTo(52, -2);  ctx.lineTo(72, -8);
    ctx.moveTo(-14, -2); ctx.lineTo(14, -2);
    ctx.stroke();
    // Gouden ronde glazen
    for (const bx of [-33, 33]) {
      ctx.beginPath();
      ctx.arc(bx, -2, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = LIJN;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ster(46, -16, 5, 'white');
    ster(-20, -14, 4, 'white');
  },

  galaxyShirt() {
    // Donkerpaars sterrenhemel-shirt
    shirtVorm('#4834d4');
    // Maantje
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(22, -14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4834d4';
    ctx.beginPath();
    ctx.arc(27, -17, 9, 0, Math.PI * 2);
    ctx.fill();
    // Sterretjes overal
    ster(-30, -24, 5, 'white');
    ster(-12, 4, 4, '#ffd93b');
    ster(24, 20, 5, 'white');
    ster(-38, 24, 4, '#ffd93b');
    ster(2, -34, 3, 'white');
  },

  regenboogKetting() {
    // Zilveren kettinkje
    for (let t = 0; t <= Math.PI; t += Math.PI / 10) {
      const px = 44 * Math.cos(t);
      const py = 14 * Math.sin(t) + 2;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      vulEnLijn('#dcdde1', 2);
    }
    // Vijf gekleurde edelsteentjes
    const stenen = [
      [-40, 10, '#e94560'],
      [-20, 20, '#ffa502'],
      [0, 26, '#ffd93b'],
      [20, 20, '#2ed573'],
      [40, 10, '#54a0ff'],
    ];
    for (const [sx, sy, kleur] of stenen) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - 7, sy + 9);
      ctx.lineTo(sx, sy + 20);
      ctx.lineTo(sx + 7, sy + 9);
      ctx.closePath();
      vulEnLijn(kleur, 3);
    }
  },

  cowboyHoed() {
    // Bruine cowboyhoed
    ctx.beginPath();
    ctx.ellipse(0, 2, 85, 16, 0, 0, Math.PI * 2);
    vulEnLijn('#b5773a', 6);
    ctx.beginPath();
    ctx.arc(0, 0, 42, Math.PI, 0);
    ctx.closePath();
    vulEnLijn('#b5773a', 6);
    ctx.beginPath();
    ctx.rect(-42, -14, 84, 12);
    vulEnLijn('#6b4423', 4);
  },

  vikingHelm() {
    // Witte hoorns
    ctx.beginPath();
    ctx.moveTo(-48, -8);
    ctx.quadraticCurveTo(-88, -28, -78, -64);
    ctx.quadraticCurveTo(-60, -34, -40, -22);
    ctx.closePath();
    vulEnLijn('white', 5);
    ctx.beginPath();
    ctx.moveTo(48, -8);
    ctx.quadraticCurveTo(88, -28, 78, -64);
    ctx.quadraticCurveTo(60, -34, 40, -22);
    ctx.closePath();
    vulEnLijn('white', 5);
    // Grijze helm
    ctx.beginPath();
    ctx.arc(0, 4, 54, Math.PI, 0);
    ctx.closePath();
    vulEnLijn('#95a5a6', 6);
    ctx.beginPath();
    ctx.rect(-56, 0, 112, 12);
    vulEnLijn('#7f8c8d', 4);
  },

  monocle() {
    // Deftig gouden monocle voor één oog
    ctx.beginPath();
    ctx.arc(33, -2, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
    ctx.fill();
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 6;
    ctx.stroke();
    // Kettinkje naar beneden
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(45, 14);
    ctx.quadraticCurveTo(58, 40, 48, 62);
    ctx.stroke();
  },

  drieDBril() {
    // Witte 3D-bril met rood en blauw glas
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-56, -4); ctx.lineTo(-76, -10);
    ctx.moveTo(56, -4);  ctx.lineTo(76, -10);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-56, -18, 112, 34, 8);
    vulEnLijn('white', 5);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(-46, -10, 40, 18);
    ctx.fillStyle = '#54a0ff';
    ctx.fillRect(6, -10, 40, 18);
  },

  voetbalShirt() {
    shirtVorm('#ffa502');
    // Rugnummer 10!
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('10', 0, 16);
  },

  smoking() {
    // Chique zwart pak
    shirtVorm('#2f3542');
    // Wit overhemd
    ctx.beginPath();
    ctx.moveTo(-20, -52);
    ctx.lineTo(20, -52);
    ctx.lineTo(0, 14);
    ctx.closePath();
    vulEnLijn('white', 4);
    // Knoopjes
    ctx.fillStyle = LIJN;
    ctx.beginPath();
    ctx.arc(0, 24, 3, 0, Math.PI * 2);
    ctx.arc(0, 38, 3, 0, Math.PI * 2);
    ctx.fill();
    // Rood vlinderdasje
    ctx.save();
    ctx.translate(0, -48);
    ctx.scale(0.4, 0.4);
    strikVorm('#e94560', false);
    ctx.restore();
  },

  bloemenKrans() {
    // Hawaii-bloemenketting!
    const bloemKleuren = ['#ff9ff3', '#ffd93b', '#ff6b81', '#54a0ff', '#ff9ff3', '#ffd93b', '#ff6b81'];
    let k = 0;
    for (let t = 0; t <= Math.PI; t += Math.PI / 6) {
      const bx = 46 * Math.cos(t);
      const by = 16 * Math.sin(t) + 6;
      ctx.fillStyle = bloemKleuren[k++];
      for (let b = 0; b < 5; b++) {
        const hoek = b * (Math.PI * 2 / 5);
        ctx.beginPath();
        ctx.arc(bx + 6 * Math.cos(hoek), by + 6 * Math.sin(hoek), 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  belletjesKetting() {
    // Zilveren kettinkje
    for (let t = 0; t <= Math.PI; t += Math.PI / 10) {
      const px = 44 * Math.cos(t);
      const py = 14 * Math.sin(t) + 2;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      vulEnLijn('#dcdde1', 2);
    }
    // Drie gouden belletjes
    for (const [bx, by] of [[-22, 16], [0, 24], [22, 16]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 9, 0, Math.PI * 2);
      vulEnLijn('#ffd93b', 3);
      ctx.strokeStyle = LIJN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by + 4);
      ctx.lineTo(bx + 4, by + 4);
      ctx.stroke();
    }
  },

  heldenMasker() {
    // Blauw superheldenmasker
    ctx.beginPath();
    ctx.roundRect(-56, -20, 112, 38, 16);
    vulEnLijn('#3742fa', 5);
    for (const bx of [-33, 33]) {
      ctx.beginPath();
      ctx.ellipse(bx, -2, 14, 10, 0, 0, Math.PI * 2);
      vulEnLijn('white', 3);
    }
  },

  heldenPak() {
    shirtVorm('#3742fa');
    // Gele bliksem!
    ctx.beginPath();
    ctx.moveTo(-2, -36);
    ctx.lineTo(14, -36);
    ctx.lineTo(4, -6);
    ctx.lineTo(16, -6);
    ctx.lineTo(-8, 34);
    ctx.lineTo(0, 0);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    vulEnLijn('#ffd93b', 4);
  },

  heldenCape() {
    // Rode wapperende cape
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(-62, 52);
    ctx.lineTo(-30, 60);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    vulEnLijn('#e94560', 5);
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(62, 52);
    ctx.lineTo(30, 60);
    ctx.lineTo(4, 12);
    ctx.closePath();
    vulEnLijn('#e94560', 5);
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0, Math.PI * 2);
    vulEnLijn('#ffd93b', 4);
  },

  kerstMuts() {
    // Rode kerstmuts met pompon
    ctx.beginPath();
    ctx.moveTo(-45, 4);
    ctx.quadraticCurveTo(-25, -70, 15, -72);
    ctx.quadraticCurveTo(38, -72, 46, -58);
    ctx.lineTo(45, 4);
    ctx.closePath();
    vulEnLijn('#e94560', 6);
    ctx.beginPath();
    ctx.arc(48, -58, 12, 0, Math.PI * 2);
    vulEnLijn('white', 4);
    ctx.beginPath();
    ctx.roundRect(-50, -4, 100, 18, 9);
    vulEnLijn('white', 4);
  },

  winterTrui() {
    shirtVorm('#54a0ff');
    // Witte sneeuwvlok
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let s = 0; s < 3; s++) {
      const hoek = s * Math.PI / 3;
      ctx.moveTo(-Math.cos(hoek) * 20, -2 - Math.sin(hoek) * 20);
      ctx.lineTo(Math.cos(hoek) * 20, -2 + Math.sin(hoek) * 20);
    }
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, -2, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  winterSjaal() {
    // Dikke blauw-witte wintersjaal
    ctx.beginPath();
    ctx.roundRect(-52, -12, 104, 24, 12);
    vulEnLijn('#74b9ff', 5);
    ctx.beginPath();
    ctx.roundRect(14, 8, 24, 46, 8);
    vulEnLijn('#74b9ff', 5);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-32, -9); ctx.lineTo(-28, 9);
    ctx.moveTo(-8, -9);  ctx.lineTo(-4, 9);
    ctx.moveTo(18, 22);  ctx.lineTo(34, 22);
    ctx.moveTo(18, 40);  ctx.lineTo(34, 40);
    ctx.stroke();
  },

  diamantenBril() {
    // Zilveren bril met diamantjes
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-52, -2); ctx.lineTo(-72, -8);
    ctx.moveTo(52, -2);  ctx.lineTo(72, -8);
    ctx.moveTo(-14, -2); ctx.lineTo(14, -2);
    ctx.stroke();
    for (const bx of [-33, 33]) {
      ctx.beginPath();
      ctx.arc(bx, -2, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 245, 255, 0.6)';
      ctx.fill();
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = 7;
      ctx.stroke();
      // Diamantje bovenop
      ctx.beginPath();
      ctx.moveTo(bx, -28);
      ctx.lineTo(bx - 6, -21);
      ctx.lineTo(bx, -14);
      ctx.lineTo(bx + 6, -21);
      ctx.closePath();
      vulEnLijn('#7ed6df', 2);
    }
  },

  kristallenVlinder() {
    // IJsblauwe vlinderstrik met kristallen
    strikVorm('#7ed6df', false);
    ster(-28, 0, 6, 'white');
    ster(28, 0, 6, 'white');
    // Kristal op het knoopje
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-7, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(7, 0);
    ctx.closePath();
    vulEnLijn('white', 3);
  },

  ridderHarnas() {
    // Zilveren ridderharnas
    shirtVorm('#95a5a6');
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-60, -20); ctx.lineTo(60, -20);
    ctx.moveTo(-64, 6);   ctx.lineTo(64, 6);
    ctx.moveTo(-60, 30);  ctx.lineTo(60, 30);
    ctx.stroke();
    // Gouden ster-embleem
    ster(0, -4, 14, '#ffd93b');
  },

  astronautenHelm() {
    // Witte ruimtehelm
    ctx.beginPath();
    ctx.arc(0, -34, 50, 0, Math.PI * 2);
    vulEnLijn('white', 6);
    // Blauw kijkglas
    ctx.beginPath();
    ctx.roundRect(-32, -56, 64, 42, 16);
    vulEnLijn('#7ed6df', 4);
    // Antenne
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(36, -68);
    ctx.lineTo(52, -88);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(54, -91, 5, 0, Math.PI * 2);
    vulEnLijn('#e94560', 3);
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
  // Kast zelf
  ctx.beginPath();
  ctx.roundRect(kast.x, kast.y, KAST_BREEDTE, KAST_HOOGTE, 12);
  vulEnLijn(KAST_HOUT, 7);

  // Twee dichte deuren
  const deurHoogte = KAST_HOOGTE - 46;
  ctx.beginPath();
  ctx.roundRect(kast.x + 10, kast.y + 34, KAST_BREEDTE / 2 - 12, deurHoogte, 8);
  vulEnLijn(KAST_HOUT_DONKER, 5);
  ctx.beginPath();
  ctx.roundRect(kast.x + KAST_BREEDTE / 2 + 2, kast.y + 34, KAST_BREEDTE / 2 - 12, deurHoogte, 8);
  vulEnLijn(KAST_HOUT_DONKER, 5);

  // Gele deurknopjes
  const knopY = kast.y + 34 + deurHoogte / 2;
  ctx.fillStyle = '#ffd93b';
  for (const dx of [-14, 14]) {
    ctx.beginPath();
    ctx.arc(kast.x + KAST_BREEDTE / 2 + dx, knopY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = LIJN;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Eén kledingstuk als plaatje op de deur (zo weet je wat erin zit!)
  ctx.save();
  ctx.translate(kast.x + KAST_BREEDTE / 2, kast.y + 90 + kast.offsetY * 0.6);
  ctx.scale(kast.schaal * 0.6, kast.schaal * 0.6);
  tekenKleding(kast.spullen[0]);
  ctx.restore();

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
      ctx.translate(katX, katY - huppel);
      ctx.rotate(poseHoek);
      ctx.translate(0, (kleertjesHoogte[kast.naam] - 350) * katSchaal);
      ctx.scale(groei * kijkRichting, groei);
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

// ----- De muur met bloemetjes-behang -----
function tekenMuur() {
  // Lichtroze muur
  ctx.fillStyle = '#ffe3ec';
  ctx.fillRect(0, 0, canvas.width, 300);

  // Bloemetjes op het behang (netjes in rijen, verspringend)
  for (let rij = 0; rij < 4; rij++) {
    const y = 40 + rij * 75;
    const offset = (rij % 2) * 55;
    for (let x = 30 + offset; x < canvas.width; x += 110) {
      // Vijf roze blaadjes
      ctx.fillStyle = '#ffb3c6';
      for (let b = 0; b < 5; b++) {
        const hoek = b * (Math.PI * 2 / 5) - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(x + 8 * Math.cos(hoek), y + 8 * Math.sin(hoek), 6, 0, Math.PI * 2);
        ctx.fill();
      }
      // Geel hartje in het midden
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----- De houten vloer -----
function tekenVloer() {
  // Lichtbruine vloer
  ctx.fillStyle = '#e8be8a';
  ctx.fillRect(0, 300, canvas.width, 300);

  // Planken (horizontale lijnen)
  ctx.strokeStyle = '#cf9f66';
  ctx.lineWidth = 3;
  for (let y = 350; y < 600; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Naden tussen de planken (verspringen per rij, net echt!)
  for (let rij = 0; rij < 6; rij++) {
    const y = 300 + rij * 50;
    const offset = (rij % 2) * 100;
    for (let x = offset; x <= canvas.width; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 50);
      ctx.stroke();
    }
  }

  // Donker randje waar de vloer begint
  ctx.strokeStyle = '#a87b4d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(canvas.width, 300);
  ctx.stroke();
}

// ----- Het spiegelscherm: het gezicht van de kat van heel dichtbij! -----
// Waar staan de knopjes in het spiegelscherm?
function knopPlekSpiegel(rij, i) {
  const aantal = rij === 0 ? gezichtKnoppen.length : makeupKnoppen.length;
  return {
    x: 400 + (i - (aantal - 1) / 2) * 76,
    y: rij === 0 ? 468 : 545,
  };
}

function tekenSpiegelScherm() {
  // Roze achtergrond
  ctx.fillStyle = '#ffe3ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Het spiegelglas
  ctx.beginPath();
  ctx.ellipse(400, 250, 280, 230, 0, 0, Math.PI * 2);
  vulEnLijn('#dff6ff', 4);

  // Het gezicht van de kat, lekker groot!
  ctx.save();
  ctx.translate(400, 290);
  ctx.translate(-400, -250);
  tekenOren();
  tekenKop();
  tekenStreepjes();
  tekenGezicht();
  ctx.restore();

  // Hoedje, bril en strikje doen ook mee in de spiegel
  for (const naam of ['Hoedjes', 'Brillen', 'Strikjes']) {
    const kast = kasten.find(k => k.naam === naam);
    const i = gedragen[naam];
    if (i !== null) {
      ctx.save();
      ctx.translate(400, 290 + (kleertjesHoogte[naam] - 250));
      ctx.scale(1 / 0.6, 1 / 0.6);
      tekenKleding(kast.spullen[i]);
      ctx.restore();
    }
  }

  // Gouden spiegelrand eroverheen
  ctx.beginPath();
  ctx.ellipse(400, 250, 280, 230, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.strokeStyle = LIJN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(400, 250, 288, 238, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Balk met alle knopjes onderaan
  ctx.beginPath();
  ctx.roundRect(60, 428, 680, 152, 16);
  vulEnLijn('#ffeef7', 5);
  gezichtKnoppen.forEach((naam, i) => {
    const plek = knopPlekSpiegel(0, i);
    knopAchtergrond(plek, gezicht === naam);
    tekenMiniGezicht(naam, plek.x, plek.y);
  });
  makeupKnoppen.forEach((naam, i) => {
    const plek = knopPlekSpiegel(1, i);
    knopAchtergrond(plek, makeup[naam]);
    tekenMiniMakeup(naam, plek.x, plek.y);
  });

  // Terug-knop
  ctx.beginPath();
  ctx.roundRect(20, 20, 130, 48, 12);
  vulEnLijn('#e94560', 5);
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Terug', 85, 52);
}

// ----- Het kast-scherm: alles wat er in de kast ligt, lekker groot! -----
// Waar staat kledingstuk nummer i in het kast-scherm? (5 naast elkaar)
function kastSchermPlek(i) {
  return {
    x: 400 + (i % 5 - 2) * 140,
    y: 210 + Math.floor(i / 5) * 155,
  };
}

function tekenKastScherm() {
  // Houten achtergrond, alsof je in de kast kijkt
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = KAST_HOUT_DONKER;
  ctx.lineWidth = 4;
  for (let x = 100; x < canvas.width; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 34px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText(openKast.naam, 400, 100);
  ctx.font = '19px "Segoe UI", sans-serif';
  ctx.fillText('Klik op iets om het aan of uit te doen!', 400, 132);

  // Alle kleren op grote vakjes
  openKast.spullen.forEach((spul, i) => {
    const plek = kastSchermPlek(i);
    const aan = gedragen[openKast.naam] === i;
    ctx.beginPath();
    ctx.roundRect(plek.x - 60, plek.y - 60, 120, 120, 14);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = aan ? '#ffd93b' : LIJN;
    ctx.lineWidth = aan ? 8 : 4;
    ctx.stroke();

    ctx.save();
    ctx.translate(plek.x, plek.y + openKast.offsetY * 1.2);
    ctx.scale(openKast.schaal * 1.2, openKast.schaal * 1.2);
    tekenKleding(spul);
    ctx.restore();
  });

  // Terug-knop
  ctx.beginPath();
  ctx.roundRect(20, 12, 110, 44, 12);
  vulEnLijn('#e94560', 5);
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Terug', 75, 41);
}

// ----- Het sterren-vakje linksboven (met winkel-knop) -----
function tekenSterrenVakje() {
  ctx.beginPath();
  ctx.roundRect(12, 6, 120, 44, 12);
  vulEnLijn('white', 4);
  ster(36, 28, 13, '#ffd93b');
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText(totaalSterren, 60, 37);

  // Winkel-knop ernaast
  ctx.beginPath();
  ctx.roundRect(140, 6, 110, 44, 12);
  vulEnLijn('#ff9ff3', 4);
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Winkel', 195, 35);
}

// Waar staat winkelkaart nummer i? (2 rijen van 4)
function winkelKaartPlek(i) {
  return {
    x: 25 + (i % 4) * 190,
    y: 110 + Math.floor(i / 4) * 240,
  };
}

// De twee tabblad-knoppen bovenin de winkel
function tekenWinkelTabs() {
  const tabs = [
    { naam: 'Kleren', tab: 'kleren', x: 215 },
    { naam: 'Sets',   tab: 'sets',   x: 340 },
    { naam: 'Luxe',   tab: 'luxe',   x: 465 },
  ];
  for (const tab of tabs) {
    const actief = winkelTab === tab.tab;
    ctx.beginPath();
    ctx.roundRect(tab.x, 62, 115, 40, 10);
    vulEnLijn(actief ? '#ffd93b' : 'white', actief ? 5 : 3);
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillStyle = LIJN;
    ctx.fillText(tab.naam, tab.x + 57, 89);
  }
}

// Waar staat set-kaart nummer i? (2 rijen van 2)
function setKaartPlek(i) {
  return {
    x: 60 + (i % 2) * 360,
    y: 115 + Math.floor(i / 2) * 230,
  };
}

// De vier grote set-kaarten
function tekenWinkelSets() {
  winkelSets.forEach((set, i) => {
    const plek = setKaartPlek(i);
    const kx = plek.x;
    const ky = plek.y;
    ctx.beginPath();
    ctx.roundRect(kx, ky, 320, 215, 16);
    vulEnLijn('white', 5);

    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillStyle = LIJN;
    ctx.fillText(set.naam, kx + 160, ky + 34);

    // De drie kledingstukken naast elkaar
    set.items.forEach((item, j) => {
      const kast = kasten.find(k => k.naam === item.kastNaam);
      ctx.save();
      ctx.translate(kx + 70 + j * 90, ky + 95 + kast.offsetY);
      ctx.scale(kast.schaal * 0.95, kast.schaal * 0.95);
      tekenKleding(item.id);
      ctx.restore();
    });

    // De prijs
    ster(kx + 55, ky + 172, 12, '#ffd93b');
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillStyle = LIJN;
    ctx.fillText(set.prijs, kx + 75, ky + 181);

    // Koop-knop
    const alGekocht = gekocht.includes(set.id);
    const kanKopen = !alGekocht && totaalSterren >= set.prijs;
    ctx.beginPath();
    ctx.roundRect(kx + 160, ky + 150, 130, 42, 12);
    vulEnLijn(alGekocht ? '#2ed573' : (kanKopen ? '#54a0ff' : '#dcdde1'), 4);
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "Segoe UI", sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(alGekocht ? 'Gekocht!' : 'Koop set', kx + 225, ky + 177);
  });
}

// ----- Het winkel-scherm -----
function tekenWinkelScherm() {
  ctx.fillStyle = '#ffe3ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText('De Sterren-Winkel', 400, 44);

  tekenWinkelTabs();
  if (winkelTab === 'sets') {
    tekenWinkelSets();
    return;
  }

  // Je sterren-saldo rechtsboven
  ctx.beginPath();
  ctx.roundRect(650, 12, 130, 44, 12);
  vulEnLijn('white', 4);
  ster(676, 34, 12, '#ffd93b');
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText(totaalSterren, 698, 43);

  // Terug-knop
  ctx.beginPath();
  ctx.roundRect(20, 12, 110, 44, 12);
  vulEnLijn('#e94560', 5);
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Terug', 75, 41);

  // Blader-pijltjes bij de kleren-tab (2 bladzijdes!)
  if (winkelTab === 'kleren') {
    for (const pijl of [{ x: 145, teken: '<', pagina: 0 }, { x: 592, teken: '>', pagina: 1 }]) {
      const actief = winkelPagina === pijl.pagina;
      ctx.beginPath();
      ctx.roundRect(pijl.x, 62, 44, 40, 10);
      vulEnLijn(actief ? '#ffd93b' : 'white', actief ? 5 : 3);
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillStyle = LIJN;
      ctx.fillText(pijl.teken, pijl.x + 22, 90);
    }
  }

  // De kaarten met koopwaar (gewone kleren of de luxe-afdeling)
  const kaartLijst = winkelTab === 'luxe'
    ? winkelLuxe
    : winkelSpullen.slice(winkelPagina * 8, winkelPagina * 8 + 8);
  kaartLijst.forEach((spul, i) => {
    const plek = winkelKaartPlek(i);
    ctx.beginPath();
    ctx.roundRect(plek.x, plek.y, 170, 230, 16);
    vulEnLijn('white', 5);

    // Het kledingstuk zelf als plaatje
    const kast = kasten.find(k => k.naam === spul.kastNaam);
    ctx.save();
    ctx.translate(plek.x + 85, plek.y + 75 + kast.offsetY);
    ctx.scale(kast.schaal * 1.4, kast.schaal * 1.4);
    tekenKleding(spul.id);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = LIJN;
    ctx.fillText(spul.naam, plek.x + 85, plek.y + 148);

    // De prijs
    ster(plek.x + 65, plek.y + 168, 10, '#ffd93b');
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(spul.prijs, plek.x + 82, plek.y + 175);

    // Koop-knop: blauw = kan, grijs = te duur, groen = al gekocht
    const alGekocht = gekocht.includes(spul.id);
    const kanKopen = !alGekocht && totaalSterren >= spul.prijs;
    ctx.beginPath();
    ctx.roundRect(plek.x + 25, plek.y + 184, 120, 36, 10);
    vulEnLijn(alGekocht ? '#2ed573' : (kanKopen ? '#54a0ff' : '#dcdde1'), 4);
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px "Segoe UI", sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(alGekocht ? 'Gekocht!' : 'Koop', plek.x + 85, plek.y + 208);
  });
}

// ----- De timer bovenin -----
function tekenTijd() {
  const seconden = Math.ceil(tijdOver);
  const minuten = Math.floor(seconden / 60);
  const rest = seconden % 60;
  const tekst = minuten + ':' + (rest < 10 ? '0' : '') + rest;

  ctx.beginPath();
  ctx.roundRect(340, 6, 120, 44, 12);
  // Rood knipperen als de tijd bijna om is!
  const bijnaOm = tijdOver <= 10 && Math.floor(tijdOver * 2) % 2 === 0;
  vulEnLijn(bijnaOm ? '#e94560' : 'white', 4);
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.fillStyle = bijnaOm ? 'white' : LIJN;
  ctx.fillText(tekst, 400, 39);

  // Het thema van deze ronde (rechtsboven)
  ctx.beginPath();
  ctx.roundRect(550, 6, 240, 44, 12);
  vulEnLijn('#a55eea', 4);
  ctx.font = 'bold 19px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Thema: ' + huidigThema.naam, 670, 34);
}

// ----- De catwalk-show! -----
function tekenCatwalkScherm() {
  // Donkere showzaal
  ctx.fillStyle = '#2c2c54';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Spotlichten op de kat
  ctx.fillStyle = 'rgba(255, 243, 176, 0.22)';
  ctx.beginPath();
  ctx.moveTo(150, 0); ctx.lineTo(330, 600); ctx.lineTo(520, 600);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(650, 0); ctx.lineTo(280, 600); ctx.lineTo(470, 600);
  ctx.closePath();
  ctx.fill();

  // Rood gordijn bovenaan
  ctx.fillStyle = '#e94560';
  ctx.fillRect(0, 0, canvas.width, 55);
  for (let x = 25; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.arc(x, 55, 25, 0, Math.PI);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 34px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffd93b';
  ctx.fillText('CATWALK! Doe je mooiste poses!', 400, 120);
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Thema: ' + huidigThema.naam, 400, 155);

  // Glitterende sterren in de zaal
  ster(90, 200, 10, '#ffd93b');
  ster(710, 180, 12, '#ff9ff3');
  ster(140, 320, 8, '#54a0ff');
  ster(680, 330, 9, '#ffd93b');

  // De catwalk zelf (loopt naar je toe!)
  ctx.beginPath();
  ctx.moveTo(300, 380); ctx.lineTo(500, 380);
  ctx.lineTo(620, 600); ctx.lineTo(180, 600);
  ctx.closePath();
  vulEnLijn('#f78fb3', 6);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(340, 380); ctx.lineTo(250, 600);
  ctx.moveTo(460, 380); ctx.lineTo(550, 600);
  ctx.stroke();

  // De ster van de show!
  tekenKat();
  tekenKleertjesOpKat();

  // Pose-knoppen links
  poseKnoppen.forEach((knop, i) => {
    ctx.beginPath();
    ctx.roundRect(20, 380 + i * 62, 130, 50, 12);
    vulEnLijn('#54a0ff', 4);
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(knop.naam, 85, 413 + i * 62);
  });

  // Jury-knop rechts
  ctx.beginPath();
  ctx.roundRect(630, 400, 150, 60, 14);
  vulEnLijn('#ffd93b', 5);
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText('Jury!', 705, 440);
}

// Wat vindt de jury ervan? (per aantal sterren)
const juryMeningen = {
  1: 'Oei... was je de kleertjes vergeten?',
  2: 'Hmm, best aardig geprobeerd!',
  3: 'Leuk! Maar het kan nog nét iets mooier.',
  4: 'Wauw, wat een prachtige outfit!',
  5: 'PERFECT! De mooiste kat ooit gezien!',
};

// ----- Het jury-scherm met de sterren -----
function tekenJuryScherm() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.roundRect(170, 105, 460, 390, 20);
  vulEnLijn('white', 6);

  ctx.textAlign = 'center';
  ctx.font = 'bold 34px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText('De jury zegt:', 400, 160);

  // De vijf sterren (goud = verdiend, grijs = niet)
  for (let i = 0; i < 5; i++) {
    const kleur = i < jurySterren ? '#ffd93b' : '#dcdde1';
    ster(400 + (i - 2) * 70, 220, 26, kleur);
  }

  // De mening van de jury!
  ctx.font = 'italic bold 21px "Segoe UI", sans-serif';
  ctx.fillStyle = '#e94560';
  ctx.fillText('"' + juryMeningen[jurySterren] + '"', 400, 290);

  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText(jurySterren + ' van de 5 sterren!', 400, 325);
  ctx.font = 'bold 19px "Segoe UI", sans-serif';
  ctx.fillStyle = '#a55eea';
  if (juryThemaAantal > 0) {
    ctx.fillText('Thema ' + huidigThema.naam + ': ' + juryThemaAantal + ' kleren passen erbij!', 400, 355);
  } else {
    ctx.fillText('Oeps, niks paste bij het thema ' + huidigThema.naam + '...', 400, 355);
  }
  ctx.font = '19px "Segoe UI", sans-serif';
  ctx.fillStyle = LIJN;
  ctx.fillText('Beste: ' + besteSterren + ' sterren  •  Totaal: ' + totaalSterren, 400, 388);

  // Opnieuw-knop
  ctx.beginPath();
  ctx.roundRect(320, 415, 160, 54, 14);
  vulEnLijn('#e94560', 5);
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Opnieuw!', 400, 450);
}

// De jury telt: kleren + make-up + poses = sterren!
function juryBeslist() {
  const kledingAan = kasten.filter(kast => gedragen[kast.naam] !== null).length;
  const makeupAan = makeupKnoppen.filter(naam => makeup[naam]).length;
  // Draagt de kat gekochte winkel-kleren? Die vindt de jury extra mooi!
  const gekochtAan = kasten.filter(kast =>
    gedragen[kast.naam] !== null && gekocht.includes(kast.spullen[gedragen[kast.naam]])
  ).length;
  // En het allerbelangrijkste: past de kleding bij het thema?
  juryThemaAantal = kasten.filter(kast =>
    gedragen[kast.naam] !== null && huidigThema.items.includes(kast.spullen[gedragen[kast.naam]])
  ).length;
  let sterren = 1;
  if (kledingAan >= 2) sterren++;
  if (kledingAan >= 4) sterren++;
  if (makeupAan >= 1) sterren++;
  if (posesGedaan >= 3) sterren++;
  sterren += gekochtAan;       // elke gekochte outfit = bonus-ster!
  sterren += juryThemaAantal;  // elk kledingstuk dat bij het thema past = ster!
  jurySterren = Math.min(5, sterren);

  // Sterren opslaan zodat ze bewaard blijven!
  totaalSterren += jurySterren;
  besteSterren = Math.max(besteSterren, jurySterren);
  localStorage.setItem('dressTheCat.totaal', totaalSterren);
  localStorage.setItem('dressTheCat.beste', besteSterren);
}

// Alles terug naar het begin voor een nieuwe ronde
function herstart() {
  for (const kast of kasten) {
    gedragen[kast.naam] = null;
  }
  for (const naam of makeupKnoppen) {
    makeup[naam] = false;
  }
  gezicht = 'blij';
  tijdOver = 90;
  spelStatus = 'spelen';
  inSpiegel = false;
  inWinkel = false;
  openKast = null;
  zitBijKaptafel = false;
  poseActief = null;
  poseHoek = 0;
  posesGedaan = 0;
  kijkRichting = 1;
  huppel = 0;
  katX = 240;
  katY = 445;
  katSchaal = 0.6;
  // En natuurlijk een nieuw thema voor de nieuwe ronde!
  kiesThema();
}

function tekenAlles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Showtijd? Dan de catwalk (en misschien de jury)
  if (spelStatus === 'catwalk' || spelStatus === 'jury') {
    tekenCatwalkScherm();
    if (spelStatus === 'jury') {
      tekenJuryScherm();
    }
    return;
  }
  // Kast open? Dan het kast-scherm tekenen
  if (openKast) {
    tekenKastScherm();
    tekenTijd();
    return;
  }
  // In de winkel? Dan alleen het winkelscherm tekenen
  if (inWinkel) {
    tekenWinkelScherm();
    return;
  }
  // In de spiegel? Dan alleen het spiegelscherm tekenen
  if (inSpiegel) {
    tekenSpiegelScherm();
    tekenTijd();
    return;
  }
  // Eerst de muur en de vloer, dan de spullen die erop staan
  tekenMuur();
  tekenVloer();
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
  tekenTijd();
  tekenSterrenVakje();
}

// Klikken op kleertjes in de kast
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const muisX = event.clientX - rect.left;
  const muisY = event.clientY - rect.top;

  // Op de catwalk: pose-knoppen en de jury-knop
  if (spelStatus === 'catwalk') {
    poseKnoppen.forEach((knop, i) => {
      const bovenkant = 380 + i * 62;
      if (muisX > 20 && muisX < 150 && muisY > bovenkant && muisY < bovenkant + 50) {
        poseActief = knop.pose;
        poseTimer = 0;
        posesGedaan++;
      }
    });
    if (muisX > 630 && muisX < 780 && muisY > 400 && muisY < 460) {
      juryBeslist();
      spelStatus = 'jury';
    }
    return;
  }

  // Bij de jury: alleen de Opnieuw-knop werkt
  if (spelStatus === 'jury') {
    if (muisX > 320 && muisX < 480 && muisY > 415 && muisY < 469) {
      herstart();
    }
    return;
  }

  // Staat er een kast open?
  if (openKast) {
    // Terug-knop
    if (muisX > 20 && muisX < 130 && muisY > 12 && muisY < 56) {
      openKast = null;
      tekenAlles();
      return;
    }
    // Klik op een kledingstuk: aan- of uitdoen
    openKast.spullen.forEach((spul, i) => {
      const plek = kastSchermPlek(i);
      if (Math.abs(muisX - plek.x) < 60 && Math.abs(muisY - plek.y) < 60) {
        gedragen[openKast.naam] = gedragen[openKast.naam] === i ? null : i;
      }
    });
    tekenAlles();
    return;
  }

  // Zitten we in de winkel?
  if (inWinkel) {
    // Terug-knop
    if (muisX > 20 && muisX < 130 && muisY > 12 && muisY < 56) {
      inWinkel = false;
    }
    // Tabblad-knoppen
    if (muisY > 62 && muisY < 102) {
      if (muisX > 215 && muisX < 330) winkelTab = 'kleren';
      if (muisX > 340 && muisX < 455) winkelTab = 'sets';
      if (muisX > 465 && muisX < 580) winkelTab = 'luxe';
    }
    if (winkelTab === 'sets') {
      // Koop-knoppen van de sets
      winkelSets.forEach((set, i) => {
        const plek = setKaartPlek(i);
        if (muisX > plek.x + 160 && muisX < plek.x + 290 &&
            muisY > plek.y + 150 && muisY < plek.y + 192) {
          koopSet(set);
        }
      });
    } else {
      // Blader-pijltjes
      if (winkelTab === 'kleren' && muisY > 62 && muisY < 102) {
        if (muisX > 145 && muisX < 189) winkelPagina = 0;
        if (muisX > 592 && muisX < 636) winkelPagina = 1;
      }
      // Koop-knoppen van losse kleren (of luxe!)
      const kaartLijst = winkelTab === 'luxe'
        ? winkelLuxe
        : winkelSpullen.slice(winkelPagina * 8, winkelPagina * 8 + 8);
      kaartLijst.forEach((spul, i) => {
        const plek = winkelKaartPlek(i);
        if (muisX > plek.x + 25 && muisX < plek.x + 145 &&
            muisY > plek.y + 184 && muisY < plek.y + 220) {
          koop(spul);
        }
      });
    }
    tekenAlles();
    return;
  }

  // Klik op de Winkel-knop?
  if (muisX > 140 && muisX < 250 && muisY > 6 && muisY < 50) {
    inWinkel = true;
    tekenAlles();
    return;
  }

  // Zitten we in het spiegelscherm?
  if (inSpiegel) {
    // Terug-knop
    if (muisX > 20 && muisX < 150 && muisY > 20 && muisY < 68) {
      inSpiegel = false;
      tekenAlles();
      return;
    }
    gezichtKnoppen.forEach((naam, i) => {
      const plek = knopPlekSpiegel(0, i);
      if (Math.abs(muisX - plek.x) < 32 && Math.abs(muisY - plek.y) < 32) {
        gezicht = naam;
      }
    });
    makeupKnoppen.forEach((naam, i) => {
      const plek = knopPlekSpiegel(1, i);
      if (Math.abs(muisX - plek.x) < 32 && Math.abs(muisY - plek.y) < 32) {
        makeup[naam] = !makeup[naam];  // aan of weer uit
      }
    });
    tekenAlles();
    return;
  }

  // Klik op de spiegel in de kamer? Dan openen we het spiegelscherm!
  const spiegelX = (muisX - 675) / 78;
  const spiegelY = (muisY - 410) / 80;
  if (spiegelX * spiegelX + spiegelY * spiegelY < 1) {
    inSpiegel = true;
    tekenAlles();
    return;
  }

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

  // Klik op een dichte kast? Dan gaat hij open!
  for (const kast of kasten) {
    if (muisX > kast.x && muisX < kast.x + KAST_BREEDTE &&
        muisY > kast.y - 14 && muisY < kast.y + KAST_HOOGTE) {
      openKast = kast;
      tekenAlles();
      return;
    }
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
  // De tijd tikt door zolang we aan het spelen zijn (in de winkel staat hij stil!)
  if (spelStatus === 'spelen' && !inWinkel) {
    tijdOver -= 1 / 60;
    if (tijdOver <= 0) {
      // Tijd is om: de show begint! De kat gaat de catwalk op
      tijdOver = 0;
      spelStatus = 'catwalk';
      inSpiegel = false;
      openKast = null;
      zitBijKaptafel = false;
      katX = 400;
      katY = 470;
      katSchaal = 0.55;
      kijkRichting = 1;
      huppel = 0;
    }
  }

  // Op de catwalk: poses doen en heen en weer lopen!
  if (spelStatus === 'catwalk') {
    if (poseActief) {
      poseTimer++;
      if (poseActief === 'zwaai') {
        poseHoek = Math.sin(poseTimer * 0.3) * 0.15;
      } else if (poseActief === 'spring') {
        huppel = Math.sin(Math.PI * Math.min(poseTimer / 60, 1)) * 70;
      } else if (poseActief === 'draai' && poseTimer % 12 === 0) {
        kijkRichting = -kijkRichting;
      }
      if (poseTimer >= 60) {
        poseActief = null;
        poseHoek = 0;
        huppel = 0;
        kijkRichting = 1;
      }
    } else {
      // Lopen over de catwalk met links/rechts
      const linksToets = toetsen['arrowleft'] || toetsen['a'];
      const rechtsToets = toetsen['arrowright'] || toetsen['d'];
      if (linksToets)  { katX -= 4; kijkRichting = -1; }
      if (rechtsToets) { katX += 4; kijkRichting = 1; }
      katX = Math.max(260, Math.min(540, katX));
      if (linksToets || rechtsToets) {
        loopTijd++;
        huppel = Math.abs(Math.sin(loopTijd * 0.25)) * 8;
      } else {
        huppel = 0;
      }
    }
    tekenAlles();
    requestAnimationFrame(beweeg);
    return;
  }

  // In de spiegel, de winkel, een open kast of bij de jury kun je niet lopen
  if (inSpiegel || inWinkel || openKast || spelStatus !== 'spelen') {
    tekenAlles();
    requestAnimationFrame(beweeg);
    return;
  }

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
    if (toetsen['arrowleft'] || toetsen['a']) {
      katX -= snelheid;
      kijkRichting = -1;  // omdraaien!
    }
    if (toetsen['arrowright'] || toetsen['d']) {
      katX += snelheid;
      kijkRichting = 1;
    }
    if (toetsen['arrowup'] || toetsen['w'])   katY -= snelheid;
    if (toetsen['arrowdown'] || toetsen['s']) katY += snelheid;

    // Niet van het scherm af lopen!
    katX = Math.max(90, Math.min(710, katX));
    katY = Math.max(350, Math.min(460, katY));

    // Vrolijk huppelen tijdens het lopen
    if (wilLopen) {
      loopTijd++;
      huppel = Math.abs(Math.sin(loopTijd * 0.25)) * 10;
    } else {
      huppel = 0;
    }
  } else {
    huppel = 0;
  }

  tekenAlles();
  requestAnimationFrame(beweeg);
}

beweeg();
