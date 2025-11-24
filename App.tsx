import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { generateStudyPlan } from './services/geminiService';
import { StudyPlan, AppView, StudyMode } from './types';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizGame } from './components/QuizGame';
import { StrategyView } from './components/StrategyView';
import { AiTutor } from './components/AiTutor';
import { medicalNotes } from './data/medicalNotes';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeMode, setActiveMode] = useState<StudyMode>(StudyMode.STRATEGY);
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
      {/* Header */}
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

             {/* Day Tabs */}
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

             {/* Main Content Area */}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar / Context */}
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

                {/* Interaction Area */}
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

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);