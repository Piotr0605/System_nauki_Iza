import React from 'react';
import { DayStrategy } from '../types';

interface StrategyViewProps {
  strategy: DayStrategy;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ strategy }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-brain text-9xl"></i>
        </div>
        
        <div className="p-8 md:p-10 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/30">
              Rekomendowana Technika
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{strategy.methodName}</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-indigo-200 font-semibold text-sm uppercase tracking-wide mb-2">Koncepcja</h3>
              <p className="text-indigo-50 text-lg leading-relaxed">
                {strategy.description}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-blur-md">
              <h3 className="text-yellow-300 font-bold text-sm uppercase tracking-wide mb-3 flex items-center">
                <i className="fas fa-bolt mr-2"></i> Plan Działania na Dziś
              </h3>
              <p className="text-white text-lg font-medium">
                {strategy.actionableStep}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};