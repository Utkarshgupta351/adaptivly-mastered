import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface AdaptiveRecommendation {
  todaysLearning: {
    topic: string;
    score: number;
    description: string;
    actionLabel: string;
    path: string;
  };
  todaysPractice: {
    problems: Array<{ id: number; title: string; difficulty: string; topic: string; xp: number }>;
  };
  todaysRevision: {
    topic: string;
    daysSinceReview: number;
    actionLabel: string;
    path: string;
  };
  todaysFlashcards: {
    deckName: string;
    cardCount: number;
    path: string;
  };
  todaysQuiz: {
    topic: string;
    questionCount: number;
    path: string;
  };
  weakTopics: Array<{ name: string; score: number }>;
  suggestedVideos: Array<{ title: string; duration: string; channel: string; url: string }>;
  recommendedTutorSession: {
    prompt: string;
    actionLabel: string;
  };
  recommendedMockInterview: {
    type: string;
    difficulty: string;
    actionLabel: string;
  };
}

// Mock videos mapped to topics
const SUGGESTED_VIDEOS: Record<string, Array<{ title: string; duration: string; channel: string; url: string }>> = {
  DSA: [
    { title: "Dynamic Programming - Learn to Solve Algorithmic Problems", duration: "3:24:00", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=oBt53Yn9YY0" },
    { title: "Graph Algorithms for Technical Interviews", duration: "2:15:00", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU" }
  ],
  OS: [
    { title: "Operating Systems Crash Course - CPU Scheduling & Deadlocks", duration: "45:00", channel: "Gate Smashers", url: "https://www.youtube.com/watch?v=v3vFj2F18y0" },
    { title: "Virtual Memory & Paging Explained Simply", duration: "18:30", channel: "Gate Smashers", url: "https://www.youtube.com/watch?v=2-OLz2Vw1po" }
  ],
  DBMS: [
    { title: "Database Systems - ACID Transactions & Recovery", duration: "1:10:00", channel: "CMU Database Group", url: "https://www.youtube.com/watch?v=e_8G22l4z0w" },
    { title: "B+ Tree Indexing in Databases - Deep Dive", duration: "28:15", channel: "Gate Smashers", url: "https://www.youtube.com/watch?v=aZjYr87r1b8" }
  ],
  CN: [
    { title: "TCP 3-Way Handshake & Connection Termination Explained", duration: "12:45", channel: "PowerCert Animated", url: "https://www.youtube.com/watch?v=F27PLin3TV0" },
    { title: "How DNS Resolution Works Behind the Scenes", duration: "10:15", channel: "PowerCert Animated", url: "https://www.youtube.com/watch?v=27r4BzDS5PA" }
  ],
  OOP: [
    { title: "Object Oriented Programming - Polymorphism & Dynamic Binding", duration: "35:00", channel: "Derek Banas", url: "https://www.youtube.com/watch?v=c33a4t370Q0" },
    { title: "SOLID Design Principles for Clean Code", duration: "22:10", channel: "Web Dev Simplified", url: "https://www.youtube.com/watch?v=v-DYt4O53A" }
  ],
  "System Design": [
    { title: "System Design Primer - Consistent Hashing & Caching", duration: "18:40", channel: "ByteByteGo", url: "https://www.youtube.com/watch?v=zaRkONvyGr8" },
    { title: "Scale from 1 to 10M Users - Architecture Roadmap", duration: "25:30", channel: "ByteByteGo", url: "https://www.youtube.com/watch?v=xpDnVSmNFX0" }
  ]
};

export const getAdaptiveRecommendations = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }): Promise<AdaptiveRecommendation> => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);

    // 1. Fetch learner profile
    const { data: lp } = await supabase
      .from("learner_profiles")
      .select("topics")
      .eq("user_id", userId)
      .maybeSingle();

    // Default starting scores if not completed assessment
    const defaultTopics: Record<string, number> = {
      DSA: 10,
      OS: 15,
      DBMS: 20,
      CN: 25,
      OOP: 30,
      "System Design": 5
    };

    const topics = (lp?.topics as Record<string, number>) || defaultTopics;

    // Find weak topics (< 60)
    const weakList = Object.entries(topics)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => a.score - b.score);

    const weakestTopic = weakList[0]?.name || "DSA";
    const weakestScore = weakList[0]?.score || 10;

    // 2. Fetch some recommended problems from DB
    const { data: dbProblems } = await supabase
      .from("problems")
      .select("id, title, difficulty, topic, xp_reward")
      .eq("topic", weakestTopic)
      .limit(3);

    // Fallback static problems if DB is empty
    const fallbackProblems = [
      { id: 101, title: `Implement ${weakestTopic} basics`, difficulty: "Easy", topic: weakestTopic, xp: 50 },
      { id: 102, title: `${weakestTopic} interview puzzle`, difficulty: "Medium", topic: weakestTopic, xp: 100 },
      { id: 103, title: `Optimise ${weakestTopic} implementation`, difficulty: "Hard", topic: weakestTopic, xp: 150 }
    ];

    const problems = dbProblems && dbProblems.length > 0
      ? dbProblems.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty, topic: p.topic, xp: p.xp_reward }))
      : fallbackProblems;

    // Get secondary weakest topic for revision
    const revisionTopic = weakList[1]?.name || weakestTopic;

    // Build the recommendation payload
    const recommendation: AdaptiveRecommendation = {
      todaysLearning: {
        topic: weakestTopic,
        score: weakestScore,
        description: `Your ${weakestTopic} baseline is currently at ${weakestScore}%. Focus on strengthening foundational concepts in this domain today.`,
        actionLabel: `Start studying ${weakestTopic}`,
        path: `/subjects`
      },
      todaysPractice: {
        problems
      },
      todaysRevision: {
        topic: revisionTopic,
        daysSinceReview: 3, // dynamically adjust if we had an inactivity counter
        actionLabel: `Review ${revisionTopic}`,
        path: `/planner`
      },
      todaysFlashcards: {
        deckName: `${weakestTopic} Core Concepts`,
        cardCount: 15,
        path: `/flashcards`
      },
      todaysQuiz: {
        topic: weakestTopic,
        questionCount: 5,
        path: `/practice`
      },
      weakTopics: weakList.filter(t => t.score < 60),
      suggestedVideos: SUGGESTED_VIDEOS[weakestTopic] || SUGGESTED_VIDEOS["DSA"],
      recommendedTutorSession: {
        prompt: `Let's discuss my weaknesses in ${weakestTopic}. What are the most common interview traps in this area?`,
        actionLabel: `Discuss ${weakestTopic} with AI Tutor`
      },
      recommendedMockInterview: {
        type: weakestTopic === "System Design" ? "System Design" : weakestTopic === "DSA" ? "DSA" : "Technical",
        difficulty: weakestScore < 30 ? "Easy" : weakestScore < 60 ? "Medium" : "Hard",
        actionLabel: `Take ${weakestTopic} Mock Interview`
      }
    };

    return recommendation;
  });
