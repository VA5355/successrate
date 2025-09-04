import { useState,useEffect } from "react";
import { startEventSource } from "./positionFeed.actions";
import {useDispatch, useSelector} from 'react-redux';
import { ToggleLeft, Activity } from 'lucide-react';
import {StorageUtils} from "@/libs/cache"
import {CommonConstants} from "@/utils/constants"
import { savePositionStreamBook } from '@/redux/slices/positionSlice';  

export default function PositionsTabs({
  sortedData, parsedData,
  sortedSocketData,
  userLogged,
  handleSort,
  getSortIndicator,
  handleSymbolClick,
}) {
  const [activeTab, setActiveTab] = useState("tab1"); // default tab
     //let  quickOrderBookFeed   = useSelector((state ) => state.positions.position);
         const[ computedSocketData , setComputedSocketData] = useState();
         let statePostionBook  = useSelector(state => state.position.positionBook);
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
 const streamPostionLTPTimer = () => { 
        
                // INDX::NSE:NIFTY2590924250CE
                // marketFeedDataCacheKey
           let g =   StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
           let indKey = g; 
           if ( indKey.isValid && indKey.data !== null && indKey.data !==undefined ) { 
               let indData = indKey.data;
               let actualData = indData.data;
               console.log(`  ${JSON.stringify(indKey.data)}  typeof CommonConstants.marketFeedDataCacheKey ${JSON.stringify(typeof indKey.data )} `);
               console.log(`  ${JSON.stringify(actualData)}  typeof CommonConstants.marketFeedDataCacheKey.data ${JSON.stringify(typeof actualData )} `);
               console.log(` Array.isArray(actualData) ::  ${JSON.stringify(Array.isArray(actualData))}  typeof CommonConstants.marketFeedDataCacheKey.data ${JSON.stringify(typeof actualData )} `);

           if( indData !== ''  && indData !== null && indData !==undefined){ 
           if( actualData !== ''  && actualData !== null && actualData !==undefined){ 

                  let indexWebSocketFeeds = actualData;
                  if(Array.isArray(indexWebSocketFeeds)){

                    const result = indexWebSocketFeeds.filter(item => !item.endsWith("-INDEX"));
                     console.log(` index's to update ::: ${result}  is Array indexWebSocketFeeds.filter(item => !item.endsWith("-INDEX")  ${Array.isArray(result)}`);
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
                         updateLTPUnrealisedPB(symbC, "MARGIN", statePostionBook); 

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

    const fetchParsedData = () => {
      try {
        let g =   StorageUtils._retrieve(CommonConstants.recentPositionsKey)  || "null" ;
        console.log(" g "+JSON.stringify(g));
          let positions = undefined;      
        if( g['data'] !== ''  && g['data'] !== null && g['data'] !==undefined){       
                console.log("positions "+JSON.stringify(g))
                let tr = JSON.parse((JSON.stringify(g)));
                if(tr !==null && tr !== undefined ){
                    if(tr['data'] !==null && tr['data']!== undefined ){
                      positions =tr['data'];
                        console.log(" positions   ")

                    }
                }
              }                       


        if (positions && Array.isArray(positions)) {
          setFilteredData(positions);
          console.log("..........positions grid recentPositions polled parsedData updated: POSITON TAB")
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
      console.log(`Next poll in ${delay / 500}s : POSITON TAB`);
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



  const renderNormalFetchTable = (data) => (
  <div className="overflow-x-auto w-full">
      {/* Header row */}
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
      </div>

      {/* Body rows */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
        {Array.isArray(filteredData) && filteredData.length > 0 && userLogged ? (
          filteredData.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-11 text-sm text-gray-800 hover:bg-gray-50 transition ${
                row["side"] === "-1" ? "position-row-sell" : "position-row-buy"
              }`}
            >
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
              <div id={ `streamedQty_${row["symbol"]}_${row["productType"]}`} className="py-1 px-1">{row["netQty"]}</div>
              <div className="py-1 px-1">{row["avgPrice"]}</div>
              <div className="py-1 px-1">{row["totCh"]}</div>
              <div id={ `streamedLTP_${row["symbol"]}_${row["productType"]}`} className="py-1 px-1">{row["ltp"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["calPrf"]}
              </div>
              <div id={ `streamedBuyVal_${row["symbol"]}_${row["productType"]}`}  className="py-1 px-1">{row["buyVal"]}</div>
              <div
                className={`py-1 px-1 ${
                  row["realized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["realized_profit"]}
              </div>
              <div id={ `streamedUnrealized_${row["symbol"]}_${row["productType"]}`}
                className={`py-1 px-1 ${
                  row["unrealized_profit"] <= 0 ? "position-row-sell" : "position-row-buy"
                }`}
              >
                {row["unrealized_profit"]}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-11 text-sm text-gray-800 p-2">
            No positions found
          </div>
        )}
      </div>
    </div>


  );
  const renderTable = (data) => (
    <div className="overflow-x-auto w-full">
      {/* Header row */}
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
      </div>

      {/* Body rows */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
        {Array.isArray(data) && data.length > 0 && userLogged ? (
          data.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-11 text-sm text-gray-800 hover:bg-gray-50 transition ${
                row["side"] === "-1" ? "position-row-sell" : "position-row-buy"
              }`}
            >
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
            </div>
          ))
        ) : (
          <div className="grid grid-cols-11 text-sm text-gray-800 p-2">
            No positions found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b mb-2">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "tab1"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() =>{ setActiveTab("tab1");   }  }
        >
        Positions
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "tab2"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => { setActiveTab("tab2"); startStreaming(); } }
        >
         Streaming Positions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tab1" && renderNormalFetchTable(sortedData)}
      {activeTab === "tab2" && renderTable(computedSocketData)} {/* can pass diff dataset */}
    </div>
  );
}
