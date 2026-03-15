import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck, Diamond, Star } from 'lucide-react';

const SubscriptionScreen = () => {
  const features = [
    "Indices Websocket streaming",
    "Market Status",
    "Indices Option-chain",
    "Positions/ Trade Book",
    "Stocks Charts"
  ];

  const plans = [
    { name: "Basic", price: "Free", checks: [true, true, false, false, false], accent: "#94a3b8" },
    { name: "Premium", price: "₹999", checks: [true, true, true, true, false], accent: "#fbbf24", popular: true },
    { name: "AI Advanced", price: "₹2499", checks: [true, true, true, true, true], accent: "#6366f1" }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Choose Your Edge</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Elevate your trading with real-time data and AI-driven insights.</p>
        </div>

        {/* Main Grid: Responsive Stack to 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-0">
          
          {/* Feature Titles (Hidden on small mobile, shown as a side-bar on desktop) */}
          <div className="hidden lg:block lg:col-span-3 mt-[180px] bg-[#1e293b]/50 rounded-l-2xl border-y border-l border-slate-700">
            {features.map((f, i) => (
              <div key={i} className="h-16 flex items-center px-6 text-sm font-semibold border-b border-slate-700 last:border-0">
                {f}
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-0">
            {plans.map((plan, pIdx) => (
              <motion.div
                key={pIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pIdx * 0.1 }}
                className={`relative flex flex-col bg-[#1e293b] border border-slate-700 p-6 
                  ${plan.popular ? 'lg:scale-105 lg:z-10 border-amber-500 shadow-2xl shadow-amber-500/10' : ''} 
                  ${pIdx === 0 ? 'lg:rounded-l-none lg:rounded-r-none' : ''}
                  ${pIdx === 2 ? 'lg:rounded-r-2xl' : ''}
                  rounded-2xl lg:rounded-none`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Recommended
                  </span>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2" style={{ color: plan.accent }}>{plan.name}</h3>
                  <div className="text-4xl font-black text-white">{plan.price}<span className="text-sm text-slate-400 font-normal">/mo</span></div>
                </div>

                {/* Mobile Feature List (Only shows on small screens) */}
                <div className="lg:hidden mb-6">
                  {features.map((f, fIdx) => (
                    <div key={fIdx} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-xs text-slate-400">{f}</span>
                      {plan.checks[fIdx] ? <Check size={16} className="text-green-400" /> : <X size={16} className="text-slate-600" />}
                    </div>
                  ))}
                </div>

                {/* Desktop Checkmarks (Hidden on mobile) */}
                <div className="hidden lg:block">
                  {plan.checks.map((check, cIdx) => (
                    <div key={cIdx} className="h-16 flex justify-center items-center border-b border-slate-700 last:border-0">
                      {check ? <ShieldCheck fill={plan.accent} size={22} className="text-[#0f172a]" /> : <X size={20} className="text-slate-600" />}
                    </div>
                  ))}
                </div>

                <button className="mt-8 w-full py-3 rounded-lg font-bold transition-all hover:brightness-110 active:scale-95" 
                        style={{ backgroundColor: plan.accent, color: plan.name === 'Premium' ? '#000' : '#fff' }}>
                  Upgrade Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;