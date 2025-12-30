"use client";
import Header from '@/components/common/pageHeader/header.component';
import { ScreenLoader } from '@/components/loader/screenLoader/loader.component';
import Menu from '@/components/listing/stockControls/menu.component';
import { GlobalState } from '@/redux/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { SubscribePopup } from '@/components/SubscribePopup'
import TradeTickerBar from "@/components/tradeTicker/tradeTickerBar.component";
import StockCandleChart from "@/components/charts/StockCandleChart";
const DynamicGrid = dynamic(() => import('../components/listing/stockGrid/grid.component'), {
  loading: () => <p>Loading...</p>,
})


export default function Home() {
  const isDarkMode = useSelector((state: GlobalState) => state.misc.isDarkMode)
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

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className='bg-white dark:bg-black '>
        <ScreenLoader />
        <Header />
         {/* 🔔 Ticker goes here */}
        <TradeTickerBar />
        <Menu />
        <DynamicGrid />
          <div className="space-y-6 px-6 ml-[88px]">
              {/* Other content 

              {symbol ? (
                <StockCandleChart symbol={symbol} />
              ) : (
                <div className="text-sm text-gray-400 italic">
                  Select a stock to view chart
                </div>
              )}*/}
         </div>

           <SubscribePopup />
      </div>
    </div>
  )
}
