export const reactQuestions = [
  {
    id: "react-1",
    question: "How does React Fiber architecture improve rendering performance over the legacy stack reconciler?",
    category: "React",
    topic: "Core React",
    difficulty: "Hard",
    expectedConcepts: ["Virtual DOM", "Fiber Reconciler", "Time Slicing", "Priority Scheduling"],
    hint: "Fiber converts recursive reconciliation into interruptible unit-of-work linked lists.",
    suggestedAnswer: "React Fiber breaks reconciliation into small units of work and enables interruptible rendering (time slicing). High-priority updates (user input, animations) can interrupt low-priority rendering tasks.",
    explanation: "This eliminates main thread jank during heavy UI tree re-renders."
  }
];
