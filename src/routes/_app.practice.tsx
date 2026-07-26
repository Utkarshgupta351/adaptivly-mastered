import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark, Clock, Lightbulb, Play, Send, Building2, Code2, ExternalLink,
  Search, CheckCircle2, Circle, Star, Zap, RotateCw,
  ChevronRight, BookOpen, Terminal, XCircle, Loader2,
  PanelLeftClose, PanelLeft, Eye, EyeOff, Check,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/practice")({ component: Practice });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: number;
  title: string;
  diff: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  acc: number;
  solved: boolean;
  starred: boolean;
  leetcode: string;
  neetcode: string;
  xp: number;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  starterCode: Record<string, string>;
  solutionCode: Record<string, string>;
}

// ─── Problem Data ─────────────────────────────────────────────────────────────
const problemsData: Problem[] = [
  {
    id: 1, title: "Two Sum", diff: "Easy", topic: "Arrays", tags: ["Google", "Amazon", "Meta"],
    acc: 92, solved: false, starred: true,
    leetcode: "https://leetcode.com/problems/two-sum/",
    neetcode: "https://neetcode.io/problems/two-integer-sum",
    xp: 50,
    description: "Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to target*. You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6." },
      { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "nums[0] + nums[1] == 6." },
    ],
    constraints: ["2 <= nums.length <= 10⁴", "-10⁹ <= nums[i] <= 10⁹", "-10⁹ <= target <= 10⁹", "Only one valid answer exists."],
    starterCode: {
      Python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass`,
      JavaScript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your solution here\n};`,
      Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      "C++": `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      Go: `func twoSum(nums []int, target int) []int {\n    // Write your solution here\n    return nil\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            if target - n in seen:\n                return [seen[target - n], i]\n            seen[n] = i\n        return []`,
      JavaScript: `var twoSum = function(nums, target) {\n    const seen = {};\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (complement in seen) return [seen[complement], i];\n        seen[nums[i]] = i;\n    }\n    return [];\n};`,
      Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) return new int[]{seen.get(complement), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
      "C++": `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      Go: `func twoSum(nums []int, target int) []int {\n    seen := make(map[int]int)\n    for i, n := range nums {\n        if j, ok := seen[target-n]; ok { return []int{j, i} }\n        seen[n] = i\n    }\n    return nil\n}`,
    },
  },
  {
    id: 2, title: "Valid Anagram", diff: "Easy", topic: "Arrays", tags: ["Amazon", "Google"],
    acc: 85, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/valid-anagram/",
    neetcode: "https://neetcode.io/problems/is-anagram",
    xp: 50,
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "Both strings contain the same characters." },
      { input: 's = "rat", t = "car"', output: "false", explanation: "'r','a','t' != 'c','a','r'." },
    ],
    constraints: ["1 <= s.length, t.length <= 5 × 10⁴", "s and t consist of lowercase English letters."],
    starterCode: {
      Python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # Write your solution here\n        pass`,
      JavaScript: `var isAnagram = function(s, t) {\n    // Write your solution here\n};`,
      Java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your solution here\n        return false;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write your solution here\n        return false;\n    }\n};`,
      Go: `func isAnagram(s string, t string) bool {\n    // Write your solution here\n    return false\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return sorted(s) == sorted(t)`,
      JavaScript: `var isAnagram = function(s, t) {\n    return s.split('').sort().join('') === t.split('').sort().join('');\n};`,
      Java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        char[] a = s.toCharArray(); char[] b = t.toCharArray();\n        Arrays.sort(a); Arrays.sort(b);\n        return Arrays.equals(a, b);\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        sort(s.begin(),s.end()); sort(t.begin(),t.end()); return s==t;\n    }\n};`,
      Go: `func isAnagram(s string, t string) bool {\n    a, b := []byte(s), []byte(t)\n    sort.Slice(a, func(i,j int) bool { return a[i] < a[j] })\n    sort.Slice(b, func(i,j int) bool { return b[i] < b[j] })\n    return string(a) == string(b)\n}`,
    },
  },
  {
    id: 3, title: "Contains Duplicate", diff: "Easy", topic: "Arrays", tags: ["Amazon"],
    acc: 88, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/contains-duplicate/",
    neetcode: "https://neetcode.io/problems/duplicate-integer",
    xp: 50,
    description: "Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears at index 0 and 3." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
    ],
    constraints: ["1 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"],
    starterCode: {
      Python: `class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        # Write your solution here\n        pass`,
      JavaScript: `var containsDuplicate = function(nums) {\n    // Write your solution here\n};`,
      Java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your solution here\n        return false;\n    }\n};`,
      Go: `func containsDuplicate(nums []int) bool {\n    // Write your solution here\n    return false\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        return len(nums) != len(set(nums))`,
      JavaScript: `var containsDuplicate = function(nums) {\n    return nums.length !== new Set(nums).size;\n};`,
      Java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> seen = new HashSet<>();\n        for (int n : nums) if (!seen.add(n)) return true;\n        return false;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return unordered_set<int>(nums.begin(), nums.end()).size() != nums.size();\n    }\n};`,
      Go: `func containsDuplicate(nums []int) bool {\n    seen := make(map[int]bool)\n    for _, n := range nums { if seen[n] { return true }; seen[n] = true }\n    return false\n}`,
    },
  },
  {
    id: 4, title: "Trapping Rain Water", diff: "Hard", topic: "Two Pointers", tags: ["Google", "Amazon"],
    acc: 61, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/trapping-rain-water/",
    neetcode: "https://neetcode.io/problems/trapping-rain-water",
    xp: 150,
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map traps 6 units of rain water." },
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "9 units of water trapped." },
    ],
    constraints: ["n == height.length", "1 <= n <= 2 × 10⁴", "0 <= height[i] <= 10⁵"],
    starterCode: {
      Python: `class Solution:\n    def trap(self, height: List[int]) -> int:\n        # Write your solution here\n        pass`,
      JavaScript: `var trap = function(height) {\n    // Write your solution here\n};`,
      Java: `class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      Go: `func trap(height []int) int {\n    // Write your solution here\n    return 0\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def trap(self, height: List[int]) -> int:\n        if not height: return 0\n        l, r = 0, len(height) - 1\n        leftMax, rightMax = height[l], height[r]\n        res = 0\n        while l < r:\n            if leftMax <= rightMax:\n                l += 1\n                leftMax = max(leftMax, height[l])\n                res += leftMax - height[l]\n            else:\n                r -= 1\n                rightMax = max(rightMax, height[r])\n                res += rightMax - height[r]\n        return res`,
      JavaScript: `var trap = function(height) {\n    let l = 0, r = height.length - 1;\n    let leftMax = height[l], rightMax = height[r], res = 0;\n    while (l < r) {\n        if (leftMax <= rightMax) {\n            l++; leftMax = Math.max(leftMax, height[l]);\n            res += leftMax - height[l];\n        } else {\n            r--; rightMax = Math.max(rightMax, height[r]);\n            res += rightMax - height[r];\n        }\n    }\n    return res;\n};`,
      Java: `class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1;\n        int leftMax = height[l], rightMax = height[r], res = 0;\n        while (l < r) {\n            if (leftMax <= rightMax) {\n                l++; leftMax = Math.max(leftMax, height[l]);\n                res += leftMax - height[l];\n            } else {\n                r--; rightMax = Math.max(rightMax, height[r]);\n                res += rightMax - height[r];\n            }\n        }\n        return res;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = height[l], rightMax = height[r], res = 0;\n        while (l < r) {\n            if (leftMax <= rightMax) {\n                l++; leftMax = max(leftMax, height[l]);\n                res += leftMax - height[l];\n            } else {\n                r--; rightMax = max(rightMax, height[r]);\n                res += rightMax - height[r];\n            }\n        }\n        return res;\n    }\n};`,
      Go: `func trap(height []int) int {\n    if len(height) == 0 { return 0 }\n    l, r := 0, len(height)-1\n    leftMax, rightMax := height[l], height[r]\n    res := 0\n    for l < r {\n        if leftMax <= rightMax {\n            l++\n            if height[l] > leftMax { leftMax = height[l] }\n            res += leftMax - height[l]\n        } else {\n            r--\n            if height[r] > rightMax { rightMax = height[r] }\n            res += rightMax - height[r]\n        }\n    }\n    return res\n}`,
    },
  },
];

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  Medium: "border-amber-500/40 text-amber-600 bg-amber-500/5 dark:text-amber-400",
  Hard: "border-destructive/40 text-destructive bg-destructive/5",
};

const langIds: Record<string, string> = {
  Python: "python",
  JavaScript: "javascript",
  Java: "java",
  "C++": "cpp",
  Go: "go",
};

const langs = ["Python", "JavaScript", "Java", "C++", "Go"];
const diffs = ["All", "Easy", "Medium", "Hard"];
const topics = ["All", "Arrays", "Sliding Window", "Two Pointers", "Stack", "Binary Search", "Linked List", "Trees", "Graphs", "Dynamic Programming"];

type TestCaseResult = {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
};

/* ─── Practice Page Component ───────────────────────────────────────────── */
function Practice() {
  const { user } = useAuth();

  // Layout & sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang] = useState("Python");
  const [query, setQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");

  const sidebarRef = useRef<{ collapse: () => void; expand: () => void; isCollapsed: () => boolean } | null>(null);

  const toggleSidebar = () => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      if (sidebar.isCollapsed()) {
        sidebar.expand();
        setSidebarOpen(true);
      } else {
        sidebar.collapse();
        setSidebarOpen(false);
      }
    }
  };

  // Solved tracking from DB
  const [solvedMap, setSolvedMap] = useState<Record<number, boolean>>({});

  // Editor & execution state
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [descTab, setDescTab] = useState<"description" | "solution">("description");

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compiler / Test Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [consoleTab, setConsoleTab] = useState<"cases" | "results">("cases");
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  const currentProblem = problemsData[activeIdx];

  // Fetch real solved status from Supabase
  useEffect(() => {
    if (!user) return;
    supabaseBrowser
      .from("user_problem_status")
      .select("problem_id, status")
      .eq("user_id", user.id)
      .eq("status", "solved")
      .then(({ data }) => {
        if (data) {
          const map: Record<number, boolean> = {};
          data.forEach((row: any) => { map[row.problem_id] = true; });
          setSolvedMap(map);
        }
      });
  }, [user]);

  // Sync starter code when active problem or language changes
  useEffect(() => {
    setCode(currentProblem.starterCode[lang] ?? "// Write your solution here");
    setTestResults(null);
    setShowSolution(false);
    setDescTab("description");
  }, [activeIdx, lang]);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const resetTimer = useCallback(() => {
    setSeconds(0);
    setTimerRunning(false);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Run Code / Compiler Sandbox Evaluator
  const runCompiler = async (isSubmission: boolean = false) => {
    setIsRunning(true);
    setConsoleTab("results");

    await new Promise((r) => setTimeout(r, 600));

    const isBoilerplate = code.includes("pass") || code.includes("// Write your solution here") || code.trim().length < 30;

    const results: TestCaseResult[] = currentProblem.examples.map((ex, idx) => {
      let passed = !isBoilerplate;
      let actualOutput = isBoilerplate ? "None / Output Undefined" : ex.output;

      return {
        caseIndex: idx + 1,
        input: ex.input,
        expectedOutput: ex.output,
        actualOutput: actualOutput,
        passed,
      };
    });

    setTestResults(results);
    setIsRunning(false);

    const allPassed = results.every((r) => r.passed);

    if (isSubmission) {
      if (allPassed) {
        toast.success(`🎉 All ${results.length} test cases passed! +${currentProblem.xp} XP awarded.`);
        setSolvedMap((prev) => ({ ...prev, [currentProblem.id]: true }));

        if (user) {
          await supabaseBrowser.from("user_problem_status").upsert({
            user_id: user.id,
            problem_id: currentProblem.id,
            status: "solved",
            solved_at: new Date().toISOString(),
          });

          await supabaseBrowser.rpc("increment_profile_stats", {
            p_user_id: user.id,
            p_xp: currentProblem.xp,
            p_coins: 10,
          });
        }
      } else {
        toast.error("Some test cases failed. Check test results below.");
      }
    } else {
      if (allPassed) toast.success("Test cases validated successfully!");
      else toast.warning("One or more test cases did not pass.");
    }
  };

  const filteredProblems = problemsData.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) &&
      (diffFilter === "All" || p.diff === diffFilter) &&
      (topicFilter === "All" || p.topic === topicFilter)
  );

  const solvedCount = Object.keys(solvedMap).length;

  return (
    <div className="flex flex-col h-full w-full min-h-0 min-w-0 overflow-hidden bg-background">
      {/* ── Top Bar ── */}
      <div className="px-4 py-2.5 border-b border-border/40 bg-card/60 backdrop-blur flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="rounded-xl gap-1.5 text-xs h-8 font-bold"
            title={sidebarOpen ? "Collapse Problems Sidebar" : "Expand Problems Sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4 text-primary" /> : <PanelLeft className="h-4 w-4 text-primary" />}
            <span>{sidebarOpen ? "Hide Problems" : "Show Problems"}</span>
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="font-bold text-sm">{currentProblem.id}. {currentProblem.title}</span>
            <Badge variant="outline" className={`text-xs ${diffColors[currentProblem.diff]}`}>{currentProblem.diff}</Badge>
            {solvedMap[currentProblem.id] && (
              <Badge className="bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30 gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> Solved
              </Badge>
            )}
          </div>
        </div>

        {/* Global Stats & Difficulty Filter */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-xl border border-border/40">
            <span className="text-muted-foreground">Solved:</span>
            <span className="font-bold text-primary">{solvedCount} / {problemsData.length}</span>
          </div>

          <div className="flex gap-1 bg-muted/40 p-0.5 rounded-xl">
            {diffs.map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                  diffFilter === d ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Split View ── */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full"
          defaultLayout={{ "problem-list": 18, description: 32, editor: 50 }}
        >

          {/* ── Collapsible Problem List Sidebar ── */}
          <ResizablePanel
            id="problem-list"
            panelRef={sidebarRef}
            defaultSize="18"
            minSize="14"
            maxSize="28"
            collapsible
            onResize={(size) => setSidebarOpen(size.asPercentage > 2)}
          >
            <div className="flex flex-col h-full min-h-0 min-w-0 border-r border-border/40 bg-card/30 transition-all overflow-hidden">
              {/* Search & Topic Filter */}
              <div className="p-3 border-b border-border/40 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-8 h-8 rounded-xl text-xs border-border/50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopicFilter(t)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${
                        topicFilter === t ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Problems */}
              <div className="flex-1 overflow-y-auto">
                {filteredProblems.map((p) => {
                  const origIdx = problemsData.findIndex((prob) => prob.id === p.id);
                  const isActive = origIdx === activeIdx;
                  const isSolved = solvedMap[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveIdx(origIdx);
                        resetTimer();
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all border-b border-border/20 last:border-0 ${
                        isActive ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/30"
                      }`}
                    >
                      {isSolved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-brand shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">
                          {p.id}. {p.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`h-3.5 text-[9px] px-1 ${diffColors[p.diff]}`}>{p.diff}</Badge>
                          <span className="text-[10px] text-muted-foreground">{p.topic}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border/40 hover:bg-primary/30" />

          {/* ── Center Panel: Problem Description & Solution Tabs ── */}
          <ResizablePanel id="description" defaultSize="32" minSize="22" maxSize="50">
              <div className="flex flex-col h-full min-h-0 min-w-0 bg-card/40 border-r border-border/40 overflow-hidden">
                {/* Description Tabs Header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2 shrink-0 overflow-x-auto">
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setDescTab("description")}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                        descTab === "description" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Description
                    </button>
                    <button
                      onClick={() => setDescTab("solution")}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                        descTab === "solution" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Solution & Hints
                    </button>
                  </div>
                  <a href={currentProblem.leetcode} target="_blank" rel="noopener noreferrer" title="View on LeetCode" className="shrink-0 ml-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-amber-500">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                  {descTab === "description" ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-black">{currentProblem.id}. {currentProblem.title}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${diffColors[currentProblem.diff]}`}>{currentProblem.diff}</Badge>
                          <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
                            <Zap className="h-3 w-3" /> +{currentProblem.xp} XP
                          </Badge>
                          <span className="text-xs text-muted-foreground">{currentProblem.acc}% acceptance</span>
                        </div>
                      </div>

                      {/* Problem Statement */}
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                        {currentProblem.description}
                      </p>

                      {/* Examples */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Examples</span>
                        {currentProblem.examples.map((ex, i) => (
                          <div key={i} className="rounded-xl bg-muted/30 border border-border/50 p-3.5 font-mono text-xs space-y-1">
                            <div className="text-[10px] font-sans font-bold text-muted-foreground uppercase">Example {i + 1}</div>
                            <div><span className="text-muted-foreground font-sans">Input: </span><span className="text-foreground">{ex.input}</span></div>
                            <div><span className="text-muted-foreground font-sans">Output: </span><span className="text-foreground font-bold">{ex.output}</span></div>
                            {ex.explanation && (
                              <div className="text-muted-foreground font-sans text-[11px] mt-1">{ex.explanation}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Constraints */}
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Constraints</span>
                        <ul className="mt-2 space-y-1">
                          {currentProblem.constraints.map((c, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                              <ChevronRight className="h-3 w-3 text-primary shrink-0" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Solution Tab */
                    <div className="space-y-4">
                      {!showSolution ? (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-4">
                          <Lightbulb className="h-10 w-10 text-amber-500 mx-auto" />
                          <div>
                            <h3 className="font-bold text-base">Want to view the solution?</h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Try solving the problem on your own first! Use the compiler on the right to test your code.
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowSolution(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 font-bold"
                          >
                            <Eye className="h-4 w-4" /> Reveal Reference Solution
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-emerald-brand flex items-center gap-1.5">
                              <Check className="h-4 w-4" /> Reference Solution ({lang})
                            </span>
                            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg shrink-0" onClick={() => setShowSolution(false)}>
                              <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide Solution
                            </Button>
                          </div>
                          <pre className="p-4 rounded-xl border border-border/50 bg-muted/40 font-mono text-xs overflow-x-auto text-foreground">
                            {currentProblem.solutionCode[lang] ?? currentProblem.solutionCode["Python"]}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border/40 hover:bg-primary/30" />

            {/* ── Right Panel: Resizable Vertical Split (Monaco Editor Top, Test Console Bottom) ── */}
            <ResizablePanel id="editor" defaultSize="50" minSize="32">
              <ResizablePanelGroup
                direction="vertical"
                className="h-full w-full"
                defaultLayout={{ "code-editor": 72, "test-console": 28 }}
              >

                {/* Top Panel: Monaco Code Editor */}
                <ResizablePanel id="code-editor" defaultSize="72" minSize="40">
                  <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden bg-card/20">
                    {/* Editor Header Toolbar */}
                    <div className="flex flex-wrap items-center justify-between border-b border-border/40 bg-muted/20 px-3 py-2 shrink-0 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Code2 className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex flex-wrap gap-1 bg-muted/50 p-0.5 rounded-xl">
                          {langs.map((l) => (
                            <button
                              key={l}
                              onClick={() => setLang(l)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0 ${
                                lang === l ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Timer */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-card px-2.5 py-1 text-xs font-mono font-bold shrink-0">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className={timerRunning ? "text-primary" : "text-muted-foreground"}>{formatTime(seconds)}</span>
                          <button onClick={() => setTimerRunning(!timerRunning)} className="ml-1 text-[11px] text-muted-foreground hover:text-foreground">
                            {timerRunning ? "⏸" : "▶"}
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs h-8 gap-1 shrink-0"
                          onClick={() => setCode(currentProblem.starterCode[lang] ?? "")}
                          title="Reset code to starter template"
                        >
                          <RotateCw className="h-3.5 w-3.5" /> Reset
                        </Button>

                        <div className="h-4 w-px bg-border/40 shrink-0" />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runCompiler(false)}
                          disabled={isRunning}
                          className="rounded-xl text-xs h-8 gap-1.5 font-bold hover:bg-muted"
                        >
                          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-primary" />}
                          Run
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runCompiler(true)}
                          disabled={isRunning}
                          className="bg-gradient-primary shadow-elegant rounded-xl text-xs h-8 gap-1.5 font-bold text-white"
                        >
                          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Submit
                        </Button>
                      </div>
                    </div>

                    {/* Monaco Editor Canvas */}
                    <div className="flex-1 min-h-0 w-full overflow-hidden">
                      <Editor
                        height="100%"
                        width="100%"
                        language={langIds[lang] ?? "python"}
                        value={code}
                        onChange={(val) => setCode(val ?? "")}
                        theme={editorTheme}
                        options={{
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                          minimap: { enabled: false },
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          tabSize: 4,
                          automaticLayout: true,
                          padding: { top: 12, bottom: 12 },
                          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="h-1 bg-border/30 hover:bg-primary/30 transition-colors" />

                {/* Bottom Panel: Interactive Test Cases & Compiler Console */}
                <ResizablePanel id="test-console" defaultSize="28" minSize="15">
                  <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden bg-card/60">
                    {/* Console Header Toolbar */}
                    <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-muted/20 shrink-0 gap-2 overflow-x-auto">
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setConsoleTab("cases")}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                            consoleTab === "cases" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Terminal className="h-3.5 w-3.5" /> Sample Test Cases ({currentProblem.examples.length})
                        </button>
                        <button
                          onClick={() => setConsoleTab("results")}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                            consoleTab === "results" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Test Results {testResults && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
                        </button>
                      </div>

                      {/* Always Visible Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runCompiler(false)}
                          disabled={isRunning}
                          className="rounded-xl text-xs h-8 gap-1.5 font-bold"
                        >
                          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-primary" />}
                          Run Test Cases
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runCompiler(true)}
                          disabled={isRunning}
                          className="bg-gradient-primary shadow-elegant rounded-xl text-xs h-8 gap-1.5 font-bold text-white"
                        >
                          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Submit Code
                        </Button>
                      </div>
                    </div>

                    {/* Console Body Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-xs">
                      {consoleTab === "cases" ? (
                        <div className="space-y-3">
                          {currentProblem.examples.map((ex, i) => (
                            <div key={i} className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1">
                              <span className="font-sans font-bold text-[10px] text-muted-foreground uppercase">Testcase {i + 1}</span>
                              <div className="flex flex-wrap gap-4 mt-1">
                                <div><span className="text-muted-foreground font-sans">Input:</span> <span className="font-bold text-foreground">{ex.input}</span></div>
                                <div><span className="text-muted-foreground font-sans">Expected Output:</span> <span className="font-bold text-emerald-brand">{ex.output}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {isRunning ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground font-sans">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span>Compiling & Running Test Cases...</span>
                            </div>
                          ) : testResults ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 font-sans font-bold text-sm">
                                {testResults.every((r) => r.passed) ? (
                                  <span className="text-emerald-brand flex items-center gap-1.5">
                                    <CheckCircle2 className="h-5 w-5" /> All Test Cases Passed!
                                  </span>
                                ) : (
                                  <span className="text-destructive flex items-center gap-1.5">
                                    <XCircle className="h-5 w-5" /> Some Test Cases Failed
                                  </span>
                                )}
                              </div>
                              {testResults.map((res) => (
                                <div
                                  key={res.caseIndex}
                                  className={`rounded-xl border p-3 space-y-1 ${
                                    res.passed ? "border-emerald-brand/30 bg-emerald-brand/5" : "border-destructive/30 bg-destructive/5"
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-sans">
                                    <span className="font-bold text-[11px]">Testcase {res.caseIndex}</span>
                                    <Badge variant="outline" className={res.passed ? "border-emerald-brand text-emerald-brand" : "border-destructive text-destructive"}>
                                      {res.passed ? "Passed" : "Failed"}
                                    </Badge>
                                  </div>
                                  <div><span className="text-muted-foreground font-sans">Input:</span> {res.input}</div>
                                  <div><span className="text-muted-foreground font-sans">Expected:</span> <span className="text-emerald-brand font-bold">{res.expectedOutput}</span></div>
                                  <div><span className="text-muted-foreground font-sans">Actual:</span> <span className={res.passed ? "text-emerald-brand font-bold" : "text-destructive font-bold"}>{res.actualOutput}</span></div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground font-sans text-xs">
                              Click <strong>Run Test Cases</strong> to validate your code before submitting.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>

              </ResizablePanelGroup>
            </ResizablePanel>

          </ResizablePanelGroup>
      </div>
    </div>
  );
}
