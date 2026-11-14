/**
 * AI integration boundary for the Interview module.
 *
 * NOTHING here calls an AI service. It only defines the seams where one can be plugged in later,
 * so no controller/model needs to change when AI is added. Until a provider is registered every
 * method rejects with code AI_NOT_CONFIGURED and the app falls back to manual evaluation.
 *
 * To add a provider:
 *   const ai = require("./services/interview/ai");
 *   ai.registerProvider({ async generateQuestions(input) {...}, async evaluateAnswer(input) {...}, ... });
 *
 * Each method receives plain objects (no DB handles) and returns plain objects:
 *   generateQuestions({ interview, topic, count, difficulty })        -> [{ question, question_type, marks, expected_answer, options?, correct_option? }]
 *   evaluateAnswer({ question, answer })                              -> { marks, comment, confidence }   (a SUGGESTION; a human still finalizes)
 *   runInterviewerTurn({ interview, transcript })                     -> { next_question, done }
 *   analyzeCommunication({ transcriptOrText })                        -> { clarity, fluency, notes }
 *   evaluateTechnical({ question, answer, language })                 -> { correctness, notes }
 *   generateCandidateFeedback({ interview, attempt, evaluation })     -> { summary, strengths, improvements }
 */
const CAPABILITIES = ["generateQuestions", "evaluateAnswer", "runInterviewerTurn",
  "analyzeCommunication", "evaluateTechnical", "generateCandidateFeedback"];

let provider = null;

function registerProvider(p) {
  for (const c of CAPABILITIES) if (p && typeof p[c] !== "function") p = { ...p, [c]: undefined };
  provider = p;
}
const isConfigured = () => !!provider;
const capabilities = () => CAPABILITIES.filter((c) => provider && typeof provider[c] === "function");

const api = {};
for (const c of CAPABILITIES) {
  api[c] = async (input) => {
    if (!provider || typeof provider[c] !== "function") {
      const err = new Error(`AI capability "${c}" is not configured`);
      err.code = "AI_NOT_CONFIGURED";
      throw err;
    }
    return provider[c](input);
  };
}

module.exports = { registerProvider, isConfigured, capabilities, ...api };
