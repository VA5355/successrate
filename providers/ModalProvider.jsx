import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

// --- 1. CONTEXT SETUP ---
// This allows any component or hook to dispatch modal actions
const ModalContext = createContext();

//export const useModal = () => useContext(ModalContext);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};



export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    status: 'loading', // 'loading' | 'error' | 'success'
    message: '',
    onRetry: null,
  });

  const showFramerModal = useCallback(({ status = 'loading', message = '', onRetry = null }) => {
    setModal({ isOpen: true, status, message, onRetry });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showFramerModal, hideModal }}>
      {children}
      <GlobalSpinnerUI {...modal} onClose={hideModal} />
    </ModalContext.Provider>
  );
};

// --- 2. REUSABLE UI COMPONENT (Mobile Responsive) ---
const GlobalSpinnerUI = ({ isOpen, status, message, onRetry, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Compact Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative w-[30%] max-w-[160px] rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex flex-col items-center text-center">
              {/* Animated Icon Container */}
              <div className="mb-2">
                {status === 'loading' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-blue-500"
                  >
                    <Loader2 size={32} strokeWidth={3} />
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">
                    <AlertCircle size={32} strokeWidth={3} />
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                    <CheckCircle2 size={32} strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {status === 'loading' && 'Processing...'}
                {status === 'error' && 'Action Failed'}
                {status === 'success' && 'Success'}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                 <strong>  {message} </strong>
              </p>

              {/* Action Buttons */}
              <div className="mt-5 flex w-full flex-col gap-2">
                {status === 'error' && onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white active:scale-95 transition-transform"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                )}
                {(status === 'error' || status === 'success') && (
                  <button
                    onClick={onClose}
                    className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 active:scale-95"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

ModalProvider.displayName = 'ModalProvider';

export default ModalProvider;