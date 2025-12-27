// loginFeed.action.js 
import React, {useEffect, useRef,  useState } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
import "./loginFeedStyles.css";
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
// import { getIndicesTickerData  ,updateIndicesFromCache ,stopSensexTickerData } from "./threeIndicesFeed.actions";
import {useDispatch, useSelector} from 'react-redux';
import { saveSensexBook } from '@/redux/slices/tickerSensexSlice';  
import { saveNiftyBook } from '@/redux/slices/tickerNiftySlice';  
import { saveBankNiftyBook } from '@/redux/slices/tickerBankNiftySlice';  
import { savePositionTickerBook } from '@/redux/slices/positionSlice';  
import { updateTickerMap } from "@/redux/slices/tickerSlice";
import { store } from "@/redux/store";
import isEqual from 'lodash.isequal';
import { API, FYERSAPINSECSV ,FYERSAPIMARKETFEEDRENDER ,  FYERSAPITICKERACCESTOKEN,   FYERSAPITICKERURL , FYERSAPITICKERURLCLOSE} from '@/libs/client';

//const PositionLoginFeed = ({ onFeed , colorSensex , colorBank ,colorNifty}) => {
let  tickerData = undefined;

const  setTickerData  = (tg) =>{
    tickerData = tg;

  };
let  isConnected = undefined;
  const  setIsConnected  = (tg) =>{
    isConnected = tg;

  };
let   eventSourceRef = undefined;

//  const eventSourceRef = useRef(null);
let userAuthCode  = undefined;

  const  setUserAuthCode =(tg) =>{
    userAuthCode = tg;

  };
let isMarketFeed  = undefined;
  const   setIsMarketFeed  =  (tg) =>{
    isMarketFeed = tg;

  };
  let threeSec  = undefined;

  const  setThreeSec  =    (tg) =>{
    threeSec = tg;

  };
// const dispatch = useDispatch();

 let SENSEXTICKERDOMID = 'sensex-status';
 let SENSEXTICKERTIME = 'sensex-time';
 let SENSEXTICKERPRICE = 'sensex-price';
  let NIFTYTICKERDOMID = 'nifty-status';
 let NIFTYTICKERTIME = 'nifty-time';
 let NIFTYTICKERPRICE = 'nifty-price';
  let BANKNIFTYTICKERDOMID = 'banknifty-status';
 let BANKNIFTYTICKERTIME = 'banknifty-time';
 let BANKNIFTYTICKERPRICE = 'banknifty-price';
 let SYMBOL = 'SENSEX';
// let previousSENSEXPrice = null;  // PREVIOUS PRICE SENSEX 
let newSENSEXPrice  = 0;
 
  const  setNewSENSEXPrice  =  (tg) =>{ newSENSEXPrice=tg; };
let previousSENSEXPrice  = 0;
 const setPreviousSENSEXPrice  = (tg) =>{ previousSENSEXPrice=tg; };

  // store previous value without triggering re-render
  const previousSensexPriceRef =  (tg) =>{  }; //  useRef(null);
let colorSENSEXClass  = "bg-gray-100 text-black";
  const   setColorSENSEXClass  =   (tg) =>{   colorSENSEXClass= tg;    };  //useState("bg-gray-100 text-black");
// let previousNIFTYPrice = null;  // PREVIOUS PRICE NIFTY 
let newNIFTYPrice  = 0;
  const   setNewNIFTYPrice  = (tg) =>{ newNIFTYPrice=tg; };
let previousNIFTYPrice  = 0;  
   const   setPreviousNIFTYPrice  = (tg) =>{ previousNIFTYPrice=tg; };
let colorNIFTYClass  =  "bg-gray-100 text-black";     
  const   setColorNIFTYClass  =    (tg) =>{   colorNIFTYClass=  tg;    };   //useState( colorNifty);  useState("bg-gray-100 text-black");
  // store previous value without triggering re-render
  const previousNiftyPriceRef =   (tg) =>{   };  // useRef(null);
// let previousBankNIFTYPrice = null;  // PREVIOUS PRICE NIFTY 
let newBankNIFTYPrice  = 0; 
 const  setNewBankNIFTYPrice  = (tg) =>{  newBankNIFTYPrice =tg; };
 let previousBankNIFTYPrice  = 0; 
 const  setPreviousBankNIFTYPrice  = (tg) =>{  };
 let colorBankNIFTYClass  = "bg-gray-100 text-black";  
  const  setColorBankNIFTYClass  =  (tg) =>{  colorBankNIFTYClass  =  tg;    }; // useState("bg-gray-100 text-black");
  // store previous value without triggering re-render
  const previousBankPriceRef =  (tg) =>{  }; // useRef(null);



 let previousPrice = null;  // PREVIOUS PRICE  
let  stringMap  = null;
 let mt = [];
 let sensexQue = []; let niftyQue= []; let bankNiftyQue = [];
/*
   useEffect(() => {
    if (newSENSEXPrice === null) return;

    const prevPrice = previousSensexPriceRef.current;
    let priceElement = document.getElementById(SENSEXTICKERPRICE);
    if (prevPrice !== null) {
      if (newSENSEXPrice > prevPrice) {
       //  setColorSENSEXClass("bg-green-100 text-green-800"); // price up
        priceElement.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement.style.color ='white';
                            console.log('Sensex  gree price  ' );  
                             console.log('Sensex  gree price  ' );  
                              console.log('Sensex  gree price  ' );  
      } else if (newSENSEXPrice < prevPrice) {
       // setColorSENSEXClass("bg-red-100 text-red-800"); // price down
        priceElement.style.backgroundColor= 'red';
                            priceElement.style.color ='white';
                             console.log('Sensex  red  price  ' );  
                              console.log('Sensex  red  price  ' );  
                               console.log('Sensex  red  price  ' );  
      } else {
       // setColorSENSEXClass("bg-gray-100 text-black"); // no change
      }
    }

    // update previous price after comparison
    previousSensexPriceRef.current = newSENSEXPrice;
  }, [newSENSEXPrice]);

   useEffect(() => {
    if (newNIFTYPrice === null) return;

    const prevPrice = previousNiftyPriceRef.current;
    let priceElement = document.getElementById(NIFTYTICKERPRICE);
    if (prevPrice !== null) {
      if (newNIFTYPrice > prevPrice) {
       //  setColorNIFTYClass("bg-green-100 text-green-800"); // price up
        priceElement.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement.style.color ='white';
                            console.log('Nifty  gree price  ' );  
                             console.log('Nifty  gree price  ' );  
                              console.log('Nifty  gree price  ' );  
      } else if (newNIFTYPrice < prevPrice) {
       // setColorNIFTYClass("bg-red-100 text-red-800"); // price down
        priceElement.style.backgroundColor= 'red';
                            priceElement.style.color ='white';
                             console.log('Nifty  red  price  ' );  
                              console.log('Nifty  red  price  ' );  
                               console.log('Nifty  red  price  ' );  
      } else {
       // setColorSENSEXClass("bg-gray-100 text-black"); // no change
      }
    }

    // update previous price after comparison
    previousNiftyPriceRef.current = newNIFTYPrice;
  }, [newNIFTYPrice]);


   useEffect(() => {
    if (newBankNIFTYPrice === null) return;

    const prevPrice = previousBankPriceRef.current;
    let priceElement = document.getElementById(BANKNIFTYTICKERPRICE);
    if (prevPrice !== null) {
      if (newBankNIFTYPrice > prevPrice) {
       //  setColorSENSEXClass("bg-green-100 text-green-800"); // price up
        priceElement.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement.style.color ='white';
                            console.log('Sensex  gree price  ' );  
                             console.log('Sensex  gree price  ' );  
                              console.log('Sensex  gree price  ' );  
      } else if (newBankNIFTYPrice < prevPrice) {
       // setColorSENSEXClass("bg-red-100 text-red-800"); // price down
        priceElement.style.backgroundColor= 'red';
                            priceElement.style.color ='white';
                             console.log('Sensex  red  price  ' );  
                              console.log('Sensex  red  price  ' );  
                               console.log('Sensex  red  price  ' );  
      } else {
       // setColorSENSEXClass("bg-gray-100 text-black"); // no change
      }
    }

    // update previous price after comparison
    previousBankPriceRef.current = newBankNIFTYPrice;
  }, [newBankNIFTYPrice]);

  useEffect(() => {
    // Start connection on mount
     userLoggedIn();
     if (userAuthCode && userAuthCode !== null && userAuthCode !== undefined) {
       startEventSource();
     }
    // Cleanup on unmount
    return () => {
      stopEventSource();
    };
  }, []);
*/

export const userLoggedIn = () => {
    //     console.log("Fyers Feed user login check  ");
      const res1 = StorageUtils._retrieve(CommonConstants.fyersToken);
        if (res1.isValid && res1.data !== null &&  res1.data !== undefined) {
          let auth_code = res1.data['auth_code'];
          if (auth_code&& auth_code !== null && auth_code !== undefined) {
    //          console.log("User is Authorized ");
             setUserAuthCode(auth_code); // prevcode => prevcode = auth_code
          }
        }
 }
export const startEventSource = (connectionStatus,tickerMap, onFeed) => {
 return async (dispatch) => {
     
  if (!connectionStatus) {
    // Prevent duplicate connections
   /* if (eventSourceRef === undefined) {
      console.warn("EventSource already running.");
      return;
    }*/

    try {
      userLoggedIn();
     if (userAuthCode && userAuthCode !== null && userAuthCode !== undefined) {
     //  console.log("User is Authorized ");  
       const fetchAuthToken = async () => {
          try {  //
             const res = await API.get(FYERSAPITICKERACCESTOKEN , {params: { "auth_code" : userAuthCode }});
             const text = await res.data ;
             StorageUtils._save(CommonConstants.recentTickerToken, text)
             return text;
          }
          catch(erer){
            console.log("Auth token fetch Error ")
            return '';
         }
       }; 
       const fetchIndicesQuote = async (acctoken) => {  
        
        let marketFeed = StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);

        let indicesFeed = marketFeed !==undefined ?  StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey).data : null;
       // console.log(" indices "+JSON.stringify(indicesFeed));
          let indices =  (indicesFeed !==undefined && indicesFeed !==null ) ? ( (indicesFeed.data !==undefined &&
            indicesFeed.data !==null ) ? indicesFeed.data : null )  : null;
            if(acctoken  ===null || acctoken ===undefined || acctoken ==='' ){
               // gethe 
               let ctoken =  StorageUtils._retrieve(CommonConstants.recentCancelledOrderToken).data ;
               console.log("cToken === "+JSON.stringify(ctoken))
               acctoken = ctoken;
                console.log("Fyer Event source using the acctoken === CommonConstants.recentCancelledOrderToken ")
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
          if(indices !==undefined && indices !== null && Array.isArray(indices)){
             indices.forEach(ticker => params.append("ticker", ticker));
          }
           else{
        //        console.log("✅ Markeet Feed Indices not read ");
           }

        const es = new EventSource(FYERSAPIMARKETFEEDRENDER+`?${params.toString()}`, { withCredentials: true });
        es.onopen = () => {
            console.log("✅ EventSource connection opened.");
            setIsConnected(true);
        };
        es.onmessage = async (event) => {
         try {
          const data = JSON.parse(event.data);
          if (data !== undefined) { // last price
           const {ltp, symbol, type  } = data;   
           setTickerData(data); 
           if (typeof ltp !== "undefined" && typeof type !== "undefined") {
         //    console.log("Indices Quote availalbe.");
                      // ✅ generic updates (positions, cache)
            StorageUtils._save(
              `${CommonConstants.tickerIndicesCacheKey}:${symbol}`,
              data
            );
             // ✅ update the tickerMap safely (isolate per symbol)
          /*  setTickerMap((prev) => ({
              ...prev,
              [symbol]: { ...data }, // clone to avoid mutation
            })); */
             let   tickerMap2 =undefined;
              try {
                 // const result = await  dispatch(updateTickerMap(data));  //dispatch(orderBookData("")); 
                    dispatch(updateTickerMap(data));
                    const result = store.getState().ticker.tickerMap;
                  if(result !==undefined && result !== null && Array.isArray(result)){
                      tickerMap2 =     result ;
                                //= useSelector(state => state.ticker.tickerMap);
                    if (!isEqual(tickerMap, tickerMap2)) {
                        if(Array.isArray(tickerMap2) && tickerMap2.length >0 ){ 
                          console.log(`loginFeed.actions.js ticker map from PositionGrid ${tickerMap} `)
                          tickerMap = tickerMap2;
                          console.log(`loginFeed.actions.js ticker map in loginFeed ${tickerMap2} `)
                        }

                    }
                  if(symbol === 'BSE:SENSEX-INDEX'){  setSensex(data,tickerMap); dispatch(saveSensexBook(data)) }
                  if(symbol === 'NSE:NIFTY50-INDEX'){ setNifty(data , tickerMap);  dispatch(saveNiftyBook(data))}
                  if(symbol ==='NSE:NIFTYBANK-INDEX'){  setBankNifty(data,tickerMap);  dispatch(saveBankNiftyBook(data))}
                  if(symbol.indexOf('4450CE')>-1){   console.log( `1 CE ${ JSON.stringify(data)}  `)}
                  //NOTE this is a single Tick Price for either of the Symbols 
                  // the 3 above are default , rest would be the onES WHERE THE POSITION'S ARE TAKEN 
                  // WE HAVE TO UPDATE THE POSITION BOOK SYMBOLS WITH THESE PRICES.
                  dispatch( savePositionTickerBook(data));
                }
           
             /* onFeed(JSON.stringify( { "colorSENSEX": colorSENSEXClass , "colorSENSEX" : colorBankNIFTYClass ,
                     "colorSENSEX": colorNIFTYClass} ) )
                     */
              
                    //fetchOrdersBookDataCacheKey();
                     // setOrdersShowModal(true);  
                  } catch (err) {

                     console.error("❌ loginFeed.action: Ticker prices tickerMap Update failed :", err);
                  //  console.error(err);
                  // setResource(null);
                   // setOrdersShowModal(true);
                 }


          
           }
          }               
         } catch (err) {
             console.error("❌ Failed to parse SSE data:", err);
         }
        };
        es.onerror = (err) => {
           //// COMMENTED PURPOSELY to reduce CONSOLE LOGS 
           // console.error("⚠ EventSource error:", err);
            setIsConnected(false);
            // Optional: auto-close on persistent error
            if (es.readyState === EventSource.CLOSED) {
            console.warn("EventSource closed. Cleaning up...");
            stopEventSource();
            }
        };
       // eventSourceRef.current = es;
        eventSourceRef  = es;
    } 
   await  fetchAuthToken().then(async aces_token   => { 
       await  fetchIndicesQuote(aces_token);
     });






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
    }
  };

export   const stopEventSource = () => {
    if (eventSourceRef !==undefined) {
      console.log("🛑 Closing EventSource...");
      //eventSourceRef.current.close();
      eventSourceRef = null;
      //eventSourceRef.current = null;
      setIsConnected(false);
    } else {
      console.warn("⚠ No EventSource to close.");
    }
  };
 const localISTDateTimeSec = (inStr) => {
            const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      let  utcDate = new Date();
      try{ 
         if (inStr && inStr !== "null" && inStr !== "undefined") {
            utcDate = new Date(inStr);
           }
                  // If invalid date, fallback to now
        if (!(utcDate instanceof Date) || isNaN(utcDate.getTime())) {
          console.warn("⚠ Invalid date received, using current time:", inStr);
          utcDate = new Date();
        }
     
       }catch(derr){
        utcDate = new Date();
        console.log("ticker time no present, current used ")
       }
    const istTime = new Intl.DateTimeFormat('en-GB', options).format(utcDate);
      return istTime;

   }


const setSensex = (tickQuote,tickerMap) => { 
        let el = document.getElementById(SENSEXTICKERDOMID);  // GLOBAL DOM ID sensex-status
        let tickerData = tickQuote;
            const nifty =  (  tickerMap !==null && tickerMap !==undefined &&  tickerMap["BSE:SENSEX-INDEX"] !== undefined)  ? tickerMap["BSE:SENSEX-INDEX"] : tickQuote;
         let {ltp1 , type1 } = tickQuote;
         let {ltp , type } = nifty !== undefined  ? nifty : tickQuote;
        let sym = 'SENSEX-INDEX';  // tickerData["symbol"];
        let price = ltp //  tickerData["lp"];
        
            let time =  localISTDateTimeSec(type) ;// localISTDateTimeSec(tt)//tickerData["tt"]
        sensexQue.push({time:time, price :price});
            console.log('time '+JSON.stringify(time) + "price  "+ price);  
        //  updateBestMatches1(sensexQue);
        console.log("tick  "+JSON.stringify( { sym , price, time  }))
        if(el !==null && el !== undefined){
        // el.textContent = time + " :: "+ sym +" :: "+ price;
            let timeEl = document.getElementById(SENSEXTICKERTIME);
            if(timeEl !==null && timeEl !== undefined){
            timeEl.textContent = time ;
            }
            // SKIPPED AS the HEADING DIV CLARIFY the SYMBOL
            /*let symbolEl = document.getElementById(SENSEXTICKERSYMBOL);
            if(symbolEl !==null && symbolEl !== undefined){
                symbolEl.textContent =   sym ;
            }*/
            // update price and color based on previus price 
        let priceSpan = document.getElementById(SENSEXTICKERPRICE);
            if(priceSpan !==null && priceSpan !== undefined){
            
                 //   priceElement.textContent = price;
                // ALL GOOD SAVE the INDICE into CACHE 
                 let  s = "BSE:SENSEX-INDEX";
                  let priceElement = document.getElementById(SENSEXTICKERPRICE);
                  let  newPrice = parseFloat(price);
                   setNewSENSEXPrice(  newPrice ); // = newPrice;
                  previousPrice = previousSENSEXPrice;
                    if (!isNaN(newSENSEXPrice)) {
                      if (previousSENSEXPrice !== null) {
                        if (newSENSEXPrice > previousSENSEXPrice) {
                            setColorSENSEXClass("bg-green-100 text-green-800"); // price up
                          priceElement.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement.style.color ='white';
                            console.log('Sensex  gree price  '+ newPrice.toFixed(2));  
                             console.log('Sensex  gree price  '+  newPrice.toFixed(2));  
                              console.log('Sensex  gree price  '+  newPrice.toFixed(2));  

                        } else if (newSENSEXPrice < previousSENSEXPrice) {
                           setColorSENSEXClass("bg-red-100 text-red-800"); // price down
                            priceElement.style.backgroundColor= 'red';
                            priceElement.style.color ='white';
                             console.log('Sensex  red  price  '+  newPrice.toFixed(2));  
                              console.log('Sensex  red  price  '+  newPrice.toFixed(2));  
                               console.log('Sensex  red  price  '+  newPrice.toFixed(2));  

                        } else {
                          setColorSENSEXClass("bg-gray-100 text-black"); // no change
                        }
                      }
                        // {tickerMap['BSE:SENSEX-INDEX'].ltp}  used in Position Grid - to show the data.
                    //  priceElement.textContent = newPrice.toFixed(2); // display with 2 decimal places
                      setPreviousSENSEXPrice(  newPrice); // = newPrice;
                    }
                // the bellow causes race and some nifty printed for sensex , jumblling 
                 //   updatePriceFromStream(price, s);
                 StorageUtils._save(CommonConstants.currentSensexDataCacheKey,JSON.stringify({ s , price, time  }));
                     //updatePriceFromStream( price,SYMBOL);

            // SKIPPED FOR NOW 
            // updatePriceFromStream( price, SYMBOL);
            }
        }
  }
    const setNifty = (tickQuote,tickerMap) => { 
        let el = document.getElementById(NIFTYTICKERDOMID);  // GLOBAL DOM ID sensex-status
        let tickerData = tickQuote;
        const nifty =  (  tickerMap !==null && tickerMap !==undefined &&  tickerMap["NSE:NIFTY50-INDEX"] !== undefined)  ? tickerMap["NSE:NIFTY50-INDEX"] : tickQuote;
         let {ltp1 , type1 } = tickQuote;
         let {ltp , type } = nifty !== undefined  ? nifty : tickQuote;
        let sym = 'NIFTY-INDEX';  // tickerData["symbol"];
        let price = ltp //  tickerData["lp"];
        
            let time =  localISTDateTimeSec(type) ;// localISTDateTimeSec(tt)//tickerData["tt"]
        niftyQue.push({time:time, price :price});
            console.log('time '+JSON.stringify(time) + "price  "+ price);  
        //  updateBestMatches1(niftyQue);
        console.log("tick  "+JSON.stringify( { sym , price, time  }))
        if(el !==null && el !== undefined){
        // el.textContent = time + " :: "+ sym +" :: "+ price;
            let timeEl = document.getElementById(NIFTYTICKERTIME);
            if(timeEl !==null && timeEl !== undefined){
            timeEl.textContent = time ;
            }
            // SKIPPED AS the HEADING DIV CLARIFY the SYMBOL
            /*let symbolEl = document.getElementById(SENSEXTICKERSYMBOL);
            if(symbolEl !==null && symbolEl !== undefined){
                symbolEl.textContent =   sym ;
            }*/
            // update price and color based on previus price 
        let priceSpan = document.getElementById(NIFTYTICKERPRICE);
            if(priceSpan !==null && priceSpan !== undefined){
            
                   // priceElement.textContent = price;
                       let  s = "NSE:NIFTY50-INDEX";
                  let priceElement2 = document.getElementById(NIFTYTICKERPRICE);
                  let  newPrice = parseFloat(price);
                    setNewNIFTYPrice(  newPrice ); // = newPrice;
                  previousPrice = previousNIFTYPrice;
                    if (!isNaN(newNIFTYPrice)) {
                      if (previousNIFTYPrice !== null) {
                        if (newNIFTYPrice > previousNIFTYPrice) {
                            setColorNIFTYClass("bg-green-100 text-green-800"); // price up
                                priceElement2.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement2.style.color ='white';
                        } else if (newNIFTYPrice < previousNIFTYPrice) {
                           setColorNIFTYClass("bg-red-100 text-red-800"); // price down
                            priceElement2.style.backgroundColor= 'red';
                            priceElement2.style.color ='white';
                        } else {
                            setColorNIFTYClass("bg-gray-100 text-black"); // no change
                        }
                      }
                      //  {tickerMap['NSE:NIFTY50-INDEX'].ltp}
                     // priceElement2.textContent = newNIFTYPrice.toFixed(2); // display with 2 decimal places
                     // previousNIFTYPrice = newPrice;
                       setPreviousNIFTYPrice( newPrice);
                    }


                //          updatePriceFromStream(price, s);
                  StorageUtils._save(CommonConstants.currentNiftyDataCacheKey,JSON.stringify({ s , price, time  }));
            // SKIPPED FOR NOW 
            // updatePriceFromStream( price, SYMBOL);
            }
        }
  }
    const setBankNifty = (tickQuote,tickerMap) => { 
        let el = document.getElementById(BANKNIFTYTICKERDOMID);  // GLOBAL DOM ID BANKNIFTY-status
        let tickerData = tickQuote;
         const nifty =  (  tickerMap !==null && tickerMap !==undefined &&  tickerMap["NSE:BANKNIFTY-INDEX"] !== undefined)  ? tickerMap["NSE:BANKNIFTY-INDEX"] : tickQuote;
         let {ltp1 , type1 } = tickQuote;
         let {ltp , type } = nifty !== undefined  ? nifty : tickQuote;
        let sym = 'BANKNIFTY-INDEX';  // tickerData["symbol"];
        let price = ltp //  tickerData["lp"];
        
            let time =  localISTDateTimeSec(type) ;// localISTDateTimeSec(tt)//tickerData["tt"]
        bankNiftyQue.push({time:time, price :price});
            console.log('time '+JSON.stringify(time) + "price  "+ price);  
        //  updateBestMatches1(bankNiftyQue);
        console.log("tick  "+JSON.stringify( { sym , price, time  }))
        if(el !==null && el !== undefined){
        // el.textContent = time + " :: "+ sym +" :: "+ price;
            let timeEl = document.getElementById(BANKNIFTYTICKERTIME);
            if(timeEl !==null && timeEl !== undefined){
            timeEl.textContent = time ;
            }
            // SKIPPED AS the HEADING DIV CLARIFY the SYMBOL
            /*let symbolEl = document.getElementById(BANKNIFTYTICKERSYMBOL);
            if(symbolEl !==null && symbolEl !== undefined){
                symbolEl.textContent =   sym ;
            }*/
            // update price and color based on previus price 
        let priceSpan = document.getElementById(BANKNIFTYTICKERPRICE);
            if(priceSpan !==null && priceSpan !== undefined){
                let  s = "NSE:NIFTYBANK-INDEX";
                //     updatePriceFromStream(price, s);
                  //  priceElement.textContent = price;
                 let priceElement3 = document.getElementById(BANKNIFTYTICKERPRICE);
                  let  newPrice = parseFloat(price);
                  setNewBankNIFTYPrice(  newPrice ); // = newPrice;
                  previousPrice = previousBankNIFTYPrice;
                    if (!isNaN(newBankNIFTYPrice)) {
                      if (previousBankNIFTYPrice !== null) {
                        if (newBankNIFTYPrice > previousBankNIFTYPrice) {
                           setColorBankNIFTYClass("bg-green-100 text-green-800"); // price up
                                  priceElement3.style.backgroundColor= 'green'; //  banknifty-price
                           priceElement3.style.color ='white';
                       } else if (newBankNIFTYPrice < previousBankNIFTYPrice) {
                           setColorBankNIFTYClass("bg-red-100 text-red-800"); // price down
                              priceElement3.style.backgroundColor= 'red';
                            priceElement3.style.color ='white';
                        } else {
                          setColorBankNIFTYClass("bg-gray-100 text-black"); // no change
                        }
                      }
                     //  {tickerMap['NSE:NIFTYBANK-INDEX'].ltp}  used in Position Grid - to show the data.
                     // priceElement3.textContent = newBankNIFTYPrice.toFixed(2); // display with 2 decimal places
                     // previousBankNIFTYPrice = newPrice;
                       setPreviousBankNIFTYPrice( newPrice);
                    }
     
                     StorageUtils._save(CommonConstants.currentBankNiftyDataCacheKey,JSON.stringify({ s , price, time  }));
            // SKIPPED FOR NOW 
            // updatePriceFromStream( price, SYMBOL);
            }
        }
  }




  const handleToggle = () => {
    setIsMarketFeed((prev) => !prev);

    // Optionally, trigger your stream start/stop logic here
    if (!isMarketFeed) {
      console.log("Market feed started");
      //START THE THREE SEC INTEVAL 
     let threeSecInterval =   setInterval (  () => {
         // make or dispatch action to the streamTicker.actions.js
        //TRIIGER the sensex ticker Book Fetch  
        dispatch(getIndicesTickerData('BSE:SENSEX-INDEX'));
      // IF ABOVE UPDATE's with LIVE DATA the BELLOW CACHE WILL PICK IT 
      // SO THE TICKERCHIP should be able to get the DATA from later on 
         dispatch(updateIndicesFromCache('BSE:SENSEX-INDEX'));

       },3000);
     setThreeSec(threeSecInterval);
        let after45SecClosePoll =   setTimeout (  () => {
             clearInterval(threeSecInterval)
             setIsMarketFeed((prev) => !prev);
        }, 60000);

    } else {
      console.log("Market feed stopped");
       //TRIIGER the sensex ticker Book Fetch  
       // this was used in the EVENT source to send a close request separately 
      //  dispatch(stopSensexTickerData('BSE:SENSEX-INDEX'));
       // Stop the three second Interval Immediately and then 
        clearInterval(threeSecInterval)
    }
  };
 
