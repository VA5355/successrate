// Fyersmarketfeed.jsx
import React, { useState } from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
 import { getIndicesTickerData  ,updateIndicesFromCache ,stopSensexTickerData } from "./threeIndicesFeed.actions";
import {useDispatch, useSelector} from 'react-redux';

const Fyersmarketfeed = () => {
  const [isMarketFeed, setIsMarketFeed] = useState(false);
  const [threeSec , setThreeSec] = useState(0);
 const dispatch = useDispatch();
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

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2  rounded-md  shadow-sm  border transition duration-200 ${
        isMarketFeed
          ? 'bg-primary green hover:bg-green-800 border-green-700'
          : 'bg-gray-100 border-gray-300 text-gray-600'
      }`}
    >
      {isMarketFeed ? (
        <Activity size={20} className=" animate-pulse " />
      ) : (
        <ToggleLeft size={20} className="text-gray-500" />
      )}
      <span className="text-sm font-semibold font-medium">
        {isMarketFeed ? 'Start Live' : 'Pause Live'}
      </span>
    </button>
  );
};

export default Fyersmarketfeed;
