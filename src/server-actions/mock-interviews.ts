/**
 * Mock Interviews server functions.
 * AI-driven Q&A sessions with scoring and feedback via Gemini.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const INTERVIEW_SYSTEM_PROMPTS: Record<string, string> = {
  Technical: `You are a senior software engineer conducting a technical interview. 
Ask coding and CS fundamentals questions. After each answer, provide brief feedback.
Start with a warm greeting and ask your first question.
When the interview ends, provide a score (0-100) and structured feedback.`,

  DSA: `You are a Google-level interviewer conducting a Data Structures & Algorithms interview.
Ask algorithmic problems and probe the candidate's problem-solving approach.
Expect discussion of time/space complexity. Provide hints if the candidate is stuck.
Start by greeting the candidate and presenting your first problem.`,

  "System Design": `You are a Staff Engineer conducting a System Design interview.
Ask the candidate to design a large-scale system. Probe for:
- Requirements clarification, capacity estimation
- High-level design, database schema
- Scaling, caching, load balancing, fault tolerance
Provide a final score and feedback on strengths and areas to improve.`,

  "HR / Behavioral": `You are an experienced HR professional conducting a behavioral interview.
Use the STAR method. Ask about real experiences. Be empathetic but probing.
Focus on teamwork, leadership, conflict resolution, and growth mindset.`,

  "Resume Review": `You are reviewing the candidate's resume as a senior engineering manager.
Ask the candidate to walk you through their resume. Ask probing questions about each item.
Give constructive feedback at the end.`,
};

const FINAL_REPORT_PROMPT = `The interview has ended. Generate a final, professional interview report analyzing the entire conversation.
CRITICAL INSTRUCTION: Return ONLY valid JSON.
Schema:
{
  "report": {
    "overallScore": <number 0-100>,
    "communicationScore": <number 0-100>,
    "technicalAccuracy": <number 0-100>,
    "problemSolving": <number 0-100>,
    "depthOfKnowledge": <number 0-100>,
    "summary": "A professional summary of their performance",
    "topStrengths": ["strength 1", "strength 2"],
    "keyWeaknesses": ["weakness 1", "weakness 2"],
    "improvementPlan": "Actionable steps to improve"
  }
}`;

// ─── Start Session ────────────────────────────────────────────────────────────
export const startSession = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      type: z.string(),
      difficulty: z.string().optional(),
      resumeText: z.string().optional(),
      customTopics: z.string().optional() // JSON string of topics
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    let systemPrompt = "";

    // 1. DYNAMIC SYSTEM PROMPTS BASED ON TYPE
    if (data.type === "DSA") {
      const diff = data.difficulty || "Medium";
      let topics = "";
      if (diff === "Easy") topics = "Arrays, Strings, HashMaps, Two Pointers";
      else if (diff === "Medium") topics = "Trees, Binary Search, Heap, Sliding Window, Backtracking, Graphs (Basic)";
      else topics = "Graphs, Dynamic Programming, Advanced Trees, Segment Trees, Tries, Disjoint Set";
      
      systemPrompt = `You are a Google-level interviewer conducting a Data Structures & Algorithms interview.
Difficulty: ${diff}. Topics to choose from: ${topics}.
CRITICAL INSTRUCTION: Generate ONE algorithmic coding problem. Do NOT deviate.
Your FIRST message MUST include the "dsaProblem" JSON schema filled out with the problem title, detailed statement, constraints, examples, time limit, and memory limit.
The user will submit actual code (C++, Java, Python, JavaScript) to you.
When receiving code:
1. Act as a strict compiler/evaluator.
2. Mentally run hidden test cases and edge cases against their code.
3. Review their Big-O Time and Space Complexity.
4. If their code fails, explain exactly why and which test case broke it.
5. If it passes but is suboptimal, challenge them to optimize it (e.g., from O(n^2) to O(n)).
6. Score their answer strictly based on logic, edge cases, and efficiency.
Start by greeting the candidate and presenting the problem.`;
    } 
    else if (data.type === "Technical") {
      systemPrompt = `You are a senior software engineer conducting a comprehensive technical interview.
CRITICAL INSTRUCTION: Randomly mix questions from the following topics: Operating Systems, DBMS, Computer Networks, OOPS, System Design, Concurrency, Low Level Design.
Ask ONE deep technical question at a time. After they answer, provide brief feedback and move to the next.
Start with a warm greeting and ask your first question.`;
    }
    else if (data.type === "HR / Behavioral") {
      systemPrompt = `You are an experienced HR professional conducting a behavioral interview.
CRITICAL INSTRUCTION: Generate behavioral questions dynamically requiring the STAR format (Situation, Task, Action, Result).
Focus on teamwork, leadership, conflict resolution, and growth mindset. Ask one question at a time.
Be empathetic but probing. Start with a greeting and your first question.`;
    }
    else if (data.type === "System Design") {
      systemPrompt = `You are a Staff Engineer conducting a System Design interview.
Ask the candidate to design a large-scale distributed system (e.g., Twitter, Uber, Rate Limiter).
Probe for: Requirements, high-level design, database schema, scaling, caching, load balancing, fault tolerance.
Start by presenting the system they need to design.`;
    }
    else if (data.type === "Resume Review") {
      systemPrompt = `You are a senior engineering manager reviewing the candidate's resume.
RESUME CONTENT:
"""
${data.resumeText || "No resume provided. Ask them general questions about their background."}
"""
CRITICAL INSTRUCTION: Analyze the resume above. Generate deep, probing questions ONLY regarding the specific projects, internships, skills, and technologies mentioned.
Ask one question at a time. Start with a greeting and ask them to explain a specific interesting project from their resume.`;
    }
    else if (data.type === "Custom Interview") {
      const topics = data.customTopics || "General Engineering";
      systemPrompt = `You are a specialized AI interviewer conducting a Custom Interview.
CRITICAL INSTRUCTION: You must strictly ask questions based on these specific topics: ${topics}.
Randomly combine these topics into challenging questions. Ask one question at a time. Start with a greeting and your first question.`;
    }
    else {
      systemPrompt = `You are an AI interviewer. Ask relevant questions and provide feedback.`;
    }

    const CONVERSATIONAL_BEHAVIOR = `
CRITICAL INTERVIEWER BEHAVIOR:
- ACT LIKE A REAL HUMAN INTERVIEWER. Do NOT just ask a list of isolated, disconnected questions.
- Maintain a conversational state. Remember their previous answers and reference them.
- NEVER immediately move to a completely new topic if their answer was shallow or incorrect.
- ASK FOLLOW-UP QUESTIONS based on their specific answer (e.g., "Why did you choose that approach?", "What are the edge cases?", "Can you optimize the space complexity?", "What happens if we scale this to 1M users?").
- DYNAMIC DIFFICULTY: If they struggle, break the problem down and ask simpler guiding questions. If they answer perfectly, instantly dive deeper into the low-level details of their answer.
- Interrupt and challenge them politely if they are wrong.`;

    systemPrompt += CONVERSATIONAL_BEHAVIOR;

    // 2. DEDUPLICATION & ADAPTIVE DIFFICULTY
    const { data: lp } = await supabase
      .from("learner_profiles")
      .select("topics")
      .eq("user_id", userId)
      .maybeSingle();
    const lpTopics = (lp?.topics as Record<string, number>) || {};

    let baselineScore: number | null = null;
    if (data.type === "DSA" && typeof lpTopics.DSA === "number") {
      baselineScore = lpTopics.DSA;
    } else if (data.type === "System Design" && typeof lpTopics["System Design"] === "number") {
      baselineScore = lpTopics["System Design"];
    } else if (data.type === "Technical") {
      const parts = [lpTopics.OS, lpTopics.DBMS, lpTopics.CN, lpTopics.OOP].filter(t => typeof t === "number");
      if (parts.length > 0) {
        baselineScore = parts.reduce((a, b) => a + b, 0) / parts.length;
      }
    }

    if (baselineScore !== null) {
      systemPrompt += `\n\nDIAGNOSTIC ADAPTIVE ALIGNMENT:\nThe candidate scored ${Math.round(baselineScore)}% in this topic during their baseline assessment. `;
      if (baselineScore < 30) {
        systemPrompt += `They are currently weak in this domain. Start with EASY difficulty, focus on basic definitions and foundational structures, and offer guiding hints. `;
      } else if (baselineScore < 60) {
        systemPrompt += `They have medium baseline knowledge. Start with MEDIUM difficulty, asking standard core interview problems. `;
      } else {
        systemPrompt += `They have high baseline knowledge. Start with HARD difficulty, skipping basics and heading directly into advanced concepts and scalability details. `;
      }
    }

    const { data: pastSessions } = await supabase
      .from("mock_sessions")
      .select("score, weaknesses, messages")
      .eq("user_id", userId)
      .eq("type", data.type)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (pastSessions && pastSessions.length > 0) {
      const allWeaknesses = pastSessions.flatMap(s => s.weaknesses).filter(Boolean);
      const validScores = pastSessions.map(s => s.score).filter(s => s !== null && s !== undefined);
      const avgScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;

      // Extract previous questions (first assistant message usually contains the main problem)
      const pastQuestions = pastSessions
        .map(s => {
          const msgs = s.messages as {role: string, content: string}[];
          const firstAiMsg = msgs.find(m => m.role === "assistant" || m.role === "model");
          return firstAiMsg ? firstAiMsg.content.substring(0, 200) + "..." : null;
        })
        .filter(Boolean);

      systemPrompt += `\n\nADAPTIVE INSTRUCTIONS:\nThe candidate has done this interview type before. `;
      if (allWeaknesses.length > 0) {
        systemPrompt += `They previously struggled with these concepts: ${[...new Set(allWeaknesses)].slice(0, 5).join(", ")}. Test them on some of these. `;
      }
      if (avgScore !== null) {
        if (avgScore > 80) {
          systemPrompt += `Their previous avg score is ${Math.round(avgScore)}/100. SIGNIFICANTLY INCREASE difficulty to challenge them. `;
        } else if (avgScore < 60) {
          systemPrompt += `Their previous avg score is ${Math.round(avgScore)}/100. Keep difficulty manageable and provide more guidance. `;
        }
      }
      if (pastQuestions.length > 0) {
        systemPrompt += `\n\nCRITICAL DEDUPLICATION RULE: You MUST NOT ask any of the following previous questions or exact variations:\n- ${pastQuestions.join("\n- ")}`;
      }
    }

    systemPrompt += `\n\nCRITICAL OUTPUT FORMAT:
You MUST return your response as a valid JSON object. Do NOT use markdown code blocks (e.g. \`\`\`json). Just return the raw JSON object.
Schema:
{
  "replyToUser": "Your conversational response to the user. This is what they will see in the chat.",
  "dsaProblem": {
    "title": "String",
    "statement": "String",
    "constraints": ["String"],
    "examples": [{"input": "String", "output": "String", "explanation": "String"}],
    "timeLimit": "String",
    "memoryLimit": "String"
  },
  "evaluation": {
    "communicationScore": <number 0-100>,
    "technicalAccuracy": <number 0-100>,
    "confidence": <number 0-100>,
    "completeness": <number 0-100>,
    "problemSolving": <number 0-100>,
    "depthOfKnowledge": <number 0-100>,
    "timeTaken": "2 mins",
    "overallRating": <number 0-100>,
    "correctAnswer": "What the exactly correct answer is",
    "idealAnswer": "How an ideal candidate would answer",
    "whatUserMissed": "Specific things the user forgot",
    "strengths": "User's strengths in this answer",
    "weaknesses": "User's weaknesses in this answer",
    "howToImprove": "Actionable advice",
    "difficultyLevel": "Easy/Medium/Hard"
  }
}
Note: For your FIRST greeting message, you can just leave the evaluation fields empty/0, but you MUST still return the JSON format!`;

    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    // 3. SET TEMPERATURE TO 0.9 FOR DIVERSITY
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
      systemInstruction: systemPrompt,
      generationConfig: { 
        temperature: 0.9,
        responseMimeType: "application/json"
      }
    });
    
    const result = await model.generateContent("Begin the interview. Remember to start by greeting the candidate and presenting the first question/problem. Return JSON only.");
    const firstMessageRaw = result.response.text();
    let firstMessage = firstMessageRaw;
    
    try {
      const parsed = JSON.parse(firstMessageRaw);
      firstMessage = parsed.replyToUser || firstMessageRaw; // fallback just in case
    } catch (e) {
      console.error("Failed to parse first message as JSON", e);
    }

    // 4. STORE SYSTEM PROMPT AS METADATA IN MESSAGES ARRAY
    const messages = [
      { role: "metadata", content: JSON.stringify({ systemPrompt }) },
      // Store the raw JSON string as the assistant's message so the frontend can parse the evaluation!
      { role: "assistant", content: firstMessageRaw }
    ];

    const { data: session, error } = await supabase
      .from("mock_sessions")
      .insert({ user_id: userId, type: data.type, messages, status: "in_progress" })
      .select("id, type, messages, status, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { sessionId: session.id, firstMessage };
  });

// ─── Send Answer ──────────────────────────────────────────────────────────────
const sendAnswerSchema = z.object({
  token: z.string(),
  sessionId: z.string(),
  answer: z.string().min(1),
  isEnd: z.boolean().default(false), // true = request final evaluation
});

export const sendAnswer = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendAnswerSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    const { data: session } = await supabase
      .from("mock_sessions")
      .select("id, type, messages")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");

    const messages: { role: string; content: string }[] = session.messages ?? [];
    
    // Extract metadata/systemPrompt
    let systemPrompt = "You are a helpful AI interviewer.";
    const validMessages = [];
    for (const m of messages) {
      if (m.role === "metadata") {
        try {
          const meta = JSON.parse(m.content);
          if (meta.systemPrompt) systemPrompt = meta.systemPrompt;
        } catch (e) {}
      } else {
        validMessages.push(m);
      }
    }

    validMessages.push({ role: "user", content: data.answer });
    messages.push({ role: "user", content: data.answer }); // Keep original array updated for DB

    // ─── Adaptive Difficulty & Progression ──────────────────────────────
    if (!data.isEnd && validMessages.length >= 2) {
      const lastAssistantMsg = [...validMessages].reverse().find(m => m.role === "assistant" || m.role === "model");
      if (lastAssistantMsg) {
        try {
          const parsed = JSON.parse(lastAssistantMsg.content);
          if (parsed.evaluation) {
            const acc = parsed.evaluation.technicalAccuracy;
            if (typeof acc === "number") {
              if (acc >= 80) {
                systemPrompt += "\n\nADAPTIVE INSTRUCTION: The candidate performed very well on the last turn. Significantly increase the difficulty, introduce a complex edge case, or ask for an advanced optimization.";
              } else if (acc <= 50) {
                systemPrompt += "\n\nADAPTIVE INSTRUCTION: The candidate struggled with the previous question. Decrease the difficulty, ask foundational concepts, or provide heavy guidance to help them learn.";
              }
            }

            const weaknesses = (parsed.evaluation.weaknesses || "").toString().toLowerCase();
            if (weaknesses.includes("graph") || weaknesses.includes("dfs") || weaknesses.includes("bfs") || weaknesses.includes("tree")) {
              systemPrompt += "\n\nGRAPH PROGRESSION INSTRUCTION: The candidate is struggling with Graph/Tree traversal. Guide them through this specific learning sequence: BFS -> DFS -> Topological Sort -> Dijkstra -> Bellman Ford -> MST. Look at the conversation history to see which one they just attempted, and naturally ask them the next one in the sequence.";
            }
          }
        } catch(e) {}
      }
    }

    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
      systemInstruction: data.isEnd ? FINAL_REPORT_PROMPT : systemPrompt,
      generationConfig: { 
        temperature: 0.9,
        responseMimeType: "application/json"
      }
    });

    // Rebuild history for Gemini (excluding the last user message to be sent as prompt)
    const rawHistory = validMessages.slice(0, -1).map((m) => ({
      role: (m.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: m.content || "..." }],
    }));

    const history: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    
    // Rule 1: History MUST begin with a user message
    if (rawHistory.length > 0 && rawHistory[0].role === "model") {
      history.push({ role: "user", parts: [{ text: "Hello! I'm ready to start the interview." }] });
    }

    // Rule 2: History MUST strictly alternate between user and model
    for (const msg of rawHistory) {
      if (history.length > 0 && history[history.length - 1].role === msg.role) {
        history[history.length - 1].parts[0].text += "\n\n" + msg.parts[0].text;
      } else {
        history.push(msg);
      }
    }

    // Rule 3: The last message in history must be 'model' since we are sending a 'user' prompt
    if (history.length > 0 && history[history.length - 1].role === "user") {
      history.push({ role: "model", parts: [{ text: "Understood. Please continue." }] });
    }

    let aiResponseRaw = "";
    try {
      const chat = model.startChat({ history });
      const prompt = data.answer; 
      const result = await chat.sendMessage(prompt);
      aiResponseRaw = result.response.text();
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error("The AI interviewer encountered a temporary neural net issue. Please try sending your answer again.");
    }
    
    // If ending, parse final report and store it in messages with role="report"
    if (data.isEnd) {
      let reportData: any = null;
      try {
        const parsed = JSON.parse(aiResponseRaw);
        reportData = parsed.report || parsed;
      } catch (e) {
        console.error("Failed to parse final report JSON", e);
      }

      if (reportData) {
        messages.push({ role: "report", content: JSON.stringify(reportData) });
      }

      const score = reportData?.overallScore || 0;
      
      await supabase.from("mock_sessions").update({
        status: "completed",
        score: score,
        strengths: reportData?.topStrengths ?? [],
        weaknesses: reportData?.keyWeaknesses ?? [],
        suggestion: reportData?.improvementPlan ?? "",
        messages,
        completed_at: new Date().toISOString(),
      }).eq("id", data.sessionId);

      // Automatically add weaknesses to Planner tasks
      const keyWeaknesses: string[] = reportData?.keyWeaknesses ?? [];
      if (keyWeaknesses.length > 0) {
        const tasksToInsert = keyWeaknesses.map((weakness: string) => ({
          user_id: userId,
          title: `Review & practice: ${weakness}`,
          tag: "Review",
          priority: "high",
          scheduled_at: new Date().toISOString(),
          done: false,
        }));
        await supabase.from("planner_tasks").insert(tasksToInsert);
      }

      // Update XP and Streak
      const xpReward = Math.round(score * 10); // max 1000 XP for a perfect 100 score
      const { data: profile } = await supabase.from("profiles").select("xp, streak, last_study_date").eq("id", userId).single();
      if (profile) {
        const today = new Date().toISOString().split("T")[0];
        let newStreak = profile.streak;
        let lastDate = profile.last_study_date;
        
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          if (lastDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          lastDate = today;
        }
        
        await supabase.from("profiles").update({ 
          xp: profile.xp + xpReward,
          streak: newStreak,
          last_study_date: lastDate
        }).eq("id", userId);
      }

      // Check for newly unlocked badges
      const { checkAndAwardBadges } = await import("../server/functions/achievements");
      await checkAndAwardBadges({ data: { token: data.token } });

      return { response: aiResponseRaw, done: true, score: reportData };
    }

    // Not ending: standard per-turn JSON evaluation
    messages.push({ role: "assistant", content: aiResponseRaw });
    await supabase.from("mock_sessions").update({ messages }).eq("id", data.sessionId);
    
    // We send back the raw string, the frontend will parse it to extract replyToUser and evaluation
    return { response: aiResponseRaw, done: false, score: null };
  });

// ─── Terminate Session (Anti-Cheat) ───────────────────────────────────────────
const terminateSessionSchema = z.object({
  token: z.string(),
  sessionId: z.string(),
  reason: z.string(),
});

export const terminateSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => terminateSessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const userId = await requireUserId(data.token);

    const { data: session } = await supabase
      .from("mock_sessions")
      .select("messages")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();

    if (!session) throw new Error("Session not found");

    const messages = session.messages ?? [];
    
    // Inject a FAILED report
    const failedReport = {
      overallScore: 0,
      communicationScore: 0,
      technicalAccuracy: 0,
      problemSolving: 0,
      depthOfKnowledge: 0,
      summary: `[TERMINATED] Session terminated due to Anti-Cheat violation: ${data.reason}`,
      topStrengths: [],
      keyWeaknesses: ["Integrity Violation", "Copy Paste Detected"],
      improvementPlan: "Please do not use unauthorized assistance during mock interviews.",
      status: "FAILED" // Special flag for the UI
    };

    messages.push({ role: "report", content: JSON.stringify(failedReport) });

    await supabase.from("mock_sessions").update({
      status: "completed",
      score: 0,
      strengths: [],
      weaknesses: ["Copy Paste Detected"],
      suggestion: `[FAILED] ${data.reason}`,
      messages,
      completed_at: new Date().toISOString(),
    }).eq("id", data.sessionId);

    return { success: true };
  });

// ─── Get Sessions ─────────────────────────────────────────────────────────────
export const getSessions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const userId = await requireUserId(data.token);
    const { data: sessions } = await supabase
      .from("mock_sessions")
      .select("id, type, score, status, strengths, weaknesses, suggestion, duration_min, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    return sessions ?? [];
  });

// ─── Get Session Results ──────────────────────────────────────────────────────
export const getSessionResults = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../server/auth");
    const { supabase } = await import("../server/db");
    const userId = await requireUserId(data.token);
    const { data: session } = await supabase
      .from("mock_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");
    return session;
  });
