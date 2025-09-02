import { StorageUtils } from "@/libs/cache";
import { CommonConstants } from "@/utils/constants";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PositionSliceProps {
    symbol:any,
    name:any,
    s? : any,
   code? :  any,
   message? : any,
     searchResults: any,
   positionBook:  any[]  | undefined,
   positionStreamBook:  any[]  | undefined,
   positionTicker: any,
   
}
const initialState: PositionSliceProps = {
    symbol: null,
    name: null,
     searchResults: null,
     positionBook: undefined,
     positionStreamBook: undefined,
     positionTicker: undefined,
}



const positionSlice = createSlice({
    name: "position",
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
           savePositionStreamBook: (state, action: PayloadAction<  any []   >) => {
                 
                  // Update the defaultIndicesData in the 
                  //   StorageUtils._save(CommonConstants.positionFeedDataCacheKey, CommonConstants.sampleObjTickerTDataVersion1);

                  // Get the current indices (market feed cache)
                    let currentIndices = StorageUtils._retrieve(CommonConstants.positionFeedDataCacheKey);

                    if (currentIndices && Array.isArray(currentIndices.data)) {
                        if(state.positionStreamBook !==undefined){ 
                        let psBook = [...state.positionStreamBook]; // ✅ ensure it's an array


                        const positionModifiedBook = action.payload; // recevied from the 5003 General socket 
                        if (positionModifiedBook !==null && positionModifiedBook !== undefined && Array.isArray(positionModifiedBook)) {
                            if( psBook== undefined ) {  //[...orderModifiedBook];
                            psBook =[...positionModifiedBook];
                            }
                            else {
                            console.log("update Position Streaming Book done : old  "+JSON.stringify(state.positionStreamBook));    
                            psBook=  
                                [
                                ...psBook.filter(
                                    existing => !positionModifiedBook.some(newItem => newItem.id === existing.id)
                                ),
                                ...positionModifiedBook
                                ];

                            }    
                        }
                       let ft = JSON.parse(JSON.stringify(psBook));
                         console.log("new position book "+JSON.stringify(ft));




                        // Create a set of already existing symbols in feed cache
                        const existingSymbols = new Set(currentIndices.data);

                        // Find new symbols from positionStreamBook not already in feed cache
                        const newSymbols = psBook
                        .map((p) => p.symbol)
                        .filter((sym) => sym && !existingSymbols.has(sym));

                        if (newSymbols.length > 0) {
                        // Append new symbols with NSE: BSE: 
                        let preFixSymbols = newSymbols
                                         .map((ss) =>ss.indexOf("NIFTY") > -1 ? "NSE:"+ss: 
                                           ( ss.indexOf("BANK") >-1 ?  "BSE:"+ss :"NSE:"+ss )  )

                        currentIndices.data.push(...preFixSymbols);

                        console.log("✅ Position stream symbols added to feed cache:", preFixSymbols);

                        // Save back the updated cache
                        StorageUtils._save(CommonConstants.positionFeedDataCacheKey, currentIndices);
                        }
                      }
                      else {
                             state.positionStreamBook = action.payload;
                      }
                    }
                    else {
                        if(state.positionStreamBook !==undefined ){
                             let psBook = [...state.positionStreamBook]; // ✅ ensure it's an array
                            const positionModifiedBook = action.payload; // recevied from the 5003 General socket 
                            if (positionModifiedBook !==null && positionModifiedBook !== undefined && Array.isArray(positionModifiedBook)) {
                                if( psBook== undefined ) {  //[...orderModifiedBook];
                                psBook =[...positionModifiedBook];
                                }
                                else {
                                console.log("update Position Streaming Book done : old  "+JSON.stringify(state.positionStreamBook));    
                                psBook=  
                                    [
                                    ...psBook.filter(
                                        existing => !positionModifiedBook.some(newItem => newItem.id === existing.id)
                                    ),
                                    ...positionModifiedBook
                                    ];

                                }    
                            }
                            let ft = JSON.parse(JSON.stringify(psBook));
                            console.log("new position book "+JSON.stringify(ft));
                        }
                        else {
                             state.positionStreamBook = action.payload;
                       }
                    }
                 /* let currentIndices =  StorageUtils._retrieve(CommonConstants.positionFeedDataCacheKey);
                  let psBook =   [...state.positionBook];//Object.assign({}, state.positionBook);
                  if(psBook !==null && psBook !== undefined && Array.isArray(psBook)){
                        let isExtraSym = false; let extrSym :any =undefined; let newSymList:any = [];
                        currentIndices.data.forEach((feedSymbol:any) => {
                              let sy = feedSymbol;                                                             
                              psBook.forEach(p => { 
                                     if( p.symbol !== sy){
                                        isExtraSym = true;
                                        extrSym= p.symbol;
                                     }
                                     else{
                                        isExtraSym = true;
                                     }
                                 })
                             if(extrSym !==undefined && isExtraSym){
                                    newSymList.push(extrSym);
                             }
                        })
                          if(newSymList.length > 0){
                            newSymList.forEach((ss:any) => {
                                 currentIndices.data.push(ss)
                            })
                            console.log("position symbols added to feed cache ")
                      StorageUtils._save(CommonConstants.positionFeedDataCacheKey, currentIndices.data);      
                          }      
                    //    savePositionBook( psBook);
                  }
                    */
                 

         },


          savePositionBook: (state, action: PayloadAction<  any []   >) => {
                  state.positionBook = action.payload;
                  // Update the defaultIndicesData in the 
                  //   StorageUtils._save(CommonConstants.marketFeedDataCacheKey, CommonConstants.sampleObjTickerTDataVersion1);

                  // Get the current indices (market feed cache)
                    let currentIndices = StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);

                    if (currentIndices && Array.isArray(currentIndices.data)) {
                        let psBook = [...state.positionBook]; // ✅ ensure it's an array

                        // Create a set of already existing symbols in feed cache
                        const existingSymbols = new Set(currentIndices.data);

                        // Find new symbols from positionBook not already in feed cache
                        const newSymbols = psBook
                        .map((p) => p.symbol)
                        .filter((sym) => sym && !existingSymbols.has(sym));

                        if (newSymbols.length > 0) {
                        // Append new symbols with NSE: BSE: 
                        let preFixSymbols = newSymbols
                                         .map((ss) =>ss.indexOf("NIFTY") > -1 ? "NSE:"+ss: 
                                           ( ss.indexOf("BANK") >-1 ?  "BSE:"+ss :"NSE:"+ss )  )

                        currentIndices.data.push(...preFixSymbols);

                        console.log("✅ Position symbols added to feed cache:", preFixSymbols);

                        // Save back the updated cache
                        StorageUtils._save(CommonConstants.marketFeedDataCacheKey, currentIndices);
                        }
                    }

                 /* let currentIndices =  StorageUtils._retrieve(CommonConstants.marketFeedDataCacheKey);
                  let psBook =   [...state.positionBook];//Object.assign({}, state.positionBook);
                  if(psBook !==null && psBook !== undefined && Array.isArray(psBook)){
                        let isExtraSym = false; let extrSym :any =undefined; let newSymList:any = [];
                        currentIndices.data.forEach((feedSymbol:any) => {
                              let sy = feedSymbol;                                                             
                              psBook.forEach(p => { 
                                     if( p.symbol !== sy){
                                        isExtraSym = true;
                                        extrSym= p.symbol;
                                     }
                                     else{
                                        isExtraSym = true;
                                     }
                                 })
                             if(extrSym !==undefined && isExtraSym){
                                    newSymList.push(extrSym);
                             }
                        })
                          if(newSymList.length > 0){
                            newSymList.forEach((ss:any) => {
                                 currentIndices.data.push(ss)
                            })
                            console.log("position symbols added to feed cache ")
                      StorageUtils._save(CommonConstants.marketFeedDataCacheKey, currentIndices.data);      
                          }      
                    //    savePositionBook( psBook);
                  }
                    */
                 

         },
         savePositionTickerBook: (state, action: PayloadAction<  any []   >) => {

                  state.positionTicker = action.payload;
                  //  console.log(`savePositionTickerBook: ${JSON.stringify(state.positionTicker)}  `);
                  //   console.log(`state.positionBook: ${JSON.stringify(state.positionBook)}  `);
                 if (state.positionTicker !==null && state.positionTicker !==undefined) {
                    const tickPrice = state.positionTicker; // { ltp, symbol, type }

                    // Update positionBook immutably
                    if( Array.isArray(state.positionBook)) { 
                        state.positionBook = state.positionBook.map(p => {
                        if ( tickPrice.symbol.indexOf(p.symbol) > -1) {
                        //    console.log(`savePositionTickerBook: updating ${p.symbol} LTP to ${tickPrice.ltp}`);
                            return { ...p, ltp: tickPrice.ltp };
                        }
                        return p;
                        });

                    }
                    else {
                         console.log(`savePositionTickerBook: positionBook not array `);
                    }
                }
     
         },
    },
})

export const { saveSymbol, saveName ,saveStockResults ,savePositionBook , savePositionStreamBook,savePositionTickerBook   } = positionSlice.actions;

export default positionSlice.reducer;
