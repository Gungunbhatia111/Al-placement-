export const dsaQuestions = [
  {
    id: "dsa-1",
    question: "How do you detect a cycle in a linked list using Floyd's Cycle Detection algorithm?",
    category: "DSA",
    topic: "Linked Lists",
    difficulty: "Medium",
    expectedConcepts: ["Two Pointers", "Floyd's Cycle Finding", "Space Complexity"],
    hint: "Use two pointers moving at different speeds (slow pointer moves 1 step, fast pointer moves 2 steps).",
    suggestedAnswer: "Initialize slow and fast pointers to head. Move slow by 1 step and fast by 2 steps in a loop. If slow and fast meet (slow === fast), a cycle exists. If fast reaches null, no cycle exists.",
    explanation: "Floyd's algorithm runs in O(N) time and O(1) auxiliary space by taking advantage of pointer relative speed."
  },
  {
    id: "dsa-2",
    question: "Explain the difference between Dynamic Programming and Greedy algorithms with examples.",
    category: "DSA",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    expectedConcepts: ["Overlapping Subproblems", "Optimal Substructure", "Greedy Choice Property"],
    hint: "Greedy makes the locally optimal choice at each step, while DP solves overlapping subproblems and stores results.",
    suggestedAnswer: "Greedy algorithms make top-down choices locally without looking back (e.g., Fractional Knapsack, Dijkstra). DP explores subproblems, stores results in a memoization table (e.g., 0/1 Knapsack, Longest Common Subsequence).",
    explanation: "DP guarantees global optimality for problems with overlapping subproblems, whereas Greedy works only when the greedy choice property holds."
  },
  {
    id: "dsa-3",
    question: "What is the time and space complexity of QuickSort in worst and average cases?",
    category: "DSA",
    topic: "Sorting & Searching",
    difficulty: "Easy",
    expectedConcepts: ["Divide and Conquer", "Pivot Selection", "Recursion Stack"],
    hint: "Think about balanced vs unbalanced partition splits.",
    suggestedAnswer: "Average time complexity: O(N log N), Worst time complexity: O(N^2) (when pivot is poorly chosen, e.g., already sorted array with last element pivot). Auxiliary space: O(log N) average stack space.",
    explanation: "Randomized pivot selection avoids O(N^2) worst case performance in practice."
  }
];
