import React, { useEffect, useRef, useMemo } from 'react';
import "./ComponentSymbolScript.css";
// --- WIDGET CONFIGURATIONS (Default Props) ---

// 1. Configuration for the Ticker Tape Widget
const defaultTickerTapeConfig = {
    "symbols": [
        { "description": "", "proName": "NSE-ICICIBANK" },
        { "description": "", "proName": "NASDAQ:AAPL" },
        { "description": "", "proName": "NASDAQ:NVDA" },
        { "description": "", "proName": "NASDAQ:MSFT" },
        { "description": "", "proName": "NASDAQ:AMZN" },
        { "description": "", "proName": "NASDAQ:GOOGL" },
        { "description": "", "proName": "NASDAQ:META" },
        { "description": "", "proName": "NYSE:BRK.B" },
        { "description": "", "proName": "NYSE:LLY" },
        { "description": "", "proName": "NYSE:UNH" },
        { "description": "", "proName": "NYSE:V" },
        { "description": "", "proName": "NYSE:WMT" }
    ],
    "showSymbolLogo": true,
    "colorTheme": "light",
    "isTransparent": false,
    "displayMode": "adaptive",
    "locale": "en"
};

// 2. Configuration for the Symbol Info Widget
const defaultSymbolInfoConfig = {
    "symbol": "NASDAQ:AAPL",
    "width": "100%",
    "locale": "en",
    "colorTheme": "light",
    "isTransparent": true
};

// 3. Configuration for the Advanced Chart Widget
const defaultAdvancedChartConfig = {
    "autosize": true,
    "symbol": "NASDAQ:AAPL",
   // "symbol": "NSE-ICICIBANK251028C1380",
   //  "symbol": "NSE:NIFTY251014C19350",
    "interval": "D",
  //  "timezone": "Etc/UTC",
    "theme": "light",
    "style": "1",
    "locale": "en",
    "allow_symbol_change": true,
    "calendar": false,
   // "support_host": "https://www.tradingview.com"
    "support_host": "https://in.tradingview.com/chart/8bbswsuZ/?symbol="
};

// --- GENERIC TRADINGVIEW WIDGET COMPONENT ---

/**
 * A generic component to load a TradingView widget dynamically via script injection.
 * @param {{ scriptSrc: string, config: object, containerId: string }} props
 */
const TradingViewWidget = ({ scriptSrc, config, containerId }) => {
    let containerRef = useRef(null);
    const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);
    useEffect(() => {
      const container =  containerRef.current; // ✅ stable reference
        // Clear any previous widget content
       // if (containerRef.current) {
         if (container) { 
           // containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
            container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.type = 'text/javascript';
        // The 'async' attribute is added implicitly as scripts are loaded after mounting
        script.async = true;

        // The JSON configuration object is converted to a string and added as script text content
        script.textContent = JSON.stringify(config);

       // if (containerRef.current) {
        if (container) {
            container.appendChild(script);
        }

        // Cleanup function: remove the script tag and its container content on unmount
        return () => {
           // if (containerRef.current) {
            if (container) {
                
               // containerRef.current.innerHTML = '';
               container.innerHTML = '';
            }
            // Note: The external script itself is harder to remove completely from the DOM,
            // but clearing the container prevents multiple instances from running.
        };
    }, [scriptSrc, memoizedConfig]); // Rerun if config or script source changes
 useEffect(() => {
    // Inject CSS once
    const styles = `
      .buttons-container {
          display: flex;
          flex-direction: row;
          gap: 8px;
          margin-top: 10px;
      }
      .buttons-container button {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
          font-size: 16px;
          font-style: normal;
          font-weight: 510;
          line-height: 24px;
          letter-spacing: -0.32px;
          padding: 8px 24px;
          color: rgba(19, 23, 34, 1);
          background-color: rgba(240, 243, 250, 1);
          border-radius: 8px;
          cursor: pointer;
      }
      .buttons-container button:hover {
          background-color: rgba(224, 227, 235, 1);
      }
      .buttons-container button:active {
          background-color: rgba(209, 212, 220, 1);
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    return () => document.head.removeChild(styleTag);
  }, []);
    return (
        // The container div is required by TradingView widgets
        <div ref={containerRef} className="tradingview-widget-container" id={containerId} style={{ height: '100%', width: '100%' }}>
            {/* The inner div is where the widget content will be injected */}
            <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
        </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---

export default function ComponentSymbol(props) {
    const {
        tickerTapeConfig = defaultTickerTapeConfig,
        symbolInfoConfig = defaultSymbolInfoConfig,
        advancedChartConfig = defaultAdvancedChartConfig,
    } = props;

    // The script for the main advanced chart widget is slightly different, 
    // so we handle it as a separate component instance
    const AdvancedChart = () => (
        <TradingViewWidget
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
            config={advancedChartConfig}
            containerId="advanced-chart-container"
        />
    );
    
    // The script for the symbol info widget
    const SymbolInfo = () => (
        <TradingViewWidget
            //scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
            scriptSrc="https://www.tradingview.com/chart/bxeoicxq/"
            config={symbolInfoConfig}
            containerId="symbol-info-container"
        />
    );
    
    // The script for the ticker tape widget
    const TickerTape = () => (
        <TradingViewWidget
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
            config={tickerTapeConfig}
            containerId="ticker-tape-container"
        />
    );
      // ✅ New IFrame for TradingView → Fyers redirect https://www.tradingview.com/trading/oauth-redirect/fyers
  const FyersRedirectFrame = () => (
    <section id="fyers-redirect">
      <iframe
        src="https://www.tradingview.com"
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

    return (
        <>
            {/* Load Tailwind CSS for utility classes  this breaks the NEXT JS code 
            <script src="https://cdn.tailwindcss.com"></script>*/}
           

            <div className="min-h-screen w-full flex flex-col items-center">
               {/*  <header>
                    <a id="site-logo" href="#">TradingVista</a>
                    <input type="search" placeholder="Search..." />
                </header>
                    */}
                 {/* <nav id="ticker-tape">
                   TickerTape Widget
                    <TickerTape />
                </nav> */}
                 <div className="buttons-container">
                      <button  >Go to realtime</button>
                 </div>
                <main>
                    {/* Symbol Info Widget Section */}
                    <section id="symbol-info">
                        <SymbolInfo />
                    </section>

                    {/* Advanced Chart Widget Section */}
                    <section id="advanced-chart">
                        <AdvancedChart />
                    </section>
                       {/* ✅ Add the new TradingView →https://www.tradingview.com Fyers redirect frame here /trading/oauth-redirect/fyers" */}

                    {/*   <FyersRedirectFrame />*/}
                     <button
                        onClick={() =>
                            window.open(
                            "https://in.tradingview.com/chart/bxeoicxq/",
                            "fyersAuthWindow",
                            "width=800,height=700,left=200,top=100"
                            )
                        }
                        >
                        Login via Fyers (TradingView)
                        </button>
                    {/* Placeholder Sections */}
                   {/* <section id="company-profile">Company Profile</section>
                    <section id="fundamental-data">Fundamental Data</section>
                    <section id="technical-analysis">Technical Analysis</section>
                    <section id="top-stories">Top Stories</section>
                    */}
                    {/* Powered By TradingView Section */} 
                    
                    {/* NOTE: React requires the href to be a full URL/path, 
                                but since the original was a relative path, we leave it as is 
                                assuming the SVG sprite is available at the root. */}
                   {/* <section id="powered-by-tv">
                        <svg xmlns="http://www.w3.org/2000/svg" width="157" height="21">
                           
                            <use href="/widget-docs/tradingview-logo.svg#tradingview-logo"></use>
                        </svg>
                      <p>
                            Charts and financial information provided by TradingView, a popular
                            charting & trading platform. Check out even more
                            <a href="https://www.tradingview.com/features/"> advanced features</a>
                            or <a href="https://www.tradingview.com/widget/"> grab charts</a> for
                            your website.
                        </p> 
                    </section>*/}
                </main>

                <footer>
              {/*     <p>
                        This example page is part of a tutorial for integrating TradingView
                        widgets into your website.
                    </p>
                    <p><a href="https://www.tradingview.com/widget-docs/tutorials/build-page/#build-a-page">View the tutorial</a></p>
               */} </footer>
            </div>
        </>
    );
}
