import React, { useState,  useRef , useEffect ,useMemo} from "react";
import {useDispatch, useSelector} from 'react-redux';
import { ToggleLeft, Activity } from 'lucide-react';
import { Loader2 } from 'lucide-react';
//import { motion, AnimatePresence } from 'framer-motion';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
import { orderBookData } from "../positionGrid/orderBook.actions";
import { startEventSource } from "../positionGrid/orderFeed.actions";
import { FYERSAPINSECSV ,FYERSAPIMARKETFEEDRENDER, FYERSAPI, FYERSAPIORDERSRENDER,  FYERSAPITICKERACCESTOKEN,   FYERSAPITICKERURL , FYERSAPITICKERURLCLOSE} from '@/libs/client';
import { placeCancelOrder , placeQuickCancelOrder ,updateTickerStatusFromCache ,stopSensexTickerData } from "../positionGrid/cancelOrder.actions";
import { updateOrderBook } from "@/redux/slices/tickerSlice";
 import   useIsMobile   from "../tradeGrid/useIsMobile";
 import './quickOrderBookstyles.css'; // ✅ No 'quickOrderBookstyles.'
 import QuitQuickOrder from './QuitQuickOrder';
 //import { useModal } from '@/providers/ModalProvider';

import { motion, AnimatePresence  , useMotionValue, useTransform } from 'framer-motion';
import { XCircle, Edit3 } from "lucide-react";
import { 
 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  ChevronUp, 
  ChevronDown, 
 
  Settings2, 
 
 
  ArrowRightLeft
} from 'lucide-react';

import { BarChart2, Zap, Layout } from 'lucide-react';
const SWIPE_CLOSE = 80;   // swipe right
const SWIPE_MODIFY = -80; // swipe left
function useOrientation() {
  const [isLandscape, setIsLandscape] = React.useState(
    window.matchMedia("(orientation: landscape)").matches
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const handler = (e) => setIsLandscape(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isLandscape;
}
const SwipeableRowDesk = ({ row, idx, getPnlClass, getPnlBg , setslideIdx , onClose,
  onModify,
  isMobile}) => {
  const x = useMotionValue(0);
  let setSwipeCloseValue  = (swipeValueIn) => {  let swipeValue = 0;
            swipeValue =   swipeValueIn ; //swipeValue < swipeValueIn ?  swipeValueIn: swipeValue;
        return   swipeValue;
  }; 

  // Color transformation based on swipe direction (Left = Red/Close, Right = Blue/Modify)
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["#ef4444", "#ffffff", "#3b82f6"]
  );

  return (
    <div className="relative overflow-hidden group bg-gray-100">
      
      {/* Background Action Underlays (Visible during swipe) */}
      <div className="absolute inset-0 flex justify-between   px-1 text-white font-bold">
        <div className="flex items-center gap-1">
          <Settings2 size={20} />
          <span>MODIFY</span>
        </div>
        <div className="flex items-center gap-1">
          <span>CLOSE</span>
          <XCircle size={20} />
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -20, right: 20 }}
        style={{ x }}
        whileTap={{ cursor: 'grabbing' }}
         onDragEnd={(_, info) => {
           setslideIdx(info.offset.x);
          if (info.offset.x > SWIPE_CLOSE) {
            onClose();
           
          } else if (info.offset.x < SWIPE_MODIFY) {
            onModify();
          }
        }}
        className="relative z-10 bg-white"
      >
        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-6  px-1 py-1 hover:bg-blue-50/40 transition-colors">
         
          <div className="col-span-2 font-bold text-blue-600 cursor-pointer hover:underline">{row.symbol}</div>
          <div className="col-span-1">
            <span className="  py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600">{row.productType}</span>
          </div>
          <div className="  text-left font-mono text-sm">{row["qty"]} </div>
          <div className="  text-left font-mono text-sm">{row["limitPrice"]?.toFixed(2)}</div>
          <div className="  text-left font-mono text-sm font-semibold">{row["lp"]?.toFixed(2)}</div>
         
          {/*<div className="col-span-1 flex justify-end gap-2">
            <button className="p-1 hover:text-blue-600 text-gray-400"><Settings2 size={16}/></button>
            <button className="p-1 hover:text-red-600 text-gray-400"><XCircle size={16}/></button>
          </div>*/}
        </div>

        {/* Mobile View (Card) */}
        <div className="md:hidden p-4 border-l-4 border-blue-500 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-gray-800 tracking-tight">{row.symbol}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-gray-500">{row.productType}</span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                Qty: <span className="text-gray-700 font-bold">{row.netQty}</span> 
                <span className="mx-1">•</span> 
                Avg: <span className="text-gray-700 font-bold">₹{row.avgPrice}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">LTP</div>
              <div className="text-sm font-black text-gray-900 font-mono italic">₹{row.ltp?.toFixed(2)}</div>
            </div>
          </div>

        
          
          <div className="mt-2 flex justify-center md:hidden">
            <div className="w-8 h-1 bg-gray-200 rounded-full" /> {/* Drag handle indicator */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function QuickOrderTable({ sortedSocketData , sortedDataP,isOrderPoll,
    
    parseStoreUtilsOrder,fetchOrdersBookDataCacheKey,setOrderGlobalPoll ,setUserLogged,setParsedDataP,userLogged,
    handleSortP, getSortIndicatorP, handleCancelP }) {


      const isLandscape = useOrientation();

  const [activeTab, setActiveTab] = useState ("normal");
     const isMobile = useIsMobile();

     const isMobileLandscape = isMobile && isLandscape;
       const [cancelOrder, setCancelOrder] = useState(false);
              const [sellPlusSymbol, setSellPlusSymbol] = useState(null);
                 const [netBought, setNetBought] = useState(0);
                 const [swipeQty, setSwipeQty] = useState(0);
                 const [symbolAvgPrice, setSymbolAvgPrice] = useState(0);
                 //setSymbolLTP
                 const [symbolLTP, setSymbolLTP] = useState(0);
                  const [positionQty  ,setPositionQty ] = useState(() => netBought ) ; 
                   const childRef = useRef(null);
                    // const { showFramerModal, hideModal } = useModal();
     const [parsedData, setParsedData] = useState(() =>{ 
          // JSON.parse(StorageUtils._retrieve(CommonConstants.quickOrderBookDataCacheKey).data); 
            let g = JSON.parse(StorageUtils._retrieve(CommonConstants.quickOrderBookDataCacheKey).data);
            let orderBookCache =   JSON.parse(StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey).data);
                       if(g !== null && g !== undefined ){
                          console.log("parsed Data initialised "+JSON.stringify(g));
                          return g;
                       }
                       else if (orderBookCache !== null && orderBookCache !== undefined ){
                        return  orderBookCache;
                       }
                       else {
                         console.log("parsed Data const initialised "+JSON.stringify(g));
                        return CommonConstants.sampleOrderBookDataVersionNonString1;
                       }
            
                 
        });
          const [sortColumn, setSortColumn] = useState(null); // e.g., "symbol"
          const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
     const [isOrderPolling, setOrderPolling] = useState(isOrderPoll);
     const [slide, setSlide] = useState(0);
       const [orderBookPollInt, setOrderGlobalPollInt] = useState(setOrderGlobalPoll);
         let  quickOrderBookFeed   = useSelector((state ) => state.ticker.orderBook);
       const[ computedSocketData , setComputedSocketData] = useState(
         () => {
           // console.log("checking pending orders actual with status 6 : fetched by orderBook.action "+JSON.stringify(pendingCancelableOrders));
             let pOrders =    StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
            if(pOrders !==null && pOrders !==undefined &&  pOrders['data'] !== ''  && pOrders['data'] !== null && pOrders['data'] !==undefined){      
                 return pOrders['data'] ;
       // setComputedSocketData(ordersFeed);
          }
          else {
              console.log(`pending orders ${CommonConstants.orderBookOrderDataCacheKey} is not set `);
                return [];
          }
         }
       );
       const[ cancelOrderDialogClosed , setCancelOrderDialogClosed] = useState(
         () => {
           // console.log("checking pending orders actual with status 6 : fetched by orderBook.action "+JSON.stringify(pendingCancelableOrders));
             let pOrders =    StorageUtils._retrieve(CommonConstants.cancelOrderDialogClosed)
            if(pOrders !==null && pOrders !==undefined &&  pOrders['data'] !== ''  && pOrders['data'] !== null && pOrders['data'] !==undefined){      
                 return pOrders['data'] ;
       // setComputedSocketData(ordersFeed);
          }
          else {
              console.log(`cancel order dialog  ${CommonConstants.cancelOrderDialogClosed} is not set , default true `);
                return true;
          }
         }
       );
      const [tickerData, setTickerData] = useState(null);
   const eventSourceRef = useRef(null);
   const [userAuthCode , setUserAuthCode]= useState('');
  const [isConnected, setIsConnected] = useState(false);
   const [filteredData , setFilteredData] =useState( ()=> { 
    activeTab === "normal"
      ? parsedData.filter((row) => row.status === "open")
      : parsedData.filter((row) => row.status === "completed") });
 const [filteredSocketData , setFilteredSocketData] =useState( ()=> {
    activeTab === "streaming"
      ? parsedData.filter((row) => row.status === "open")
      : parsedData.filter((row) => row.status === "completed")});
 let dispatch = useDispatch();
 let pollOrderBook = false;
  function parseDate(str) {
    // e.g., "14-Jul-2025 09:48:22"
    const [datePart, timePart] = str.split(" ");
    const [day, mon, year] = datePart.split("-");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const [hour, min, sec] = timePart.split(":").map(Number);
    return new Date(year, monthMap[mon], day, hour, min, sec);
  }
 const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
 const streamOrderLTPTimer = () => { 
        
                //    all the orders that have been fetcehd from orderBook.action in quickOrderFeed.action , and streamed wuth 
                // events from the Order General Socket are also being catched using updateOrderBook tickerSlice.ts in quickOrderFeed
                //  let  quickOrderBookFeed   = useSelector((state ) => state.ticker.orderBook);
           let g =  quickOrderBookFeed;  //StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
           let indKey = g; 
           if ( indKey !== null && indKey  !==undefined ) { 
               let indData = indKey ;
               //let actualData = indData.data;
               console.log(`  ${JSON.stringify(indKey)}  typeof state.ticker.orderBook ${JSON.stringify(typeof indKey )} `);
             //  console.log(`  ${JSON.stringify(actualData)}  typeof CommonConstants.marketFeedDataCacheKey.data ${JSON.stringify(typeof actualData )} `);
               console.log(` Array.isArray(state.ticker.orderBook) ::  ${JSON.stringify(Array.isArray(indData))}  typeof state.ticker.orderBook ${JSON.stringify(typeof indData )} `);

           if( indData !== ''  && indData !== null && indData !==undefined){ 
         //  if( actualData !== ''  && actualData !== null && actualData !==undefined){ 
              /*
               {
                      "s":"ok",                           state.ticker.orderBook  has to be a array of following type of orders 
                      "orders":{                              this is a single order response from General Socket 
                          "clientId":"XV20986",
                          "id":"23080400089344",
                          "exchOrdId":"1100000009596016",
                          "qty":1,
                          "filledQty":1,
                          "limitPrice":7.95,
                          "type":2,
                          "fyToken":"101000000014366",
                          "exchange":10,
                          "segment":10,
                          "symbol":"NSE:IDEA-EQ",
                          "instrument":0,
                          "offlineOrder":false,
                          "orderDateTime":"04-Aug-2023 10:12:58",
                          "orderValidity":"DAY",
                          "productType":"INTRADAY",
                          "side":-1,
                          "status":90,
                          "source":"W",
                          "ex_sym":"IDEA",
                          "description":"VODAFONE IDEA LIMITED",
                          "orderNumStatus":"23080400089344:2"
                      }
                    }
              */
                  let indexWebSocketFeeds = indData;
                  if(Array.isArray(indexWebSocketFeeds)){   

                    const result = indexWebSocketFeeds.filter(item => item.status ==6);  // PENDING ORDERS 

                    result.forEach( (webSockOrders) => {
                         // CHECK YOU HAVE the INDX:: localstore with same symbol as in the order with the limitPrice and LTP  
                         ;let prefix =  webSockOrders.symbol 
                        let ticker =    StorageUtils._retrieve("INDX::" +prefix );
                      if ( ticker.isValid && ticker.data !== null && ticker.data !==undefined ) { 
                        let tickerData = ticker.data;
                          let actualTicker = tickerData.data;

                       if(  tickerData !==null &&  tickerData !==undefined  ){
                        let symbC =   prefix;    //webSockOrders.split(":")[1]; //.map(item => item.split(":")[1]);
                         const streamLTPDiv = document.getElementById("quickOrdersStreamedLTP_"+symbC);
                          if(streamLTPDiv !==null && streamLTPDiv !== undefined ){
                               let ltp = ticker['data'].ltp;
                              streamLTPDiv.textContent = ltp;
                              console.log(`quickOrdersStreamedLTP_${symbC} updated with ${ltp}`);
                          }
                          else {
                           console.log(` quickOrdersStreamedLTP_${symbC} :::: UNDEFINED `);
                         }
                        }
                        else {
                           console.log(` INDX::${+prefix} :::: UNDEFINED `);
                        }
                    }
                  });

                  } 
                else {
                    console.log(` state.ticker.orderBook not a array `);
                } 
           //   }
              } else {
                console.log(`  state.ticker.orderBook   ::: not found  `);
             }

            }
          else {
               // console.log(`unable to read :::  state.ticker.orderBook `);
          }

         
    };
  // Helper for Profit/Loss colors
  const getPnlClass = (val) => val >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold";
  const setSlideValue  = (val) => val >= SWIPE_CLOSE ? setSlide(1) :  ( val <= SWIPE_MODIFY ? setSlide(2 ): setSlide(0));
  const getPnlBg = (val) => val >= 0 ? "bg-emerald-50" : "bg-rose-50";

const handleDeskClosePosition = (  row,e) => {
  console.log("Close position:", row.symbol);
  let symbol = row.symbol;
  let netBought = row.qty;
  let costPrice = row.avgPrice;
      setCancelOrder((oldID ) =>{
          const randomInt = Math.floor(Math.random() * 1000000);
          return `${row.id}_${randomInt}`;
      }); // try generating a new _random int on every swipe this may cause render and show the showModal 
      setSellPlusSymbol(symbol);
        setNetBought(netBought);
        setSwipeQty(netBought);
        setSymbolAvgPrice(row["limitPrice"]?.toFixed(2));
        setSymbolLTP(row["lp"]?.toFixed(2))
        setPositionQty(netBought)
        
      if(slide !==undefined  ){
         if(slide > SWIPE_CLOSE){
           // show the cancel dialog 
            StorageUtils._save(CommonConstants.cancelOrderDialogClosed, false);
             setCancelOrderDialogClosed(false);
         }
      }
   // 3. Call the exposed function from the parent
    if (childRef.current) {
     // childRef.current.triggerClick();
    }      
  // handleSymbolClick(e, row["symbol"], row["avgPrice"], row["netQty"])
  // fire square-off / close API
};

const handleDeskModifyPosition = (  row,e) => {
  console.log("Modify position:", row.symbol);
  // open modify / add order panel
};



useEffect(() => {    // BAASED ON the POLL ORDER's BUTTON in PARENT POSITION GRID (TOGGLED to TRUE ) this EFFECT wILL TRIGGER 

  const res = StorageUtils._retrieve(CommonConstants.fyersToken);

  if (res.isValid && res.data !== null && res.data !== undefined ) {   // CHECK FOR                   ----> USER LOGGED IN 
      
      let auth_code = res.data['auth_code'];
      if (auth_code&& auth_code !== null && auth_code !== undefined) {
          console.log("User is Authorized ");
          setUserLogged (true);
      }
  }  
if((  isOrderPoll ) && userLogged ){ 
  //                                                                   POLLING ======= 11 SECOND ============ INTERVAL 
  const interval = setInterval(() => {
   // const stored = JSON.stringify(CommonConstants.sampleOrderBookDataVersionNonString1); for TESTING 
    const stored = StorageUtils._retrieve(CommonConstants.quickOrderBookDataCacheKey)
     if (typeof stored === "string") {
      try {   const parsed = JSON.parse(stored);
              const data =  parsed;     // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
            if (data !==null && data !== undefined){  
             setParsedData(data);
              console.log("Order Book fetching order from quickOrderBookDataCacheKey JSON sTRING : "+JSON.stringify(data ));
            }else {
              console.log("Order Book fetched from cache no  Pending Orders  " );
            }
      } catch (err) {
             setParsedData([]);   // No ORDERS   SHOW SINCE CACHE DATA IS NOT OKAY
            console.warn("Invalid JSON in storage:", err);
      }
    }
    else if ( typeof stored === "object"  ){
       try {  // const parsed = JSON.parse(stored);    NO PARSING 
              let quickOrderBook =  stored;     // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
              let data = quickOrderBook.data;
              let actualOrderBook = undefined;
            if (data !==null && data !== undefined ){  
              if(typeof data === "string"){ 
                let data1 = JSON.parse(data);
                 console.log("quickOrderBookDataCacheKey.data is string ");
                actualOrderBook = data1;
              }else if( typeof data === "object"){
                console.log("quickOrderBookDataCacheKey.data is object ");
                if(Array.isArray(data) && data.length > 0){
                   console.log("quickOrderBookDataCacheKey.data is array ");
                   let data2 = data[0];
                  if(typeof data2 === "string"){ 
                     console.log("quickOrderBookDataCacheKey.data[0] is a string need to parse ");
                     actualOrderBook = JSON.parse(data2);
                  }
                  if(typeof data2 === "object"){ 
                     console.log("quickOrderBookDataCacheKey.data[0] is a object ");
                     actualOrderBook = data2;
                  }
                }
              }
              if(actualOrderBook !==null && actualOrderBook !== undefined ){ 
               let { qty , netQty}= actualOrderBook;
                let lp = actualOrderBook.lp !==undefined ? actualOrderBook.lp : 0;
                let limitPrice =  actualOrderBook.limitPrice !==undefined ? actualOrderBook.limitPrice : 0;
                if(lp ==0 && limitPrice ==0 ){
                    console.log("Order Book  quickOrderBookDataCacheKey.data structure not match order book order" );
                    const storedOrderBook = StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
                    console.log("Order Book  orderBookOrderDataCacheKey  being fetched " );
                   let actualOrderBook = parseStoreUtilsOrder(storedOrderBook) ;
                   if(actualOrderBook  !==null && actualOrderBook !== undefined ) { 
                     setParsedData(actualOrderBook);
                      setFilteredData(actualOrderBook);
                       setComputedSocketData(actualOrderBook);
                     //filteredData = actualOrderBook;
                      if (Array.isArray(actualOrderBook) && actualOrderBook.length > 0){ 
                         console.log("Order Book before  "+actualOrderBook.length  );
                         if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                         // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                           actualOrderBook = parseStoreUtilsOrder(storedOrderBook) ;
                            //  filteredData = actualOrderBook;
                            alsoUpdateComputedSocketData(actualOrderBook);
                                setFilteredData(actualOrderBook);
                            console.log(`after parseStoreUtilsOrder filteredData::: ${JSON.stringify(filteredData)} `); 
                            }

                       console.log("Order Book  order after re-fresh "+actualOrderBook.length );
                      }else if (Array.isArray(actualOrderBook) && actualOrderBook.length == 0 ){
                          console.log("Order Book orderBookOrderDataCacheKey : shows [] --> refetching.. ");
                          if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                         // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();

                        }
                      }
                   }
                   else {
                     console.log("Order Book fetching order from orderBookOrderDataCacheKey : not worked ");
                       if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                          // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
                   }
                }
                
                  
              }
              else { console.log("Order Book fetching order from quickOrderBookDataCacheKey.data could not interpret : ");
                     if(userLogged){
                       // const   data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                        dispatch(orderBookData(''));
                          // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
              }
            }else {
              console.log("Order Book fetched from cache no  Pending Orders  " );
                  if(userLogged){
                      //  const data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                      dispatch(orderBookData(''));
                       // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
            }
      } catch (err) {
             setParsedData([]);   // No ORDERS   SHOW SINCE CACHE DATA IS NOT OKAY
                //filteredData = [];
                setFilteredData([]);
              console.log(`error typeof stored === "object"  quickOrderBookDataCacheKey is OBJECT  ${JSON.stringify(filteredData)} `); 
            console.warn("Invalid JSON in storage:", err);
      }
    }
    else {  console.warn("No Quick Book Cache present:" );
            if(userLogged){
              const data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
             /* if (data !==null && data !== undefined){  
               setParsedData(data);
               console.log("Order Book fetched Pending order  "+JSON.stringify(data ));
              }
              else {
               console.log("Order Book fetched not contain Pending Orders  " );
              }*/
            }
            else {console.warn("User not logged in --> no fetch the orders :" ); }
    }
  }, 23500); // poll every 2 sec (or whatever is suitable)                POLLING ======= 11 SECOND ============ INTERVAL                
  // store the interval for refrence and close the poll 
  setOrderGlobalPollInt((prev) => prev = interval);        // GLOBAL POLL AFTER EVERY 11 SECONDS ...  
  //   
 }
 else { 
      console.log("No poll Order Book  requested   " );
 }
     // get ticker prices for orders streamed and captiure in the to update 
     setInterval( () => {   streamOrderLTPTimer(); },
        
        4000 );


  //return () => clearInterval(interval);
}, [ isOrderPoll,filteredData]); 

useEffect(() => {    // BAASED ON the POLL ORDER's BUTTON in PARENT POSITION GRID (TOGGLED to TRUE ) this EFFECT wILL TRIGGER 

  const res = StorageUtils._retrieve(CommonConstants.fyersToken);
  if (res.isValid && res.data !== null  && res.data !== undefined) {   // CHECK FOR                   ----> USER LOGGED IN 
      
      let auth_code = res.data['auth_code'];
      if (auth_code&& auth_code !== null && auth_code !== undefined) {
          console.log("User is Authorized ");
          setUserLogged (true);
      }
  }  
if((  isOrderPolling ) && userLogged ){ 
  //                                                                   POLLING ======= 11 SECOND ============ INTERVAL 
  const interval = setInterval(() => {
   // const stored = JSON.stringify(CommonConstants.sampleOrderBookDataVersionNonString1); for TESTING 
    const stored = StorageUtils._retrieve(CommonConstants.quickOrderBookDataCacheKey)
     if (typeof stored === "string") {
      try {   const parsed = JSON.parse(stored);
              const data =  parsed;     // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
            if (data !==null && data !== undefined){  
             setParsedData(data);
              console.log("Order Book fetching order from quickOrderBookDataCacheKey JSON sTRING : "+JSON.stringify(data ));
            }else {
              console.log("Order Book fetched from cache no  Pending Orders  " );
            }
      } catch (err) {
             setParsedData([]);   // No ORDERS   SHOW SINCE CACHE DATA IS NOT OKAY
            console.warn("Invalid JSON in storage:", err);
      }
    }
    else if ( typeof stored === "object"  ){
       try {  // const parsed = JSON.parse(stored);    NO PARSING 
              let quickOrderBook =  stored;     // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
              let data = quickOrderBook.data;
              let actualOrderBook = undefined;
            if (data !==null && data !== undefined ){  
              if(typeof data === "string"){ 
                let data1 = JSON.parse(data);
                 console.log("quickOrderBookDataCacheKey.data is string ");
                actualOrderBook = data1;
              }else if( typeof data === "object"){
                console.log("quickOrderBookDataCacheKey.data is object ");
                if(Array.isArray(data) && data.length > 0){
                   console.log("quickOrderBookDataCacheKey.data is array ");
                   let data2 = data[0];
                  if(typeof data2 === "string"){ 
                     console.log("quickOrderBookDataCacheKey.data[0] is a string need to parse ");
                     actualOrderBook = JSON.parse(data2);
                  }
                  if(typeof data2 === "object"){ 
                     console.log("quickOrderBookDataCacheKey.data[0] is a object ");
                     actualOrderBook = data2;
                  }
                }
              }
              if(actualOrderBook !==null && actualOrderBook !== undefined ){ 
               let { qty , netQty}= actualOrderBook;
                let lp = actualOrderBook.lp !==undefined ? actualOrderBook.lp : 0;
                let limitPrice =  actualOrderBook.limitPrice !==undefined ? actualOrderBook.limitPrice : 0;
                if(lp ==0 && limitPrice ==0 ){
                    console.log("Order Book  quickOrderBookDataCacheKey.data structure not match order book order" );
                    const storedOrderBook = StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
                    console.log("Order Book  orderBookOrderDataCacheKey  being fetched " );
                   let actualOrderBook = parseStoreUtilsOrder(storedOrderBook) ;
                   if(actualOrderBook  !==null && actualOrderBook !== undefined ) { 
                     setParsedData(actualOrderBook);
                     setFilteredSocketData(actualOrderBook);
                      if (Array.isArray(actualOrderBook) && actualOrderBook.length > 0){ 
                         console.log("Order Book before  "+actualOrderBook.length  );
                         if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                         // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                           actualOrderBook = parseStoreUtilsOrder(storedOrderBook) ;
                           setFilteredSocketData(actualOrderBook);
                            }

                       console.log("Order Book  order after re-fresh "+actualOrderBook.length );
                      }else if (Array.isArray(actualOrderBook) && actualOrderBook.length == 0 ){
                          console.log("Order Book orderBookOrderDataCacheKey : shows [] --> refetching.. ");
                          if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                         // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                          setComputedSocketData([]);

                        }
                      }
                   }
                   else {
                     console.log("Order Book fetching order from orderBookOrderDataCacheKey : not worked ");
                       if(userLogged){
                        // fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                          dispatch(orderBookData(''));
                          // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
                   }
                }
                
                  
              }
              else { console.log("Order Book fetching order from quickOrderBookDataCacheKey.data could not interpret : ");
                     if(userLogged){
                       // const   data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                        dispatch(orderBookData(''));
                          // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
              }
            }else {
              console.log("Order Book fetched from cache no  Pending Orders  " );
                  if(userLogged){
                      //  const data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
                      dispatch(orderBookData(''));
                       // orderBookOrderDataCacheKeyPoll();
                          fetchOrdersBookDataCacheKey();
                     }
            }
      } catch (err) {
             setParsedData([]);   // No ORDERS   SHOW SINCE CACHE DATA IS NOT OKAY
             setFilteredSocketData([]);
            console.warn("Invalid JSON in storage:", err);
      }
    }
    else {  console.warn("No Quick Book Cache present:" );
            if(userLogged){
              const data =  fetchFreshOrdersToCancel(); // otherObjOrderBookData;
             /* if (data !==null && data !== undefined){  
               setParsedData(data);
               console.log("Order Book fetched Pending order  "+JSON.stringify(data ));
              }
              else {
               console.log("Order Book fetched not contain Pending Orders  " );
              }*/
            }
            else {console.warn("User not logged in --> no fetch the orders :" ); }
    }
  }, 8500); // poll every 2 sec (or whatever is suitable)                POLLING ======= 11 SECOND ============ INTERVAL                
  // store the interval for refrence and close the poll 
  setOrderGlobalPollInt((prev) => prev = interval);        // GLOBAL POLL AFTER EVERY 11 SECONDS ...    
 }
 else { 
      console.log("No poll Order Book  requested   " );
 }

  //return () => clearInterval(interval);
}, [isOrderPolling]);   //  for time being 
 
// MOST probably this is causing the Orders fetched from the normal order poll orders button 
// they are being removed after the startStreaming dispatch (startEventSrojuce ) is called 
/*
 useEffect(() => {
  if (sortedSocketData) {
    setComputedSocketData(
      Array.isArray(sortedSocketData) ? sortedSocketData : [sortedSocketData]
    );
  }
}, [sortedSocketData]);*/

// CALL the order feed action 
 useEffect(() => {
    dispatch(startEventSource(false , [],callBackOrderFeedAction));
}, []);

 useEffect(() => {
   // dispatch(startEventSource(false , [],callBackOrderFeedAction));
   console.log("Cancel Order or SwipeDeskRow triggered ");
}, [cancelOrder]);

useEffect(() => {
   if(parsedData !==undefined && parsedData !== null && Array.isArray(parsedData) && parsedData.length > 0){
     alsoUpdateComputedSocketData(parsedData);
       StorageUtils._save(CommonConstants.cancelOrderDialogClosed, false);

   }
   if(sortedDataP  !==undefined && sortedDataP !== null && Array.isArray(sortedDataP) && sortedDataP.length > 0){
     alsoUpdateComputedSocketData(sortedDataP);
       StorageUtils._save(CommonConstants.cancelOrderDialogClosed, false);
   }
    
}, []); 
// computedSocketData
/*useEffect(() => {
   if(parsedData !==undefined && parsedData !== null && Array.isArray(parsedData)  ){
     alsoUpdateComputedSocketData(parsedData);
   }
   if(sortedDataP  !==undefined && sortedDataP !== null && Array.isArray(sortedDataP)  ){
     alsoUpdateComputedSocketData(sortedDataP);
   }
    
}, [computedSocketData]); */


const getSortIndicator = (column) =>
    sortColumn === column ? (sortDirection === "asc" ? " ▲" : " ▼") : "";
const handleCancel = async (orderId) => {
      let orderActualtoDel =   parsedData.filter(ords => parseInt(ords.id) == parseInt(orderId));
    if(orderActualtoDel !==null && orderActualtoDel !==undefined){
      // SET the ORDER to DELETE in the StorageUtils._retrieve(CommonConstants.recentOrderPlaced);recentOrderPlaced
       // quickOrderCancellOrderPlaced:'quickOrderCancellOrderPlaced',
      // 
       let orderData= undefined;
        if(Array.isArray(orderActualtoDel) && orderActualtoDel.length > 0){
               orderData= orderActualtoDel[0];
        }
      if(orderData !==undefined && orderData !== undefined){
      StorageUtils._save(CommonConstants.quickOrderCancellOrderPlaced, orderData);
      console.log("Quick Order Book Cancel Order "+JSON.stringify(orderData))
      let selectedSymbol = orderData['description']

       /* showFramerModal({ 
               status: 'loading', 
              message: `Cancelling ${orderId} ${selectedSymbol}...` 
            });
            */
        await dispatch(placeQuickCancelOrder(orderId));
          //await dispatch(quickOrderBookData());
          fetchOrdersBookDataCacheKey()
        //   setTimeout(hideModal, 300)
          //setTimeout(() => { hideModal }, 300);
       }
       else{
         console.log("Quick Order Book single order parse failed ");
       }
    }
    else{
       console.log("Quick Order Book Cancel Order not selected  " )
    }
     
}
const handleCancelQuick = async (orderId) => {
      let orderActualtoDel =   parsedData.filter(ords => parseInt(ords.id) == parseInt(orderId));


    if(orderActualtoDel !==null && orderActualtoDel !==undefined){
      // SET the ORDER to DELETE in the StorageUtils._retrieve(CommonConstants.recentOrderPlaced);recentOrderPlaced
       // quickOrderCancellOrderPlaced:'quickOrderCancellOrderPlaced',
      // 
       let orderData= undefined;
        if(Array.isArray(orderActualtoDel) && orderActualtoDel.length > 0){
               orderData= orderActualtoDel[0];
        }
      if(orderData !==undefined && orderData !== undefined){
      StorageUtils._save(CommonConstants.quickOrderCancellOrderPlaced, orderData);
      console.log("Quick Order Book Cancel Order "+JSON.stringify(orderData))
      let selectedSymbol = orderData['description']

       /* showFramerModal({ 
               status: 'loading', 
              message: `Cancelling ${orderId} ${selectedSymbol}...` 
            });
            */
        await dispatch(placeQuickCancelOrder({ orderId} ));
          //await dispatch(quickOrderBookData());
          fetchOrdersBookDataCacheKey()
          // filter the orderid from 
          // filter the orderid from computedSocketData
          // after the refersh of normal order update the streaming tab  quick orders also 
         setTimeout( (orderId) =>  { 
            let orderDelId =  orderId;
                if(Array.isArray(parsedData ) && !parsedData.some(od => {parseInt(od.id) == parseInt(orderDelId) })) {
                      if(Array.isArray(computedSocketData) ) { 
                         setComputedSocketData( parsedData);
                      } 
                }
        
         },2000)
          //  computedSocketData
         //   const storedOrderBook1 = StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
       //   let actualOrderBook1 = parseStoreUtilsOrder(storedOrderBook1) ;
                            //  filteredData = actualOrderBook;
          //                  alsoUpdateComputedSocketData(actualOrderBook1);
        //   setTimeout(hideModal, 300)
          //setTimeout(() => { hideModal }, 300);
       }
       else{
         console.log("Quick Order Book single order parse failed ");
       }
    }
    else{
       console.log("Quick Order Book Cancel Order not selected  " )
    }
     
}

 const sortedData = useMemo(() => {
  if (!userLogged) return parsedData;
  if (!sortColumn) return parsedData;

  let dataToSort = [...parsedData];

  if (sortColumn === 'orderDateTime') {
    return dataToSort.sort((a, b) => {
      const timeA = parseDate(a[sortColumn]).getTime();
      const timeB = parseDate(b[sortColumn]).getTime();

      return sortDirection === "asc"
        ? timeA - timeB
        : timeB - timeA;
    });
  }
  dataToSort = dataToSort.filter( ord => parseInt(ord.avgPrice) !=0 &&  parseInt(ord.netQty)  !=0 &&  parseInt(ord.unrealized_profit) !=0  )

  return dataToSort.sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    const isNumeric = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB));

    if (isNumeric) {
      return sortDirection === "asc"
        ? parseFloat(valA) - parseFloat(valB)
        : parseFloat(valB) - parseFloat(valA);
    }

    return sortDirection === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });
}, [parsedData, setParsedData ,  sortColumn, sortDirection]);

 const handleOrderBookPoll = () => {
  console.log("Poll Order Book enter ");
   const res = StorageUtils._retrieve(CommonConstants.fyersToken);
  if (res.isValid && res.data !== null && res.data !== undefined) {
        let auth_code = res.data['auth_code'];
   if (auth_code&& auth_code !== null && auth_code !== undefined) {
      console.log("User is Authorized ");
    
     setOrderPolling((prev) => !prev);
      console.log("order polling "+isOrderPolling);
     // Optionally, trigger your stream start/stop logic here
    if (isOrderPolling) {
       pollOrderBook = true;
        // immediately start poll 
        // interval polling based on isOrderPolling will start later 
         dispatch(orderBookData(''));
       ///  fetchFreshOrdersToCancel();  will trigger in QuickOrder Book 
          console.log("started polling  orders ");
    } else {
         console.log("stopped polling  orders ");
          pollOrderBook = false;
      }
   }
   else {
        console.log("User not logged in ");
   } // AUTH CODE 
  }
};

 const useEventSource = (url, options = {}) => {
  const eventSourceRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (eventSourceRef.current) {
      console.warn("⚠ EventSource already running.");
      return;
    }

    console.log(" useEventSource:  Connecting SSE:", url);
    eventSourceRef.current = new EventSource(url, options);

    eventSourceRef.current.onopen = () => {
      console.log("✅ useEventSource: SSE connected");
      setIsConnected(true);
      retryCountRef.current = 0; // reset retries
    };

    eventSourceRef.current.onmessage = (event) => {
      try {
       // const data = JSON.parse(event.data);
        callBackEventSource(event.data)
        console.log("📩useEventSource: SSE message:", data);
      } catch (err) {
        console.error("❌ useEventSource: SSE parse error:", err);
      }
    };

    eventSourceRef.current.onerror = () => {
      console.error("⚠ useEventSource: SSE connection lost");
      setIsConnected(false);
      cleanup(); // close before retry
      scheduleReconnect();
    };
  };

  const cleanup = () => {
    if (eventSourceRef.current) {
      console.log("🛑useEventSource: Closing EventSource");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    const retryDelay = Math.min(30000, 1000 * 2 ** retryCountRef.current); 
    console.log(`⏳ useEventSource: Reconnecting in ${retryDelay / 1000}s`);

    retryTimeoutRef.current = setTimeout(() => {
      retryCountRef.current += 1;
      connect();
    }, retryDelay);
  };

  useEffect(() => {
    connect();

    return () => {
      console.log("👋 useEventSource: Component unmounted, cleaning SSE");
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // reconnect if URL changes

  return { isConnected };
};

    const userLoggedIn = () => {
       let acode = undefined;
            console.log("Fyers Feed user login check  ");
         const res1 = StorageUtils._retrieve(CommonConstants.fyersToken);
           if (res1.isValid && res1.data !== null &&  res1.data !== undefined) {
             let auth_code = res1.data['auth_code'];
             if (auth_code&& auth_code !== null && auth_code !== undefined) {
                 console.log("User is Authorized ");
                  console.log("User typeof "+ JSON.stringify(typeof auth_code));
                  console.log("User auth_code "+JSON.stringify(auth_code));
                  acode = auth_code;
               // setUserAuthCode(prevcode => prevcode = auth_code);
               //  setUserAuthCode(() => auth_code);
             }
           }
        return acode;
    }
const alsoUpdateComputedSocketData = (normalParsedData)=> {
   // this function is needed because this one 
   // checks for the order's placed before subscribing to the 5002 python General socket running from 
   // fyers_orders_positions_start_websocket.py in E:\n\PythonAnyWhere-old-code\fyersfeed-git
   // 
    if(normalParsedData !==null && normalParsedData !==undefined && Array.isArray(normalParsedData)){
        console.log("Quick Order Table : ORDER FEED ACTION pending orders before subscribeing to EVENT STREAM ");
       console.log(JSON.stringify(normalParsedData));
      /* causing much logs due to useEffect dependny on computedSocketData */
       if(normalParsedData.length ==0 &&   computedSocketData !==undefined && Array.isArray(computedSocketData) && computedSocketData.length ==0 ){
           setComputedSocketData([]); // let user refresh or poll the order again 
           // clear the local storage 
            StorageUtils._save(CommonConstants.orderBookOrderDataCacheKey,[]);
            //
            StorageUtils._save(CommonConstants.quickOrderCancellOrderPlaced,[]);
       } 
       if(computedSocketData !==undefined && Array.isArray(computedSocketData) && computedSocketData.length ==0 ){
         setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => !normalParsedData.some(newItem => newItem.id === existing.id) 
                        ),
                         ...normalParsedData
                        ] );
         // also dispatch it to the ticker orderBook because immediately the General Socket running will empty it 
         dispatch(updateOrderBook(normalParsedData));

       }
       else{
         setComputedSocketData(normalParsedData);
           console.log("Quick Order Table : ORDER FEED ACTION  pending orders first time installed");
       }
    }

} 
const callBackOrderFeedAction = (ordersFeed) => {
    if(ordersFeed !==null && ordersFeed !==undefined && Array.isArray(ordersFeed)){
      let pendingOrdersFeed = ordersFeed.filter(or => or.status === 6 );
       console.log("Quick Order Table : ORDER FEED ACTION pending orders ");
       console.log(JSON.stringify(pendingOrdersFeed));
      setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => !pendingOrdersFeed.some(newItem => newItem.id === existing.id) 
                        ),
                        ...pendingOrdersFeed
                        ] );
       if(ordersFeed.length > 0 && pendingOrdersFeed.length==0){
        // remove the order's that are no more pending from computed socket data 
           setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => {  ordersFeed.some(newItem => newItem.id === existing.id) &&
                                            ordersFeed.some(newItem => newItem.status !== existing.status &&  newItem.status !==6 )     } 
                        )
                        
                        ] );
       }
       // check if pending orders are fetched by orderbook.actions 
       // set it as is to the computedSocketData
         console.log("checking pending orders actual with status 6 : fetched by orderBook.action "+JSON.stringify(pendingCancelableOrders));
        let pOrders =    StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
          if(pOrders !==null && pOrders !==undefined &&  pOrders['data'] !== ''  && pOrders['data'] !== null && pOrders['data'] !==undefined){      
                  setComputedSocketData(pOrders['data']);
       // setComputedSocketData(ordersFeed);
          }
         
          console.log("Quick Order Table : UPDATES FOUND in  ORDER BOOK  ORDER FEED ACTION ");
    }
    else {

      console.log("Quick Order Table :  No updates in ORDER BOOK from ORDER FEED ACTION ");
    }

} 
const callBackEventSource = (eventOrderData) => {
     try {

                console.log(" QUICK ORDER TABLE    Order Data Stream response "+JSON.stringify(event.data));
                console.log(" QUICK ORDER TABLE    Order Data Stream typeof  "+JSON.stringify(typeof event.data));
              let data = undefined; 
              try {
                data =
                JSON.parse(eventOrderData); }
                
                catch(dtEr){
                   console.log(" QUICK ORDER TABLE    Order Data Stream response  PARSE FAILED  ");
                    data = eventOrderData;
                }
              let orderData = (data !==undefined ? (data.orders !==undefined ? data.orders : undefined ) : undefined);

              if (orderData !== undefined) { // last price
               const {limitPrice, symbol, type  } = orderData;   
               setTickerData(data); 
               if (typeof ltp !== "undefined" && typeof type !== "undefined") {
                 console.log("Indices Quote availalbe. -----------QUICK ORDER TABLE");
                 StorageUtils._save(CommonConstants.tickerOrdersSocketCacheKey, orderData );
               /* if(symbol === 'BSE:SENSEX-INDEX'){  setSensex(data);dispatch(saveSensexBook(data)) }
                if(symbol === 'NSE:NIFTY50-INDEX'){ setNifty(data);  dispatch(saveNiftyBook(data))}
                if(symbol ==='NSE:NIFTYBANK-INDEX'){  setBankNifty(data);  dispatch(saveBankNiftyBook(data))}
                */
                //NOTE this is a single Tick Price for either of the Symbols 
                // the 3 above are default , rest would be the onES WHERE THE POSITION'S ARE TAKEN 
                // WE HAVE TO UPDATE THE POSITION BOOK SYMBOLS WITH THESE PRICES.
    
                /* parsedData = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey).data
                '[{"netQty":1,"qty":1,"avgPrice":72256,"netAvg":71856,"side":1,"productType":"MARGIN","realized_profit":400,"unrealized_profit":461,"pl":861,"ltp":72717,"buyQty":2,"buyAvg":72256,"buyVal":144512,"sellQty":1,"sellAvg":72656,"sellVal":72656,"slNo":0,"fyToken":"1120200831217406","crossCurrency":"N","rbiRefRate":1,"qtyMulti_com":1,"segment":20,"symbol":"MCX:SILVERMIC20AUGFUT","id":"MCX:SILVERMIC20AUGFUT-MARGIN","cfBuyQty":0,"cfSellQty":0,"dayBuyQty":0,"daySellQty":1,"exchange":10}]'
                
                
                [{"netQty":1,"qty":1,"avgPrice":72256,"netAvg":71856,"side":1,"productType":"MARGIN","realized_profit":400,"
                 unrealized_profit":461,"pl":861,"ltp":72717,"buyQty":2,"buyAvg":72256,"buyVal":144512,"sellQty":1,
                 "sellAvg":72656,"sellVal":72656,"slNo":0,"fyToken":"1120200831217406","crossCurrency":"N","rbiRefRate":1,
                 "qtyMulti_com":1,"segment":20,"symbol":"MCX:SILVERMIC20AUGFUT","id":"MCX:SILVERMIC20AUGFUT-MARGIN",
                 "cfBuyQty":0,"cfSellQty":0,"dayBuyQty":0,"daySellQty":1,"exchange":10}]
    
                */ 
              // debugger;
                 // CHECK parsedData already contains the FETCHED position of not 
                 if(sortedSocketData  == null || sortedSocketData  == undefined){
                     try { 
                   // let g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey).data);
                    let g = undefined;
                        try { 
                          g =     JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey).data);
                        }
                        catch(er2){
                           console.log(` QuickOrderTable: parsedData : parse(${CommonConstants.recentOrdersSocketKey}).data) failed `);
                        }
                      if(g !==null && g!==undefined && Array.isArray(g)){
                         sortedSocketData = g
                      }
                      else {
                       // g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey));
                       // g = JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey)); // no need to parse 
                          try { 
                            g =     JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey));
                         }
                          catch(er3){
                              g =  StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey) ;
                           console.log(` QuickOrderTable: sortedSocketData : parse(${CommonConstants.recentOrdersSocketKey})) failed `);
                         }
    
                      
                        if(g !==null && g!==undefined ){
                           let kt   = Object.fromEntries(
                                      Object.entries(g).map(([key, value]) => [key, String(value)])
                                          );
                             Object.entries(g).forEach(([key, value]) =>{
                                   if (value !==null && value !==undefined &&  Array.isArray(value) ){
                                      g = value;
                                      
                                   } 
                             } );
    
                          console.log(` QuickOrderTable: sortedSocketData : CommonConstants.recentOrdersSocketKey ${CommonConstants.recentOrdersSocketKey} ::  ${JSON.stringify(g)} `); 
                          sortedSocketData = g
                        }
                        else {
                          console.log(` QuickOrderTable:  sortedSocketData :  CommonConstants.recentOrdersSocketKey ${CommonConstants.recentOrdersSocketKey} :: [] `); 
                          sortedSocketData = g
                         // return [];
                        }
                      }
                        }
                    catch(ere){
                      console.log(` QuickOrderTable: sortedSocketData : CommonConstants.recentOrdersSocketKey ${CommonConstants.recentOrdersSocketKey} :: not available set to [] `); 
                       sortedSocketData =[];
                      //return [];
                    }
                   
                 }
    
    
                 if(sortedSocketData !== null && sortedSocketData !== undefined &&  Array.isArray(sortedSocketData)) {
                  let dataToSort = [...sortedSocketData]; let ordersTickerData = [];
                   console.log(`QuickOrderTable: positionBook state ${JSON.stringify(dataToSort)} `);
                  if( Array.isArray(dataToSort)) { 
                            ordersTickerData = dataToSort.map(p => {
                              let tickSym  = (p.symbol.indexOf('NIFTY')  -1 ? 'NSE:'+p.symbol:( p.symbol.indexOf("SENSEX")>-1? "BSE:"+p.symbol : "NSE:"+p.symbol));
                            if ( data.symbol.indexOf(tickSym) > -1) {
                                console.log(`QuickOrderTable: updating ${p.symbol} LTP to ${data.ltp}`);
                                return { ...p, ltp: data.ltp };
                            } 
                            return p;
                            });
    
                        }
                        else {
                             console.log(`QuickOrderTable: positionBook not array `);
                        }
                    // set parseData with the updated ticker price 
                    if(ordersTickerData.length >0){  
                      sortedSocketData = ordersTickerData;
                    }
                    else {
                      console.log(" ORDER's  .................no TICKER UPDATES -----------QUICK ORDER TABLE")
                    }
                 }
                 else {
                       console.log(`QuickOrderTable: please FETCH the Position's manually for TICKER UPATES IN POSITONS `);
                       //  console.log(" PositionGrid after login state.position.positionBook "+JSON.stringify(positionData))
                       console.log(`QuickOrderTable: sortedSocketData  ${sortedSocketData} `);
                 }
            
               // dispatch( savePositionTickerBook(data));
               //   onFeed(JSON.stringify( { "colorSENSEX": colorSENSEXClass , "colorSENSEX" : colorBankNIFTYClass ,
                //         "colorSENSEX": colorNIFTYClass} ) )
               }
              }               
             } catch (err) {
                 console.error("❌ Failed to parse SSE data:", err);
             }

}  
 const stopEventSource = () => {
    if (eventSourceRef.current) {
      console.log("🛑 Closing EventSource...-----------FYERS EVENT SOURCE FEED");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    } else {
      console.warn("⚠ No EventSource to close.-----------FYERS EVENT SOURCE FEED");
    }
  };
 const startStreaming = async  () => { 
    // fetch the already placed order's if they are retrieved from the normal order poll ordres button 
     alsoUpdateComputedSocketData(sortedDataP);
     // FETCH the cancelled order if ANY has been cancelled 
    let reCancelOr =   StorageUtils._retrieve(CommonConstants.quickOrderCancellOrderPlaced );
     console.log("recent cancelled order  "+JSON.stringify(reCancelOr));
          let canceledOrd  = undefined;      
        if( reCancelOr['data'] !== ''  && reCancelOr['data'] !== null && reCancelOr['data'] !==undefined){       
               // console.log("canceled "+JSON.stringify(g))
                let tr = JSON.parse((JSON.stringify(reCancelOr)));
                if(tr !==null && tr !== undefined ){
                    if(tr['data'] !==null && tr['data']!== undefined ){
                      canceledOrd =tr['data'];
                        console.log(` canceledOrd  ${JSON.stringify(canceledOrd)} `)

                    }
                }
              }                       

     dispatch(startEventSource(false , computedSocketData , canceledOrd,callBackOrderFeedAction));
  
             


 
 };

  const renderTable = (data) => (  
       <>{/* Table Header */}
      <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
        <div
          className="py-[1px] px-1 cursor-pointer truncate"
          onClick={() => handleSort("symbol")}
        >
          Inst{getSortIndicator("symbol")}
        </div>
        <div className="py-[1px] px-1">Cancel</div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("qty")}
        >
          Qty{getSortIndicator("qty")}
        </div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("limitPrice")}
        >
          Avg{getSortIndicator("limitPrice")}
        </div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("lp")}
        >
          LTP{getSortIndicator("lp")}
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-200 text-[11px] leading-[1.1rem]">
        {computedSocketData && computedSocketData.length > 0 ? (
          computedSocketData.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] text-gray-800 transition
              ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              hover:bg-blue-400
              ${(row.side === -1 || row.side === "-1") ? "order-row-sell bg-red-400" : "order-row-buy bg-green-400"}`}
            >
              <div className="py-[1px] px-1 text-base font-bold truncate">
                {row.symbol}
              </div>
              <div className="py-[1px] px-1 text-base font-bold truncate">
                <button
                  className="w-2 h-2 text-gray-600 hover:bg-gray-200"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleCancel(row.id);
                    }
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="py-[1px] px-1 text-base font-bold">{row.qty}</div>
              <div className="py-[1px] px-1 text-base font-bold">
                {row.limitPrice}
              </div>
              <div className="py-[1px] px-1 text-base font-bold">{row.lp}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-2 text-[12px]">
            No {activeTab === "normal" ? "normal" : "streaming"} orders
          </div>
        )}
      </div>
      </>);

  const renderCompactGrid = (data) => (
  <>
    <div className="grid grid-cols-[minmax(120px,1fr)_40px_50px_50px_60px]
                    bg-gray-100 text-gray-700 text-[11px] font-semibold border-b">
      <div className="px-1">Inst</div>
      <div className="px-1 text-center">✕</div>
      <div className="px-1 text-right">Qty</div>
      <div className="px-1 text-right">Avg</div>
      <div className="px-1 text-right">LTP</div>
    </div>

    <div className="max-h-[140px] overflow-y-auto">
      {data.map((row, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-[minmax(120px,1fr)_40px_50px_50px_60px]
            text-[11px] items-center
            ${idx % 2 ? "bg-gray-50" : "bg-white"}
            ${(row.side === -1 || row.side === "-1")
              ? "bg-red-100"
              : "bg-green-100"}`}
        >
          <div className="px-1 truncate font-medium">
            {row.symbol}
          </div>

          <button
            className="text-center text-red-600"
            onClick={() => handleCancel(row.id)}
          >
            ✕
          </button>

          <div className="px-1 text-right">{row.qty}</div>
          <div className="px-1 text-right">{row.limitPrice}</div>
          <div className="px-1 text-right">
            {row.lp ?? "--"}
          </div>
        </div>
      ))}
    </div>
  </>
);

 const renderNormalFetchTable = (data) => ( <> {!isMobile &&  (
               <>
      <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
        <div
          className="py-[1px] px-1 cursor-pointer truncate"
          onClick={() => handleSort("symbol")}
        >
          Inst{getSortIndicator("symbol")}
        </div>
        <div className="py-[1px] px-1">Cancel</div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("qty")}
        >
          Qty{getSortIndicator("qty")}
        </div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("limitPrice")}
        >
          Avg{getSortIndicator("limitPrice")}
        </div>
        <div
          className="py-[1px] px-1 cursor-pointer"
          onClick={() => handleSort("lp")}
        >
          LTP{getSortIndicator("lp")}
        </div>
      </div>

      
      <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-200 text-[11px] leading-[1.1rem]">
        {filteredSocketData && filteredSocketData.length > 0 ? (
          filteredSocketData.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] text-gray-800 transition
              ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              hover:bg-blue-400
              ${(row.side === -1 || row.side === "-1") ? "order-row-sell bg-red-400" : "order-row-buy bg-green-400"}`}
            >
              <div className="py-[1px] px-1 text-base font-bold truncate">
                {row.symbol}
              </div>
              <div className="py-[1px] px-1 text-base font-bold truncate">
                <button
                  className="w-1 h-1 text-black-600 hover:bg-blue-200"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleCancel(row.id);
                    }
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="py-[1px] px-1 text-base font-bold">{row.qty}</div>
              <div className="py-[1px] px-1 text-base font-bold">
                {row.limitPrice}
              </div>
              <div className="py-[1px] px-1 text-base font-bold">{row.lp}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-2 text-[12px]">
            No {activeTab === "normal" ? "normal" : "streaming"} orders
          </div>
        )}
      </div>
      </>
 )}
 {/* Mobile Card View */}
            {isMobile &&  (
              <div className="grid gap-3 mt-3">
                {data && data.map((row, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 shadow-sm bg-white"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">{row["symbol"]}</span>
                     
                    </div>
                      <div className="text-sm mt-2 space-y-1">
                      <button className="rounded-md border bg-brandgreen border-b-2 border-blue-500 text-white"  onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                 if (e.target === e.currentTarget) {
                                   handleCancel(row.id);
                               }
                                }
                              }} >Cancel</button>
                              </div>
                    <div className="text-sm mt-2 space-y-1">
                      <div>Qty: <strong>{row["qty"]}</strong></div>
                      <div>Avg: <strong>{row["limitPrice"]}</strong></div>
                      <div>LTP: <strong>{row.ltp}</strong></div>
                      <div>Status: <strong>{row.status}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
       </>
 );


  return (
    <> 
    <div  className="flex justify-between  gap-x-4 items-center"> 
           <span  id="POLLORDERBOOK"
                    onClick={handleOrderBookPoll} className="inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-all duration-200">
                      <button class="flex items-center gap-2 px-4 py-2.5  bg-brandgreenlight hover:bg-blue-700 text-brandgreen rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95">
                        
                        
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4" aria-hidden="true">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg><span>
                           </span></button>
                 {/*  <AnimatePresence mode="wait">
                    {isOrderPolling && (
                      <motion.span
                        key="loader"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-blue-600 dark:text-blue-400" 
                          strokeWidth={2.5}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence> */}
                  {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clipRule="evenodd" />
                            </svg> */}
                    {   (isMobile ?  (<> 
                                </>) : 
                      
                              (<span className="text-sm font-semibold font-medium" > {isOrderPolling ? 'Fetching' : 'Poll Orders'} </span>) ) }  
             </span>

         {/*  <button id="POLLORDERBOOK"
                    onClick={handleOrderBookPoll}
                    className={` flex items-start justify-start gap-2 px-1 py-2 h-[35px] rounded-lg mx-4 mt-1 font-semibold
                        hover:bg-blue-200 bg-brandgreenlight dark:text-white   ${
                        isOrderPolling
                        ? 'bg-green-400 '
                        : 'bg-brandgreenlight dark:text-white'
                    }`}
                    >
                    {isOrderPolling ? (
                        <Activity size={15} className=" animate-pulse " />
                    ) : (
                        <ToggleLeft size={15} className="text-gray-500" />
                    )}  
                      {   (isMobile ?  (<> </>) : 
                      
                              (<span className="text-sm font-semibold font-medium" > {isOrderPolling ? 'Fetching' : 'Poll Orders'} </span>) ) }  
                    </button> */}
        <div className="flex justify-end">  
            <div className={`bg-zinc-100 rounded-md ${
          isMobile
            ? "border border-gray-200 w-[260px]"
            : "border border-gray-300 w-[460px]"
        }`}>
               


              { /*   <div className="  bg-zinc-100  rounded-md w-[460px]">*/}


                {/* Tabs */}
                <div className="flex border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("normal")}
                    className={`flex-1 text-center py-1 text-[12px] font-medium ${
                    activeTab === "normal"
                        ? "bg-brandgreenlight  border-b-2 border-blue-500 text-blue-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Normal Orders
                </button>
                <button
                    onClick={() => { setActiveTab("streaming"); startStreaming(); } }
                    className={`flex-1 text-center py-1 text-[12px] font-medium  ${
                    activeTab === "streaming"
                        ? "bg-brandgreen border-b-2 border-blue-500 text-white  "
                        : "bg-gray-100 text-brandgreen  hover:bg-gray-200  "
                    }`}
                >
                    Streaming Orders
                </button>
                </div>

                {/* Tab Content &&  renderNormalFetchTable(sortedData)*/}
                {activeTab === "normal"  && (
                                isMobileLandscape
                                  ? renderCompactGrid(sortedData)
                                  : renderNormalFetchTable(sortedData)
                              ) }
                {/* Tab Content !isMobile && activeTab === "streaming" &&*/}
               {  activeTab === "streaming" && ( isMobileLandscape
                        ? renderCompactGrid(computedSocketData) : !isMobile ? ( <>
                {computedSocketData && computedSocketData.length > 0 ? ( <>
                   <div id="quickOrdersHeader" className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
                      <div
                        className="py-[1px] px-1 cursor-pointer truncate"
                        
                      >
                        Inst 
                      </div>
                      <div className="py-[1px] px-1">Cancel</div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                       
                      >
                        Qty 
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        
                      >
                        Avg 
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        
                      >
                        LTP 
                      </div>
                    </div>

                     <div  id ="quickOrders1"  className="max-h-[200px] overflow-y-auto divide-y divide-gray-200 text-[11px] leading-[1.1rem]">
                      {computedSocketData.map((row, index) => (
                          <SwipeableRowDesk    key={row.symbol} 
                                row={row} 
                                idx={index} 
                                getPnlClass={getPnlClass} 
                                getPnlBg={getPnlBg} 
                                setslideIdx = {setSlideValue}
                                onClose={() => handleDeskClosePosition(row)}
                                      onModify={() => handleDeskModifyPosition(row)} isMobile={isMobile} 
                            />
                      
                      ))}
                    </div>
                    </>
                     ) : (
                        <div id="quickOrdersNoOrders" style={{ display:'block' }} className="text-gray-500 text-center py-2 text-[12px]">
                        No {activeTab === "normal" ? "normal" : "streaming"} orders
                      </div>
                      )
                    
                         }
              </>
                )  :
               
           (
              <div className="grid gap-3 mt-3">
                {computedSocketData.map((row, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 shadow-sm bg-white"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">{row["symbol"]}</span>
                     
                    </div>
                      <div className="text-sm mt-2 space-y-1">
                      <button className="rounded-md border bg-brandgreen border-b-2 border-blue-500 text-white"  onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                 if (e.target === e.currentTarget) {
                                   handleCancel(row.id);
                               }
                                }
                              }} >Cancel</button>
                              </div>
                    <div className="text-sm mt-2 space-y-1">
                      <div>Qty: <strong>{row["qty"]}</strong></div>
                      <div>Avg: <strong>{row["limitPrice"]}</strong></div>
                      <div>LTP: <strong>{row.ltp}</strong></div>
                      <div>Status: <strong>{row.status}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
               
                {/* can pass diff dataset renderTable(computedSocketData)*/}
               {/* </div> */}    
              <div id="QUICKORDERSTATUS" className="grid grid-cols-1 bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">

              </div>
          </div>

        </div>
     </div>

                 {( slide ===1 || slide ===2 )  && (   <QuitQuickOrder   key={`${sellPlusSymbol}_${swipeQty}`} // Forces re-mount when symbol or qty changes
                 
                     isMobile ={  isMobile} cancelOrder={cancelOrder} cancelledIn={cancelOrderDialogClosed} showModalDialog={(sellPlusSymbol !==undefined) &&(  slide ===1 || slide ===2)  } sellPlusSymbol= {sellPlusSymbol} symAvgPrice={symbolAvgPrice} symbolLTPin={symbolLTP} boughtQty={swipeQty}  qtySold={positionQty} 
                           setButtonSell={true} handleCancel={handleCancelQuick}  ref={childRef} />
                         )}  




      </>
  );
}
/*



     if (!isConnected) {
        // Prevent duplicate connections
        if (eventSourceRef.current) {
          console.warn("EventSource already running. ---------------QUICK ORDER TABLE");
          return;
        }
    
        try {
           // setUserAuthCode( userLoggedIn());  ;
            let userAuthCode1 = userLoggedIn();

         if (userAuthCode1 && userAuthCode1 !== null && userAuthCode1 !== undefined) {
           console.log("User is Authorized ---------------------QUICK ORDER TABLE ");  
           const fetchAuthToken = async () => {
              try {  //
                 const res = await FYERSAPI.get(FYERSAPITICKERACCESTOKEN , {params: { "auth_code" : userAuthCode1 }});
                 let text = '';
                    text =    res.data.value;
                
                 StorageUtils._save(CommonConstants.recentTickerToken, text)
                 return text;
              }
              catch(erer){
                console.log("Auth token fetch Error  ---------------QUICK ORDER TABLE ")
                return '';
             }
           }; 
           const fetchSocketOrders = async (acctoken) => {   
            // NOT NEEED oNLY ACCESS TOKEN 
            //let marketFeed = StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
    
          
                if(acctoken  ===null || acctoken ===undefined || acctoken ==='' ){
                   // gethe 
                   let ctoken =  StorageUtils._retrieve(CommonConstants.recentCancelledOrderToken).data ;
                   console.log("cToken === "+JSON.stringify(ctoken))
                   acctoken = ctoken;
                    console.log("QUICK ORDER TABLE source using the acctoken === CommonConstants.recentCancelledOrderToken ")
                }
                // RE-CHECK access _tOken 
                 if(acctoken  ===null || acctoken ===undefined || acctoken ==='' ){
                   console.log("User not logged in " );
                   // MAY CANCEL the EVENT SOURCE also here 
                   stopEventSource();
                   return ;
                 }
    
             const params = new URLSearchParams({
                    //authcode:  localStorage.getItem(tokenKey),
                    // interval: '1m',
                    // limit: '100', ?accessToken=
                      accessToken: acctoken
                    });
                    // Append each ticker
                    // NOT NEEDED only ACCESS TOKEN 
          
             const es = new EventSource(FYERSAPIORDERSRENDER+`?${params.toString()}`, { withCredentials: true });
     
             console.log(`✅ ORBER SOCKET API -${params.toString()} --------------QUICK ORDER TABLE`);
    
            es.onopen = () => {
                console.log("✅  ORBER SOCKET API EventSource connection opened.");
                setIsConnected(true);
            }; 
            es.onmessage = (event) => {
             try {

                console.log(" QUICK ORDER TABLE    Order Data Stream response "+JSON.stringify(event.data));
                console.log(" QUICK ORDER TABLE    Order Data Stream typeof  "+JSON.stringify(typeof event.data));
              let data = undefined; 
              try {
                data = JSON.parse(event.data); }
                
                catch(dtEr){
                   console.log(" QUICK ORDER TABLE    Order Data Stream response  PARSE FAILED  ");
                    data = event.data;
                }
              let orderData = (data !==undefined ? (data.orders !==undefined ? data.orders : 
                                                     ( data["orders"] !==undefined ?  data["orders"] : undefined) ) : undefined);

              if (orderData !== undefined) { // last price
               const {limitPrice, symbol, type  } = orderData;   
               setTickerData(data); 
               if (typeof limitPrice !== "undefined" && typeof type !== "undefined"  && typeof symbol !== "undefined") {
                 console.log("Indices Quote availalbe. -----------QUICK ORDER TABLE");
                 StorageUtils._save(CommonConstants.tickerOrdersSocketCacheKey, orderData );
              
                 // CHECK parsedData already contains the FETCHED position of not 
                 if(sortedSocketData  == null || sortedSocketData  == undefined){
                      if(orderData !== null || orderData  !== undefined){
                        if (Array.isArray(orderData)){ 
                         sortedSocketData = [...orderData];
                        }
                        else {
                          sortedSocketData = [orderData];
                        }
                        console.log(`GENERAL SOCKET --ORDERS after subscription :  ${JSON.stringify(sortedSocketData)}`);
                      }
                      else {
                        console.log(" No Order update returning next feed  .... ")
                        return;
                      }
                 }
                 else {
                     if(orderData !== null || orderData  !== undefined){
                        if (Array.isArray(orderData)){ 
                         sortedSocketData = [...orderData];
                        }
                        else {
                          sortedSocketData = [orderData];
                        }
                        console.log(`GENERAL SOCKET --ORDERS after subscription :  ${JSON.stringify(sortedSocketData)}`);
                      } 
                 }
                     try { 
                   // let g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey).data);
                    let g = undefined;
                        try { 
                          g =     JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey).data);
                        }
                        catch(er2){
                           console.log(` QuickOrderTable: parsedData : parse(${CommonConstants.recentOrdersSocketKey}).data) failed `);
                        }
                      if(g !==null && g!==undefined && Array.isArray(g)){
                         sortedSocketData = g
                      }
                      else {
                       // g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey));
                       // g = JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey)); // no need to parse 
                          try { 
                            g =     JSON.parse(StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey));
                         }
                          catch(er3){
                              g =  StorageUtils._retrieve(CommonConstants.recentOrdersSocketKey) ;
                           console.log(` QuickOrderTable: sortedSocketData : parse(${CommonConstants.recentOrdersSocketKey})) failed `);
                           if(sortedSocketData   !== null || sortedSocketData  !== undefined)
                            {   g= sortedSocketData }
                         }
    
                    
                      }
                        }
                    catch(ere){
                      console.log(` QuickOrderTable: sortedSocketData : CommonConstants.recentOrdersSocketKey ${CommonConstants.recentOrdersSocketKey} :: not available set to [] `); 
                       sortedSocketData =[];
                      //return [];
                    }
                   
                  // }  // sortedSocketData 
    
    
                 if(sortedSocketData !== null && sortedSocketData !== undefined &&  Array.isArray(sortedSocketData)) {
                  let dataToSort = [...sortedSocketData]; let ordersTickerData = [];
                   console.log(`QuickOrderTable: positionBook state ${JSON.stringify(dataToSort)} `);
                  if( Array.isArray(dataToSort)) { 
                            ordersTickerData = dataToSort.map(p => {
                              let tickSym  = p.symbol;
                              //(p.symbol.indexOf('NIFTY')  -1 ? 'NSE:'+p.symbol:( p.symbol.indexOf("SENSEX")>-1? "BSE:"+p.symbol : "NSE:"+p.symbol));
                            if ( !isNaN(p.limitPrice ) ) {
                                console.log(`QuickOrderTable: updating ${p.symbol} LTP to ${p.limitPrice}`);
                                return { ...p, lp: p.limitPrice };
                            } 
                            return p;
                            });
    
                        }
                        else {
                             console.log(`QuickOrderTable: positionBook not array `);
                        }
                    // set parseData with the updated ticker price 
                    if(ordersTickerData.length >0){  
                      sortedSocketData = ordersTickerData;
                      setComputedSocketData(computedSocketData);
                         console.log(` QUICK ORDER TABLE  ORDER's   ${JSON.stringify(sortedSocketData)} `)
                    }
                    else {
                      console.log(" ORDER's  .................no TICKER UPDATES -----------QUICK ORDER TABLE")
                    }
                 }
                 else {
                       console.log(`QuickOrderTable: please FETCH the Position's manually for TICKER UPATES IN POSITONS `);
                       //  console.log(" PositionGrid after login state.position.positionBook "+JSON.stringify(positionData))
                       console.log(`QuickOrderTable: sortedSocketData  ${sortedSocketData} `);
                 }
            
               // dispatch( savePositionTickerBook(data));
               //   onFeed(JSON.stringify( { "colorSENSEX": colorSENSEXClass , "colorSENSEX" : colorBankNIFTYClass ,
                //         "colorSENSEX": colorNIFTYClass} ) )
               }
              }               
             } catch (err) {
                 console.error("❌ Failed to parse SSE data:", err);
             }
            };
            es.onerror = (err) => {
                console.error("⚠ EventSource error:", err);
                setIsConnected(false);
                // Optional: auto-close on persistent error
                if (es.readyState === EventSource.CLOSED) {
                console.warn("EventSource closed. Cleaning up...");
                stopEventSource();
                }
            };
            eventSourceRef.current = es; 
        } 
       await  fetchAuthToken().then(async aces_token   => { 
           await  fetchSocketOrders(aces_token).catch((err) => {
               console.log("Order Gnereal Socket error occurred "+JSON.stringify(err))
                console.log("Order Gnereal Socket closing instance ...  ")
                stopEventSource();
                setIsConnected(false);
         });
    
         })
    
    
    
    
    
         } // USER MUST BE LOGGED IN 
         else { 
             console.log("❌ User must be logged in to create EventSource:" );
         }
        } catch (err) {
          console.error("❌ Failed to create EventSource:", err);
        }
      }
    
      else {
            stopEventSource();
      }

*/

/* 
 (
              <>
                {computedSocketData && computedSocketData.length > 0 ? (
                  <>
                   }
                    <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
                      <div
                        className="py-[1px] px-1 cursor-pointer truncate"
                        onClick={() => handleSort("symbol")}
                      >
                        Inst{getSortIndicator("symbol")}
                      </div>
                      <div className="py-[1px] px-1">Cancel</div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("qty")}
                      >
                        Qty{getSortIndicator("qty")}
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("limitPrice")}
                      >
                        Avg{getSortIndicator("limitPrice")}
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("lp")}
                      >
                        LTP{getSortIndicator("lp")}
                      </div>
                    </div>

                    }
                    <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-200 text-[11px] leading-[1.1rem]">
                      {computedSocketData.map((row, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] text-gray-800 transition
                            ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            hover:bg-gray-100
                            ${row.side === -1 || row.side === "-1" ? "order-row-sell" : "order-row-buy"}`}
                        >
                          <div className="py-[1px] px-1 text-base font-bold truncate">
                            {row.symbol}
                          </div>
                          <div className="py-[1px] px-1 text-base font-bold truncate">
                            <button
                              className="w-2 h-2 text-gray-600 hover:bg-gray-200"
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                  handleCancel(row.id);
                                }
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          <div className="py-[1px] px-1 text-base font-bold">
                            {row.qty}
                          </div>
                          <div className="py-[1px] px-1 text-base font-bold">
                            {row.limitPrice}
                          </div>
                          <div className="py-[1px] px-1 text-base font-bold">
                            {row.lp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-2 text-[12px]">
                    No {activeTab === "normal" ? "normal" : "streaming"} orders
                  </div>
                )}
              </>
            )



*/
