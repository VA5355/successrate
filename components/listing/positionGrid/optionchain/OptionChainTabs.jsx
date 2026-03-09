// OptionChainTabs.jsx
import React, { useEffect, useState } from "react";
import OptionChainTable from "./OptionChainTable";
import { motion, useMotionValue, useTransform , AnimatePresence} from "framer-motion";
import { SwipeCallPill, SwipePutPill } from "./SwipePills";
import ComponentSymbol from "./tradingview/ComponentSymbol";
//import ComponentSymbolTradingViewRedirect  from "./tradingview/ComponentSymbolTradingViewRedirect ";
export default function OptionChainTabs({positionData , activeIndexIn}) {
  const [activeTab, setActiveTab] = useState("chain");
   const [activeIndex, setActiveIndex] = useState(activeIndexIn);
 
      // const [activeIndex, setActiveIndex] = useState<ActiveIndex>("NIFTY");
       const isActive = () => {};
         const flipVariants = {
               initial: {
                 rotateY: 90,
                 opacity: 0,
               },
               animate: {
                 rotateY: 0,
                 opacity: 1,
                 transition: { duration: 0.45, ease: "easeOut" },
               },
               exit: {
                 rotateY: -90,
                 opacity: 0,
                 transition: { duration: 0.35 },
               },
 }         ;
  useEffect ( () => {
      console.log("Active INDEX "+activeIndex

      ); 
        setActiveIndex( activeIndexIn);
  } , [activeIndexIn] );


  return (
      <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}   // 👈 KEY TRIGGERS FLIP
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="origin-center backface-hidden"
              >  
    <div className="w-full max-w-6xl mx-auto">
      {/* Tabs Header */}
      <div className="flex justify-center gap-2 border-b border-gray-300 mb-4">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
            activeTab === "chain"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("chain")}
        >
          Option Chain
        </button>

        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
            activeTab === "swipe"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("swipe")}
        >
         Script Chart
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-b-lg bg-white shadow-lg p-4">
        {activeTab === "chain" ? (
          <OptionChainTable positionData={positionData} activeIndexIn={activeIndex}/>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <h3 className="text-lg font-semibold mb-2 text-indigo-600">
              <span className="flex justify-start  border-b border-gray-300"> TradingVista   </span>
            </h3>
              <ComponentSymbol /> 
             {/* <ComponentSymbolTradingViewRedirect />*/}
          </div>
        )}
      </div>
    </div>
              </motion.div>
        </AnimatePresence>
  );
}
