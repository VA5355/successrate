import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {TickerSliceProps }  from '@/redux/slices/tickerSlice';
export interface TickerBankNiftySliceProps extends TickerSliceProps{
    
   
}
const initialState: TickerBankNiftySliceProps = {
    symbol: null,
    name: null,
    time: null,
    price: null,
    searchTickers: null,
    tickerBook: undefined,
    sensexBook: undefined,

    bankNiftyBook: undefined,
    niftyBook: undefined,
    tickerMap: {},
      orderBook:  undefined,
}



const tickerBankNiftySlice = createSlice({
    name: "bankniftyticker",
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
          saveBankNiftyBook: (state, action: PayloadAction<  any []   >) => {
                  state.tickerBook = action.payload;
         },
    },
})

export const { saveSymbol, saveName ,saveStockTickers: saveStockTickers ,saveTickerBook ,saveBankNiftyBook   } = tickerBankNiftySlice.actions;

export default tickerBankNiftySlice.reducer;
