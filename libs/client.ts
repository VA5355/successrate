import axios from "axios";

  const API = axios.create({
      baseURL: 'https://www.alphavantage.co/query',
      timeout: 27000  // netlify times out in 30 secs 
  });
  API.interceptors.request.use((config) => {
    console.log("Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  });


const FYERSAPI = axios.create({
   //   baseURL: 'https://store-stocks.netlify.app/.netlify/functions/netlifystockfyersbridge/api'
  //baseURL: 'http://fyersbook.netlify.app/.netlify/functions/netlifystockfyersbridge/api'
  baseURL: 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api'
})
//const FYERSAPILOGINURL = 'https://store-stocks.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyerscallback'
//const FYERSAPINSECSV = 'https://store-stocks.netlify.app';
//const FYERSAPILOGINURL = 'http://fyersbook.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyerscallback'
const FYERSAPILOGINURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyerscallback'
const FYERSAPITRADEBOOKURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgettradebook'
const FYERSAPIPOSITIONBOOKURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetpositionbook'
const FYERSAPIHOLDINGSURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetholdings'
const FYERSAPIORDERBOOKSURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetorderbook'
const FYERSAPICANCELORDER = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyerscancelorder'
const FYERSAPIBUYORDER = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersplacebuyorder'
const FYERSAPISELLORDER = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersplacesellorder'

const FYERSAPITICKERURL = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersticker/api/fyersgetticker'
const FYERSAPITHREESECQUOTE = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersticker/api/fyersgetbsecequote'
const FYERSAPIMARKETFEEDRENDER = 'https://fyersmarketfeed.onrender.com/stream' // ?accessToken=

const FYERSAPIORDERSRENDER = 'https://fyersorders.onrender.com/stream' // ?accessToken=
const FYERSAPIPOSITIONSRENDER = 'https://fyers-positions-socket-git.onrender.com/stream' // ?accessToken=
const FYERSAPIMARKETCUSTOMFEED = 'https://fyersmarketfeed.onrender.com/stream' // ?accessToken=
const FYERSAPITICKERACCESTOKEN = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersticker/api/fyersaccesstoken'
const FYERSAPITICKERURLCLOSE = 'https://successrate.netlify.app/.netlify/functions/netlifystockfyersticker/api/close'
const FYERSAPINSECSV = 'https://successrate.netlify.app';

export { API , FYERSAPI ,FYERSAPILOGINURL , FYERSAPINSECSV , FYERSAPITRADEBOOKURL ,FYERSAPIHOLDINGSURL ,
  FYERSAPICANCELORDER,FYERSAPIBUYORDER,FYERSAPISELLORDER
  ,FYERSAPIORDERBOOKSURL ,FYERSAPITICKERURL , FYERSAPITICKERURLCLOSE ,FYERSAPITICKERACCESTOKEN,FYERSAPITHREESECQUOTE,
  FYERSAPIMARKETFEEDRENDER, FYERSAPIMARKETCUSTOMFEED, FYERSAPIORDERSRENDER,FYERSAPIPOSITIONSRENDER,
  FYERSAPIPOSITIONBOOKURL
};
