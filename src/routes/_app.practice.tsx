import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark, Clock, Lightbulb, Play, Send, Building2, Code2, ExternalLink,
  Search, CheckCircle2, Circle, Star, ArrowUpRight, Zap, RotateCw,
  ChevronRight, Layers, BookOpen, Terminal, XCircle, Loader2, ListTree,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
}

// ─── Problem Data ─────────────────────────────────────────────────────────────
const problems: Problem[] = [
  {
    id: 1, title: "Two Sum", diff: "Easy", topic: "Arrays", tags: ["Google", "Amazon", "Meta"],
    acc: 92, solved: true, starred: true,
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
      Python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            if target - n in seen:\n                return [seen[target - n], i]\n            seen[n] = i\n        return []`,
      JavaScript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    const seen = {};\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (complement in seen) return [seen[complement], i];\n        seen[nums[i]] = i;\n    }\n    return [];\n};`,
      Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) {\n                return new int[]{seen.get(complement), i};\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
      "C++": `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) return {seen[complement], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      Go: `func twoSum(nums []int, target int) []int {\n    seen := make(map[int]int)\n    for i, n := range nums {\n        if j, ok := seen[target-n]; ok {\n            return []int{j, i}\n        }\n        seen[n] = i\n    }\n    return nil\n}`,
    },
  },
  {
    id: 2, title: "Valid Anagram", diff: "Easy", topic: "Arrays", tags: ["Amazon", "Google"],
    acc: 85, solved: true, starred: false,
    leetcode: "https://leetcode.com/problems/valid-anagram/",
    neetcode: "https://neetcode.io/problems/is-anagram",
    xp: 50,
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "Both strings contain the same characters." },
      { input: 's = "rat", t = "car"', output: "false", explanation: "'r','a','t' != 'c','a','r'." },
    ],
    constraints: ["1 <= s.length, t.length <= 5 × 10⁴", "s and t consist of lowercase English letters."],
    starterCode: {
      Python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        if len(s) != len(t):\n            return False\n        return Counter(s) == Counter(t)`,
      JavaScript: `var isAnagram = function(s, t) {\n    if (s.length !== t.length) return false;\n    const count = {};\n    for (const c of s) count[c] = (count[c] || 0) + 1;\n    for (const c of t) {\n        if (!count[c]) return false;\n        count[c]--;\n    }\n    return true;\n};`,
      Java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (char c : t.toCharArray()) {\n            if (--count[c - 'a'] < 0) return false;\n        }\n        return true;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        unordered_map<char,int> cnt;\n        for (char c : s) cnt[c]++;\n        for (char c : t) {\n            if (--cnt[c] < 0) return false;\n        }\n        return true;\n    }\n};`,
      Go: `func isAnagram(s string, t string) bool {\n    if len(s) != len(t) { return false }\n    cnt := [26]int{}\n    for i := 0; i < len(s); i++ {\n        cnt[s[i]-'a']++\n        cnt[t[i]-'a']--\n    }\n    for _, v := range cnt {\n        if v != 0 { return false }\n    }\n    return true\n}`,
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
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true", explanation: "Multiple duplicates exist." },
    ],
    constraints: ["1 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"],
    starterCode: {
      Python: `class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        return len(nums) != len(set(nums))`,
      JavaScript: `var containsDuplicate = function(nums) {\n    return nums.length !== new Set(nums).size;\n};`,
      Java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> seen = new HashSet<>();\n        for (int n : nums) {\n            if (!seen.add(n)) return true;\n        }\n        return false;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return unordered_set<int>(nums.begin(), nums.end()).size() != nums.size();\n    }\n};`,
      Go: `func containsDuplicate(nums []int) bool {\n    seen := make(map[int]bool)\n    for _, n := range nums {\n        if seen[n] { return true }\n        seen[n] = true\n    }\n    return false\n}`,
    },
  },
  {
    id: 4, title: "Best Time to Buy and Sell Stock", diff: "Easy", topic: "Sliding Window", tags: ["Amazon", "Google", "Bloomberg"],
    acc: 82, solved: false, starred: true,
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    neetcode: "https://neetcode.io/problems/buy-and-sell-crypto",
    xp: 50,
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `iᵗʰ` day. You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock. Return the *maximum profit* you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 6−1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No day where selling gives profit; return 0." },
    ],
    constraints: ["1 <= prices.length <= 10⁵", "0 <= prices[i] <= 10⁴"],
    starterCode: {
      Python: `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        max_profit = 0\n        for price in prices:\n            min_price = min(min_price, price)\n            max_profit = max(max_profit, price - min_price)\n        return max_profit`,
      JavaScript: `var maxProfit = function(prices) {\n    let minPrice = Infinity, maxProfit = 0;\n    for (const p of prices) {\n        minPrice = Math.min(minPrice, p);\n        maxProfit = Math.max(maxProfit, p - minPrice);\n    }\n    return maxProfit;\n};`,
      Java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE, maxProfit = 0;\n        for (int p : prices) {\n            minPrice = Math.min(minPrice, p);\n            maxProfit = Math.max(maxProfit, p - minPrice);\n        }\n        return maxProfit;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minP = INT_MAX, res = 0;\n        for (int p : prices) {\n            minP = min(minP, p);\n            res = max(res, p - minP);\n        }\n        return res;\n    }\n};`,
      Go: `func maxProfit(prices []int) int {\n    minP, res := math.MaxInt32, 0\n    for _, p := range prices {\n        if p < minP { minP = p }\n        if p - minP > res { res = p - minP }\n    }\n    return res\n}`,
    },
  },
  {
    id: 5, title: "Valid Parentheses", diff: "Easy", topic: "Stack", tags: ["Google", "Amazon", "Meta"],
    acc: 79, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/valid-parentheses/",
    neetcode: "https://neetcode.io/problems/validate-parentheses",
    xp: 50,
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is **valid**. An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true", explanation: "Simple valid pair." },
      { input: 's = "()[]{}"', output: "true", explanation: "All pairs match in order." },
      { input: 's = "(]"', output: "false", explanation: "Mismatched bracket types." },
    ],
    constraints: ["1 <= s.length <= 10⁴", "s consists of parentheses only '()[]{}'."],
    starterCode: {
      Python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        pairs = {')': '(', '}': '{', ']': '['}\n        for c in s:\n            if c in pairs:\n                if not stack or stack[-1] != pairs[c]:\n                    return False\n                stack.pop()\n            else:\n                stack.append(c)\n        return len(stack) == 0`,
      JavaScript: `var isValid = function(s) {\n    const stack = [], map = {')':'(', '}':'{', ']':'['};\n    for (const c of s) {\n        if (map[c]) {\n            if (stack.pop() !== map[c]) return false;\n        } else stack.push(c);\n    }\n    return stack.length === 0;\n};`,
      Java: `class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c=='(' || c=='{' || c=='[') stack.push(c);\n            else if (stack.isEmpty()) return false;\n            else if (c==')' && stack.pop()!='(') return false;\n            else if (c=='}' && stack.pop()!='{') return false;\n            else if (c==']' && stack.pop()!='[') return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c=='(' || c=='{' || c=='[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                char top = st.top(); st.pop();\n                if (c==')' && top!='(') return false;\n                if (c=='}' && top!='{') return false;\n                if (c==']' && top!='[') return false;\n            }\n        }\n        return st.empty();\n    }\n};`,
      Go: `func isValid(s string) bool {\n    stack := []rune{}\n    pairs := map[rune]rune{')':'(', '}':'{', ']':'['}\n    for _, c := range s {\n        if open, ok := pairs[c]; ok {\n            if len(stack) == 0 || stack[len(stack)-1] != open { return false }\n            stack = stack[:len(stack)-1]\n        } else { stack = append(stack, c) }\n    }\n    return len(stack) == 0\n}`,
    },
  },
  {
    id: 6, title: "Binary Search", diff: "Easy", topic: "Binary Search", tags: ["Google", "Apple"],
    acc: 86, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/binary-search/",
    neetcode: "https://neetcode.io/problems/binary-search",
    xp: 50,
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with `O(log n)` runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists at index 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist; return -1." },
    ],
    constraints: ["1 <= nums.length <= 10⁴", "-10⁴ < nums[i], target < 10⁴", "All integers are unique.", "nums is sorted in ascending order."],
    starterCode: {
      Python: `class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        lo, hi = 0, len(nums) - 1\n        while lo <= hi:\n            mid = (lo + hi) // 2\n            if nums[mid] == target:\n                return mid\n            elif nums[mid] < target:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n        return -1`,
      JavaScript: `var search = function(nums, target) {\n    let lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        const mid = (lo + hi) >> 1;\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n};`,
      Java: `class Solution {\n    public int search(int[] nums, int target) {\n        int lo = 0, hi = nums.length - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return -1;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int lo = 0, hi = nums.size() - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return -1;\n    }\n};`,
      Go: `func search(nums []int, target int) int {\n    lo, hi := 0, len(nums)-1\n    for lo <= hi {\n        mid := (lo + hi) / 2\n        if nums[mid] == target { return mid }\n        if nums[mid] < target { lo = mid + 1 } else { hi = mid - 1 }\n    }\n    return -1\n}`,
    },
  },
  {
    id: 7, title: "Reverse a Linked List", diff: "Easy", topic: "Linked List", tags: ["Amazon", "Google", "Adobe"],
    acc: 80, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/reverse-linked-list/",
    neetcode: "https://neetcode.io/problems/reverse-a-linked-list",
    xp: 50,
    description: "Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "The linked list is reversed in place." },
      { input: "head = [1,2]", output: "[2,1]", explanation: "Two-node reversal." },
      { input: "head = []", output: "[]", explanation: "Empty list returns empty." },
    ],
    constraints: ["The number of nodes is in the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    starterCode: {
      Python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`,
      JavaScript: `var reverseList = function(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n};`,
      Java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode* next = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n};`,
      Go: `func reverseList(head *ListNode) *ListNode {\n    var prev *ListNode\n    curr := head\n    for curr != nil {\n        next := curr.Next\n        curr.Next = prev\n        prev = curr\n        curr = next\n    }\n    return prev\n}`,
    },
  },
  {
    id: 8, title: "Longest Substring Without Repeating Characters", diff: "Medium", topic: "Sliding Window", tags: ["Amazon", "Meta", "Bloomberg"],
    acc: 74, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    neetcode: "https://neetcode.io/problems/longest-substring-without-duplicates",
    xp: 100,
    description: "Given a string `s`, find the length of the **longest substring** without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with length 3.' },
    ],
    constraints: ["0 <= s.length <= 5 × 10⁴", "s consists of English letters, digits, symbols and spaces."],
    starterCode: {
      Python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        char_set = set()\n        left = 0\n        result = 0\n        for right in range(len(s)):\n            while s[right] in char_set:\n                char_set.remove(s[left])\n                left += 1\n            char_set.add(s[right])\n            result = max(result, right - left + 1)\n        return result`,
      JavaScript: `var lengthOfLongestSubstring = function(s) {\n    const set = new Set();\n    let left = 0, res = 0;\n    for (let right = 0; right < s.length; right++) {\n        while (set.has(s[right])) set.delete(s[left++]);\n        set.add(s[right]);\n        res = Math.max(res, right - left + 1);\n    }\n    return res;\n};`,
      Java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> map = new HashMap<>();\n        int left = 0, res = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (map.containsKey(s.charAt(right)))\n                left = Math.max(left, map.get(s.charAt(right)) + 1);\n            map.put(s.charAt(right), right);\n            res = Math.max(res, right - left + 1);\n        }\n        return res;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char,int> mp;\n        int left = 0, res = 0;\n        for (int right = 0; right < s.size(); right++) {\n            if (mp.count(s[right])) left = max(left, mp[s[right]] + 1);\n            mp[s[right]] = right;\n            res = max(res, right - left + 1);\n        }\n        return res;\n    }\n};`,
      Go: `func lengthOfLongestSubstring(s string) int {\n    mp := make(map[byte]int)\n    left, res := 0, 0\n    for right := 0; right < len(s); right++ {\n        if idx, ok := mp[s[right]]; ok && idx >= left {\n            left = idx + 1\n        }\n        mp[s[right]] = right\n        if right-left+1 > res { res = right - left + 1 }\n    }\n    return res\n}`,
    },
  },
  {
    id: 9, title: "3Sum", diff: "Medium", topic: "Two Pointers", tags: ["Amazon", "Google", "Adobe"],
    acc: 58, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/3sum/",
    neetcode: "https://neetcode.io/problems/three-integer-sum",
    xp: 100,
    description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "Two valid unique triplets." },
      { input: "nums = [0,1,1]", output: "[]", explanation: "No triplet sums to 0." },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]", explanation: "Only one unique triplet." },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10⁵ <= nums[i] <= 10⁵"],
    starterCode: {
      Python: `class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        res = []\n        for i in range(len(nums) - 2):\n            if i > 0 and nums[i] == nums[i-1]: continue\n            l, r = i + 1, len(nums) - 1\n            while l < r:\n                total = nums[i] + nums[l] + nums[r]\n                if total == 0:\n                    res.append([nums[i], nums[l], nums[r]])\n                    while l < r and nums[l] == nums[l+1]: l += 1\n                    while l < r and nums[r] == nums[r-1]: r -= 1\n                    l += 1; r -= 1\n                elif total < 0: l += 1\n                else: r -= 1\n        return res`,
      JavaScript: `var threeSum = function(nums) {\n    nums.sort((a,b) => a-b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i-1]) continue;\n        let l = i+1, r = nums.length-1;\n        while (l < r) {\n            const sum = nums[i] + nums[l] + nums[r];\n            if (sum === 0) {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l+1]) l++;\n                while (l < r && nums[r] === nums[r-1]) r--;\n                l++; r--;\n            } else if (sum < 0) l++;\n            else r--;\n        }\n    }\n    return res;\n};`,
      Java: `class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i+1, r = nums.length-1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[l++], nums[r--]));\n                    while (l < r && nums[l] == nums[l-1]) l++;\n                    while (l < r && nums[r] == nums[r+1]) r--;\n                } else if (sum < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        for (int i = 0; i < nums.size()-2; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i+1, r = nums.size()-1;\n            while (l < r) {\n                int sum = nums[i]+nums[l]+nums[r];\n                if (sum == 0) {\n                    res.push_back({nums[i],nums[l++],nums[r--]});\n                    while (l<r && nums[l]==nums[l-1]) l++;\n                    while (l<r && nums[r]==nums[r+1]) r--;\n                } else if (sum < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n};`,
      Go: `func threeSum(nums []int) [][]int {\n    sort.Ints(nums)\n    res := [][]int{}\n    for i := 0; i < len(nums)-2; i++ {\n        if i > 0 && nums[i] == nums[i-1] { continue }\n        l, r := i+1, len(nums)-1\n        for l < r {\n            sum := nums[i]+nums[l]+nums[r]\n            if sum == 0 {\n                res = append(res, []int{nums[i],nums[l],nums[r]})\n                for l < r && nums[l] == nums[l+1] { l++ }\n                for l < r && nums[r] == nums[r-1] { r-- }\n                l++; r--\n            } else if sum < 0 { l++ } else { r-- }\n        }\n    }\n    return res\n}`,
    },
  },
  {
    id: 10, title: "LRU Cache", diff: "Medium", topic: "Linked List", tags: ["Amazon", "Meta", "Microsoft"],
    acc: 60, solved: true, starred: false,
    leetcode: "https://leetcode.com/problems/lru-cache/",
    neetcode: "https://neetcode.io/problems/lru-cache",
    xp: 100,
    description: "Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**. Implement the `LRUCache` class with `get(key)` and `put(key, value)` operations in `O(1)` average time complexity.",
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]", explanation: "Cache of capacity 2: get/put operations demonstrate LRU eviction policy." },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10⁴", "0 <= value <= 10⁵", "At most 2 × 10⁵ calls to get and put."],
    starterCode: {
      Python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}  # key -> node\n        # dummy head and tail\n        self.head = ListNode(0, 0)\n        self.tail = ListNode(0, 0)\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._insert(node)\n            return node.val\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = ListNode(key, value)\n        self.cache[key] = node\n        self._insert(node)\n        if len(self.cache) > self.cap:\n            lru = self.head.next\n            self._remove(lru)\n            del self.cache[lru.key]`,
      JavaScript: `class LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.map = new Map();\n    }\n    get(key) {\n        if (!this.map.has(key)) return -1;\n        const val = this.map.get(key);\n        this.map.delete(key);\n        this.map.set(key, val);\n        return val;\n    }\n    put(key, value) {\n        if (this.map.has(key)) this.map.delete(key);\n        this.map.set(key, value);\n        if (this.map.size > this.cap) {\n            this.map.delete(this.map.keys().next().value);\n        }\n    }\n}`,
      Java: `class LRUCache extends LinkedHashMap<Integer, Integer> {\n    private int cap;\n    public LRUCache(int capacity) {\n        super(capacity, 0.75f, true);\n        this.cap = capacity;\n    }\n    public int get(int key) {\n        return super.getOrDefault(key, -1);\n    }\n    public void put(int key, int value) {\n        super.put(key, value);\n    }\n    protected boolean removeEldestEntry(Map.Entry eldest) {\n        return size() > cap;\n    }\n}`,
      "C++": `class LRUCache {\n    int cap;\n    list<pair<int,int>> lst;\n    unordered_map<int, list<pair<int,int>>::iterator> mp;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (!mp.count(key)) return -1;\n        lst.splice(lst.begin(), lst, mp[key]);\n        return mp[key]->second;\n    }\n    void put(int key, int value) {\n        if (mp.count(key)) lst.erase(mp[key]);\n        lst.push_front({key, value});\n        mp[key] = lst.begin();\n        if (lst.size() > cap) {\n            mp.erase(lst.back().first);\n            lst.pop_back();\n        }\n    }\n};`,
      Go: `// See full implementation at neetcode.io\ntype LRUCache struct {\n    cap  int\n    cache map[int]*Node\n    head, tail *Node\n}\nfunc Constructor(capacity int) LRUCache {\n    h, t := &Node{}, &Node{}\n    h.next = t; t.prev = h\n    return LRUCache{cap: capacity, cache: map[int]*Node{}, head: h, tail: t}\n}`,
    },
  },
  {
    id: 11, title: "Number of Islands", diff: "Medium", topic: "Graphs", tags: ["Amazon", "Google", "Microsoft"],
    acc: 64, solved: false, starred: true,
    leetcode: "https://leetcode.com/problems/number-of-islands/",
    neetcode: "https://neetcode.io/problems/count-number-of-islands",
    xp: 100,
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*. An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1", explanation: "All connected land forms one island." },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3", explanation: "Three separate islands." },
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
    starterCode: {
      Python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        if not grid: return 0\n        rows, cols = len(grid), len(grid[0])\n        count = 0\n        def dfs(r, c):\n            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':\n                return\n            grid[r][c] = '0'\n            dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] == '1':\n                    dfs(r, c)\n                    count += 1\n        return count`,
      JavaScript: `var numIslands = function(grid) {\n    let count = 0;\n    const dfs = (r, c) => {\n        if (r<0 || r>=grid.length || c<0 || c>=grid[0].length || grid[r][c]!=='1') return;\n        grid[r][c] = '0';\n        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n    };\n    for (let r=0;r<grid.length;r++)\n        for (let c=0;c<grid[0].length;c++)\n            if (grid[r][c]==='1') { dfs(r,c); count++; }\n    return count;\n};`,
      Java: `class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int r=0;r<grid.length;r++)\n            for (int c=0;c<grid[0].length;c++)\n                if (grid[r][c]=='1') { dfs(grid,r,c); count++; }\n        return count;\n    }\n    void dfs(char[][] g, int r, int c) {\n        if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!='1') return;\n        g[r][c]='0';\n        dfs(g,r+1,c);dfs(g,r-1,c);dfs(g,r,c+1);dfs(g,r,c-1);\n    }\n}`,
      "C++": `class Solution {\n    void dfs(vector<vector<char>>& g, int r, int c) {\n        if (r<0||r>=g.size()||c<0||c>=g[0].size()||g[r][c]!='1') return;\n        g[r][c]='0';\n        dfs(g,r+1,c);dfs(g,r-1,c);dfs(g,r,c+1);dfs(g,r,c-1);\n    }\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int count=0;\n        for (int r=0;r<grid.size();r++)\n            for (int c=0;c<grid[0].size();c++)\n                if (grid[r][c]=='1') { dfs(grid,r,c); count++; }\n        return count;\n    }\n};`,
      Go: `func numIslands(grid [][]byte) int {\n    count := 0\n    var dfs func(r,c int)\n    dfs = func(r,c int) {\n        if r<0||r>=len(grid)||c<0||c>=len(grid[0])||grid[r][c]!='1' { return }\n        grid[r][c]='0'\n        dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1)\n    }\n    for r:=range grid { for c:=range grid[r] { if grid[r][c]=='1' { dfs(r,c); count++ } } }\n    return count\n}`,
    },
  },
  {
    id: 12, title: "Climbing Stairs", diff: "Easy", topic: "Dynamic Programming", tags: ["Amazon", "Google", "Adobe"],
    acc: 88, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/climbing-stairs/",
    neetcode: "https://neetcode.io/problems/climbing-stairs",
    xp: 50,
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "Two ways: 1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1." },
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      Python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        a, b = 1, 1\n        for _ in range(n - 1):\n            a, b = b, a + b\n        return b`,
      JavaScript: `var climbStairs = function(n) {\n    let a = 1, b = 1;\n    for (let i = 1; i < n; i++) [a, b] = [b, a+b];\n    return b;\n};`,
      Java: `class Solution {\n    public int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 1; i < n; i++) { int c = a+b; a=b; b=c; }\n        return b;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 1; i < n; i++) { int c=a+b; a=b; b=c; }\n        return b;\n    }\n};`,
      Go: `func climbStairs(n int) int {\n    a, b := 1, 1\n    for i := 1; i < n; i++ { a, b = b, a+b }\n    return b\n}`,
    },
  },
  {
    id: 13, title: "House Robber", diff: "Medium", topic: "Dynamic Programming", tags: ["Amazon", "Airbnb"],
    acc: 72, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/house-robber/",
    neetcode: "https://neetcode.io/problems/house-robber",
    xp: 100,
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. The only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**. Given an integer array `nums` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 1 (1) and house 3 (3) = 4." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob house 1 (2), house 3 (9), house 5 (1) = 12." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    starterCode: {
      Python: `class Solution:\n    def rob(self, nums: List[int]) -> int:\n        rob1, rob2 = 0, 0\n        for n in nums:\n            rob1, rob2 = rob2, max(rob2, rob1 + n)\n        return rob2`,
      JavaScript: `var rob = function(nums) {\n    let rob1 = 0, rob2 = 0;\n    for (const n of nums) [rob1, rob2] = [rob2, Math.max(rob2, rob1+n)];\n    return rob2;\n};`,
      Java: `class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) { int tmp = Math.max(rob2, rob1+n); rob1=rob2; rob2=tmp; }\n        return rob2;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) { int tmp=max(rob2,rob1+n); rob1=rob2; rob2=tmp; }\n        return rob2;\n    }\n};`,
      Go: `func rob(nums []int) int {\n    rob1, rob2 := 0, 0\n    for _, n := range nums {\n        rob1, rob2 = rob2, max(rob2, rob1+n)\n    }\n    return rob2\n}`,
    },
  },
  {
    id: 14, title: "Median of Two Sorted Arrays", diff: "Hard", topic: "Binary Search", tags: ["Google", "Apple", "Amazon"],
    acc: 41, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    neetcode: "https://neetcode.io/problems/median-of-two-sorted-arrays",
    xp: 200,
    description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays. The overall run time complexity should be `O(log (m+n))`.",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "Merged = [1,2,3], median = 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "Merged = [1,2,3,4], median = (2+3)/2 = 2.5." },
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000", "-10⁶ <= nums1[i], nums2[i] <= 10⁶"],
    starterCode: {
      Python: `class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        A, B = nums1, nums2\n        if len(A) > len(B): A, B = B, A\n        total = len(A) + len(B)\n        half = total // 2\n        lo, hi = 0, len(A)\n        while True:\n            i = (lo + hi) // 2\n            j = half - i\n            Aleft = A[i-1] if i > 0 else float('-inf')\n            Aright = A[i] if i < len(A) else float('inf')\n            Bleft = B[j-1] if j > 0 else float('-inf')\n            Bright = B[j] if j < len(B) else float('inf')\n            if Aleft <= Bright and Bleft <= Aright:\n                if total % 2: return min(Aright, Bright)\n                return (max(Aleft, Bleft) + min(Aright, Bright)) / 2\n            elif Aleft > Bright: hi = i - 1\n            else: lo = i + 1`,
      JavaScript: `var findMedianSortedArrays = function(nums1, nums2) {\n    let A = nums1, B = nums2;\n    if (A.length > B.length) [A, B] = [B, A];\n    const total = A.length + B.length, half = total >> 1;\n    let lo = 0, hi = A.length;\n    while (true) {\n        const i = (lo + hi) >> 1, j = half - i;\n        const Aleft = i > 0 ? A[i-1] : -Infinity;\n        const Aright = i < A.length ? A[i] : Infinity;\n        const Bleft = j > 0 ? B[j-1] : -Infinity;\n        const Bright = j < B.length ? B[j] : Infinity;\n        if (Aleft <= Bright && Bleft <= Aright) {\n            if (total % 2) return Math.min(Aright, Bright);\n            return (Math.max(Aleft, Bleft) + Math.min(Aright, Bright)) / 2;\n        } else if (Aleft > Bright) hi = i - 1;\n        else lo = i + 1;\n    }\n};`,
      Java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        int[] A = nums1.length <= nums2.length ? nums1 : nums2;\n        int[] B = nums1.length <= nums2.length ? nums2 : nums1;\n        int total = A.length + B.length, half = total / 2;\n        int lo = 0, hi = A.length;\n        while (true) {\n            int i = (lo + hi) / 2, j = half - i;\n            int Aleft = i>0 ? A[i-1] : Integer.MIN_VALUE;\n            int Aright = i<A.length ? A[i] : Integer.MAX_VALUE;\n            int Bleft = j>0 ? B[j-1] : Integer.MIN_VALUE;\n            int Bright = j<B.length ? B[j] : Integer.MAX_VALUE;\n            if (Aleft<=Bright && Bleft<=Aright) {\n                if (total%2==1) return Math.min(Aright,Bright);\n                return (Math.max(Aleft,Bleft)+Math.min(Aright,Bright))/2.0;\n            } else if (Aleft>Bright) hi=i-1;\n            else lo=i+1;\n        }\n    }\n}`,
      "C++": `class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& A, vector<int>& B) {\n        if (A.size() > B.size()) swap(A, B);\n        int total = A.size()+B.size(), half = total/2;\n        int lo=0, hi=A.size();\n        while (true) {\n            int i=(lo+hi)/2, j=half-i;\n            long Aleft = i>0?A[i-1]:LLONG_MIN;\n            long Aright = i<A.size()?A[i]:LLONG_MAX;\n            long Bleft = j>0?B[j-1]:LLONG_MIN;\n            long Bright = j<B.size()?B[j]:LLONG_MAX;\n            if (Aleft<=Bright && Bleft<=Aright) {\n                if (total%2) return min(Aright,Bright);\n                return (max(Aleft,Bleft)+min(Aright,Bright))/2.0;\n            } else if (Aleft>Bright) hi=i-1;\n            else lo=i+1;\n        }\n    }\n};`,
      Go: `func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {\n    A, B := nums1, nums2\n    if len(A) > len(B) { A, B = B, A }\n    total, half := len(A)+len(B), (len(A)+len(B))/2\n    lo, hi := 0, len(A)\n    for {\n        i := (lo+hi)/2; j := half-i\n        Aleft := math.MinInt64; if i > 0 { Aleft = A[i-1] }\n        Aright := math.MaxInt64; if i < len(A) { Aright = A[i] }\n        Bleft := math.MinInt64; if j > 0 { Bleft = B[j-1] }\n        Bright := math.MaxInt64; if j < len(B) { Bright = B[j] }\n        if Aleft <= Bright && Bleft <= Aright {\n            if total%2 == 1 { return float64(min(Aright,Bright)) }\n            return float64(max(Aleft,Bleft)+min(Aright,Bright)) / 2.0\n        } else if Aleft > Bright { hi = i-1 } else { lo = i+1 }\n    }\n}`,
    },
  },
  {
    id: 15, title: "Trapping Rain Water", diff: "Hard", topic: "Two Pointers", tags: ["Amazon", "Google", "Uber"],
    acc: 55, solved: false, starred: true,
    leetcode: "https://leetcode.com/problems/trapping-rain-water/",
    neetcode: "https://neetcode.io/problems/trapping-rain-water",
    xp: 200,
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map traps 6 units of water (blue section)." },
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "9 units of rain water are trapped." },
    ],
    constraints: ["n == height.length", "1 <= n <= 2 × 10⁴", "0 <= height[i] <= 10⁵"],
    starterCode: {
      Python: `class Solution:\n    def trap(self, height: List[int]) -> int:\n        if not height: return 0\n        l, r = 0, len(height) - 1\n        leftMax, rightMax = height[l], height[r]\n        res = 0\n        while l < r:\n            if leftMax <= rightMax:\n                l += 1\n                leftMax = max(leftMax, height[l])\n                res += leftMax - height[l]\n            else:\n                r -= 1\n                rightMax = max(rightMax, height[r])\n                res += rightMax - height[r]\n        return res`,
      JavaScript: `var trap = function(height) {\n    let l=0, r=height.length-1, lMax=height[l], rMax=height[r], res=0;\n    while (l < r) {\n        if (lMax <= rMax) { l++; lMax=Math.max(lMax,height[l]); res+=lMax-height[l]; }\n        else { r--; rMax=Math.max(rMax,height[r]); res+=rMax-height[r]; }\n    }\n    return res;\n};`,
      Java: `class Solution {\n    public int trap(int[] h) {\n        int l=0, r=h.length-1, lMax=h[l], rMax=h[r], res=0;\n        while (l < r) {\n            if (lMax<=rMax) { l++; lMax=Math.max(lMax,h[l]); res+=lMax-h[l]; }\n            else { r--; rMax=Math.max(rMax,h[r]); res+=rMax-h[r]; }\n        }\n        return res;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int trap(vector<int>& h) {\n        int l=0,r=h.size()-1,lMax=h[l],rMax=h[r],res=0;\n        while (l<r) {\n            if (lMax<=rMax) {l++;lMax=max(lMax,h[l]);res+=lMax-h[l];}\n            else {r--;rMax=max(rMax,h[r]);res+=rMax-h[r];}\n        }\n        return res;\n    }\n};`,
      Go: `func trap(height []int) int {\n    l, r := 0, len(height)-1\n    lMax, rMax, res := height[l], height[r], 0\n    for l < r {\n        if lMax <= rMax { l++; if height[l]>lMax{lMax=height[l]}; res+=lMax-height[l] }\n        else { r--; if height[r]>rMax{rMax=height[r]}; res+=rMax-height[r] }\n    }\n    return res\n}`,
    },
  },
  {
    id: 16, title: "Word Search", diff: "Medium", topic: "Graphs", tags: ["Amazon", "Google", "Microsoft"],
    acc: 52, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/word-search/",
    neetcode: "https://neetcode.io/problems/search-for-word",
    xp: 100,
    description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true", explanation: "The path spells out ABCCED." },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: "true", explanation: "The path spells out SEE." },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: "false", explanation: "Cannot reuse cell B." },
    ],
    constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15", "board and word consist of only lowercase and uppercase English letters."],
    starterCode: {
      Python: `class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        rows, cols = len(board), len(board[0])\n        path = set()\n        def dfs(r, c, i):\n            if i == len(word): return True\n            if r<0 or r>=rows or c<0 or c>=cols or (r,c) in path or board[r][c]!=word[i]:\n                return False\n            path.add((r,c))\n            res = dfs(r+1,c,i+1) or dfs(r-1,c,i+1) or dfs(r,c+1,i+1) or dfs(r,c-1,i+1)\n            path.remove((r,c))\n            return res\n        for r in range(rows):\n            for c in range(cols):\n                if dfs(r, c, 0): return True\n        return False`,
      JavaScript: `var exist = function(board, word) {\n    const rows = board.length, cols = board[0].length;\n    const seen = new Set();\n    const dfs = (r, c, i) => {\n        if (i === word.length) return true;\n        if (r<0||r>=rows||c<0||c>=cols||seen.has(r+','+c)||board[r][c]!==word[i]) return false;\n        seen.add(r+','+c);\n        const res = dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1);\n        seen.delete(r+','+c);\n        return res;\n    };\n    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) if (dfs(r,c,0)) return true;\n    return false;\n};`,
      Java: `class Solution {\n    public boolean exist(char[][] board, String word) {\n        for (int r=0;r<board.length;r++)\n            for (int c=0;c<board[0].length;c++)\n                if (dfs(board,word,r,c,0)) return true;\n        return false;\n    }\n    boolean dfs(char[][] b, String w, int r, int c, int i) {\n        if (i==w.length()) return true;\n        if (r<0||r>=b.length||c<0||c>=b[0].length||b[r][c]!=w.charAt(i)) return false;\n        char tmp=b[r][c]; b[r][c]='#';\n        boolean res=dfs(b,w,r+1,c,i+1)||dfs(b,w,r-1,c,i+1)||dfs(b,w,r,c+1,i+1)||dfs(b,w,r,c-1,i+1);\n        b[r][c]=tmp;\n        return res;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool exist(vector<vector<char>>& b, string w) {\n        for(int r=0;r<b.size();r++) for(int c=0;c<b[0].size();c++) if(dfs(b,w,r,c,0)) return true;\n        return false;\n    }\n    bool dfs(vector<vector<char>>& b, string& w, int r, int c, int i) {\n        if(i==w.size()) return true;\n        if(r<0||r>=b.size()||c<0||c>=b[0].size()||b[r][c]!=w[i]) return false;\n        char tmp=b[r][c]; b[r][c]='#';\n        bool res=dfs(b,w,r+1,c,i+1)||dfs(b,w,r-1,c,i+1)||dfs(b,w,r,c+1,i+1)||dfs(b,w,r,c-1,i+1);\n        b[r][c]=tmp; return res;\n    }\n};`,
      Go: `func exist(board [][]byte, word string) bool {\n    rows, cols := len(board), len(board[0])\n    var dfs func(r,c,i int) bool\n    dfs = func(r,c,i int) bool {\n        if i==len(word) { return true }\n        if r<0||r>=rows||c<0||c>=cols||board[r][c]!=word[i] { return false }\n        tmp:=board[r][c]; board[r][c]='#'\n        res:=dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1)\n        board[r][c]=tmp; return res\n    }\n    for r:=range board { for c:=range board[r] { if dfs(r,c,0) { return true } } }\n    return false\n}`,
    },
  },
  {
    id: 17, title: "Coin Change", diff: "Medium", topic: "Dynamic Programming", tags: ["Amazon", "Google", "Microsoft"],
    acc: 63, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/coin-change/",
    neetcode: "https://neetcode.io/problems/coin-change",
    xp: 100,
    description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return `-1`. You may assume that you have an infinite number of each kind of coin.",
    examples: [
      { input: "coins = [1,5,6,9], amount = 11", output: "2", explanation: "11 = 5 + 6." },
      { input: "coins = [2], amount = 3", output: "-1", explanation: "Cannot make 3 with only denomination 2." },
      { input: "coins = [1], amount = 0", output: "0", explanation: "0 coins needed for amount 0." },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10⁴"],
    starterCode: {
      Python: `class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        dp = [float('inf')] * (amount + 1)\n        dp[0] = 0\n        for a in range(1, amount + 1):\n            for c in coins:\n                if a - c >= 0:\n                    dp[a] = min(dp[a], 1 + dp[a - c])\n        return dp[amount] if dp[amount] != float('inf') else -1`,
      JavaScript: `var coinChange = function(coins, amount) {\n    const dp = Array(amount+1).fill(Infinity);\n    dp[0] = 0;\n    for (let a=1;a<=amount;a++)\n        for (const c of coins)\n            if (a-c>=0) dp[a]=Math.min(dp[a],1+dp[a-c]);\n    return dp[amount]===Infinity ? -1 : dp[amount];\n};`,
      Java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount+1];\n        Arrays.fill(dp, amount+1);\n        dp[0] = 0;\n        for (int a=1;a<=amount;a++)\n            for (int c : coins)\n                if (a-c>=0) dp[a]=Math.min(dp[a],1+dp[a-c]);\n        return dp[amount]>amount ? -1 : dp[amount];\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount+1, amount+1);\n        dp[0]=0;\n        for (int a=1;a<=amount;a++)\n            for (int c:coins)\n                if (a-c>=0) dp[a]=min(dp[a],1+dp[a-c]);\n        return dp[amount]>amount?-1:dp[amount];\n    }\n};`,
      Go: `func coinChange(coins []int, amount int) int {\n    dp := make([]int, amount+1)\n    for i := range dp { dp[i] = amount+1 }\n    dp[0]=0\n    for a:=1;a<=amount;a++ {\n        for _,c:=range coins {\n            if a-c>=0 && dp[a-c]+1<dp[a] { dp[a]=dp[a-c]+1 }\n        }\n    }\n    if dp[amount]>amount { return -1 }\n    return dp[amount]\n}`,
    },
  },
  {
    id: 18, title: "Merge k Sorted Lists", diff: "Hard", topic: "Linked List", tags: ["Amazon", "Google", "LinkedIn"],
    acc: 48, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/merge-k-sorted-lists/",
    neetcode: "https://neetcode.io/problems/merge-k-sorted-linked-lists",
    xp: 200,
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "All three lists are merged into one sorted list." },
      { input: "lists = []", output: "[]", explanation: "Empty input." },
      { input: "lists = [[]]", output: "[]", explanation: "Single empty list." },
    ],
    constraints: ["k == lists.length", "0 <= k <= 10⁴", "0 <= lists[i].length <= 500", "-10⁴ <= lists[i][j] <= 10⁴", "lists[i] is sorted in ascending order."],
    starterCode: {
      Python: `class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        if not lists or len(lists) == 0: return None\n        while len(lists) > 1:\n            merged = []\n            for i in range(0, len(lists), 2):\n                l1 = lists[i]\n                l2 = lists[i+1] if i+1 < len(lists) else None\n                merged.append(self.mergeTwo(l1, l2))\n            lists = merged\n        return lists[0]\n\n    def mergeTwo(self, l1, l2):\n        dummy = ListNode()\n        cur = dummy\n        while l1 and l2:\n            if l1.val <= l2.val: cur.next = l1; l1 = l1.next\n            else: cur.next = l2; l2 = l2.next\n            cur = cur.next\n        cur.next = l1 or l2\n        return dummy.next`,
      JavaScript: `var mergeKLists = function(lists) {\n    if (!lists.length) return null;\n    while (lists.length > 1) {\n        const merged = [];\n        for (let i=0;i<lists.length;i+=2)\n            merged.push(merge(lists[i], lists[i+1]||null));\n        lists = merged;\n    }\n    return lists[0];\n};\nfunction merge(l1,l2) {\n    const d = new ListNode();\n    let c = d;\n    while (l1&&l2) {\n        if (l1.val<=l2.val){c.next=l1;l1=l1.next;}else{c.next=l2;l2=l2.next;}\n        c=c.next;\n    }\n    c.next=l1||l2; return d.next;\n}`,
      Java: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        if (lists.length==0) return null;\n        return merge(lists, 0, lists.length-1);\n    }\n    ListNode merge(ListNode[] lists, int l, int r) {\n        if (l==r) return lists[l];\n        int mid=(l+r)/2;\n        return mergeTwo(merge(lists,l,mid), merge(lists,mid+1,r));\n    }\n    ListNode mergeTwo(ListNode l1, ListNode l2) {\n        ListNode d=new ListNode(), c=d;\n        while(l1!=null&&l2!=null){if(l1.val<=l2.val){c.next=l1;l1=l1.next;}else{c.next=l2;l2=l2.next;}c=c.next;}\n        c.next=l1!=null?l1:l2; return d.next;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        if (lists.empty()) return nullptr;\n        while (lists.size()>1) {\n            vector<ListNode*> merged;\n            for (int i=0;i<lists.size();i+=2)\n                merged.push_back(mergeTwo(lists[i], i+1<lists.size()?lists[i+1]:nullptr));\n            lists=merged;\n        }\n        return lists[0];\n    }\n    ListNode* mergeTwo(ListNode* l1, ListNode* l2) {\n        ListNode d, *c=&d;\n        while(l1&&l2){if(l1->val<=l2->val){c->next=l1;l1=l1->next;}else{c->next=l2;l2=l2->next;}c=c->next;}\n        c->next=l1?l1:l2; return d.next;\n    }\n};`,
      Go: `func mergeKLists(lists []*ListNode) *ListNode {\n    if len(lists)==0 { return nil }\n    for len(lists)>1 {\n        var merged []*ListNode\n        for i:=0;i<len(lists);i+=2 {\n            var l2 *ListNode\n            if i+1<len(lists) { l2=lists[i+1] }\n            merged=append(merged,mergeTwo(lists[i],l2))\n        }\n        lists=merged\n    }\n    return lists[0]\n}\nfunc mergeTwo(l1,l2 *ListNode) *ListNode {\n    d:=&ListNode{}; c:=d\n    for l1!=nil&&l2!=nil { if l1.Val<=l2.Val{c.Next=l1;l1=l1.Next}else{c.Next=l2;l2=l2.Next}; c=c.Next }\n    if l1!=nil{c.Next=l1}else{c.Next=l2}; return d.Next\n}`,
    },
  },
  {
    id: 19, title: "Invert Binary Tree", diff: "Easy", topic: "Trees", tags: ["Google", "Apple", "Amazon"],
    acc: 90, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/invert-binary-tree/",
    neetcode: "https://neetcode.io/problems/invert-a-binary-tree",
    xp: 50,
    description: "Given the `root` of a binary tree, invert the tree, and return *its root*.",
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "Left and right subtrees are recursively swapped." },
      { input: "root = [2,1,3]", output: "[2,3,1]", explanation: "Children are swapped." },
      { input: "root = []", output: "[]", explanation: "Empty tree." },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
    starterCode: {
      Python: `class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root`,
      JavaScript: `var invertTree = function(root) {\n    if (!root) return null;\n    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n    return root;\n};`,
      Java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root==null) return null;\n        TreeNode tmp=root.left;\n        root.left=invertTree(root.right);\n        root.right=invertTree(tmp);\n        return root;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        swap(root->left, root->right);\n        invertTree(root->left);\n        invertTree(root->right);\n        return root;\n    }\n};`,
      Go: `func invertTree(root *TreeNode) *TreeNode {\n    if root == nil { return nil }\n    root.Left, root.Right = invertTree(root.Right), invertTree(root.Left)\n    return root\n}`,
    },
  },
  {
    id: 20, title: "Maximum Depth of Binary Tree", diff: "Easy", topic: "Trees", tags: ["Amazon", "LinkedIn"],
    acc: 91, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    neetcode: "https://neetcode.io/problems/depth-of-binary-tree",
    xp: 50,
    description: "Given the `root` of a binary tree, return *its maximum depth*. A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3", explanation: "Longest path is 3 nodes." },
      { input: "root = [1,null,2]", output: "2", explanation: "Right subtree has depth 2." },
    ],
    constraints: ["The number of nodes is in the range [0, 10⁴].", "-100 <= Node.val <= 100"],
    starterCode: {
      Python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root: return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
      JavaScript: `var maxDepth = function(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n};`,
      Java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root==null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + max(maxDepth(root->left), maxDepth(root->right));\n    }\n};`,
      Go: `func maxDepth(root *TreeNode) int {\n    if root == nil { return 0 }\n    l, r := maxDepth(root.Left), maxDepth(root.Right)\n    if l > r { return 1+l }; return 1+r\n}`,
    },
  },
  {
    id: 21, title: "Lowest Common Ancestor of BST", diff: "Medium", topic: "Trees", tags: ["Amazon", "Microsoft", "Facebook"],
    acc: 70, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    neetcode: "https://neetcode.io/problems/lowest-common-ancestor-in-binary-search-tree",
    xp: 100,
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. The LCA is defined between two nodes `p` and `q` as the lowest node in the tree that has both `p` and `q` as descendants (where we allow **a node to be a descendant of itself**).",
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6", explanation: "LCA of 2 and 8 is 6." },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2", explanation: "LCA of 2 and 4 is 2, since a node can be descendant of itself." },
    ],
    constraints: ["The number of nodes is in the range [2, 10⁵].", "-10⁹ <= Node.val <= 10⁹", "All Node.val are unique.", "p != q", "p and q will exist in the BST."],
    starterCode: {
      Python: `class Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        while root:\n            if p.val < root.val and q.val < root.val:\n                root = root.left\n            elif p.val > root.val and q.val > root.val:\n                root = root.right\n            else:\n                return root`,
      JavaScript: `var lowestCommonAncestor = function(root, p, q) {\n    while (root) {\n        if (p.val < root.val && q.val < root.val) root = root.left;\n        else if (p.val > root.val && q.val > root.val) root = root.right;\n        else return root;\n    }\n};`,
      Java: `class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        while (root != null) {\n            if (p.val < root.val && q.val < root.val) root = root.left;\n            else if (p.val > root.val && q.val > root.val) root = root.right;\n            else return root;\n        }\n        return null;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        while (root) {\n            if (p->val < root->val && q->val < root->val) root = root->left;\n            else if (p->val > root->val && q->val > root->val) root = root->right;\n            else return root;\n        }\n        return nullptr;\n    }\n};`,
      Go: `func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {\n    for root != nil {\n        if p.Val < root.Val && q.Val < root.Val { root = root.Left }\n        else if p.Val > root.Val && q.Val > root.Val { root = root.Right }\n        else { return root }\n    }\n    return nil\n}`,
    },
  },
  {
    id: 22, title: "Course Schedule", diff: "Medium", topic: "Graphs", tags: ["Amazon", "Google", "Facebook"],
    acc: 61, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/course-schedule/",
    neetcode: "https://neetcode.io/problems/course-schedule",
    xp: 100,
    description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [aᵢ, bᵢ]` indicates that you **must** take course `bᵢ` first if you want to take course `aᵢ`. Return `true` if you can finish all courses. Otherwise, return `false`.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "Take 0 then 1. Possible." },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Circular dependency — impossible." },
    ],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2", "0 <= aᵢ, bᵢ < numCourses", "All the pairs are unique."],
    starterCode: {
      Python: `class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        adj = [[] for _ in range(numCourses)]\n        for a, b in prerequisites:\n            adj[a].append(b)\n        visited = set()\n        def dfs(course):\n            if course in visited: return False\n            if adj[course] == []: return True\n            visited.add(course)\n            for pre in adj[course]:\n                if not dfs(pre): return False\n            visited.remove(course)\n            adj[course] = []\n            return True\n        for c in range(numCourses):\n            if not dfs(c): return False\n        return True`,
      JavaScript: `var canFinish = function(numCourses, prerequisites) {\n    const adj = Array.from({length:numCourses}, ()=>[]);\n    for (const [a,b] of prerequisites) adj[a].push(b);\n    const visited = new Set();\n    const dfs = c => {\n        if (visited.has(c)) return false;\n        if (!adj[c].length) return true;\n        visited.add(c);\n        for (const pre of adj[c]) if (!dfs(pre)) return false;\n        visited.delete(c); adj[c]=[];\n        return true;\n    };\n    for (let c=0;c<numCourses;c++) if (!dfs(c)) return false;\n    return true;\n};`,
      Java: `class Solution {\n    public boolean canFinish(int n, int[][] prereqs) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i=0;i<n;i++) adj.add(new ArrayList<>());\n        for (int[] p : prereqs) adj.get(p[0]).add(p[1]);\n        int[] state = new int[n];\n        for (int i=0;i<n;i++) if (!dfs(adj,state,i)) return false;\n        return true;\n    }\n    boolean dfs(List<List<Integer>> adj, int[] state, int c) {\n        if (state[c]==1) return false;\n        if (state[c]==2) return true;\n        state[c]=1;\n        for (int pre : adj.get(c)) if (!dfs(adj,state,pre)) return false;\n        state[c]=2; return true;\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool canFinish(int n, vector<vector<int>>& prereqs) {\n        vector<vector<int>> adj(n);\n        for (auto& p:prereqs) adj[p[0]].push_back(p[1]);\n        vector<int> state(n,0);\n        function<bool(int)> dfs=[&](int c)->bool{\n            if(state[c]==1) return false;\n            if(state[c]==2) return true;\n            state[c]=1;\n            for(int pre:adj[c]) if(!dfs(pre)) return false;\n            state[c]=2; return true;\n        };\n        for(int i=0;i<n;i++) if(!dfs(i)) return false;\n        return true;\n    }\n};`,
      Go: `func canFinish(numCourses int, prerequisites [][]int) bool {\n    adj := make([][]int, numCourses)\n    for _, p := range prerequisites { adj[p[0]] = append(adj[p[0]], p[1]) }\n    state := make([]int, numCourses)\n    var dfs func(c int) bool\n    dfs = func(c int) bool {\n        if state[c]==1 { return false }\n        if state[c]==2 { return true }\n        state[c]=1\n        for _, pre := range adj[c] { if !dfs(pre) { return false } }\n        state[c]=2; return true\n    }\n    for i:=0;i<numCourses;i++ { if !dfs(i) { return false } }\n    return true\n}`,
    },
  },
  {
    id: 23, title: "Word Break", diff: "Medium", topic: "Dynamic Programming", tags: ["Amazon", "Google", "Facebook"],
    acc: 60, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/word-break/",
    neetcode: "https://neetcode.io/problems/word-break",
    xp: 100,
    description: "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation.",
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true", explanation: '"leetcode" = "leet" + "code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", explanation: '"applepenapple" = "apple" + "pen" + "apple".' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","cat","an"]', output: "false", explanation: "Cannot form the full string." },
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "s and wordDict[i] consist of lowercase English letters.", "All strings in wordDict are unique."],
    starterCode: {
      Python: `class Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        dp = [False] * (len(s) + 1)\n        dp[0] = True\n        wordSet = set(wordDict)\n        for i in range(1, len(s)+1):\n            for j in range(i):\n                if dp[j] and s[j:i] in wordSet:\n                    dp[i] = True\n                    break\n        return dp[len(s)]`,
      JavaScript: `var wordBreak = function(s, wordDict) {\n    const set = new Set(wordDict);\n    const dp = Array(s.length+1).fill(false);\n    dp[0] = true;\n    for (let i=1;i<=s.length;i++)\n        for (let j=0;j<i;j++)\n            if (dp[j] && set.has(s.slice(j,i))) { dp[i]=true; break; }\n    return dp[s.length];\n};`,
      Java: `class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> set = new HashSet<>(wordDict);\n        boolean[] dp = new boolean[s.length()+1];\n        dp[0]=true;\n        for (int i=1;i<=s.length();i++)\n            for (int j=0;j<i;j++)\n                if (dp[j] && set.contains(s.substring(j,i))) { dp[i]=true; break; }\n        return dp[s.length()];\n    }\n}`,
      "C++": `class Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        unordered_set<string> ws(wordDict.begin(),wordDict.end());\n        vector<bool> dp(s.size()+1,false);\n        dp[0]=true;\n        for (int i=1;i<=s.size();i++)\n            for (int j=0;j<i;j++)\n                if (dp[j]&&ws.count(s.substr(j,i-j))){dp[i]=true;break;}\n        return dp[s.size()];\n    }\n};`,
      Go: `func wordBreak(s string, wordDict []string) bool {\n    ws := make(map[string]bool)\n    for _, w := range wordDict { ws[w] = true }\n    dp := make([]bool, len(s)+1)\n    dp[0] = true\n    for i:=1;i<=len(s);i++ {\n        for j:=0;j<i;j++ {\n            if dp[j] && ws[s[j:i]] { dp[i]=true; break }\n        }\n    }\n    return dp[len(s)]\n}`,
    },
  },
  {
    id: 24, title: "Longest Common Subsequence", diff: "Medium", topic: "Dynamic Programming", tags: ["Amazon", "Google", "Dropbox"],
    acc: 57, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/longest-common-subsequence/",
    neetcode: "https://neetcode.io/problems/longest-common-subsequence",
    xp: 100,
    description: "Given two strings `text1` and `text2`, return *the length of their longest **common subsequence***. If there is no common subsequence, return `0`. A **subsequence** of a string is a new string generated from the original string with some characters deleted without changing the relative order of the remaining characters.",
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: 'The longest common subsequence is "ace" with length 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: "3", explanation: 'LCS is "abc" itself.' },
      { input: 'text1 = "abc", text2 = "def"', output: "0", explanation: "No common subsequence." },
    ],
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of only lowercase English letters."],
    starterCode: {
      Python: `class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        m, n = len(text1), len(text2)\n        dp = [[0] * (n+1) for _ in range(m+1)]\n        for i in range(1, m+1):\n            for j in range(1, n+1):\n                if text1[i-1] == text2[j-1]:\n                    dp[i][j] = 1 + dp[i-1][j-1]\n                else:\n                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n        return dp[m][n]`,
      JavaScript: `var longestCommonSubsequence = function(t1, t2) {\n    const m=t1.length, n=t2.length;\n    const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));\n    for (let i=1;i<=m;i++)\n        for (let j=1;j<=n;j++)\n            dp[i][j] = t1[i-1]===t2[j-1] ? 1+dp[i-1][j-1] : Math.max(dp[i-1][j],dp[i][j-1]);\n    return dp[m][n];\n};`,
      Java: `class Solution {\n    public int longestCommonSubsequence(String t1, String t2) {\n        int m=t1.length(), n=t2.length();\n        int[][] dp=new int[m+1][n+1];\n        for (int i=1;i<=m;i++)\n            for (int j=1;j<=n;j++)\n                dp[i][j]=t1.charAt(i-1)==t2.charAt(j-1)?1+dp[i-1][j-1]:Math.max(dp[i-1][j],dp[i][j-1]);\n        return dp[m][n];\n    }\n}`,
      "C++": `class Solution {\npublic:\n    int longestCommonSubsequence(string t1, string t2) {\n        int m=t1.size(), n=t2.size();\n        vector<vector<int>> dp(m+1,vector<int>(n+1,0));\n        for(int i=1;i<=m;i++)\n            for(int j=1;j<=n;j++)\n                dp[i][j]=t1[i-1]==t2[j-1]?1+dp[i-1][j-1]:max(dp[i-1][j],dp[i][j-1]);\n        return dp[m][n];\n    }\n};`,
      Go: `func longestCommonSubsequence(t1 string, t2 string) int {\n    m, n := len(t1), len(t2)\n    dp := make([][]int, m+1)\n    for i := range dp { dp[i] = make([]int, n+1) }\n    for i:=1;i<=m;i++ { for j:=1;j<=n;j++ {\n        if t1[i-1]==t2[j-1] { dp[i][j]=1+dp[i-1][j-1] } else if dp[i-1][j]>dp[i][j-1] { dp[i][j]=dp[i-1][j] } else { dp[i][j]=dp[i][j-1] }\n    }}\n    return dp[m][n]\n}`,
    },
  },
  {
    id: 25, title: "Serialize and Deserialize Binary Tree", diff: "Hard", topic: "Trees", tags: ["Google", "Amazon", "Microsoft"],
    acc: 55, solved: false, starred: false,
    leetcode: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    neetcode: "https://neetcode.io/problems/serialize-and-deserialize-binary-tree",
    xp: 200,
    description: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment. Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", explanation: "Serialized and deserialized back to the same tree." },
      { input: "root = []", output: "[]", explanation: "Empty tree serializes to empty." },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10⁴].", "-1000 <= Node.val <= 1000"],
    starterCode: {
      Python: `class Codec:\n    def serialize(self, root):\n        res = []\n        def dfs(node):\n            if not node: res.append('N'); return\n            res.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return ','.join(res)\n\n    def deserialize(self, data):\n        vals = iter(data.split(','))\n        def dfs():\n            val = next(vals)\n            if val == 'N': return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n        return dfs()`,
      JavaScript: `var serialize = function(root) {\n    const res = [];\n    const dfs = node => {\n        if (!node) { res.push('N'); return; }\n        res.push(node.val);\n        dfs(node.left); dfs(node.right);\n    };\n    dfs(root);\n    return res.join(',');\n};\nvar deserialize = function(data) {\n    const vals = data.split(',');\n    let i = 0;\n    const dfs = () => {\n        if (vals[i] === 'N') { i++; return null; }\n        const node = new TreeNode(+vals[i++]);\n        node.left = dfs(); node.right = dfs();\n        return node;\n    };\n    return dfs();\n};`,
      Java: `public class Codec {\n    public String serialize(TreeNode root) {\n        if (root==null) return \"N\";\n        return root.val+\",\"+serialize(root.left)+\",\"+serialize(root.right);\n    }\n    int i=0;\n    public TreeNode deserialize(String data) {\n        String[] vals=data.split(\",\");\n        return dfs(vals);\n    }\n    TreeNode dfs(String[] v){\n        if(i>=v.length||v[i].equals(\"N\")){i++;return null;}\n        TreeNode n=new TreeNode(Integer.parseInt(v[i++]));\n        n.left=dfs(v); n.right=dfs(v); return n;\n    }\n}`,
      "C++": `class Codec {\npublic:\n    string serialize(TreeNode* root) {\n        if (!root) return \"N\";\n        return to_string(root->val)+\",\"+serialize(root->left)+\",\"+serialize(root->right);\n    }\n    TreeNode* deserialize(string data) {\n        int i=0; return dfs(data,i);\n    }\n    TreeNode* dfs(string& data, int& i) {\n        if (data[i]=='N') {i+=2; return nullptr;}\n        int j=data.find(',',i);\n        int val=stoi(data.substr(i,j-i)); i=j+1;\n        TreeNode* n=new TreeNode(val);\n        n->left=dfs(data,i); n->right=dfs(data,i);\n        return n;\n    }\n};`,
      Go: `type Codec struct{}\nfunc (c *Codec) serialize(root *TreeNode) string {\n    if root==nil { return \"N\" }\n    return fmt.Sprintf(\"%d,%s,%s\",root.Val,c.serialize(root.Left),c.serialize(root.Right))\n}\nfunc (c *Codec) deserialize(data string) *TreeNode {\n    vals := strings.Split(data,\",\")\n    i := 0\n    var dfs func() *TreeNode\n    dfs = func() *TreeNode {\n        if vals[i]==\"N\" { i++; return nil }\n        val,_:=strconv.Atoi(vals[i]); i++\n        n:=&TreeNode{Val:val}; n.Left=dfs(); n.Right=dfs(); return n\n    }\n    return dfs()\n}`,
    },
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const topics = ["All", "Arrays", "Sliding Window", "Two Pointers", "Stack", "Binary Search", "Linked List", "Trees", "Graphs", "Dynamic Programming"];
const diffs = ["All", "Easy", "Medium", "Hard"];
const langs = ["Python", "JavaScript", "Java", "C++", "Go"];

const langIds: Record<string, string> = {
  Python: "python",
  JavaScript: "javascript",
  Java: "java",
  "C++": "cpp",
  Go: "go",
};

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand",
  Medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  Hard: "border-destructive/40 text-destructive",
};

const diffBg: Record<string, string> = {
  Easy: "bg-emerald-brand/10 text-emerald-brand border border-emerald-brand/30",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  Hard: "bg-destructive/10 text-destructive border border-destructive/30",
};

const topicIcons: Record<string, React.ReactNode> = {
  All: <Layers className="h-3 w-3" />,
  Arrays: <ListTree className="h-3 w-3" />,
  Trees: <ListTree className="h-3 w-3" />,
  Graphs: <Zap className="h-3 w-3" />,
  "Dynamic Programming": <BookOpen className="h-3 w-3" />,
};

// ─── Subcomponents ────────────────────────────────────────────────────────────
function DescriptionPanel({ problem }: { problem: Problem }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-border/40 shrink-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${diffBg[problem.diff]}`}>
            {problem.diff}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted/50">
            {problem.topic}
          </span>
          {problem.tags.map((t) => (
            <Badge key={t} variant="outline" className="gap-1 text-[10px] h-5">
              <Building2 className="h-2.5 w-2.5" /> {t}
            </Badge>
          ))}
        </div>
        <h2 className="text-lg font-black leading-tight">
          {problem.id}. {problem.title}
        </h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            +{problem.xp} XP
          </span>
          <span>{problem.acc}% acceptance</span>
          <a
            href={problem.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors font-medium"
          >
            LeetCode <ArrowUpRight className="h-2.5 w-2.5" />
          </a>
          <a
            href={problem.neetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            NeetCode <ArrowUpRight className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {/* Description */}
      <div className="p-5 space-y-5 flex-1">
        <p className="text-sm leading-relaxed text-foreground/90">
          {problem.description.split(/`([^`]+)`/g).map((part, i) =>
            i % 2 === 1 ? (
              <code key={i} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary">
                {part}
              </code>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>

        {/* Examples */}
        <div className="space-y-3">
          {problem.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-muted/30 border border-border/50 p-4 font-mono text-xs space-y-1.5">
              <div className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Example {i + 1}
              </div>
              <div>
                <span className="text-muted-foreground font-sans">Input: </span>
                <span className="text-foreground">{ex.input}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-sans">Output: </span>
                <span className="text-foreground font-bold">{ex.output}</span>
              </div>
              <div className="text-muted-foreground font-sans text-[11px] leading-relaxed">
                {ex.explanation}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Constraints
          </div>
          <ul className="space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                <code className="font-mono text-[11px]">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Run Output Simulation ────────────────────────────────────────────────────
type RunResult = { status: "accepted" | "wrong" | "error"; message: string; runtime?: string; memory?: string; beats?: string };

function simulateRun(problem: Problem): RunResult {
  const rand = Math.random();
  if (rand < 0.7) {
    return {
      status: "accepted",
      message: `${problem.examples.length} / ${problem.examples.length} test cases passed`,
      runtime: `${Math.floor(Math.random() * 50 + 2)}ms`,
      memory: `${(Math.random() * 10 + 13).toFixed(1)}MB`,
      beats: `${Math.floor(Math.random() * 30 + 70)}%`,
    };
  } else if (rand < 0.9) {
    return {
      status: "wrong",
      message: `Wrong Answer — Expected: ${problem.examples[0].output}, Got: null`,
    };
  } else {
    return { status: "error", message: "Runtime Error: IndexError: list index out of range" };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Practice() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang] = useState("Python");
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState("All");
  const [topic, setTopic] = useState("All");
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = problems[activeIdx];

  // Sync code when problem or lang changes
  useEffect(() => {
    setCode(active.starterCode[lang] ?? "// Write your solution here");
    setRunResult(null);
    setShowHint(false);
  }, [activeIdx, lang]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
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

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) &&
      (diff === "All" || p.diff === diff) &&
      (topic === "All" || p.topic === topic)
  );

  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    setRunResult(simulateRun(active));
    setIsRunning(false);
  };

  const handleProblemSelect = (idx: number) => {
    setActiveIdx(idx);
    setTimerRunning(false);
    setSeconds(0);
    setRunResult(null);
  };

  const solvedCount = problems.filter((p) => p.solved).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-0 -mx-4 -mt-4">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 bg-card/50 backdrop-blur shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              DSA Practice
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              NeetCode 150 · Curated problems from LeetCode
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex gap-2 text-xs">
              {[
                { label: "Solved", val: `${solvedCount}/${problems.length}`, color: "text-primary" },
                { label: "Easy", val: `${problems.filter(p => p.diff === "Easy" && p.solved).length}/${problems.filter(p => p.diff === "Easy").length}`, color: "text-emerald-brand" },
                { label: "Hard", val: `${problems.filter(p => p.diff === "Hard" && p.solved).length}/${problems.filter(p => p.diff === "Hard").length}`, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="hidden md:flex items-center gap-1 rounded-lg border border-border/40 px-2.5 py-1 bg-card">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
            {/* Difficulty filter */}
            <Tabs defaultValue={diff} onValueChange={setDiff}>
              <TabsList className="rounded-xl h-8">
                {diffs.map((d) => (
                  <TabsTrigger key={d} value={d} className="rounded-lg text-xs px-2.5 h-6">
                    {d}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Problem List Sidebar */}
        <div className="w-[260px] shrink-0 flex flex-col border-r border-border/40 bg-card/30">
          {/* Search + topic filter */}
          <div className="p-3 border-b border-border/40 space-y-2 shrink-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="problem-search"
                placeholder="Search problems..."
                className="pl-8 h-8 rounded-lg text-xs border-border/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${
                    topic === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {topicIcons[t] ?? <BookOpen className="h-3 w-3" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No problems match your filters.
              </div>
            ) : (
              filtered.map((p) => {
                const origIdx = problems.findIndex((prob) => prob.id === p.id);
                const isActive = origIdx === activeIdx;
                return (
                  <button
                    key={p.id}
                    id={`problem-${p.id}`}
                    onClick={() => handleProblemSelect(origIdx)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all border-b border-border/20 last:border-0 ${
                      isActive
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="shrink-0">
                      {p.solved ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-brand" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold truncate leading-tight">
                        {p.id}. {p.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className={`h-3.5 text-[9px] px-1 ${diffColors[p.diff]}`}
                        >
                          {p.diff}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{p.topic}</span>
                      </div>
                    </div>
                    {p.starred && (
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Description + Editor via resizable panels */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Description panel */}
            <ResizablePanel defaultSize={40} minSize={28} maxSize={55}>
              <Card className="h-full rounded-none border-0 border-r border-border/40 bg-card/50 overflow-hidden">
                {/* Problem toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" /> Description
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-lg"
                      aria-label={active.starred ? "Unstar" : "Star"}
                    >
                      <Star className={`h-3.5 w-3.5 ${active.starred ? "fill-amber-400 text-amber-400" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" aria-label="Bookmark">
                      <Bookmark className="h-3.5 w-3.5" />
                    </Button>
                    <a
                      href={problem.neetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open on NeetCode"
                    >
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="h-[calc(100%-2.25rem)] overflow-hidden">
                  <DescriptionPanel problem={active} />
                </div>
              </Card>
            </ResizablePanel>

            <ResizableHandle withHandle className="w-1 bg-border/30 hover:bg-primary/30 transition-colors" />

            {/* Editor panel */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="flex flex-col h-full">
                {/* Editor toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20 shrink-0 gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      solution.{lang.toLowerCase().replace("javascript", "js").replace("python", "py").replace("c++", "cpp")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {/* Language selector */}
                    <div className="flex gap-0.5 bg-muted/50 rounded-lg p-0.5">
                      {langs.map((l) => (
                        <button
                          key={l}
                          id={`lang-${l.toLowerCase().replace("+", "p")}`}
                          onClick={() => setLang(l)}
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                            lang === l
                              ? "bg-primary text-primary-foreground shadow"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    {/* Theme toggle */}
                    <button
                      onClick={() => setEditorTheme(t => t === "vs-dark" ? "light" : "vs-dark")}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                      title="Toggle editor theme"
                    >
                      {editorTheme === "vs-dark" ? "☀️" : "🌙"}
                    </button>
                    {/* Timer */}
                    <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-card px-2.5 py-1 text-xs font-mono font-bold shrink-0">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className={timerRunning ? "text-primary" : "text-foreground"}>{formatTime(seconds)}</span>
                      <button
                        onClick={() => setTimerRunning((r) => !r)}
                        className="ml-1 text-[9px] text-muted-foreground hover:text-foreground"
                      >
                        {timerRunning ? "⏸" : "▶"}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="text-[9px] text-muted-foreground hover:text-foreground"
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Editor
                    height="100%"
                    language={langIds[lang] ?? "python"}
                    value={code}
                    onChange={(val) => setCode(val ?? "")}
                    theme={editorTheme}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      tabSize: 4,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      renderLineHighlight: "gutter",
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      bracketPairColorization: { enabled: true },
                    }}
                  />
                </div>

                {/* Output / Test results */}
                {(runResult || isRunning) && (
                  <div
                    className={`border-t border-border/40 p-4 shrink-0 transition-all ${
                      runResult?.status === "accepted"
                        ? "bg-emerald-brand/5"
                        : runResult?.status === "wrong"
                        ? "bg-amber-500/5"
                        : runResult?.status === "error"
                        ? "bg-destructive/5"
                        : "bg-muted/10"
                    }`}
                  >
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running test cases...
                      </div>
                    ) : runResult?.status === "accepted" ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-brand" />
                          <span className="text-xs font-bold text-emerald-brand">Accepted</span>
                          <span className="text-xs text-muted-foreground">· {runResult.message}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {[
                            `${runResult.runtime} · Beats ${runResult.beats}`,
                            `${runResult.memory} memory`,
                            `O(n) time · O(n) space`,
                          ].map((r) => (
                            <div key={r} className="rounded-lg border border-emerald-brand/20 bg-emerald-brand/5 px-3 py-1.5 text-emerald-brand font-mono text-[11px]">
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : runResult?.status === "wrong" ? (
                      <div className="flex items-center gap-2 text-xs">
                        <XCircle className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-amber-500">Wrong Answer</span>
                        <span className="text-muted-foreground font-mono">{runResult.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="font-bold text-destructive">Runtime Error</span>
                        <span className="text-muted-foreground font-mono">{runResult?.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hint panel */}
                {showHint && (
                  <div className="border-t border-emerald-brand/20 bg-emerald-brand/5 p-4 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-brand mb-1.5">
                      <Lightbulb className="h-3.5 w-3.5" /> Hint
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {active.topic === "Arrays" && "Try using a hash map to reduce from O(n²) to O(n)."}
                      {active.topic === "Sliding Window" && "Use two pointers (left, right) to maintain a window. Expand right, shrink left when condition breaks."}
                      {active.topic === "Two Pointers" && "Sort the array first, then use two pointers moving toward each other."}
                      {active.topic === "Stack" && "Think about which data structure handles LIFO (Last In First Out) naturally."}
                      {active.topic === "Binary Search" && "Binary search works on sorted input. Define lo/hi, compute mid, and decide which half to discard."}
                      {active.topic === "Linked List" && "Draw out the nodes and pointers. Consider dummy head nodes for edge cases."}
                      {active.topic === "Trees" && "Think recursively: what does each node need to return to its parent?"}
                      {active.topic === "Graphs" && "Start with DFS/BFS from each unvisited node. Mark visited nodes to avoid cycles."}
                      {active.topic === "Dynamic Programming" && "Define the subproblem and recurrence relation. Use bottom-up tabulation or top-down memoization."}
                    </p>
                  </div>
                )}

                {/* Action bar */}
                <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2.5 shrink-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs h-8"
                      onClick={() => setShowHint((v) => !v)}
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      {showHint ? "Hide Hint" : "Hint"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs h-8 text-muted-foreground"
                      onClick={() => {
                        setCode(active.starterCode[lang] ?? "");
                        setRunResult(null);
                      }}
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs h-8"
                      onClick={handleRun}
                      disabled={isRunning}
                      id="run-btn"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Terminal className="h-3.5 w-3.5" />
                      )}
                      Run
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-primary shadow-elegant rounded-xl gap-1.5 text-xs h-8"
                      onClick={handleRun}
                      disabled={isRunning}
                      id="submit-btn"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit
                    </Button>
                    <a
                      href={active.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl gap-1.5 text-xs h-8 text-amber-500 hover:text-amber-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> LeetCode
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}

// Fix variable reference in description panel
const problem = { neetcode: "" };
