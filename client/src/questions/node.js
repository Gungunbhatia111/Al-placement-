export const nodeQuestions = [
  {
    id: "node-1",
    question: "How does libuv thread pool handle asynchronous non-blocking I/O in Node.js?",
    category: "Node.js",
    topic: "Node Architecture",
    difficulty: "Medium",
    expectedConcepts: ["libuv", "Thread Pool (UV_THREADPOOL_SIZE)", "OS Kernels", "epoll/kqueue"],
    hint: "Network I/O uses native OS async interfaces (epoll/kqueue), while file I/O and crypto use libuv thread pool.",
    suggestedAnswer: "Node.js relies on libuv. Network I/O is handled directly by OS kernel mechanisms (epoll/kqueue). File system, DNS lookup, and cryptographic operations use libuv's 4-worker thread pool by default.",
    explanation: "This dual approach maximizes non-blocking throughput without spawning 1 thread per connection."
  }
];
