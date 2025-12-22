"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
};

interface Props {
  symbol: string;
}

export default function StockCandleChart({ symbol }: Props) {
  const [candle, setCandle] = useState<Candle | null>(null);
  const [isDummy, setIsDummy] = useState(false);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

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
      console.warn("Using dummy candle for", symbol);
      setCandle(generateDummyCandle(symbol));
      setIsDummy(true);
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
          {symbol} — Daily
        </h3>

        {isDummy ? (
          <AlertTriangle className="text-yellow-500" size={18} />
        ) : isUp ? (
          <TrendingUp className="text-green-600" size={18} />
        ) : (
          <TrendingDown className="text-red-500" size={18} />
        )}
      </div>

      {/* Candle */}
      <svg viewBox="0 0 100 120" className="relative w-full h-32 z-10">
        {/* Wick */}
        <line
          x1="50"
          x2="50"
          y1={scale(candle.high)}
          y2={scale(candle.low)}
          stroke={isUp ? "#16a34a" : "#ef4444"}
          strokeWidth="2"
        />

        {/* Body */}
        <rect
          x="40"
          width="20"
          y={scale(Math.max(candle.open, candle.close))}
          height={Math.abs(scale(candle.open) - scale(candle.close))}
          fill={isUp ? "#16a34a" : "#ef4444"}
          rx="2"
        />
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

/* ----------------------- */
/* Helpers */
/* ----------------------- */

function generateDummyCandle(symbol: string): Candle {
  const base = 500 + symbol.length * 100;

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
