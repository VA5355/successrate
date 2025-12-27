// FetchPositionButton.jsx
import React, { useState ,  useRef} from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
// import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./threeSecCEQuote.actions";
import {useDispatch, useSelector} from 'react-redux';
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import './buttonOverride.css'; 
import { getPositionData } from '../positionGrid/positionGridBook.actions';
import { orderBookData } from '../positionGrid/orderBook.actions';
import { savePositionBook } from '@/redux/slices/positionSlice';
import { savePositionStreamBook } from '@/redux/slices/positionSlice';

const FetchPositionButton = ({ onFetchComplete, sortedData ,updateSoldQty }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [threeSec , setThreeSec] = useState(0);
   const [showModal, setShowModal] = useState(false);
   const intervalRef = useRef(null);
   const timeoutRef = useRef(null);
    let  positionData   = useSelector((state ) => state.position.positionBook)
 const dispatch = useDispatch();

 const setSoldQtyForEachPosition = (positions , callbackUpdateQty) => {
      if(positions !==null && positions !==undefined){
          if(Array.isArray(positions) && positions.length > 0 ) { 
             positions.forEach(ps=> {

                  let sy = ps.symbol;
                  if(sy !==null && sy !== undefined){
                    // calling this causes the tooltip to popup 
                   //  callbackUpdateQty(sy);
                  }
             })
          }
      }
 }
 const stopPolling = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
  setIsStreaming(false);
};


  const handlePositions = (e) => {
     console.log("Fetch Position enter ");
      e?.preventDefault();
     e?.stopPropagation();
const res1 = StorageUtils._retrieve(CommonConstants.fyersToken);
  if (res1.isValid && res1.data !== null &&  res1.data !== undefined) {
    let auth_code = res1.data['auth_code'];
    if (auth_code&& auth_code !== null && auth_code !== undefined) {
        console.log("User is Authorized ");
        // fetchTradeBook();
        if (isStreaming) return; // 🛑 prevent re-entry
          //   setIsStreaming((prev) => !prev);
          setIsStreaming(true);
    // Optionally, trigger your stream start/stop logic here
    if (!isStreaming) {
      console.log("Fetch Position started");
      //START THE THREE SEC INTEVAL 
/*     let threeSecInterval =   setInterval (  () => {
         // make or dispatch action to the streamTicker.actions.js
       //TRIIGER the position and order Book Fetch  
*/


      if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
             // make or dispatch action to the streamTicker.actions.js
             //TRIIGER the position and order Book Fetch  

             // FETHE POSITION BOOK DATA 
            dispatch(getPositionData(''));
           // WE have to place this in a time out as the get Position make take time to fetch 
             setTimeout( () => {
                // FETH The recentTRades from storage if above call succeeded data will be there
               let redentPositionData =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)
               const dataFromCache2 = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
               if( redentPositionData !== null && redentPositionData !==undefined  &&  Array.isArray(redentPositionData.data )){
                       console.log(" GRID aCTIONS recenPositions  "+JSON.stringify(redentPositionData.data))
       
               }else {
                   console.log("positions data from cahce ")
                   redentPositionData = dataFromCache2;
               }
               // first set the default marketIndiceFeed Data 
                StorageUtils._save(CommonConstants.marketFeedDataCacheKey, CommonConstants.sampleObjTickerTDataVersion1);

                dispatch( savePositionBook(([...redentPositionData.data])));
                /* for faster rendering */
              
                 positionData.forEach(row => {
                  // COMMENTED PURPOSELY to reduce CONSOLE LOGS 
                         //        console.log(`FetchPostionButton data.forEach: row   ${JSON.stringify(row)}  `);
                                  let sty = row.symbol?.split(":");let custSy= undefined;
                                  if(Array.isArray(sty)){
                                    custSy = sty[1];
                                  } 
                                  if(custSy !==undefined){
                                    // COMMENTED PURPOSELY to reduce CONSOLE LOGS 
                                    // console.log(` symbol.split(":")  ${JSON.stringify(custSy)}  `);
                                   let posLtpRow  = document.getElementById(`streamedLTP_${custSy}_${row.productType}`);
                                   let posUnrealisedRow  =  document.getElementById(`streamedUnrealized_${custSy}_${row["productType"]}`);
                                   if(posLtpRow !==null && posLtpRow !== undefined){ 
                                      posLtpRow.textContent = row.ltp;
                                      // COMMENTED PURPOSELY to reduce CONSOLE LOGS 
                                      //console.log(` streamedLTP_${custSy}_${row.productType}  updating ${ row.ltp}  `);
                                    }
                                    if(posUnrealisedRow !==null && posUnrealisedRow !== undefined){ 
                                      let actUnreal = (( parseInt(row.netQty) *  row.ltp ) -  parseInt(row.buyVal)) ;
                                      posUnrealisedRow.textContent = actUnreal;
                                     // COMMENTED PURPOSELY to reduce CONSOLE LOGS    
                                     // console.log(` streamedUnrealized_${custSy}_${row["productType"]}  updating ${actUnreal}  `);
                                    }
                                   }
                               })

                dispatch( savePositionStreamBook(([...redentPositionData.data])));

               // hope fully the above save Positionbook will include inte new symbols into
               // the 
                onFetchComplete([...redentPositionData.data]);
                // passing the callback function
                setSoldQtyForEachPosition( redentPositionData.data , updateSoldQty );
                 StorageUtils._save(CommonConstants.positionDataCacheKey, [redentPositionData.data])
               
                //setPositionOneFetch(prev => prev+1);
                  StorageUtils._save(CommonConstants.fetchPositions, true)
               // FETCH the ORDER BOOK DATA ALSO ONCE 
                 dispatch(orderBookData(''));


           } , 5000);             
             
      //  dispatch(getSensexTickerData('BSE:SENSEX-INDEX'));
      // IF ABOVE UPDATE's with LIVE DATA the BELLOW CACHE WILL PICK IT 
      // SO THE TICKERCHIP should be able to get the DATA from later on 
      //   dispatch(updateTickerStatusFromCache('BSE:SENSEX-INDEX'));

           }, 1000);

           let threeSecInterval =  intervalRef.current;


       }
      //START THE THREE SEC INTEVAL 
     /*let threeSecInterval =   setInterval (  () => {
        

       },3000);*/
        timeoutRef.current = setTimeout(() => {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsStreaming(false);
           stopPolling();
      }, 1000);
   /*  setThreeSec(threeSecInterval);
        let after45SecClosePoll =   setTimeout (  () => {
             clearInterval(threeSecInterval)
             clearInterval(intervalRef.current);
             intervalRef.current = null;
             //setIsStreaming((prev) => !prev);
             setIsStreaming(false);  // stop
        }, 10000);*/

    } else {
      console.log("Fetch position stopped");
       //TRIIGER the sensex ticker Book Fetch  
       // this was used in the EVENT source to send a close request separately 
      //  dispatch(stopSensexTickerData('BSE:SENSEX-INDEX'));
       // Stop the three second Interval Immediately and then 
        clearInterval(threeSecInterval)
    }
    }
    else {
       console.log("User not Authorised ");
      // setShowModal(true);

    }
  } else {
       console.log("User not Logged in ");
       setShowModal(true);

    }
   

  };

  return (
    <>  
    <button
       type="button"     
     onClick={(e) => handlePositions(e)}
      className={`flex items-center gap-2 px-3 py-2  rounded-md  shadow-sm  border transition duration-200 ${
        isStreaming
          ? 'bg-primary green hover:bg-green-800 border-green-700'
          : 'bg-gray-100 border-gray-300 text-gray-600'
      }`}
    >
      {isStreaming ? (
        <Activity size={20} className=" animate-pulse " />
      ) : (
        <ToggleLeft size={20} className="text-gray-500" />
      )}
      <span className="text-sm font-semibold font-medium">
        {isStreaming ? 'Fetching' : 'Positions'}
      </span>
    </button>
    {showModal && (
        <>
          {/* Backdrop   backdrop-blur-sm too much blur */}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div> 

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* shadow-xl  not needed  */}
            <div className="bg-white rounded-xl  p-6 w-[300px] max-w-[90%] border border-gray-200">
            {/*  <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Confirm Order</h3>*/}

              <div className="flex items-center justify-between space-x-2">
                 
                <button
                  
                  className="flex-1 bg-brandgreen-600  py-1 rounded-lg hover:bg-green-700 transition"
                >
                 User Not Logged
                </button>
 
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 block mx-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

    
    
    </>
  );
};

export default FetchPositionButton;
