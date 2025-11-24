import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types.ts';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Reset state when deck changes
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  if (cards.length === 0) return <div className="text-gray-500">Brak fiszek na ten dzień.</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4">
      <div className="mb-4 text-sm font-medium text-gray-500 tracking-wide">
        Fiszka {currentIndex + 1} z {cards.length}
      </div>

      <div 
        className="group perspective-1000 w-full h-80 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d shadow-xl rounded-2xl transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-indigo-50">
            <span className="absolute top-4 left-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Pytanie</span>
            <p className="text-xl md:text-2xl font-semibold text-gray-800 text-center leading-relaxed">
              {currentCard.front}
            </p>
            <div className="absolute bottom-4 text-gray-400 text-sm flex items-center gap-2">
              <i className="fas fa-sync-alt"></i> Kliknij, aby obrócić
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 text-white">
            <span className="absolute top-4 left-4 text-xs font-bold text-indigo-200 uppercase tracking-wider">Odpowiedź</span>
            <p className="text-lg md:text-xl font-medium text-center leading-relaxed">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          onClick={handlePrev}
          className="px-6 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
        >
          <i className="fas fa-arrow-left mr-2"></i> Poprzednia
        </button>
        <button 
          onClick={handleNext}
          className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transition-all shadow-md font-medium"
        >
          Następna <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};