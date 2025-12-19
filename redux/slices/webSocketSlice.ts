// store/websocketSlice.js
import { createSlice } from "@reduxjs/toolkit";

export interface OptionSymbol {
  strike: string;
  strikeNumber:number;
  expiry: string;
  id: string;
  timestamp:string;
  type: "CALL" | "PUT";
  ltp: string;
  bid: string;
  ask: string;
  volume:string;
}
export interface WebSocketSliceProps {
    symbol:any,
    name:any,
    s? : any,
   code? :  any,
   message? : any,
   time:any,
   price:any,
     searchTickers: any,
   tickerBook:  any[]  | undefined,
   niftyBook:  any[]  | undefined,
   sensexBook:  any[]  | undefined,
   bankNiftyBook:  any[]  | undefined,
   tickerMap: Record<string, any>;   // 👈 add this
   orderBook:  any[]  | undefined,
    expiries: string[];
  selectedExpiry: string | null;
  spot: any,
    symbols: OptionSymbol[];
    options: OptionSymbol[];
     connected: boolean,
     subscriptionStatus:string| undefined
    
}
const initialState: WebSocketSliceProps = {
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
    options: [],
     connected: false,
     subscriptionStatus: undefined
}
const websocketSlice = createSlice({
  name: "websocket",
  initialState, /*: {
    spot: null,
    symbols: [],
    expiries: [],          // list of all expiries
    selectedExpiry: null,  // current filter
  },*/
  reducers: {
    setSpot: (state, action) => { //state.spot = action.payload;  

       let niftySpot = action.payload;

       // structure of action.payload = { id: id , name: name , symbol : symbol }
       // e.g NIFTY-50  784832087_NIFTY-50  --> NIFTY-50,784832087,2025-12-17T13:32:45.995Z,25600.19,0,0,0,25601.02,25602.49,25600.72,25601.03,5056279,2899111,0,0,0,0,0 
             // let tempSymbolTickReceived = action.payload;
         let spotPrice = niftySpot.symbol[3];
         state.spot = spotPrice;
      /*tempSymbolTickReceived structure 
      /* stateSymbols tructure 
     strikeMap, [["NIFTY25D1625600CE",["NIFTY25D1625600CE","753989373","2025-12-16T10:39:25.056Z","130.21",null,null,null,"0","132.28",
                       null,null,"0"]],["NIFTY25D2325600CE",
         ["NIFTY25D2325600CE","981497307","2025-12-16T10:39:25.499Z","183.21",null,null,null,"0","137.09",null,null,"0"]],
         ["NIFTY25D1625600PE",["NIFTY25D1625600PE","452684477","2025-12-
                            */
     

      // 2. Iterate through the new payload and update the Map.
      // This will add new symbols and update existing ones.
    /*  tempSymbolTickReceived.forEach((newSymbol:any) => {
        //  FIND the NIFTY 50 Symbol 
            let   strike = newSymbol ;
            if(Array.isArray(strike)){ 
               if ( strike[0] ==='NIFTY-50')
              {   let niftTrade =  newSymbol[1];
                  if( niftTrade[0]==='NIFTY-50'){
                      let  spot  =  niftTrade[3];
                      console.log("SPOT  " + JSON.stringify(spot))
                      if(!Array.isArray(spot) ){ 
                         //state.spot = spot;
                      }
                     


                  }
                 

              } 
            }
            else {

            }
      });*/

       
    },
    setOptions :  (state, action) => { state.options = action.payload; },
    setStrikeNumber: (state, action) => {
      let temp  = action.payload;
          // 1. Create a single Map from the existing symbols for efficient lookups.
      const symbolsMap = new Map(state.symbols.map((symbol:any) => [symbol.id, symbol]));

      // 2. Iterate through the new payload and update the Map.
      // This will add new symbols and update existing ones.
      temp.forEach((newSymbol:any) => {
        // Merging old and new data. This is crucial for updating existing symbols.
        let   strike = newSymbol.strike.slice(11);
        let strikN  =  strike.slice(-2)
             
      //  const updateInSymbol  = {...newSymbol.strikeNumber =strikN }
         const updateInSymbol = {
      strikeNumber: strikN
    };

      //  const updatedSymbol = { ...symbolsMap.get(newSymbol.id), ...updateInSymbol };
      /* const updatedSymbol = {
         ...symbolsMap.get(newSymbol.id),
         ...updateInSymbol
       }; */
         const updatedSymbol = {
      ...(symbolsMap.get(newSymbol.id) ?? {}),
      ...updateInSymbol
      };

        symbolsMap.set(newSymbol.id, updatedSymbol);
      });
       // 3. Convert the Map's values back into an array to update the state.
      state.symbols = Array.from(symbolsMap.values());
    
    },
    setSubscriptionFailure: (state:any, action:any) => {
       // setSubscriptionFailure
        state.subscriptionStatus =     action.payload
        state.connected  = false;
    }, 
     setConnected: (state:any, action:any) => {
      state.connected = action.payload;
    },
    setSymbols: (state:any, action:any) => {

      let tempSymbolTickReceived = action.payload;

      // 1. Create a single Map from the existing symbols for efficient lookups.
      const symbolsMap = new Map(state.symbols.map((symbol:any) => [symbol.id, symbol]));

      // 2. Iterate through the new payload and update the Map.
      // This will add new symbols and update existing ones.
      tempSymbolTickReceived.forEach((newSymbol:any) => {
        // Merging old and new data. This is crucial for updating existing symbols.
        const updatedSymbol = {  ...(symbolsMap.get(newSymbol.id) ?? {}), ...newSymbol };
     
        symbolsMap.set(newSymbol.id, updatedSymbol);
      });

      // 3. Convert the Map's values back into an array to update the state.
      state.symbols = Array.from(symbolsMap.values());
      

     /*  // 1. Create a Map from the incoming payload for efficient lookups.
      // The key is the unique 'id' of the symbol.
      const updatesMap = new Map(tempSymbolTickReceived.map((symbol:any) => [symbol.id, symbol]));

      // 2. Iterate through the EXISTING symbols in the state.
      state.symbols.forEach(existingSymbol => {
        // 3. Check if an updated version of this symbol exists in the new data.
        const updatedData = updatesMap.get(existingSymbol.id);

        // 4. If a match is found, update the existing symbol's properties.
        // This avoids adding new symbols and only updates the ones you are already tracking.
        if (updatedData) {
          Object.assign(existingSymbol, updatedData);
          console.log(` ${existingSymbol} updated with ${updatedData}` )
        }
      });*/

      /*
      let newSymbolTick = [];
      let exitingSymbols  = state.symbols;

      if( Array.isArray(tempSymbolTickReceived)){
        if(exitingSymbols.length > 1 ){
        exitingSymbols.map( ( extS:any)  => {


           tempSymbolTickReceived.map((s:any) => { 
                 if(extS.id == s.id ){
                     extS.strike =s.strike;
                      extS.expiry = s.expiry ;
                      extS. timestamp= s.timestamp;
                      extS. ltp= s.ltp;
                      extS. bid= s.bid;
                      extS. ask= s.ask;
                      extS. volume= s.volume;

                 }  //s.name
          })
           })
        }
        else{
             tempSymbolTickReceived.forEach( sy => { 
                 exitingSymbols.push(sy)
             })
         
        }
         
       }*/
      // Extract unique expiry dates from incoming data
      const expiries: string[] = Array.from(
             new Set<string>(state.symbols.map (( sy :any)=> JSON.stringify(sy)))   
            );  // //action.payload.map((s:any) => s.expiry)
      state.expiries = expiries.map(st =>    JSON.parse(st));
      if (!state.selectedExpiry && expiries.length > 0) {
        state.selectedExpiry = expiries[0]; // default = nearest expiry
      }
      //state.spot = JSON.parse(expiries[0]).strikeNumber;
    },
    setExpiry: (state:any, action:any) => {
      state.selectedExpiry = action.payload;
    },
    resetExpiry: (state:any) => {
      // safest fallback: pick nearest expiry (first in sorted list)
      if (state.expiries.length > 0) {
        state.selectedExpiry = state.expiries[0];
      } else {
        state.selectedExpiry = null;
      }
    },
  
  }
});

export const { setSpot,setConnected ,setOptions, setSubscriptionFailure,  setSymbols, setExpiry, resetExpiry } = websocketSlice.actions;
export default websocketSlice.reducer;
