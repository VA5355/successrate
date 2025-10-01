// components/OptionChainTable.jsx
import { useDispatch, useSelector   } from "react-redux";
import  {  useReducer, useState,useEffect } from 'react';
import { selectFilteredStrikes } from '@/redux/selectors/webSockSelector';
import webSocketSlice  from '@/redux/slices/webSocketSlice';
//import { selectFilteredStrikes } from "../store/selectors";
import useWebSocketStream from "@/redux//hooks/useWebSocketStream";
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "../placeBuyOrder.actions";
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, X, Heading4 } from "lucide-react";
import "./index.css";

import { ChevronUp, ChevronDown } from "lucide-react";

function ScrollArrows({ value, setValue }) {
  const increment = () => setValue((prev) => Math.min(5 , prev + 1));
  const decrement = () => setValue((prev) => Math.max(0, prev - 1));

  return (
    <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 
                    flex flex-col items-center justify-center 
                    w-5 h-[50px] rounded-lg border border-zinc-400 
                    bg-white shadow-sm">
      {/* Up Arrow */}
      <button
        onClick={increment}
        className="flex-1 w-full flex items-center justify-center 
                   hover:bg-zinc-100 active:bg-zinc-200"
      >
        <ChevronUp className="w-2 h-2 text-zinc-700" />
      </button>

      {/* Divider */}
      <div className="w-full border-t border-b border-zinc-300" />
      
      {/* Down Arrow */}
      <button
        onClick={decrement}
        className="flex-1 w-full flex items-center justify-center 
                   hover:bg-zinc-100 active:bg-zinc-200"
      >
        <ChevronDown className="w-2 h-2 text-zinc-700" />
      </button>
    </div>
  );
}
 function VerticalLimitPriceSlider({ min = 100, max = 500, step = 1 ,onLimitPrice }) {
 //  console.log(` min ${min} max ${max}  = ` );
  let minNum = isNaN(parseFloat(min)) ? 0 : parseFloat(min);
let maxNum = isNaN(parseFloat(max)) ? 0 : parseFloat(max);

let t =  parseInt((minNum + maxNum) / 2) ;
  //parseInt(Math.round(parseFloat((min + max) / 2)));
  //console.log("t value  = "+t);
  const [value, setValue] = useState(t );
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-1">
      {/* Floating value indicator */}
      <motion.div
        key={value}
        className="mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="px-1   rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
          ₹{value}
        </span>
      </motion.div>

      {/* Vertical Slider */}
      <div className="relative h-12 flex items-center">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => { setValue(Number(e.target.value)); onLimitPrice(Number(e.target.value))} }
          className="absolute h-12 w-2 appearance-none cursor-pointer
                     bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" }}
          whileTap={{ scale: 1.05 }}
        />
      </div>

      {/* Pill container (for label) */}
       {/*<motion.div
        className="mt-2 flex items-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-full px-4 py-3 flex items-center gap-2">
          <span className="text-indigo-600 font-bold">₹</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Limit Price: <span className="text-indigo-600">₹{value}</span>
          </span>
        </div> 
      </motion.div>*/}
    </div>
  );
}
function LimitPriceSlider({ min = 100, max = 500, step = 1 }) {
  const [value, setValue] = useState((min + max) / 2);

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {/* Pill container */}
      <motion.div
        className="relative flex items-center justify-between rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-full px-2 py-1 flex items-center gap-2">
          <span className="text-indigo-600 font-bold">₹</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Limit Price: <span className="text-indigo-600">₹{value}</span>
          </span>
        </div>
      </motion.div>

      {/* Slider */}
      <div className="mt-2 px-1">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          whileTap={{ scale: 1.05 }}
        />
      </div>

      {/* Floating value indicator */}
      <motion.div
        key={value}
        className="mt-2 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
          ₹{value}
        </span>
      </motion.div>
    </div>
  );
}

function ScrollDial({ value, setValue }) {
  const y = useMotionValue(0);

  // Step size = how many px per number
  const STEP_PX = 30;

  const handleDragEnd = (_, info) => {
    const deltaSteps = Math.round(info.offset.y / STEP_PX);
    if (deltaSteps !== 0) {
      setValue((prev) => Math.max(0, prev  - deltaSteps));
    }

    // Snap back to center after drag
    y.set(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -25, bottom: 10 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      className="absolute right-[-5px] top-1/2 -translate-y-1/2 
                 w-5 h-5 rounded-md border border-zinc-400 
                 bg-white from-zinc-200 to-zinc-400
                 flex flex-col items-center justify-center shadow-inner
                 cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Number display with a dial feel */}
      <motion.div
        style={{ y }}
        className="flex flex-col items-center text-sm font-bold text-zinc-800"
      >
        {/* Active middle (highlighted with blue background) */}
        <div className="h-[25px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
          {value}
        </div>
         {/* <span className="opacity-40">{value + 1}</span> */}
        {/*<span className="text-lg">{value}</span>*}
        {/* <span className="opacity-40">{value - 1 > 0 ? value - 1 : ""}</span>*/}
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
   SWIPE PILL COMPONENT
   ----------------------------------------------------------------------------
   - Reusable draggable pill
   - Swiping LEFT = SELL, RIGHT = BUY
   - Dynamic background changes based on drag direction
   - Action confirmed on drag release if threshold is crossed
----------------------------------------------------------------------------- */
function SwipePill({ side, label,ltp, subtitle, onBuy, onSell, className = "" }) {
  const x = useMotionValue(0);
 const [quantity, setQuantity] = useState(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ))  ); // quantity state
 const [limitPrice, setLimitPrice] = useState(ltp);
 // Background color changes when dragging
  const bg = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    [
      "#fee2e2", // far sell (red)
      "#fecaca", // near sell
      "#f4f4f5", // neutral
      "#bbf7d0", // near buy
      "#86efac", // far buy
    ]
  );
    // Show hint arrows based on drag position
    const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
    const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);
  
    // Flash small toast after action
    const [justAction, setJustAction] = useState(null);
    function roundToNearest5(num) {
      // ensure number
      let n = parseFloat(num);
      if (isNaN(n)) return 0;

      // round to nearest multiple of 5
      let rounded = Math.round(n / 5) * 5;

      // keep 2 decimal places
      return parseFloat(rounded.toFixed(2));
    }
    const handleDragEnd = (_, info) => {
      const threshold = 90; // how far user must drag to trigger action
      if (info.offset.x > threshold) {
        setJustAction("BUY");
        onBuy?.(parseInt(quantity*75) , roundToNearest5(limitPrice ) );
      } else if (info.offset.x < -threshold) {
        setJustAction("SELL");
        onSell?.(parseInt(quantity*75), roundToNearest5(limitPrice ));
      }
    };
     const screwRotation = useMotionValue(0);

      // Each "click" = 15 degrees
      const STEP_DEG = 15;
      const onLimit = (price ) => { 
          setLimitPrice(price);
      }
      const handleScrewDragEnd = (_, info) => {
        const delta = info.offset.y;
        // Up decreases quantity, Down increases
        const stepChange = Math.round(delta / 20); // 20px drag = 1 step
        if (stepChange !== 0) {
          setQuantity((q) => Math.max(1, q + stepChange));
          // Snap rotation to step
          const snapped = Math.round(screwRotation.get() / STEP_DEG) * STEP_DEG;
          screwRotation.set(snapped);
        }
      };
     const [orderStatus, setOrderStatus] = useState("");
       const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      const sellStatus = StorageUtils._retrieve(CommonConstants.remoteServerGeneralSellErrorBasic);

      if (sellStatus?.isValid && sellStatus.data !== null) {
        console.log("sellStatus.data  "+JSON.stringify(sellStatus.data));
        if (sellStatus.data.indexOf("Exception S") > -1) {
          setOrderStatus("Order failed");
           setVisible(true);
          setTimeout(() =>{setVisible(false);   } , 2000);
          StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
          /* let orderSold=  document.getElementById("orderFailedStatus");
           orderSold.setAttribute('display','block')
              setTimeout(() => {
                  let orderSold=  document.getElementById("orderFailedStatus");
                 orderSold.setAttribute('display','none')
                 orderSold.style.display = 'none';;
              },2000);*/
        } else {
          setOrderStatus("Order placed ");
          setVisible(true);
          setTimeout(() =>{setVisible(false);   }, 2000);
           StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
          /*let orderSold=  document.getElementById("orderSuccessStatus");
            orderSold.setAttribute('display','block');
             setTimeout(() => {
                  let orderSold=  document.getElementById("orderSuccessStatus");
                 orderSold.setAttribute('display','none');
                 orderSold.style.display = 'none';
              },2000);*/
        }
      }
    },5000); 
      return () => {  clearTimeout(timer);  /*let orderFailedStatus=  document.getElementById("orderFailedStatus");
            let orderSold=  document.getElementById("orderSuccessStatus");
               orderSold?.setAttribute('display','none');
               orderFailedStatus?.setAttribute('display','none')*/

         } // cleanup
  }, []);

    return (
       <div className={`relative w-full select-none ${className}`}>
         {/* Action hints in background */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 py-2">
           <motion.div
             style={{ opacity: opacitySell }}
             className="flex items-center gap-2 text-red-600 text-[11px]"
           >
             <ArrowLeft size={14} /> <span>Slide to Sell</span>
           </motion.div>
           <motion.div
             style={{ opacity: opacityBuy }}
             className="flex items-center gap-2 text-green-700 text-[11px]"
           >
             <span>Slide to Buy</span> <ArrowRight size={14} />
           </motion.div>
         </div>
   
         {/* Draggable Card */}
         <motion.div
           drag="x"
           dragConstraints={{ left: -160, right: 160 }}
           dragElastic={0.15}
           whileTap={{ scale: 0.98 }}
           onDragEnd={handleDragEnd}
           style={{ x, background: bg }}
           className="relative z-10 grid grid-cols-[1fr_auto] items-center rounded-2xl border border-zinc-300 px-3 py-2 shadow-sm"
         >
           <div>
             {/*<div className="text-[13px] font-semibold leading-5 tracking-tight">
               {label}          <div className="font-semibold leading-5 tracking-tight">{ltp}</div>
             </div>*/}
             <div class="flex justify-between items-center text-[13px] font-semibold leading-5 tracking-tight">
               <span>  {label}     </span>
               <span>{ltp}</span>
             </div>
             <div className="text-[11px] text-zinc-600">{subtitle}</div>
           </div>
           <div className="flex items-center gap-2 text-[10px]">
             <span
               className={`px-2 py-0.5 rounded-full ${
                 side === "CALL"
                   ? "bg-emerald-600/10 text-emerald-700"
                   : "bg-blue-600/10 text-blue-700"
               }`}
             >
               {side}
             </span>  {/*parseInt(Math.round(parseFloat(  )))    parseInt(Math.round(parseFloat(  )))*3     */}
 <VerticalLimitPriceSlider min={ltp} max={  600   } step={1}  onLimitPrice  ={ onLimit } />
                {/*  onSell={(qty) => onAction?.({ side: "CALL", action: "SELL", qty:qty, strike, row })} */}
             <div className="h-[5px] right-[-56px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
                   {parseInt(quantity * 75)}
               </div>
           </div>
           {/* Scroll wheel dial ScrollDial*/}
           <ScrollArrows value={quantity} setValue={setQuantity} />


         </motion.div>
   
         {/* Small Toast on Action */}
         {justAction && (
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] flex items-center gap-1">
             {justAction === "BUY" ? (
               <span className="text-green-700 flex items-center gap-1">
                 <Check size={12} /> Bought
               </span>
             ) : (
               <span className="text-red-600 flex items-center gap-1">

                {/* <X size={12} /> Sold
                      {visible && orderStatus === "FAILED" && (*/} 
              <span id="orderFailedStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} />   {orderStatus}
              </span>
            {/*  )}

           {visible && orderStatus === "SOLD" && (
              <span  id="orderSuccessStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} /> Sold
              </span>
            )}*/} 
               </span>
             )}
           </div>
         )}
       </div>
     );
   }
export default SwipePill;