 
import React, {Suspense, useEffect , useState,useMemo, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 

  RefreshCw, 
  Layers, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { ToggleLeft, Activity } from 'lucide-react';
import { CommonConstants } from "@/utils/constants";
import { StorageUtils } from "@/libs/cache";
import {disableLoader, enableLoader} from "@/redux/slices/miscSlice"
//import React, {useEffect, useState} from 'react'
import positionBook from './positionsample.json';
import './positionstyles.css'; // ✅ No 'positionstyles.'
import {useDispatch, useSelector} from 'react-redux';
import { getPositionData } from "./positionGridBook.actions";
import { startEventSource } from "./loginFeed.actions";
import { startEventOrderSource } from "./quickOrderFeed.actions";
import { orderBookData } from "./orderBook.actions";
import { savePositionBook } from '@/redux/slices/positionSlice';
import {API, FYERSAPI, FYERSAPILOGINURL} from "@/libs/client"

import StreamToggleButton from '../tradeGrid/StreamToggleButton';
//import Fyersmarketfeed from '../tradeGrid/Fyersmarketfeed';
import FyersEventSourceFeed from '../tradeGrid/FyersEventSourceFeed';
import CustomOptionFeed from '../tradeGrid/CustomOptionFeed';
import QuickOrderBook from '../quickorder/QuickOrderBook';
import CancelOrderButtonWithSuspense from './CancelButton';
import PlaceOrderButton from './PlaceOrderButton';
import PositionsTabs from './PositionsTabs';
import SellPlus2Order from './SellPlus2Order';
import FetchPositionButton from './FetchPositionButton';
import IndexCard from './IndexCard';
import isEqual from 'lodash.isequal';
//CUSTOME HOOK to DETECT MOBILE 
//import { useIsMobile } from "./useIsMobile";
 import   useIsMobile   from "../tradeGrid/useIsMobile";
 import OptionChainSwipeUI from "./optionchain/OptionChainSwipeUI"; // ✅ import the big component
 import OptionChainTable from "./optionchain/OptionChainTable"; // ✅ import the big component
 //import OptionChainTable from "./optionchain/OptionChainTable"; // ✅ import the big component
 import OptionChainTableSideway from "./optionchain/OptionChainTable-Sideway"; // ✅ import the big component
 import OptionChainTableSingleUI from "./optionchain/OptionChainTableSingleUI"; // ✅ import the big component
import OptionChainTabs from "./optionchain/OptionChainTabs";

import  {  PositionBookMobileView as  MobileView }   from "./PositionBookMobileView";
const PositionRow = {
  symbol: undefined,
  productType: undefined,
  netQty:undefined,
  avgPrice: undefined,
  calPrf: undefined,
  totCh:undefined,
  ltp:  undefined,
  realized_profit: undefined,
  buyVal:  undefined,
  unrealized_profit:  undefined,
};
/*const  PositionRow {
  symbol: string;
  productType: string;
  netQty: string;
  avgPrice: string;
  totCh: string;
  ltp: string;
  realized_profit: string;
  buyVal: string;
  unrealized_profit: string;
}*/



const PositionGrid = ({   positionDataB   }) => {
  StorageUtils._save(CommonConstants.positionDataCacheKey,CommonConstants.samplePositionDataVersion1);
  // QUICK ORDER BOOK DEFAULT initialization 
   StorageUtils._save(CommonConstants.quickOrderBookDataCacheKey,CommonConstants.sampleOrderBookDataVersionNonString1);
      const tickerMap = useSelector(state => state.ticker.tickerMap);
      const streamOrderBook = useSelector(state => state.ticker.orderBook);
   const currentPlatform = useSelector((state ) => state.misc.platformType)
   const [streamOrderData, setStreamOrderData] = useState();
   const [parsedData, setParsedData] = useState(() =>  
     {  try {             // recentPositionnsKey is updated by the grid.action fetchMoreStocks function on click of Load More.
        let g = JSON.parse(StorageUtils._retrieve(CommonConstants.recentPositionsKey).data);

         if(g !==null && g!==undefined && Array.isArray(g)){
             return g;
          }
         else {
            g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey).data);
           if(g !==null && g!==undefined && Array.isArray(g)){
             return g;
           }
          else {
            g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey));
            if(g !==null && g!==undefined && Array.isArray(g)){
              console.log(` Position Grid: parsedData : CommonConstants.positionDataCacheKey ${CommonConstants.positionDataCacheKey} ::  ${JSON.stringify(g)} `); 
              return g;
            }
            else {
             console.log(` Position Grid:  parsedData :  CommonConstants.positionDataCacheKey ${CommonConstants.positionDataCacheKey} :: [] `); 
    
              return [];
            }
          }
          }  
           }
        catch(ere){
          console.log(` Position Grid: parsedData : CommonConstants.positionDataCacheKey ${CommonConstants.positionDataCacheKey} :: not available set to [] `); 
          return [];
        }
      });
   // useState(() => []);//StorageUtils._retrieve(CommonConstants.positionDataCacheKey).data
     const [platformType, setPlatformType] = useState('1')
       const [isOrderPolling, setOrderPolling] = useState(false);
       const [showOrdersModal, setShowOrdersModal] = useState(false);
          const [selectedSymbol, setSelectedSymbol] = useState(null);
      const tableRef = useRef(null);
        const [tooltipData, setTooltipData] = useState(null);
        const [sellPlusSymbol, setSellPlusSymbol] = useState(null);
        const [netBought, setNetBought] = useState(0);
        const [symbolAvgPrice, setSymbolAvgPrice] = useState(0);
        const [symbolSoldQty, setSymbolSoldQty] = useState(0);
        const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
       const [showTooltip, setShowTooltip] = useState(false);
       const tooltipRef = useRef(null);
       /* REMOVED for TIME BEING 
       (prev ) => {
        let g = JSON.parse(StorageUtils._retrieve(CommonConstants.quickOrderBookPollingKey).data);
           if(g !== null && g !== undefined ){
              return true;
           }else {
            return false;
           }

        } 
         
       */
       const [colorSENSEXClass, setColorSENSEXClass] = useState("bg-gray-100 text-black");
           const [colorNIFTYClass, setColorNIFTYClass] = useState("bg-gray-100 text-black");
         const [colorBankNIFTYClass, setColorBankNIFTYClass] = useState("bg-gray-100 text-black");


   const [data, setData] = useState(positionDataB);
    //   const [positionData ,setPositionData] = useSelector((state ) => state.position.positionBook)
     let  positionData   = useSelector((state ) => state.position.positionBook)
     let  positionTickerData   = useSelector((state ) => state.position.positionTicker)
   const [positions ,setTrades ] =  useState ([]);
     const [sortColumn, setSortColumn] = useState(null); // e.g., "symbol"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
    let globalUserCheck  = undefined;
    let globalUserTrades  = undefined;
   const [userLogged , setUserLogged ] = useState(false);
   // CHECK MOBILE OR DESTOP
   const isMobile = useIsMobile();
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

  useEffect(() => {
    // INITIALIZE the META DATA like INDICES CONSTANTS IN LOCALSTORAGE
 // SET the default INDICES 
        StorageUtils._save(CommonConstants.marketFeedDataCacheKey, CommonConstants.sampleObjTickerTDataVersion1);


  },[]);

   // Close tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        setTooltipData(null);
         setShowTooltip(false);
      }
    };

    if (tooltipData) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipData]);

 useEffect(() => {
    let isMounted = true;

    const fetchParsedData = () => {
      try {
        let g =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)  || "null" ;
        let positions = undefined;
          const dataFromCache = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
         if( g['data'] !== ''  && g['data'] !== null && g['data'] !==undefined){
         //            console.log(" recentTrades  position data empty "+JSON.stringify(g))
                     let tr = JSON.parse((JSON.stringify(g)));
                     if(tr !==null && tr !== undefined ){
                         if(tr['data'] !==null && tr['data']!== undefined ){
                           positions =tr['data'];
                     //       console.log(" positions useEffect   ")

                         }
                     }
                     
            }else {
               console.log("position data fro cahce "+JSON.stringify(dataFromCache))
               positions = JSON.parse(dataFromCache.data) ;
            }



        if (positions && Array.isArray(positions)) {
          setParsedData(positions);
         //  console.log("..........positions grid recentPositions polled parsedData updated")
          return;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey)?.data || "null");
        if (g && Array.isArray(g)) {
          setParsedData(g);
          return;
        }

        g = JSON.parse(StorageUtils._retrieve(CommonConstants.positionDataCacheKey) || "null");
        if (g && Array.isArray(g)) {
          setParsedData(g);
          return;
        }

        setParsedData([]);
      } catch (err) {
        setParsedData([]);
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
     // console.log(`Next poll in ${delay / 1000}s`);
      timeoutId = setTimeout(() => startPolling(i + 1), delay);
    };

    // start from iteration 0
    startPolling(0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);



 const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
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
  // SET the parsedDATA =>
  setParsedData( dataToSort);
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
}, [parsedData, sortColumn, sortDirection]);
const handleFetchComplete = (newData) => {
  if (!isEqual(parsedData, newData)) {
    setParsedData([...newData]);
  }
};

function callBackOrderStreamData (ordersFeed) {
 if(ordersFeed !==null && ordersFeed !==undefined && Array.isArray(ordersFeed)){
      let pendingOrdersFeed = ordersFeed.filter(or => or.status === 6 );
       console.log("Position Grid  : quick Order FEED ACTION pending orders ");
       console.log(JSON.stringify(pendingOrdersFeed));
      setStreamOrderData(ordersFeed);
     /* setComputedSocketData((oldBook) =>    [
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
       } */
       // check if pending orders are fetched by orderbook.actions 
       // set it as is to the computedSocketData
         console.log("checking pending orders actual with status 6 : fetched by orderbook.actions in case quickOrderFeed.action is wrong "+JSON.stringify(pendingCancelableOrders));
        let pOrders =    StorageUtils._retrieve(CommonConstants.orderBookOrderDataCacheKey)
          if(pOrders !==null && pOrders !==undefined &&  pOrders['data'] !== ''  && pOrders['data'] !== null && pOrders['data'] !==undefined){      
                  setStreamOrderData(pOrders['data']);
       // setComputedSocketData(ordersFeed);
          }
         
          console.log("Position Grid   : UPDATES FOUND in  Quick ORDER  FEED ACTION ");
    }
    else {

      console.log(" Position Grid   :  No updates in Quick ORDER ACTION ");
    }

}
function callBackFeedData (feedColors) {
  if (feedColors !==null && feedColors !== undefined) {
      // setParsedData([...newData]);
      try {
      feedColors =JSON.parse(feedColors) //feedColors
     let colorSENSEX = feedColors.colorSENSEX;
      let colorBank = feedColors.colorBank;
     let  colorNifty = feedColors.colorNifty;

      setColorBankNIFTYClass((pre) => pre = colorBank)
       setColorNIFTYClass((pre) => pre = colorNifty)
       setColorSENSEXClass((pre) => pre = colorSENSEX)
        }catch(er){
           console.log(" color feed object issue from FyersEventSourceFeed Button")
        }
  }
  else {
      
  }

}
const handleFeedData = (feedColors) => {
  if (feedColors !==null && feedColors !== undefined) {
      // setParsedData([...newData]);
      try {
      feedColors =JSON.parse(feedColors) //feedColors
     let colorSENSEX = feedColors.colorSENSEX;
      let colorBank = feedColors.colorBank;
     let  colorNifty = feedColors.colorNifty;

      setColorBankNIFTYClass((pre) => pre = colorBank)
       setColorNIFTYClass((pre) => pre = colorNifty)
       setColorSENSEXClass((pre) => pre = colorSENSEX)
        }catch(er){
           console.log(" color feed object issue from FyersEventSourceFeed Button")
        }
  }
  else {
      
  }
};
const handleCustomFeedData = (feedColors) => {
  if (feedColors !==null && feedColors !== undefined) {
      // setParsedData([...newData]);
      try {
      feedColors =JSON.parse(feedColors) //feedColors
     let colorSENSEX = feedColors.colorSENSEX;
      let colorBank = feedColors.colorBank;
     let  colorNifty = feedColors.colorNifty;

      //setColorBankNIFTYClass((pre) => pre = colorBank)
      /// setColorNIFTYClass((pre) => pre = colorNifty)
      // setColorSENSEXClass((pre) => pre = colorSENSEX)
        }catch(er){
           console.log(" color feed object issue from CustomOptionFeed Button")
        }
  }
  else {
      
  }
};
function getTotalQuantityBySymbol(orderList, symbol) {
  return orderList.reduce((sum, order) => {
    if (order.symbol === symbol) {
      // ensure qty is treated as an integer
      const qty = parseInt(order.qty, 10);
      if (!isNaN(qty)) {
        sum += qty;
      }
    }
    return sum;
  }, 0);
}
const fetchPendingOrders =async (symbol) => {

       // CLEAR THE CACHE and FETCH 
        StorageUtils._save(CommonConstants.pendingOrderDataCacheKey,"");
       // CLEAR THE render cancel STAtUS
      /// setRecentOrderStatus((prev) => prev = '');
       // FETCH the ORDER BOOK DATA ALSO ONCE 
       dispatch(orderBookData(''));
       // RE-FRESH the cancel order CACHE localstore data
       //using timeout here to wait till the cancel order list is fetched from server 
       // this make keep poping pending order modal be sure 
       setTimeout( ()=> {   
           fetchPlacedOrders(symbol)
          
       },3500) ;
      
}
 const fetchPlacedOrders = (searchPendingOrdersSymbol) => { 
   // , JSON.stringify(pendingCancelableOrders) from orderBook.actions
  let placedOrders =   StorageUtils._retrieve(CommonConstants.pendingOrderDataCacheKey);
   if(placedOrders !==null && placedOrders !== undefined){
    let orderBook = placedOrders.data;
    if(orderBook !==null && orderBook !== undefined){
      let isValidCancelOrdersJSON = false;
     try {
          const parsedObject = JSON.parse(orderBook);
            console.log("Position Grid : Sell quick -> fetchPlacedOrders parsedObject " +parsedObject);
            isValidCancelOrdersJSON= true;
         if(Array.isArray(parsedObject) && parsedObject.length >0){
          // reset the orderList 
          let orderList = []
          // create list of short id , symbol qty , limitPrice objects 
           parsedObject.forEach(validOrd => { 
               let id = validOrd.id;
               let symbol = validOrd.symbol;
               let qty = validOrd.qty;
               let limitPrice = validOrd.limitPrice;
              const freshOrder = {   id: id, qty: qty , symbol:symbol, limitPrice:limitPrice }; // fresh copy
              console.log("New independent order:", freshOrder);
              if(searchPendingOrdersSymbol === symbol)
              { orderList.push(freshOrder);
                } 
           })
           // set the new OrderShortList
            setPendingOrderShortList( prev => prev= orderList);
           // calculate the qty remaining to be soled fro the SYMBOL 
            let symbolQtyPlaced  =  getTotalQuantityBySymbol(orderList, symbol);
             setSymbolSoldQty(pre => pre = symbolQtyPlaced);
           // THIS SOLD QTY is not being impact on the Sell2Order button variables passed
           // SO place in the StorageUtils.
         } 
         else {  // empty no pending orders then 
            setPendingOrderShortList([]);
               console.log ("Position Grid : Sell quick -> no fresh pending orders ");
         }  
      }   
      catch(err){
            isValidCancelOrdersJSON = false;
            console.log("no valid positions data re-login or refresh ");
      }
       setShowTooltip(true);     
       setTooltipData(searchPendingOrdersSymbol);
      console.log("Position Grid : Sell quick -> prefetch OrderBook multiple orders saved to pendingOrderDataCacheKey  ");
    }
   }
   else {
       console.log ("Position Grid : Sell quick -> the  pending orders are emtpy clearing the previous cahced order");
      // setOrderShort(null);
       setPendingOrderShortList([]);
       setSymbolSoldQty(pre => pre = 0);
       setShowTooltip(true);     
       setTooltipData(searchPendingOrdersSymbol);
   }           

 }

//  HANDLE  CONVERT TO MARGING 
const handleSymbolClickOld = (symbol) => {
  setSelectedSymbol(symbol);
  setShowOrdersModal(true);
};
 const handleSymbolClick = async (event, symbol, costPrice ,netBought) => {
   if(showTooltip ) { 
      setShowTooltip(false);
       setTooltipData(null);
       setSellPlusSymbol(null);
    }
    else {
     // fetch pending orders 
     // since this is a sell plus tool tip 
     // qty placed for sell must be before hand calculated .
     // NO POINT waiting to fetch the sold QTY the SellPlus2 will default display NetGouht QTY only 
     // so Commenting out 
    // await fetchPendingOrders(symbol);

     // SINCE above fetchPendingOrders(symbol); is commented we directly show tooltip
      setShowTooltip(true);     
       setTooltipData(symbol);
     // the Tool Tip Sell Plus will only be visible after order book is properly fetched 
     // there is a time out of 3 seconds after which the 
     // tooltip shall display automatically 
        setSellPlusSymbol(symbol);
        setNetBought(netBought);
        setSymbolAvgPrice(costPrice);
      let rect = event?.target?.getBoundingClientRect() !==undefined ? event?.target?.getBoundingClientRect(): {right :120, top :340} ;
    let tableRect = tableRef.current?.getBoundingClientRect() !==undefined ? tableRef.current.getBoundingClientRect(): {right :20, top :440} ;
     if(isMobile){
        tableRect = {right:25, top:650};
     }
        //  tableRef.current.getBoundingClientRect(); 
    console.log("handleSymbol Click "+JSON.stringify(rect)+ " "+JSON.stringify(tableRect));
    /*setTooltipData({
      symbol,
      x: rect.right - tableRect.left + 8, // place 8px to the right
      y: rect.top - tableRect.top,
    });*/
    let srcl=145;
    if( window.scrollY > 300){ 
        srcl = window.scrollY
          console.log("window.scrollY "+window.scrollY );
          console.log("y: rect.top "+rect.top );
         console.log("y: rect.top - srcl "+(rect.top - srcl));
    }
    else { 
        srcl = 1137;  
         console.log("window.scrollY "+window.scrollY );
           console.log("y: rect.top "+rect.top );
          console.log("y: rect.top - srcl "+ (rect.top - srcl)); 
    }
     if(isMobile){
            setTooltipPos({
      x: rect.right + 8, // 8px gap from the element
      y: rect.top - srcl,
      marginTop:  "4px",
      marginLeft: "31px" 
      /* marginTop: "-227px",
       marginLeft: "53px" */
    });

     }
     else { 
          setTooltipPos({
      x: rect.right + 8, // 8px gap from the element
      y: rect.top - srcl,
      marginTop:  "-44px",
      marginLeft: "111px" 
      /* marginTop: "-227px",
       marginLeft: "53px" */
    });

     }
  
   
   

    }

  };





const getSortIndicator = (column) =>
    sortColumn === column ? (sortDirection === "asc" ? " ▲" : " ▼") : "";


     useEffect(() => {
          // console.log("PositionTable:   " )
         
           // FETH The recentTRades from storage if above call succeeded data will be there
           let redentPositionData =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)
            const dataFromCache = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
            let positions = undefined;
            if( redentPositionData['data'] !== ''  && redentPositionData['data'] !== null && redentPositionData['data'] !==undefined){
               //      console.log(" recentTrades  position data empty "+JSON.stringify(redentPositionData))
                     let tr = JSON.parse((JSON.stringify(redentPositionData)));
                     if(tr !==null && tr !== undefined ){
                         if(tr['data'] !==null && tr['data']!== undefined ){
                           positions =tr['data'];
                     //       console.log(" positions SET to  tr['data'] ")

                         }
                     }
                     
            }else {
               console.log("position data fro cahce "+JSON.stringify(dataFromCache))
               positions = JSON.parse(dataFromCache.data) ;
            }
           let dataLocal   =   (positionDataB !== undefined && positionDataB.length !=0 ) ? positionDataB : positions;
           // console.log("position data  "+JSON.stringify(dataLocal))
            //console.log("position data length  "+ dataLocal.length )

             const validRow = Object.fromEntries(Object.keys(PositionRow).map(key => [key, undefined]));
               let isValidPositionJSON = false;
                try{
                      const parsedObject =  typeof dataLocal ==='string'? JSON.parse(dataLocal) : dataLocal;
                 //       console.log(parsedObject);
                        isValidPositionJSON= true;
                  }   
                  catch(err){
                        isValidPositionJSON = false;
                        console.log("no valid positions data re-login or refresh ");
                  }
            if (dataLocal !== null && Array.isArray(dataLocal) && dataLocal.length >0 && isValidPositionJSON ){
              let pendingRow  =[];
                 console.log(` dataLocal : ${JSON.stringify(dataLocal)}  `);
                 let  symbol = dataLocal[0]?.symbol,
                   productType = dataLocal[0]?.productType,
                    netQty= dataLocal[0]?.netQty,
                    avgPrice= dataLocal[0]?.avgPrice,
                    calPrf= dataLocal[0]?.calPrf,
                      totCh= dataLocal[0]?.totCh,
                       ltp= dataLocal[0]?.ltp,
                        realized_profit= dataLocal[0]?. realized_profit,
                         buyVal = dataLocal[0]?. buyVal,
                         unrealized_profit = dataLocal[0]?. unrealized_profit;  
                if ( symbol !==undefined && 
                     productType !==undefined && 
                     netQty !==undefined && 
                     avgPrice !==undefined && 
                     totCh !==undefined && 
                     ltp !==undefined && 
                     realized_profit !==undefined && 
                     buyVal !==undefined && 
                      unrealized_profit !==undefined  
                ){

                       dataLocal.map(({ symbol, productType, netQty, avgPrice,calPrf,  totCh, ltp, realized_profit, buyVal, unrealized_profit }) => {
                  if (parseInt(netQty) !==0 && parseInt(unrealized_profit) !==0 ){
                      //  console.log(`  Qty ${netQty},  Unrealized ${unrealized_profit}`);
                      validRow.symbol = symbol; validRow.productType=productType;  validRow.netQty=netQty; validRow.avgPrice=avgPrice;
                    validRow.totCh=totCh; validRow.ltp=ltp; validRow.realized_profit=realized_profit; validRow.buyVal=buyVal;
                    validRow.unrealized_profit=unrealized_profit;validRow.calPrf=calPrf;
                   let ne = JSON.parse(JSON.stringify(validRow));
                                  pendingRow.push(ne);
                    return validRow;
                  }
              
              });
                }
                else {
                  console.log("either of the following attributes not present in the the Postino Row ")
                  console.log(`symbol  ,
                            productType ,
                     netQty ,
                     totCh ,
                     ltp ,
                     realized_profit ,
                     buyVal,
                      unrealized_profit,
                    `)
                  console.log(JSON.stringify(dataLocal[0]));

                }
           
             /*   pendingRow = pendingRow.filter(item => item !== null);
              console.log("pendingRow data  "+JSON.stringify(pendingRow))
            // MAP  the dataLocal , check if the all fields are undefined 
            const blankRow = Object.fromEntries(Object.keys(PositionRow).map(key => [key, undefined]));
            pendingRow.map((allPosit ) => {
                let   symbol  = allPosit["symbol"] ;
              let  productType  = allPosit["productType"] ;
               let netQty  = allPosit["netQty"] ;
                let avgPrice  = allPosit["avgPrice"] ;
                 let totCh  = allPosit["totCh"] ;
                  let ltp  = allPosit["ltp"] ;
                   let realized_profit  = allPosit["realized_profit"] ;
               let  buyVal  = allPosit["buyVal"] ;
                let  unrealized_profit   = allPosit["unrealized_profit"] ;
             console.log(`${symbol}: Qty ${netQty}, LTP ${ltp}, Unrealized ${unrealized_profit}`);
                  blankRow.symbol = symbol;blankRow.productType=productType; blankRow.netQty=netQty;blankRow.avgPrice=avgPrice;
                  blankRow.totCh=totCh;blankRow.ltp=ltp;blankRow.realized_profit=realized_profit;blankRow.buyVal=buyVal;
                  blankRow.unrealized_profit=unrealized_profit;
              });
               pendingRow = pendingRow.filter(item => item !== null);
               */
                   //      console.log(`pendingRow `+JSON.stringify(pendingRow));    
           const isAllUndefined = Object.values(pendingRow).every(val => val === undefined);
           if(!isAllUndefined ) {
            try { 
              dataLocal  = pendingRow;
            let parsed = dataLocal /// JSON.parse(data);
             setParsedData(parsed);
             setData(dataLocal)
             // console.log("position data typeof  "+ (typeof dataLocal ) )
            //   console.log("position data parsedData  "+ (typeof parsed ) )
            console.log("position data parsedData length  "+ (  parsed.length ) )
            /* parsed.map( rw => { 
                  console.log("   "+ JSON.stringify(rw) )  
                  console.log("  rw[0]  "+  rw[0] )  
                   console.log("symbol    "+  rw["symbol"] )  
             }   )*/
             }
             catch(er) {
                // show sample positions from json 
                  dataLocal  =   positionBook.value;
                   let parsed = positionBook.value;
                 setParsedData(parsed);
                  setData(dataLocal)
                console.log("sample  position data typeof  "+ (typeof dataLocal ) )
               console.log("sample position data parsedData  "+ (typeof parsed ) )
              console.log("sample position data parsedData length  "+ (  parsed.length ) )
             /*  parsed.map( rw => { 
                  console.log("   "+ JSON.stringify(rw) )  
                  console.log("sample  position  "+  rw[0] )  
                   console.log("sample symbol    "+  rw["symbol"] )  
             }   )*/

             }
            }
            else { 
                console.log("Postion stored or fetch and not FORMAT please re-fresh ")
            }
          }
          else {
            console.log("Positions fetched improper re-fresh the page ");
          }
       }, [positionDataB,savePositionBook]);
   /*{
    Instrument: positionDataB[0] || "SAMPLE",
    Quantity: positionDataB[1] || "102",
    Price: positionDataB[2] || "1202",
    "Trade Value": positionDataB[3] || "14203",
    "Product Type": positionDataB[4] || "F&O",
  };*/

    const logByPlatform = () => {
        // check platform type is alpha-vantage or fyers
        // currentPlatform
        if (currentPlatform !==  "fyers") {
            const apiKey = StorageUtils._retrieve(CommonConstants.platFormKey)
            if (apiKey.isValid && apiKey.data !== null) {
                
            }
            else {
                console.log("Fyers not logged in ");    
                try {
                    dispatch(enableLoader());

                   let fyerLoginProm =  ( async () => {
                        //{params: {function: 'TOP_GAINERS_LOSERS' , apikey:CommonConstants.apiKey}}

                      //let res =  await FYERSAPI.get('/fyerscallback' )
                      let res =   popupCenter(FYERSAPILOGINURL, "Fyers Signin")
                        return res;
                    }) ;
                    const result = Promise.all([    fyerLoginProm()]);
                     // run a interval to check the fyersToken 
                    globalUserCheck  =  setInterval( async() => {
                        let result =   await FYERSAPI.get('/fyersgloballogin' )
                  //      console.log("fyers login called ");
                        let data =    result.data.value;
                        StorageUtils._save(CommonConstants.fyersToken,data)
                        const res = StorageUtils._retrieve(CommonConstants.fyersToken);
                        if (res.isValid && res.data !== null  && res.data  !== undefined) {
                           
                            let auth_code = res.data['auth_code'];
                            if (auth_code&& auth_code !== null && auth_code !== undefined) {
                    //            console.log("User is Authorized ");
                                setUserLogged (true);
                               clearInterval(globalUserCheck);
                               dispatch(startEventSource(false , tickerMap,callBackFeedData));
                               dispatch(startEventOrderSource(false , streamOrderBook,callBackOrderStreamData));
                              // dispatch(orderBookData());
                            }
                            else{
                                console.log("User is awaiting authorization ");
                            }
                        }
                     },5000);

                   // const res = StorageUtils._retrieve(CommonConstants.fyersToken );
                    
                } catch (error) {
                    // @ts-ignore
                    const {message} = error
                    //toast.error(message ? message : "Something went wrong!")
                    console.log(error)
                    return error
                } finally {
                    dispatch(disableLoader())
                }

                //dispatch(loginFyers([]));
               
            }
           // const sortedData = [...gainers].sort((a: any, b: any) => {
           //     return parseFloat(b.change_amount) - parseFloat(a.change_amount)
           // })
           // dispatch(saveGainers(sortedData))
        } 

    }
      const dispatch = useDispatch();
    
        const popupCenter = (url , title ) => {
            const dualScreenLeft = window.screenLeft ?? window.screenX;
            const dualScreenTop = window.screenTop ?? window.screenY;
        
            const width =
              window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
        
            const height =
              window.innerHeight ??
              document.documentElement.clientHeight ??
              screen.height;
        
            const systemZoom = width / window.screen.availWidth;
        
            const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
            const top = (height - 550) / 2 / systemZoom + dualScreenTop;
        
            const newWindow = window.open(
              url,
              title,
              `width=${500 / systemZoom},height=${550 / systemZoom
              },top=${top},left=${left}`
            );
            newWindow?.window.addEventListener('load', () => {
                newWindow?.window.addEventListener('unload', () => {
                  //  console.log("unload the popup ")
                  // // clear the StorageUtils. fetchPositions
                  if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
                        //  localStorage.removeItem("yourKey");
                         StorageUtils._save(CommonConstants.fetchPositions, true);
                    } 


                   // ftech the globallogin boject 
                   let globaProm =    ( async () => { 
                     let login = await FYERSAPI.get('/fyersgloballogin'); 
                 //    console.log("fyers login called ");
                     return login;
                    }) 
                    const res = Promise.all([ globaProm()]);
                    res.then((values) => {
                        StorageUtils._save(CommonConstants.fyersToken,values)
                  //       console.log("fyers login token saved ")
                     //DON'T call immediately as Fyers Login make take time 
                     // so Using setTimeout or setInterval 
                       globalUserTrades  =  setInterval( async () => { 

                         //TRIIGER the position Book Fetch again 
                         //dispatch(getPositionData('adfg'));
                        let redentPositionData =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)
                                const dataFromCache = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
                          let positions = undefined;      
                         if( redentPositionData['data'] !== ''  && redentPositionData['data'] !== null && redentPositionData['data'] !==undefined){       
                                  console.log("positions "+JSON.stringify(redentPositionData))
                                  let tr = JSON.parse((JSON.stringify(redentPositionData)));
                                  if(tr !==null && tr !== undefined ){
                                      if(tr['data'] !==null && tr['data']!== undefined ){
                                        positions =tr['data'];
                                          console.log(" positions   ")

                                      }
                                  }
                                  
                                }else {
                                console.log("position data fro cahce ")
                                  positions = dataFromCache.data;
                                }
                                console.log(" PositionGrid after login state.position.positionBook "+JSON.stringify(positionData))
                            
                            
                                let positionLocal  =   positionData !== undefined? positionData : positions;

                        if ( positionLocal   !== null && positionLocal !==undefined){
                          let isValidPositionJSON = false;
                             try{
                                    const parsedObject =  typeof dataLocal ==='string'? JSON.parse(dataLocal) : dataLocal; //  JSON.parse(positionLocal?.data);
                                      console.log(parsedObject);
                                      isValidPositionJSON= true;
                                }   
                                catch(err){
                                     isValidPositionJSON = false;
                                      console.log("no valid positions data re-login or refresh ");
                                }

                            if (positionLocal?.data !== null  && isValidPositionJSON ){
                               
                              console.log("positionLocal data   "+JSON.stringify(positionLocal));
                              

                             const validRow = Object.fromEntries(Object.keys(PositionRow).map(key => [key, undefined]));
                              let  pendingRow  = [];
                               positionLocal.map((onePos) => {
                               const { symbol, productType, netQty, avgPrice, calPrf ,  totCh, ltp, realized_profit, buyVal, unrealized_profit } = onePos;
                               if (parseInt(netQty) !==0 && parseInt(unrealized_profit) !==0 ){
                                      console.log(`  Qty ${netQty},  Unrealized ${unrealized_profit}`);
                                   validRow.symbol = symbol; validRow.productType=productType;  validRow.netQty=netQty; validRow.avgPrice=avgPrice;
                                 validRow.totCh=totCh; validRow.ltp=ltp; validRow.realized_profit=realized_profit; validRow.buyVal=buyVal;
                                 validRow.unrealized_profit=unrealized_profit;
                                 validRow.calPrf = calPrf;
                                   let ne = JSON.parse(JSON.stringify(validRow));
                                  pendingRow.push(ne);
                                 return validRow;
                               }
                            
                                
                            });

                            // MAP  the dataLocal , check if the all fields are undefined 
                          const blankRow = Object.fromEntries(Object.keys(PositionRow).map(key => [key, undefined]));
                         /* pendingRow.map((allPosit) => {
                                      let   symbol  = allPosit["symbol"] ;
                            let  productType  = allPosit["productType"] ;
                            let netQty  = allPosit["netQty"] ;
                              let avgPrice  = allPosit["avgPrice"] ;
                              let totCh  = allPosit["totCh"] ;
                                let ltp  = allPosit["ltp"] ;
                                let realized_profit  = allPosit["realized_profit"] ;
                            let  buyVal  = allPosit["buyVal"] ;
                              let  unrealized_profit   = allPosit["unrealized_profit"] ;
                                console.log(`${symbol}: Qty ${netQty}, LTP ${ltp}, Unrealized ${unrealized_profit}`);
                                blankRow.symbol = symbol;blankRow.productType=productType; blankRow.netQty=netQty;blankRow.avgPrice=avgPrice;
                                blankRow.totCh=totCh;blankRow.ltp=ltp;blankRow.realized_profit=realized_profit;blankRow.buyVal=buyVal;
                                blankRow.unrealized_profit=unrealized_profit;
                            });
                            */
                          

                          //=   /// Object.fromEntries(Object.keys( validRow).map(key => [key=="netQty", undefined]));

                          console.log(`pendingRow `+JSON.stringify(pendingRow));    

                        const isAllUndefined = Object.values(pendingRow).every(val => val === undefined);
                         
                          if(!isAllUndefined ) {      
                          //  setPositionData( blankRow);;
                            positionData = pendingRow;
                            if(positionData !==undefined &&  Array.isArray(positionData ) ){
                              console.log(`final valid positions  `+JSON.stringify(pendingRow));    
                                setTrades( positionData );
                                  setParsedData(positionData);
                            }
                            else if(redentPositionData.data !==undefined &&  Array.isArray(redentPositionData.data )) {
                            console.log("PositionGrid after login recenTrades  "+JSON.stringify(redentPositionData.data))
                                setTrades( redentPositionData.data );
                                   setParsedData(redentPositionData.data );
                            }
                          } 
                          else {
                              setTrades( [] );
                                  setParsedData([]);
                            console.log("Positions Data Improper refresh the Page ")
                              //StorageUtils._save(CommonConstants.fetchPositions, true);
                          } 
                          }  // positionLocalData.data
                        } // positionLocalData
                            clearInterval(globalUserTrades);
                         }   ,5000);

                    })
                   
                    // window.location.reload();
                });
            });
            
            newWindow?.focus();
          };
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
       ///  fetchFreshOrdersToCancel();  will trigger in QuickOrder Book 
          console.log("started polling  orders ");
    } else {
         console.log("stopped polling  orders ");
      }
   }
   else {
        console.log("User not logged in ");
   } // AUTH CODE 
  }
};
   


  return (
    <div className=" w-full bg-zinc-100"> {/* overflow-x-auto removed for horizontal scrooll  */}
    
      <div className="p-4 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">

           {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Positions
            </h1>
          </div>

            {/* Broker Selector & Main Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">  {/* { isMobile ? "mb-2 md:flex flex justify-between relative items-center"  : "md:flex flex justify-between relative items-center" } */}
              <select 
                value={platformType}
                onChange={(e) => {
                                    if (e.target.value == '1') {
                                        console.log(" selected " + e.target.value)
                                    } else {
                                        logByPlatform()
                                        console.log(" selected " + e.target.value)
                                    }
                                    setPlatformType(e.target.value)
                  }}  
                className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="1">Alpha-Vantage</option>
                <option value="2">Fyers</option>
              </select>
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95">
              <RefreshCw className="w-4 h-4" />
              
              <span><FetchPositionButton onFetchComplete={ handleFetchComplete}
                         sortedData={sortedData} updateSoldQty={fetchPendingOrders} /></span>
            </button>
          </div> 

        </div>
      {/* <div className="hidden md:flex flex justify-between  relative items-center">*/}
      
       {/*  CLICK MARKET DATA   TICKER FOR 3 BANKNIFY NIFTY and SENSEX  */}      
   {/*  <div className="hidden md:flex relative items-center">
                   
                    
               <i className="iconsax" type="linear" stroke-width="1.5" icon="toggle-off-square">Stream MARKET DATA</i>

                <p id="sensex-status"> 
                <span id="sensex-time"  style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}> </span>
                <span id="sensex-symbol"  style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}> </span>
                <span id="sensex-price"  style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}> </span>
             </p>
                 <p id="banknifty-status"> 
                <span id="banknifty-time"  style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}> </span>
               <span id="banknifty-symbol"  style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}> </span>
               <span id="banknifty-price"  style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}> </span>
             </p>
            <p id="nifty-status"> 
                <span id="nifty-time"  style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}> </span>
                <span id="nifty-symbol"  style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}> </span>
                <span id="nifty-price"  style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}> </span>
             </p>
      </div> */}
       {/* Stream Market Data */}
       {/* Real-time Indices Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndexCard  spanId="sensex-price" statusId="sensex-status" 
            label="SENSEX" 
            symbol="BSE:SENSEX-INDEX" 
            data={tickerMap['BSE:SENSEX-INDEX']} 
            colorClass={`${colorSENSEXClass}`} timeId="sensex-time"
          />
          <IndexCard  spanId="banknifty-price" statusId="banknifty-status"
            label="BANKNIFTY" 
            symbol="NSE:NIFTYBANK-INDEX" 
            data={tickerMap['NSE:NIFTYBANK-INDEX']} 
            colorClass={`px-1 py-1 rounded bg-gray-100 ${colorBankNIFTYClass}`} timeId="banknity-time"
          />
          <IndexCard  spanId="nifty-price" statusId="nifty-status"
            label="NIFTY 50" 
            symbol="NSE:NIFTY50-INDEX" 
            data={tickerMap['NSE:NIFTY50-INDEX']} 
            colorClass={`px-1 py-1 rounded bg-gray-100 ${colorNIFTYClass}`} timeId="nifty-time"
          />
        </div>
          <br/>
          <div className="flex justify-end ">  
            <div  className="flex justify-between  gap-x-4 items-center"> 
             
              <div className="flex justify-end">  
                 <QuickOrderBook orderBookDataB={[]} pollOrderBook ={isOrderPolling} />  {/* it will fetch the orderbook from the useeffect  */}
                </div>
            </div>
           </div>

      
      </div>  {/* max w 7xl */}

       <div className="p-1 justify-start mx-auto">   {/* p-4 max-w-3xl  */}
          {/* text-center mb-6 */}
          {/*<h4 className="text-2xl font-bold "> 
            Option Chain 
          </h4>*/}
          
          {/* ✅ drop in the main option chain component OptionChainTableSideway OptionChainTable <OptionChainSwipeUI /><OptionChainTableSingleUI/>
        */}
        <div className="min-h-screen bg-gray-50 pt-[14px]">
          <OptionChainTabs positionData={parsedData} />
        </div>
       </div>
       <div className="max-w-7xl mx-auto space-y-1"> 
        <PositionsTabs   sortedData={sortedData} paredData={parsedData}  sortedSocketData={parsedData}
            userLogged={userLogged}
            handleSort={handleSort}
            getSortIndicator={getSortIndicator}
            handleSymbolClick={handleSymbolClick}   tableRef={tableRef}/>
       
       </div>


        {showOrdersModal && (
  <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[320px] max-w-[90%] border border-gray-200">
            <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center">
              Place Orders for <span className="text-blue-700">{selectedSymbol}</span>
            </h3>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              
             {/* <button className="bg-brandgreen text-white text-xs px-3 py-1 rounded hover:bg-red-600">
                SELL +2
              </button> */}
              <button className="bg-brandgreen text-white text-xs px-3 py-1 rounded hover:bg-red-600">
                SELL +5
              </button>
              <button className="bg-brandgreen text-white text-xs px-3 py-1 rounded hover:bg-red-600">
                SELL +10
              </button>
              <button className="bg-brandgreen text-white text-xs px-3 py-1 rounded hover:bg-yellow-600">
                CONVERT TO MARGIN
              </button>
            </div>

            {/* Cancel modal */}
            <button
              onClick={() => setShowOrdersModal(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      </>
    )}
      
           {/* Tooltip-style dialog bring on top so z-[99..]*/}
      {tooltipData && (
        <div   ref={tooltipRef}
          className="  inset-0  z-90 bg-white/90 border border-gray-300 rounded-lg shadow-lg p-2 w-[300px]"
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            marginTop : `${tooltipPos.marginTop}`,
              marginLeft : `${tooltipPos.marginLeft}`
          }}
        >
          <h4 className="text-xs font-semibold text-gray-700 mb-1">
            {tooltipData.symbol}
          </h4>

          <div className="flex  gap-1"> {/* flex-col */}
            {/* <button className="bg-brandgreen text-white text-xs px-2 py-1 rounded hover:bg-red-600"
             onClick={() => dispatchSellPlus2()} >
              SELL +2
              
            </button>*/} 
            <SellPlus2Order  isMobile ={  isMobile} sellPlusSymbol= {sellPlusSymbol} symAvgPrice={symbolAvgPrice} boughtQty={netBought}  qtySold={symbolSoldQty} />
            <button className="bg-brandgreen text-white text-xs px-2 py-1 rounded hover:bg-red-600">
              SELL +5
            </button>
            <button className="bg-brandgreen text-white text-xs px-2 py-1 rounded hover:bg-red-600">
              SELL +10
            </button>
            <button className="bg-brandgreen  text-white text-xs px-2 py-1 rounded hover:bg-yellow-600">
              CONVERT TO MARGIN
            </button>
          </div>

          <button
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setTooltipData(null)}
          >
            Close
          </button>
        </div>
      )}




      </div>  {/* min-h-screen */}
             
{/*<div className="overflow-x-auto w-full">
  <table className="min-w-full table-auto text-sm border-collapse">
    <thead className="bg-gray-200 text-gray-700">
      <tr>
        <th className="px-4 py-2 text-left">Instrument</th>
        <th className="px-4 py-2 text-left">Product Type</th>
        <th className="px-4 py-2 text-left">Quantity</th>
        <th className="px-4 py-2 text-left">Price</th>
        <th className="px-4 py-2 text-left">Time</th>
        <th className="px-4 py-2 text-left">Trade Value</th>
        <th className="px-4 py-2 text-left">Buy/Sell</th>
      </tr>
    </thead>
    <tbody>
      <tr className="bg-green-300">
        <td className="px-4 py-2">NIFTY25JUL24500CE</td>
        <td className="px-4 py-2">INTRADAY</td>
        <td className="px-4 py-2"></td>
        <td className="px-4 py-2">248.88</td>
        <td className="px-4 py-2">13:55:12</td>
        <td className="px-4 py-2">18666.00</td>
        <td className="px-4 py-2">BUY</td>
      </tr>
      <tr className="bg-green-300">
        <td className="px-4 py-2">NIFTY25JUL24500CE</td>
        <td className="px-4 py-2">INTRADAY</td>
        <td className="px-4 py-2"></td>
        <td className="px-4 py-2">246.38</td>
        <td className="px-4 py-2">13:53:02</td>
        <td className="px-4 py-2">18478.50</td>
        <td className="px-4 py-2">BUY</td>
      </tr>
      <tr className="bg-green-300">
        <td className="px-4 py-2">NIFTY2580725100PE</td>
        <td className="px-4 py-2">INTRADAY</td>
        <td className="px-4 py-2"></td>
        <td className="px-4 py-2">382.6</td>
        <td className="px-4 py-2">13:51:22</td>
        <td className="px-4 py-2">28695.00</td>
        <td className="px-4 py-2">SELL</td>
      </tr>
      <tr className="bg-red-300">
        <td className="px-4 py-2">NIFTY25JUL24500CE</td>
        <td className="px-4 py-2">INTRADAY</td>
        <td className="px-4 py-2"></td>
        <td className="px-4 py-2">249.9</td>
        <td className="px-4 py-2">13:50:11</td>
        <td className="px-4 py-2">18742.50</td>
        <td className="px-4 py-2">SELL</td>
      </tr>
      <tr className="bg-green-300">
        <td className="px-4 py-2">NIFTY25JUL24500CE</td>
        <td className="px-4 py-2">INTRADAY</td>
        <td className="px-4 py-2"></td>
        <td className="px-4 py-2">241.85</td>
        <td className="px-4 py-2">13:48:33</td>
        <td className="px-4 py-2">18138.</td>
        <td className="px-4 py-2">BUY</td>
      </tr>
    </tbody>
  </table>
</div> */}
    

     




          








    </div>
  );
     
};

export default PositionGrid;
