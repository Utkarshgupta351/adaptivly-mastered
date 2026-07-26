import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import {
  Code2, Users, Binary, Server, FileText, Play, CheckCircle2, XCircle, Sparkles,
  Clock, Star, ArrowRight, Mic, Video, MessageSquare, Lock, Send, Loader2, ArrowLeft, Trophy, Target, Maximize
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { getSessions, startSession, sendAnswer, terminateSession } from "@/server-actions/mock-interviews";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

export const Route = createFileRoute("/_app/mock-interviews")({ component: Mock });

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  Medium: "border-amber-500/40 text-amber-600 bg-amber-500/5",
  Hard: "border-destructive/40 text-destructive bg-destructive/5",
};

const CODE_TEMPLATES: Record<string, string> = {
  javascript: "function solve() {\n  // Write your code here\n}\n",
  python: "def solve():\n    # Write your code here\n    pass\n",
  java: "class Solution {\n    public void solve() {\n        // Write your code here\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nvoid solve() {\n    // Write your code here\n}\n",
};

function Mock() {
  const { user, session: authSession } = useAuth();
  const queryClient = useQueryClient();
  
  // Chat state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [interactionMode, setInteractionMode] = useState<"text" | "voice" | "both">("text");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // DSA Editor State
  const [dsaProblem, setDsaProblem] = useState<any>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(CODE_TEMPLATES["python"]);
  const [dsaActiveTab, setDsaActiveTab] = useState<"problem" | "chat">("problem");
  
  // Anti-Cheat state
  const [violations, setViolations] = useState(0);
  const lastKeyTimeRef = useRef<number>(0);

  // Fullscreen Anti-Cheat state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsViolations, setFsViolations] = useState(0);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      requestFullscreen();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [activeSessionId]);

  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (!activeSessionId) return;
      
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        const newFsCount = fsViolations + 1;
        setFsViolations(newFsCount);
        
        if (newFsCount === 1) {
          toast.error("Warning 1 of 3: You must remain in fullscreen during the interview.");
        } else if (newFsCount === 2) {
          toast.error("Warning 2 of 3: Do not exit fullscreen. One more exit will terminate the interview.");
        } else if (newFsCount === 3) {
          toast.error("Warning 3 of 3: Final warning. Do not exit fullscreen.");
        } else if (newFsCount >= 4) {
          toast.error("Interview Terminated! Reason: Fullscreen violation");
          if (authSession) {
            setIsSending(true);
            try {
              await terminateSession({ data: { token: authSession.access_token, sessionId: activeSessionId, reason: "Fullscreen violation" } });
              queryClient.invalidateQueries({ queryKey: ["mock_sessions"] });
            } finally {
              setIsSending(false);
              setActiveSessionId(null);
              setMessages([]);
              setFsViolations(0);
              setViolations(0);
            }
          }
        }
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [activeSessionId, fsViolations, authSession, queryClient]);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
             setInputText(prev => prev + (prev ? " " : "") + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
           console.error("Speech recognition error", event.error);
           setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
           setIsRecording(false);
        };
      }
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
       if (recognitionRef.current) recognitionRef.current.stop();
       if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      if (isSpeaking && synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string) => {
    if (interactionMode === "text" || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const triggerViolation = async (reason: string) => {
    const newCount = violations + 1;
    setViolations(newCount);
    
    if (newCount === 1) {
      toast.error(`Anti-Cheat Warning 1/3: ${reason}`);
    } else if (newCount === 2) {
      toast.error(`Anti-Cheat Warning 2/3: ${reason}. One more violation and your interview will be terminated.`);
    } else if (newCount >= 3) {
      toast.error(`Interview Terminated! Reason: ${reason}`);
      if (activeSessionId && authSession) {
        setIsSending(true);
        try {
          await terminateSession({ data: { token: authSession.access_token, sessionId: activeSessionId, reason } });
          queryClient.invalidateQueries({ queryKey: ["mock_sessions"] });
        } finally {
          setIsSending(false);
          setActiveSessionId(null);
          setMessages([]);
          setViolations(0);
        }
      }
    }
  };
  
  // Fetch real mock session history
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["mock_sessions"],
    queryFn: async () => {
      if (!authSession) return [];
      return await getSessions({ data: { token: authSession.access_token } });
    },
    enabled: !!authSession,
  });

  // Fetch solved problem count to calculate unlocked modules
  const { data: solvedCount = 0 } = useQuery({
    queryKey: ["solved_problems_count"],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabaseBrowser
        .from("user_problem_status")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("solved", true);
      return count ?? 0;
    },
    enabled: !!user,
  });

  // Check for Anti-Cheat cooldowns
  const checkCooldown = (type: string) => {
    const failedSessions = sessions.filter(s => s.type === type && s.suggestion?.includes("[FAILED]"));
    if (failedSessions.length === 0) return null;
    
    failedSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const latestFailed = new Date(failedSessions[0].created_at);
    
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    const timeSinceFail = Date.now() - latestFailed.getTime();
    
    if (timeSinceFail < cooldownMs) {
      const remainingHours = Math.ceil((cooldownMs - timeSinceFail) / (1000 * 60 * 60));
      return `Anti-Cheat Cooldown: ${remainingHours}h remaining`;
    }
    return null;
  };

  const types = [
    {
      name: "Technical",
      desc: "General coding + CS fundamentals",
      icon: Code2,
      time: "45 min",
      color: "text-primary",
      bg: "bg-primary/10",
      difficulty: "Medium",
      count: sessions.filter(s => s.type === "Technical").length,
      unlocked: !checkCooldown("Technical"),
      lockMsg: checkCooldown("Technical") || undefined,
    },
    {
      name: "HR / Behavioral",
      desc: "STAR method & culture fit",
      icon: Users,
      time: "30 min",
      color: "text-emerald-brand",
      bg: "bg-emerald-brand/10",
      difficulty: "Easy",
      count: sessions.filter(s => s.type === "HR / Behavioral").length,
      unlocked: !checkCooldown("HR / Behavioral"),
      lockMsg: checkCooldown("HR / Behavioral") || undefined,
    },
    {
      name: "Resume Review",
      desc: "AI-powered feedback & scoring",
      icon: FileText,
      time: "15 min",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      difficulty: "Easy",
      count: sessions.filter(s => s.type === "Resume Review").length,
      unlocked: !checkCooldown("Resume Review"),
      lockMsg: checkCooldown("Resume Review") || undefined,
    },
    {
      name: "DSA",
      desc: "Algorithms & data structures",
      icon: Binary,
      time: "60 min",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      difficulty: "Hard",
      count: sessions.filter(s => s.type === "DSA").length,
      unlocked: solvedCount >= 5 && !checkCooldown("DSA"),
      lockMsg: checkCooldown("DSA") || "Solve 5 problems to unlock",
    },
    {
      name: "System Design",
      desc: "High-level architecture & scale",
      icon: Server,
      time: "60 min",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      difficulty: "Hard",
      count: sessions.filter(s => s.type === "System Design").length,
      unlocked: solvedCount >= 15 && !checkCooldown("System Design"),
      lockMsg: checkCooldown("System Design") || "Solve 15 problems to unlock",
    },
  ];

  const [configType, setConfigType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [resumeText, setResumeText] = useState("");
  const [customTopics, setCustomTopics] = useState("");

  const handleStart = async (type: string) => {
    if (type === "DSA" || type === "Resume Review" || type === "Custom Interview") {
      setConfigType(type);
      return;
    }
    await launchSession(type);
  };

  const launchSession = async (type: string) => {
    if (!authSession) return;
    setIsSending(true);
    setConfigType(null);
    setDsaProblem(null);
    setCode(CODE_TEMPLATES["python"]);
    setLanguage("python");
    
    toast.promise(
      startSession({ data: { token: authSession.access_token, type, difficulty, resumeText, customTopics } }).then(res => {
        setActiveSessionId(res.sessionId);
        setActiveType(type);
        setMessages([{ role: "assistant", content: res.firstMessage }]);
        
        try {
          const parsed = JSON.parse(res.firstMessage);
          if (parsed.dsaProblem) {
            setDsaProblem(parsed.dsaProblem);
            setDsaActiveTab("problem");
          }
          if (parsed.replyToUser) {
            speakText(parsed.replyToUser);
          } else {
            speakText(res.firstMessage);
          }
        } catch (e) {
          speakText(res.firstMessage);
        }
        
        setIsSending(false);
      }),
      {
        loading: "Preparing your interview...",
        success: "Interview started! Good luck.",
        error: () => { setIsSending(false); return "Failed to start interview."; },
      }
    );
  };

  const handleSend = async (isEnd = false, overrideText?: string) => {
    if (!authSession || !activeSessionId || (!inputText.trim() && !overrideText?.trim() && !isEnd)) return;
    
    const userMsg = overrideText !== undefined ? overrideText : inputText;
    if (overrideText === undefined) setInputText("");
    setIsSending(true);
    
    if (userMsg.trim()) {
      setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    }
    
    try {
      const res = await sendAnswer({ 
        data: { 
          token: authSession.access_token, 
          sessionId: activeSessionId, 
          answer: userMsg || "End the interview.", 
          isEnd 
        } 
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
      
      try {
        const parsed = JSON.parse(res.response);
        if (parsed.dsaProblem) {
          setDsaProblem(parsed.dsaProblem);
          setDsaActiveTab("problem");
        }
        if (parsed.replyToUser) {
          speakText(parsed.replyToUser);
        } else {
          speakText(res.response);
        }
      } catch (e) {
        speakText(res.response);
      }
      
      if (isEnd) {
        toast.success("Interview completed! Checking results...");
        queryClient.invalidateQueries({ queryKey: ["mock_sessions"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
        setTimeout(() => {
          setActiveSessionId(null);
          setMessages([]);
        }, 3000);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const completedSessions = sessions.filter(s => s.status === "completed");
  const pendingSessions = sessions.filter(s => s.status === "in_progress");
  
  const totalScore = completedSessions.reduce((acc, s) => acc + (s.score ?? 0), 0);
  const avgScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0;
  
  const totalDurationMin = completedSessions.reduce((acc, s) => acc + (s.duration_min ?? 0), 0);
  const totalHours = Math.floor(totalDurationMin / 60);
  const totalMins = totalDurationMin % 60;

  if (configType) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setConfigType(null)} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-bold text-lg leading-tight">Configure {configType}</h2>
        </div>
        <Card className="flex-1 p-6 space-y-6 border-border/40 bg-card shadow-soft max-w-2xl mx-auto w-full">
          {configType === "DSA" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Difficulty Level</label>
                <div className="flex gap-3">
                  {["Easy", "Medium", "Hard"].map(d => (
                    <Button 
                      key={d} 
                      variant={difficulty === d ? "default" : "outline"}
                      className={difficulty === d ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Easy: Arrays, Strings, HashMaps <br/>
                Medium: Trees, Binary Search, Heap, Sliding Window <br/>
                Hard: Graphs, DP, Advanced Trees, Tries
              </p>
            </div>
          )}

          {configType === "Resume Review" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Paste your resume content</label>
                <textarea
                  className="w-full min-h-[200px] rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Paste your text-based resume here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">The AI will specifically ask you questions about your projects and skills mentioned here.</p>
            </div>
          )}

          {configType === "Custom Interview" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Topics (comma separated)</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. React, Kafka, Redis, Microservices"
                  value={customTopics}
                  onChange={(e) => setCustomTopics(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="pt-6">
            <Button 
              className="w-full bg-gradient-primary rounded-xl shadow-elegant h-12" 
              onClick={() => launchSession(configType)}
              disabled={isSending || (configType === "Resume Review" && !resumeText.trim()) || (configType === "Custom Interview" && !customTopics.trim())}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Interview"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (activeSessionId && !isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-6">
        <Card className="p-8 max-w-md w-full text-center border-destructive/40 shadow-soft">
          <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Interview Paused</h2>
          <p className="text-muted-foreground mb-6">
            You must remain in fullscreen mode during the mock interview. 
            Exiting fullscreen multiple times will result in automatic termination.
          </p>
          <Button 
            className="w-full bg-gradient-primary rounded-xl h-12 shadow-elegant" 
            onClick={() => requestFullscreen()}
          >
            <Maximize className="w-4 h-4 mr-2" /> Return to Fullscreen
          </Button>
        </Card>
      </div>
    );
  }

  if (activeSessionId) {


    const chatContent = (
      <div className={`flex flex-col h-full w-full ${activeType !== 'DSA' ? 'pb-4' : ''}`}>
        <Card className="flex-1 overflow-y-auto p-6 space-y-6 border-border/40 bg-card shadow-soft mb-4">
          {messages.map((m, i) => {
            if (m.role === "metadata") return null;

            if (m.role === "report") {
              let reportData: any = null;
              try { reportData = JSON.parse(m.content); } catch (e) {}
              if (!reportData) return null;
              
              return (
                <div key={i} className="my-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 shadow-elegant">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h3 className="font-black text-xl">Final Interview Report</h3>
                  </div>
                  <p className="text-sm text-foreground/80 mb-6">{reportData.summary}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-background rounded-xl p-3 border border-border/40 text-center">
                      <div className="text-2xl font-black text-primary">{reportData.overallScore ?? "--"}%</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">Overall</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border/40 text-center">
                      <div className="text-2xl font-black">{reportData.communicationScore ?? "--"}%</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">Communication</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border/40 text-center">
                      <div className="text-2xl font-black">{reportData.technicalAccuracy ?? "--"}%</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">Technical</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border/40 text-center">
                      <div className="text-2xl font-black">{reportData.problemSolving ?? "--"}%</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">Problem Solving</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-emerald-500 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Top Strengths</h4>
                      <ul className="space-y-2 text-sm">
                        {(reportData.topStrengths || []).map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> <span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-destructive mb-2 flex items-center gap-2"><XCircle className="h-4 w-4"/> Key Weaknesses</h4>
                      <ul className="space-y-2 text-sm">
                        {(reportData.keyWeaknesses || []).map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2"><span className="text-destructive mt-0.5">•</span> <span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 bg-background rounded-xl p-4 border border-border/40">
                    <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-2"><Target className="h-4 w-4"/> Improvement Plan</h4>
                    <p className="text-sm">{reportData.improvementPlan}</p>
                  </div>
                </div>
              );
            }

            if (m.role === "assistant") {
              let text = m.content;
              let evalData: any = null;
              try {
                const parsed = JSON.parse(m.content);
                text = parsed.replyToUser || m.content;
                evalData = parsed.evaluation;
              } catch (e) {}

              return (
                <div key={i} className="flex justify-start mb-4 flex-col items-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-muted/50 border border-border/40 rounded-tl-sm text-foreground">
                    <div className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">Interviewer</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
                  </div>
                  
                  {evalData && evalData.technicalAccuracy !== undefined && (
                    <details className="mt-2 text-xs text-muted-foreground w-[80%]">
                      <summary className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1 select-none w-max">
                        <Sparkles className="h-3 w-3" /> View AI Analysis for your last answer
                      </summary>
                      <div className="mt-2 p-4 bg-muted/30 rounded-xl border border-border/40 grid gap-4 w-full">
                        <div className="flex flex-wrap gap-2">
                          <span className="font-mono bg-background px-2 py-1 border border-border/40 rounded-md">Tech: {evalData.technicalAccuracy}%</span>
                          <span className="font-mono bg-background px-2 py-1 border border-border/40 rounded-md">Comm: {evalData.communicationScore}%</span>
                          <span className="font-mono bg-background px-2 py-1 border border-border/40 rounded-md">Problem Solving: {evalData.problemSolving}%</span>
                        </div>
                        <div className="space-y-3">
                          {evalData.idealAnswer && <div><span className="font-bold text-emerald-500 block mb-0.5">Ideal Answer:</span> {evalData.idealAnswer}</div>}
                          {evalData.whatUserMissed && <div><span className="font-bold text-destructive block mb-0.5">What you missed:</span> {evalData.whatUserMissed}</div>}
                          {evalData.howToImprove && <div><span className="font-bold text-amber-500 block mb-0.5">How to improve:</span> {evalData.howToImprove}</div>}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              );
            }

            return (
              <div key={i} className="flex justify-end mb-4">
                <div className="max-w-[80%] rounded-2xl p-4 bg-primary text-primary-foreground rounded-tr-sm">
                  <div className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">You</div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Interviewer is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex justify-center mb-1">
            <div className="bg-muted p-1 rounded-full flex gap-1 items-center border border-border/50">
              <button 
                onClick={() => setInteractionMode("text")} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${interactionMode === "text" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Text Only
              </button>
              <button 
                onClick={() => setInteractionMode("both")} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${interactionMode === "both" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Text & Voice
              </button>
              <button 
                onClick={() => setInteractionMode("voice")} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${interactionMode === "voice" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Voice Only
              </button>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            {interactionMode !== "voice" && (
              <textarea
                className="flex-1 min-h-[60px] max-h-32 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder={isRecording ? "Listening..." : "Type your answer here..."}
                value={inputText}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (text.length > 20) {
                    e.preventDefault();
                    triggerViolation("Large text paste detected.");
                  }
                }}
                onChange={(e) => {
                  const now = Date.now();
                  const newText = e.target.value;
                  
                  if (newText.length - inputText.length > 20) {
                    if (now - lastKeyTimeRef.current < 50) {
                      triggerViolation("Unrealistic typing speed detected (Copy/Paste).");
                      return;
                    }
                  }
                  
                  lastKeyTimeRef.current = now;
                  setInputText(newText);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(false);
                  }
                }}
                disabled={isSending || violations >= 3 || (isRecording && interactionMode === "both")}
              />
            )}
            
            {interactionMode !== "text" && (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                className={`h-[60px] ${interactionMode === "voice" ? "flex-1 rounded-xl shadow-elegant" : "w-[60px] rounded-xl border-border/40 hover:bg-muted"}`}
                onClick={() => {
                  if (isRecording && interactionMode === "voice") {
                    toggleRecording();
                    setTimeout(() => {
                      if (inputText.trim()) handleSend(false);
                    }, 500);
                  } else {
                    toggleRecording();
                  }
                }}
                disabled={isSending}
              >
                {isRecording ? (
                  <>
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    {interactionMode === "voice" ? "Stop Recording & Send" : ""}
                  </>
                ) : (
                  <>
                    <Mic className={`h-5 w-5 ${interactionMode === "voice" ? "mr-2" : ""}`} />
                    {interactionMode === "voice" ? (isSpeaking ? "Stop AI & Speak" : "Start Speaking") : ""}
                  </>
                )}
              </Button>
            )}
            
            {(interactionMode === "text" || interactionMode === "both") && (
              <Button 
                className="h-[60px] w-[60px] rounded-xl bg-gradient-primary shadow-elegant" 
                onClick={() => handleSend(false)}
                disabled={!inputText.trim() || isSending || isRecording}
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveSessionId(null)} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="font-bold text-lg leading-tight">{activeType} Interview</h2>
              <div className="text-xs text-emerald-brand flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Session
              </div>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleSend(true)}
            disabled={isSending}
          >
            End & Evaluate
          </Button>
        </div>

        {activeType === "DSA" ? (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden pb-4">
            {/* Left Pane: Chat & Problem */}
            <Card className="flex flex-col overflow-hidden border-border/40 bg-card shadow-soft h-full">
              <div className="flex border-b border-border/40 bg-muted/20 shrink-0">
                <button 
                  onClick={() => setDsaActiveTab('problem')} 
                  className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${dsaActiveTab === 'problem' ? 'border-b-2 border-primary text-primary bg-background' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  Problem Description
                </button>
                <button 
                  onClick={() => setDsaActiveTab('chat')} 
                  className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${dsaActiveTab === 'chat' ? 'border-b-2 border-primary text-primary bg-background' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  Chat & Feedback
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-4 relative bg-background/50">
                {dsaActiveTab === 'problem' ? (
                  <div className="h-full overflow-y-auto space-y-6 pb-4">
                    {dsaProblem ? (
                      <>
                        <h3 className="text-2xl font-black">{dsaProblem.title}</h3>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{dsaProblem.statement}</p>
                        
                        {dsaProblem.constraints && dsaProblem.constraints.length > 0 && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Constraints</h4>
                            <ul className="list-disc pl-4 text-sm space-y-1">
                              {dsaProblem.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {dsaProblem.examples?.map((ex: any, i: number) => (
                            <div key={i} className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm font-mono space-y-2">
                              <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground font-sans">Example {i+1}</div>
                              <div><span className="text-emerald-500 font-bold">Input:</span> {ex.input}</div>
                              <div><span className="text-primary font-bold">Output:</span> {ex.output}</div>
                              {ex.explanation && <div className="text-muted-foreground mt-2 font-sans leading-relaxed border-t border-border/40 pt-2"><span className="font-bold text-foreground">Explanation:</span> {ex.explanation}</div>}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs">
                          <Badge variant="outline" className="bg-background">Time Limit: <span className="font-mono ml-2 text-primary">{dsaProblem.timeLimit || 'N/A'}</span></Badge>
                          <Badge variant="outline" className="bg-background">Memory Limit: <span className="font-mono ml-2 text-primary">{dsaProblem.memoryLimit || 'N/A'}</span></Badge>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="animate-spin h-8 w-8 mb-4 text-primary"/>
                        <p className="font-medium animate-pulse">Generating algorithmic problem...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {chatContent}
                  </div>
                )}
              </div>
            </Card>

            {/* Right Pane: Code Editor */}
            <Card className="flex flex-col overflow-hidden border-border/40 shadow-soft h-full bg-[#1e1e1e]">
              <div className="flex items-center justify-between p-3 border-b border-[#333] bg-[#252526] shrink-0">
                <select 
                  className="bg-[#3c3c3c] text-[#cccccc] border border-[#3c3c3c] rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary" 
                  value={language} 
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setCode(CODE_TEMPLATES[e.target.value]);
                  }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide" 
                  onClick={() => {
                    const payload = `[Code Submission - Language: ${language}]\n\n${code}`;
                    handleSend(false, payload);
                    setDsaActiveTab('chat');
                  }} 
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white mr-1.5" />} 
                  Submit Code
                </Button>
              </div>
              <div className="flex-1 min-h-0 py-4">
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    renderLineHighlight: "all"
                  }}
                />
              </div>
            </Card>
          </div>
        ) : (
          chatContent
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Mock Interviews" description="Practice with realistic AI-driven interviews and get actionable feedback." />

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Star, label: "Avg score", value: completedSessions.length > 0 ? `${avgScore} / 100` : "-- / 100", color: "text-primary", bg: "bg-primary/10" },
          { icon: Play, label: "Completed", value: `${completedSessions.length} sessions`, color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
          { icon: Clock, label: "Total time", value: `${totalHours}h ${totalMins}m`, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: MessageSquare, label: "Pending", value: `${pendingSessions.length} sessions`, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
            </div>
            <div className="text-xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Interview type cards */}
      <div>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">Start a new interview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <Card
              key={t.name}
              className={`group relative overflow-hidden border-border/40 p-6 shadow-soft transition-all ${!t.unlocked ? "opacity-75 grayscale hover:grayscale-0" : "hover:-translate-y-1 hover:shadow-elegant hover:border-primary/30"}`}
            >
              {!t.unlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-semibold">{t.lockMsg}</span>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${t.bg} group-hover:scale-110 transition-transform`}>
                  <t.icon className={`h-5.5 w-5.5 ${t.color}`} />
                </div>
                <Badge variant="outline" className={`text-xs ${diffColors[t.difficulty]}`}>
                  {t.difficulty}
                </Badge>
              </div>
              <h3 className="mt-4 font-bold text-base">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time}</span>
                  <span className="flex items-center gap-1"><Play className="h-3 w-3" />{t.count} done</span>
                </div>
                <Button 
                  size="sm" 
                  disabled={!t.unlocked || isSending}
                  onClick={() => handleStart(t.name)}
                  className="bg-gradient-primary rounded-xl gap-1.5 shadow-elegant"
                >
                  {t.unlocked ? (
                    <>
                      <Play className="h-3.5 w-3.5" /> Start
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" /> Locked
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}

          {/* Custom interview CTA */}
          <Card className="group border-dashed border-2 border-border/40 p-6 shadow-soft flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Custom interview</div>
              <div className="text-xs text-muted-foreground mt-0.5">Choose topics, difficulty & duration</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl mt-1">Configure →</Button>
          </Card>
        </div>
      </div>

      {/* Modes */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Mic, title: "Voice mode", desc: "Real-time speech-to-text for spoken answers.", badge: "Beta", color: "text-purple-400", bg: "bg-purple-400/10" },
          { icon: Video, title: "Video mode", desc: "Simulate a real video call interview with the AI.", badge: "Pro", color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: Code2, title: "Live coding", desc: "Shared editor where the AI can see your code.", badge: "Popular", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
        ].map((m) => (
          <Card key={m.title} className="border-border/40 p-5 shadow-soft flex items-start gap-4">
            <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${m.bg}`}>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{m.title}</span>
                <Badge variant="outline" className="text-[10px]">{m.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent results */}
      <div>
        <h2 className="font-bold text-lg mb-4">Recent results</h2>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading recent sessions...</div>
        ) : completedSessions.length === 0 ? (
          <div className="text-muted-foreground text-sm mb-12">No completed mock interviews found. Start one above!</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {completedSessions.map((r) => (
              <Card key={r.id} className="border-border/40 p-6 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge
                      className={(r.score ?? 0) >= 70 ? "bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30" : "border-amber-500/40 text-amber-600 bg-amber-500/10"}
                    >
                      {(r.score ?? 0) >= 70 ? "Passed" : "Needs work"}
                    </Badge>
                    <h3 className="mt-2 font-bold text-base leading-tight">{r.type} Interview</h3>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()} · {r.duration_min || 0} min
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-4xl font-black ${(r.score ?? 0) >= 80 ? "text-gradient" : ""}`}>{r.score || 0}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
                <Progress value={r.score || 0} className="mt-4 h-2" />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-brand mb-2">Strengths</div>
                    <ul className="space-y-1.5">
                      {r.strengths && r.strengths.length > 0 ? (
                        r.strengths.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-brand" />
                            {s}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground">None identified</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-2">To improve</div>
                    <ul className="space-y-1.5">
                      {r.weaknesses && r.weaknesses.length > 0 ? (
                        r.weaknesses.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                            {s}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground">None identified</li>
                      )}
                    </ul>
                  </div>
                </div>

                {r.suggestion && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary mb-1">
                      <Sparkles className="h-3 w-3" /> AI SUGGESTION
                    </div>
                    <p className="text-xs text-muted-foreground">{r.suggestion}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
