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

// --------------------
// modalSlice (RTK)
// --------------------

const initialState = {
  visible: false,
  type: "info", // 'info' | 'error' | 'confirm'
  title: "",
  message: "",
  payload: null, // optional extra data
  onConfirm: null, // callback id or serialized info (if you want parent to handle)
};

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
  const close = () => dispatch(hideModal());
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

  return (
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
