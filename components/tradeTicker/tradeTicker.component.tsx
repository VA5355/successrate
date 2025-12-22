"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";
import nifty50 from "./nifty-50";
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
  }

  return Math.floor((Math.random() * 1.5) * 5) + k;
};

const getRandomChange = () =>
  Number((Math.random() * 8 - 4).toFixed(2));

/*const DEFAULT_ITEMS: TickerItem[] = [
  { "symbol": "NIFTY", "price": 22430, "change": 0.45 },
  { symbol: "ADANIENT", price: 22430, change: 0.45 },
  { symbol: "ADANIPORTS", price: 22430, change: 0.45 },
  { symbol: "APOLLOHOSP", price: 22430, change: 0.45 },
  { symbol: "ASIANPAINT", price: 2934, change: -0.22 },
  { symbol: "AXISBANK", price: 3860, change: 0.11 },
  { symbol: "BAJAJ-AUTO", price: 1621, change: -0.04 },
    { symbol: "BAJFINANCE", price: 22430, change: 0.45 },
  { symbol: "BAJAJFINSV", price: 22430, change: 0.45 },
  { symbol: "BEL", price: 22430, change: 0.45 },
  { symbol: "BHARTIARTL", price: 22430, change: 0.45 },
  { symbol: "CIPLA", price: 2934, change: -0.22 },
  { symbol: "COALINDIA", price: 3860, change: 0.11 },
  { symbol: "DRREDDY", price: 1621, change: -0.04 },
    { symbol: "DUMMYHDLVR", price: 22430, change: 0.45 },
  { symbol: "EICHERMOT", price: 22430, change: 0.45 },
  { symbol: "ETERNAL", price: 22430, change: 0.45 },
  { symbol: "GRASIM", price: 22430, change: 0.45 },
  { symbol: "HCLTECH", price: 2934, change: -0.22 },
  { symbol: "HDFCBANK", price: 3860, change: 0.11 },
  { symbol: "HDFCLIFE", price: 1621, change: -0.04 },
    { symbol: "HINDALCO", price: 22430, change: 0.45 },
  { symbol: "HINDUNILVR", price: 22430, change: 0.45 },
  { symbol: "ICICIBANK", price: 22430, change: 0.45 },
  { symbol: "ITC", price: 22430, change: 0.45 },
  { symbol: "INFY", price: 2934, change: -0.22 },
  { symbol: "INDIGO", price: 3860, change: 0.11 },
  { symbol: "JSWSTEEL", price: 1621, change: -0.04 },
    { symbol: "JIOFIN", price: 22430, change: 0.45 },
  { symbol: "KOTAKBANK", price: 22430, change: 0.45 },
  { symbol: "LT", price: 22430, change: 0.45 },
  { symbol: "M&M", price: 22430, change: 0.45 },
  { symbol: "MARUTI", price: 2934, change: -0.22 },
  { symbol: "MAXHEALTH", price: 3860, change: 0.11 },
  { symbol: "NTPC", price: 1621, change: -0.04 },
    { symbol: "NESTLEIND", price: 22430, change: 0.45 },
  { symbol: "ONGC", price: 22430, change: 0.45 },
  { symbol: "POWERGRID", price: 22430, change: 0.45 },
  { symbol: "RELIANCE", price: 22430, change: 0.45 },
  { symbol: "SBILIFE", price: 2934, change: -0.22 },
  { symbol: "SHRIRAMFIN", price: 3860, change: 0.11 },
  { symbol: "SBIN", price: 1621, change: -0.04 },
    { symbol: "SUNPHARMA", price: 22430, change: 0.45 },
  { symbol: "TCS", price: 22430, change: 0.45 },
  { symbol: "TATACONSUM", price: 22430, change: 0.45 },
  { symbol: "TMPV", price: 22430, change: 0.45 },
  { symbol: "TATASTEEL", price: 2934, change: -0.22 },
  { symbol: "TECHM", price: 3860, change: 0.11 },
  { symbol: "TITAN", price: 1621, change: -0.04 },
    { symbol: "TRENT", price: 22430, change: 0.45 },
  { symbol: "ULTRACEMCO", price: 22430, change: 0.45 },
  { symbol: "WIPRO", price: 22430, change: 0.45, eq:'INE075A01022' },
 
];*/
export const DEFAULT_ITEMS: TickerItem[] = Array.isArray(nifty50)
  ? nifty50.map(item => ({
      ...item,
      price: getRandomPrice(item.symbol),
      change: getRandomChange()
    }))
  : [];

export default function TradeTickerBar({ items = DEFAULT_ITEMS }: Props) {
  const tickerData = useMemo(
    () => (items.length ? [...items, ...items] : []),
    [items]
  );

  if (!tickerData.length) return null;

  return (  
   
    <div className="flex-wrap gap-2 relative ml-[88px]  mr-[80px] px-10  overflow-hidden bg-gray-100 dark:bg-neutral-900 border-y border-gray-200 dark:border-neutral-800">
      <motion.div
        className="flex gap-10 py-2 px-4 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}       
        whileHover={{ animationPlayState: "paused" }}
      >    {/** max-w-7xl   w-full   ml-16 mr-20 ml-[48px] mr-[72px   */}
        {tickerData.map((item, index) => {
          const isUp = item.change > 0;
          const isDown = item.change < 0;

          return (
            <div
              key={index}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100"
            >               {/** // title <-- tooltip shows on hover */}
              <span className="font-semibold cursor-pointer"  title={item.companyname}  >{item.symbol}

                  <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-gray-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.companyname}
            </span>
              </span>

              <span className="text-gray-500 dark:text-gray-400">
                ₹{item.price.toLocaleString()}
              </span>

              <span
                className={`flex items-center gap-1 ${
                  isUp
                    ? "text-green-600"
                    : isDown
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {isUp && <TrendingUp size={14} />}
                {isDown && <TrendingDown size={14} />}
                {!isUp && !isDown && <Minus size={14} />}

                {item.change > 0 ? "+" : ""}
                {item.change}%
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
