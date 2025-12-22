import dynamic from "next/dynamic";

const TradeTickerBar = dynamic(
  () => import("./tradeTicker.component"),
  { ssr: false }
);

export default TradeTickerBar;