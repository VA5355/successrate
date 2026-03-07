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

export default function SpotIndex() {
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
         
      <motion.div
        className="  flex flex-col
      md:flex-row
      gap-3 px-2
      overflow-y-auto md:overflow-x-auto
      no-scrollbar
      max-h-[420px] md:max-h-none"
       drag={window.innerWidth < 768 ? "y" : "x"}
       dragConstraints={
        window.innerWidth < 768
            ? { top: -300, bottom: 0 }
            : { left: -400, right: 0 }
        }
      >
        {markets.length === 0 && (
          <FallbackCard error={error} />
        )}

        {markets.map((m, idx) => (
           <> 
          {/* <motion.div
            key={`${m.market}-${idx}`}
            whileTap={{ scale: 0.97 }}
            className=" w-full  md:min-w-[220px] md:max-w-[220px] bg-white rounded-xl border shadow-sm p-3"
          >
             Body 
            <div className="mt-3 space-y-1 text-xs text-zinc-600">*/}
              {m.index && idx ==0 && (
                <div className="font-medium text-zinc-800">
                  {m.last} &nbsp; pts: {Math.round(m.variation)} &nbsp; {m.percentChange} %
                </div>
              )}
 
           {/* </div> 
          </motion.div>*/}  </>
        ))}
      </motion.div>


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
