import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getAssessmentQuestions, submitAssessment, DiagnosticQuestion } from "@/server-actions/assessment";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Brain, ArrowRight, Clock, Star, Play, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assessment")({
  component: AssessmentPage,
});

function AssessmentPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [attempts, setAttempts] = useState(0);
  
  // Timer per question
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<any>(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["diagnostic_questions"],
    queryFn: () => getAssessmentQuestions(),
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Unauthenticated");
      return submitAssessment({ data: { token, answers: payload } });
    },
    onSuccess: () => {
      toast.success("Assessment completed successfully! Generating profile...");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["learner_profile"] });
      navigate({ to: "/dashboard" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit assessment.");
    }
  });

  // Start timer when starting or shifting questions
  useEffect(() => {
    if (started && currentIdx < questions.length) {
      setTimeSpent(0);
      setAttempts(0);
      setSelectedOpt(null);
      setConfidence(3);
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, currentIdx, questions.length]);

  const handleStart = () => {
    setStarted(true);
    setCurrentIdx(0);
    setAnswers([]);
  };

  const handleOptionClick = (idx: number) => {
    setSelectedOpt(idx);
    setAttempts((prev) => prev + 1);
  };

  const handleNext = (skipped = false) => {
    if (selectedOpt === null && !skipped) {
      toast.warning("Please select an answer or click Skip.");
      return;
    }

    const currentQuestion = questions[currentIdx];
    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedOptionIndex: skipped ? -1 : selectedOpt,
        timeSpentSeconds: timeSpent,
        attempts: skipped ? 0 : attempts,
        confidence: skipped ? 1 : confidence,
        skipped,
      }
    ];

    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed!
      if (timerRef.current) clearInterval(timerRef.current);
      submitMutation.mutate(newAnswers);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion: DiagnosticQuestion | undefined = questions[currentIdx];
  const progressPercent = questions.length > 0 ? Math.round((currentIdx / questions.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {!started ? (
        <Card className="p-8 border-border/40 shadow-soft text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-bounce">
            <Brain className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Initial Diagnostic Assessment</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Welcome to Adaptivly! Before we design your personalized roadmap, we need to analyze your current baseline across Core Computer Science domains.
            </p>
          </div>

          <div className="grid gap-4 max-w-lg mx-auto text-left py-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-brand shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">Comprehensive Core Assessment</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Tests DSA, OS, DBMS, Computer Networks, OOP, and High-Level System Design.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/40">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">18 Concept-Check Questions</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Questions scale dynamically from Easy to Hard to pinpoint your exact limits.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/40">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">Central Adaptive Learning Profile</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Your results build your starting dynamic profile, feeding directly into your AI study recommendations.</div>
              </div>
            </div>
          </div>

          <Button onClick={handleStart} className="px-8 py-6 rounded-2xl bg-gradient-primary text-sm shadow-elegant gap-2">
            <Play className="h-4 w-4" /> Start Assessment <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Header Progress */}
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
            <span>Diagnostic Progress: {currentIdx + 1} of {questions.length}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeSpent}s</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />

          {currentQuestion && (
            <Card className="p-6 md:p-8 border-border/40 shadow-soft space-y-6 relative overflow-hidden">
              {/* Domain Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {currentQuestion.topic} · {currentQuestion.difficulty}
                </Badge>
                <div className="text-[10px] text-muted-foreground">Attempts: {attempts}</div>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-bold tracking-tight leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="grid gap-3.5">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    className={`flex items-center justify-between p-4 rounded-xl text-sm text-left border transition-all ${
                      selectedOpt === idx
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border/40 hover:bg-muted/40"
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center text-[10px] ${
                      selectedOpt === idx ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                    }`}>
                      {selectedOpt === idx ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slider for Confidence */}
              <div className="border-t border-border/40 pt-5 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> How confident are you in this answer?</span>
                  <span className="text-primary">{confidence}/5</span>
                </div>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setConfidence(val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        confidence === val
                          ? "bg-amber-500/10 border-amber-500 text-amber-600"
                          : "border-border/40 hover:bg-muted"
                      }`}
                    >
                      {val === 1 ? "Guess" : val === 3 ? "Sure" : val === 5 ? "Absolute" : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-border/40 pt-5">
                <Button
                  variant="ghost"
                  onClick={() => handleNext(true)}
                  className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Skip Question
                </Button>
                <Button
                  onClick={() => handleNext(false)}
                  disabled={submitMutation.isPending}
                  className="px-6 rounded-xl bg-gradient-primary text-xs shadow-elegant gap-2"
                >
                  {submitMutation.isPending ? (
                    <>Submitting... <Loader2 className="h-4 w-4 animate-spin" /></>
                  ) : (
                    <>
                      {currentIdx + 1 === questions.length ? "Finish Assessment" : "Next Question"}{" "}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
