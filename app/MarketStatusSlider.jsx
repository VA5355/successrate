"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Landmark
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetmarketstatus";

/* ---------- helpers ---------- */

const marketIcon = (market) => {
  switch (market.toLowerCase()) {
    case "capital market":
      return <TrendingUp size={18} />;
    case "currency":
    case "currencyfuture":
      return <DollarSign size={18} />;
    case "commodity":
      return <Globe size={18} />;
    case "debt":
      return <Landmark size={18} />;
    default:
      return <TrendingUp size={18} />;
  }
};

const statusBadge = (status) =>
  status === "Open"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700";

/* ---------- component ---------- */

export default function MarketStatusSlider() {
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    fetch(API_URL, { cache: "no-store" })
      .then(async (r) =>  {
        if (!r.ok) throw new Error("API down");
        let mData = await r.json();
        let marketDat = JSON.parse(JSON.stringify(mData));
        let marketBody = marketDat.body;
        console.log(` Market status  ${JSON.stringify(mData)}`)
        console.log(` Market state  ${JSON.stringify(marketBody)}`)
        return marketBody;
      })
      .then((data) => {
        if (alive && data?.marketState) {
          setMarkets(data.marketState);
        }
      })
      .catch((err  ) => {
        setError(JSON.stringify(err));
        setMarkets([]); // UI still renders safely
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* Title */}
      <h3 className="text-sm font-semibold text-zinc-700 mb-2 px-2">
        Market Status
      </h3>

      {/* Slider */}
      <motion.div
        className="flex gap-3 px-2 overflow-x-auto no-scrollbar"
        drag="x"
        dragConstraints={{ left: -300, right: 0 }}
      >
        {markets.length === 0 && (
          <FallbackCard error={error} />
        )}

        {markets.map((m, idx) => (
          <motion.div
            key={`${m.market}-${idx}`}
            whileTap={{ scale: 0.97 }}
            className="min-w-[220px] max-w-[220px] bg-white rounded-xl border shadow-sm p-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {marketIcon(m.market)}
                {m.market.toUpperCase()}
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge(
                  m.marketStatus
                )}`}
              >
                {m.marketStatus}
              </span>
            </div>

            {/* Body */}
            <div className="mt-3 space-y-1 text-xs text-zinc-600">
              {m.index && (
                <div className="font-medium text-zinc-800">
                  {m.index}
                </div>
              )}

              {m.last && (
                <div className="flex justify-between">
                  <span>LTP</span>
                  <span className="font-semibold text-zinc-900">
                    {m.last}
                  </span>
                </div>
              )}

              {m.percentChange !== "" && m.percentChange != null && (
                <div className="flex justify-between">
                  <span>Change</span>
                  <span
                    className={
                      Number(m.percentChange) >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {m.percentChange}%
                  </span>
                </div>
              )}

              <div className="pt-1 text-[10px] text-zinc-400">
                {m.tradeDate}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- fallback ---------- */

function FallbackCard({ error }) {
  return (
    <div className="min-w-[220px] bg-zinc-50 border rounded-xl p-4 text-center text-xs text-zinc-500">
      {error
        ? "Market data unavailable"
        : "Loading market status…"}
    </div>
  );
}
