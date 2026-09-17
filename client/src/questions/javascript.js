export const javascriptQuestions = [
  {
    id: "js-1",
    question: "Explain the Event Loop, Call Stack, Microtask Queue, and Macrotask Queue in JavaScript.",
    category: "JavaScript",
    topic: "Asynchronous JS",
    difficulty: "Hard",
    expectedConcepts: ["Call Stack", "Microtasks (Promises)", "Macrotasks (setTimeout)", "Event Loop"],
    hint: "Microtasks are drained completely before the next macrotask executes.",
    suggestedAnswer: "JS is single-threaded. The Call Stack executes synchronous code. Asynchronous callbacks enter queues: Promises/queueMicrotask go to Microtask Queue; setTimeout/setInterval go to Macrotask Queue. The Event Loop checks if Call Stack is empty, drains ALL Microtasks, then picks ONE Macrotask.",
    explanation: "This execution order explains why `Promise.resolve().then(...)` runs before `setTimeout(..., 0)`."
  }
];
