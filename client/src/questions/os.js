export const osQuestions = [
  {
    id: "os-1",
    question: "What is the difference between a Process and a Thread? How does Context Switching work?",
    category: "OS",
    topic: "Operating Systems",
    difficulty: "Medium",
    expectedConcepts: ["Process Control Block (PCB)", "Virtual Memory Space", "Thread Execution Context"],
    hint: "Processes have independent memory address space; threads share process memory.",
    suggestedAnswer: "A Process is an executing program instance with isolated virtual memory. A Thread is a lightweight execution unit sharing the parent process's memory. Context switching saves current state in PCB/TCB and restores state of the next task.",
    explanation: "Thread context switches are faster than process context switches because CPU page tables/TLB cache do not need to be flushed."
  }
];

export const cnQuestions = [
  {
    id: "cn-1",
    question: "Explain the TCP 3-Way Handshake and 4-Way Teardown process.",
    category: "CN",
    topic: "Computer Networks",
    difficulty: "Medium",
    expectedConcepts: ["SYN", "SYN-ACK", "ACK", "FIN", "FIN-ACK"],
    hint: "Handshake establishes sequence numbers; Teardown cleanly terminates bidirectional streams.",
    suggestedAnswer: "Handshake: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK. Teardown: Initiator sends FIN -> Receiver responds ACK -> Receiver sends FIN -> Initiator responds ACK.",
    explanation: "3-way handshake ensures both parties synchronize initial Sequence Numbers (ISN) before sending data."
  }
];

export const oopQuestions = [
  {
    id: "oop-1",
    question: "Explain the 4 Pillars of Object-Oriented Programming (OOP) with real-world analogies.",
    category: "OOP",
    topic: "Object-Oriented Concepts",
    difficulty: "Easy",
    expectedConcepts: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
    hint: "Encapsulation hides state; Abstraction hides implementation complexity.",
    suggestedAnswer: "1. Encapsulation (bundling data + methods, e.g., capsule pill). 2. Abstraction (hiding internal implementation details, e.g., car accelerator pedal). 3. Inheritance (subclasses inheriting fields/methods from parent, e.g., Car inherits Vehicle). 4. Polymorphism (ability to take many forms, e.g., draw() method for Circle vs Square).",
    explanation: "These pillars improve code reusability, modularity, and maintainability."
  }
];

export const systemDesignQuestions = [
  {
    id: "sd-1",
    question: "How would you design a URL Shortener like Bitly for high scale (100M URLs generated/day)?",
    category: "System Design",
    topic: "High-Scale Architecture",
    difficulty: "Hard",
    expectedConcepts: ["Base62 Encoding", "Distributed ID Generator", "Cache Layer (Redis)", "Database Partitioning"],
    hint: "Think about short key generation (Base62 encoding of auto-increment ID or MD5 hash) and cache lookup.",
    suggestedAnswer: "Use a distributed ID generator (Snowflake/Range Handler) to generate 64-bit integer IDs. Convert integer ID to Base62 string (a-z, A-Z, 0-9) yielding 7-char short codes. Store in NoSQL/SQL DB with Redis cache layer in front for 99% cache hit ratio.",
    explanation: "7 Base62 characters support 62^7 = 3.5 Trillion unique short URLs."
  }
];

export const hrQuestions = [
  {
    id: "hr-1",
    question: "Tell me about yourself and why you are interested in joining our company.",
    category: "HR",
    topic: "General HR",
    difficulty: "Easy",
    expectedConcepts: ["Elevator Pitch", "Role Alignment", "Company Mission Knowledge"],
    hint: "Structure your answer: Present role/education -> Past achievements -> Future goals aligned with company.",
    suggestedAnswer: "Highlight your academic background, core technical stack (e.g., React, Java, DSA), 1-2 major impactful projects, and connect your personal interest directly to the company's product vision and technical challenges.",
    explanation: "Demonstrates communication skills, clarity of thought, and genuine alignment."
  }
];

export const behavioralQuestions = [
  {
    id: "beh-1",
    question: "Describe a situation where your project faced a critical technical failure. How did you handle it?",
    category: "Behavioral",
    topic: "STAR Method",
    difficulty: "Medium",
    expectedConcepts: ["Situation", "Task", "Action", "Result"],
    hint: "Use STAR method: Situation, Task, Action, Result with quantified outcome.",
    suggestedAnswer: "Situation: API latency spiked during deployment. Task: Identify root cause and restore performance. Action: Profiling database queries, identified missing index on user_id, added composite index and deployed patch. Result: Latency dropped by 65% and uptime restored to 99.9%.",
    explanation: "Shows problem solving, calm under pressure, and technical ownership."
  }
];

export const projectsQuestions = [
  {
    id: "proj-1",
    question: "What was the most challenging technical feature you implemented in your resume project?",
    category: "Projects",
    topic: "Project Deep Dive",
    difficulty: "Medium",
    expectedConcepts: ["Architecture Choice", "Technical Trade-offs", "Personal Contribution"],
    hint: "Explain problem -> architectural decision -> trade-offs considered -> concrete result.",
    suggestedAnswer: "Pick your strongest resume project (e.g., real-time chat or authentication pipeline). Explain the technical bottleneck (e.g., handling concurrent WebSocket connections), the solution implemented, key trade-offs, and final performance metric.",
    explanation: "Proves hands-on technical competence and deep understanding of your own code."
  }
];
