 
import React, {Suspense, useEffect , useState,useMemo} from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 

  RefreshCw, 
 
 
  Zap 
} from 'lucide-react';
import { ToggleLeft, Activity } from 'lucide-react';

import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Hash, 
  Layers, 
  DollarSign, 
 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Search
} from 'lucide-react';
import { CommonConstants } from "@/utils/constants";
import { StorageUtils } from "@/libs/cache";
import {disableLoader, enableLoader} from "@/redux/slices/miscSlice"
//import React, {useEffect, useState} from 'react'
import tradeBook from './tradesample.json';
import IndexCard from '../positionGrid/IndexCard';
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

   const tickerMap = useSelector(state => state.ticker.tickerMap);
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
   const [colorSENSEXClass, setColorSENSEXClass] = useState("bg-gray-100 text-black");
            const [colorNIFTYClass, setColorNIFTYClass] = useState("bg-gray-100 text-black");
          const [colorBankNIFTYClass, setColorBankNIFTYClass] = useState("bg-gray-100 text-black");
    const [searchTerm, setSearchTerm] = useState("");
   const [sortConfig, setSortConfig] = useState({ key: 'orderDateTime', direction: 'desc' });

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
    const handleSortNew = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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

  const sortedDataNew = useMemo(() => {
     if (!userLogged) return parsedData;
  if (!sortColumn) return parsedData;

    let items = [...parsedData];
    if (searchTerm) {
      items = items.filter(i => i.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return items.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [parsedData, sortConfig, searchTerm]);

    const getSortIndicatorNew = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-blue-500" /> : <ArrowDown size={12} className="text-blue-500" />;
  };




  // Mock Data
  const [dataMock] = useState([
    { symbol: 'AAPL', productType: 'CNC', tradedQty: 50, tradePrice: 175.20, orderDateTime: '10:15:22', tradeValue: 8760.00, side: '1' },
    { symbol: 'TSLA', productType: 'MIS', tradedQty: 10, tradePrice: 242.50, orderDateTime: '10:18:05', tradeValue: 2425.00, side: '-1' },
    { symbol: 'BTC/USD', productType: 'NRML', tradedQty: 0.05, tradePrice: 42500.00, orderDateTime: '09:45:12', tradeValue: 2125.00, side: '1' },
    { symbol: 'MSFT', productType: 'CNC', tradedQty: 25, tradePrice: 380.10, orderDateTime: '11:02:45', tradeValue: 9502.50, side: '-1' },
    { symbol: 'RELIANCE', productType: 'MIS', tradedQty: 100, tradePrice: 2540.00, orderDateTime: '11:20:30', tradeValue: 254000.00, side: '1' },
  ]);

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
const refreshTrades =  (event ) => {  

   console.log("Refersh   called ")
     let freshTrade =   setTimeout( async () => { 
        console.log("Refersh Trade book called ")
      //TRIIGER the trade Book Fetch again 
      dispatch(getTradeData('adfg'));
    let redentTradeData =  StorageUtils._retrieve(CommonConstants.recentTradesKey)
            const dataFromCache = StorageUtils._retrieve(CommonConstants.tradeDataCacheKey)
            if( redentTradeData !== null && redentTradeData !==undefined){

            }else {
            console.log("trade data fro cahce ")
            redentTradeData = dataFromCache;
            }
            console.log(" TradeGridPlotterPDFCSVbckp after login state.trade.tradeBook "+JSON.stringify(tradeData))
        let tradeLocal  =   tradeData !== undefined? tradeData : redentTradeData;
        if(tradeData !==undefined &&  Array.isArray(tradeData ) ){
            setTrades( tradeData );
              setParsedData(tradeData);
        }
        else if(redentTradeData.data !==undefined &&  Array.isArray(redentTradeData.data )) {
        console.log("TradeGridPlotterPDFCSVbckp after login recenTrades  "+JSON.stringify(redentTradeData.data))
            setTrades( redentTradeData.data );
                setParsedData(redentTradeData.data );
        }
        clearInterval(freshTrade);
      }   ,6000);


}  

   /** Export PDF CSV  */
  return (
    <div className="overflow-x-auto w-full bg-zinc-100">
        <br/>
        
          <div className="max-w-7xl mx-auto space-y-4">

           {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
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
              
              <span onClick={(e) => {  refreshTrades(e) } }>Refresh </span>
            </button>
          </div> 
        
        </div>
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

 

    {/* } {isMobile ? <MobileView sortedData={sortedData}
      userLogged={userLogged}
      handleSort={handleSort}
      getSortIndicator={getSortIndicator}
       /> : 
     (  */}
        
            <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trade Book</h1>
          <p className="text-sm text-slate-500">View and manage your recent executions</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search symbol..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-8 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <div className="py-4 px-4 flex items-center gap-2"><Hash size={14}/> Sr</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1" onClick={() => handleSort("symbol")}>Instrument {getSortIndicator("symbol")}</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1" onClick={() => handleSort("productType")}>Product {getSortIndicator("productType")}</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1 justify-end" onClick={() => handleSort("tradedQty")}>Qty {getSortIndicator("tradedQty")}</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1 justify-end" onClick={() => handleSort("tradePrice")}>Price {getSortIndicator("tradePrice")}</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1 justify-end" onClick={() => handleSort("tradeValue")}>Value {getSortIndicator("tradeValue")}</div>
          <div className="py-4 px-2 cursor-pointer hover:text-slate-800 flex items-center gap-1 justify-center" onClick={() => handleSort("orderDateTime")}>Time {getSortIndicator("orderDateTime")}</div>
          <div className="py-4 px-4 text-center">Side</div>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
          <AnimatePresence>
            {((sortedData !== undefined  && Array.isArray(sortedData) &&  sortedData.length > 0 && userLogged  )    )? (
             sortedData?.map((row, index) => (
                <motion.div
                  key={`${row.symbol}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    group transition-colors hover:bg-slate-50/80
                    flex flex-col md:grid md:grid-cols-8 text-sm
                    p-4 md:p-0
                  `}
                >
                  {/* Mobile Row Layout */}
                  <div className="flex md:hidden items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-0.5 py-0.5 rounded">#{index + 1}</span>
                      <span className="break-words font-bold text-slate-800">{row.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full">{row.productType}</span>
                    </div>
                    <div className={`flex items-center gap-1 font-bold text-xs ${row.side === '-1' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {row.side === '-1' ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                      {row.side === '-1' ? 'SELL' : 'BUY'}
                    </div>
                  </div>

                  {/* Desktop Columns / Mobile Grid */}
                  <div className="hidden md:flex items-center py-4 px-1 text-slate-400 font-mono text-xs">{index + 1}</div>
                  
                  <div className="break-words hidden md:flex items-center py-4 px-2 font-bold text-slate-700">{row.symbol}</div>
                  
                  <div className="hidden md:flex justify-end py-4 px-1">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{row.productType}</span>
                  </div>

                  <div className="flex justify-between md:justify-end md:items-center md:py-4 md:px-2 py-1">
                    <span className="md:hidden text-slate-400 text-xs">Quantity</span>
                    <span className="font-medium text-slate-700">{row.tradedQty}</span>
                  </div>

                  <div className="flex justify-between md:justify-end md:items-center md:py-4 md:px-2 py-1">
                    <span className="md:hidden text-slate-400 text-xs">Price</span>
                    <span className="text-slate-600 font-mono">₹{row.tradePrice?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between md:justify-end md:items-center md:py-4 md:px-2 py-1">
                    <span className="md:hidden text-slate-400 text-xs">Total Value</span>
                    <span className="font-bold text-slate-800">₹{row.tradeValue?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between md:justify-center md:items-center md:py-4 md:px-2 py-1">
                    <span className="md:hidden text-slate-400 text-xs italic flex items-center gap-1"><Clock size={12}/> Time</span>
                    <span className="text-slate-500 text-xs">{row.orderDateTime}</span>
                  </div>

                  <div className="hidden md:flex items-center justify-center py-4 px-4">
                    <span className={`
                      text-[10px] font-bold px-3 py-1 rounded-full w-20 text-center
                      ${row.side === '-1' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }
                    `}>
                      {row.side === '-1' ? 'SELL' : 'BUY'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Activity size={32} />
                </div>
                <h3 className="text-slate-800 font-semibold">No trades found</h3>
                <p className="text-slate-500 text-sm">Your trade executions will appear here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-[11px] text-slate-400 uppercase font-bold tracking-widest">
          <span>Total Executions: {sortedData.length}</span>
          <span>Market: Open</span>
        </div>
      </div>
    </div>
   {/*  )}    MOBILE or DESKTOP VIEW  */}




        </div>


     {/*   <h1 className='text-black font-semibold mb-2 dark:text-white text-lg'>Trade Book</h1> */}

    
    



      {/* <div className="hidden md:flex flex justify-between  relative items-center">*/}
   
       {/*  CLICK MARKET DATA   TICKER FOR 3 BANKNIFY NIFTY and SENSEX  */}      
   
     

    </div>
  );
     
};

export default TradeGridPlotterPDFCSV;
