import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const generateSchema = z.object({
  token: z.string(),
  deckId: z.string(),
  context: z.string().min(10, "Context must be at least 10 characters long"),
});

export const generateFlashcardsAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => generateSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Authenticate & Get DB
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    let userId: string;
    try {
      userId = await requireUserId(data.token);
    } catch (e) {
      throw new Error("User unauthenticated");
    }

    // Verify deck ownership
    const { data: deck } = await supabase
      .from("flashcard_decks")
      .select("id, name")
      .eq("id", data.deckId)
      .eq("user_id", userId)
      .single();

    if (!deck) {
      throw new Error("Unable to access deck");
    }

    // 2. Setup Gemini
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new Error("API key missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Switch to flash model which has much higher free tier limits (15 RPM instead of 2 RPM for Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Dynamic count based on word length. Avg 5-8 chars per word.
    const wordCount = data.context.length / 6;
    let targetCount = Math.max(10, Math.min(30, Math.floor(wordCount / 50))); 

    const prompt = `
Convert the following study material into flashcards.
Generate exactly ${targetCount} flashcards.
Include definitions, time complexity, algorithms, formula-based cards, conceptual questions, and interview questions where applicable. Do not generate duplicate cards.

Study material:
"""
${data.context}
"""

Return ONLY valid JSON.
Each flashcard must exactly match this schema:
{
  "question": "string",
  "answer": "string (can contain markdown)",
  "topic": "string"
}

Do not include explanations outside the JSON array.
Return pure JSON array.
`;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      let text = result.response.text().trim();
      
      // Fallback cleanup just in case the model ignores mimeType instruction
      if (text.startsWith("\`\`\`json")) text = text.slice(7);
      if (text.startsWith("\`\`\`")) text = text.slice(3);
      if (text.endsWith("\`\`\`")) text = text.slice(0, -3);
      
      let parsed;
      try {
        parsed = JSON.parse(text.trim());
      } catch (e) {
        throw new Error("Invalid AI response: Unable to parse flashcards");
      }

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid AI response: Expected an array");
      }

      if (parsed.length === 0) {
        throw new Error("Invalid AI response: No flashcards generated");
      }

      const insertData = parsed.map((card: any) => ({
        deck_id: deck.id,
        question: card.question || "Unknown Concept",
        answer: card.answer || "No details provided",
        difficulty: "Medium", // Required by DB constraint
      }));

      const { data: insertedCards, error } = await supabase
        .from("flashcards")
        .insert(insertData)
        .select("*");

      if (error) {
        throw new Error("Database error: Failed to save flashcards");
      }

      return insertedCards;
    } catch (err: any) {
       console.error("Flashcard Gen Error:", err);
       
       if (err.message && err.message.includes("429 Too Many Requests")) {
         throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
       }

       // Pass through our structured errors
       if (err.message.includes("API key missing") || 
           err.message.includes("Invalid AI response") || 
           err.message.includes("Unable to access deck") || 
           err.message.includes("Database error") ||
           err.message.includes("Rate limit exceeded")) {
         throw new Error(err.message);
       }
       throw new Error("AI service unavailable: " + (err.message || "Request timeout"));
    }
  });
