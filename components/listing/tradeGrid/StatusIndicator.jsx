import { CircleDot } from "lucide-react";
import { motion } from "framer-motion";

export default function StatusIndicator({ isActive }) {
  if (isActive) {
    // 🔴 Pulsating (Alive) bg-gray-100 border-gray-300 text-gray-600
    return (
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full bg-brandgreen  border-blue-300  opacity-50"
          style={{ width: 24, height: 24 }}
          animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <CircleDot className="h-6 w-6 text-red-600" />
      </div>
    );
  } else {
    // ⚫ Dead (Static)
    return (
      <div className="flex items-center justify-center">
        <CircleDot className="h-6 w-6 text-gray-400 opacity-50" />
      </div>
    );
  }
}
