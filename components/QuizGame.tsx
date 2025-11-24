import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types.ts';

interface QuizGameProps {
  questions: QuizQuestion[];
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    resetQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === questions[currentQIndex].correctAnswerIndex;
    if (isCorrect) setScore(s => s + 1);
    
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  if (questions.length === 0) return <div className="text-gray-500">Brak pytań quizowych na ten dzień.</div>;

  if (showResults) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="mb-6">
          <i className="fas fa-trophy text-6xl text-yellow-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Zakończony!</h2>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Twój wynik to <span className="font-bold text-indigo-600 text-2xl">{score}</span> z <span className="font-bold text-gray-800 text-2xl">{questions.length}</span>
        </p>
        <button 
          onClick={resetQuiz}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          Powtórz Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pytanie {currentQIndex + 1}/{questions.length}</span>
        <span className="text-sm font-bold text-indigo-600">Wynik: {score}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center ";
            
            if (isSubmitted) {
              if (idx === currentQuestion.correctAnswerIndex) {
                itemClass += "border-green-500 bg-green-50 text-green-700";
              } else if (idx === selectedOption) {
                itemClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                itemClass += "border-gray-100 text-gray-400 opacity-60";
              }
            } else {
              if (idx === selectedOption) {
                itemClass += "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-[1.01]";
              } else {
                itemClass += "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={itemClass}
                disabled={isSubmitted}
              >
                 <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                   isSubmitted && idx === currentQuestion.correctAnswerIndex ? 'border-green-500 bg-green-500 text-white' : 
                   isSubmitted && idx === selectedOption ? 'border-red-500 bg-red-500 text-white' : 
                   selectedOption === idx ? 'border-indigo-600' : 'border-gray-300'
                 }`}>
                   {isSubmitted && idx === currentQuestion.correctAnswerIndex ? <i className="fas fa-check text-xs"></i> : 
                    isSubmitted && idx === selectedOption ? <i className="fas fa-times text-xs"></i> :
                    selectedOption === idx ? <div className="w-3 h-3 bg-indigo-600 rounded-full"></div> : null
                   }
                 </div>
                 {option}
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
            <p className="text-blue-800 text-sm">
              <span className="font-bold block mb-1"><i className="fas fa-info-circle mr-1"></i> Wyjaśnienie:</span>
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!isSubmitted ? (
          <button 
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              selectedOption === null 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            Zatwierdź Odpowiedź
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="px-8 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            {currentQIndex < questions.length - 1 ? 'Następne Pytanie' : 'Zakończ Quiz'} <i className="fas fa-arrow-right ml-2"></i>
          </button>
        )}
      </div>
    </div>
  );
};