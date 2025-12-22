"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import React from "react";
import { StorageUtils } from '@/libs/cache';
import { CommonConstants } from '@/utils/constants';
import nifty50 from "../tradeTicker/nifty-50";
type TickerItem = {
  symbol: string;
  price: number;
  change: number;
 
  companyname?:string;
  industry?:string;
  series?:string;
  isincode?:string;
   eq?:string;

};

interface Props {
  items?: TickerItem[];
}

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
};

interface Props {
  symbol: string;
}

const getRandomPrice = (symbol: string): number => {
  let k = 1000; // default fallback (UI-safe)

  switch (symbol) {
    case "ADANIENT": k = 2230; break;
    case "ADANIPORTS": k = 1490; break;
    case "APOLLOHOSP": k = 7010; break;
    case "ASIANPAINT": k = 2790; break;
    case "AXISBANK": k = 1230; break;
    case "BAJAJ-AUTO": k = 9000; break;
    case "BAJFINANCE": k = 1000; break;
    case "BAJAJFINSV": k = 2040; break;
    case "BEL": k = 390; break;
    case "BHARTIARTL": k = 2090; break;
    case "CIPLA": k = 1510; break;
    case "COALINDIA": k = 380; break;
    case "DRREDDY": k = 1270; break;
    case "DUMMYHDLVR": k = 2000; break;
    case "EICHERMOT": k = 7000; break;
    case "ETERNAL": k = 280; break;
    case "GRASIM": k = 2810; break;
    case "HCLTECH": k = 1640; break;
    case "HDFCBANK": k = 980; break;
    case "HDFCLIFE": k = 760; break;
    case "HINDALCO": k = 850; break;
    case "HINDUNILVR": k = 2280; break;
    case "ICICIBANK": k = 1350; break;
    case "ITC": k = 400; break;
    case "INFY": k = 1630; break;
    case "INDIGO": k = 5150; break;
    case "JSWSTEEL": k = 1070; break;
    case "JIOFIN": k = 290; break;
    case "KOTAKBANK": k = 2150; break;
    case "LT": k = 4070; break;
    case "M&M": k = 3600; break;
    case "MARUTI": k = 16410; break;
    case "MAXHEALTH": k = 1070; break;
    case "NTPC": k = 310; break;
    case "NESTLEIND": k = 1240; break;
    case "ONGC": k = 230; break;
    case "POWERGRID": k = 260; break;
    case "RELIANCE": k = 1560; break;
    case "SBILIFE": k = 2020; break;
    case "SHRIRAMFIN": k = 900; break;
    case "SBIN": k = 980; break;
    case "SUNPHARMA": k = 1740; break;
    case "TCS": k = 3280; break;
    case "TATACONSUM": k = 1180; break;
    case "TMPV": k = 350; break;
    case "TATASTEEL": k = 160; break;
    case "TECHM": k = 1610; break;
    case "TITAN": k = 3930; break;
    case "TRENT": k = 4060; break;
    case "ULTRACEMCO": k = 11490; break;
    case "WIPRO": k = 260; break;
    default : k=2000; break;
  }

  return Math.floor((Math.random() * 1.5) * 5) + k;
};
export default function StockCandleChart({ symbol = 'ETERNAL' }: Props) {
  const [candle, setCandle] = useState<Candle | null>(null);
  const [candleset, setCandleSet] = useState<Candle[] | null>([]);
  const scaleset  = React.useMemo(
                     () => createScale(candleset),
                         [candleset]
                        );
  const [basePrice, setBasePrice] = useState (500);
  const [isDummy, setIsDummy] = useState(false);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);
  const [actualSymbol , setActualSymbol ] = useState((symbol:any) => { console.log( " " + typeof(symbol)); 
       let stockChartSym = StorageUtils._retrieve(CommonConstants.companySymbolStockChart);
        let st = symbol;
              if (stockChartSym.isValid && stockChartSym.data !== null) {
                  console.log("StockCandleChart:: Stock Chart Symbol "+ stockChartSym.data);
                    st =   stockChartSym.data ;
              }
       // chcek sym in nifty 50 
       // if yes set Base Price 
       if(Array.isArray(nifty50) ) {
        let foundSym  = "";
          let foundT =   nifty50.filter(item => {    if( item.companyname.indexOf(st) >-1 ) {foundSym = item.symbol;  return item; }

                              });
                   let price = basePrice;
          if(foundT){
             price = getRandomPrice(foundSym) ;   
             setBasePrice (price);
          }
         
       }
       if(st ){
        let  price = getRandomPrice(st) ;  
        if(price ) { 
             setBasePrice (price);
          console.log("StockCandleChart:: Nifty50 base price  "+ price);     
            }
         
       }
            


    return   (st == undefined || st ==='N/A') ? 'ETERNAL' :st } );
const candles = React.useMemo(
  () => generateDummyCandles(actualSymbol , basePrice, 14),
  [actualSymbol, basePrice]  
);
 
const scale = React.useMemo(
  () => createScale(candles),
  [candles]
);

const candleWidth = 8;
const gap = 6;

  useEffect(() => {
    fetchCandle();

    // Auto-refresh every 15s
    retryTimer.current = setInterval(fetchCandle, 15000);

    return () => {
      if (retryTimer.current) clearInterval(retryTimer.current);
    };
  }, [symbol]);

  async function fetchCandle() {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - 7 * 86400000)
        .toISOString()
        .split("T")[0];

      const res = await fetch(
        `http://localhost:3000/historical/cm/equity?symbol=${symbol}&series=[EQ]&from=${from}&to=${to}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("Backend error");

      const json = await res.json();

      const last = json.data?.at(-1);
      if (!last) throw new Error("No data");

      setCandle({
        open: Number(last.CH_OPENING_PRICE),
        high: Number(last.CH_TRADE_HIGH_PRICE),
        low: Number(last.CH_TRADE_LOW_PRICE),
        close: Number(last.CH_CLOSING_PRICE),
      });

      setIsDummy(false);
    } catch (err) {
      console.warn("Using dummy candle for", symbol =='N/A'? 'ETERNAL' :symbol);
      setCandle(generateDummyCandle(actualSymbol ,basePrice ));
       console.warn("Using   candle for  "+  actualSymbol +" price " +basePrice
         );
      setCandleSet(generateDummyCandles(actualSymbol , basePrice, 14));
      //setScaleSet(candleset);

      setIsDummy(false);
    }
  }

  if (!candle) return null;

  const isUp = candle.close >= candle.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white dark:bg-neutral-900 p-4 rounded-xl shadow w-full max-w-md"
    >
      {/* Dummy watermark */}
      {isDummy && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-300/40 dark:text-white/10 rotate-[-20deg]">
            DUMMY DATA
          </span>
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3 z-10">
        <h3 className="text-sm font-semibold">
          {actualSymbol} — Daily
        </h3>

        {isDummy ? (
          <AlertTriangle className="text-yellow-500" size={18} />
        ) : isUp ? (
          <TrendingUp className="text-green-600" size={18} />
        ) : (
          <TrendingDown className="text-red-500" size={18} />
        )}
      </div>

      {/* Candle 
      <svg viewBox="0 0 100 120" className="relative w-full h-32 z-10">
       
        <line
          x1="50"
          x2="50"
          y1={scale(candle.high)}
          y2={scale(candle.low)}
          stroke={isUp ? "#16a34a" : "#ef4444"}
          strokeWidth="2"
        />

        
        <rect
          x="40"
          width="20"
          y={scale(Math.max(candle.open, candle.close))}
          height={Math.abs(scale(candle.open) - scale(candle.close))}
          fill={isUp ? "#16a34a" : "#ef4444"}
          rx="2"
        />
      </svg>*/}
    <svg viewBox="0 0 140 120" className="relative w-full h-32 z-10">
      {candleset?.map((candle, i) => {
        const x = i * (candleWidth + gap) + 10;
        const isUp = candle.close >= candle.open;

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                x2={x + candleWidth / 2}
                y1={scaleset(candle.high)}
                y2={scaleset(candle.low)}
                stroke={isUp ? "#16a34a" : "#ef4444"}
                strokeWidth="2"
              />

              {/* Body */}
              <motion.rect
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05 }}
                transformOrigin="center"
                x={x}
                width={candleWidth}
                y={scaleset(Math.max(candle.open, candle.close))}
                height={Math.max(
                  2,
                  Math.abs(scaleset(candle.open) - scaleset(candle.close))
                )}
                rx="2"
                fill={isUp ? "#16a34a" : "#ef4444"}
              />
            </g>
          );
  })}
</svg>







      {/* Prices */}
      <div className="relative grid grid-cols-2 text-xs mt-2 gap-1 text-gray-600 dark:text-gray-400 z-10">
        <span>O: ₹{candle.open}</span>
        <span>H: ₹{candle.high}</span>
        <span>L: ₹{candle.low}</span>
        <span>C: ₹{candle.close}</span>
      </div>
    </motion.div>
  );
}
function createScale(candles: Candle[]| null) {
  const highs = candles ?  candles?.map(c => c.high) : [] ;
  const lows = candles ?   candles?.map(c => c.low) : []  ;

  const max = Math.max(...highs);
  const min = Math.min(...lows);

  return (price: number) =>
    110 - ((price - min) / (max - min)) * 100;
}

/* ----------------------- */
/* Helpers */
/* ----------------------- */

function generateDummyCandle(symbol: string,basep = 500): Candle {
  const base = basep + symbol.length * 100;

  const open = rand(base - 50, base + 50);
  const close = rand(base - 50, base + 50);

  return {
    open,
    close,
    high: Math.max(open, close) + rand(10, 40),
    low: Math.min(open, close) - rand(10, 40),
  };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scale(price: number) {
  const max = 120;
  return max - (price / 20000) * max;
}
function generateDummyCandles(
  symbol: string,
  basePrice =500,
  count = 12
  
): Candle[] {
  const base = basePrice + symbol.length * 100;
  let lastClose = base;

  return Array.from({ length: count }, () => {
    const open = lastClose + rand(-25, 25);
    const close = open + rand(-40, 40);

    const candle = {
      open,
      close,
      high: Math.max(open, close) + rand(8, 25),
      low: Math.min(open, close) - rand(8, 25),
    };

    lastClose = close;
    return candle;
  });
}
