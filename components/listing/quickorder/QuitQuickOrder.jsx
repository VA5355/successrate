// SellPlus2Order.jsx
import React, { useEffect, useState, useImperativeHandle, forwardRef , useRef  } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "../positionGrid/placeBuyOrder.actions";
 import { placeCancelOrder , placeQuickCancelOrder  } from "../positionGrid/cancelOrder.actions";
// import { openModal } from '@/redux/slices/modalGenSlice';
//import ModalManager from '../../../app/error/ModalManger';
import { useModal } from '@/providers/ModalProvider';
import {useDispatch, useSelector} from 'react-redux';
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Minus, Plus } from "lucide-react";
import {  Clock, Zap, Shield, Info } from 'lucide-react';
import './buttonQuick.css'; 
import './QuitQuickOrder.css'; 


const QuitQuickOrder = forwardRef(({   isMobile , sellPlusSymbol , cancelOrder ,cancelledIn ,  showModalDialog , symAvgPrice, symbolLTPin, boughtQty ,  qtySold  , setButtonSell , handleCancel} , ref) => {
  const dispatch = useDispatch();
   const buttonRef = useRef(null);
  const hasMounted = useRef(true);
 const [positionQty  ,setPositionQty ] = useState(() => boughtQty ) ; //Number(tradeSet.qty);
  const [positionPrice, setPositionPrice ]= useState(symAvgPrice) ;  // Number(tradeSet.price);
  const [symbolLTP, setSymbolLTP ]= useState(symbolLTPin) ;  // Number(tradeSet.price);
  const [positionSymbol, setPositionSymbol ]= useState(sellPlusSymbol) ;  // Number(tradeSet.price);
   const [mobileView, setMobileView ]= useState(isMobile) ;  // boolean;
  const [showSymbolModal, setShowSymbolModal] = useState(showModalDialog);
  
  const [cancelOrderId, setCancelOrderId] = useState(cancelOrder);
  const [cancelled, setCancelled] = useState(cancelledIn);

   const [selectedSymbol, setSelectedSymbol] = useState(null);
 const [ symbolArray,setSymbolArray ] = useState([]);
   const isLoading = useSelector((state) => state.loader.isLoading);
      const { showFramerModal, hideModal } = useModal();
 
  const lotSize = 65;
 
  // New Fields
  const [orderType, setOrderType] = useState('LIMIT'); // Limit or Market
  const [productMode, setProductMode] = useState('MARGIN'); // Margin or CNC
  const [isScheduled, setIsScheduled] = useState(false);
   // Initialize sell button  visibility. true means visible initially.
  const [isVisible, setIsVisible] = useState((setButtonSell) =>  setButtonSell ? setButtonSell : false );
  // const boughtQty = 100;
 // const qtySold = 20;

  // Function to toggle the state value
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
   // 2. Expose a custom function to the parent
  useImperativeHandle(ref, () => ({
    triggerClick: () => {
      console.log("Child button logic triggered!");
      buttonRef.current.click(); // Manually click the DOM button
    }
  }));



   useEffect (() => {
    if (!hasMounted.current) {
        hasMounted.current = false;
          console.log("Quit Quick  Order FIRST VISIT ");
                 // setIsPlaceStreaming(false);
        return; // skip on mount
    }
    
    setShowSymbolModal((old) => old = !old);
       // setTimeout( () => { setIsVisible(false); } , 1200)

     console.log("Quit Quick  Order  2 RESET ");
    // setIsPlaceStreaming((prev) => !prev);

 } , [cancelOrder]);

   useEffect (() => {
    if (!hasMounted.current) {
        hasMounted.current = false;
          console.log("quit Quick  Order FIRST VISIT ");
                 // setIsPlaceStreaming(false);
        return; // skip on mount
    }
    
    
       // setTimeout( () => { setIsVisible(false); } , 1200)

     console.log("Quit Quick  Order  2 RESET ");
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


   if(selectedSymbol && (symbolArray.length > 0) && positionPrice > 0 && positionQty > 0  && orderType !==undefined && productMode !==undefined) {  
     // const qtyNum = Number(tradeSet.qty);
    // const priceNum = Number(tradeSet.price);
    /*dispatch(
      openModal({
        modalType: 'SAMPLE_MODAL',
        modalProps: {
          title: 'Process',
          message: 'Processing ....',
        },
      })
    )*/
     

        showFramerModal({ 
               status: 'loading', 
              message: `Initiating sell order for ${positionQty} ${selectedSymbol}...` 
            });


       StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol, orderType:productMode , scheduled:isScheduled}));
       dispatch(placeSellOrder({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol, orderType:productMode , scheduled:isScheduled, showFramerModal, hideModal }));
            
            
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
  //const finalValue = Math.round(value * 2) / 2;

  setPositionPrice(value);
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
    <button   ref={buttonRef}  id="SELLPLUS2ORDERBUTTONID"  onClick={() => {  setSellOrder(); }} 
     className={`bg-brandgreen text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600 active:scale-95 transition ${
          isVisible ? 'visible' : 'hidden'
        }`}
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
        {showSymbolModal   && (
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowSymbolModal(false)}
          >
            <motion.div
              variants={sheet}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => { e.stopPropagation(); setSelectedSymbol(positionSymbol)  } }
              className="bg-white w-full md:w-[400px] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Cancel Order</h2>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold"> Order Ticket</p>
                </div>
                <button 
                  onClick={() => {  setShowSymbolModal(false);  setCancelled(true); setIsVisible(false);  setCancelled(old => { 
                                StorageUtils._save(CommonConstants.cancelOrderDialogClosed, true);   return true;}); } }
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[85vh] overflow-y-auto">
                
                {/* Symbol Selection - Horizontal Scroll 
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Select Instrument</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {symbolArray.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all whitespace-nowrap
                          ${selectedSymbol === symbol 
                            ? "border-red-500 bg-red-50 text-red-600" 
                            : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>*/}

                {/* Toggle Group: Market/Limit & Product Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Order Type</label>
                   {/*  <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['Market', 'Limit'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setOrderType(t)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${orderType === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div> */}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">   {positionSymbol}</label>
                  
                  </div>
                {/*<div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Product</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['MARGIN', 'CNC'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setProductMode(p)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${productMode === p ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div> */}  
                </div>

                {/* Quantity Slider */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Zap size={14} className="text-orange-400"/> Quantity
                    </label>
                    <span className="text-sm font-mono  font-bold text-gray-800">{positionQty}</span>
                  </div>
                  {/*<input
                    type="range"
                    min="0"
                    step={lotSize}
                    max={boughtQty }
                    value={positionQty}
                    onChange={(e) => setPositionQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg mobile-margin-qty appearance-none cursor-pointer accent-red-500"
                  />*/}
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>0</span>
                    <span>Max: {boughtQty }</span>
                  </div>
                </div>

                {/* Price Slider - Disabled if Market */}
                <div className={`space-y-3 p-4 rounded-xl border transition-all ${orderType === 'Market' ? 'opacity-40 bg-gray-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Shield size={14} className="text-blue-400"/> Price
                    </label>
                    <span className="text-sm font-mono  font-bold text-gray-800">₹ {orderType === 'Market' ? '---' : positionPrice}</span>
                  </div>
                  {/* <input
                    type="range"
                    disabled={orderType === 'Market'}
                    min="0"
                    step="0.05"
                    max={1000}
                    value={positionPrice}
                    onChange={(e) => setPositionPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 mobile-margin-price rounded-lg appearance-none cursor-pointer accent-red-500"
                  /> */}
                </div>

                {/* Scheduled Checkbox / Toggle 
                <div 
                  onClick={() => setIsScheduled(!isScheduled)}
                  className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer transition-colors hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isScheduled ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Schedule Order</p>
                      <p className="text-[10px] text-blue-600 font-medium">Execute at market open</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isScheduled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isScheduled ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>*/}

                {/* Summary Info 
                <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p>Approx. transaction value will be <span className="font-bold text-gray-700">₹ {(positionQty * positionPrice).toLocaleString()}</span>. Charges are applicable as per your plan.</p>
                </div>*/}

                {/* Final Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowSymbolModal(false);  setIsVisible(false); setCancelled(old => { 
                                StorageUtils._save(CommonConstants.cancelOrderDialogClosed, true);   return true;}); } }
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                   Keep Order
                  </button>
                  <button     onClick={ async () =>  {   setCancelled(old => { 
                                StorageUtils._save(CommonConstants.cancelOrderDialogClosed, true);   return true;});  /*  await dispatch(placeQuickCancelOrder(cancelOrderId));  setShowSymbolModal(false);*/ 
                                handleCancel(cancelOrderId);  setShowSymbolModal(false); } }
                    disabled={positionQty <= 0}
                    className={`flex-[2] py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95
                      ${positionQty > 0 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  >
                    <CheckCircle size={18} />
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
     // <ModalManager/>
   </>
    );




});
// Add this line to resolve the ESLint error
QuitQuickOrder.displayName = 'QuitQuickOrder';

export default QuitQuickOrder;
