export const javaQuestions = [
  {
    id: "java-1",
    question: "Explain the internal working of HashMap in Java (including collision handling in Java 8+).",
    category: "Java",
    topic: "Collections",
    difficulty: "Hard",
    expectedConcepts: ["Hashing", "Bucket Indexing", "LinkedList to Red-Black Tree Conversion"],
    hint: "Think about hashCode(), equals(), bucket array index formula, and treeification threshold.",
    suggestedAnswer: "HashMap uses an array of Nodes/Buckets. The key's hashCode() determines bucket index `(n - 1) & hash`. In Java 8+, if a single bucket contains more than 8 elements (TREEIFY_THRESHOLD), it converts from LinkedList to Red-Black Tree for O(log N) lookup.",
    explanation: "This treeification prevents O(N) hash collision Denial-of-Service performance degradation."
  },
  {
    id: "java-2",
    question: "What is the difference between String, StringBuilder, and StringBuffer?",
    category: "Java",
    topic: "Core Java",
    difficulty: "Easy",
    expectedConcepts: ["Immutability", "Thread Safety", "Performance"],
    hint: "Consider string mutability and synchronization overhead.",
    suggestedAnswer: "String is immutable (stored in String Constant Pool). StringBuilder is mutable and non-synchronized (fast, for single thread). StringBuffer is mutable and thread-safe (synchronized methods, slower).",
    explanation: "Use StringBuilder for frequent string modifications unless multithreaded synchronization is required."
  }
];
