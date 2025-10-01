import { configureStore } from '@reduxjs/toolkit';
import stockSlice, { StockSliceProps } from './slices/stockSlice';
import miscSlice, {MiscSliceProps} from './slices/miscSlice';
import equitySlice, { EquitySliceProps } from './slices/equitySlice';
import tradeSlice, { TradeSliceProps } from './slices/tradeSlice';
import holdingSlice, { HoldingSliceProps } from './slices/holdingSlice';
import positionSlice, { PositionSliceProps } from './slices/positionSlice';
import orderBookSlice, { OrderBookSliceProps } from './slices/orderBookSlice';
import buyOrderBookSlice, { BuyOrderBookSliceProps } from './slices/buyOrderBookSlice';
import tickerSensexSlice, { TickerSensexSliceProps } from './slices/tickerSensexSlice';
import tickerBankNiftySlice, { TickerBankNiftySliceProps } from './slices/tickerBankNiftySlice';
import tickerNiftySlice, { TickerNiftySliceProps } from './slices/tickerNiftySlice';
import tickerSlice,{  TickerSliceProps } from './slices/tickerSlice';
import webSocketSlice,{  WebSocketSliceProps } from './slices/webSocketSlice';

import modalReducer, { createModalMiddleware } from '../components/common/service/ModalService';

export interface GlobalState {
    stock: StockSliceProps;
    misc: MiscSliceProps;
    equity: EquitySliceProps
    trade: TradeSliceProps,
    order: OrderBookSliceProps,
    buyOrder: BuyOrderBookSliceProps,
     position: PositionSliceProps,
     holding:HoldingSliceProps ,
     nifty:TickerNiftySliceProps ,
     sensex:TickerSensexSliceProps ,
     banknifty:TickerBankNiftySliceProps ,
     ticker: TickerSliceProps,
     websocket:WebSocketSliceProps
}
const modalMiddleware = createModalMiddleware({
        mapRejectedToModal: (action:any) => ({
        title: 'Operation failed',
        message: action.payload?.message || action.error?.message || 'Request failed',
        }),
});
export const store = configureStore({
	reducer: {
        stock: stockSlice,
        misc:miscSlice,
        equity: equitySlice,
        trade:tradeSlice,
        order:orderBookSlice,
        buyOrder:buyOrderBookSlice,
        position:positionSlice,
        holding:holdingSlice,
        nifty:tickerNiftySlice,
        sensex:tickerSensexSlice ,
        banknifty:tickerBankNiftySlice,
        ticker:tickerSlice,
        websocket: webSocketSlice, // <-- THIS makes state.websocket available
         modal: modalReducer 

	},
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(modalMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
