 import { createSlice } from '@reduxjs/toolkit';

 type MarketState = {
  market: string;
  marketStatus: "Open" | "Closed";
  tradeDate?: string;
  index?: string;
  last?: number | string;
  variation?: number | string;
  percentChange?: number | string;
  marketStatusMessage?: string;
};





export interface MarketSliceProps {
    market: string ;
  marketStatus: "Open" | "Closed";
  tradeDate?: string;
  index?: string;
  last?: number | string;
  variation?: number | string;
  percentChange?: number | string;
  marketStatusMessage?: string;
    
}

const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Kolkata' // The identifier for India Standard Time
};
const currentDate = new Date(); // Creates a Date object in the browser's local time zone
// Format the date using the en-GB locale for a DD/MM/YYYY style output
const shortDateInIST = currentDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Kolkata' // The identifier for India Standard Time
});


const initialStateCurrency : MarketSliceProps = {
  market: "Currency",
  marketStatus:"Open",
  tradeDate: shortDateInIST,
 index: "",
  last: "",
  variation: "",
  percentChange: "",
  marketStatusMessage: "Market is Open"
};


const initialStateCommodity : MarketSliceProps = {
  market: "Commodity",
  marketStatus:"Open",
  tradeDate: shortDateInIST,
  index: "",
  last: "",
  variation: "",
  percentChange: "",
  marketStatusMessage: "Market is Open"
};

const initialStateDebt : MarketSliceProps = {
  market: "Debt",
  marketStatus:"Open",
  tradeDate: shortDateInIST,
  index: "",
  last: "",
  variation: "",
  percentChange: "",
  marketStatusMessage: "Market is Open"
};

const initialStateCurrencyFuture  = {
  market: "CurrencyFuture",
  marketStatus:"Open",
  tradeDate: shortDateInIST,
  index: "",
  
  last:"90.0475",
  variation: "",
  "percentChange": "",
      "marketStatusMessage": "Market is Open",
      "expiryDate": "28-Jan-2026",
      "underlying": "USDINR",
      "updated_time": "07-Jan-2026 16:43",
      "tradeDateFormatted": "07-Jan-2026 16:43",
      "slickclass": "slick-item"
};






const initialState : MarketSliceProps = {
  market: "Capital Market",
  marketStatus:"Closed",
  tradeDate: shortDateInIST,
  index: "NIFTY 50",
  last: 26140.75,
  variation: -37.9500000000007,
  percentChange: -0.14,
  marketStatusMessage:  "Normal Market has Closed"
};


export const marketSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      
      let marketData  = action.payload.modalType;


    
    },
    closeModal: (state) => {
     
    },
  },
});

export const { openModal, closeModal } = marketSlice.actions;

export default marketSlice.reducer;
