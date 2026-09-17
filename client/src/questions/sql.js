export const sqlQuestions = [
  {
    id: "sql-1",
    question: "What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?",
    category: "SQL",
    topic: "Database Queries",
    difficulty: "Easy",
    expectedConcepts: ["Joins", "Relational Algebra", "NULL Handling"],
    hint: "Think about matching rows versus preserving unmatched left/right rows.",
    suggestedAnswer: "INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from left table + matched rows from right. RIGHT JOIN returns all rows from right table + matched rows from left. FULL JOIN returns all rows when there is a match in either table.",
    explanation: "Unmatched columns in OUTER joins are populated with NULL."
  }
];

export const mongodbQuestions = [
  {
    id: "mongo-1",
    question: "How do Indexing and Aggregation Pipelines work in MongoDB?",
    category: "MongoDB",
    topic: "NoSQL",
    difficulty: "Medium",
    expectedConcepts: ["B-Tree Indexes", "Aggregation Stages ($match, $group, $lookup)"],
    hint: "Indexes reduce disk scans; aggregation processes documents in multi-stage pipelines.",
    suggestedAnswer: "MongoDB uses B-Tree indexes to optimize query evaluation (`db.col.createIndex()`). Aggregation pipelines pass documents through stages ($match -> $group -> $project -> $sort) for analytics.",
    explanation: "Placing $match and $sort at the start of pipeline allows index usage."
  }
];

export const dbmsQuestions = [
  {
    id: "dbms-1",
    question: "Explain ACID properties in relational databases and transaction isolation levels.",
    category: "DBMS",
    topic: "Transactions",
    difficulty: "Hard",
    expectedConcepts: ["Atomicity", "Consistency", "Isolation", "Durability", "Dirty Read", "Phantom Read"],
    hint: "ACID ensures reliable processing. Isolation levels prevent concurrency anomalies.",
    suggestedAnswer: "Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrent transactions execute independently), Durability (committed changes persist). Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.",
    explanation: "Higher isolation prevents Dirty Reads and Phantom Reads but reduces concurrent throughput."
  }
];
