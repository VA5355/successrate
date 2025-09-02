import React, { useState,  useRef , useEffect ,useMemo} from "react";
import {useDispatch, useSelector} from 'react-redux';
import { ToggleLeft, Activity } from 'lucide-react';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
import { orderBookData } from "../positionGrid/orderBook.actions";
import { startEventSource } from "../positionGrid/orderFeed.actions";
import { FYERSAPINSECSV ,FYERSAPIMARKETFEEDRENDER, FYERSAPI, FYERSAPIORDERSRENDER,  FYERSAPITICKERACCESTOKEN,   FYERSAPITICKERURL , FYERSAPITICKERURLCLOSE} from '@/libs/client';
import { placeCancelOrder , placeQuickCancelOrder ,updateTickerStatusFromCache ,stopSensexTickerData } from "../positionGrid/cancelOrder.actions";
import { updateOrderBook } from "@/redux/slices/tickerSlice";

export default function QuickOrderTable({ sortedSocketData , sortedDataP,isOrderPoll,
    
    parseStoreUtilsOrder,fetchOrdersBookDataCacheKey,setOrderGlobalPoll ,setUserLogged,setParsedDataP,userLogged,
    handleSortP, getSortIndicatorP, handleCancelP }) {
  const [activeTab, setActiveTab] = useState ("normal");
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
   if(parsedData !==undefined && parsedData !== null && Array.isArray(parsedData) && parsedData.length > 0){
     alsoUpdateComputedSocketData(parsedData);
   }
   if(sortedDataP  !==undefined && sortedDataP !== null && Array.isArray(sortedDataP) && sortedDataP.length > 0){
     alsoUpdateComputedSocketData(sortedDataP);
   }
    
}, []);


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
        await dispatch(placeQuickCancelOrder(orderId));
          //await dispatch(quickOrderBookData());
          fetchOrdersBookDataCacheKey()
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
 const renderNormalFetchTable = (data) => ( 
       <>
          {/* Table Header */}
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
        {filteredSocketData && filteredSocketData.length > 0 ? (
          filteredSocketData.map((row, index) => (
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
 );


  return (
    <> 
    <div  className="flex justify-between  gap-x-4 items-center"> 
          <button id="POLLORDERBOOK"
                    onClick={handleOrderBookPoll}
                    className={` flex items-start justify-start gap-2 px-1 py-2 h-[35px] rounded-lg mx-4 mt-1 font-semibold
                        hover:bg-blue-200 bg-brandgreenlight dark:text-white   ${
                        isOrderPolling
                        ? 'bg-green-400 '
                        : 'bg-brandgreenlight dark:text-white'
                    }`}
                    >
                    {isOrderPolling ? (
                        <Activity size={5} className=" animate-pulse " />
                    ) : (
                        <ToggleLeft size={5} className="text-gray-500" />
                    )}  
                        <span className="text-sm font-semibold font-medium" > {isOrderPolling ? 'Fetching' : 'Poll Orders'} </span>
                    </button>
        <div className="flex justify-end">  
            <div className="  bg-zinc-100 border border-gray-300 rounded-md w-[460px]">
               


                <div className="  bg-zinc-100  rounded-md w-[460px]">


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

                {/* Tab Content */}
                {activeTab === "normal" &&  renderNormalFetchTable(sortedData)}
               
               {activeTab === "streaming" && (<> 
                   <div id="quickOrdersHeader" style="display:none;" className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
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

                     <div  id ="quickOrders1"  style="display:none;" className="max-h-[200px] overflow-y-auto divide-y divide-gray-200 text-[11px] leading-[1.1rem]">
                      
                        <div id ="quickOrdersRow1"
                          
                          className={`grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] text-gray-800 transition
                            ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            hover:bg-gray-100
                            ${row.side === -1 || row.side === "-1" ? "order-row-sell" : "order-row-buy"}`}
                        >
                          <div id="quickOrdersSymbol" className="py-[1px] px-1 text-base font-bold truncate">
                            
                          </div>
                          <div className="py-[1px] px-1 text-base font-bold truncate">
                            <button
                              className="w-2 h-2 text-gray-600 hover:bg-gray-200"
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                 // have to check this 
                                }
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          <div id="quickOrdersQty" className="py-[1px] px-1 text-base font-bold">
                             
                          </div>
                          <div  id="quickOrdersLimitPrice" className="py-[1px] px-1 text-base font-bold">
                            
                          </div>
                          <div id="quickOrdersLp" className="py-[1px] px-1 text-base font-bold">
                           
                          </div>
                        </div>
                     
                    </div>
                     <div id="quickOrdersNoOrders" style="display:block;" className="text-gray-500 text-center py-2 text-[12px]">
                        No {activeTab === "normal" ? "normal" : "streaming"} orders
                      </div>
                   </>
                  
                  
                  
                  ) }
               
                {/* can pass diff dataset renderTable(computedSocketData)*/}
                </div>    
              <div id="QUICKORDERSTATUS" className="grid grid-cols-1 bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">

              </div>
          </div>

        </div>
     </div>





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
