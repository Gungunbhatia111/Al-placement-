export const pythonQuestions = [
  {
    id: "py-1",
    question: "What is GIL (Global Interpreter Lock) in CPython and how does it affect multithreading?",
    category: "Python",
    topic: "Concurrency",
    difficulty: "Medium",
    expectedConcepts: ["GIL", "CPython Memory Safety", "Multiprocessing vs Multithreading"],
    hint: "GIL prevents multiple native threads from executing Python bytecodes at once.",
    suggestedAnswer: "The GIL is a mutex that allows only one thread to hold control of the Python interpreter. CPU-bound tasks do not benefit from multithreading; use `multiprocessing` or C-extensions instead. I/O-bound tasks still benefit.",
    explanation: "GIL simplifies memory management in CPython (preventing race conditions in reference counting)."
  }
];
