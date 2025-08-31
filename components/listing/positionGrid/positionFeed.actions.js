// positionFeed.action.js 
import React, {useEffect, useRef,  useState } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
 
import "./positionFeedStyles.css";
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
// import { getIndicesTickerData  ,updateIndicesFromCache ,stopSensexTickerData } from "./threeIndicesFeed.actions";
import {useDispatch, useSelector} from 'react-redux';
import { saveSensexBook } from '@/redux/slices/tickerSensexSlice';  
import { saveNiftyBook } from '@/redux/slices/tickerNiftySlice';  
import { saveBankNiftyBook } from '@/redux/slices/tickerBankNiftySlice';  
import { savePositionTickerBook } from '@/redux/slices/positionSlice';  
import { savePositionStreamBook } from '@/redux/slices/positionSlice';  
import { updateTickerMap } from "@/redux/slices/tickerSlice";
import { updateOrderBook } from "@/redux/slices/tickerSlice";
import { store } from "@/redux/store";
import isEqual from 'lodash.isequal';
import { API, FYERSAPINSECSV ,FYERSAPIMARKETFEEDRENDER ,FYERSAPIPOSITIONSRENDER  , FYERSAPI, FYERSAPITICKERACCESTOKEN,   FYERSAPITICKERURL , FYERSAPITICKERURLCLOSE} from '@/libs/client';

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
  //tickerMap2  = useSelector(state => state.ticker.tickerMap);
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

//const [tickerMap, setTickerMap] = React.useState({});

 let previousPrice = null;  // PREVIOUS PRICE  
let  stringMap  = null;
 let mt = [];
 let sensexQue = []; let niftyQue= []; let bankNiftyQue = [];
 
export      const userLoggedIn = () => {
       let acode = undefined;
            console.log("Fyers Position Feed user login check  ");
         const res1 = StorageUtils._retrieve(CommonConstants.fyersToken);
           if (res1.isValid && res1.data !== null &&  res1.data !== undefined) {
             let auth_code = res1.data['auth_code'];
             if (auth_code&& auth_code !== null && auth_code !== undefined) {
                 console.log("User is Authorized ");
                  console.log("User typeof "+ JSON.stringify(typeof auth_code));
                  console.log("User auth_code "+JSON.stringify(auth_code));
                  acode = auth_code;
                 setUserAuthCode(auth_code);
               // setUserAuthCode(prevcode => prevcode = auth_code);
               //  setUserAuthCode(() => auth_code);
             }
           }
        return acode;
    }
/*
------------------------------------------------------------------------------------------------------------------------------------------
Sample Success Response 
------------------------------------------------------------------------------------------------------------------------------------------
          
  {
    "s":"ok",
    "positions":{
        "symbol":"NSE:IDEA-EQ",
        "id":"NSE:IDEA-EQ-INTRADAY",
        "buyAvg":8,
        "buyQty":1,
        "buyVal":8,
        "sellAvg":7.95,
        "sellQty":1,
        "sellVal":7.95,
        "netAvg":0,
        "netQty":0,
        "side":0,
        "qty":0,
        "productType":"INTRADAY",
        "realized_profit":-0.04999999999999982,
        "rbiRefRate":1,
        "fyToken":"101000000014366",
        "exchange":10,
        "segment":10,
        "dayBuyQty":1,
        "daySellQty":1,
        "cfBuyQty":0,
        "cfSellQty":0,
        "qtyMulti_com":1
    }
  }

*/
 
export const startEventSource = (connectionStatus,positionBook, onFeed) => {
 return async (dispatch) => {
     
  if (!connectionStatus) {
    // Prevent duplicate connections
   /* if (eventSourceRef === undefined) {
      console.warn("EventSource already running.");
      return;
    }*/

    try {
           let userAuthCode1 = userLoggedIn();
          let  sortedSocketData   = tickerData;
         if (userAuthCode1 && userAuthCode1 !== null && userAuthCode1 !== undefined) {
          console.log("User is Authorized ");  
    
         const fetchAuthToken = async () => {
              try {  //
                 const res = await FYERSAPI.get(FYERSAPITICKERACCESTOKEN , {params: { "auth_code" : userAuthCode1 }});
                 let text = '';
                 text =    res.data.value;
                StorageUtils._save(CommonConstants.recentTickerToken, text)
                 return text;
              }
              catch(erer){
                console.log("Auth token fetch Error  ---------------POSITION FEED ACTION ")
                return '';
             }
           }; 

         const fetchSocketOrders = async (acctoken) => {   
            // NOT NEEED oNLY ACCESS TOKEN 
            //let marketFeed = StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
    
            /*let indicesFeed = marketFeed !==undefined ?  StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey).data : null;
            console.log(" indices "+JSON.stringify(indicesFeed));
           
               let indices =  (indicesFeed !==undefined && indicesFeed !==null ) ? ( (indicesFeed.data !==undefined &&
                indicesFeed.data !==null ) ? indicesFeed.data : null )  : null;
             */
                if(acctoken  ===null || acctoken ===undefined || acctoken ==='' ){
                   // gethe 
                   let ctoken =  StorageUtils._retrieve(CommonConstants.recentCancelledOrderToken).data ;
                   console.log("cToken === "+JSON.stringify(ctoken))
                   acctoken = ctoken;
                    console.log("POSITION FEED ACTION source using the acctoken === CommonConstants.recentCancelledOrderToken ")
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
           /*   if(indices !==undefined && indices !== null && Array.isArray(indices)){
                 indices.forEach(ticker => params.append("ticker", ticker));
              }
               else{
                    console.log("✅ Markeet Feed Indices not read ");
               }
               */
             const es = new EventSource(FYERSAPIPOSITIONSRENDER+`?${params.toString()}`, { withCredentials: true });
    
            /*    const { isConnected } = useEventSource(
                 FYERSAPIORDERSRENDER+`?${params.toString()}`,
                  { withCredentials: true }
                );
              setIsConnected(isConnected);*/
             console.log(`✅ POSITION SOCKET API -${params.toString()} --------------POSITION FEED ACTION`);
    
            es.onopen = () => {
                console.log("✅  POSITION SOCKET API EventSource connection opened.");
                setIsConnected(true);
            };/**/
            es.onmessage = (event) => {
             try {

                console.log(" POSITION FEED ACTION    Position Data Stream response "+JSON.stringify(event.data));
                console.log(" POSITION FEED ACTION    Position Data Stream typeof  "+JSON.stringify(typeof event.data));
              let data = undefined; 
              try {
                  try {
                  data = JSON.parse(event.data); 
                     } catch(dtEr){
                      console.log(" POSITION FEED ACTION    Position Data Stream response  PARSE FAILED  ");
                     data = event.data;
                    }
                   data = event.data;   
                }
                
                catch(dtEr2){
                   console.log(" POSITION FEED ACTION    Position Data Stream response  PARSE FAILED  ");
                    data = event.data;
                }
                console.log("positionFeed.action data stringify =: "+JSON.stringify(data));
                console.log("positionFeed.action data plain =: "+ data );
                let ertDa = JSON.parse(data);
                console.log("positionFeed.action ertDa parse =: "+ ertDa );
              let positionData = (ertDa !==undefined ? (ertDa.positions !== undefined ? ertDa.positions : 
                                                     ( ertDa["positions"] !== undefined ?  ertDa["positions"] : undefined) ) : undefined);

              if (positionData !== undefined) { // last price
               const {netAvg, symbol, netQty  } = positionData;   
               setTickerData(positionData); 
               if (typeof netAvg !== "undefined" && typeof netQty !== "undefined"  && typeof symbol !== "undefined") {
                 console.log("Indices Quote availalbe. -----------POSITION FEED ACTION");
                 StorageUtils._save(CommonConstants.tickerPositionsSocketCacheKey, positionData );
                
                 // CHECK parsedData already contains the FETCHED position of not 
                 if(sortedSocketData  == null || sortedSocketData  == undefined){
                      if(positionData !== null || positionData  !== undefined){
                        if (Array.isArray(positionData)){ 
                         sortedSocketData = [...positionData];
                        }
                        else {
                          sortedSocketData = [positionData];
                        }
                        console.log(`GENERAL SOCKET --POSITION after subscription :  ${JSON.stringify(sortedSocketData)}`);
                      }
                      else {
                        console.log(" No Position update returning next feed  .... ")
                        return;
                      }
                 }
                 else {
                     if(positionData !== null || positionData  !== undefined){
                        if (Array.isArray(positionData)){ 
                         sortedSocketData = [...positionData];
                        }
                        else {
                          sortedSocketData = [positionData];
                        }
                        console.log(`GENERAL SOCKET --POSITION after subscription :  ${JSON.stringify(sortedSocketData)}`);
                      } 
                 }
                try { 
            
                    if(sortedSocketData !== null && sortedSocketData !== undefined &&  Array.isArray(sortedSocketData)) {
                    let dataToSort = [...sortedSocketData]; let positionsTickerData = [];
                    console.log(`Position Feed Action: positionBook state ${JSON.stringify(dataToSort)} `);
                    if( Array.isArray(dataToSort)) { 
                                positionsTickerData = dataToSort.map(p => {
                                let tickSym  = p.symbol;
                                //(p.symbol.indexOf('NIFTY')  -1 ? 'NSE:'+p.symbol:( p.symbol.indexOf("SENSEX")>-1? "BSE:"+p.symbol : "NSE:"+p.symbol));
                                if ( !isNaN(p.limitPrice ) ) {
                                    console.log(`Position Feed Action: updating ${p.symbol} LTP to ${p.limitPrice}`);
                                    return { ...p, lp: p.limitPrice };
                                } 
                                return p;
                                });
        
                            }
                            else {
                                console.log(`Position Feed Action: positionBook not array `);
                            }
                        // set parseData with the updated ticker price 
                        if(positionsTickerData.length >0){  
                        sortedSocketData = positionsTickerData;
                         dispatch(savePositionStreamBook(sortedSocketData)) ;
                         // call the callback and update the 
                         onFeed(sortedSocketData);
                            console.log(` POSITION FEED ACTION  POSITION's   ${JSON.stringify(sortedSocketData)} `)
                        }
                        else {
                        console.log(" POSITION's  .................no TICKER UPDATES -----------POSITION FEED ACTION")
                        }
                    }
                    else {
                        console.log(`Position Feed Action: please FETCH the Position's manually for TICKER UPATES IN POSITONS `);
                        //  console.log(" PositionGrid after login state.position.positionBook "+JSON.stringify(positionData))
                        console.log(`Position Feed Action: sortedSocketData  ${sortedSocketData} `);
                    }
                  
                 }
                catch(ere){
                console.log(` Position Feed Action: sortedSocketData : CommonConstants.recentPositionsSocketKey ${CommonConstants.recentPositionsSocketKey} :: not available set to [] `); 
                sortedSocketData =[];
                //return [];
               }
            
                  // }  // sortedSocketData 
    
    
               // dispatch( savePositionTickerBook(data));
               //   onFeed(JSON.stringify( { "colorSENSEX": colorSENSEXClass , "colorSENSEX" : colorBankNIFTYClass ,
                //         "colorSENSEX": colorNIFTYClass} ) )
               }
              }               
             } catch (err) {
                 console.error("❌ ----POSITION FEED ACTION Failed to parse SSE data: ", err);
             }
            };
            es.onerror = (err) => {
                console.error("⚠ EventSource error: ----POSITION FEED ACTION", err);
                setIsConnected(false);
                // Optional: auto-close on persistent error
                if (es.readyState === EventSource.CLOSED) {
                console.warn("EventSource closed. Cleaning up...----POSITION FEED ACTION");
                stopEventSource();
                }
            };
           // eventSourceRef.current = es; 
            eventSourceRef  = es;
        } 
      await  fetchAuthToken().then(async aces_token   => { 
       await  fetchSocketOrders(aces_token);
      });
       /*
            await  fetchAuthToken().then(async aces_token   => { 
           await  fetchSocketOrders(aces_token).catch((err) => {
               console.log("Position Gnereal Socket error occurred "+JSON.stringify(err))
                console.log("Position Gnereal Socket closing instance ...  ")
                stopEventSource();
                setIsConnected(false);
         });
    
         })
       */
  




     } // USER MUST BE LOGGED IN 
     else { 
         console.log("❌ User must be logged in to create EventSource:----POSITION FEED ACTION" );
     }
    } catch (err) {
      console.error("❌ Failed to create EventSource: ----POSITION FEED ACTION ", err);
    }
  }
  else {
        stopEventSource();
  }
    }
  };

export   const stopEventSource = () => {
    if (eventSourceRef !==undefined) {
      console.log("🛑 Closing EventSource...----POSITION FEED ACTION");
      //eventSourceRef.current.close();
      eventSourceRef = null;
      //eventSourceRef.current = null;
      setIsConnected(false);
    } else {
      console.warn("⚠ No EventSource to close. ----POSITION FEED ACTION");
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
 
