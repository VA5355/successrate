import expirySymbols from "./OptionChainExpirySymbols";


const now = new Date();

const year = now.getFullYear();
const currentMonth = now.getMonth();
const nextMonth = currentMonth + 1;

const currentTuesdays = getTuesdays(year, currentMonth);
const nextTuesdays = getTuesdays(year, nextMonth);

const expiryMap = buildExpiryMap(currentTuesdays, nextTuesdays);

console.log(expiryMap);

const startId = getHighestId(expirySymbols) + 1;
console.log("Highest ID:", startId);

const generated = [...generateSymbols(expirySymbols, startId, expiryMap)];
const generatedArpil = [...generateSymbolsApril(expirySymbols, startId )];
const baseSpot = 24450; // as of Mar 06 2026 
console.log(JSON.stringify(generated, null, 2));

function getHighestId(arr) {
  return arr.reduce((max, obj) => {
    const id = Number(obj.id);
    return id > max ? id : max;
  }, 0);
}


function getTuesdays(year, month) {
  const tuesdays = [];

  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {

    if (date.getDay() === 2) {
      tuesdays.push(date.getDate());
    }

    date.setDate(date.getDate() + 1);
  }

  return tuesdays;
}
function buildExpiryMap(currentMonthTuesdays, nextMonthTuesdays) {

  const map = {};

  for (let i = 0; i < currentMonthTuesdays.length; i++) {

    const m = String(currentMonthTuesdays[i]).padStart(2, "0");
    const a = String(nextMonthTuesdays[i]).padStart(2, "0");

    map[`M${m}`] = `A${a}`;
  }

  return map;
}
 function* generateSymbolsApril(data, startId ) {

  const expiryMap = {
    M10: "A06",
    M17: "A13",
    M24: "A20",
    M31: "A27"
  };

  let id = startId;

  for (const item of data) {

    const symbol = item.symbol;

    const match = symbol.match(/NIFTY26(M\d{2})(\d+)(CE|PE)/);

    if (!match) continue;

    const [, expiry, strike, type] = match;

    const newExpiry = expiryMap[expiry];

    if (!newExpiry) continue;

    const newSymbol = `NIFTY26${newExpiry}${strike}${type}`;

    yield {
      id: String(id++),
      symbol: newSymbol,
      k: item.k
    };
  }
}

 function* generateSymbols(data, startId, expiryMap) {
  /*
  const expiryMap = {
    M10: "A06",
    M17: "A13",
    M24: "A20",
    M31: "A27"
  };*/

  let id = startId;

  for (const item of data) {

    const symbol = item.symbol;

    const match = symbol.match(/NIFTY26(M\d{2})(\d+)(CE|PE)/);

    if (!match) continue;

    const [, expiry, strike, type] = match;

    const newExpiry = expiryMap[expiry];

    if (!newExpiry) continue;

    const newSymbol = `NIFTY26${newExpiry}${strike}${type}`;

    yield {
      id: String(id++),
      symbol: newSymbol,
      k: item.k
    };
  }
}
/*
for (const row of generateSymbols(oldArray)) {
  generated.push(row);
}

console.log(JSON.stringify(generated, null, 2));
*/
/*    import optionStrikeGenerator from "./optionStrikeGenerator";
     // optionStrikeGenerator.getHighestId(expirySymbols)
export default  { 
    generated : generated , 
    getHighestId : getHighestId, 
    generateSymbolsApril : generateSymbolsApril, 
generateSymbols : generateSymbols, 
    generatedArpil : generatedArpil 
} 
*/
function strikeMapper(spot, expiries, range = 300, step = 100) {

  const strikes = [];

  // ATM rounding to nearest 100
  const atm = Math.round(spot / step) * step;

  const start = atm - range;
  const end = atm + range;

  for (let strike = start; strike <= end; strike += step) {

    for (const expiry of expiries) {

      strikes.push(`NIFTY26${expiry}${strike}CE`);
      strikes.push(`NIFTY26${expiry}${strike}PE`);

    }

  }

  return strikes;
}
function extractExpiries(symbols) {

  const set = new Set();

  symbols.forEach(s => {

    const m = s.match(/NIFTY26([A-Z]\d{2})/);

    if (m) set.add(m[1]);

  });

  return [...set];
}



export {
  generated,
  getHighestId,
  generateSymbolsApril,
  generateSymbols,
  generatedArpil,
  baseSpot,
  extractExpiries,
  strikeMapper

};