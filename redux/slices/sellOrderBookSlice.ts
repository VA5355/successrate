import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SellOrderBookSliceProps {
    symbol:any,
    name:any,
    s? : any,
   code? :  any,
   message? : any,
     searchResults: any,
     price: any,
     qty: any,

   sellOrderBook:  any[]  | undefined,
   
}
const initialState: SellOrderBookSliceProps = {
    symbol: null,
    name: null,
     searchResults: null,
      price: null,
     qty: null,
     sellOrderBook: undefined,
}



const sellOrderBookSlice = createSlice({
    name: "sellorderbook",
    initialState,
    reducers: {
        saveSymbol: (state, action) => {
            state.symbol=action.payload
        },
        saveName: (state, action) => {
            state.name=action.payload
        },
         saveStockResults: (state, action) => {
            state.searchResults=action.payload
        },
          saveSellOrderBook: (state, action: PayloadAction<  any []   >) => {
                  state.sellOrderBook= action.payload;
         },
    },
})

export const { saveSymbol, saveName ,saveStockResults ,saveSellOrderBook: saveSellOrderBook    } = sellOrderBookSlice.actions;

export default sellOrderBookSlice.reducer;