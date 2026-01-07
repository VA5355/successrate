"use client";
import React, {useEffect, useState} from 'react'
import StockCard from '../stockCard/card.component'
import {useSelector} from 'react-redux';
import {GlobalState} from '@/redux/store';
import {ArrowDown2} from 'iconsax-react';
import {ScreenLoader} from '../../loader/screenLoader/loader.component';
import {fetchMoreStocks, fetchStockList} from './grid.actions';
import {useAppDispatch} from '@/providers/ReduxProvider';
import TradeTable from '@/components/company/trade/TradeTable';
import TradeGrid from '../tradeGrid/TradeGrid';
import TradeGridPlotterPDFCSV from '../tradeGrid/TradeGridPlotterPDFCSVbckp';
import PositionGrid from '../positionGrid/PositionGrid';
import { getPositionData } from '../positionGrid/positionGridBook.actions';
import { orderBookData } from '../positionGrid/orderBook.actions';
import { StorageUtils } from '@/libs/cache';
import { savePositionBook } from '@/redux/slices/positionSlice';
import { savePositionStreamBook } from '@/redux/slices/positionSlice';
import { CommonConstants } from '@/utils/constants';
import StockCandleChart from "@/components/charts/StockCandleChart";
import GridCards from '@/app/GridCards';
import './grid.css';

const StockGrid = () => {
    const gainers = useSelector((state: GlobalState) => state.stock.gainers)
    const losers = useSelector((state: GlobalState) => state.stock.losers)
    const activelyTraded = useSelector((state: GlobalState) => state.stock.activelyTraded)
    const tradeData = useSelector((state: GlobalState) => state.trade.tradeBook)
    const positionData = useSelector((state: GlobalState) => state.position.positionBook)
    const holdings = useSelector((state: GlobalState) => state.holding.holdingBook)
    const tab = useSelector((state: GlobalState) => state.misc.tab)
    const dispatch = useAppDispatch()
    const loader = useSelector((state: GlobalState) => state.misc.loader)
    const [positionOneFetch ,setPositionOneFetch ]= useState((  StorageUtils._retrieve(CommonConstants.fetchPositions).data ===  false  ? 1:0 )  );
    const [tickSym , setTickSym] = useState("")
    const selected = useSelector(
        (state: GlobalState) => state.stock.selectedCard
    );

      const rawTicker = selected?.ticker;
  const ticker =
  typeof rawTicker === "string"
    ? rawTicker
    : rawTicker?.symbol; // <-- adjust if needed

  /*  const symbol =
    selected?.ticker?.includes(":")
      ? selected.ticker.split(":")[1].replace("-EQ", "")
      : selected?.ticker; */
      const symbol =
  typeof ticker === "string" && ticker.includes(":")
    ? ticker.split(":")[1].replace("-EQ", "")
    : ticker;

    setTimeout(() => {
            //setIsDisplayed(true);
            let tickerValue ="";
            console.log( "typeof(symbol)  " + typeof(symbol)+ 
            " symbol  "+symbol); 
            console.log( "typeof(selected.ticker)  " + (selected !==undefined ? typeof(selected?.ticker ): "")+ 
            "selected.ticker "+selected?.ticker);   
            let th =(selected !==undefined ? typeof(selected?.ticker ): undefined) ;
            if(th == 'object'){
                    if (Array.isArray(selected?.ticker)) {
            tickerValue = selected?.ticker[1]; // ✅ first element
            } 
            else if (typeof th  === "object" && selected?.ticker !== null) {
            tickerValue = Object.values(selected?.ticker)[1] as string; // ✅ first property value
            }
            console.log( "tickerValue " + tickerValue)
            setTickSym(tickerValue);
            }
                
    
    } , 1200)

    const fetchMoreData = async () => {
        dispatch(fetchMoreStocks(gainers, losers, activelyTraded))
    }

    useEffect(() => {
        dispatch(fetchStockList())
        // SET the default INDICES 
        StorageUtils._save(CommonConstants.marketFeedDataCacheKey, CommonConstants.sampleObjTickerTDataVersion1);
         
      


    }, [dispatch])

     useEffect(() => {
       /*   let str = "{\"code\":1101,\"message\":\"Successfully placed order\",\"s\":\"ok\",\"id\":\"25092600347435\"}";

        StorageUtils._save(CommonConstants.recentSellledOrder,str);
        
        const recentSellORder  = StorageUtils._retrieve(CommonConstants.recentSellledOrder);
        if (  
           (recentSellORder?.isValid && recentSellORder.data !== null)) {
                 let r = recentSellORder.data !==undefined ?  JSON.parse(recentSellORder.data) : "";
            if ( ( ( r.message !== undefined ) && !(r.message.indexOf("Successfully") > -1))) {

                console.log(" r : "+JSON.stringify(r))

                 StorageUtils._save(CommonConstants.recentSellledOrder,"");
            }
           }*/
         handleCustomGridCols(tab)
    }, [tab])

    const handleFirstFetchPositions = () => {
        if(positionOneFetch <= 0){
            // FETHE POSITION BOOK DATA 
        dispatch(getPositionData(''));
        // FETH The recentTRades from storage if above call succeeded data will be there
        let redentPositionData =  StorageUtils._retrieve(CommonConstants.recentPositionsKey)
        const dataFromCache2 = StorageUtils._retrieve(CommonConstants.positionDataCacheKey)
        if( redentPositionData !== null && redentPositionData !==undefined  &&  Array.isArray(redentPositionData.data )){
                console.log(" GRID component aCTIONS recenPositions  "+JSON.stringify(redentPositionData.data))

        }else {
            console.log("GRID Component positions data from cahce ")
            redentPositionData = dataFromCache2;
        }
         dispatch( savePositionBook(([...redentPositionData.data])));
         dispatch( savePositionStreamBook(([...redentPositionData.data])));
         setPositionOneFetch(prev => prev+1);
          StorageUtils._save(CommonConstants.fetchPositions, false)
        // FETCH the ORDER BOOK DATA ALSO ONCE 
          dispatch(orderBookData(''));
        


        }
    }
    const handleCustomGridCols = (seletab:any) => { 
        let cls= `grid w-11/12 gap-4 mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-5 justify-between`;
        let  trdCls = `grid w-11/12 gap-4 mx-auto grid-cols-1 justify-between`;
        let clsUse = cls;
         if((seletab === "Educate") || (seletab === "Observe") )
         {  clsUse = cls;

         } else if ((seletab === "Trade")) {   
            console.log("TOP Traders clicked ");
            clsUse = trdCls;
         }
         else if((seletab === "Position")){
            console.log("Positions clicked ")
              clsUse = trdCls;
            handleFirstFetchPositions();
         }
        /*   let str = "{\"code\":1101,\"message\":\"Successfully placed order\",\"s\":\"ok\",\"id\":\"25092600347435\"}";

        StorageUtils._save(CommonConstants.recentSellledOrder,str);
        
        const recentSellORder  = StorageUtils._retrieve(CommonConstants.recentSellledOrder);
        if (  
           (recentSellORder?.isValid && recentSellORder.data !== null)) {
                 let r = recentSellORder.data !==undefined ?  JSON.parse(recentSellORder.data) : "";
            if ( ( ( r.code !== undefined ) &&   r.code !== 1101)) {

                console.log(" r : "+JSON.stringify(r))

                 StorageUtils._save(CommonConstants.recentSellledOrder,"");
            }
           }*/
        return clsUse
    }

    if (!gainers || !losers) {
        return null;
    }
    return (
        <div> {/* sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-5  */}
            {/*<StockCard key={item.symbol} stock={item}/>*/} {/* <StockCard key={item.symbol ?? index} stock={item}/> */}

            {  ( ( tab === "Educate") || (tab === "Observe" )  ?  <GridCards   /> : <></>) } 
            <div
                className={handleCustomGridCols(tab)}>
                {
                    tab === "Educate" ? gainers.map((item: any , index: number ) => {
                        return  ( <span key={`${index}-gainers`} className="forKeyAndDisplay"> </span>) 
                    }) : tab === "Observe" ? losers.map((item: any , index: number ) => {
                        return (<span key={`${index}-losers`} className="forKeyAndDisplay"> </span>)
                    }) :  tab === "Trade" ?   (  
                        
                         <TradeGridPlotterPDFCSV tradeDataB={tradeData} />
                     ) :  tab === "Position" ?   (  
                          <PositionGrid positionDataB={positionData} /> 

                     ):    <>    </> 
                }


            </div>
              {
                    tab === "Educate" ? (  
                    <div className="space-y-6 px-6 pt-[10px] ml-[88px]">
                                {/* Other content selected?.ticker

                                {symbol ? (
                                    <StockCandleChart symbol={symbol} />
                                ) : (
                                    <div className="text-sm text-gray-400 italic">
                                    Select a stock to view chart
                                    </div>


                                    Show other Active Symbols Card from 

                                     Iterate from the import nifty50 from "../tradeTicker/nifty-50";

                                             http://localhost:3065/api/marketStatus
                                            from  C:\icici\stock-nse-india\src routes.ts 
                                           mainRouter.get('/api/mostActive/:indexSymbol', async (req, res) => {
                                            the above data will give BOTH  GAINER and LOSER 
                                            sort it and get the exact 
                                    
                                            



                                )}*/} 
                        {selected?.ticker && (    <StockCandleChart
                                key={selected.ticker}   
                                symbol={tickSym}
                            /> )

                            
                                  }
                            
                                  

                    </div>


                          
                     ) : tab === "Observe" ? (  
                           <>    </> 
                     ) :    <>    </> 
                }

              
            {
                loader ? <ScreenLoader/> : <h1 id="loadMore" onClick={() => fetchMoreData()}
                                               className=' text-black font-regular text-xl transition-all py-10 cursor-pointer p-2  dark:text-white flex items-center justify-center hover:mt-2'>Load
                    more <ArrowDown2 className='ml-2'/></h1>
            }

        </div>
    )
}

export default StockGrid
