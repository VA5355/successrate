// ModalService.jsx
// A self-contained React + Tailwind Modal Dialog Service wired to Redux (RTK)
// - modalSlice: show/hide modal (generic + error helpers)
// - modalMiddleware: automatically shows a modal for rejected async thunks
// - ModalRoot: a Tailwind-styled modal component that reads from Redux
// - examples: how to wire into store and dispatch

/*
  Install (if not already):
    npm install @reduxjs/toolkit react-redux

  Usage summary:
  1) Add `modalSlice.reducer` to your root reducer / configureStore.
  2) Add `modalMiddleware` to your middleware chain (optional but recommended).
  3) Render <ModalRoot /> near the top of your App (so modals overlay everything).
  4) Dispatch `showModal(...)` or `showError(...)` from anywhere using redux dispatch.
     You can also rely on automatic display for rejected thunks if you enable middleware.
*/

import React from "react";
import { createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Minus, Plus } from "lucide-react";
import {  Clock, Zap, Shield, Info } from 'lucide-react';
// --------------------
// modalSlice (RTK)
// --------------------

const initialState = {
  visible: false,
  type: "info", // 'info' | 'error' | 'confirm' | 'existposition'
  title: "",
  message: "",
  payload: null, // optional extra data
  onConfirm: null, // callback id or serialized info (if you want parent to handle)
};
let globalposition = {};
let exitpositondata ={ 
  showSymbolModal : "",
  setShowSymbolModal : () => {},
  setIsVisible : () => {},
  setIsScheduled : () => {},
  setSelectedSymbol : () => {},
  positionSymbol : "",
  productMode : "", 
  orderType : "", 
  positionQuantity : "", 
  positionQty : "", 
  positionPrice : "", 
  lotSize : "", 
  boughtQty : "", 
  isVisible : false, 
  isScheduled : false, 
  selectedSymbol : "", 
  setPositionPrice: (p) => { globalposition.positionPrice = p; },
  setPositionQty: (p) => { globalposition.positionQty = p; },
  setProductMode: (p) => { globalposition.productMode = p; },
  setOrderType: (p) => { globalposition.orderType = p; },
  dispatchSellSelected : () => {} 


}

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal(state, action) {
      const { title = "", message = "", type = "info", payload = null, onConfirm = null } = action.payload || {};
      state.visible = true;
      state.title = title;
      state.message = message;
      state.type = type;
      state.payload = payload;
      state.onConfirm = onConfirm;
      if(payload !==undefined && payload  !==null ){
        //check type is  = existposition 
          let modalType = (payload["modalType"] !==null &&  payload["modalType"] !==undefined ) ? payload["modalType"] :  null;
         if(modalType !== null && modalType !== undefined && modalType === "existposition") {
            let showSymbolModal = payload["showSymbolModal"];
            let setShowSymbolModal = payload["setShowSymbolModal"];
            if(typeof setShowSymbolModal ==="function"){
               console.log("Set Show Symbol Modal Function provided ")
            }
              let setIsVisible = payload["setIsVisible"];
            if(typeof setIsVisible ==="function"){
               console.log("Set setIsVisible Function provided ")
            }
              let setIsScheduled = payload["setIsScheduled"];
            if(typeof setIsScheduled ==="function"){
               console.log("Set setIsScheduled Function provided ")
            }
              let setSelectedSymbol = payload["setSelectedSymbol"];
            if(typeof setSelectedSymbol ==="function"){
               console.log("Set setSelectedSymbol Function provided ")
            }

            let positionSymbol = payload["positionSymbol"];
          let productMode = payload["productMode"];
          let orderType = payload["orderType"];
          let positionQuantity = payload["position"]
          exitpositondata.boughtQty =  payload["boughtQty"]
       
          exitpositondata.showSymbolModal =  showSymbolModal
          exitpositondata.setShowSymbolModal = setShowSymbolModal
          exitpositondata.setIsVisible = setIsVisible
          exitpositondata.setIsScheduled = setIsScheduled
          exitpositondata.setSelectedSymbol = setSelectedSymbol
          exitpositondata.positionSymbol =  positionSymbol
          exitpositondata.productMode = productMode
          exitpositondata.orderType =  orderType
          exitpositondata.positionQuantity =  positionQuantity
          exitpositondata.lotSize =  payload["lotSize"]
          exitpositondata.isVisible =  payload["isVisible"]
          exitpositondata.isScheduled =  payload["isScheduled"]
          exitpositondata.selectedSymbol =  payload["selectedSymbol"]
          exitpositondata.dispatchSellSelected =  payload["dispatchSellSelected"]
              globalposition = exitpositondata;
         }
           
      }
    },
    showError(state, action) {
      const { title = "Error", message = "An error occurred.", payload = null } = action.payload || {};
      state.visible = true;
      state.title = title;
      state.message = message;
      state.type = "error";
      state.payload = payload;
      state.onConfirm = null;
    },
    hideModal(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { showModal, showError, hideModal } = modalSlice.actions;
export default modalSlice.reducer;

// --------------------
// modalMiddleware (optional helpful piece)
// Automatically shows errors for rejected thunks (RTK createAsyncThunk)
// You can customize this to inspect action.error.message or action.payload
// --------------------

export function createModalMiddleware(options = {}) {
  const { mapRejectedToModal = (action) => ({ title: "Error", message: action.error?.message || "Something went wrong" }) } = options;

  return (storeAPI) => (next) => (action) => {
    // If an action is rejected (common shape from createAsyncThunk), show modal
    if (action?.type?.endsWith("/rejected")) {
      try {
        const modalPayload = mapRejectedToModal(action) || {};
        storeAPI.dispatch(showError(modalPayload));
      } catch (err) {
        // swallow middleware errors
        console.error("modalMiddleware error", err);
      }
    }

    return next(action);
  };
}

// --------------------
// ModalRoot component
// Reads modal state from redux and renders a Tailwind modal
// --------------------

export function ModalRoot() {
  const dispatch = useDispatch();
  const modal = useSelector((s) => s.modal || {});

  if (!modal.visible) return null;

  const isError = modal.type === "error";
  const isExitPosition = modal.type=== "exitposition";
  const isQuitOrder = modal.type=== "quitorder";

  const close = () => dispatch(hideModal());
    const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sheet = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: "100%" },
};

  const confirm = () => {
    // If parent provided onConfirm (string or function id), you can handle it here
    // For simple apps, you might pass a callback via a ref registry. We'll just hide for now.
    if (typeof modal.onConfirm === "function") {
      try {
        modal.onConfirm(modal.payload);
      } catch (e) {
        console.error(e);
      }
    }
    dispatch(hideModal());
  };

  const sellPositionDialog = (exitpositondata) => { 

    return ( 
         <AnimatePresence>
        {exitpositondata.showSymbolModal && (
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
            onClick={exitpositondata.setShowSymbolModal(false)}
          >
            <motion.div
              variants={sheet}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => { e.stopPropagation(); exitpositondata.setSelectedSymbol(exitpositondata.positionSymbol)  } }
              className="bg-white w-full md:w-[400px] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Exit Position</h2>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Sell Order Ticket</p>
                </div>
                <button 
                  onClick={() => {  exitpositondata.setShowSymbolModal(false);   exitpositondata.setIsVisible(false);  } }
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[85vh] overflow-y-auto">
                
                {/* Symbol Selection - Horizontal Scroll 
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Select Instrument</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {symbolArray.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all whitespace-nowrap
                          ${selectedSymbol === symbol 
                            ? "border-red-500 bg-red-50 text-red-600" 
                            : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>*/}

                {/* Toggle Group: Market/Limit & Product Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Order Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['Market', 'Limit'].map((t) => (
                        <button
                          key={t}
                          onClick={() => exitpositondata.setOrderType(t)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${exitpositondata.orderType === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">   {exitpositondata.positionSymbol}</label>
                  
                  </div>
                {/* */}  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Product</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['MARGIN', 'CNC'].map((p) => (
                        <button
                          key={p}
                          onClick={() => exitpositondata.setProductMode(p)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${exitpositondata.productMode === p ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quantity Slider */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Zap size={14} className="text-orange-400"/> Quantity
                    </label>
                    <span className="text-sm font-mono  font-bold text-gray-800">{positionQty}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    step={exitpositondata.lotSize}
                    max={exitpositondata.boughtQty }
                    value={exitpositondata.positionQty}
                    onChange={(e) => exitpositondata.setPositionQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg mobile-margin-qty appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>0</span>
                    <span>Max: {boughtQty }</span>
                  </div>
                </div>

                {/* Price Slider - Disabled if Market */}
                <div className={`space-y-3 p-4 rounded-xl border transition-all ${exitpositondata.orderType === 'Market' ? 'opacity-40 bg-gray-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Shield size={14} className="text-blue-400"/> Price
                    </label>
                    <span className="text-sm font-mono  font-bold text-gray-800">₹ {exitpositondata.orderType === 'Market' ? '---' : exitpositondata.positionPrice}</span>
                  </div>
                  <input
                    type="range"
                    disabled={exitpositondata.orderType === 'Market'}
                    min="0"
                    step="0.05"
                    max={1000}
                    value={exitpositondata.positionPrice}
                    onChange={(e) => exitpositondata.setPositionPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 mobile-margin-price rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                {/* Scheduled Checkbox / Toggle */}
                <div 
                  onClick={() => exitpositondata.setIsScheduled(!exitpositondata.isScheduled)}
                  className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer transition-colors hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${exitpositondata.isScheduled ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Schedule Order</p>
                      <p className="text-[10px] text-blue-600 font-medium">Execute at market open</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${exitpositondata.isScheduled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${exitpositondata.isScheduled ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>

                {/* Summary Info */}
                <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p>Approx. transaction value will be <span className="font-bold text-gray-700">₹ {(exitpositondata.positionQty * exitpositondata.positionPrice).toLocaleString()}</span>. Charges are applicable as per your plan.</p>
                </div>

                {/* Final Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { exitpositondata.setShowSymbolModal(false);  exitpositondata.setIsVisible(false); } }
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button     onClick={exitpositondata.dispatchSellSelected}
                    disabled={exitpositondata.positionQty <= 0}
                    className={`flex-[2] py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95
                      ${exitpositondata.positionQty > 0 ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  >
                    <CheckCircle size={18} />
                    Confirm Sell
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    )
  }


  return (  <>
     
      {   (modal.payload  !== undefined  && modal.payload  !== null ) &&  modal.payload?.modalType==='exitposition'   ? ( sellPositionDialog(modal.payload)  )  : (

             <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50" onClick={close} />

  {/* Dialog */}
  <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
    {/* Header */}
    <div
      className={`px-4 py-2 sm:px-6 sm:py-3 border-b ${
        isError ? "bg-red-50" : "bg-gray-50"
      }`}
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
        {modal.title}
      </h3>
    </div>

    {/* Body */}
    <div className="px-4 py-3 sm:p-6">
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {modal.message}
      </p>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-2 px-4 py-2 sm:px-6 sm:py-3 border-t">
      <button
        onClick={close}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
      >
        Close
      </button>

      <button
        onClick={confirm}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
          isError
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isError ? "Dismiss" : "OK"}
      </button>
    </div>
  </div>
</div>

    )  } 
   </>
  );
}
/*            OLD MODAL 


<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`px-6 py-4 border-b ${isError ? "bg-red-50" : "bg-gray-50"}`}>
          <h3 className="text-lg font-semibold text-gray-800">{modal.title}</h3>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{modal.message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={close}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>

          <button
            onClick={confirm}
            className={`px-4 py-2 rounded-md text-sm font-semibold ${isError ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {isError ? "Dismiss" : "OK"}
          </button>
        </div>
      </div>
    </div>

*/
// --------------------
// Example: wiring into store (store.js)
// --------------------

/*
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import modalReducer, { createModalMiddleware } from './ModalService';
import otherReducer from './otherSlice';

const modalMiddleware = createModalMiddleware({
  mapRejectedToModal: (action) => ({
    title: 'Operation failed',
    message: action.payload?.message || action.error?.message || 'Request failed',
  }),
});

const store = configureStore({
  reducer: { modal: modalReducer, other: otherReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(modalMiddleware),
});

function RootApp() {
  return (
    <Provider store={store}>
      <App />
      <ModalRoot />  place it at top-level so it overlays everything  
    </Provider>
  );
}
*/

// --------------------
// Example: dispatching modal from anywhere
// --------------------

/*
// Inside any component or thunk
import { useDispatch } from 'react-redux';
import { showModal, showError } from './ModalService';

function SomeComponent() {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(showModal({ title: 'Confirm', message: 'Do you want to proceed?', type: 'confirm', payload: { id: 123 } }));
  };

  const handleError = () => {
    dispatch(showError({ title: 'Failed', message: 'Payment failed. Try again.' }));
  };

  return (
    <div>
      <button onClick={handleClick}>Open Confirm</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
*/

// --------------------
// Example: automatic modal on rejected async thunk
// --------------------

/*
// In a createAsyncThunk thunk, if it rejects, the modalMiddleware will pick it up and show the error.
// e.g.
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchData = createAsyncThunk('data/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Bad response');
    return await res.json();
  } catch (err) {
    return rejectWithValue({ message: err.message });
  }
});
*/

// --------------------
// Notes & Extensibility
// --------------------
// - If you need confirm dialogs with callbacks, consider adding a small callback registry (Ref map) outside Redux
//   where you register functions and pass an id through modal.payload/onConfirm. Keep in mind Redux state should be serializable.
// - Tailor the ModalRoot markup to your design system. This snippet uses simple Tailwind classes for clarity.
// - The middleware is optional — you can also dispatch showError directly in catch blocks.

// End of file
