import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TradeSliceProps {
    symbol:any,
    name:any,
    s? : any,
   code? :  any,
   message? : any,
     searchResults: any,
   tradeBook:  any[]  | undefined,
   
}
const initialState: TradeSliceProps = {
    symbol: null,
    name: null,
     searchResults: null,
     tradeBook: undefined,
}



const tradeSlice = createSlice({
    name: "trade",
    initialState,
    reducers: {
        saveSymbol: (state:any, action:any) => {
            state.symbol=action.payload
        },
        saveName: (state:any, action:any) => {
            state.name=action.payload
        },
         saveStockResults: (state:any, action:any) => {
            state.searchResults=action.payload
        },
          saveTradeBook: (state:any, action: PayloadAction<  any []   >) => {
                  state.tradeBook = action.payload;
         },
    },
})

export const { saveSymbol, saveName ,saveStockResults ,saveTradeBook    } = tradeSlice.actions;

export default tradeSlice.reducer;