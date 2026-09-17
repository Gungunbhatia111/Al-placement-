export const cppQuestions = [
  {
    id: "cpp-1",
    question: "What is Virtual Method Table (vtable) and how does dynamic polymorphism work in C++?",
    category: "C++",
    topic: "OOP & Pointers",
    difficulty: "Hard",
    expectedConcepts: ["vtable", "vptr", "Virtual Keywords", "Late Binding"],
    hint: "Every class with virtual functions gets a static lookup table created by the compiler.",
    suggestedAnswer: "When a class declares a virtual function, the compiler creates a static vtable containing function pointers. Objects contain a hidden `vptr` pointing to the vtable, enabling runtime method resolution.",
    explanation: "Dynamic polymorphism adds 1 pointer overhead per object and 1 extra indirection lookup per virtual call."
  }
];
