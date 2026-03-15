import React from 'react';

import { motion } from "framer-motion";
import { AlertTriangle, Zap } from "lucide-react";

const  PlatformNotice = () =>  {

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-slate-900 dark:to-slate-800 shadow-sm">

      <motion.div
        className="flex items-center gap-4 whitespace-nowrap py-2"
        animate={{ x: ["100%", "-100%"] }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "linear"
        }}
      >

        <div className="flex items-center gap-3 px-4 text-sm text-amber-900 dark:text-amber-300 font-medium">

          <AlertTriangle className="w-4 h-4 text-amber-500" />

          <span>
            This is representational information which may / may not resemble actuals.
            Usage of data is only for educational and demo purposes.
          </span>

          <Zap className="w-4 h-4 text-amber-500 ml-6" />

          <span>
            Educate instantly — select a Subscription Plan
          </span>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="ml-4 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 animate-pulse"
          >
            Subscription Plan
          </motion.button>

        </div>

      </motion.div>

    </div>
  );
}
export default PlatformNotice;