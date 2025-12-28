// SellPlus2Order.jsx
import React, { useEffect, useState, useRef  } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./placeBuyOrder.actions";
import {useDispatch, useSelector} from 'react-redux';
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Minus, Plus } from "lucide-react";

import './buttonOverride.css'; 
import './SellPlus2Order.css'; 


const SellPlus2Order = ({   isMobile , sellPlusSymbol ,symAvgPrice, boughtQty ,  qtySold }) => {
  const dispatch = useDispatch();
  const hasMounted = useRef(true);
 const [positionQty  ,setPositionQty ] = useState(() => boughtQty -qtySold ) ; //Number(tradeSet.qty);
  const [positionPrice, setPositionPrice ]= useState(symAvgPrice) ;  // Number(tradeSet.price);
  const [positionSymbol, setPositionSymbol ]= useState(sellPlusSymbol) ;  // Number(tradeSet.price);
   const [mobileView, setMobileView ]= useState(isMobile) ;  // boolean;
  const [showSymbolModal, setShowSymbolModal] = useState(false);
   const [selectedSymbol, setSelectedSymbol] = useState(null);
 const [ symbolArray,setSymbolArray ] = useState([]);

   useEffect (() => {
    if (!hasMounted.current) {
        hasMounted.current = false;
          console.log("Sell Plus 2 FIRST VISIT ");
                 // setIsPlaceStreaming(false);
        return; // skip on mount
    }
    
      let  positionDataCache = StorageUtils._retrieve(CommonConstants.recentPositionsKey);
       let positionArray  = [];
      if(positionDataCache !==null && positionDataCache !== undefined) {
       let postionBook = positionDataCache.data;
       if(postionBook !==null && postionBook !== undefined){
       try {
        if (typeof postionBook === "string") {
         try {   const parsed = JSON.parse(postionBook);
              const data =  parsed;     // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
               positionArray  = data;
            if (data !==null && data !== undefined){  
             //setParsedData(data);
              console.log(" Sell Plus 2 Position Book fetching sample JSON Position Book storage: "+JSON.stringify(data ));
            }else {
              console.log("Sell Plus 2 Position Book fetched from   " );
            }
         } catch (err) {
             console.warn("Sell Plus 2 Invalid Position JSON in storage:", err);
         }
        }
        else { 
             positionArray  = postionBook;
         }
        }
        catch( er){
          console.log(" Sell Plus 2 Position Book fetch and saved has issue, please re-fresh ")
        }
       }   // PSOTION BOOK 
       else { 
       console.log(" Sell Plus 2 Position book should be there, but is not  , please re-fresh ")
       }
      } // POSTION CACHE 
      // ALSO FETCH the ORDER BOOK 
      // INCASE ALREADY ORDER's PLACED fro the SAME SYMBOL 
      // then re-calculate the QTY that can we sold , else order may not go through during live MARKET 
      

      // IF Positin ARRAY fetched  select the AVG price and QTY for the sellPlusSymbol
      if( positionArray!==null && positionArray !== undefined ) {
         positionArray.forEach( ps => { 
              let {symbol } = ps;
              if(symbol === sellPlusSymbol){
                   let {netQty , qty , avgPrice} = ps;
               // update positionQty based on the latest netQty and previous positionQty
                  setPositionQty(prev => netQty - qtySold);
                let integerPart = Math.floor(avgPrice)+2;
                let decimalPart = Math.round((avgPrice % 1) * 100); // 61
                // Round UP to nearest multiple of 5
                 let roundedDecimal = Math.ceil(decimalPart / 5) * 5;

                 // Handle overflow like 100 -> carry to integer
                if (roundedDecimal === 100) {
                integerPart += 1;
                roundedDecimal = 0;
                }
               let finalValue = parseFloat(`${integerPart}.${roundedDecimal.toString().padStart(2, '0')}`);
               console.log("Sell Plus 2 sell Price  " + finalValue); // 162.65   

                setPositionPrice (pre => pre = finalValue);
                 console.log(" Sell Plus 2 Position book price qty  "+(finalValue+ " "+netQty))
              }

          });  
        }

 

     console.log("Sell Plus 2 RESET ");
    // setIsPlaceStreaming((prev) => !prev);

 } , []);


const setSellOrder = () => {
  
  /*if (qtyNum <= 0 || priceNum <= 0) {
    alert("Enter valid Qty and Price for Sell");
    return;
  }*/
  // CHECK the POSITION DATA positionData  NOT NEED THIS IS FAST SELL PLUS 2 IN CASE FAILED LET IT FAIL 
  // [{"netQty":1,"qty":1,"avgPrice":72256,"netAvg":71856,"side":1,"productType":"MARGIN","realized_profit":400,
  // "unrealized_profit":461,"pl":861,"ltp":72717,"buyQty":2,"buyAvg":72256,"buyVal":144512,"sellQty":1,"sellAvg":72656,
  // "sellVal":72656,"slNo":0,"fyToken":"1120200831217406","crossCurrency":"N","rbiRefRate":1,"qtyMulti_com":1,
  // "segment":20,"symbol":"MCX:SILVERMIC20AUGFUT","id":"MCX:SILVERMIC20AUGFUT-MARGIN","cfBuyQty":0,"cfSellQty":0,
  // "dayBuyQty":0,"daySellQty":1,"exchange":10}]
  let symbolArry = [positionSymbol]; 
  if(symbolArry.length > 0 ){

             // show the carausal listing the symbols to sell 
              setShowSymbolModal(true);
              setSymbolArray(pre => pre = symbolArry);
          }
    setTimeout(() => {
    console.log("Quick Sell Plus 2 order response awaited for 3 seconds");
  }, 3000);

 
};
const dispatchSellSelected = ()=> {
    
    console.log(`Selected: ${selectedSymbol}`); setShowSymbolModal(false); 
   if(selectedSymbol && (symbolArray.length > 0) && positionPrice > 0 && positionQty > 0 ) {  
     // const qtyNum = Number(tradeSet.qty);
    // const priceNum = Number(tradeSet.price);
       StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
       dispatch(placeSellOrder({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
    }
}
const handlePositionPriceOff = (gold)=> {
     let value = parseFloat(gold) >(symAvgPrice+2) ? parseFloat(gold) :(symAvgPrice+2) || 0;
    value = Math.round(value * 100) / 100; // 2 decimals

    let decimalPart = Math.round((value % 1) * 100);
    decimalPart = Math.round(decimalPart / 5) * 5;

    if (decimalPart === 100) {
      value = Math.floor(value) + 1;
      decimalPart = 0;
    }

    const finalValue = parseFloat(
      `${Math.floor(value)}.${decimalPart.toString().padStart(2, "0")}`
    );
    //setPositionPrice(finalValue);
    return finalValue;
    
}
const handlePositionPrice = (e) => {
  const minPrice = (symAvgPrice ?? 0) + 2;

  let value = parseFloat(e.target.value);
  if (isNaN(value)) value = minPrice;

  // Enforce minimum price
  value = Math.max(value, minPrice);

  // Round to nearest 0.5 (one decimal)
  const finalValue = Math.round(value * 2) / 2;

  setPositionPrice(finalValue);
};
/*const handlePositionPrice = (e) => {
     let value = parseFloat(e.target.value) >(symAvgPrice+2) ? parseFloat(e.target.value) :(symAvgPrice+2) || 0;
    value = Math.round(value * 100) / 100; // 2 decimals

    let decimalPart = Math.round((value % 1) * 100);
    decimalPart = Math.round(decimalPart / 5) * 5;

    if (decimalPart === 100) {
      value = Math.floor(value) + 1;
      decimalPart = 0;
    }

    const finalValue = parseFloat(
      `${Math.floor(value)}.${decimalPart.toString().padStart(2, "0")}`
    );

    setPositionPrice(finalValue);
    //setPositionPrice(parseFloat(e.target.value) || 0)
} */
  const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sheet = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: "100%" },
};




  
    return (
     <>  {/*   onClick={() => {  setShowModal(true); handleToggle(); }}  */}
    <button id="SELLPLUS2ORDERBUTTONID"  onClick={() => {  setSellOrder(); }}
     className="bg-brandgreen text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600 active:scale-95 transition"
    > SELL +2
   {/*   {isStreaming ? (
        <Activity size={5} className=" animate-pulse " />
      ) : (
        <ToggleLeft size={5} className="text-gray-500" />
      )} 
      <span id="PLACEORDERBUTTONSPAN" className="text-sm font-semibold font-medium">
        {isPlaceStreaming ? 'Placing' : 'Place Order'}
      </span>*/}
    </button>
      <AnimatePresence>
  {showSymbolModal && (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black/40 z-50  sm:w-[220px] flex items-end sm:items-center justify-center"
      onClick={() => setShowSymbolModal(false)}
    >
      {/* STOP click propagation */}
      <motion.div
        variants={sheet}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white w-[220px] sm:w-[120px] 
          rounded-t-xl sm:rounded-xl
          p-3 shadow-xl
          max-h-[80vh] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">
            Select Symbol to Sell
          </h2>
          <button onClick={() => setShowSymbolModal(false)}>
            <X className="ml-4 w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Symbols */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {symbolArray.map((symbol, idx) => {
            const selected = selectedSymbol === symbol;

            return (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedSymbol(symbol)}
                className={`
                  min-w-[220px] rounded-lg border p-2 cursor-pointer
                   transition
                  ${selected
                    ? "border-brandgreen bg-brandgreen/10"
                    : "border-gray-200"}
                `}
              >
                {/* Symbol */}
              <div className="font-medium text-xs mb-1 truncate">
                    {symbol}
              </div>

                {/* Qty Slider */}
                <div className="mb-1">
                  <label className="text-[10px] text-gray-500">
                    Qty
                  </label>
                  <input
                    type="range"
                    min="0"
                    step="75"
                    max={boughtQty - qtySold}
                    value={selected ? positionQty : 0}
                    onChange={(e) => setPositionQty(Number(e.target.value))}
                    className="w-full h-1 accent-pink-600  mobile-margin-qty"
                  />
                  <div className={`text-[10px] ${mobileView ? "text-left" :"    text-right"}`}>
                    {positionQty}
                  </div>
              </div>
                  {/* Price Slider */}
           <div className="mb-1">
            <label className="text-[10px] text-gray-500">
              Price
            </label>
            <input
              type="range"
              min="0"
              step="2"
              max={positionPrice * 3}
              value={selected ? positionPrice : 0}
              onChange={handlePositionPrice}
              className="w-full h-1 accent-pink-600  mobile-margin-price"
            />
            <div className={`text-[10px] ${mobileView ? "text-left" :"    text-right"}`}>
              ₹ {positionPrice}
            </div>
          </div>

                {/* Sell Button */}
                {selected && (
                  <button
                  disabled={!(positionQty >= 75 && positionPrice >= 0)}
                  onClick={dispatchSellSelected}
                  className={` 
                    w-full mt-1 flex items-center justify-center gap-1
                    px-2 py-1.5 rounded-md text-xs font-semibold
                    transition
                    ${
                      positionQty >= 75
                        ? "bg-brandgreen text-white hover:bg-red-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Sell
                </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
      <div className="mt-3">
        <button
          onClick={() => setShowSymbolModal(false)}
          className="w-full py-1.5 rounded-lg bg-gray-200 text-xs font-semibold"
        >
          Cancel
        </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

     
   </>
    );




}
export default SellPlus2Order;
