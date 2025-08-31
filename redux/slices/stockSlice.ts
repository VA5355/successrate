import { createSlice } from "@reduxjs/toolkit";

export interface StockSliceProps {
    gainers: any,
    losers: any,
    activelyTraded: any,
    activelyTradedBook:   any[]  | undefined,
    searchResults: any,
    companyData: any,
    selectedCard: any,
    holdingData:any
}
const initialState:StockSliceProps = {
    gainers: null,
    losers: null,
    searchResults: null,
    activelyTraded: null,
    activelyTradedBook: undefined,
    companyData: null,
    selectedCard: null,
    holdingData:null
}



const stockSlice = createSlice({
    name: "stock",
    initialState,
    reducers: {
        saveGainers: (state, action) => {
            state.gainers=action.payload
        },
        saveLosers: (state, action) => {
            state.losers=action.payload
        },
        saveResults: (state, action) => {
            state.searchResults=action.payload
        },
        saveSelectedCard: (state, action) => {
            state.selectedCard=action.payload
        },
        saveActivelyTraded: (state, action) => {
            if(Array.isArray(action.payload)){
                 state.activelyTradedBook = action.payload;
            }
            else if(action.payload !==null && action.payload !== undefined) { 
            state.activelyTraded=action.payload
            }
        },
        saveCompanyData: (state, action) => {
            state.companyData=action.payload
        },
         saveHoldingData: (state, action) => {
            state.holdingData=action.payload
        }
    },
})

export const { saveGainers, saveSelectedCard, saveActivelyTraded, saveCompanyData, saveLosers, saveResults,
    saveHoldingData
 } = stockSlice.actions;

export default stockSlice.reducer;
