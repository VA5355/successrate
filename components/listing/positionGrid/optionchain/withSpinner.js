// withSpinner.js
import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function withSpinner(WrappedComponent, opts = {}) {
  const { minDuration = 300, Spinner = Loader2, overlayClassName = "" } = opts;

  return function WithSpinner(props) {
    const [loading, setLoading] = useState(false);
    const startRef = useRef(0);

    const ensureMinTime = async () => {
      const elapsed = Date.now() - startRef.current;
      if (elapsed < minDuration) {
        await new Promise((r) => setTimeout(r, minDuration - elapsed));
      }
    };

    // Wrap callbacks but do NOT remount the child
    const wrapHandler = (fn) => async (...args) => {
      if (!fn) return;
      setLoading(true);
      startRef.current = Date.now();
      try {
        const res = fn(...args);
        if (res && typeof res.then === "function") {
          const result = await res;
          await ensureMinTime();
          return result;
        } else {
          await ensureMinTime();
          return res;
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="relative inline-block w-full h-full">
        {/* Pass down loading + wrapped callbacks */}
        <WrappedComponent
          {...props}
          loading={loading}
          onBuy={wrapHandler(props.onBuy)}
          onSell={wrapHandler(props.onSell)}
        />

        {loading && (
          <div
            className={`absolute inset-0 z-50 flex items-center justify-center 
                        bg-white/40 backdrop-blur-sm rounded-2xl pointer-events-none
                        ${overlayClassName}`}
          >
            <Spinner className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    );
  };
}
