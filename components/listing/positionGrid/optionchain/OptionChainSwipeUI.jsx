import React, { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, X, Heading4 } from "lucide-react";
import "./index.css";
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
   const [quantity, setQuantity] = useState(1); // quantity state
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

  const handleDragEnd = (_, info) => {
    const threshold = 90; // how far user must drag to trigger action
    if (info.offset.x > threshold) {
      setJustAction("BUY");
      onBuy?.();
    } else if (info.offset.x < -threshold) {
      setJustAction("SELL");
      onSell?.();
    }
  };
  // Screw knob rotation state
  const screwRotation = useMotionValue(0);

  // When screw is rotated, adjust quantity
  const handleScrewDrag = (_, info) => {
    const delta = Math.round(info.offset.y / -20); // drag up increases qty
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

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
          </span>
        </div>
             {/* Screw knob with quantity */}
        <motion.div
          drag="y"
          dragConstraints={{ top: -40, bottom: 40 }}
          style={{ rotate: screwRotation }}
          onDrag={handleScrewDrag}
          className="w-8 h-8 rounded-full border border-zinc-400 flex items-center justify-center cursor-grab active:cursor-grabbing bg-gradient-to-br from-zinc-200 to-zinc-400 shadow-inner"
        >
          <span className="text-[10px] font-bold">{quantity}</span>
        </motion.div>

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
              <X size={12} /> Sold
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   OPTION ROW COMPONENT
   ----------------------------------------------------------------------------
   - Displays one strike row
   - CALL pill on left, PUT pill on right
   - Middle strike price (desktop only)
----------------------------------------------------------------------------- */
function OptionRow({ row, onAction }) {
  const strike = row.strike;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
      {/* CALL pill */}
      <SwipePill
        side="CALL"
        label={`CALL ${strike}`}
        ltp = {`₹${row.call.ltp}` }
        subtitle={`LTP ₹${row.call.ltp} · Bid ₹${row.call.bid} · Ask ₹${row.call.ask}`}
        onBuy={() => onAction?.({ side: "CALL", action: "BUY", strike, row })}
        onSell={() => onAction?.({ side: "CALL", action: "SELL", strike, row })}
        className="sm:order-1"
      />

      {/* Strike (desktop only) */}
      <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
        {strike}
      </div>

      {/* PUT pill */}
      <SwipePill
        side="PUT"
        label={`PUT ${strike}`}
         ltp = {`₹${row.call.ltp}` }
        subtitle={`LTP ₹${row.put.ltp} · Bid ₹${row.put.bid} · Ask ₹${row.put.ask}`}
        onBuy={() => onAction?.({ side: "PUT", action: "BUY", strike, row })}
        onSell={() => onAction?.({ side: "PUT", action: "SELL", strike, row })}
        className="sm:order-3"
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------
   MAIN OPTION CHAIN COMPONENT
----------------------------------------------------------------------------- */
export default function OptionChainSwipeUI() {
  // Mock data (replace with live API later)
  const data = useMemo(
    () => [
      {
        strike: 24500,
        call: { ltp: 416.80, bid: 424.0, ask: 427.3 },
        put: { ltp: 21.65, bid: 21.65, ask: 22.00 },
      },
      {
        strike: 24600,
        call: { ltp: 332.55, bid: 335.3, ask: 338.9 },
        put: { ltp: 33.65, bid: 33.15, ask: 33.65 },
      },
      {
        strike: 24700,
        call: { ltp: 256.95, bid: 255.15, ask: 257.95 },
        put: { ltp: 52.5, bid: 52.1, ask: 52.35 },
      },
      {
        strike: 24800,
        call: { ltp: 128.8, bid: 128.2, ask: 129.2 },
        put: { ltp: 81.7, bid: 80.1, ask: 81.6 },
      },
    ],
    []
  );

  // Action log
  const [log, setLog] = useState([]);
  const handleAction = (evt) => {
    setLog((prev) => [
      { time: new Date().toLocaleTimeString(), ...evt },
      ...prev,
    ].slice(0, 6));

    // Replace with your API call:
    // placeOrder(evt)
    console.log("Trade Executed:", evt);
  };

  return (
    <div className=" w-full bg-zinc-50 sm:bg-white p-1 sm:p-2"> {/* min-h-screen (gap between positon removed)  p-3 sm:p-6  */}
      <div className="mx-auto overflow-hidden">{/*   max-w-4xl  */}
        {/* Header */}
        <div className="flex  mb-3">{/* items-center justify-between */}
          <h4 className="text-lg sm:text-2xl font-bold tracking-tight">
             Swipe to Trade
          </h4>
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-zinc-600">
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" /> Buy →
            Slide right
            <div className="h-3 w-3 rounded-full bg-rose-500/50" /> Sell → Slide
            left
          </div>
        </div>

        {/* Desktop Header Row */}
        <div className="hidden sm:grid grid-cols-[1.2fr_0.8fr_1.2fr] text-[12px] text-zinc-600 px-1 mb-1">
          <div  className="px-4 ">STRIKE</div>
          <div className="text-center">CALLS</div>
          <div className="text-right sm:text-left">PUTS</div>
        </div>

        {/* Option Rows */}
        <div className="grid gap-6 sm:gap-12">
          {data.map((row) => (
            <OptionRow key={row.strike} row={row} onAction={handleAction} />
          ))}
        </div>

        {/* Recent Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-sm font-semibold text-zinc-700 mb-2">
            Recent Actions
          </h2>
          <div className="grid gap-1">
            {log.length === 0 && (
              <div className="text-[12px] text-zinc-500">
                Slide a card left/right to trade.
              </div>
            )}
            {log.map((l, i) => (
              <div key={i} className="text-[12px] text-zinc-700">
                {l.time}:{" "}
                <span className="font-semibold">
                  {l.action} {l.side}
                </span>{" "}
                @ {l.strike}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="sm:hidden mt-4 text-[11px] text-zinc-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowLeft size={12} /> Slide left to sell
            </span>
            <span className="flex items-center gap-1">
              Slide right to buy <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
