import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_app/practice")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: search.id ? Number(search.id) : (search.problemId ? Number(search.problemId) : undefined),
    topic: typeof search.topic === "string" ? search.topic : undefined,
  }),
  component: Practice,
});

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
  {
    id: 5, title: "Maximum Subarray", diff: "Medium", topic: "Dynamic Programming", tags: ["Amazon", "Apple", "Microsoft"],
    acc: 77, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/maximum-subarray/",
    neetcode: "https://neetcode.io/problems/maximum-subarray",
    xp: 100,
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum (Kadane's Algorithm).",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum 6." }
    ],
    constraints: ["1 <= nums.length <= 10⁵"],
    starterCode: {
      Python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass`,
      JavaScript: `var maxSubArray = function(nums) {\n};`,
      Java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
      Go: `func maxSubArray(nums []int) int {\n    return 0\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        max_sum = cur = nums[0]\n        for n in nums[1:]:\n            cur = max(n, cur + n)\n            max_sum = max(max_sum, cur)\n        return max_sum`,
      JavaScript: `var maxSubArray = function(nums) {\n    let max = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n};`,
      Java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int max = nums[0], cur = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            max = Math.max(max, cur);\n        }\n        return max;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int mx = nums[0], cur = nums[0];\n        for (int i = 1; i < nums.size(); i++) { cur = max(nums[i], cur + nums[i]); mx = max(mx, cur); }\n        return mx;\n    }\n};`,
      Go: `func maxSubArray(nums []int) int {\n    mx, cur := nums[0], nums[0]\n    for _, n := range nums[1:] {\n        if cur+n > n { cur = cur+n } else { cur = n }\n        if cur > mx { mx = cur }\n    }\n    return mx\n}`,
    },
  },
  {
    id: 6, title: "Best Time to Buy and Sell Stock", diff: "Easy", topic: "Arrays", tags: ["Amazon", "Facebook"],
    acc: 83, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    neetcode: "https://neetcode.io/problems/buy-and-sell-crypto",
    xp: 50,
    description: "Given an array `prices` where `prices[i]` is the price of a given stock on day `i`, return the maximum profit you can achieve.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy day 2 (1) and sell day 5 (6), profit = 5." }
    ],
    constraints: ["1 <= prices.length <= 10⁵"],
    starterCode: {
      Python: `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        pass`,
      JavaScript: `var maxProfit = function(prices) {\n};`,
      Java: `class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};`,
      Go: `func maxProfit(prices []int) int {\n    return 0\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_p, max_p = float('inf'), 0\n        for p in prices:\n            min_p = min(min_p, p)\n            max_p = max(max_p, p - min_p)\n        return max_p`,
      JavaScript: `var maxProfit = function(prices) {\n    let min = Infinity, max = 0;\n    for (const p of prices) { min = Math.min(min, p); max = Math.max(max, p - min); }\n    return max;\n};`,
      Java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int min = Integer.MAX_VALUE, max = 0;\n        for (int p : prices) { min = Math.min(min, p); max = Math.max(max, p - min); }\n        return max;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int mn = INT_MAX, mx = 0;\n        for (int p : prices) { mn = min(mn, p); mx = max(mx, p - mn); }\n        return mx;\n    }\n};`,
      Go: `func maxProfit(prices []int) int {\n    mn, mx := 1<<31, 0\n    for _, p := range prices { if p < mn { mn = p }; if p - mn > mx { mx = p - mn } }\n    return mx\n}`,
    },
  },
  {
    id: 7, title: "Climbing Stairs", diff: "Easy", topic: "Dynamic Programming", tags: ["Amazon", "Google"],
    acc: 87, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/climbing-stairs/",
    neetcode: "https://neetcode.io/problems/climbing-stairs",
    xp: 50,
    description: "You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, or 2+1." }
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      Python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass`,
      JavaScript: `var climbStairs = function(n) {\n};`,
      Java: `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};`,
      Go: `func climbStairs(n int) int {\n    return 0\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        a, b = 1, 2\n        for _ in range(2, n): a, b = b, a + b\n        return b`,
      JavaScript: `var climbStairs = function(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 2; i < n; i++) [a, b] = [b, a + b];\n    return b;\n};`,
      Java: `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 2; i < n; i++) { int t = a + b; a = b; b = t; }\n        return b;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 2; i < n; i++) { int t = a + b; a = b; b = t; }\n        return b;\n    }\n};`,
      Go: `func climbStairs(n int) int {\n    if n <= 2 { return n }\n    a, b := 1, 2\n    for i := 2; i < n; i++ { a, b = b, a + b }\n    return b\n}`,
    },
  },
  {
    id: 8, title: "Merge Two Sorted Lists", diff: "Easy", topic: "Linked Lists", tags: ["Amazon", "Microsoft"],
    acc: 90, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/merge-two-sorted-lists/",
    neetcode: "https://neetcode.io/problems/merge-two-sorted-linked-lists",
    xp: 50,
    description: "Merge two sorted linked lists and return the head of the merged list.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merged in non-decreasing order." }
    ],
    constraints: ["0 <= nodes <= 50"],
    starterCode: {
      Python: `class Solution:\n    def mergeTwoLists(self, l1, l2):\n        pass`,
      JavaScript: `var mergeTwoLists = function(l1, l2) {\n};`,
      Java: `class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        return null;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n        return nullptr;\n    }\n};`,
      Go: `func mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {\n    return nil\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def mergeTwoLists(self, l1, l2):\n        dummy = ListNode(); cur = dummy\n        while l1 and l2:\n            if l1.val <= l2.val: cur.next = l1; l1 = l1.next\n            else: cur.next = l2; l2 = l2.next\n            cur = cur.next\n        cur.next = l1 or l2\n        return dummy.next`,
      JavaScript: `var mergeTwoLists = function(l1, l2) {\n    const dummy = new ListNode(); let cur = dummy;\n    while (l1 && l2) {\n        if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n        else { cur.next = l2; l2 = l2.next; }\n        cur = cur.next;\n    }\n    cur.next = l1 ?? l2; return dummy.next;\n};`,
      Java: `class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        ListNode dummy = new ListNode(), cur = dummy;\n        while (l1 != null && l2 != null) {\n            if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n            else { cur.next = l2; l2 = l2.next; }\n            cur = cur.next;\n        }\n        cur.next = (l1 != null) ? l1 : l2; return dummy.next;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n        ListNode dummy, *cur = &dummy;\n        while (l1 && l2) {\n            if (l1->val <= l2->val) { cur->next = l1; l1 = l1->next; }\n            else { cur->next = l2; l2 = l2->next; }\n            cur = cur->next;\n        }\n        cur->next = l1 ? l1 : l2; return dummy.next;\n    }\n};`,
      Go: `func mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {\n    dummy := &ListNode{}; cur := dummy\n    for l1 != nil && l2 != nil {\n        if l1.Val <= l2.Val { cur.Next = l1; l1 = l1.Next } else { cur.Next = l2; l2 = l2.Next }\n        cur = cur.Next\n    }\n    if l1 != nil { cur.Next = l1 } else { cur.Next = l2 }\n    return dummy.Next\n}`,
    },
  },
  {
    id: 9, title: "Valid Parentheses", diff: "Easy", topic: "Stacks", tags: ["Amazon", "Google", "Facebook"],
    acc: 80, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/valid-parentheses/",
    neetcode: "https://neetcode.io/problems/validate-parentheses",
    xp: 50,
    description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.",
    examples: [
      { input: 's = "()[]{}"', output: "true", explanation: "Matching brackets closed in correct order." }
    ],
    constraints: ["1 <= s.length <= 10⁴"],
    starterCode: {
      Python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        pass`,
      JavaScript: `var isValid = function(s) {\n};`,
      Java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
      Go: `func isValid(s string) bool {\n    return false\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', ']': '[', '}': '{'}\n        for c in s:\n            if c in mapping:\n                if not stack or stack[-1] != mapping[c]: return False\n                stack.pop()\n            else: stack.append(c)\n        return not stack`,
      JavaScript: `var isValid = function(s) {\n    const stack = []; const m = {')':'(', ']':'[', '}':'{'};\n    for (const c of s) {\n        if (c in m) { if (stack.pop() !== m[c]) return false; }\n        else stack.push(c);\n    }\n    return !stack.length;\n};`,
      Java: `class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == ')') { if (stack.isEmpty() || stack.pop() != '(') return false; }\n            else if (c == ']') { if (stack.isEmpty() || stack.pop() != '[') return false; }\n            else if (c == '}') { if (stack.isEmpty() || stack.pop() != '{') return false; }\n            else stack.push(c);\n        }\n        return stack.isEmpty();\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == ')') { if (st.empty() || st.top() != '(') return false; st.pop(); }\n            else if (c == ']') { if (st.empty() || st.top() != '[') return false; st.pop(); }\n            else if (c == '}') { if (st.empty() || st.top() != '{') return false; st.pop(); }\n            else st.push(c);\n        }\n        return st.empty();\n    }\n};`,
      Go: `func isValid(s string) bool {\n    stack := []rune{}\n    for _, c := range s {\n        switch c {\n        case '(', '[', '{': stack = append(stack, c)\n        case ')': if len(stack)==0 || stack[len(stack)-1]!='(' { return false }; stack = stack[:len(stack)-1]\n        case ']': if len(stack)==0 || stack[len(stack)-1]!='[' { return false }; stack = stack[:len(stack)-1]\n        case '}': if len(stack)==0 || stack[len(stack)-1]!='{' { return false }; stack = stack[:len(stack)-1]\n        }\n    }\n    return len(stack) == 0\n}`,
    },
  },
  {
    id: 10, title: "Number of Islands", diff: "Medium", topic: "Graphs", tags: ["Amazon", "Google"],
    acc: 72, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/number-of-islands/",
    neetcode: "https://neetcode.io/problems/count-number-of-islands",
    xp: 100,
    description: "Given an `m x n` 2D grid of `1`s (land) and `0`s (water), return the number of islands.",
    examples: [
      { input: 'grid = [["1","1","0"],["0","1","0"]]', output: "1", explanation: "1 island." }
    ],
    constraints: ["1 <= m, n <= 300"],
    starterCode: {
      Python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        pass`,
      JavaScript: `var numIslands = function(grid) {\n};`,
      Java: `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};`,
      Go: `func numIslands(grid [][]byte) int {\n    return 0\n}`,
    },
    solutionCode: {
      Python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        count = 0\n        def dfs(r, c):\n            if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]) or grid[r][c] != '1': return\n            grid[r][c] = '0'\n            for dr, dc in [(0,1), (0,-1), (1,0), (-1,0)]: dfs(r + dr, c + dc)\n        for r in range(len(grid)):\n            for c in range(len(grid[0])):\n                if grid[r][c] == '1': count += 1; dfs(r, c)\n        return count`,
      JavaScript: `var numIslands = function(grid) {\n    let count = 0;\n    const dfs = (r, c) => {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => dfs(r + dr, c + dc));\n    };\n    for (let r = 0; r < grid.length; r++)\n        for (let c = 0; c < grid[0].length; c++)\n            if (grid[r][c] === '1') { count++; dfs(r, c); }\n    return count;\n};`,
      Java: `class Solution {\n    public int numIslands(char[][] g) {\n        int count = 0;\n        for (int r = 0; r < g.length; r++)\n            for (int c = 0; c < g[0].length; c++)\n                if (g[r][c] == '1') { count++; dfs(g, r, c); }\n        return count;\n    }\n    void dfs(char[][] g, int r, int c) {\n        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& g) {\n        int count = 0;\n        for (int r = 0; r < g.size(); r++)\n            for (int c = 0; c < g[0].size(); c++)\n                if (g[r][c] == '1') { count++; dfs(g, r, c); }\n        return count;\n    }\n    void dfs(vector<vector<char>>& g, int r, int c) {\n        if (r < 0 || r >= (int)g.size() || c < 0 || c >= (int)g[0].size() || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);\n    }\n};`,
      Go: `func numIslands(grid [][]byte) int {\n    count := 0\n    var dfs func(r, c int)\n    dfs = func(r, c int) {\n        if r < 0 || r >= len(grid) || c < 0 || c >= len(grid[0]) || grid[r][c] != '1' { return }\n        grid[r][c] = '0'\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n    }\n    for r := range grid { for c := range grid[0] { if grid[r][c] == '1' { count++; dfs(r, c) } } }\n    return count\n}`,
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
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Layout & sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang] = useState("Python");
  const [query, setQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");

  // Sync search parameter with active problem index and topic filter
  useEffect(() => {
    if (search.id) {
      const foundIdx = problemsData.findIndex((p) => p.id === search.id);
      if (foundIdx !== -1) {
        setActiveIdx(foundIdx);
      }
    } else if (search.topic) {
      setTopicFilter(search.topic);
      const foundIdx = problemsData.findIndex((p) => p.topic.toLowerCase().includes(search.topic!.toLowerCase()));
      if (foundIdx !== -1) {
        setActiveIdx(foundIdx);
      }
    }
  }, [search.id, search.topic]);

  const selectProblem = useCallback((idx: number) => {
    setActiveIdx(idx);
    const prob = problemsData[idx];
    if (prob) {
      navigate({ to: "/practice", search: { id: prob.id } });
    }
  }, [navigate]);

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
                        selectProblem(origIdx);
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
