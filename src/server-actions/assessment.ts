import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface DiagnosticQuestion {
  id: number;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ─── DSA ────────────────────────────────────────────────────────────────────
  {
    id: 1,
    topic: "DSA",
    difficulty: "Easy",
    question: "What is the worst-case time complexity of searching for an element in a binary search tree (BST)?",
    options: ["O(log n)", ["O(n)"], "O(1)", "O(n log n)"],
    correctOptionIndex: 1,
    explanation: "In the worst case, a BST can be skewed (like a linked list), resulting in O(n) search time."
  } as any,
  {
    id: 2,
    topic: "DSA",
    difficulty: "Medium",
    question: "Which data structure is most optimal for implementing Dijkstra's shortest path algorithm?",
    options: ["Stack", "Queue", "Min-Priority Queue (Heap)", "Hash Table"],
    correctOptionIndex: 2,
    explanation: "A Min-Priority Queue allows extracting the minimum distance node in O(log V) time, which is optimal for Dijkstra."
  },
  {
    id: 3,
    topic: "DSA",
    difficulty: "Hard",
    question: "Which algorithm is optimal for finding the Longest Common Subsequence (LCS) of two strings of lengths m and n?",
    options: ["Dijkstra's Algorithm", "Dynamic Programming with O(m*n) complexity", "Sliding Window in O(m+n)", "Binary Search in O(log(m*n))"],
    correctOptionIndex: 1,
    explanation: "Longest Common Subsequence is a classic Dynamic Programming problem solved in O(m*n) time and space."
  },
  // ─── OS ─────────────────────────────────────────────────────────────────────
  {
    id: 4,
    topic: "OS",
    difficulty: "Easy",
    question: "What is the main purpose of virtual memory in an operating system?",
    options: [
      "To increase the processor speed",
      "To allow execution of processes that may not be completely in memory",
      "To provide security against malware",
      "To speed up disk read/write times"
    ],
    correctOptionIndex: 1,
    explanation: "Virtual memory maps user-virtual addresses to physical addresses, allowing processes larger than physical memory to execute."
  },
  {
    id: 5,
    topic: "OS",
    difficulty: "Medium",
    question: "Which of the following is NOT one of the Coffman conditions required for a deadlock to occur?",
    options: ["Mutual Exclusion", "No Preemption", "Circular Wait", "Preemptive Scheduling"],
    correctOptionIndex: 3,
    explanation: "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait."
  },
  {
    id: 6,
    topic: "OS",
    difficulty: "Hard",
    question: "What is the phenomenon called when the page fault rate increases even when more page frames are allocated to a process?",
    options: ["Thrashing", "Belady's Anomaly", "Fragmentation", "Segmentation fault"],
    correctOptionIndex: 1,
    explanation: "Belady's Anomaly is a phenomenon where allocating more page frames results in more page faults, primarily seen in FIFO page replacement."
  },
  // ─── DBMS ───────────────────────────────────────────────────────────────────
  {
    id: 7,
    topic: "DBMS",
    difficulty: "Easy",
    question: "Which SQL constraint ensures that all values in a column are unique and not null?",
    options: ["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"],
    correctOptionIndex: 0,
    explanation: "A Primary Key constraint uniquely identifies each record and cannot contain NULL values."
  },
  {
    id: 8,
    topic: "DBMS",
    difficulty: "Medium",
    question: "What does the 'I' (Isolation) in ACID properties guarantee?",
    options: [
      "Data updates are persistent even after crashes",
      "Transactions are executed concurrently without interfering with each other",
      "All operations in a transaction succeed or fail together",
      "Database changes maintain database consistency rules"
    ],
    correctOptionIndex: 1,
    explanation: "Isolation ensures that concurrent execution of transactions leaves the database in the same state as if they were executed sequentially."
  },
  {
    id: 9,
    topic: "DBMS",
    difficulty: "Hard",
    question: "Why are B+ Trees preferred over standard Binary Search Trees for database indexing?",
    options: [
      "They have fewer pointers and consume less memory",
      "They keep keys in leaf nodes, minimizing disk I/O and enabling efficient range queries",
      "They are always fully balanced without rotation overhead",
      "They support O(1) hash lookups"
    ],
    correctOptionIndex: 1,
    explanation: "B+ Trees have high fan-out (low depth) and keys are stored in leaves linked sequentially, which minimizes disk I/O and facilitates range queries."
  },
  // ─── CN ─────────────────────────────────────────────────────────────────────
  {
    id: 10,
    topic: "CN",
    difficulty: "Easy",
    question: "Which OSI layer is responsible for routing packets across different networks?",
    options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
    correctOptionIndex: 2,
    explanation: "The Network layer (Layer 3) handles packet routing, IP addressing, and path determination."
  },
  {
    id: 11,
    topic: "CN",
    difficulty: "Medium",
    question: "What is the correct sequence of packets sent during a TCP three-way handshake?",
    options: ["SYN, ACK, SYN-ACK", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "SYN, SYN, ACK"],
    correctOptionIndex: 1,
    explanation: "TCP connection establishment uses a three-way handshake: Client sends SYN, Server replies SYN-ACK, Client sends ACK."
  },
  {
    id: 12,
    topic: "CN",
    difficulty: "Hard",
    question: "How does HTTPS establish a secure session using TLS?",
    options: [
      "By using symmetric encryption for handshake, and asymmetric encryption for data transfer",
      "By using asymmetric cryptography to share a symmetric session key, then encrypting data symmetrically",
      "By relying solely on public-key infrastructure for encrypting all messages",
      "By converting IP addresses into secure DNS records"
    ],
    correctOptionIndex: 1,
    explanation: "TLS uses asymmetric encryption (RSA/Diffie-Hellman) to authenticate and securely exchange a symmetric key, which is then used for fast symmetric encryption of data."
  },
  // ─── OOP ────────────────────────────────────────────────────────────────────
  {
    id: 13,
    topic: "OOP",
    difficulty: "Easy",
    question: "Which OOP concept allows a subclass to provide a specific implementation of a method that is already defined in its superclass?",
    options: ["Method Overloading", "Method Overriding", "Encapsulation", "Abstraction"],
    correctOptionIndex: 1,
    explanation: "Method Overriding allows a subclass to redefine a method of its superclass with the same signature."
  },
  {
    id: 14,
    topic: "OOP",
    difficulty: "Medium",
    question: "What is the main difference between method overloading and method overriding?",
    options: [
      "Overloading occurs at runtime; overriding occurs at compile-time",
      "Overloading is dynamic polymorphism; overriding is static polymorphism",
      "Overloading requires different method signatures; overriding requires the exact same signature",
      "Overloading requires inheritance; overriding does not"
    ],
    correctOptionIndex: 2,
    explanation: "Overloading defines methods with the same name but different parameter list (compile-time). Overriding redefines a superclass method in a subclass (runtime)."
  },
  {
    id: 15,
    topic: "OOP",
    difficulty: "Hard",
    question: "In C++ or Java, what happens during dynamic binding (late binding)?",
    options: [
      "The compiler links functions based on static reference types",
      "The virtual machine resolves function calls at runtime based on the actual object type",
      "Memory is allocated dynamically on the stack",
      "Multiple subclasses are combined into a single binary"
    ],
    correctOptionIndex: 1,
    explanation: "Dynamic binding delays resolution of virtual function calls until runtime, matching the method of the actual object type rather than the reference pointer."
  },
  // ─── System Design ──────────────────────────────────────────────────────────
  {
    id: 16,
    topic: "System Design",
    difficulty: "Easy",
    question: "What does horizontal scaling (scaling out) refer to?",
    options: [
      "Adding more RAM or CPU to an existing single server",
      "Adding more servers/machines to the system resource pool",
      "Converting a SQL database into a NoSQL database",
      "Optimizing SQL queries to run faster"
    ],
    correctOptionIndex: 1,
    explanation: "Horizontal scaling involves distributing database/web loads across multiple physical servers, while vertical scaling adds power to a single server."
  },
  {
    id: 17,
    topic: "System Design",
    difficulty: "Medium",
    question: "What is the primary benefit of consistent hashing in distributed caching?",
    options: [
      "It speeds up hash calculation times",
      "It minimizes key relocation when cache servers are added or removed",
      "It encrypts key values automatically",
      "It ensures all keys are stored on a single machine"
    ],
    correctOptionIndex: 1,
    explanation: "Consistent hashing ensures that when the cache pool size changes, only a fraction of keys (roughly K/n) need to be rehashed/relocated."
  },
  {
    id: 18,
    topic: "System Design",
    difficulty: "Hard",
    question: "How does a distributed queue like Apache Kafka handle scaling out for consumption?",
    options: [
      "By storing all messages in a single cluster block",
      "By partitioning topics so partitions can be consumed in parallel by consumer group members",
      "By using consistent hashing to load balance message values to consumers",
      "By replicating every single message to all available consumers"
    ],
    correctOptionIndex: 1,
    explanation: "Kafka topics are split into partitions. Each partition is assigned to a single consumer in a group, allowing parallel message consumption."
  }
];

// ─── Server Actions ─────────────────────────────────────────────────────────

export const getAssessmentQuestions = createServerFn({ method: "GET" })
  .handler(async () => {
    return DIAGNOSTIC_QUESTIONS;
  });

const submissionSchema = z.object({
  token: z.string(),
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOptionIndex: z.number(),
    timeSpentSeconds: z.number(),
    attempts: z.number(),
    confidence: z.number(), // 1 to 5
    skipped: z.boolean(),
  })),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .validator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);

    const topicScores: Record<string, { totalPossible: number; scored: number }> = {};

    // Initialize topics
    const topicsList = ["DSA", "OS", "DBMS", "CN", "OOP", "System Design"];
    for (const t of topicsList) {
      topicScores[t] = { totalPossible: 0, scored: 0 };
    }

    for (const ans of data.answers) {
      const q = DIAGNOSTIC_QUESTIONS.find(x => x.id === ans.questionId);
      if (!q) continue;

      // Easy = 30 points, Medium = 30 points, Hard = 40 points
      const maxPoints = q.difficulty === "Hard" ? 40 : 30;
      topicScores[q.topic].totalPossible += maxPoints;

      if (ans.skipped) {
        continue; // 0 points
      }

      const isCorrect = ans.selectedOptionIndex === q.correctOptionIndex;
      if (isCorrect) {
        let points = maxPoints;

        // Apply penalty for too many attempts (10% penalty per attempt above 1)
        if (ans.attempts > 1) {
          const penalty = Math.min((ans.attempts - 1) * 0.1, 0.5); // max 50% penalty
          points = points * (1 - penalty);
        }

        // Apply penalty for excessive time spent (longer than 120s is slow for diagnostic)
        if (ans.timeSpentSeconds > 120) {
          points = points * 0.85; // 15% time penalty
        }

        // Incorporate confidence (low confidence reduces scored value slightly)
        // 5 = 100%, 4 = 95%, 3 = 90%, 2 = 80%, 1 = 70%
        const confidenceFactors: Record<number, number> = { 5: 1.0, 4: 0.95, 3: 0.9, 2: 0.8, 1: 0.7 };
        const confFactor = confidenceFactors[ans.confidence] || 1.0;
        points = points * confFactor;

        topicScores[q.topic].scored += points;
      }
    }

    // Calculate final percentages
    const finalScores: Record<string, number> = {};
    for (const t of topicsList) {
      const stats = topicScores[t];
      finalScores[t] = stats.totalPossible > 0 
        ? Math.round((stats.scored / stats.totalPossible) * 100)
        : 50; // default to 50 if somehow no questions
    }

    // 1. Create/Update learner profile
    const { error: profileErr } = await supabase
      .from("learner_profiles")
      .upsert({
        user_id: userId,
        topics: finalScores,
        history: [{ date: new Date().toISOString().split("T")[0], topics: finalScores }],
        updated_at: new Date().toISOString()
      });

    if (profileErr) throw new Error(profileErr.message);

    // 2. Mark profile as completed
    const { error: userErr } = await supabase
      .from("profiles")
      .update({ assessment_completed: true })
      .eq("id", userId);

    if (userErr) throw new Error(userErr.message);

    // 3. Auto-populate initial learning planner tasks for weak topics (< 60%)
    const weakTopics = Object.entries(finalScores).filter(([_, score]) => score < 60);
    const tasksToInsert = [];
    const now = new Date();

    let dayOffset = 1;
    for (const [topic, score] of weakTopics) {
      // Schedule revision/study tasks
      const scheduledDate = new Date();
      scheduledDate.setDate(now.getDate() + dayOffset);
      
      tasksToInsert.push({
        user_id: userId,
        title: `Study weak topic: ${topic} (Diagnostic: ${score}%)`,
        tag: "Review",
        priority: score < 30 ? "high" : "medium",
        scheduled_at: scheduledDate.toISOString(),
        done: false
      });
      dayOffset += 2; // space tasks out
    }

    if (tasksToInsert.length > 0) {
      await supabase.from("planner_tasks").insert(tasksToInsert);
    }

    return { success: true, scores: finalScores };
  });
