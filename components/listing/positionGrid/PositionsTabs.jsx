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
   let dispatch = useDispatch();
 const [filteredData , setFilteredData] =useState(() => {
      try {
         let g =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)  || "null" ;
        let positions = undefined;
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
      console.log(`Next poll in ${delay / 1000}s : POSITON TAB`);
      timeoutId = setTimeout(() => startPolling(i + 1), delay);
    };

    // start from iteration 0
    startPolling(0);

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
        {Array.isArray(computedSocketData) && computedSocketData.length > 0 && userLogged ? (
          computedSocketData.map((row, index) => (
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
