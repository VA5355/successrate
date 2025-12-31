import React, {Suspense, useEffect , useState,useMemo, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 

  RefreshCw, 
  Layers, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
 




// Sub-component for individual index display
const IndexCard = ({ spanId ,  statusId ,label, data, colorClass ,timeId="sensex-time" }) => {
  return (
    <motion.div id={statusId}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
          {label}
        </span>
        <TrendingUp className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="wait">
          <motion.span  id={spanId}
            key={data?.ltp}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-slate-900 dark:text-white px-1 py-1 rounded bg-gray-100"
          >
           
            {data?.ltp || '---'}
          </motion.span>
        </AnimatePresence>
        <span className={`text-xs font-medium ${colorClass}`}>
          {data?.change}
        </span>
      </div>
      <div className="mt-2 text-[10px] text-slate-400 font-mono" id={`${label} === "SENSEX" ? ${timeId}: "t-${Date.now()}-${Math.random().toString(36).slice(2)}"`}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

export default IndexCard;