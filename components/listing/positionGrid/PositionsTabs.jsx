import React ,{ useState,useEffect , useRef,  forwardRef } from "react";
import { startEventSource } from "./positionFeed.actions";
import {useDispatch, useSelector} from 'react-redux';
import { ToggleLeft, Activity } from 'lucide-react';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
import { savePositionStreamBook } from '@/redux/slices/positionSlice';  
 import   useIsMobile   from "../tradeGrid/useIsMobile";
import SellPlus2Order from './SellPlus2Order';

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


const SwipeableRow = ({
  children,
  onClose,
  onModify,
  isMobile
}) => {

  
  return (
    <div className={`relative  ${isMobile ? "overflow-hidden": "text-red-600"} `} >
      {/* Background actions */}
      <div className="absolute inset-0 flex justify-between items-center px-3">
        <div className="flex items-center gap-1 text-green-600">
          <Edit3 size={16} />
          <span className="text-xs font-semibold">Modify</span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <span className="text-xs font-semibold">Close</span>
          <XCircle size={16} />
        </div>
      </div>

      {/* Foreground draggable row */}
      <motion.div
        drag="x"
        dragConstraints={ isMobile ? { left: -120, right: 120 } : { left: -20, right: 30}}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_CLOSE) {
            onClose();
          } else if (info.offset.x < SWIPE_MODIFY) {
            onModify();
          }
        }}
        className="relative bg-white z-10"
      >
         {children}
      
      </motion.div>
    </div>
  );
};
const SwipeableRowDesk = ({ row, idx, getPnlClass, getPnlBg  , onClose,
  onModify,
  isMobile}) => {
  const x = useMotionValue(0);
  // Color transformation based on swipe direction (Left = Red/Close, Right = Blue/Modify)
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["#ef4444", "#ffffff", "#3b82f6"]
  );

  return (
    <div className="relative overflow-hidden group bg-gray-100">
      
      {/* Background Action Underlays (Visible during swipe) */}
      <div className="absolute inset-0 flex justify-between items-center px-6 text-white font-bold">
        <div className="flex items-center gap-2">
          <Settings2 size={20} />
          <span>MODIFY</span>
        </div>
        <div className="flex items-center gap-2">
          <span>CLOSE</span>
          <XCircle size={20} />
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        style={{ x }}
        whileTap={{ cursor: 'grabbing' }}
         onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_CLOSE) {
            onClose();
          } else if (info.offset.x < SWIPE_MODIFY) {
            onModify();
          }
        }}
        className="relative z-10 bg-white"
      >
        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-12 items-center px-4 py-4 hover:bg-blue-50/40 transition-colors">
          <div className="col-span-1 text-gray-400 text-xs">{idx + 1}</div>
          <div className="col-span-2 font-bold text-blue-600 cursor-pointer hover:underline">{row.symbol}</div>
          <div className="col-span-1">
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600">{row.productType}</span>
          </div>
          <div className="col-span-1 text-right font-mono text-sm">{row.netQty}</div>
          <div className="col-span-1 text-right font-mono text-sm">{row.avgPrice?.toFixed(2)}</div>
          <div className="col-span-1 text-right font-mono text-sm font-semibold">{row.ltp?.toFixed(2)}</div>
          <div className={`col-span-1 text-right font-mono text-sm ${getPnlClass(row.unrealized_profit)}`}>
            {row.unrealized_profit?.toFixed(2)}
          </div>
          <div className={`col-span-1 text-right font-mono text-sm ${getPnlClass(row.realized_profit)}`}>
            {row.realized_profit?.toFixed(2)}
          </div>
          <div className={`col-span-2 text-right font-mono text-sm font-bold p-2 rounded-lg ${getPnlBg(row.calPrf)} ${getPnlClass(row.calPrf)}`}>
            {row.calPrf?.toFixed(2)}
          </div>
          <div className="col-span-1 flex justify-end gap-2">
            <button className="p-1 hover:text-blue-600 text-gray-400"><Settings2 size={16}/></button>
            <button className="p-1 hover:text-red-600 text-gray-400"><XCircle size={16}/></button>
          </div>
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

          <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-3">
            <div className="text-center bg-gray-50/50 rounded-lg p-2">
              <div className="text-[9px] text-gray-400 font-bold uppercase">Unrealized</div>
              <div className={`text-xs font-bold font-mono ${getPnlClass(row.unrealized_profit)}`}>
                {row.unrealized_profit > 0 ? '+' : ''}{row.unrealized_profit?.toFixed(2)}
              </div>
            </div>
            <div className="text-center bg-gray-50/50 rounded-lg p-2">
              <div className="text-[9px] text-gray-400 font-bold uppercase">Realized</div>
              <div className={`text-xs font-bold font-mono ${getPnlClass(row.realized_profit)}`}>
                {row.realized_profit?.toFixed(2)}
              </div>
            </div>
            <div className={`text-center rounded-lg p-2 border ${row.calPrf >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
              <div className="text-[9px] text-gray-400 font-bold uppercase">Total P&L</div>
              <div className={`text-xs font-black font-mono ${getPnlClass(row.calPrf)}`}>
                {row.calPrf?.toFixed(2)}
              </div>
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
const PositionsTabs = forwardRef(function PositionsTabs({
  sortedData, parsedData,
  sortedSocketData,
  userLogged,
  handleSort,
  getSortIndicator,
  handleSymbolClick,
},
  tableRef
){
  const [activeTab, setActiveTab] = useState("tab1"); // default tab
     //let  quickOrderBookFeed   = useSelector((state ) => state.positions.position);
         const[ computedSocketData , setComputedSocketData] = useState();
         let statePostionBook  = useSelector(state => state.position.positionBook);
        const isMobile = useIsMobile();
        const [sellPlusSymbol, setSellPlusSymbol] = useState(null);
          const [netBought, setNetBought] = useState(0);
          const [swipeQty, setSwipeQty] = useState(0);
          const [symbolAvgPrice, setSymbolAvgPrice] = useState(0);
           const [positionQty  ,setPositionQty ] = useState(() => netBought ) ; 
         const childRef = useRef(null);
   let dispatch = useDispatch();
 const [filteredData , setFilteredData] =useState(() => {
      try {
         let g =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)  || "null" ;
        let positions = undefined;
        console.log(` ${CommonConstants.recentPositionsKey}  :::   ${JSON.stringify(g)}`)
          const dataFromCache = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
        if( g['data'] !== ''  && g['data'] !== null && g['data'] !==undefined){
                    console.log(" recentTrades  position data empty "+JSON.stringify(g))
                    let tr = JSON.parse((JSON.stringify(g)));
                    if(tr !==null && tr !== undefined ){
                        if(tr['data'] !==null && tr['data']!== undefined ){
                          positions =tr['data'];
                            console.log(" positions useEffect   ")

                        }
                    }
                    
            }                      


        if (positions && Array.isArray(positions)) {
          
          console.log("..........positions grid recentPositions polled parsedData updated: POSITON TAB")
          return positions;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey)?.data || "null");
        if (g && Array.isArray(g)) {
         
          return g ;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey) || "null");
        if (g && Array.isArray(g)) {
        
          return g;
        }

        
      } catch (err) {
          console.log(" filteredData error useState  "+JSON.stringify(err));
         return [] 
      } } );

 const tabs = [
    { 
      id: "tab1", 
      label: "Positions", 
      icon: <BarChart2 size={18} />, 
      description: "Static snapshot",
      color: "blue" 
    },
    { 
      id: "tab2", 
      label: "Live Stream", 
      icon: <Activity size={18} />, 
      description: "Real-time updates",
      color: "emerald" 
    }
  ];

 const streamPostionLTPTimer = () => { 
        
                // INDX::NSE:NIFTY2590924250CE
                // marketFeedDataCacheKey
           let g =   StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
           let indKey = g; 
           if ( indKey.isValid && indKey.data !== null && indKey.data !==undefined ) { 
               let indData = indKey.data;
               let actualData = indData.data;
              // console.log(`  ${JSON.stringify(indKey.data)}  typeof CommonConstants.marketFeedDataCacheKey ${JSON.stringify(typeof indKey.data )} `);
              // console.log(`  ${JSON.stringify(actualData)}  typeof CommonConstants.marketFeedDataCacheKey.data ${JSON.stringify(typeof actualData )} `);
              // console.log(` Array.isArray(actualData) ::  ${JSON.stringify(Array.isArray(actualData))}  typeof CommonConstants.marketFeedDataCacheKey.data ${JSON.stringify(typeof actualData )} `);

           if( indData !== ''  && indData !== null && indData !==undefined){ 
           if( actualData !== ''  && actualData !== null && actualData !==undefined){ 

                  let indexWebSocketFeeds = actualData;
                  if(Array.isArray(indexWebSocketFeeds)){

                    const result = indexWebSocketFeeds.filter(item => !item.endsWith("-INDEX"));
                    // COMMENTED PURPOSELY to reduce CONSOLE LOGS 
                    // console.log(` index's to update ::: ${result}  is Array indexWebSocketFeeds.filter(item => !item.endsWith("-INDEX")  ${Array.isArray(result)}`);
                    result.forEach( (webSockIndx) => {
                         // CHECK YOU HAVE the ticker in localstore 
                        let ticker =    StorageUtils._retrieve("INDX::" +webSockIndx );
                      if ( ticker.isValid && ticker.data !== null && ticker.data !==undefined ) { 
                        let tickerData = ticker.data;
                          let actualTicker = tickerData.data;

                       if(  tickerData !==null &&  tickerData !==undefined  ){
                        let symbC =   webSockIndx.split(":")[1]; //.map(item => item.split(":")[1]);
                        const updateLTPUnrealised = (symbC , productype, ticker ) => { 
                           let qty = 0, buyVal  =0 , sellVal =0 , unRelProf =0;
                         const streamLTPDiv = document.getElementById("streamedLTP_"+symbC+"_"+productype);
                          const streamUnrealizedDiv = document.getElementById("streamedUnrealized_"+symbC+"_"+productype);
                           const streamQtyDiv = document.getElementById("streamedQty_"+symbC+"_"+productype);
                           const streamBuyDiv = document.getElementById("streamedBuyVal_"+symbC+"_"+productype);
                           if(streamQtyDiv !==null && streamQtyDiv !== undefined && 
                              streamBuyDiv !==null && streamBuyDiv !== undefined 
                           ){
                               let qq  =  parseFloat(streamQtyDiv.textContent);
                               let bb =  parseFloat(streamBuyDiv.textContent);
                               qty = typeof qq ==='string'? parseFloat(typeof qq) : qq;
                                  console.log(`  typeof qq   ::: ${ typeof qq } `);
                                buyVal = typeof bb  ==='string'? parseFloat(typeof bb ) : bb ;
                               console.log(` typeof bb   ::: ${ typeof bb } `);
                           }

                          if(streamLTPDiv !==null && streamLTPDiv !== undefined ){
                               let ltp = ticker['data'].ltp;
                              streamLTPDiv.textContent = ltp;
                              console.log(`streamedLTP_${symbC} updated with ${ltp}`);


                          }
                          else {
                           console.log(` streamedLTP_${symbC} :::: UNDEFINED `);
                         }
                           if(streamUnrealizedDiv !==null && streamUnrealizedDiv !== undefined ){
                               let ltp = ticker['data'].ltp; 
                                 ltp = typeof ltp ==='string'?  parseFloat(ltp) :ltp ;
                                 console.log(` typeof ltp ==='string'  ::: ${typeof ltp ==='string'} `);
                               
                                 sellVal = ltp * qty; 
                               console.log(` typeof sellVal  ::: ${ typeof sellVal} `);
                                unRelProf = sellVal - buyVal;

                              streamUnrealizedDiv.textContent = unRelProf ;
                              console.log(`streamedUnrealized_${symbC} updated with ${unRelProf}`);


                          }
                           else {
                            console.log(` streamedUnrealized_${symbC} :::: UNDEFINED `);
                          }

                        }
                       
                          updateLTPUnrealised(symbC, "MARGIN", ticker);
                           updateLTPUnrealised(symbC, "INTRADAY", ticker);

                       
                        }
                        else {
                           console.log(` INDX::${+webSockIndx} :::: UNDEFINED `);
                        }
                    }
                    // BASED OF state.position.positionBook existance 
                      let symbC =   webSockIndx.split(":")[1];
                     const updateLTPUnrealisedPB = (symbC , productype, ps) => {
                              let qty = 0, buyVal  =0 , sellVal =0 , unRelProf =0;
                             // let ticker = ps.filter(tick => tick.symbol ==symbC); // filter will always return a array so use find
                              let ticker = ps.find(tick => tick.symbol ==symbC);
                         if( ticker !== null && ticker !== undefined && ticker.symbol !== undefined && ticker.ltp !== undefined){
                         const streamLTPDiv = document.getElementById("streamedLTP_"+symbC+"_"+productype);
                          const streamUnrealizedDiv = document.getElementById("streamedUnrealized_"+symbC+"_"+productype);
                           const streamQtyDiv = document.getElementById("streamedQty_"+symbC+"_"+productype);
                           const streamBuyDiv = document.getElementById("streamedBuyVal_"+symbC+"_"+productype);
                           if(streamQtyDiv !==null && streamQtyDiv !== undefined && 
                              streamBuyDiv !==null && streamBuyDiv !== undefined 
                           ){
                               let qq  =  parseFloat(streamQtyDiv.textContent);
                               let bb =  parseFloat(streamBuyDiv.textContent);
                               qty = typeof qq ==='string'? parseFloat(typeof qq) : qq;
                                  console.log(`  typeof qq   ::: ${ typeof qq } `);
                                buyVal = typeof bb  ==='string'? parseFloat(typeof bb ) : bb ;
                               console.log(` typeof bb   ::: ${ typeof bb } `);
                           }

                          if(streamLTPDiv !==null && streamLTPDiv !== undefined ){
                               let ltp = ticker.ltp;
                              streamLTPDiv.textContent = ltp;
                              console.log(`streamedLTP_${symbC+"_"+productype} updated with ${ltp}`);


                          }
                          else {
                           console.log(` streamedLTP_${symbC+"_"+productype} :::: UNDEFINED `);
                         }
                           if(streamUnrealizedDiv !==null && streamUnrealizedDiv !== undefined ){
                               let ltp = ticker.ltp; 
                                 ltp = typeof ltp ==='string'?  parseFloat(ltp) :ltp ;
                                 console.log(` typeof ltp ==='string'  ::: ${typeof ltp ==='string'} `);
                               
                                 sellVal = ltp * qty; 
                               console.log(` typeof sellVal  ::: ${ typeof sellVal} `);
                                unRelProf = sellVal - buyVal;

                              streamUnrealizedDiv.textContent = unRelProf ;
                              console.log(`streamedUnrealized_${symbC+"_"+productype} updated with ${unRelProf}`);


                          }
                           else {
                            console.log(` streamedUnrealized_${symbC+"_"+productype} :::: UNDEFINED `);
                          }
                        }
                        }  
                       //  updateLTPUnrealisedPB(symbC, "MARGIN", statePostionBook); 
                         /// updateLTPUnrealisedPB(symbC, "INTRADAY", statePostionBook); 

                  });

                  } 
                else {
                    console.log(` ${CommonConstants.marketFeedDataCacheKey} not a array `);
                } 
              }
              } else {
                console.log(`  ${CommonConstants.marketFeedDataCacheKey}.data  ::: not found  `);
             }

            }
          else {
                console.log(`unable to read :::  ${CommonConstants.marketFeedDataCacheKey}`);
          }

         
    };
 useEffect(() => {
    let isMounted = true;
     if (tableRef?.current) {
      const rect = tableRef.current.getBoundingClientRect();
      console.log("Positions table rect:", rect);
    }
    const fetchParsedData = () => {
      try {
        let g =   StorageUtils._retrieve(CommonConstants.recentPositionsKey)  || "null" ;
       // console.log(" g "+JSON.stringify(g));
          let positions = undefined;      
        if( g['data'] !== ''  && g['data'] !== null && g['data'] !==undefined){       
         //       console.log("positions "+JSON.stringify(g))
                let tr = JSON.parse((JSON.stringify(g)));
                if(tr !==null && tr !== undefined ){
                    if(tr['data'] !==null && tr['data']!== undefined ){
                      positions =tr['data'];
              //          console.log(" positions   ")

                    }
                }
              }                       


        if (positions && Array.isArray(positions)) {
          setFilteredData(positions);
       //   console.log("..........positions grid recentPositions polled parsedData updated: POSITON TAB")
          return;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey)?.data || "null");
        if (g && Array.isArray(g)) {
          setFilteredData(g);
          return;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey) || "null");
        if (g && Array.isArray(g)) {
          setFilteredData(g);
          return;
        }

        setFilteredData([]);
      } catch (err) {
        setFilteredData([]);
      }
    };

    // Fibonacci delay generator
    const fibonacci = (n )  => {
      if (n <= 1) return 5000; // first interval = 5s
      let a = 5000,
        b = 8000; // second interval = 8s
      for (let i = 2; i <= n; i++) {
        const next = a + b;
        a = b;
        b = next;
      }
      return b;
    };

    let timeoutId ;

    const startPolling = (i ) => {
     // if (!isMounted) return;
      fetchParsedData();

      const delay = fibonacci(i);
      //console.log(`Next poll in ${delay / 500}s : POSITON TAB`);
      timeoutId = setTimeout(() => startPolling(i + 1), delay);
    };

    // start from iteration 0
    startPolling(0);
    // get ticker prices to update 
     setInterval( () => { streamPostionLTPTimer(); },
        
        4000 );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

const alsoUpdateComputedSocketData = (normalParsedData)=> {
   // this function is needed because this one 
   // checks for the position  placed before subscribing to the 5003 python General socket running from 
   // fyers_positions_start_websocket.py in E:\n\PythonAnyWhere-old-code\fyersfeed-git
   // 
    if(normalParsedData !==null && normalParsedData !==undefined && Array.isArray(normalParsedData)){
        console.log("Position Table :Position  FEED ACTION pending orders before subscribeing to EVENT STREAM ");
       console.log(JSON.stringify(normalParsedData));
       if(computedSocketData !==undefined && Array.isArray(computedSocketData) && computedSocketData.length ==0 ){
         setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => !normalParsedData.some(newItem => newItem.id === existing.id) 
                        ),
                         ...normalParsedData
                        ] );
         // also dispatch it to the ticker orderBook because immediately the General Socket running will empty it 
         dispatch(savePositionStreamBook(normalParsedData));

       }
       else{
         setComputedSocketData(normalParsedData);
           console.log("Position Table : Position FEED ACTION placed orders first time installed");
       }
    }

} 

const callBackPositionFeedAction = (positionsFeed) => {
    if(positionsFeed !==null && positionsFeed !==undefined && Array.isArray(positionsFeed)){
      let pendinPositionsFeed = positionsFeed ; //.filter(or => or.buyQty === 0 );
       console.log("Positions Table : Positions earlier placed ");
       console.log(JSON.stringify(pendinPositionsFeed));
      setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => !pendinPositionsFeed.some(newItem => newItem.id === existing.id) 
                        ),
                        ...pendinPositionsFeed
                        ] );
       if(positionsFeed.length > 0 && pendinPositionsFeed.length==0){
        // remove the pendinPositionsFeed's that are no more pending from computed socket data 
           setComputedSocketData((oldBook) =>    [
                        ...oldBook.filter(
                            existing => !positionsFeed.some(newItem => newItem.id === existing.id) 
                        )
                        
                        ] );
       }
       // setComputedSocketData(ordersFeed);
         
          console.log("Positions Table : UPDATES FOUND in  Position Book  Position FEED ACTION ");
    }
    else {

      console.log("Positions Table :  No updates in Position Book from Position FEED ACTION ");
    }

} 
 const startStreaming = async  () => { 
    // fetch the already placed order's if they are retrieved from the normal order poll ordres button 
     alsoUpdateComputedSocketData(sortedSocketData);
     dispatch(startEventSource(false , [],callBackPositionFeedAction));
 
 };

const handleClosePosition = (row,e) => {
  console.log("Close position:", row.symbol);
  
   handleSymbolClick(e, row["symbol"], row["avgPrice"], row["netQty"])
  // fire square-off / close API
};

const handleModifyPosition = (row) => {
  console.log("Modify position:", row.symbol);
  // open modify / add order panel
};


const handleDeskClosePosition = (row,e) => {
  console.log("Close position:", row.symbol);
  let symbol = row.symbol;
  let netBought = row.netQty;
  let costPrice = row.avgPrice;

     setSellPlusSymbol(symbol);
        setNetBought(netBought);
        setSwipeQty(netBought);
        setSymbolAvgPrice(costPrice);
        setPositionQty(netBought)
   // 3. Call the exposed function from the parent
    if (childRef.current) {
      childRef.current.triggerClick();
    }      
  // handleSymbolClick(e, row["symbol"], row["avgPrice"], row["netQty"])
  // fire square-off / close API
};

const handleDeskModifyPosition = (row) => {
  console.log("Modify position:", row.symbol);
  // open modify / add order panel
};


 const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  // Helper for Profit/Loss colors
  const getPnlClass = (val) => val >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold";
  const getPnlBg = (val) => val >= 0 ? "bg-emerald-50" : "bg-rose-50";

  const renderNormalFetchTable = (data) => (<> {!isMobile && ( 
     <div className="p-2 md:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
       
     
       
       
        <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-white"> {/* Header Section */}
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-600" />
            Positions <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{filteredData.length}</span>
          </h2>
          <div className="flex gap-2 text-xs text-gray-400 italic">
            <Info size={14} /> Mobile View Optimized
          </div>
        </div>

        {/* DESKTOP TABLE VIEW (Visible md and up) */}
        <div className="hidden md:block overflow-x-auto">
           <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
              {/* Table Header (Desktop Only) */}
              <div className="hidden md:grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Sr.</div>
                <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-blue-600" onClick={() => handleSort('symbol')}>
                  Instrument {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                </div>
                <div className="col-span-1">Product</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-1 text-right">Avg Price</div>
                <div className="col-span-1 text-right">LTP</div>
                <div className="col-span-1 text-right">Unrealized</div>
                <div className="col-span-1 text-right">Realized</div>
                <div className="col-span-2 text-right">Total P&L</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Rows Container */}
              <div className="divide-y divide-gray-100">
          {filteredData.map((row, idx) => (
                 <SwipeableRowDesk 
                      key={row.symbol} 
                      row={row} 
                      idx={idx} 
                      getPnlClass={getPnlClass} 
                      getPnlBg={getPnlBg} 
                       onClose={() => handleDeskClosePosition(row)}
                            onModify={() => handleDeskModifyPosition(row)} isMobile={isMobile}
                    />
              ))}
              </div>
            </div>
          
        </div>
             { sellPlusSymbol    && (   <SellPlus2Order  isMobile ={  isMobile} sellPlusSymbol= {sellPlusSymbol} symAvgPrice={symbolAvgPrice} boughtQty={swipeQty}  qtySold={positionQty} 
             setButtonSell={true}  ref={childRef} />
           )}   
        {/* MOBILE CARD VIEW (Visible below md) */}
        <div className="md:hidden divide-y divide-gray-100">
          <AnimatePresence>
            {userLogged && filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="p-4 active:bg-gray-50"
                  onClick={(e) => handleSymbolClick(e, row.symbol)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 tracking-tight">{row.symbol}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{row.productType}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Qty: <span className="font-semibold text-gray-700">{row.netQty}</span> @ {row.avgPrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-tighter">LTP</div>
                      <div className="font-mono font-bold text-gray-800">{row.ltp?.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-gray-400 uppercase leading-none">Realized Profit</span>
                       <span className={`text-sm font-mono ${getPnlClass(row.realized_profit)}`}>
                        {row.realized_profit >= 0 ? '+' : ''}{row.realized_profit?.toFixed(2)}
                       </span>
                    </div>
                    
                    <div className={`flex flex-col items-end px-3 py-2 rounded-lg ${getPnlBg(row.calPrf)}`}>
                      <span className="text-[10px] uppercase font-bold opacity-70 mb-1">Total P&L</span>
                      <div className="flex items-center gap-1">
                        {row.calPrf >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className={`text-lg font-mono font-black ${getPnlClass(row.calPrf)}`}>
                          {row.calPrf?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                <List size={40} className="opacity-20" />
                <p>No active positions found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Footer (Always visible) */}
        <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
          <div className="text-xs opacity-60 uppercase font-bold">Overall Summary</div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-[10px] opacity-50 uppercase leading-none">Net P&L</div>
                <div className="text-emerald-400 font-mono font-bold">
                  +4,505.00
                </div>
             </div>
          </div>
        </div>
    
    </div>
    </div>
  )
         
     }
           
      {/* Mobile Card View */}   
      {/*
           <div className="grid gap-3 mt-3">
          {data && data.map((row, index) => (
            <div
              key={index}
              className="border rounded-xl p-3 shadow-sm bg-white"
            >
              <div className="font-semibold">{row["symbol"]}</div>
              <div className="text-sm mt-2 space-y-1">
                <div>Avg Price: <strong>{row["avgPrice"]}</strong></div>
                <div>Qty: <strong>{row["netQty"]}</strong></div>
                <div>LTP: <strong>{row["ltp"]}</strong></div>
                <div>
                  P&L:{" "}
                  <strong
                    className={row["unrealized_profit"]>= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {row["unrealized_profit"]}
                  </strong>
                </div>
              </div>
            </div>
          ))}
           </div> */}
      {isMobile &&   (<>  {data && data.map((row, index) => 
            <div
              key={index}
              className="border rounded-xl p-3 shadow-sm bg-white"
            ><SwipeableRow
                            onClose={() => handleClosePosition(row)}
                            onModify={() => handleModifyPosition(row)}
                          >
                             
                              <div className="font-semibold">{row.symbol}</div>
                              <div className="text-sm mt-2 space-y-1">
                                <div>Avg Price: <strong>{row.avgPrice}</strong></div>
                                <div>Qty: <strong>{row.netQty}</strong></div>
                                <div>LTP: <strong>{row.ltp}</strong></div>
                                <div>
                                  P&L:
                                  <strong className={row.unrealized_profit >= 0 ? "text-green-600" : "text-red-600"}>
                                    {row.unrealized_profit}
                                  </strong>
                                </div>
                              </div>  </SwipeableRow>
                            </div>
               )
              
              }  
          </>
      )}
     </>

  ); // 
  const renderTable = (data) => (<> {!isMobile && (
    <div className="overflow-x-auto w-full">

     
      {/* Header row
      <div className="grid grid-cols-11 bg-gray-100 text-gray-700 font-semibold text-sm">
        <div className="py-1 px-1">SrNo</div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("symbol")}>
          Instrument {getSortIndicator("symbol")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("productType")}>
          Product {getSortIndicator("productType")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("netQty")}>
          Quantity {getSortIndicator("netQty")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("avgPrice")}>
          Avg Price {getSortIndicator("avgPrice")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("totCh")}>
          Total Charges {getSortIndicator("totCh")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("ltp")}>
          LTP {getSortIndicator("ltp")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("calPrf")}>
          Act {getSortIndicator("calPrf")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("buyVal")}>
          Buy Value {getSortIndicator("buyVal")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("realized_profit")}>
          Realized {getSortIndicator("realized_profit")}
        </div>
        <div className="py-1 px-1 cursor-pointer" onClick={() => handleSort("unrealized_profit")}>
          Unrealized {getSortIndicator("unrealized_profit")}
        </div>
      </div> */}

      {/* Body rows 
      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">*/}
       
        {Array.isArray(data) && data.length > 0 && userLogged ? (
          data.map((row, index) => (
            <div
              key={index}
              className={` text-sm text-gray-800 hover:bg-gray-50 transition ${
                row["side"] === "-1" ? "position-row-sell" : "position-row-buy"
              }`}
            >
                <SwipeableRow  isMobile={isMobile}   onClose={() => handleClosePosition(row)}   onModify={() => handleModifyPosition(row)}> 
             <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200"> 
               {!isMobile ? (   <div className="grid grid-cols-11" > 
                                 <div className="py-1 px-1">{index + 1}</div>
              <div
                className="py-1 px-1 text-blue-700  break-words font-bold cursor-pointer hover:underline"
                onClick={ !isMobile ? (e) =>
                  handleSymbolClick(e, row["symbol"], row["avgPrice"], row["netQty"]) : ( e)=> { handleClosePosition(row,e) }
                }
              >
                {row["symbol"]}
              </div>
              <div className=" break-words py-1 px-1">{row["productType"]}</div>
              <div className="py-1 px-1">{row["netQty"]}</div>
              <div className="py-1 px-1">{row["avgPrice"]}</div>
              <div className="py-1 px-1">{row["totCh"]}</div>
              <div className="py-1 px-1">{row["ltp"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["calPrf"]}
              </div>
              <div className="py-1 px-1">{row["buyVal"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["realized_profit"]}
              </div>
              <div
                className={`py-1 px-1 ${
                  row["unrealized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["unrealized_profit"]}
              </div>
                
                  </div>) : <> 
                  
                     <div className="py-1 px-1">{index + 1}</div>
              <div
                className="py-1 px-1 text-blue-700 font-bold cursor-pointer hover:underline"
                onClick={(e) =>
                  handleSymbolClick(e, row["symbol"], row["avgPrice"], row["netQty"])
                }
              >
                {row["symbol"]}
              </div>
              <div className="py-1 px-1">{row["productType"]}</div>
              <div className="py-1 px-1">{row["netQty"]}</div>
              <div className="py-1 px-1">{row["avgPrice"]}</div>
              <div className="py-1 px-1">{row["totCh"]}</div>
              <div className="py-1 px-1">{row["ltp"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["calPrf"]}
              </div>
              <div className="py-1 px-1">{row["buyVal"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["realized_profit"]}
              </div>
              <div
                className={`py-1 px-1 ${
                  row["unrealized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["unrealized_profit"]}
              </div>
                  
                  
                  
                    </>}
             
               </div>
               </SwipeableRow>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-11 text-sm text-gray-800 p-2">
            No positions found
          </div>
        )}

        
     

     
    </div>)
         
     }
           
   
      {isMobile &&  
         (
        <div className="grid gap-3 mt-3">
          {data.map((row, index) => (
            <div
              key={index}
              className="border rounded-xl p-3 shadow-sm bg-white"
            >
              <SwipeableRow
                            onClose={() => handleClosePosition(row)}
                            onModify={() => handleModifyPosition(row)}
                          >
                             
              <div className="font-semibold">{row["symbol"]}</div>
              <div className="text-sm mt-2 space-y-1">
                <div>Avg Price: <strong>{row["avgPrice"]}</strong></div>
                <div>Qty: <strong>{row["netQty"]}</strong></div>
                <div>LTP: <strong>{row["ltp"]}</strong></div>
                <div>
                  P&L:{" "}
                  <strong
                    className={row["unrealized_profit"]>= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {row["unrealized_profit"]}
                  </strong>
                </div>
              </div>
               </SwipeableRow>
            </div>
          ))}
           </div>
      )}
     </>




  );
// {/*<div className="w-full max-w-8xl mx-auto pt-[10px] md:p-8 font-sans"> */}
// <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-3">
// <div className="relative flex flex-col sm:flex-row p-1 bg-gray-100/80 rounded-xl gap-1">
  return (
  
   <>
     
        
        {/* TAB NAVIGATION */}
       
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div  key={tab.id} className="relative flex flex-col sm:flex-row p-1 bg-gray-100/80 rounded-xl gap-1">
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "tab2") startStreaming();
                }}
                className={`
                  relative flex items-center justify-center gap-2 flex-1 
                  py-2.5 px-4 rounded-lg text-sm font-bold transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {/* Framer Motion Background Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Content stays above the background pill */}
                <span className="relative z-10 flex items-center gap-2">
                  {React.cloneElement(tab.icon, { 
                    className: isActive ? 'text-blue-600' : 'text-gray-400' 
                  })}
                  {tab.label}
                  {tab.id === "tab2" && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </span>
              </button></div>
            );
          })}
      

        {/* TAB CONTENT WITH ANIMATION */}
        <div className="mt-6 min-h-[300px] px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
               {activeTab === "tab1" && renderNormalFetchTable(computedSocketData)}  {/*sortedData */}
                {activeTab === "tab2" && renderTable(computedSocketData)} {/* can pass diff dataset */}
              
            </motion.div>
          </AnimatePresence>
     </div>
    
    </>
  
  );
  //     </div>
  //  </div>
  //{/* </div>*/}
});
export default PositionsTabs;
