// hooks/useWebSocket.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
//import { setConnected, setSymbols } from "../store/websocketSlice";
import { setConnected, setSymbols } from '@/redux/slices/webSocketSlice';

export default function useWebSocket() {
  const dispatch = useDispatch();

  useEffect(() => {
    const ws = new WebSocket("wss://push.truedata.in:8082?user=DEMO1&password=DEMO1");

    ws.onopen = () => {
      dispatch(setConnected(true));
      // Request symbol list (depends on TrueData API)
      ws.send(JSON.stringify({ action: "getSymbols" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data !==null && data !== undefined && 
           data.symbollist !==null && data.symbollist !== undefined
       ) {
         dispatch(setSymbols(data.symbols));
      }
      else {
        console.log("no symbollist found ");
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      dispatch(setConnected(false));
    };

    ws.onclose = () => {
      dispatch(setConnected(false));
    };

    return () => ws.close();
  }, [dispatch]);
}
