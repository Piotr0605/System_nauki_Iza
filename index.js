import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AppView, StudyMode } from './types.js';
import { generateStudyPlan, chatWithTutor } from './services/geminiService.js';
import { medicalNotes } from './data/medicalNotes.js';

// --- COMPONENTS ---

const FlashcardDeck = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
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

const QuizGame = ({ questions }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    resetQuiz();
  }, [questions]);

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const handleOptionSelect = (index) => {
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

const StrategyView = ({ strategy }) => {
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

const AiTutor = ({ contextContent }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Cześć! Jestem Twoim wirtualnym tutorem. Przeanalizowałem Twoje notatki medyczne (Chirurgia/Interna). O co chciałbyś zapytać? Mogę wyjaśnić trudne pojęcia, odpytać Cię z materiału lub pomóc w zapamiętywaniu.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithTutor(input, contextContent, history);
      
      const botMsg = { role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Przepraszam, wystąpił błąd połączenia. Spróbuj ponownie.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <i className="fas fa-user-md"></i>
        </div>
        <div>
          <h3 className="font-bold">Asystent Medyczny AI</h3>
          <p className="text-indigo-200 text-xs">Zadawaj pytania do swoich notatek</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Zapytaj np. 'Wyjaśnij triadę Becka'..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App = () => {
  const [view, setView] = useState(AppView.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeMode, setActiveMode] = useState(StudyMode.STRATEGY);
  const [inputText, setInputText] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const plan = await generateStudyPlan(inputText);
      setStudyPlan(plan);
      setView(AppView.DASHBOARD);
    } catch (e) {
      alert("Nie udało się wygenerować planu. Sprawdź klucz API i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedicalNotes = () => {
    setInputText(medicalNotes);
  };

  const currentDay = studyPlan?.days[activeDay];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Do boju klops!!!</span>
          </div>
          {view === AppView.DASHBOARD && (
             <button 
               onClick={() => setView(AppView.UPLOAD)} 
               className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
             >
               Nowy Plan
             </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === AppView.UPLOAD && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Opanuj Materiał w 3 Dni</h1>
              <p className="text-lg text-gray-600">
                Wklej swoje materiały do nauki poniżej. AI wygeneruje ustrukturyzowany plan 4-fazowy z fiszkami, quizami i strategiami mnemonicznymi.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
              <textarea
                className="w-full h-64 p-4 rounded-xl resize-none outline-none text-gray-700 text-base"
                placeholder="Wklej tekst ze swojego pliku PDF lub dokumentu tutaj..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center mt-2 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-medium">
                    {inputText.length} znaków
                  </span>
                  {inputText.length === 0 && medicalNotes.length > 0 && (
                    <button 
                      onClick={loadMedicalNotes}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <i className="fas fa-file-medical mr-1"></i> Załaduj Przykładowe Notatki
                    </button>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || inputText.length < 50}
                  className={`px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center gap-2 ${
                    isLoading || inputText.length < 50 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i> Generowanie...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i> Generuj Plan
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                   <i className="fas fa-layer-group"></i>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Inteligentny Podział</h3>
                 <p className="text-sm text-gray-500">Treść podzielona logicznie na 4 dni dla optymalnego zapamiętywania.</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                   <i className="fas fa-brain"></i>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Aktywne Przypominanie</h3>
                 <p className="text-sm text-gray-500">Automatycznie generowane fiszki i quizy, aby sprawdzić twoją wiedzę.</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                   <i className="fas fa-user-md"></i>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Asystent AI</h3>
                 <p className="text-sm text-gray-500">Czatuj ze swoimi notatkami. Zadawaj pytania i proś o wyjaśnienia.</p>
               </div>
            </div>
          </div>
        )}

        {view === AppView.DASHBOARD && studyPlan && (
          <div className="animate-fade-in">
             <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">{studyPlan.title}</h1>
               <p className="text-gray-500">4-Dniowy Cykl Mistrzowski</p>
             </div>

             <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
                {studyPlan.days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveDay(idx); setActiveMode(StudyMode.STRATEGY); }}
                    className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                      activeDay === idx 
                      ? 'bg-indigo-600 text-white shadow-lg translate-y-[1px]' 
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {day.dayLabel}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                     <h2 className="text-lg font-bold text-gray-800 mb-4">Cel na Dziś</h2>
                     <p className="text-gray-600 text-sm leading-relaxed mb-6">
                       {currentDay?.topicSummary}
                     </p>

                     <div className="space-y-2">
                       <button
                         onClick={() => setActiveMode(StudyMode.STRATEGY)}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                           activeMode === StudyMode.STRATEGY ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                         <i className="fas fa-chess-knight w-6"></i> Strategia
                       </button>
                       <button
                         onClick={() => setActiveMode(StudyMode.FLASHCARDS)}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                           activeMode === StudyMode.FLASHCARDS ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                         <i className="fas fa-clone w-6"></i> Fiszki
                         <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{currentDay?.flashcards.length}</span>
                       </button>
                       <button
                         onClick={() => setActiveMode(StudyMode.QUIZ)}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                           activeMode === StudyMode.QUIZ ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                         <i className="fas fa-question-circle w-6"></i> Quiz
                         <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{currentDay?.quiz.length}</span>
                       </button>
                       <div className="my-2 border-t border-gray-100"></div>
                       <button
                         onClick={() => setActiveMode(StudyMode.TUTOR)}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                           activeMode === StudyMode.TUTOR ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                         <i className="fas fa-comments w-6"></i> AI Tutor
                       </button>
                     </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  {currentDay && (
                    <div className="min-h-[500px]">
                      {activeMode === StudyMode.STRATEGY && <StrategyView strategy={currentDay.strategy} />}
                      {activeMode === StudyMode.FLASHCARDS && <FlashcardDeck cards={currentDay.flashcards} />}
                      {activeMode === StudyMode.QUIZ && <QuizGame questions={currentDay.quiz} />}
                      {activeMode === StudyMode.TUTOR && <AiTutor contextContent={inputText} />}
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (e) {
    console.error("Error mounting React application:", e);
  }
} else {
  console.error("Failed to find the root element");
}
