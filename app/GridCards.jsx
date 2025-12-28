import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Star, ArrowUpRight } from 'lucide-react';
import PositionSwipeHint from '@/app/PositionSwipeHint';
import  './GridCards.css'
const GridCards = () => {
  const cards = [
    {
      title: "Premium Slides",
      desc: "Advanced Option-Chain with deep Swipe + Cash in Profit facility with standard Brokers.",
      icon: <Shield className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Lightning Speed",
      desc: "Flash-fast execution powered by our proprietary sapphire-gold processing core.",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
    },
    {
      title: "Elite Trades",
      desc: "Exclusive access to platinum tier features and priority golden-glove reporting support.",
      icon: <Star className="w-6 h-6 text-blue-500" />,
    },
     {
      title: "Elite Trades",
      desc: "Exclusive access to platinum tier features and priority golden-glove reporting support.",
      icon: <Star className="w-6 h-6 text-blue-500" />,
    },
  ];

  return (  
    <div className="grid w-1/1 gap-4 mx-auto grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-1 justify-center"> 
    {/*min-h-screen bg-slate-50 p-2 flex items-center justify-center */}
      {/* 3-Column Grid Container  flex items-start justify-normal*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl w-full ml-24 mobile-margin-car">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`
             group relative cursor-pointer
            ${index === 3 ? "md:col-span-1 md:col-start-4" : ""}
             `}
          >
            {/* The "Blueish Gold" Shadow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-amber-500/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            
            {/* The Main Card */}
            <div className={`
                relative bg-white p-8 rounded-3xl border border-blue-50/50
                flex flex-col h-full
                ${index === 3 ? "min-h-[420px] bg-gradient-to-b from-white to-blue-50/40" : ""}
                shadow-[0_20px_50px_-12px_rgba(30,58,138,0.1),0_10px_30px_-10px_rgba(217,119,6,0.15)]
                group-hover:shadow-[0_30px_60px_-12px_rgba(30,58,138,0.2),0_15px_40px_-10px_rgba(217,119,6,0.25)]
                transition-all duration-300
              `}>
              { ( index === 3 ?  (
                       <PositionSwipeHint />
                ) : ( <>

                    {/* Icon Section */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center mb-6 border border-blue-100/50">
                      {card.icon}
                    </div>

                    {/* Text Content */}
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-900 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed mb-6">
                      {card.desc}
                    </p>
                </>))}

              

              {/* Bottom Decoration */}
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600/80 group-hover:text-amber-600 transition-colors">
                  Learn More
                </span>
                <div className="p-2 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return <GridCards />;
}