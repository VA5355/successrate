import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { DollarSign } from "lucide-react";

export default function VroomSwipeButton({ onSwipe }) {
  return (
    <motion.div
      className="relative w-[220px] mx-auto select-none"
    >
      {/* Motion streak */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="
          absolute inset-y-0 left-0 right-6
          bg-gradient-to-r
          from-orange-400/60
          via-yellow-300/50
          to-transparent
          blur-md
          rounded-full
          pointer-events-none
        "
      />

      {/* Swipe Button */}
      <motion.button
        drag="x"
        dragConstraints={{ left: 0, right: 140 }}
        dragElastic={0.1}
        whileTap={{ scale: 0.96 }}
        onDragEnd={(e, info) => {
          if (info.offset.x > 110) {
            onSwipe?.();
          }
        }}
        initial={{ x: 0 }}
        animate={{
          x: [0, 2, -2, 0], // subtle engine vibration
        }}
        transition={{
          repeat: Infinity,
          repeatDelay: 3,
          duration: 0.25,
        }}
        className="
          relative z-10
          w-full h-12
          flex items-center justify-between
          px-4
          rounded-full
          bg-gradient-to-r
          from-orange-500
          via-amber-400
          to-yellow-300
          text-black
          italic font-semibold tracking-wide
          shadow-[0_8px_24px_rgba(255,165,0,0.45)]
          overflow-hidden
        "
      >
        {/* Text */}
        <span className="text-sm whitespace-nowrap">
          swipe to execute
        </span>
  {/* Right Icons */}
        <div className="flex items-center gap-2 relative">
          
          {/* Spinning Dollar */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.15, 1] }}
            transition={{
              rotate: { repeat: Infinity, duration: 1.2, ease: "linear" },
              scale: { repeat: Infinity, duration: 0.8 },
            }}
            className="
              w-6 h-6
              rounded-full
              bg-green-500
              flex items-center justify-center
              shadow-[0_0_10px_rgba(34,197,94,0.8)]
            "
          >
            <DollarSign className="w-3.5 h-3.5 text-white" />
          </motion.div>

          {/* Arrow + Zap */}
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="flex items-center gap-1"
          >
            <Zap className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.button>
    </motion.div>
  );
}
