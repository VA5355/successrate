"use client";
import React from 'react';
 import { StorageUtils } from '@/libs/cache';
      import { CommonConstants } from '@/utils/constants';
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Landmark
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";


const API_URL = "https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetmarketstatus";
const MARKETSTATUS_RECALCULATE = "https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersniftyoptionrecalculate";  //"http://192.168.1.3:3065/recalculate-option-strikes"
const REFRESH_INTERVAL = 180 * 1000; // 180 seconds
export default function SpotIndex() {
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let alive = true;
   fetchMarketData(alive);
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
          markets.map((m, idx) => {
               if(m.index && idx ==0  ) {
                  let spot = m.last;
                  let pts = m.variation; 
                  let percent =  m.percentChange;
                    // set the SPOT in the localStorage 
                    StorageUtils._save(CommonConstants.niftySPOTINDEX,  {  spot , pts ,  percent } );
                   // ONCE SPOT available trigger recalculate the Option Chain Strikes 
                   // this is Node JS program only  we have not deployed the stocknse-india-new.mjs to   https://scraper-api-eyiz.onrender.com
                   // also  https://scraper-api-eyiz.onrender.com is running as  a docker type script application not the mock-wss
                   // this SIMILAR to MARKET STATUS in netlifystockfyersbridge/route.js /fyersgetmarketstatus
                    
                     fetch(MARKETSTATUS_RECALCULATE, { cache: "no-store" })
                        .then(async (r) =>  {
                          if (!r.ok) throw new Error("Recalcuate  NFTY OPTION STRIKES API down");
                          let mData = await r.json();
                          let total_array_expiries = JSON.parse(JSON.stringify(mData));
                           StorageUtils._save(CommonConstants.NIFTYOPTIONSTRIKES,  {  total_array_expiries } );
                             console.log("Recalcuate NFTY OPTION STRIKES   Success and expiries generated save local storage ");



                        }) .catch((err  ) => {
                          // setError(JSON.stringify(err));
                         // setMarkets([]); // UI still renders safely
                         console.log("Recalcuate NFTY OPTION STRIKES  API down");
                      });


               }
          });
        
        }
      })
      .catch((err  ) => {
        setError(JSON.stringify(err));
        setMarkets([]); // UI still renders safely
      });

          const intervalId = setInterval(() => {
      fetchMarketData(alive);
    }, REFRESH_INTERVAL);


  return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, []);

    const fetchMarketData = useCallback(async (isAlive) => {
    if (isFetching) return;
    setIsFetching(true);
    
    try {
      const response = await fetch(API_URL, { 
        cache: "no-store",
        // Adding a signal or timeout can help with 'Failed to fetch' hangs
        signal: AbortSignal.timeout(5000) 
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const mData = await response.json();
      const marketBody = mData.body;

      if (isAlive && marketBody?.marketState) {
        setMarkets(marketBody.marketState);
        setLastUpdated(new Date().toLocaleTimeString());
        setError("");
        setIsUsingMock(false);
        retryCount.current = 0;
        
        // Persist storage
        marketBody.marketState.forEach((m, idx) => {
          if (m.index && idx === 0) {
            StorageUtils._save(CommonConstants.niftySPOTINDEX, { 
              spot: m.last, 
              pts: m.variation, 
              percent: m.percentChange 
            });
          }
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      
      if (isAlive) {
        // "Failed to fetch" usually means CORS or Network unreachable (common with 192.168.x.x IPs)
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.pow(2, retryCount.current) * 1000;
          setTimeout(() => fetchMarketData(isAlive), delay);
        } else {
          setError("API unreachable. Showing sample data.");
         // setMarkets(getMockData());
          setIsUsingMock(true);
          setLastUpdated(`${new Date().toLocaleTimeString()} (Demo)`);
        }
      }
    } finally {
      if (isAlive) setIsFetching(false);
    }
  }, [isFetching]);
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
           <React.Fragment key={`${m.market}-${m.index}-${idx}`}>
          {/* <motion.div
            key={`${m.market}-${idx}`}
            whileTap={{ scale: 0.97 }}
            className=" w-full  md:min-w-[220px] md:max-w-[220px] bg-white rounded-xl border shadow-sm p-3"
          >
             Body 
            <div className="mt-3 space-y-1 text-xs text-zinc-600">*/}
              {m.index && idx ==0 && (
                <div key={`${m.market}-${idx}`} className="font-medium text-zinc-800">
                  {m.last} &nbsp; pts: {Math.round(m.variation)} &nbsp; {m.percentChange} %
                </div>
              )}
 
           {/* </div> 
          </motion.div>*/} </React.Fragment>  
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
