// SellPlus2Order.jsx
import React, { useEffect, useState, useRef  } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./placeBuyOrder.actions";
import {useDispatch, useSelector} from 'react-redux';
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import './buttonOverride.css'; 

const SellPlus2Order = ({sellPlusSymbol ,symAvgPrice, boughtQty ,  qtySold }) => {
  const dispatch = useDispatch();
  const hasMounted = useRef(true);
 const [positionQty  ,setPositionQty ] = useState(() => boughtQty -qtySold ) ; //Number(tradeSet.qty);
  const [positionPrice, setPositionPrice ]= useState(symAvgPrice) ;  // Number(tradeSet.price);
  const [positionSymbol, setPositionSymbol ]= useState(sellPlusSymbol) ;  // Number(tradeSet.price);
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
}


  
    return (
     <>  {/*   onClick={() => {  setShowModal(true); handleToggle(); }}  */}
    <button id="SELLPLUS2ORDERBUTTONID"  onClick={() => {  setSellOrder(); }}
     className="bg-brandgreen text-white text-xs px-2 py-1 rounded hover:bg-red-600"
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
    {showSymbolModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-[400px]">
      <h2 className="text-lg font-semibold mb-3">Select Symbol to Sell</h2>

      {/* Horizontal scrollable container   ${
                selectedSymbol === symbol
                  ? "bg-brandgreenlight text-sm border-red-500"
                  : "bg-brandgreen text-white border-gray-300"
              } */}
      <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400">
        {symbolArray.map((symbol, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedSymbol(symbol)}
            className={`flex items-center justify-between px-2 py-2 bg-brandgreenlight text-sm border-red-500 min-w-[280px] cursor-pointer rounded-lg border transition-all duration-200
               `}
          >
            <span  className={`px-1 py-1 w-[150px] rounded text-white transition-colors duration-300 ${
                    positionQty === 0
                      ? "bg-brandgreen"
                      : positionQty < (boughtQty - qtySold)  
                      ? "bg-brandgreen"
                      : "bg-brandgreen"
                  }`}>{symbol}
                  
                     {/* Range Slider for Position Qty */}
            <input
              type="range"
              min="0"
              step="75"
              max={boughtQty - qtySold}
              className="w-13 h-1 rounded-lg   cursor-pointer bg-gray-300 accent-pink-600 
                   
                [&::-webkit-slider-thumb]:w-[2px]
                [&::-webkit-slider-thumb]:h-9
                [&::-webkit-slider-thumb]:bg-pink-600
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-none
                [&::-webkit-slider-thumb]:hover:bg-pink-700
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-[2px]
                [&::-moz-range-thumb]:h-9
                [&::-moz-range-thumb]:bg-pink-600
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:rounded-none
                [&::-moz-range-thumb]:hover:bg-pink-700
                "
              value={selectedSymbol === symbol ? positionQty : 0}
              onChange={(e) => setPositionQty( e.target.value )}
            />
                  </span>

            {/* Position Qty 
            <input
              type="number"
              min="0"
              step="75"
              max={boughtQty - qtySold}
              className="w-16 px-2 py-1 border rounded text-black"
              value={selectedSymbol === symbol ? positionQty : ""}
              onChange={(e) => setPositionQty(e.target.value)
               
              }
            />*/}

           
                          {/* Show current qty value className="text-sm text-gray-700 mt-1"*/}
              <span className={`mx-4  py-1 w-[20px] rounded`}>
                {positionQty}
              </span>
                            {/* Show current price */}
              <span className={`mx-4 px-2 py-1 w-[60px] rounded   transition-colors duration-300  `}>
                <input id="price"
                type="range"
                min="0"
                step="2"   // moves in 0.10 increments (2 × 0.05)
                max={positionPrice*3}
                className=" w-[70px] h-1 rounded-lg  cursor-pointer bg-gray-300 accent-pink-600 
                [&::-webkit-slider-thumb]:w-[2px]
                [&::-webkit-slider-thumb]:h-9
                [&::-webkit-slider-thumb]:bg-pink-600
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-none
                [&::-webkit-slider-thumb]:hover:bg-pink-700
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-[2px]
                [&::-moz-range-thumb]:h-9
                [&::-moz-range-thumb]:bg-pink-600
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:rounded-none
                [&::-moz-range-thumb]:hover:bg-pink-700
                "
                value={selectedSymbol === symbol ? positionPrice : 0}
                onChange={(e) => handlePositionPrice( e )}
                />

                {  positionPrice }
              </span>

            {/* Position Price 
            <input
              type="number"
              min="0"
              step="0.05"
              className="w-20 px-2 py-1 border rounded text-black"
              value={selectedSymbol === symbol ? positionPrice : ""}
              onChange={(e) => handlePositionPrice(e)}
            />*/}

            {/* Tick mark + SELL button */}
            {selectedSymbol === symbol && (
              <div className="flex items-center gap-2">
                {/*<span className="text-sm font-bold">✓</span> */}
                <button
                  className={`mx-2 px-1 py-1 text-sm rounded font-semibold ${
                    positionQty >= 75 && positionPrice >= 0
                      ? "bg-brandgreen text-white hover:bg-red-600"
                      : "bg-brandgreenlight text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!(positionQty >= 75 && positionPrice >= 0)}
                  onClick={() => dispatchSellSelected()}
                >
                  Sell
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cancel button at bottom */}
          <div className="mt-2 flex justify-end">
            <button
              className="px-2 py-2 text-sm font-semibold rounded bg-gray-300 hover:bg-gray-400"
              onClick={() => setShowSymbolModal(false)} // closes dialog
            >
              Cancel
            </button>
          </div>
       </div>
       </div>
   )}

     
   </>
    );




}
export default SellPlus2Order;
