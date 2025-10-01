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
import OptionRow from "./OptionRow";

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
export default function OptionChainTableSingleUI() {
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
 /*   // suppose niftyMap already exists (Map<name, valueArray>)
  const sortedEntries = [...strikeMap?.entries()].sort(([, a], [, b]) => {
  // a[0] is name according to our value array structure
  const strikeA = Number(a[0].slice(11, -2));
  const strikeB = Number(b[0].slice(11, -2));

  if (Number.isFinite(strikeA) && Number.isFinite(strikeB)) {
  if (strikeA !== strikeB) return strikeA - strikeB;
  // tie-break by type (CE before PE alphabetically)
  const typeA = a[0].slice(-2), typeB = b[0].slice(-2);
  return typeA.localeCompare(typeB);
  }

  // fallback: keep original order
  return 0;
  });*/
   const [ arrayMap , setArrayMap ] = useState( mp => new Map())
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
       let table = new Map();
        table.set('250930','25SEP')
        let exp = table.get(evt.row.expiry);
      let sellord = { qty: evt.qty, price : evt.price , symbol : 'NIFTY'+exp+evt.row.strike+evt.row.type  }
      console.log(`place order Selected: ${JSON.stringify(sellord)}`); 
      // place order Selected: {"qty":75,"price":"145.85","symbol":"NSE:NIFTY25093025300PE"}
      if( evt.action == 'SELL'){
         StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: sellord.qty, 
         price: sellord.price , symbol: sellord.symbol}));
        dispatch(placeSellOrder({ _id: '' , qty: sellord.qty, price: sellord.price , symbol:sellord.symbol}));
     }// if(selectedSymbol && (symbolArray.length > 0) && positionPrice > 0 && positionQty > 0 ) {  
            // const qtyNum = Number(tradeSet.qty);
           // const priceNum = Number(tradeSet.price);
      //        StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
      //        dispatch(placeSellOrder({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
    //    }




      console.log("Trade Executed:", evt);
    };
  


  
   
    
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
  

  function CallPill ({ side, strike,ltp, subtitle, onBuy, onSell, className = "" }) {
     const x = useMotionValue(0);
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
    function roundToNearest5(num) {
      // ensure number
      let n = parseFloat(num);
      if (isNaN(n)) return 0;

      // round to nearest multiple of 5
      let rounded = Math.round(n / 5) * 5;

      // keep 2 decimal places
      return parseFloat(rounded.toFixed(2));
    }
   const [quantity, setQuantity] = useState(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ))  ); // quantity state
 const [limitPrice, setLimitPrice] = useState(0);

    // Show hint arrows based on drag position
    const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
    const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);
  
    // Flash small toast after action
    const [justAction, setJustAction] = useState(null);
  const onLimit = (price ) => { 
          setLimitPrice(price);
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
      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
                                  
      <div className={`relative w-full select-none sm:order-1`}>
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
                  <span> CALL  {strike}     </span>
                  <span>{ltp}</span>
                </div>{/** LTP ₹${ltp} · Bid ₹${bid} · Ask ₹${ask} */}
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
                  CALL
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
           <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
                {strike}
              </div>
          </div>
  ); 
  }
function PutPill ({ side, strike,ltp, subtitle, onBuy, onSell, className = "" }) {
   const x = useMotionValue(0);
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
    function roundToNearest5(num) {
      // ensure number
      let n = parseFloat(num);
      if (isNaN(n)) return 0;

      // round to nearest multiple of 5
      let rounded = Math.round(n / 5) * 5;

      // keep 2 decimal places
      return parseFloat(rounded.toFixed(2));
    }
    const [quantity, setQuantity] = useState(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ))  ); // quantity state
 const [limitPrice, setLimitPrice] = useState(0);

    // Show hint arrows based on drag position
    const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
    const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);
  
    // Flash small toast after action
    const [justAction, setJustAction] = useState(null);
  const onLimit = (price ) => { 
          setLimitPrice(price);
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
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
                                  
     <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
                                      {strike}
                                    </div>
       <div className={`relative w-full select-none sm:order-3`}>
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
                      <span>  PUT  {strike}   </span>
                      <span>{ltp}</span>
                    </div>  {/*  LTP ₹${ ltp} · Bid ₹${ bid} · Ask ₹${ ask}*/}
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
                      PUT
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
              
      </div>
                                             
     ); 
  }


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
                        { strikeMap &&  Array.from(strikeMap.entries())
                           .sort(([keyA, valueA], [keyB, valueB]) => {
                            const strikeA = Number(valueA[0].slice(11, -2)); // value[0] = name
                            const strikeB = Number(valueB[0].slice(11, -2));

                            if (strikeA !== strikeB) return strikeA - strikeB;

                            // tie-break CE vs PE (optional)
                            const typeA = valueA[0].slice(-2);
                            const typeB = valueB[0].slice(-2);
                            return typeA.localeCompare(typeB); // CE before PE
                        })
                           .map(([key, value]) => { 
                             // destructure only the fields you need
                              // const [name, id, timestamp, ltp,, , , bid, ask, , , volume] = value;
                               const [name, id, timestamp, ltp, , , , bid, ask, , , volume] = value;
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
                                            let side = type==='CE' ? 'CALL' : 'PUT';
                                  let row = rowvalue;
                          return (<>  
                          
                             
                                
                                 {/* <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
                                 */}    {/* CALL pill */}
                                    {type ==="CE" &&  (
                                        <CallPill  side="CALL"
                                      strike={ strike  }
                                      ltp = {`₹${row.ltp}` }
                                      subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
                                      onBuy={(qty,price) => handleAction?.({ side: "CALL", action: "BUY",qty:qty,price:price, strike, row })}
                                      onSell={(qty,price) => handleAction?.({ side: "CALL", action: "SELL", qty:qty,price:price, strike, row })}
                                      className="sm:order-1" />
                                     
                                    )
                                    
                                    }
                                   
                             {/* <SwipePill
                                      side="CALL"
                                      label={`CALL ${strike}`}
                                      ltp = {`₹${row.ltp}` }
                                      subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
                                      onBuy={(qty,price) => handleAction?.({ side: "CALL", action: "BUY",qty:qty,price:price, strike, row })}
                                      onSell={(qty,price) => handleAction?.({ side: "CALL", action: "SELL", qty:qty,price:price, strike, row })}
                                      className="sm:order-1"
                                    /> */}
                                    {/* Strike (desktop only) */}
                                   
                              
                                    {/* PUT pill */}
                                      {type ==="PE" && (<PutPill  side="PUT"
                                       strike={ strike  }
                                       ltp = {`₹${row.ltp}` }
                                      subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
                                      onBuy={(qty,price) => handleAction?.({ side: "PUT", action: "BUY",qty:qty,price:price, strike, row })}
                                      onSell={(qty,price) => handleAction?.({ side: "PUT", action: "SELL",qty:qty,price:price, strike, row })}
                                      className="sm:order-3"/>
                                      ) } 



                                    {/*<SwipePill
                                      side="PUT"
                                      label={`PUT ${strike}`}
                                       ltp = {`₹${row.ltp}` }
                                      subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
                                      onBuy={(qty,price) => onAction?.({ side: "PUT", action: "BUY",qty:qty,price:price, strike, row })}
                                      onSell={(qty,price) => onAction?.({ side: "PUT", action: "SELL",qty:qty,price:price, strike, row })}
                                      className="sm:order-3"
                                    />*/}
                                 
                          
                          
                           </> )
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