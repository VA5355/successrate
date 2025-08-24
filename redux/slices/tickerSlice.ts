import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TickerSliceProps {
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
}
const initialState: TickerSliceProps = {
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

}



export const tickerSlice = createSlice({
    name: "ticker",
    initialState,
    reducers: {
        saveSymbol: (state, action) => {
            state.symbol=action.payload
        },
        saveName: (state, action) => {
            state.name=action.payload
        },
         saveStockTickers: (state, action) => {
            state.searchTickers=action.payload
        },
          saveTickerBook: (state, action: PayloadAction<  any []   >) => {
                  state.tickerBook = action.payload;
         },
         updateTickerMap: (state, action: PayloadAction<any>) => {
                const data = action.payload;
                if (data?.symbol) {
                    state.tickerMap[data.symbol] = data;   // 👈 same as setTickerMap
                }
               let ft = JSON.parse(JSON.stringify(state.tickerMap));
                return ft;
         },
    },
})

export const { saveSymbol, saveName ,saveStockTickers: saveStockTickers ,saveTickerBook ,
     updateTickerMap,   // 👈 add this
  } = tickerSlice.actions;
 // tickerSlice ;
export default tickerSlice.reducer;
