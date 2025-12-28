import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import VroomSwipeButton from './VroomSwipeButton';

export default function PositionSwipeHint() {
  const [step, setStep] = useState(0);
    const indices = ["NIFTY", "SENSEX", "BANKNIFTY"];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 6600),
      setTimeout(() => setStep(2), 7600),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative mt-3 px-4 overflow-hidden">
      <div className="h-[254px] flex items-center justify-center">




{/* STEP 1 – Sliding Bricks */}
<AnimatePresence>
  {step === 0 && (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.15 }
        },
        exit: {
          transition: { staggerChildren: 0.1, staggerDirection: -1 }
        }
      }}
      className="flex items-center gap-2"
    >
      {indices.map((label, idx) => (
         <h2> 
        <motion.div
          key={label}
          variants={{
            hidden: { x: 80, opacity: 0 },
            visible: { x: 0, opacity: 1 },
            exit: { x: -80, opacity: 0 }
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="
            bg-gray-100 dark:bg-gray-900
            px-3 py-1.5
            rounded-full
            text-[21px] font-medium
            whitespace-nowrap
          "
        >
          {label}
        </motion.div> </h2>
      ))}

      <ChevronRight className="w-3 h-3 text-gray-400" />
    </motion.div>
  )}
</AnimatePresence>


        {/* STEP 2 – Profit Fade
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2
                bg-green-100 text-green-700
                px-4 py-2 rounded-full text-xs font-semibold"
            >
              <TrendingUp className="w-12 h-12" />
              + ₹1,240 Profit
            </motion.div>
          )}
            
        </AnimatePresence> */}

            <AnimatePresence>
                {step === 1 && (
                    <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="
                        flex items-center gap-2
                        bg-green-100 dark:bg-green-900/30
                        text-green-700 dark:text-green-400
                        px-4 py-2
                        rounded-full
                        text-[21px]  font-semibold
                    "
                    >
                    <TrendingUp className="w-4 h-12" />
                    Swipe  + ₹ Cash in Profit
                    </motion.div>
                )}
            </AnimatePresence>
                 



      </div>
   <VroomSwipeButton onSwipe={() => {} }/>
   {/* STEP 3 – Hint Text */}
<AnimatePresence>
  {step === 2 && (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-2 flex flex-col items-center text-center"
    >
      <div
        className="
          leading-relaxed
          text-gray-600 dark:text-gray-400
          max-w-[560px] mt-4 mb-4 
        "
      >
       <h2 className ="text-black dark:text-white text-lg font-semibold mt-2"> Swiped positions?   <span className="bg-brandblue p-1 px-2 text-white text-lg font-semibold  rounded-lg">Click Positions</span></h2>
      </div>

      <div
        className="
          mt-0.5 text-[20px]
          text-gray-400
          max-w-[360px]
        "
      >
       <h3 className="text-brandgreen text-xs font-semibold  ">  <button className="bg-brandgreenlight p-1 px-3  transition-all rounded-full mx-2 dark:bg-white"><p className="text-brandgreen text-xs font-semibold  "> </p>
       Try with Fyers :: <span className="bg-brandblue p-1 px-2 text-white text-lg  rounded-lg">  FREE</span> </button></h3> 
      </div>
    </motion.div>
  )}
</AnimatePresence>


    </div>
  );
}
