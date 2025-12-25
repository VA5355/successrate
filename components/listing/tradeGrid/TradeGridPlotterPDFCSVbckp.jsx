 
import React, {Suspense, useEffect , useState,useMemo} from "react";
import { CommonConstants } from "@/utils/constants";
import { StorageUtils } from "@/libs/cache";
import {disableLoader, enableLoader} from "@/redux/slices/miscSlice"
//import React, {useEffect, useState} from 'react'
import tradeBook from './tradesample.json';
import './tradestyles.css'; // ✅ No 'tradestyles.'
import {useDispatch, useSelector} from 'react-redux';
import { getTradeData } from "./tradeGridBook.actions";
import {API, FYERSAPI, FYERSAPILOGINURL} from "@/libs/client"
import StreamToggleButton from './StreamToggleButton';
import { FileText, FileDown, Loader2 } from "lucide-react";
import { exportTradeBookPDF, exportTradeBookCSV } from "@/utils/tradeExport";

//CUSTOME HOOK to DETECT MOBILE 
//import { useIsMobile } from "./useIsMobile";
 import   useIsMobile   from "./useIsMobile";

import  {  TradeBookMobileView as  MobileView }   from "./TradeBookMobileView";

const TradeGridPlotterPDFCSV = ({ tradeDataB   }) => {
  StorageUtils._save(CommonConstants.tradeDataCacheKey,CommonConstants.sampleTradeDataVersion1);
  // PDF CSV 
 // const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
//const [exportError, setExportError] = useState<string | null>(null);
const [exporting, setExporting] = useState(null);     // "pdf" | "csv" | null
const [exportError, setExportError] = useState(null); // string | null


   const currentPlatform = useSelector((state ) => state.misc.platformType)
   const [parsedData, setParsedData] = useState(() => JSON.parse(StorageUtils._retrieve(CommonConstants.tradeDataCacheKey).data));
   // useState(() => []);//StorageUtils._retrieve(CommonConstants.tradeDataCacheKey).data
     const [platformType, setPlatformType] = useState('1')
   const [data, setData] = useState(tradeDataB);
       const tradeData = useSelector((state ) => state.trade.tradeBook)
   const [trades ,setTrades ] =  useState ([]);
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

  const dataToSort = [...parsedData];

  if (sortColumn === 'orderDateTime') {
    return dataToSort.sort((a, b) => {
      const timeA = parseDate(a[sortColumn]).getTime();
      const timeB = parseDate(b[sortColumn]).getTime();

      return sortDirection === "asc"
        ? timeA - timeB
        : timeB - timeA;
    });
  }

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

const getSortIndicator = (column) =>
    sortColumn === column ? (sortDirection === "asc" ? " ▲" : " ▼") : "";


     useEffect(() => {
           console.log("TradeTable:   " )
          StorageUtils._save(CommonConstants.fetchPositions, true);
          console.log("TAB CHANGED ");
           // FETH The recentTRades from storage if above call succeeded data will be there
           let redentTradeData =  StorageUtils._retrieve(CommonConstants.recentTradesKey)
            const dataFromCache = StorageUtils._retrieve(CommonConstants.tradeDataCacheKey)
            let trades = undefined;
            if( redentTradeData['data'] !== ''  && redentTradeData['data'] !== null && redentTradeData['data'] !==undefined){
                     console.log(" recentTrades  trade data empty "+JSON.stringify(redentTradeData))
                     let tr = JSON.parse((JSON.stringify(redentTradeData)));
                     if(tr !==null && tr !== undefined ){
                         if(tr['data'] !==null && tr['data']!== undefined ){
                           trades =tr['data'];
                            console.log(" trades SET to  tr['data'] ")

                         }
                     }
                     
            }else {
               console.log("trade data fro cahce "+JSON.stringify(dataFromCache))
               trades = JSON.parse(dataFromCache.data) ;
            }
           let dataLocal   =   (tradeDataB !== undefined && tradeDataB.length !=0 ) ? tradeDataB : trades;
            console.log("trade data  "+JSON.stringify(dataLocal))
            console.log("trade data length  "+ dataLocal.length )
            try { 
            let parsed = dataLocal /// JSON.parse(data);
             setParsedData(parsed);
             setData(dataLocal)
              console.log("trade data typeof  "+ (typeof dataLocal ) )
               console.log("trade data parsedData  "+ (typeof parsed ) )
            console.log("trade data parsedData length  "+ (  parsed.length ) )
           
             }
             catch(er) {
                // show sample trades from json 
                  dataLocal  =   tradeBook.value;
                   let parsed = tradeBook.value;
                 setParsedData(parsed);
                  setData(dataLocal)
                console.log("sample  trade data typeof  "+ (typeof dataLocal ) )
               console.log("sample trade data parsedData  "+ (typeof parsed ) )
              console.log("sample trade data parsedData length  "+ (  parsed.length ) )
            
             }

       }, [tradeDataB]);
 

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
                  
                      let res =   popupCenter(FYERSAPILOGINURL, "Fyers Signin")
                        return res;
                    }) ;
                    const result = Promise.all([    fyerLoginProm()]);
                     // run a interval to check the fyersToken 
                    globalUserCheck  =  setInterval( async() => {
                        let result =   await FYERSAPI.get('/fyersgloballogin' )
                        console.log("fyers login called ");
                        let data =    result.data.value;
                        StorageUtils._save(CommonConstants.fyersToken,data)
                        const res = StorageUtils._retrieve(CommonConstants.fyersToken);
                        if (res !==undefined && res.isValid && res.data !== null && res.data !==undefined)  {
                           
                            let auth_code = res.data['auth_code'];
                            if (auth_code&& auth_code !== null && auth_code !== undefined) {
                                console.log("User is Authorized ");
                                setUserLogged (true);
                               clearInterval(globalUserCheck);
                            }
                            else{
                                console.log("User is awaiting authorization ");
                            }
                        }
                     },5000);
 
                    
                } catch (error) {
                    // @ts-ignore
                    const {message} = error
                    //toast.error(message ? message : "Something went wrong!")
                    console.log(error)
                    return error
                } finally {
                    dispatch(disableLoader())
                }
 
               
            }
          
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
                    console.log("unload the popup ")
                   // ftech the globallogin boject 
                   let globaProm =    ( async () => { 
                     let login = await FYERSAPI.get('/fyersgloballogin'); 
                     console.log("fyers login called ");
                     return login;
                    }) 
                    const res = Promise.all([ globaProm()]);
                    res.then((values) => {

                        console.log("result from FYERSAPI.get('/fyersgloballogin') " +JSON.stringify(values))
                        StorageUtils._save(CommonConstants.fyersToken,values)
                         console.log("fyers login token saved ")
                     //DON'T call immediately as Fyers Login make take time 
                     // so Using setTimeout or setInterval 
                       globalUserTrades  =  setInterval( async () => { 

                         //TRIIGER the trade Book Fetch again 
                         dispatch(getTradeData('adfg'));
                        let redentTradeData =  StorageUtils._retrieve(CommonConstants.recentTradesKey)
                                const dataFromCache = StorageUtils._retrieve(CommonConstants.tradeDataCacheKey)
                                if( redentTradeData !== null && redentTradeData !==undefined){
                    
                                }else {
                                console.log("trade data fro cahce ")
                                redentTradeData = dataFromCache;
                                }
                                console.log(" TradeGrid after login state.trade.tradeBook "+JSON.stringify(tradeData))
                            let tradeLocal  =   tradeData !== undefined? tradeData : redentTradeData;
                            if(tradeData !==undefined &&  Array.isArray(tradeData ) ){
                                setTrades( tradeData );
                                  setParsedData(tradeData);
                            }
                            else if(redentTradeData.data !==undefined &&  Array.isArray(redentTradeData.data )) {
                            console.log("TradeGrid after login recenTrades  "+JSON.stringify(redentTradeData.data))
                                setTrades( redentTradeData.data );
                                   setParsedData(redentTradeData.data );
                            }
                            clearInterval(globalUserTrades);
                         }   ,5000);

                    })
                   
                    // window.location.reload();
                });
            });
            
            newWindow?.focus();
          };

   /** Export PDF CSV  */

   const handleExportPDF = async () => {
  try {
    setExportError(null);

   if (!userLogged) {
      throw new Error("Please login to export trades");
    }
    
    if (!sortedData || sortedData.length === 0) {
      throw new Error("No trades available to export");
    }

    setExporting("pdf");
    await new Promise((r) => setTimeout(r, 300));
    exportTradeBookPDF(sortedData);
  } catch (e ) {
    setExportError(e.message || "PDF export failed");
  } finally {
    setExporting(null);
  }
};

const handleExportCSV = async () => {
  try {
    setExportError(null);

    if (!userLogged) {
      throw new Error("Please login to export trades");
    }

    if (!sortedData || sortedData.length === 0) {
      throw new Error("No trades available to export");
    }

    setExporting("csv");
    await new Promise((r) => setTimeout(r, 200));
    exportTradeBookCSV(sortedData);
  } catch (e ) {
    setExportError(e.message || "CSV export failed");
  } finally {
    setExporting(null);
  }
};


   /** Export PDF CSV  */
  return (
    <div className="overflow-x-auto w-full bg-zinc-100">
        <br/>
        <br/>
     {/*   <h1 className='text-black font-semibold mb-2 dark:text-white text-lg'>Trade Book</h1> */}

        <div className="flex justify-between items-center mb-2">
            <h1 className="text-black font-semibold dark:text-white text-lg">
                Trade Book
            </h1>

            <div className="flex gap-3">
                <button
                title="Download PDF"
                onClick={handleExportPDF}
                disabled={exporting !== null}
                className="hover:text-red-600 disabled:opacity-50"
                >
                {exporting === "pdf" ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <FileText className="w-5 h-5" />
                )}
                </button>

                <button
                title="Download CSV"
                onClick={handleExportCSV}
                disabled={exporting !== null}
                className="hover:text-green-600 disabled:opacity-50"
                >
                {exporting === "csv" ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <FileDown className="w-5 h-5" />
                )}
                </button>
            </div>
        </div>
          {exportError && (
                <div className="text-sm text-red-600 mb-2">
                    {exportError} — please try later
                </div>
                )}



      {/* <div className="hidden md:flex flex justify-between  relative items-center">*/}
        <div
             className={
              isMobile
                  ? "mb-2 md:flex flex justify-between relative items-center"
                  : "md:flex flex justify-between relative items-center"
               }
          > 
                 {/* 
                  <select className="p-2 rounded-lg bg-greylight dark:bg-greydark text-gretdark dark:text-white focus-visible:outline-none">
                  md:hidden
                 Alpha-Advantange or Fyers selection */}
                <select value={platformType} onChange={(e) => {
                                    if (e.target.value == '1') {
                                        console.log(" selected " + e.target.value)
                                    } else {
                                        logByPlatform()
                                        console.log(" selected " + e.target.value)
                                    }
                                    setPlatformType(e.target.value)
                  }}  
                    className='p-2 focus-visible:outline-none block  rounded-lg bg-greylight dark:bg-greydark text-gretdark  dark:active:text-green-700  '> {/* dark:text-white */}
                <option value={1}>Alph-Vantage</option>
                <option value={2}>Fyers</option>
               </select>
             </div>
       {/*  CLICK MARKET DATA   TICKER FOR 3 BANKNIFY NIFTY and SENSEX  */}      
   
       {/* Stream Market Data */}
        <div className="flex flex-col md:flex-row justify-end gap-x-6 ml-auto">
         {/*  <div className="flex items-center text-sm text-black dark:text-white font-medium">
            <i className="iconsax mr-2" data-icon="toggle-off-square" />
            Stream MARKET DATA
          </div>*/}
            <StreamToggleButton />

          <div  id="sensex-status" className="flex gap-x-2 items-center">
            <div className="flex flex-col items-start gap-y-1">
            <div className="flex" >
              <div className="flex justify-start">
              SENSEX</div>
               <div className="flex justify-end" ><span id="sensex-time" className="px-4 rounded bg-gray-100">--</span></div> 
              
               </div>
            
           <div className="flex justify-start"> 
            <span id="sensex-symbol" className="px-2 py-1 rounded bg-gray-100">--</span>
            <span id="sensex-price" className="px-2 py-1 rounded bg-gray-100">--</span>
             </div>
             </div>
          </div >

          <div  id="banknifty-status" className="flex gap-x-2 items-center">
             <div className="flex flex-col items-start gap-y-1">
            <div>BANKNIFTY </div>
            <div className="flex justify-start"> <span id="banknifty-time" className="px-2 py-1 rounded bg-gray-100">--</span>
            <span id="banknifty-symbol" className="px-2 py-1 rounded bg-gray-100">--</span>
            <span id="banknifty-price" className="px-2 py-1 rounded bg-gray-100">--</span>
            </div>
            </div>
          </div >

          <div id="nifty-status" className="flex gap-x-2 items-center">
             <div className="flex flex-col items-start gap-y-1">
             <div>  NIFTY </div>
             <div className="flex justify-start"><span id="nifty-time" className="px-2 py-1 rounded bg-gray-100">--</span>
            <span id="nifty-symbol" className="px-2 py-1 rounded bg-gray-100">--</span>
            <span id="nifty-price" className="px-2 py-1 rounded bg-gray-100">--</span>
            </div>
            </div>
          </div  >
        </div>
          <br/>
 

     {isMobile ? <MobileView sortedData={sortedData}
      userLogged={userLogged}
      handleSort={handleSort}
      getSortIndicator={getSortIndicator}
       /> : 
     (  
     <div className="overflow-x-auto w-full">  
    {/*  <table className="min-w-full text-sm text-left border border-gray-200 shadow-md rounded-lg overflow-hidden"> */} 
         <div className="grid grid-cols-8 bg-gray-100 text-gray-700 font-semibold text-sm ">
            <div className="py-1 px-2  cursor-pointer"  >SrNo </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("symbol")}>Instrument{getSortIndicator("symbol")} </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("productType")}>Product{getSortIndicator("productType")} </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("tradedQty")}>Quantity{getSortIndicator("tradedQty")} </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("tradePrice")}>Price{getSortIndicator("tradePrice")} </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("orderDateTime")}>Time{getSortIndicator("orderDateTime")} </div>
            <div className="py-1 px-2  cursor-pointer" onClick={() => handleSort("tradeValue")}>Trade Value{getSortIndicator("tradeValue")} </div>
 
            <div className="py-1 px-2">Buy/Sell</div>
        </div>
     
   
         {/* Table Body Rows  */}
    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
       {/*  Example Row  */}
        { (Array.isArray(sortedData) &&  sortedData.length > 0 && userLogged  ) ? sortedData?.map((row, index) => (
      <div key={index}  className={`grid grid-cols-8 text-sm text-gray-800 hover:bg-gray-50 hover:bg-gray-50 transition ${row['side'] === '-1' ? 'trade-row-sell' : 'trade-row-buy'}`} >
        <div className="py-1 px-2 ">{index}</div>
        <div className="py-1 px-2 text-center ">{row["symbol"]}</div>
        <div className="py-1 px-2 text-center"> {row["productType"]}  </div>
        <div className="py-1 px-2 text-center">{row["tradedQty"]}</div>
        <div className="py-1 px-2 text-center">{row["tradePrice"]}</div>
        <div className="py-1 px-2 ">{row["orderDateTime"]}</div>
        <div className="py-1 px-2 text-center">{row["tradeValue"]}</div>
        <div className="py-1 px-2 text-green-600 font-bold">{row['side'] === '-1' ? 'SELL' : 'BUY'}</div>
        </div>  )) : (    <div className="grid grid-cols-8 text-sm text-gray-800 hover:bg-gray-50">No trades found</div>
          )}
      </div>
       
    </div>
    )}   {/*  MOBILE or DESKTOP VIEW  */}
    </div>
  );
     
};

export default TradeGridPlotterPDFCSV;
