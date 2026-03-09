// StreamToggleButton.jsx
import React, { useState , useRef} from 'react';
import { ToggleLeft, Activity } from 'lucide-react';
import { useModal } from '@/providers/ModalProvider';
//import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./streamTicker.actions";
// ThreeSec HTTP FETCH 
 import { getSensexTickerData  ,updateTickerStatusFromCache ,stopSensexTickerData } from "./threeSecCEQuote.actions";
import {useDispatch, useSelector} from 'react-redux';

const StreamToggleButton = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [threeSec , setThreeSec] = useState(0);
   const { showFramerModal, hideModal } = useModal();
   const { modalOnce , setModalOnce } = useState(false);
    const countRef = useRef(modalOnce)
 const dispatch = useDispatch();
  const handleToggle = () => {
    setIsStreaming((prev) => !prev);

    // Optionally, trigger your stream start/stop logic here
    if (!isStreaming) {
      console.log("Stream started");
      //START THE THREE SEC INTEVAL 
     let threeSecInterval =   setInterval (  () => {
         // make or dispatch action to the streamTicker.actions.js
        //TRIIGER the sensex ticker Book Fetch  
        if(countRef.current !==undefined){  
         showFramerModal({ 
               status: 'loading', 
              message: `Market Status Loading ...` 
            });
             console.log('Current modal:', countRef.current);
             countRef.current?.setModalOnce( (m ) =>  !m);
          }
        // { _id: '' , qty: positionQty, price: positionPrice , symbol: selectedSymbol, orderType:productMode , scheduled:isScheduled, showFramerModal, hideModal })
        dispatch(getSensexTickerData({ _id:'BSE:SENSEX-INDEX', showFramerModal, hideModal } ));
      // IF ABOVE UPDATE's with LIVE DATA the BELLOW CACHE WILL PICK IT 
      // SO THE TICKERCHIP should be able to get the DATA from later on 
         dispatch(updateTickerStatusFromCache('BSE:SENSEX-INDEX'));

       },3000);
     setThreeSec(threeSecInterval);
        let after45SecClosePoll =   setTimeout (  () => {
             clearInterval(threeSecInterval)
             setIsStreaming((prev) => !prev);
        }, 60000);

    } else {
      console.log("Stream stopped");
       //TRIIGER the sensex ticker Book Fetch  
       // this was used in the EVENT source to send a close request separately 
      //  dispatch(stopSensexTickerData('BSE:SENSEX-INDEX'));
       // Stop the three second Interval Immediately and then 
        clearInterval(threeSecInterval)
    }
  };

  return (
  
    <button   type="button"    
      onClick={handleToggle}
    
    >
      
      <span className="text-sm font-semibold font-medium">
        {isStreaming ? 'Streaming ON' : 'Stream MARKET DATA'}
      </span>
    </button>
  );
};

export default StreamToggleButton;
