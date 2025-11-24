import { GoogleGenAI } from "@google/genai";

// Safe access to process.env
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  return '';
};

// Define schema as a plain object without Type enum dependencies
const getStudyPlanSchema = () => ({
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: "Chwytliwy tytuł planu nauki oparty na treści" },
    days: {
      type: 'ARRAY',
      description: "Tablica 4 elementów odpowiadająca Dniom 0, 1, 2 i 3",
      items: {
        type: 'OBJECT',
        properties: {
          dayLabel: { type: 'STRING', description: "np. 'Dzień 0: Podstawowe Pojęcia'" },
          topicSummary: { type: 'STRING', description: "Zwięzłe podsumowanie tego, czego należy się nauczyć tego dnia." },
          flashcards: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                front: { type: 'STRING', description: "Pytanie lub termin na przodzie fiszki" },
                back: { type: 'STRING', description: "Odpowiedź lub definicja na tyle fiszki" },
              },
              required: ["front", "back"],
            },
          },
          quiz: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING' },
                options: { type: 'ARRAY', items: { type: 'STRING' } },
                correctAnswerIndex: { type: 'INTEGER', description: "Indeks poprawnej odpowiedzi (od 0)" },
                explanation: { type: 'STRING', description: "Dlaczego ta odpowiedź jest poprawna" },
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"],
            },
          },
          strategy: {
            type: 'OBJECT',
            properties: {
              methodName: { type: 'STRING', description: "Nazwa techniki nauki (np. Pałac Pamięci)" },
              description: { type: 'STRING', description: "Jak działa ta metoda" },
              actionableStep: { type: 'STRING', description: "Konkretna instrukcja jak zastosować ją do dzisiejszego tematu" },
            },
            required: ["methodName", "description", "actionableStep"],
          },
        },
        required: ["dayLabel", "topicSummary", "flashcards", "quiz", "strategy"],
      },
    },
  },
  required: ["title", "days"],
});

export const generateStudyPlan = async (content) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Brak klucza API. Upewnij się, że zmienna środowiskowa API_KEY jest ustawiona.");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
      Jesteś ekspertem w nauczaniu medycyny i chirurgii. Mam dokument, który muszę opanować w dokładnie 3 dni (plus Dzień 0 na podstawy).
      
      Podziel poniższą treść na 4 logiczne sekcje:
      - Dzień 0: Kluczowe definicje, podstawowa struktura, ogólny przegląd (najważniejsze triady, skale, objawy).
      - Dzień 1: Pierwsza połowa szczegółowej treści.
      - Dzień 2: Druga połowa szczegółowej treści.
      - Dzień 3: Powtórka, złożone powiązania, powikłania i przypadki kliniczne.

      Dla KAŻDEGO dnia wygeneruj:
      1. Podsumowanie tematu (topicSummary).
      2. 8-10 Fiszek (Flashcards) - pytanie na przodzie, odpowiedź na tyle.
      3. 5 pytań quizowych wielokrotnego wyboru.
      4. Konkretną, skuteczną strategię nauki (np. Pałac Pamięci, Technika Feynmana, Active Recall) dopasowaną do treści tego dnia.

      WAŻNE: Cała odpowiedź (pytania, odpowiedzi, strategie) musi być w języku POLSKIM.
      
      Oto treść do nauki:
      ${content.substring(0, 500000)} 
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getStudyPlanSchema(),
        systemInstruction: "Jesteś surowym, ale pomocnym nauczycielem akademickim. Zawsze zwracaj poprawny JSON zgodny ze schematem. Cała treść merytoryczna musi być w języku polskim.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Nie wygenerowano odpowiedzi tekstowej");
  } catch (error) {
    console.error("Błąd generowania planu nauki:", error);
    throw error;
  }
};

export const chatWithTutor = async (userMessage, context, history) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return "Błąd: Brak klucza API.";
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: `Jesteś pomocnym i cierpliwym tutorem medycznym. 
        Twoim zadaniem jest pomóc studentowi zrozumieć poniższy materiał.
        Odpowiadaj krótko, konkretnie i w języku polskim.
        Jeśli student prosi o wyjaśnienie, używaj prostych analogii.
        Jeśli student prosi o odpytanie, zadaj pytanie z materiału.
        
        MATERIAŁ ŹRÓDŁOWY:
        ${context.substring(0, 500000)}`
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    if (result.text) {
        return result.text;
    }
    return "Nie udało się uzyskać odpowiedzi.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Przepraszam, nie mogę teraz odpowiedzieć. Spróbuj ponownie.";
  }
};
