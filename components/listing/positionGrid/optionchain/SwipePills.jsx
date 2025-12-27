// SwipePills.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Loader2,
  Check,
  X,
  Lock,
  Unlock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import {  AnimatePresence} from "framer-motion";
import "./sidewaysPriceSlider.css";

function SidewaysPriceSlider({ idx, min = 100, max = 500, step = 0.5, onLimitPrice }) {
  const [value, setValue] = useState(min);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      {/* Floating Value */}
      <motion.div
        key={value}
        className="mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        id="strikePrice"
      >
        <span className="px-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
          {value}
        </span>
      </motion.div>

      {/* Horizontal Slider */}
      <div className="relative w-40 flex items-center">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            onLimitPrice(Number(e.target.value));
          }}
          className="w-full h-2 appearance-none cursor-pointer rounded-full
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          whileTap={{ scale: 1.05 }}
        />
      </div>
    </div>
  );
}


/**
 * Module-level default map — preserves quantity across re-renders if no external map passed
 */
const defaultQtyMap = new Map();

/**
 * Small spinner overlay component (reusable)
 */
function SpinnerOverlay({ show, className = "" }) {
  if (!show) return null;
  return (
    <div
      className={`absolute inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-2xl ${className}`}
      aria-busy="true"
      role="status"
    >
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

/**
 * Utility: round to nearest 5 with 2 decimals
 */
function roundToNearest5(num) {
  /*const n = parseFloat(num);
  if (isNaN(n)) return 0;
  const rounded = Math.round(n / 5) * 5;
  return parseFloat(rounded.toFixed(2));
  */
  return roundToLowerTenth(num);
}
function roundToLowerTenth(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return 0;

  // floor to 1 decimal place
  const floored = Math.floor(n * 10) / 10;

  // keep 2 digits precision
  return parseFloat(floored.toFixed(2));
}

/**
 * Shared behaviour extracted into a hook inside component file to avoid re-renders/unmounts
 * - handler may be sync or return a Promise
 */
function useActionSpinner({ minSpinnerMs = 300 } = {}) {
  const [loading, setLoading] = useState(false);
  const startRef = useRef(0);

  const callAction = useCallback(
    async (handler, ...args) => {
      if (typeof handler !== "function") return;
      setLoading(true);
      startRef.current = Date.now();
      try {
        const res = handler(...args);
        if (res && typeof res.then === "function") {
          await res;
        }
        // ensure minimum spinner visible time
        const elapsed = Date.now() - startRef.current;
        if (elapsed < minSpinnerMs) {
          await new Promise((r) => setTimeout(r, minSpinnerMs - elapsed));
        }
        return res;
      } catch (err) {
        // still ensure spinner minimal time
        const elapsed = Date.now() - startRef.current;
        if (elapsed < minSpinnerMs) {
          await new Promise((r) => setTimeout(r, minSpinnerMs - elapsed));
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [minSpinnerMs]
  );

  return { loading, callAction, setLoading };
}

/* ----------------------------------------------------------------------------
   SWIPE PILL (generic)
   - We keep a single component and duplicate for PUT/CALL usage near the end
----------------------------------------------------------------------------- */
function SwipePillBase({
  idx,
  side,
  label,
  ltp,
  subtitle,
  onBuy,
  onSell,
  // optionally pass shared qty map so other components can share state
  qtyMap = defaultQtyMap,
  className = "",
}) {
  // motion value for dragging
  const x = useMotionValue(0);

  // internal state: locked, units (base units), limitPrice
  // we store 'units' (not multiplied) and show total = units * 75 where needed
  const initialUnits = (() => {
    const stored = qtyMap.get(idx);
    // if stored is undefined -> default 0
    return stored !== undefined ? Number(stored) || 0 : 0;
  })();

  const [locked, setLocked] = useState(false);
  const [units, setUnits] = useState(initialUnits);
  const [limitPrice, setLimitPrice] = useState(ltp ?? 0);

  // LIMIT MARGING and Scheduled order buttons 
  const [orderType, setOrderType] = useState("LIMIT"); // LIMIT | MARGIN
const [scheduled, setScheduled] = useState(false);


  // Persist units back into the map whenever it changes (so other renders see it)
  useEffect(() => {
    try {
      qtyMap.set(idx, Number(units) || 0);
    } catch (e) {
      // ignore if map is not writable
    }
  }, [idx, units, qtyMap]);

  // background transform visuals
  const bg = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    ["#fee2e2", "#fecaca", "#f4f4f5", "#bbf7d0", "#86efac"]
  );

  const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
  const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);

  // small toast
  const [justAction, setJustAction] = useState(null);

  // spinner + action wrapper (internal, stable identity)
  const { loading, callAction } = useActionSpinner({ minSpinnerMs: 300 });

  // drag end: determine buy/sell and call appropriate handler via callAction
  const handleDragEnd = useCallback(
    async (_, info) => {
      const threshold = 90;
      if (info.offset.x > threshold) {
        setJustAction("BUY");
        try {
          await callAction(onBuy, parseInt(units * 75), roundToNearest5(limitPrice) ,
              
                orderType,
                scheduled
              );
        } catch (err) {
          // swallow or handle errors as you need
          // you may want to set an error toast here
        }
      } else if (info.offset.x < -threshold) {
        setJustAction("SELL");
        try {
          await callAction(onSell, parseInt(units * 75), roundToNearest5(limitPrice),
               
                orderType,
                scheduled
               );
        } catch (err) {
          // handle error
        }
      }
      // reset small toast after short time (keeps UI responsive)
      setTimeout(() => setJustAction(null), 1400);
    },
    [callAction, onBuy, onSell, units, limitPrice]
  );

  // screw/scroll wheel drag end to change units
  const screwRotation = useMotionValue(0);
  const STEP_DEG = 15;
  const handleScrewDragEnd = useCallback((_, info) => {
    const delta = info.offset.y;
    const stepChange = Math.round(delta / 20); // 20px per step
    if (stepChange !== 0) {
      setUnits((q) => Math.max(0, q + stepChange));
      // Snap rotation visually
      const snapped = Math.round(screwRotation.get() / STEP_DEG) * STEP_DEG;
      screwRotation.set(snapped);
    }
  }, []);

  // helper to update limit price from SidewaysPriceSlider
  const onLimit = useCallback((price) => {
    setLimitPrice(price);
  }, []);

  // ensure drag disabled when locked OR when loading
  const dragDisabled = locked || loading;

  // Render
  // Note: wrapper is relative so spinner overlay absolute will match pill exactly
  return (
    <div className={`relative flex items-center rounded-2xl p-2 transition ${className}`}>
      {/* Lock button - doesn't get re-created by spinner */}
      <button  id="optionLock"
        onClick={() => setLocked((s) => !s)}
        className={`absolute -right-5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 shadow z-20
           ${locked ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'} ` }
        aria-pressed={locked}
        title={locked ? "Unlock" : "Lock"}
      >
        {locked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {/* Background hints */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 py-2 z-0">
        <motion.div style={{ opacity: opacitySell }} className="flex items-center gap-2 text-red-600 text-[11px]">
          <ArrowLeft size={14} /> <span>Slide to Sell</span>
        </motion.div>
        <motion.div style={{ opacity: opacityBuy }} className="flex items-center gap-2 text-green-700 text-[11px]">
          <span>Slide to Buy</span> <ArrowRight size={14} />
        </motion.div>
      </div>

      {/* Draggable Card */}
      <motion.div
        drag={dragDisabled ? false : "x"}
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.15}
        whileTap={{ scale: 0.98 }}
        onDragEnd={handleDragEnd}
        style={{ x, background: bg }}
        className="relative z-10 grid grid-cols-[1fr_auto] items-center rounded-2xl border border-zinc-300 px-3 py-2 shadow-sm min-w-[220px] max-w-[640px] w-full"
      >

                      {/* Order Options (Top Right) */}
            <div className="absolute top-1 right-3 z-30 flex items-center gap-2">
              
              {/* Limit / Margin Toggle */}
              <div className="flex rounded-full bg-zinc-100 p-0.5 shadow-inner">
                <button
                  onClick={() => setOrderType("LIMIT")}
                  className={`px-2 py-0.5 text-[10px] rounded-full transition
                    ${orderType === "LIMIT"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-zinc-600 hover:text-zinc-900"}
                  `}
                >
                  Limit
                </button>
                <button
                  onClick={() => setOrderType("MARGIN")}
                  className={`px-2 py-0.5 text-[10px] rounded-full transition
                    ${orderType === "MARGIN"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-zinc-600 hover:text-zinc-900"}
                  `}
                >
                  Margin
                </button>
              </div>

              {/* Scheduled Checkbox */}
              <label className="flex items-center gap-1 text-[10px] text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(e) => setScheduled(e.target.checked)}
                  className="accent-indigo-600 scale-90"
                />
                Sched
              </label>
            </div>


        <div>
          <div className="flex justify-between items-center text-[13px] font-semibold leading-5 tracking-tight">
            <span>{label}</span>
            <span>{ltp}</span>
          </div>
          <div className="text-[11px] text-zinc-600">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded-full ${
              side === "CALL" ? "bg-emerald-600/10 text-emerald-700" : "bg-blue-600/10 text-blue-700"
            }`}
          >
            {side}
          </span>
             {/*parseInt(Math.round(parseFloat(  )))    parseInt(Math.round(parseFloat(  )))*3     */}
 <SidewaysPriceSlider  idx={idx}    min={ltp} max={  600   } step={0.5}  onLimitPrice  ={ onLimit } />
                {/*  onSell={(qty) => onAction?.({ side: "CALL", action: "SELL", qty:qty, strike, row })} */}
             <div className="h-[5px] right-[-56px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
                   {parseInt(units * 75)}
               </div>
          
          {/* Replace with your SidewaysPriceSlider component */}
          <div className="flex items-center gap-2">
            {/* Example placeholder for SidewaysPriceSlider */}
            <div className="relative">
              <div className="px-3 py-1 rounded-full bg-white text-xs shadow-inner">₹{limitPrice}</div>
              {/* Ideally: <SidewaysPriceSlider idx={idx} min={ltp} max={600} step={1} onLimitPrice={onLimit} /> */}
            </div>
          </div>

          {/* Qty display */}
          <div className="h-[5px] right-[-56px] w-full flex items-center justify-center font-bold text-base">
            {parseInt(units * 75)}
          </div>
        </div>

        {/* Scroll wheel dial (replace with your ScrollArrows component) */}
        <div className="absolute right-[-44px] z-10 top-1/2 -translate-y-1/2">
          {/* A simple up/down control to adjust units */}
          <div id="chevronUpDownBtn" className="flex flex-col gap-1 items-center">
            <button
              onClick={() => setUnits((q) => Math.max(0, q + 1))}
              disabled={loading}
              className="p-1 rounded bg-gray-100 shadow"
            >
              ▲
            </button>
            <div className="text-xs">{units}</div>
            <button onClick={() => setUnits((q) => Math.max(0, q - 1))} disabled={loading} className="p-1 rounded bg-gray-100 shadow">
              ▼
            </button>
          </div>
        </div>

        {/* Action toast */}
        {justAction && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] flex items-center gap-1 z-20">
            {justAction === "BUY" ? (
              <span className="text-green-700 flex items-center gap-1">
                <Check size={12} /> Bought
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <X size={12} /> Sold
              </span>
            )}
          </div>
        )}

        {/* Spinner overlay (inside the same root to avoid unmount) */}
        <SpinnerOverlay show={loading} />
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Public components: SwipePutPill and SwipeCallPill (thin wrappers)
----------------------------------------------------------------------------- */

export function SwipePutPill(props) {
  return <SwipePillBase {...props} side="PUT" />;
}

export function SwipeCallPill(props) {
  return <SwipePillBase {...props} side="CALL" />;
}

export default SwipePillBase;
