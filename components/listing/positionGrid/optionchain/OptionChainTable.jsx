// components/OptionChainTable.jsx
import { useDispatch, useSelector   } from "react-redux";
import  {  useReducer, useState,useEffect, useRef,useMemo, useContext , useCallback, createContext} from 'react';
import { selectFilteredStrikes } from '@/redux/selectors/webSockSelector';
import webSocketSlice, { setConnected }  from '@/redux/slices/webSocketSlice';
//import { selectFilteredStrikes } from "../store/selectors";
//import useWebSocketStream from "@/redux//hooks/useWebSocketStream";
//import useWebSocketStreamSeq   from "@/redux//hooks/useWebSocketStreamSeq";
import { useWebSocketStreamSeq } from "@/redux//hooks/useWebSocketStreamSeqSingle";
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "../placeBuyOrder.actions";
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import { motion, useMotionValue, useTransform , AnimatePresence} from "framer-motion";
import {Lock, Unlock, ArrowRight, ArrowLeft, Check, X, Heading4 } from "lucide-react";
import { Loader2  } from "lucide-react";
import { Settings,  TrendingUp, Wallet, Coins } from 'lucide-react';

import { showModal as modalShow, showError } from '../../../common/service/ModalService';
import "./index.css";

import { ChevronUp, ChevronDown, Calendar } from "lucide-react";
 

// --- Mocking External Dependencies for Runnable Demo ---

// 1. Mock Redux and Actions
const useDispatchDummy = () => (action) => console.log('Dispatching (Mock):', action.type || action);
const useSelectorDummy = (selector) => selector({
  webSocket: {
    strikes: mockStrikes.filter(s => s.expiry === '2025-10-31') // Mock initial data
  }
});
const webSocketSliceDummy = { actions: { setExpiry: (date) => ({ type: 'websocket/setExpiry', payload: date }) } };
const selectFilteredStrikesDummy = (state) => {
    // In a real app, this selector would filter strikes based on expiry
    // Here, we just return mock data
    return mockStrikes; 
};
const placeBuyOrderDummy = (qty, price, strike) => ({ type: 'action/placeBuy', payload: { qty, price, strike } });
const placeSellOrderDummy = (qty, price, strike) => ({ type: 'action/placeSell', payload: { qty, price, strike } });

// 2. Mock Storage/Constants
const StorageUtilsDummy = {
  _retrieve: (key) => ({ isValid: false, data: null }),
  _save: (key, value) => console.log(`Mock Save to Cache: ${key}`),
};
const CommonConstantsDummy = {
  remoteServerGeneralSellErrorBasic: 'MOCK_SELL_ERROR',
  recentSellledOrder: 'MOCK_RECENT_ORDER',
};
// Define the default context value with a no-op function for the request.
// This ensures that sendSubscriptionRequest is always a function,
// preventing the "is not a function" error during initial component rendering.
const defaultContextValue = {
    isConnected: false,
    sendSubscriptionRequest: () => {
        console.warn('Attempted to send subscription request before WebSocket was fully initialized.');
    },
    openSubscriptionRequest: () => {
        console.warn('Attempted to open socket before WebSocketContext and PRovider was fully initialized.');
    },
     rawWs: null,
};
// 1. Create the Context object
const WebSocketContext = createContext(defaultContextValue);
// 2. Custom hook to use the WebSocket features easily
  const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        console.log("use Context ins the same file ")
        // This check ensures the hook is only used inside the Provider
        //throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

 // , []);


// 3. The Provider Component which holds the connection logic
 const WebSocketProvider = ({ children, url , wsInstance, dispatch,  openConnection}) => {
       const [isConnected, setIsConnected] = useState(false);
       const [ optionsWebMap, setOptionsWebMap ]  = useState([]);
       const [ strikeWebMap, setStrikeWebMap ]  = useState([]);
      // const ws = useRef(null);
         // Function to set up the handlers on the external WebSocket instance
 const setupEventHandlers =   useCallback((currentWs , url , dispatch,setIsConnected, setOptMap , setStrikeMap) => {
        if (!currentWs) return;
        // --- WebSocket Event Handlers ---
        // onopen: The initial connection and first subscription request
    //   const { optionsMap, strikeMap ,getOptionsMapFromResponse ,onOpen ,  onMessage,onError, onClose  } =  useWebSocketStreamSeq(url , dispatch);
        currentWs.onopen = (event) => {
            console.log('WebSocket connection opened.');
            let initialRequest =   onOpen();
            setIsConnected(true);
              // Initial subscription request (like your original onOpen logic)
           /* const initialRequest = {
                method: 'addsymbol',
                symbols: ['NIFTY 50', 'NIFTY25100724100CE', 'NIFTY25100724100PE'] // Initial list
            };*/
            currentWs.send(JSON.stringify(initialRequest));
        };
        currentWs.onmessage = (event) => {
            // Your existing onMessage logic to dispatch trades goes here
            // console.log('Received message:', event.data); 
            onMessage(event , setOptMap, setStrikeMap);

        };
        currentWs.onclose = () => {
            console.log('WebSocket connection closed.');
            setIsConnected(false);
        };
         currentWs.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }, []); // setupEventHandlers is stable as it has no external dependencies
     // Initial connection logic (runs once on mount)
    useEffect(() => {
        // Only connect if the URL is provided
        if (!url) return;
         //  ws.current = new WebSocket(url);
         let optionsMap = new Map();
            let strikeMapSymbol = new Map();    
         let symbolsMap = new Map();
         let symbolsStrikeWiseMap =[];
           // if ( ws.current ) {
            if ( wsInstance ) {
               setupEventHandlers( wsInstance , url , dispatch , setIsConnected,setOptionsWebMap ,setStrikeWebMap );
            
            // Set initial connected state based on the instance state
           // setIsConnected(ws.current.readyState === WebSocket.OPEN);
            setIsConnected(wsInstance.readyState === WebSocket.OPEN);
        } else {
            // If the instance is null, we are disconnected
            setIsConnected(false);
        }
       // Cleanup function for unmounting the component
        return () => {
          /* if (ws !== null && ws !== undefined && ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            } */
        };
    }, [wsInstance]);
        // This is the implementation for the requested function:
    // It maps the prop (openConnection) to the user-requested context function name (openSubscriptionRequest)
    const openSubscriptionRequest = useCallback(() => {
        if (typeof openConnection === 'function') {
            console.log('[WS] Triggering external connection attempt...');
            openConnection();
        } else {
            console.error('openConnection function was not provided to WebSocketProvider as a prop.');
        }
    }, [openConnection]);

 
    // Open the socket 
  /*  const openSubscriptionRequest = () => {
           // const { optionsMap, strikeMap   } =  useWebSocketStreamSeq("wss://localhost:8443/",dispatch);
         // On successful connection, send the subscription request
       


             setStrikeWebMap(strikeMap);
           setOptionsWebMap(optionsMap);
            
    }// ); 
    */
    // Function exposed via context to send new subscription requests
    const sendSubscriptionRequest = useCallback((symbols) => {
        //if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            const request = {
                method: 'addsymbol',
                symbols: symbols
            };
             wsInstance.send(JSON.stringify(request));
           // ws.current.send(JSON.stringify(request));
            console.log(`[WS] Sent new subscription request for ${symbols.length} symbols.`);
        } else {
            console.warn('[WS] Cannot send request: WebSocket is not open.');
        }
    }, [wsInstance]);

    // The value that will be provided to consumers (components using useWebSocket)
    const contextValue = {
        isConnected: wsInstance && wsInstance.readyState === WebSocket.OPEN,
        sendSubscriptionRequest,openSubscriptionRequest,
         optionsWebMap, strikeWebMap  ,
         rawWs: wsInstance 
        // You can also expose the raw ws instance if needed, but it's often better to wrap it
        // rawWs: ws.current
    };
     return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}
// Header Component (Updated with Connect Button)
const Header = () => {
    const { isConnected ,openSubscriptionRequest } = useWebSocket();
    
    return (
        <div className="bg-gray-800 text-white p-4 shadow-lg flex justify-between items-center">
            <h1 className="text-xl font-bold">Option Chain Viewer</h1>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={ () =>{  console.log("open clicked"); openSubscriptionRequest();   }}
                    disabled={isConnected}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 
                        ${isConnected 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md'
                        }`}
                >
                    {isConnected ? 'Connected' : 'Connect WebSocket'}
                </button>
                <span className={`px-3 py-1 text-sm rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                    Status: {isConnected ? 'Live' : 'Offline'}
                </span>
            </div>
        </div>
    );
};


// 3. Mock WebSocket Hook (Crucial for passing Expiry Date)
function useWebSocketStreamDummy(expiryDate) {
    const [isConnected, setIsConnected] = useState(false);
    
    // Simulate connection logic based on expiry date change
    useEffect(() => {
        console.log(`[WebSocket Mock]: Attempting to connect/reconnect with Expiry Date: ${expiryDate}`);
        setIsConnected(true);
        // In a real app, this is where you'd send a subscription message to the WS server
        
        const timer = setTimeout(() => {
            console.log(`[WebSocket Mock]: Connected for ${expiryDate}`);
        }, 500);

        // Cleanup: simulate closing the connection
        return () => {
            clearTimeout(timer);
            setIsConnected(false);
            console.log(`[WebSocket Mock]: Disconnected from stream for previous expiry.`);
        };
    }, [expiryDate]);

    // This data would typically come from the Redux store updated by the WS feed
    return {
        isConnected,
        // Using mockStrikes which are defined below
        strikeData: mockStrikes.filter(s => s.expiry === expiryDate), 
    };
}


// --- Mock Data ---
const mockExpiryDates = [
    '2025-10-07', 
    '2025-10-14', 
    '2025-10-28', // Default selected
    '2025-11-07', 
    '2025-11-14'
];

const spot = "25,250.00"; // Current NIFTY/Index Spot Price

// Example structure for a strike row
const mockStrikes = [
    { expiry: '2025-10-31', strike: "25200", call: { ltp: "247.65", bid: "247.10", ask: "247.70" }, put: { ltp: "205.30", bid: "205.10", ask: "205.40" } },
    { expiry: '2025-10-31', strike: "25250", call: { ltp: "200.50", bid: "200.10", ask: "200.70" }, put: { ltp: "225.15", bid: "225.00", ask: "225.20" }, isATM: true },
    { expiry: '2025-10-31', strike: "25300", call: { ltp: "155.10", bid: "155.00", ask: "155.20" }, put: { ltp: "250.75", bid: "250.60", ask: "250.80" } },
    { expiry: '2025-11-07', strike: "25250", call: { ltp: "300.00", bid: "299.80", ask: "300.20" }, put: { ltp: "280.00", bid: "279.90", ask: "280.10" }, isATM: true },
];


// --- NEW Expiry Filter Component ---
function ExpiryFilter({ selectedExpiry, onExpiryChange, expiryOptions , dispatch , resetStrikeMap}) {

    const { isConnected ,sendSubscriptionRequest } = useWebSocket();
   const generateSymbolsForExpiry = (exr) =>{
         let  symbols = ['NIFTY 50', 'NIFTY25100724100CE', 'NIFTY25100724100PE' , 'NIFTY25100724200PE', 'NIFTY25100724200PE', 
                    'NIFTY25100724300CE' , 'NIFTY25100724300PE','NIFTY25100724400CE' , 'NIFTY25100724400PE',
                'NIFTY25100724500CE' , 'NIFTY25100724500PE','NIFTY25100724600CE' , 'NIFTY25100724600PE' ,
                'NIFTY25100724700CE' , 'NIFTY25100724700PE','NIFTY25100724800PE' , 'NIFTY25100724800CE'];
           
            const formatted = symbols.map(date => date.replace(/-/g, "").slice(2));
            console.log(formatted);

          if(exr !==undefined && exr !==null){
               let shrExpr = exr.replace(/-/g,"").slice(2);
              console.log("generated short date : "+shrExpr)
              const newSymbls =     symbols.map( newStr => { 
                      if(newStr.indexOf('CE') >-1 || newStr.indexOf('PE') > -1 ){
                         // let lastCEandStrk = newStr.slice(11, -2);
                          const prefix = newStr.substring(0, 5); // 'NIFTY'
                          const suffix = newStr.substring(11);  // e.g., '24100CE'

                          return prefix+shrExpr+suffix;
                      }
                      else {
                          return newStr;
                      }
                  })
               if( newSymbls !==undefined && Array.isArray(newSymbls)){
                     console.log("generated new sybols : "+JSON.stringify(newSymbls))
                  return newSymbls;
               }
               else {
                return [];
               }
          }
          else {
                return [];
          }


    }
  const makeWebSocketChange = (newExpiry) => {

     // 2. Generate the new set of symbols based on the newExpiry
           const newSymbols = generateSymbolsForExpiry(newExpiry); // This function needs to exist
    
            // 3. Send the new subscription request to the server!
            // This calls the sendSubscriptionRequest function exposed by the Context.
            if (Array.isArray(newSymbols) && newSymbols.length >0 ) {
               if(isConnected){ 
                resetStrikeMap();
                sendSubscriptionRequest(newSymbols); }
               
            }
            else {
                dispatch(showModal({ title: 'Exipry', message: `Exipry: Current only Available `, } ));
            }
  }

    return (
        <div className="relative z-50">
            <label htmlFor="expiry-select" className="block text-xs font-medium text-zinc-600 mb-1">
                Select Expiry Date
            </label>
            <div className="relative">
                <select
                    id="expiry-select"
                    value={selectedExpiry}
                    onChange={(e) =>  {makeWebSocketChange(e.target.value); onExpiryChange(e.target.value)} }
                    className="appearance-none w-full max-w-[200px] bg-white border border-zinc-300 text-gray-800 py-2 pl-3 pr-10 rounded-xl shadow-md 
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer transition"
                >
                    {expiryOptions.map((date) => (
                        <option key={date} value={date}>
                            {date}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                    <Calendar className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}


function ScrollArrows({ value, setValue }) {
  const increment = () => setValue((prev) => Math.min(5 , prev + 1));
  const decrement = () => setValue((prev) => Math.max(0, prev - 1));

  return (
    <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 
                    flex flex-col items-center justify-center 
                    w-5 h-[50px] rounded-lg border border-zinc-400 
                    bg-white shadow-sm">
      {/* Up Arrow */}
      <button
        onClick={increment}
        className="flex-1 w-full flex items-center justify-center 
                   hover:bg-zinc-100 active:bg-zinc-200"
      >
        <ChevronUp className="w-2 h-2 text-zinc-700" />
      </button>

      {/* Divider */}
      <div className="w-full border-t border-b border-zinc-300" />
      
      {/* Down Arrow */}
      <button
        onClick={decrement}
        className="flex-1 w-full flex items-center justify-center 
                   hover:bg-zinc-100 active:bg-zinc-200"
      >
        <ChevronDown className="w-2 h-2 text-zinc-700" />
      </button>
    </div>
  );
}
function PriceValue ({strike, ltp })  { 
     
  return ( `${ltp}` )
}
   
  const optionStrikeMapper   = new Map();
  const optionStrikeQtyMapper   = new Map();

 function VerticalLimitPriceSlider({ idx ,  min = 100, max = 500, step = 1 ,onLimitPrice }) {
 //  console.log(` min ${min} max ${max}  = ` );
  let minNum = isNaN(parseFloat(min)) ? 0 : parseFloat(min);
let maxNum = isNaN(parseFloat(max)) ? 0 : parseFloat(max);
 
let t =  parseInt((minNum + maxNum) / 2) ;
    //let optionStrike =  Array.from(strikeMap.entries()).at(idx);

  //parseInt(Math.round(parseFloat((min + max) / 2)));
  /* if(!optionStrikeMapper.has(idx)) {  optionStrikeMapper.set(idx,min);  prev = min;   return min ; } 
  else { prev = optionStrikeMapper.get(idx);  return  optionStrikeMapper.get(idx); } */
  //console.log("t value  = "+t);
  const [value, setValue] = useState( prev => optionStrikeMapper.has(idx)  ? optionStrikeMapper.get(idx)    : min   );
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-1">
      {/* Floating value indicator */}
      <motion.div
        key={value}
        className="mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >   {/* ₹<PriceValue /> */}
        <span className="px-1   rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
         {value}
        </span>
      </motion.div>

      {/* Vertical Slider */}
      <div className="relative h-12 flex items-center">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => { setValue(Number(e.target.value)); onLimitPrice(Number(e.target.value)); 
              optionStrikeMapper.set(idx,e.target.value);} }
          className="absolute h-12 w-2 appearance-none cursor-pointer
                     bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" }}
          whileTap={{ scale: 1.05 }}
        />
      </div>

      {/* Pill container (for label) */}
       {/*<motion.div
        className="mt-2 flex items-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-full px-4 py-3 flex items-center gap-2">
          <span className="text-indigo-600 font-bold">₹</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Limit Price: <span className="text-indigo-600">₹{value}</span>
          </span>
        </div> 
      </motion.div>*/}
    </div>
  );
}

function SidewaysPriceSlider({ idx, min = 100, max = 500, step = 1, onLimitPrice }) {
  const [value, setValue] = useState(min);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      {/* Floating Value */}
      <motion.div
        key={value}
        className="mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="px-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
          {value}
        </span>
      </motion.div>

      {/* Horizontal Slider */}
      <div className="relative w-40 flex items-center">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            onLimitPrice(Number(e.target.value));
          }}
          className="w-full h-2 appearance-none cursor-pointer rounded-full
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          whileTap={{ scale: 1.05 }}
        />
      </div>
    </div>
  );
}
function LimitPriceSlider({ min = 100, max = 500, step = 1 }) {
  const [value, setValue] = useState((min + max) / 2);

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {/* Pill container */}
      <motion.div
        className="relative flex items-center justify-between rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-full px-2 py-1 flex items-center gap-2">
          <span className="text-indigo-600 font-bold">₹</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {/* */}
            Limit Price: <span className="text-indigo-600">₹{value}</span>
          </span>
        </div>
      </motion.div>

      {/* Slider */}
      <div className="mt-2 px-1">
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          whileTap={{ scale: 1.05 }}
        />
      </div>

      {/* Floating value indicator */}
      <motion.div
        key={value}
        className="mt-2 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">
          ₹{value}
        </span>
      </motion.div>
    </div>
  );
}

function ScrollDial({ value, setValue }) {
  const y = useMotionValue(0);

  // Step size = how many px per number
  const STEP_PX = 30;

  const handleDragEnd = (_, info) => {
    const deltaSteps = Math.round(info.offset.y / STEP_PX);
    if (deltaSteps !== 0) {
      setValue((prev) => Math.max(0, prev  - deltaSteps));
    }

    // Snap back to center after drag
    y.set(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -25, bottom: 10 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      className="absolute right-[-5px] top-1/2 -translate-y-1/2 
                 w-5 h-5 rounded-md border border-zinc-400 
                 bg-white from-zinc-200 to-zinc-400
                 flex flex-col items-center justify-center shadow-inner
                 cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Number display with a dial feel */}
      <motion.div
        style={{ y }}
        className="flex flex-col items-center text-sm font-bold text-zinc-800"
      >
        {/* Active middle (highlighted with blue background) */}
        <div className="h-[25px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
          {value}
        </div>
         {/* <span className="opacity-40">{value + 1}</span> */}
        {/*<span className="text-lg">{value}</span>*}
        {/* <span className="opacity-40">{value - 1 > 0 ? value - 1 : ""}</span>*/}
      </motion.div>
    </motion.div>
  );
}

/* provide a use context to hold the Price and Quantity  set using the controls */ 

//function PriceQuantityContext () { 

    const OptionContext = createContext({ price: 300 , qty: 0});


function OptionProvider({ children }) {
  const [limitPrice, setLimitPrice] = useState(0);
const [quantity, setQuantity] = useState(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ))  );

  const increment = () => setLimitPrice(v => v );
  const decrement = () => setLimitPrice(v => v - 1);
  const increase = () => setQuantity(v => v );
  const decrease = () => setQuantity(v => v - 1);

  return (
    <OptionContext.Provider value={{ limitPrice, increment, decrement, quantity , increase ,  decrease }}>
      {children}
    </OptionContext.Provider>
  );
}

//}

/* ----------------------------------------------------------------------------
   SWIPE Call PILL COMPONENT
   ----------------------------------------------------------------------------
   - Reusable draggable pill
   - Swiping LEFT = SELL, RIGHT = BUY
   - Dynamic background changes based on drag direction
   - Action confirmed on drag release if threshold is crossed
----------------------------------------------------------------------------- */
function SwipeCallPill({ idx , side, label,ltp, subtitle, onBuy, onSell, className = "" }) {
  const x = useMotionValue(0);
    const [locked, setLocked] = useState(false); // 🔒 NEW
  const [quantity, setQuantity] = useState(x  => { 
    
          if( optionStrikeQtyMapper.has(idx))  { 
             let y =  optionStrikeQtyMapper.get(idx);
             return  parseInt(75 * ( parseInt(( y !== null && y !== undefined) ? y : 0 ) ));
          } 
          else { 

              let y  =   parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ));
              optionStrikeQtyMapper.set(idx, y);
              return y ;
          }    
    
       }  ); // quantity state
 
 
    const [limitPrice, setLimitPrice] = useState(ltp);
 // const { limitPrice, increment, decrement } = useContext(OptionContext);
//  const { quantity, increase, decrease } = useContext(OptionContext);
 // Background color changes when dragging
  const bg = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    [
      "#fee2e2", // far sell (red)
      "#fecaca", // near sell
      "#f4f4f5", // neutral
      "#bbf7d0", // near buy
      "#86efac", // far buy
    ]
  );
    // Show hint arrows based on drag position
    const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
    const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);
  
    // Flash small toast after action
    const [justAction, setJustAction] = useState(null);
    function roundToNearest5(num) {
      // ensure number
      let n = parseFloat(num);
      if (isNaN(n)) return 0;

      // round to nearest multiple of 5
      let rounded = Math.round(n / 5) * 5;

      // keep 2 decimal places
      return parseFloat(rounded.toFixed(2));
    }
    const handleDragEnd = (_, info) => {
       if (locked) return; // 🚫 don’t trigger when locked
      const threshold = 90; // how far user must drag to trigger action
      if (info.offset.x > threshold) {
        setJustAction("BUY");
        onBuy?.(parseInt(quantity*75) , roundToNearest5(limitPrice ) );
      } else if (info.offset.x < -threshold) {
        setJustAction("SELL");
        onSell?.(parseInt(quantity*75), roundToNearest5(limitPrice ));
      }
    };
     const screwRotation = useMotionValue(0);

      // Each "click" = 15 degrees
      const STEP_DEG = 15;
      const onLimit = (price ) => { 
          setLimitPrice(price);
            //optionStrikeQtyMapper.set(idx, price);
      }
      const handleScrewDragEnd = (_, info) => {
        const delta = info.offset.y;
        // Up decreases quantity, Down increases
        const stepChange = Math.round(delta / 20); // 20px drag = 1 step
        if (stepChange !== 0) {
          setQuantity((q) => Math.max(1, q + stepChange));
              optionStrikeQtyMapper.set(idx, quantity);
          // Snap rotation to step
          const snapped = Math.round(screwRotation.get() / STEP_DEG) * STEP_DEG;
          screwRotation.set(snapped);
        }
      };
     const [orderStatus, setOrderStatus] = useState("");
       const [visible, setVisible] = useState(false)
  useEffect(() => {
         //increase(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) )) )
    const timer = setTimeout(() => {
      const sellStatus = StorageUtils._retrieve(CommonConstants.remoteServerGeneralSellErrorBasic);
        const recentSellORder  = StorageUtils._retrieve(CommonConstants.recentSellledOrder);
      if (sellStatus?.isValid && sellStatus.data !== null) {
        console.log("sellStatus.data  "+JSON.stringify(sellStatus.data));
        let p =   sellStatus.data !=='' ?  JSON.parse(sellStatus.data):"";
         let r = (recentSellORder.data !==undefined && recentSellORder.data !== "" )  ?  JSON.parse(recentSellORder.data) : "";
        if ((p !== null &&  p.indexOf("Exception S") > -1 ) || 
       ( ( r.code !== undefined ) &&   r.code !== 1101)) {
          setOrderStatus("Order failed");
           setVisible(true);
          setTimeout(() =>{setVisible(false);   } , 2000);
          StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
          /* let orderSold=  document.getElementById("orderFailedStatus");
           orderSold.setAttribute('display','block')
              setTimeout(() => {
                  let orderSold=  document.getElementById("orderFailedStatus");
                 orderSold.setAttribute('display','none')
                 orderSold.style.display = 'none';;
              },2000);*/
        } else if(( ( r.code !== undefined ) &&   r.code === 1101)) {
          setOrderStatus("Order placed ");
          setVisible(true);
          setTimeout(() =>{setVisible(false);   }, 2000);
           StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
           StorageUtils._save(CommonConstants.recentSellledOrder,"");
          /*let orderSold=  document.getElementById("orderSuccessStatus");
            orderSold.setAttribute('display','block');
             setTimeout(() => {
                  let orderSold=  document.getElementById("orderSuccessStatus");
                 orderSold.setAttribute('display','none');
                 orderSold.style.display = 'none';
              },2000);*/
        }
      }
    },3500); 
      return () => {  clearTimeout(timer);  /*let orderFailedStatus=  document.getElementById("orderFailedStatus");
            let orderSold=  document.getElementById("orderSuccessStatus");
               orderSold?.setAttribute('display','none');
               orderFailedStatus?.setAttribute('display','none')*/

         } // cleanup
  }, []);

    return (
       <div className={`relative w-full select-none ${className}`}>

         {/* Lock Button */}
      <button
        onClick={() => setLocked(!locked)}
        className="absolute -top-2 -right-2 z-20 rounded-full bg-zinc-200 p-1 shadow hover:bg-zinc-300"
      >
        {locked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>


         {/* Action hints in background */}
          {!locked && ( <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 py-2">
           <motion.div
             style={{ opacity: opacitySell }}
             className="flex items-center gap-2 text-red-600 text-[11px]"
           >
             <ArrowLeft size={14} /> <span>Slide to Sell</span>
           </motion.div>
           <motion.div
             style={{ opacity: opacityBuy }}
             className="flex items-center gap-2 text-green-700 text-[11px]"
           >
             <span>Slide to Buy</span> <ArrowRight size={14} />
           </motion.div>
         </div>
           )}
   
         {/* Draggable Card */}
         <motion.div
            drag={locked ? false : "x"}   // 🚀 disable drag if locked
           dragConstraints={{ left: -160, right: 160 }}
           dragElastic={0.15}
           whileTap={{ scale: 0.98 }}
           onDragEnd={handleDragEnd}
           style={{ x, background: bg }}
           className="relative z-10 grid grid-cols-[1fr_auto] items-center rounded-2xl border border-zinc-300 px-3 py-2 shadow-sm"
         >
           <div>
             {/*<div className="text-[13px] font-semibold leading-5 tracking-tight">
               {label}          <div className="font-semibold leading-5 tracking-tight">{ltp}</div>
             </div>*/}
             <div className="flex justify-between items-center text-[13px] font-semibold leading-5 tracking-tight">
               <span>  {label}     </span>
               <span>{ltp}</span>
             </div>
             <div className="text-[11px] text-zinc-600">{subtitle}</div>
           </div>
           <div className="flex items-center gap-2 text-[10px]">
             <span
               className={`px-2 py-0.5 rounded-full ${
                 side === "CALL"
                   ? "bg-emerald-600/10 text-emerald-700"
                   : "bg-blue-600/10 text-blue-700"
               }`}
             >
               {side}
             </span>  {/*parseInt(Math.round(parseFloat(  )))    parseInt(Math.round(parseFloat(  )))*3     */}
 <SidewaysPriceSlider   idx={idx} min={ltp} max={  600   } step={1}  onLimitPrice  ={ onLimit } />
                {/*  onSell={(qty) => onAction?.({ side: "CALL", action: "SELL", qty:qty, strike, row })} */}
             <div className="h-[5px] right-[-56px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
                   {parseInt(quantity * 75)}
               </div>
           </div>
           {/* Scroll wheel dial ScrollDial*/}
           <ScrollArrows value={quantity} setValue={setQuantity} />


         </motion.div>
   
         {/* Small Toast on Action */}
         {justAction && (
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] flex items-center gap-1">
             {justAction === "BUY" ? (
               <span className="text-green-700 flex items-center gap-1">
                 <Check size={12} /> Bought
               </span>
             ) : (
               <span className="text-red-600 flex items-center gap-1">

                {/* <X size={12} /> Sold
                      {visible && orderStatus === "FAILED" && (*/} 
              <span id="orderFailedStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} />   {orderStatus}
              </span>
            {/*  )}

           {visible && orderStatus === "SOLD" && (
              <span  id="orderSuccessStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} /> Sold
              </span>
            )}*/} 
               </span>
             )}
           </div>
         )}
       </div>
     );
   }



/* ----------------------------------------------------------------------------
   SWIPE PUT PILL COMPONENT
   ----------------------------------------------------------------------------
   - Reusable draggable pill
   - Swiping LEFT = SELL, RIGHT = BUY
   - Dynamic background changes based on drag direction
   - Action confirmed on drag release if threshold is crossed
----------------------------------------------------------------------------- */
function SwipePutPill({ idx,  side, label,ltp, subtitle, onBuy, onSell, className = "" }) {
  const x = useMotionValue(0);
  const [locked, setLocked] = useState(false); // 🔒 NEW
  // inside component
const [loading, setLoading] = useState(false);

 const [quantity, setQuantity] = useState(x  =>  { 
    
          if( optionStrikeQtyMapper.has(idx))  { 
             let y =  optionStrikeQtyMapper.get(idx);
             return  parseInt(75 * ( parseInt(( y !== null && y !== undefined) ? y : 0 ) ));
          } 
          else { 

              let y  =   parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ));
              optionStrikeQtyMapper.set(idx, y);
              return y ;
          }    
    
       });
 //useState(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) ))  ); // quantity state
const [limitPrice, setLimitPrice] = useState(ltp);
 //const { limitPrice, increment, decrement } = useContext(OptionContext);
 //const { quantity, increase, decrease } = useContext(OptionContext);
   
 // Background color changes when dragging
  const bg = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    [
      "#fee2e2", // far sell (red)
      "#fecaca", // near sell
      "#f4f4f5", // neutral
      "#bbf7d0", // near buy
      "#86efac", // far buy
    ]
  );
    // Show hint arrows based on drag position
    const opacitySell = useTransform(x, [-140, -60, 0], [1, 1, 0]);
    const opacityBuy = useTransform(x, [0, 60, 140], [0, 1, 1]);
  
    // Flash small toast after action
    const [justAction, setJustAction] = useState(null);
    function roundToNearest5(num) {
      // ensure number
      let n = parseFloat(num);
      if (isNaN(n)) return 0;

      // round to nearest multiple of 5
      let rounded = Math.round(n / 5) * 5;

      // keep 2 decimal places
      return parseFloat(rounded.toFixed(2));
    }
    /*const handleDragEnd = (_, info) => {
      const threshold = 90; // how far user must drag to trigger action
      if (info.offset.x > threshold) {
        setJustAction("BUY");
        onBuy?.(parseInt(quantity*75) , roundToNearest5(limitPrice ) );
      } else if (info.offset.x < -threshold) {
        setJustAction("SELL");
        onSell?.(parseInt(quantity*75), roundToNearest5(limitPrice ));
      }
    };*/
    const handleDragEnd = async (_, info) => {
      const threshold = 90;
      if (info.offset.x > threshold) {
        setLoading(true);
        setJustAction("BUY");
        await onBuy?.(parseInt(quantity * 75), roundToNearest5(limitPrice));
        setLoading(false);
      } else if (info.offset.x < -threshold) {
        setLoading(true);
        setJustAction("SELL");
        await onSell?.(parseInt(quantity * 75), roundToNearest5(limitPrice));
        setLoading(false);
      }
    };
     const screwRotation = useMotionValue(0);

      // Each "click" = 15 degrees
      const STEP_DEG = 15;
      const onLimit = (price ) => { 
         // increment(price);
          setLimitPrice(price);
      }
      const handleScrewDragEnd = (_, info) => {
        const delta = info.offset.y;
        // Up decreases quantity, Down increases
        const stepChange = Math.round(delta / 20); // 20px drag = 1 step
        if (stepChange !== 0) {
         // setQuantity((q) => Math.max(1, q + stepChange));
          increase((q) => Math.max(1, q + stepChange));
          // Snap rotation to step
          const snapped = Math.round(screwRotation.get() / STEP_DEG) * STEP_DEG;
          screwRotation.set(snapped);
        }
      };
     const [orderStatus, setOrderStatus] = useState("");
       const [visible, setVisible] = useState(false)
  useEffect(() => {
        // increase(x  =>    parseInt(75 * ( parseInt(( x !== null && x !== undefined) ? x : 0 ) )) )

    const timer = setTimeout(() => {
      const sellStatus = StorageUtils._retrieve(CommonConstants.remoteServerGeneralSellErrorBasic);
      const recentSellORder  = StorageUtils._retrieve(CommonConstants.recentSellledOrder);
      if ((sellStatus?.isValid && sellStatus.data !== null )|| 
           (recentSellORder?.isValid && recentSellORder.data !== null)) {
        console.log("sellStatus.data  "+JSON.stringify(sellStatus.data));
        let p = sellStatus.data !=="" ?  JSON.parse(sellStatus.data) : "";
             let r = (recentSellORder.data !==undefined && recentSellORder.data !=="")  ?  
                      JSON.parse(recentSellORder.data) : "";
        if ((p !== null && p.indexOf("Exception S") > -1) ||( ( r.code !== undefined ) &&   r.code !== 1101)) {
          setOrderStatus("Order failed");
           setVisible(true);
          setTimeout(() =>{setVisible(false);   } , 2000);
          StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
          /* let orderSold=  document.getElementById("orderFailedStatus");
           orderSold.setAttribute('display','block')
              setTimeout(() => {
                  let orderSold=  document.getElementById("orderFailedStatus");
                 orderSold.setAttribute('display','none')
                 orderSold.style.display = 'none';;
              },2000);*/
        } else if(( ( r.code !== undefined ) &&   r.code === 1101)) {
          setOrderStatus("Order placed ");
          setVisible(true);
          setTimeout(() =>{setVisible(false);   }, 2000);
           StorageUtils._save(CommonConstants.remoteServerGeneralSellErrorBasic,"");
           StorageUtils._save(CommonConstants.recentSellledOrder,"");
          /*let orderSold=  document.getElementById("orderSuccessStatus");
          /*let orderSold=  document.getElementById("orderSuccessStatus");
            orderSold.setAttribute('display','block');
             setTimeout(() => {
                  let orderSold=  document.getElementById("orderSuccessStatus");
                 orderSold.setAttribute('display','none');
                 orderSold.style.display = 'none';
              },2000);*/
        }
      }
    },3500); 
      return () => {  clearTimeout(timer);  /*let orderFailedStatus=  document.getElementById("orderFailedStatus");
            let orderSold=  document.getElementById("orderSuccessStatus");
               orderSold?.setAttribute('display','none');
               orderFailedStatus?.setAttribute('display','none')*/

         } // cleanup
  }, []);
    // <div className={`relative w-full select-none ${className}`}>
    // draggable={!locked} // 🚀 disable dragging when locked
    return (
       <div className={`relative flex items-center rounded-2xl p-2 transition 
        ${locked ? "opacity-70" : "cursor-grab"}`}
        
       >
        {/* Lock button */}
        <button
          onClick={() => setLocked(!locked)}
          className="absolute -right-5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 shadow"
        >
          {locked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

         {/* Action hints in background */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 py-2">
           <motion.div
             style={{ opacity: opacitySell }}
             className="flex items-center gap-2 text-red-600 text-[11px]"
           >
             <ArrowLeft size={14} /> <span>Slide to Sell</span>
           </motion.div>
           <motion.div
             style={{ opacity: opacityBuy }}
             className="flex items-center gap-2 text-green-700 text-[11px]"
           >
             <span>Slide to Buy</span> <ArrowRight size={14} />
           </motion.div>
         </div>
   
         {/* Draggable Card */}
         <motion.div
            drag={locked ? false : "x"}   // 🚀 disable drag if locked
          
           dragConstraints={{ left: -160, right: 160 }}
           dragElastic={0.15}
           whileTap={{ scale: 0.98 }}
           onDragEnd={handleDragEnd}
           style={{ x, background: bg }}
           className="relative z-10 grid grid-cols-[1fr_auto] items-center rounded-2xl border border-zinc-300 px-3 py-2 shadow-sm"
         >
           <div>
             {/*<div className="text-[13px] font-semibold leading-5 tracking-tight">
               {label}          <div className="font-semibold leading-5 tracking-tight">{ltp}</div>
             </div>*/}
             <div className="flex justify-between items-center text-[13px] font-semibold leading-5 tracking-tight">
               <span>  {label}     </span>
               <span>{ltp}</span>
             </div>
             <div className="text-[11px] text-zinc-600">{subtitle}</div>
           </div>
           <div className="flex items-center gap-2 text-[10px]">
             <span
               className={`px-2 py-0.5 rounded-full ${
                 side === "CALL"
                   ? "bg-emerald-600/10 text-emerald-700"
                   : "bg-blue-600/10 text-blue-700"
               }`}
             >
               {side}
             </span>  {/*parseInt(Math.round(parseFloat(  )))    parseInt(Math.round(parseFloat(  )))*3     */}
 <SidewaysPriceSlider  idx={idx}    min={ltp} max={  600   } step={1}  onLimitPrice  ={ onLimit } />
                {/*  onSell={(qty) => onAction?.({ side: "CALL", action: "SELL", qty:qty, strike, row })} */}
             <div className="h-[5px] right-[-56px] w-full flex items-center justify-center 
                        bg-grey-400 dark:text-white font-bold text-base">
                   {parseInt(quantity * 75)}
               </div>
           </div>
           {/* Scroll wheel dial ScrollDial*/}
           <ScrollArrows value={quantity} setValue={setQuantity} />


         </motion.div>
         {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 rounded-2xl">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}
   
         {/* Small Toast on Action */}
         {justAction && (
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] flex items-center gap-1">
             {justAction === "BUY" ? (
               <span className="text-green-700 flex items-center gap-1">
                 <Check size={12} /> Bought
               </span>
             ) : (
               <span className="text-red-600 flex items-center gap-1">

                {/* <X size={12} /> Sold
                      {visible && orderStatus === "FAILED" && (*/} 
              <span id="orderFailedStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} />   {orderStatus}
              </span>
            {/*  )}

           {visible && orderStatus === "SOLD" && (
              <span  id="orderSuccessStatus" className="text-red-600 flex items-center gap-1">
                <X size={12} /> Sold
              </span>
            )}*/} 
               </span>
             )}
           </div>
         )}
       </div>
     );
   }

// Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Mock data for demonstration and initial state setup
//const spot = "25,250.00";
const strikes = [
  { name: "NIFTY25093025200CE", strike: "25200", call: { ltp: "247.65", bid: "247.1", ask: "248.5" }, put: { ltp: "68.65", bid: "68.45", ask: "69.1" } },
  { name: "NIFTY25093025100CE", strike: "25100", call: { ltp: "326.45", bid: "325.35", ask: "327.1" }, put: { ltp: "46.8", bid: "46.65", ask: "47.2" } },
  { name: "NIFTY25093025300CE", strike: "25300", call: { ltp: "180.7", bid: "180.3", ask: "181.5" }, put: { ltp: "101.05", bid: "100.8", ask: "101.6" } },
  { name: "NIFTY25093025000PE", strike: "25000", call: { ltp: "400.10", bid: "399.50", ask: "400.80" }, put: { ltp: "35.20", bid: "35.10", ask: "35.50" } },
];

const mockFunds = {
  totalPnl: 102.05,
  fundAvailable: 45000.00,
  marginUsed: 5400.00,
};




  // Framer Motion variants for the modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 50 },
  };

/* ----------------------------------------------------------------------------
   PILL WITH CONTROLS COMPONENT
   ----------------------------------------------------------------------------
   - Extracted a wrapper
   - This wont repeat slider/lock logic for both sides.
   - The strike price remains centered only on desktop. Middle strike price (desktop only)
----------------------------------------------------------------------------- */

function PillWithControls({ idx, min=100, max=600 , step=1 ,  onLimit  ,  children }) {
  const [locked, setLocked] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      {/* The pill (CALL or PUT) */}
      <div className="flex-1">{children}</div>

      {/* Sideways slider */}
      <div className="w-28">
        <SidewaysPriceSlider  idx={idx}    min={ltp} max={  600   } step={1}  onLimitPrice  ={ onLimit } />
      </div>

      {/* Lock button */}
      <button
        onClick={() => setLocked(!locked)}
        className="absolute -right-8 flex items-center justify-center w-6 h-6 rounded-full 
                   bg-gray-200 hover:bg-gray-300 transition"
      >
        {locked ? (
          <Lock size={14} className="text-gray-600" />
        ) : (
          <Unlock size={14} className="text-gray-600" />
        )}
      </button>
    </div>
  );
}




/* ----------------------------------------------------------------------------
   OPTION ROW COMPONENT
   ----------------------------------------------------------------------------
   - Displays one strike row
   - CALL pill on left, PUT pill on right
   - Middle strike price (desktop only)
----------------------------------------------------------------------------- */
function OptionRow({  idx ,  row, onAction }) {
  const [locked, setLocked] = useState(false);
  const strike = row.strike;
  const type =  row.type;
     const ltp = row.ltp;
  // handler when slider changes
  const handleLimitPrice = (price) => {
    onAction?.({ side: type === "CE" ? "CALL" : "PUT", action: "LIMIT", price, strike, row });
  };
  //   {/* <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">*/}
  // <PillWithControls idx={idx} min={ltp} max={600} step={1}onLimit={handleLimitPrice}>
  /* <motion.div
      className="relative grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] 
                 gap-2 sm:gap-3 items-center p-2 sm:p-0 rounded-2xl 
                 bg-white sm:bg-transparent shadow"
      drag={!locked} // ✅ disable drag when locked
      dragConstraints={{ left: -50, right: 50 }} // example constraint
      dragElastic={0.1}
    > 
   */
  return (
  
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0"> 
    {/* CALL pill */}
      {type ==="CE" && (    <SwipeCallPill
         idx = {idx}
        side="CALL"
        label={`CALL ${strike}`}
        ltp = {`₹${row.ltp}` }
        subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
        onBuy={(qty,price) => onAction?.({ side: "CALL", action: "BUY",qty:qty,price:price, strike, row })}
        onSell={(qty,price) => onAction?.({ side: "CALL", action: "SELL", qty:qty,price:price, strike, row })}
        className="sm:order-1"
      />
       
      )
      }
     

      {/* Strike (desktop only) */}
      <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
        {strike}
      </div>

      {/* PUT pill */}
        {type ==="PE" && (   
          <SwipePutPill
          idx = {idx}
          side="PUT"
          label={`PUT ${strike}`}
          ltp = {`₹${row.ltp}` }
          subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
          onBuy={(qty,price) => onAction?.({ side: "PUT", action: "BUY",qty:qty,price:price, strike, row })}
          onSell={(qty,price) => onAction?.({ side: "PUT", action: "SELL",qty:qty,price:price, strike, row })}
          className="sm:order-3"
        />
       
       )
      } 
      
    </div>
  );
}


export default function OptionChainTable() {
    const dispatch = useDispatch();
        const url =  "wss://artilleryfeed.onrender.com/";
//"wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55"; //'wss://localhost:8443/';
     // 1. Call the external hook logic
    const { ws, connect ,strikeMap ,  resetStrikeMap } = useWebSocketStreamSeq(url, dispatch);
     // do not do this it will cause all parsed spot and stikes and symbols empty
     /*const [state, dispatch] = useReducer(webSocketSlice, {
            symbol: null,
            name: null,
            time:null,
            price:null,
            searchTickers: null,
            tickerBook: undefined,
            niftyBook: undefined,
            sensexBook: undefined,
            bankNiftyBook: undefined,
            tickerMap: {},   // 👈 initialize empty object
            orderBook: undefined,
            expiries:[],
            selectedExpiry:null,
            spot: null,
            symbols: [],
            connected: false,
    }); */
   // activate WebSocket listener
  //  const { optionsMap, strikeMap } =  useWebSocketStream("wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55",dispatch);
   // THIS IS TO access and send the Expipry CHANGE request 
   const {  optionsWebMap ,strikeWebMap ,sendSubscriptionRequest } = useWebSocket();
  // const { openSubscriptionRequest ,sendSubscriptionRequest , optionsWebMap ,strikeWebMap  } = useWebSocket();
  //  const { optionsMap, strikeMap } =  useWebSocketStreamSeq("wss://localhost:8443/",dispatch);
 /*   // suppose niftyMap already exists (Map<name, valueArray>)
  const sortedEntries = [...strikeMap?.entries()].sort(([, a], [, b]) => {
  // a[0] is name according to our value array structure
  const strikeA = Number(a[0].slice(11, -2));
  const strikeB = Number(b[0].slice(11, -2));

  if (Number.isFinite(strikeA) && Number.isFinite(strikeB)) {
  if (strikeA !== strikeB) return strikeA - strikeB;
  // tie-break by type (CE before PE alphabetically)
  const typeA = a[0].slice(-2), typeB = b[0].slice(-2);
  return typeA.localeCompare(typeB);
  }

  // fallback: keep original order
  return 0;
  });*/
   const [ arrayMap , setArrayMap ] = useState( mp => [new Map()])
  const spot = useSelector((state) => state.websocket.spot);
    const symbols = useSelector((state) => state.websocket.symbols);
     const [options , setOptions ]=  useState([]);// useSelector((state) => state.websocket.options);
     const globOptions = useSelector((state) => state.websocket.options);
    const [uniqOpt, setUniqOpt] = useState([]);
  let strikes = useSelector(selectFilteredStrikes);
  //opts => strikes.length > 0 ?   [...strikes]:  Array.isArray(opts) ? [...opts]: []
  const [optionStrikes , setOptionStrikes] = useState([]);
  const status = useSelector((state) => state.websocket.subscriptionStatus);
 // Mock useSelector for demonstration purposes
  //const status = undefined; // Replace with your actual Redux status
  const [showModal, setShowModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    //  const [optionStrikes, setOptionStrikes] = useState([]);
  // Mock Position Generator based on cached strikes
  const currentPositions = optionStrikes.slice(0, 3).map((s, index) => ({
    strike: s.strike,
    type: index % 2 === 0 ? 'CALL' : 'PUT',
    quantity: (index + 1) * 50,
    ltp: parseFloat(index % 2 === 0 ? s.call?.ltp : s.put?.ltp),
    pnl: (index % 3 === 0 ? 1 : -1) * (index + 1) * 125.50,
  }));

  // State for the selected expiry date
    const [selectedExpiry, setSelectedExpiry] = useState(mockExpiryDates[1]); // Default to the second date

    // Use the mock hook to simulate data streaming
    const { isConnected, strikeData } = useWebSocketStreamDummy(selectedExpiry);
    const generateSymbolsForExpiry = (exr) =>{
         let  symbols = ['NIFTY 50', 'NIFTY25100724100CE', 'NIFTY25100724100PE' , 'NIFTY25100724200PE', 'NIFTY25100724200PE', 
                    'NIFTY25100724300CE' , 'NIFTY25100724300PE','NIFTY25100724400CE' , 'NIFTY25100724400PE',
                'NIFTY25100724500CE' , 'NIFTY25100724500PE','NIFTY25100724600CE' , 'NIFTY25100724600PE' ,
                'NIFTY25100724700CE' , 'NIFTY25100724700PE','NIFTY25100724800PE' , 'NIFTY25100724800CE'];
           
            const formatted = symbols.map(date => date.replace(/-/g, "").slice(2));
            console.log(formatted);

          if(exr !==undefined && exr !==null){
               let shrExpr = exr.replace(/-/g,"").slice(2);
              console.log("generated short date : "+shrExpr)
              const newSymbls =     symbols.map( newStr => { 
                      if(newStr.indexOf('CE') >-1 || newStr.indexOf('PE') > -1 ){
                          let lastCEandStrk = newStr.slice(11, -2);
                          return 'NIFTY'+shrExpr+lastCEandStrk;
                      }
                      else {
                          return newStr;
                      }
                  })
               if( newSymbls !==undefined && Array.isArray(newSymbls)){
                     console.log("generated new sybols : "+JSON.stringify(newSymbls))
                  return newSymbls;
               }
               else {
                return [];
               }
          }
          else {
                return [];
          }


    }
    const handleExpiryChange = (newExpiry) => {
        setSelectedExpiry(newExpiry);

         // 2. Generate the new set of symbols based on the newExpiry
        /*   const newSymbols = generateSymbolsForExpiry(newExpiry); // This function needs to exist
    
            // 3. Send the new subscription request to the server!
            // This calls the sendSubscriptionRequest function exposed by the Context.
            if (Array.isArray(newSymbols) && newSymbols.length >0 ) {
                 sendSubscriptionRequest(newSymbols);
            }
            else {
                dispatch(showModal({ title: 'Exipry', message: `Exipry: Current only Available `, } ));
            }
           */
        // In a real Redux app, you would dispatch an action here
         //  dispatch(webSocketSliceDummy.actions.setExpiry(newExpiry));
    };

    const displayStrikes = useMemo(() => {
        // Filter mock data based on selectedExpiry
        return mockStrikes.filter(s => s.expiry === selectedExpiry);
    }, [selectedExpiry]);

   // Caching logic for strikes data
  useEffect(() => {
    if (strikes.length > 0) {
      setOptionStrikes(strikes);
    }
  }, [strikes]);

    useEffect(() => {
        /* Array.from(
             new Set<string>(state.symbols.map ( sy => JSON.stringify(sy)))   
            );  // //action.payload.map((s:any) => s.expiry)
        */
        setUniqOpt(new Set(symbols.map ( sy =>  sy.id)))
       setTimeout( () => { console.log("opening websckoer ..");/* openSubscriptionRequest();*/},54001)
  }, []);

   useEffect(() => {
   
    // Check if the status is a valid string (not undefined or null)
    setInterval(() => {
       // strikes = useSelector(selectFilteredStrikes);
       setOptions(opts =>   opts  = globOptions );
      } , 1000)
  }, [globOptions]);
    // Use useEffect to manage modal visibility based on a valid status value.
  // This prevents the modal from showing on initial render when status is undefined.
  useEffect(() => {
     //useWebSocketStream("wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55",dispatch);
    // Check if the status is a valid string (not undefined or null)
    if (typeof status === 'string' && status.length > 0) {
      setShowModal(true);
    }
  }, [status]); // Only re-run when the status value changes


   // Use useEffect to cache the strikes data
  useEffect(() => {
    // Only update the state if the strikes array is not empty
    if (strikes.length > 0) {
      setOptionStrikes(strikes);
    }
     setUniqOpt(new Set(symbols.map ( sy =>  sy.id)))
    
   
  }, [strikes]); // The effect runs whenever the 'strikes' array changes

  /*
  // Use useEffect to manage modal visibility based on a valid status value.
  // This prevents the modal from showing on initial render when status is undefined.
  useEffect(() => {
    // Check if the status is a valid string (not undefined or null)
    if (typeof status === 'string' && status.length > 0) {
      setShowModal(true);
    }
    if(strikes !==null && strikes !==undefined){
      setOptionStrikes(optS => { 
          if ( strikes.length > 0 ) { 
                 let cop = [...strikes];
             optS = cop;
             return optS;
             }
             else {
             return Array.isArray(optS) ? [...optS]: []
             }
         //    
            
            });
    }



  }, [strikes , status]); // Only re-run when the status value changes
  */

    // Action log
    const [log, setLog] = useState([]);
    const handleAction = (evt) => {
      setLog((prev) => [
        { time: new Date().toLocaleTimeString(), ...evt },
        ...prev,
      ].slice(0, 6));
  
      // Replace with your API call:
      // placeOrder(evt)
      /*
      Trade Executed: 
        {side: 'PUT', action: 'BUY', strike: '25100', row: {…}}
        action
        : 
        "BUY"
        row
        : 
        {strike: '25100', id: '302418025', type: 'PE', timestamp: '2025-09-23T15:31:12', ltp: '65', …}
        side
        : 
        "PUT"
        strike
        : 
        "25100"
        [[Prototype]]
        : 
        Object
      */
       let table = new Map();
        table.set('250930','25SEP')
        table.set('251007','25O07')
        table.set('251014','25O14')
        table.set('251021','25O21')
        table.set('251028','25O28')
        let exp = table.get(evt.row.expiry);
      let sellord = { qty: evt.qty, price : evt.price , symbol : 'NIFTY'+exp+evt.row.strike+evt.row.type  }
      console.log(`place order Selected: ${JSON.stringify(sellord)}`); 
      // validate price and qty 
      if(parseInt(sellord.price) <= 0 || parseInt(sellord.qty) <= 0){
           dispatch(modalShow({ title: 'Validate', message: `Quantity: ${sellord.qty} or Price: ${sellord.price} invalid `, } ));
           return;
      }
      // place order Selected: {"qty":75,"price":"145.85","symbol":"NSE:NIFTY25093025300PE"}
      if( evt.action == 'SELL'){
         StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: sellord.qty, 
         price: sellord.price , symbol: sellord.symbol}));
        dispatch(placeSellOrder({ _id: '' , qty: sellord.qty, price: sellord.price , symbol:sellord.symbol}));
     }
      if( evt.action == 'BUY'){
         StorageUtils._save(CommonConstants.recentBuyOrderPlacedExclusive, JSON.stringify({ _id: '' , qty: sellord.qty, 
         price: sellord.price , symbol: sellord.symbol}));
        dispatch(placeBuyOrder({ _id: '' , qty: sellord.qty, price: sellord.price , symbol:sellord.symbol}));
     }
     
     
     // if(selectedSymbol && (symbolArray.length > 0) && positionPrice > 0 && positionQty > 0 ) {  
            // const qtyNum = Number(tradeSet.qty);
           // const priceNum = Number(tradeSet.price);
      //        StorageUtils._save(CommonConstants.recentSellledOrder, JSON.stringify({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
      //        dispatch(placeSellOrder({ _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol}));
    //    }




      console.log("Trade Executed:", evt);
    };
  





  return (
    <div className="p-4">
      {/* Conditionally render the modal if showModal is true */}
      {showModal && <>
             {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* shadow-xl  not needed  */}
            <div className="bg-white rounded-xl  p-6 w-[300px] max-w-[90%] border border-gray-200">
            {/*  <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Confirm Order</h3>*/}

              <div className="flex items-center justify-between space-x-2">
                 
                <button
                  
                  className="flex-1 bg-brandgreen-600  py-1 rounded-lg hover:bg-green-700 transition"
                >
                 {status}
                </button>
 
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 block mx-auto"
              >
                Ok
              </button>
            </div>
          </div>
      
      </>}
      {/* Conditionally render the table if showModal is false url="wss://localhost:8443/" dispatch={dispatch}*/}
      {!showModal && <>
                    <WebSocketProvider wsInstance={ws} openConnection={connect} >  
                     <Header/>
                <div className=" w-full bg-zinc-50 sm:bg-white p-1 sm:p-2"> {/* min-h-screen (gap between positon removed)  p-3 sm:p-6  */}
                    <div className="mx-auto overflow-hidden">{/*   max-w-4xl  */}
                      
                            {/* Header and Filter */}
                      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6">
                          <div>
                              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                                  <TrendingUp className="w-6 h-6 text-indigo-600" /> NIFTY  
                              </h1>
                              <p className="text-sm text-zinc-500 mt-1">
                                  Current Spot Price: <span className="font-semibold text-indigo-600">₹{spot}</span>
                              </p>
                              <p className={`text-xs mt-1 font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                  Status: {isConnected ? 'Streaming Live' : 'Connecting...'}
                              </p>
                          </div>
                          
                          {/* Expiry Filter (New Feature) */}
                          <div className="mt-4 sm:mt-0">
                              <ExpiryFilter 
                                  selectedExpiry={selectedExpiry}
                                  onExpiryChange={handleExpiryChange}
                                  expiryOptions={mockExpiryDates}
                                  dispatch = {dispatch}
                                  resetStrikeMap={ resetStrikeMap}
                              />
                          </div>
                      </header>
                      
                      
                      
                      {/* Header */}
                      <div className="flex  mb-3">{/* items-center justify-between */}
                        <h4 className="text-lg sm:text-2xl font-bold tracking-tight">
                           Swipe to Trade
                        </h4>
                        <div className="hidden sm:flex items-center gap-2 text-[12px] text-zinc-600">
                          <div className="h-3 w-3 rounded-full bg-emerald-500/50" /> Buy →
                          Slide right
                          <div className="h-3 w-3 rounded-full bg-rose-500/50" /> Sell → Slide
                          left
                        </div>
                      </div>
              
                      {/* Desktop Header Row */}
                      <div className="hidden sm:grid grid-cols-[1.2fr_0.8fr_1.2fr] text-[12px] text-zinc-600 px-1 mb-1">
                        <div  className="px-4 ">STRIKE</div>
                        <div className="text-center">CALLS</div>
                        <div className="text-right sm:text-left">PUTS</div>
                      </div>
              
                      {/* Option Rows */}
                 
                      <div className="grid gap-6 sm:gap-12">
                        { strikeMap   &&  Array.from(strikeMap.entries())
                           .sort(([keyA, valueA], [keyB, valueB]) => {
                            const strikeA = Number(valueA[0].slice(11, -2)); // value[0] = name
                            const strikeB = Number(valueB[0].slice(11, -2));

                            if (strikeA !== strikeB) return strikeA - strikeB;

                            // tie-break CE vs PE (optional)
                            const typeA = valueA[0].slice(-2);
                            const typeB = valueB[0].slice(-2);
                            return typeA.localeCompare(typeB); // CE before PE
                        })
                           .map(([key, value] , idx) => { 
                                 let rawRow=  value[1]; //tradeRow[1];
                            //   console.log(`iterating map JSX:  ${idx} + ${key} ${JSON.stringify(rawRow)}`)
                             // destructure only the fields you need
                              // const [name, id, timestamp, ltp,, , , bid, ask, , , volume] = value;
                               const [name, id, timestamp, ltp, , , , bid, ask, , , volume] = rawRow;
                                  let type = name.slice(-2);
                                   let strike =  name.slice(11,-2);
                                    let expiry = name.slice(5, 11);
                                            // construct a row object to pass down
                                            const rowvalue = {
                                              strike,
                                              id,
                                              type,
                                              expiry,
                                              timestamp,
                                              ltp,
                                              bid,
                                              ask,
                                              volume,
                                            } 
                          return ( 
                            <OptionProvider key={key}>
                               
                                   {/* All components within here, including OptionsTable, can now access the context */}
                                      <OptionRow   idx={idx} key={key} row={ rowvalue} onAction={handleAction} />
                                 
                          </OptionProvider>
                           )
                            }) 
                        }
                      </div>
                 
                      {/* Recent Actions */}
                      <div className="mt-6 sm:mt-8">
                        <h2 className="text-sm font-semibold text-zinc-700 mb-2">
                          Recent Actions
                        </h2>
                        <div className="grid gap-1">
                          {log.length === 0 && (
                            <div className="text-[12px] text-zinc-500">
                              Slide a card left/right to trade.
                            </div>
                          )}
                          {log.map((l, i) => (
                            <div key={i} className="text-[12px] text-zinc-700">
                              {l.time}:{" "}
                              <span className="font-semibold">
                                {l.action} {l.side}
                              </span>{" "}
                              @ {l.strike}
                            </div>
                          ))}
                        </div>
                      </div>
              
                      {/* Mobile Legend */}
                      <div className="sm:hidden mt-4 text-[11px] text-zinc-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ArrowLeft size={12} /> Slide left to sell
                          </span>
                          <span className="flex items-center gap-1">
                            Slide right to buy <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
               </WebSocketProvider>
                </> }
     
        {/* --------------------- 3. Floating Gear Icon --------------------- */}
      <motion.button
        className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-2xl z-40 hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9, rotate: -90 }}
        onClick={() => setShowPositionModal(!showPositionModal)}
      >
        <Settings size={24} />
      </motion.button>
                          
       {/* --------------------- 4. Position Modal Dialog --------------------- */}
      <AnimatePresence>
        {showPositionModal && (
          <motion.div
            // Updated class for better mobile responsiveness: w-80 (desktop) becomes w-[90vw] (mobile)
            className="fixed bottom-20 right-6 w-[90vw] sm:w-80 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50 overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center border-b pb-2 mb-3 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Coins size={20} className="mr-2 text-amber-500" />
                Positions & Funds
              </h3>
              <button onClick={() => setShowPositionModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* Fund Summary Section */}
            <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp size={16} className={`mr-2 ${mockFunds.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  P&L (M2M)
                </span>
                <span className={`font-bold text-lg ${mockFunds.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(mockFunds.totalPnl)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center">
                  <Wallet size={14} className="mr-1 text-indigo-500" />
                  Funds Available
                </span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(mockFunds.fundAvailable)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center">
                  <Coins size={14} className="mr-1 text-gray-500" />
                  Margin Used
                </span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(mockFunds.marginUsed)}
                </span>
              </div>
            </div>

            {/* Positions List Section */}
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Strike Positions ({currentPositions.length})</h4>
            <div className="space-y-2">
              {currentPositions.length > 0 ? (
                currentPositions.map((pos, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-900">
                        {pos.strike} <span className={`text-xs px-1 rounded ${pos.type === 'CALL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{pos.type}</span>
                      </span>
                      <span className={`font-bold text-sm ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pos.pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Qty: {pos.quantity}</span>
                      <span>LTP: ₹{pos.ltp.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No open positions found.</p>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

         {/* Footer / Legend */}
                <footer className="mt-8 pt-4 border-t text-xs text-zinc-500 flex justify-between items-center">
                    <span>Swipe <span className="text-red-600 font-semibold">LEFT</span> to Sell | Swipe <span className="text-green-700 font-semibold">RIGHT</span> to Buy</span>
                    <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Trading Interface Demo
                    </span>
                </footer>





    </div>
  );
}
/*  REMOVWD 
 <td className="px-4 py-2 text-center text-gray-800 font-semibold">
                              {name.slice(-2)}
                            </td>
*/
