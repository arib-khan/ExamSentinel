/**
 * Interview module :: AI extension points (intentionally NOT implemented)
 *
 * The interview module is designed so AI capabilities can be plugged in
 * later WITHOUT touching routes, models or the exam system. When an AI
 * provider is approved, implement these adapters only.
 *
 * IMPORTANT: nothing here calls an external service today, and no
 * functionality pretends to be AI-powered.
 */
module.exports = {
  /**
   * Future: suggest interview questions for a given type/category.
   * Expected contract: returns [{ iq_question, iq_question_type, iq_category,
   * iq_difficulty, iq_marks, iq_expected_answer }] - caller validates +
   * persists through InterviewQuestion.Add.
   */
  async generateQuestions(/* { type, category, count } */) {
    return null; // not configured - callers must treat null as "not available"
  },

  /**
   * Future: pre-score a subjective/technical/coding answer to ASSIST the
   * evaluator. Must never write marks directly - returns a SUGGESTION:
   * { suggested_marks, rationale } consumed by the evaluation UI.
   */
  async evaluateAnswer(/* { question, expected_answer, answer_text } */) {
    return null;
  },

  /**
   * Future: AI interviewer / communication analysis on recorded sessions.
   */
  async analyzeCommunication(/* { attempt_id } */) {
    return null;
  },
};
