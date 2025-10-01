import { useDispatch, useSelector   } from "react-redux";
import  {  useReducer, useState,useEffect } from 'react';
import { selectFilteredStrikes } from '@/redux/selectors/webSockSelector';
import webSocketSlice  from '@/redux/slices/webSocketSlice';
//import { selectFilteredStrikes } from "../store/selectors";
import useWebSocketStream from "@/redux//hooks/useWebSocketStream";
 import { placeBuyOrder ,placeSellOrder  ,updateTickerStatusFromCache ,stopSensexTickerData } from "../placeBuyOrder.actions";
import {StorageUtils} from "@/libs/cache";
import {CommonConstants} from "@/utils/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, X, Heading4 } from "lucide-react";
import "./index.css";
import SwipePill from './SwipePill';

import { ChevronUp, ChevronDown } from "lucide-react";



/* ----------------------------------------------------------------------------
   OPTION ROW COMPONENT
   ----------------------------------------------------------------------------
   - Displays one strike row
   - CALL pill on left, PUT pill on right
   - Middle strike price (desktop only)
----------------------------------------------------------------------------- */
function OptionRow({ row, onAction }) {
  const strike = row.strike;
  const type =  row.type;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_1.2fr] gap-2 sm:gap-3 items-center rounded-2xl bg-white sm:bg-transparent p-2 sm:p-0">
      {/* CALL pill */}
      {type ==="CE" &&  <SwipePill
        side="CALL"
        label={`CALL ${strike}`}
        ltp = {`₹${row.ltp}` }
        subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
        onBuy={(qty,price) => onAction?.({ side: "CALL", action: "BUY",qty:qty,price:price, strike, row })}
        onSell={(qty,price) => onAction?.({ side: "CALL", action: "SELL", qty:qty,price:price, strike, row })}
        className="sm:order-1"
      />
      
      }
     

      {/* Strike (desktop only) */}
      <div className="hidden sm:flex items-center justify-center text-sm text-zinc-700 font-semibold">
        {strike}
      </div>

      {/* PUT pill */}
        {type ==="PE" &&  <SwipePill
        side="PUT"
        label={`PUT ${strike}`}
         ltp = {`₹${row.ltp}` }
        subtitle={`LTP ₹${row.ltp} · Bid ₹${row.bid} · Ask ₹${row.ask}`}
        onBuy={(qty,price) => onAction?.({ side: "PUT", action: "BUY",qty:qty,price:price, strike, row })}
        onSell={(qty,price) => onAction?.({ side: "PUT", action: "SELL",qty:qty,price:price, strike, row })}
        className="sm:order-3"
      /> } 
     
    </div>  
  );
}
export default OptionRow;