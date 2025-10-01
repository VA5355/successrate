// components/OptionChainTable.jsx
import { useDispatch, useSelector   } from "react-redux";
import  {  useReducer, useState,useEffect } from 'react';
import { selectFilteredStrikes } from '@/redux/selectors/webSockSelector';
import webSocketSlice  from '@/redux/slices/webSocketSlice';
//import { selectFilteredStrikes } from "../store/selectors";
import useWebSocketStream from "@/redux//hooks/useWebSocketStream";


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
  const type =  row.type;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
      {/* CALL pill */}
      {type ==="CE" &&  <SwipePill
        side="CALL"
        label={`CALL ${strike}`}
        ltp = {`₹${row.ltp}` }
        subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
        onBuy={() => onAction?.({ side: "CALL", action: "BUY", strike, row })}
        onSell={() => onAction?.({ side: "CALL", action: "SELL", strike, row })}
        className="sm:order-1"
      />}
     

      {/* Strike (desktop only) */}
      <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
        {strike}
      </div>

      {/* PUT pill */}
        {type ==="PE" &&  <SwipePill
        side="PUT"
        label={`PUT ${strike}`}
         ltp = {`₹${row.ltp}` }
        subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
        onBuy={() => onAction?.({ side: "PUT", action: "BUY", strike, row })}
        onSell={() => onAction?.({ side: "PUT", action: "SELL", strike, row })}
        className="sm:order-3"
      /> } 
     
    </div>  
  );
}


export default function OptionChainTable() {
    const dispatch = useDispatch();
     // do not do this it will cause all parsed spot and stikes and symbols empty
     /*const [state, dispatch] = useReducer(webSocketSlice, {
            symbol: null,
            name: null,
            time:null,
            price:null,
            searchTickers: null,
            tickerBook: undefined,
            niftyBook: undefined,
            sensexBook: undefined,
            bankNiftyBook: undefined,
            tickerMap: {},   // 👈 initialize empty object
            orderBook: undefined,
            expiries:[],
            selectedExpiry:null,
            spot: null,
            symbols: [],
            connected: false,
    }); */
   // activate WebSocket listener
   const { optionsMap, strikeMap } =  useWebSocketStream("wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55",dispatch);

  const spot = useSelector((state) => state.websocket.spot);
    const symbols = useSelector((state) => state.websocket.symbols);
     const [options , setOptions ]=  useState([]);// useSelector((state) => state.websocket.options);
     const globOptions = useSelector((state) => state.websocket.options);
    const [uniqOpt, setUniqOpt] = useState([]);
  let strikes = useSelector(selectFilteredStrikes);
  //opts => strikes.length > 0 ?   [...strikes]:  Array.isArray(opts) ? [...opts]: []
  const [optionStrikes , setOptionStrikes] = useState([]);
  const status = useSelector((state) => state.websocket.subscriptionStatus);
 // Mock useSelector for demonstration purposes
  //const status = undefined; // Replace with your actual Redux status
  const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        /* Array.from(
             new Set<string>(state.symbols.map ( sy => JSON.stringify(sy)))   
            );  // //action.payload.map((s:any) => s.expiry)
        */
        setUniqOpt(new Set(symbols.map ( sy =>  sy.id)))
      
  }, []);

   useEffect(() => {
   
    // Check if the status is a valid string (not undefined or null)
    setInterval(() => {
       // strikes = useSelector(selectFilteredStrikes);
       setOptions(opts =>   opts  = globOptions );
      } , 1000)
  }, [globOptions]);
    // Use useEffect to manage modal visibility based on a valid status value.
  // This prevents the modal from showing on initial render when status is undefined.
  useEffect(() => {
     //useWebSocketStream("wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55",dispatch);
    // Check if the status is a valid string (not undefined or null)
    if (typeof status === 'string' && status.length > 0) {
      setShowModal(true);
    }
  }, [status]); // Only re-run when the status value changes


   // Use useEffect to cache the strikes data
  useEffect(() => {
    // Only update the state if the strikes array is not empty
    if (strikes.length > 0) {
      setOptionStrikes(strikes);
    }
     setUniqOpt(new Set(symbols.map ( sy =>  sy.id)))
  }, [strikes]); // The effect runs whenever the 'strikes' array changes

  /*
  // Use useEffect to manage modal visibility based on a valid status value.
  // This prevents the modal from showing on initial render when status is undefined.
  useEffect(() => {
    // Check if the status is a valid string (not undefined or null)
    if (typeof status === 'string' && status.length > 0) {
      setShowModal(true);
    }
    if(strikes !==null && strikes !==undefined){
      setOptionStrikes(optS => { 
          if ( strikes.length > 0 ) { 
                 let cop = [...strikes];
             optS = cop;
             return optS;
             }
             else {
             return Array.isArray(optS) ? [...optS]: []
             }
         //    
            
            });
    }



  }, [strikes , status]); // Only re-run when the status value changes
  */

    // Action log
    const [log, setLog] = useState([]);
    const handleAction = (evt) => {
      setLog((prev) => [
        { time: new Date().toLocaleTimeString(), ...evt },
        ...prev,
      ].slice(0, 6));
  
      // Replace with your API call:
      // placeOrder(evt)
      /*
      Trade Executed: 
        {side: 'PUT', action: 'BUY', strike: '25100', row: {…}}
        action
        : 
        "BUY"
        row
        : 
        {strike: '25100', id: '302418025', type: 'PE', timestamp: '2025-09-23T15:31:12', ltp: '65', …}
        side
        : 
        "PUT"
        strike
        : 
        "25100"
        [[Prototype]]
        : 
        Object
      */
      let sellord = { qty:75, price : evt.row.ltp , symbol : 'NSE:NIFTY'+evt.row.expiry+evt.row.strike+evt.row.type  }
      console.log(`place order Selected: ${JSON.stringify(sellord)}`); 
      // place order Selected: {"qty":75,"price":"145.85","symbol":"NSE:NIFTY25093025300PE"}

    // if(selectedSymbol && (symbolArray.length > 0) && positionPrice > 0 && positionQty > 0 ) {  
            // const qtyNum = Number(tradeSet.qty);
           // const priceNum = Number(tradeSet.price);
      //        StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
      //        dispatch(placeSellOrder({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
    //    }




      console.log("Trade Executed:", evt);
    };
  





  return (
    <div className="p-4">
      {/* Conditionally render the modal if showModal is true */}
      {showModal && <>
             {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* shadow-xl  not needed  */}
            <div className="bg-white rounded-xl  p-6 w-[300px] max-w-[90%] border border-gray-200">
            {/*  <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Confirm Order</h3>*/}

              <div className="flex items-center justify-between space-x-2">
                 
                <button
                  
                  className="flex-1 bg-brandgreen-600  py-1 rounded-lg hover:bg-green-700 transition"
                >
                 {status}
                </button>
 
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 block mx-auto"
              >
                Ok
              </button>
            </div>
          </div>
      
      </>}
      {/* Conditionally render the table if showModal is false */}
      {!showModal && <>
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
                        { strikeMap &&  Array.from(strikeMap.entries()).map(([key, value]) => { 
                             // destructure only the fields you need
                               const [name, id, timestamp, ltp,, , , bid, ask, , , volume] = value;
                                  let type = name.slice(-2);
                                   let strike =  name.slice(11,-2);
                                    let expiry = name.slice(5, 11);
                                            // construct a row object to pass down
                                            const rowvalue = {
                                              strike,
                                              id,
                                              type,
                                              expiry,
                                              timestamp,
                                              ltp,
                                              bid,
                                              ask,
                                              volume,
                                            } 
                          return (<>  <OptionRow key={key} row={ rowvalue} onAction={handleAction} /> </> )
                            }) 
                        }
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
                </> }
     
    </div>
  );
}
/*  REMOVWD 
 <td className="px-4 py-2 text-center text-gray-800 font-semibold">
                              {name.slice(-2)}
                            </td>
*/