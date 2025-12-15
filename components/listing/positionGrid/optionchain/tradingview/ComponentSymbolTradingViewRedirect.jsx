import React, { useEffect, useRef, useMemo } from 'react';

// --- DEFAULT CONFIGURATIONS ---
const defaultTickerTapeConfig = {
  symbols: [
    { description: '', proName: 'NSE-ICICIBANK' },
    { description: '', proName: 'NASDAQ:AAPL' },
    { description: '', proName: 'NASDAQ:NVDA' },
    { description: '', proName: 'NASDAQ:MSFT' },
    { description: '', proName: 'NASDAQ:AMZN' },
    { description: '', proName: 'NASDAQ:GOOGL' },
    { description: '', proName: 'NASDAQ:META' },
    { description: '', proName: 'NYSE:BRK.B' },
    { description: '', proName: 'NYSE:LLY' },
    { description: '', proName: 'NYSE:UNH' },
    { description: '', proName: 'NYSE:V' },
    { description: '', proName: 'NYSE:WMT' }
  ],
  showSymbolLogo: true,
  colorTheme: 'light',
  isTransparent: false,
  displayMode: 'adaptive',
  locale: 'en'
};

const defaultSymbolInfoConfig = {
  symbol: 'NASDAQ:AAPL',
  width: '100%',
  locale: 'en',
  colorTheme: 'light',
  isTransparent: true
};

const defaultAdvancedChartConfig = {
  autosize: true,
  symbol: 'NASDAQ:AAPL',
  interval: 'D',
  theme: 'light',
  style: '1',
  locale: 'en',
  allow_symbol_change: true,
  calendar: false,
  support_host: 'https://in.tradingview.com/chart/8bbswsuZ/?symbol='
};

// --- GENERIC WIDGET LOADER ---
const TradingViewWidget = ({ scriptSrc, config, containerId }) => {
  const containerRef = useRef(null);
  const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify(config);
    if (container) container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [scriptSrc, memoizedConfig]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      id={containerId}
      style={{ height: '100%', width: '100%' }}
    >
      <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function ComponentSymbolTradingViewRedirect({
  tickerTapeConfig = defaultTickerTapeConfig,
  symbolInfoConfig = defaultSymbolInfoConfig,
  advancedChartConfig = defaultAdvancedChartConfig
}) {
  const AdvancedChart = () => (
    <TradingViewWidget
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      config={advancedChartConfig}
      containerId="advanced-chart-container"
    />
  );

  const SymbolInfo = () => (
    <TradingViewWidget
      scriptSrc="https://www.tradingview.com/chart/bxeoicxq/"
      config={symbolInfoConfig}
      containerId="symbol-info-container"
    />
  );

  // ✅ New IFrame for TradingView → Fyers redirect
  const FyersRedirectFrame = () => (
    <section id="fyers-redirect">
      <iframe
        src="https://www.tradingview.com/trading/oauth-redirect/fyers"
        title="TradingView Fyers Redirect"
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #e0e3eb',
          borderRadius: '8px',
          marginTop: '20px'
        }}
        allowFullScreen
      ></iframe>
    </section>
  );

  // --- RETURN UI ---
  return (
    <>
      <style>
        {`
          :root {
            --gap-size: 32px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fff;
          }

          main {
            display: grid;
            width: 100%;
            padding: 0 calc(var(--gap-size) * 0.5);
            max-width: 960px;
            grid-template-columns: 1fr 1fr;
            grid-gap: var(--gap-size);
          }

          #symbol-info { height: 175px; grid-column: span 2; }
          #advanced-chart { height: 500px; grid-column: span 2; }
          #fyers-redirect { grid-column: span 2; }
          
          .buttons-container {
            display: flex;
            flex-direction: row;
            gap: 8px;
            margin-top: 10px;
          }

          .buttons-container button {
            all: unset;
            font-size: 16px;
            padding: 8px 24px;
            color: rgba(19, 23, 34, 1);
            background-color: rgba(240, 243, 250, 1);
            border-radius: 8px;
            cursor: pointer;
            text-align: center;
          }

          .buttons-container button:hover {
            background-color: rgba(224, 227, 235, 1);
          }

          .buttons-container button:active {
            background-color: rgba(209, 212, 220, 1);
          }

          @media (max-width: 800px) {
            main > section {
              grid-column: span 2;
            }
          }
        `}
      </style>

      <div className="min-h-screen w-full flex flex-col items-center">
        <div className="buttons-container">
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
            Go to Realtime
          </button>
        </div>

        <main>
          <section id="symbol-info">
            <SymbolInfo />
          </section>

          <section id="advanced-chart">
            <AdvancedChart />
          </section>

          {/* ✅ Add the new TradingView → Fyers redirect frame here */}
          <FyersRedirectFrame />
        </main>
      </div>
    </>
  );
}
