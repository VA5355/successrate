// components/OptionChainTable.jsx
import { useDispatch, useSelector   } from "react-redux";
import  {  useReducer, useState,useEffect } from 'react';
import { selectFilteredStrikes } from '@/redux/selectors/webSockSelector';
import webSocketSlice  from '@/redux/slices/webSocketSlice';
//import { selectFilteredStrikes } from "../store/selectors";
import useWebSocketStream from "@/redux//hooks/useWebSocketStream";
export default function OptionChainTable() {
    const dispatch = useDispatch();
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
   const { optionsMap, strikeMap } =  useWebSocketStream("wss://push.truedata.in:8082?user=FYERS2334&password=KdRi5X55",dispatch);

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


    useEffect(() => {
        /* Array.from(
             new Set<string>(state.symbols.map ( sy => JSON.stringify(sy)))   
            );  // //action.payload.map((s:any) => s.expiry)
        */
        setUniqOpt(new Set(symbols.map ( sy =>  sy.id)))
      
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
      {/* Conditionally render the table if showModal is false */}
      {!showModal && <>
                 <h2 className="text-lg font-bold mb-2">NIFTY Spot: { ( spot !== null && spot !== undefined) ?  JSON.stringify(spot) : ""}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="px-4 py-2 text-left">STRIKE</th>
              <th className="px-4 py-2 text-center">CALLS</th>
              <th className="px-4 py-2 text-center">PUTS</th>
            </tr>
          </thead>
          <tbody>
                  ticks fetch :   {  uniqOpt.length }   options active  :   {  options.length }
                    <h3>OptionsMap size: {optionsMap?.size || 0}</h3>
                   <h3>StrikeMap size: {strikeMap?.size || 0}</h3>
                  {/*    <table className="min-w-full border border-gray-200">
                   
                    <tbody>  */}
                              {strikeMap &&    
                 
                       Array.from(strikeMap.entries()).map(([key, value]) => {
                        // value is the raw array from websocket
                        const [name, id, timestamp, ltp,  bid, ask, volume] = value;
                          let type = name.slice(-2);
                          let strike =  name.slice(11,-2);
                        return (  <>
                             <tr key={key} className="align-top">
                           
                            <td className="px-4 py-2 text-gray-800 font-semibold">
                              {strike}
                            </td>

                            { type ==="CE" &&  <td className="px-2">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm hover:shadow-md transition">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  CALL {name}
                                </span>
                                <span className="text-green-600 font-bold">
                                  ₹{ltp ?? "-"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                LTP ₹{ltp} · Bid ₹{bid} · Ask ₹{ask}
                              </div>
                            </div>
                          </td> }
                    
                            { type ==="PE" &&   <td className="px-2">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm hover:shadow-md transition">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  PUT {name}
                                </span>
                                <span className="text-blue-600 font-bold">
                                  ₹{ltp ?? "-"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                LTP ₹{ltp} · Bid ₹{bid} · Ask ₹{ask}
                              </div>
                            </div>
                          </td>
                            } 
                          
                          
                           
                          </tr>
                              </>

                        ) 
                      }
                      ) }
                  
             

               
               
          </tbody>
        </table>
      </div>
                </> }
     
    </div>
  );
}
/*  REMOVWD 
 <td className="px-4 py-2 text-center text-gray-800 font-semibold">
                              {name.slice(-2)}
                            </td>
*/