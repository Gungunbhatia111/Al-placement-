import { dsaQuestions } from "./dsa.js";
import { javaQuestions } from "./java.js";
import { cppQuestions } from "./cpp.js";
import { pythonQuestions } from "./python.js";
import { javascriptQuestions } from "./javascript.js";
import { reactQuestions } from "./react.js";
import { nodeQuestions } from "./node.js";
import { sqlQuestions, mongodbQuestions, dbmsQuestions } from "./sql.js";
import { osQuestions, cnQuestions, oopQuestions, systemDesignQuestions, hrQuestions, behavioralQuestions, projectsQuestions } from "./os.js";

export const ALL_LOCAL_QUESTIONS = [
  ...dsaQuestions,
  ...javaQuestions,
  ...cppQuestions,
  ...pythonQuestions,
  ...javascriptQuestions,
  ...reactQuestions,
  ...nodeQuestions,
  ...sqlQuestions,
  ...mongodbQuestions,
  ...dbmsQuestions,
  ...osQuestions,
  ...cnQuestions,
  ...oopQuestions,
  ...systemDesignQuestions,
  ...hrQuestions,
  ...behavioralQuestions,
  ...projectsQuestions,
];

export const QUESTIONS_BY_CATEGORY = {
  DSA: dsaQuestions,
  Java: javaQuestions,
  "C++": cppQuestions,
  Python: pythonQuestions,
  JavaScript: javascriptQuestions,
  React: reactQuestions,
  "Node.js": nodeQuestions,
  SQL: sqlQuestions,
  MongoDB: mongodbQuestions,
  DBMS: dbmsQuestions,
  OS: osQuestions,
  CN: cnQuestions,
  OOP: oopQuestions,
  "System Design": systemDesignQuestions,
  HR: hrQuestions,
  Behavioral: behavioralQuestions,
  Projects: projectsQuestions,
};

// Deterministically picks Question of the Day based on current date
export function getQuestionOfTheDay() {
  const today = new Date();
  const dateNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = dateNum % ALL_LOCAL_QUESTIONS.length;
  return ALL_LOCAL_QUESTIONS[index];
}

export function filterQuestions({ category, topic, difficulty, count = 5 }) {
  let pool = ALL_LOCAL_QUESTIONS;
  if (category && category !== "All") {
    pool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase() || q.topic.toLowerCase().includes(category.toLowerCase()));
  }
  if (difficulty && difficulty !== "All") {
    pool = pool.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (pool.length === 0) pool = ALL_LOCAL_QUESTIONS;
  return pool.slice(0, count);
}
