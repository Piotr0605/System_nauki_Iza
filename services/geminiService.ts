import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyPlan } from "../types";

// Safe access to process.env to prevent crashes in environments where process is undefined
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey });

const studyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Chwytliwy tytuł planu nauki oparty na treści" },
    days: {
      type: Type.ARRAY,
      description: "Tablica 4 elementów odpowiadająca Dniom 0, 1, 2 i 3",
      items: {
        type: Type.OBJECT,
        properties: {
          dayLabel: { type: Type.STRING, description: "np. 'Dzień 0: Podstawowe Pojęcia'" },
          topicSummary: { type: Type.STRING, description: "Zwięzłe podsumowanie tego, czego należy się nauczyć tego dnia." },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "Pytanie lub termin na przodzie fiszki" },
                back: { type: Type.STRING, description: "Odpowiedź lub definicja na tyle fiszki" },
              },
              required: ["front", "back"],
            },
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER, description: "Indeks poprawnej odpowiedzi (od 0)" },
                explanation: { type: Type.STRING, description: "Dlaczego ta odpowiedź jest poprawna" },
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"],
            },
          },
          strategy: {
            type: Type.OBJECT,
            properties: {
              methodName: { type: Type.STRING, description: "Nazwa techniki nauki (np. Pałac Pamięci)" },
              description: { type: Type.STRING, description: "Jak działa ta metoda" },
              actionableStep: { type: Type.STRING, description: "Konkretna instrukcja jak zastosować ją do dzisiejszego tematu" },
            },
            required: ["methodName", "description", "actionableStep"],
          },
        },
        required: ["dayLabel", "topicSummary", "flashcards", "quiz", "strategy"],
      },
    },
  },
  required: ["title", "days"],
};

export const generateStudyPlan = async (content: string): Promise<StudyPlan> => {
  try {
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
        responseSchema: studyPlanSchema,
        systemInstruction: "Jesteś surowym, ale pomocnym nauczycielem akademickim. Zawsze zwracaj poprawny JSON zgodny ze schematem. Cała treść merytoryczna musi być w języku polskim.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as StudyPlan;
    }
    throw new Error("Nie wygenerowano odpowiedzi tekstowej");
  } catch (error) {
    console.error("Błąd generowania planu nauki:", error);
    throw error;
  }
};

export const chatWithTutor = async (userMessage: string, context: string, history: any[]): Promise<string> => {
  try {
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