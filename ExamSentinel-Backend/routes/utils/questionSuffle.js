// const redisClient = require("../../config/radishRouter");
// const Questions = require("../../models/questions");

// // Shuffle utility
// const shuffleArray = (array) => {
//   const a = [...array];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// async function fetchAndShuffleQuestions(question, examId, studentId) {
//   const redisKey = `student_exam:${studentId}:${examId}`;
//   const Examsections = ` examsection :${examId}`;
//   const allQuestions = question.result;

//   if (!allQuestions.length)
//     return { studentQuestions: [], uniqueLanguages: [] };

//   const uniqueLanguages = [...new Set(allQuestions.map((q) => q.Language))];

//   const mappedQuestions = allQuestions.map((q) => {

//     if(q.RandomizeOption.lowerCase() =="yes"){

//     const optionMap = {
//       A: q.option_a,
//       B: q.option_b,
//       C: q.option_c,
//       D: q.option_d,
//     };
//     const shuffled = shuffleArray(Object.entries(optionMap));

//     const options = {
//       A: { text: shuffled[0][1], original_key: shuffled[0][0] },
//       B: { text: shuffled[1][1], original_key: shuffled[1][0] },
//       C: { text: shuffled[2][1], original_key: shuffled[2][0] },
//       D: { text: shuffled[3][1], original_key: shuffled[3][0] },
//     };
//   }else{

//      const optionMap = {
//       A: q.option_a,
//       B: q.option_b,
//       C: q.option_c,
//       D: q.option_d,
//     };
//   }
//     return {
//       id: q.id,
//       question: q.question,
//       options,
//       Languages: q.Language,
//       imageRef: q.imageRef,
//       option_a_image: q.option_a_image,
//       option_b_image: q.option_b_image,
//       option_c_image: q.option_c_image,
//       option_d_image: q.option_d_image,
//       question_type: q.question_type,
//     };
//   });

//   const studentQuestions = shuffleArray(mappedQuestions);

//   await redisClient.set(redisKey, JSON.stringify(studentQuestions), "EX", 3600);

//   return { studentQuestions, uniqueLanguages };
// }

// module.exports = { fetchAndShuffleQuestions };

const redisClient = require("../../config/radishRouter");
const Questions = require("../../models/questions");

// Shuffle utility
const shuffleArray = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function fetchAndShuffleQuestions(question, examId, studentId) {
  const redisKey = `student_exam:${studentId}:${examId}`;
  const Examsections = `examsection:${examId}`;
  const ExamsectionLanguge = `examlanguage:${examId}`;
  const allQuestions = question.result;

  if (!allQuestions.length)
    return { studentQuestions: [], uniqueLanguages: [] };

  const uniqueLanguages = [...new Set(allQuestions.map((q) => q.Language))];

  const mappedQuestions = allQuestions.map((q) => {
    let options = {};
    const optionMap = {
      A: q.option_a,
      B: q.option_b,
      C: q.option_c,
      D: q.option_d,
    };

    if (q.RandomizeOption?.toLowerCase() === "yes") {
      const shuffled = shuffleArray(Object.entries(optionMap));
      options = {
        A: { text: shuffled[0][1], original_key: shuffled[0][0] },
        B: { text: shuffled[1][1], original_key: shuffled[1][0] },
        C: { text: shuffled[2][1], original_key: shuffled[2][0] },
        D: { text: shuffled[3][1], original_key: shuffled[3][0] },
      };
    } else {
      options = {
        A: { text: q.option_a, original_key: "A" },
        B: { text: q.option_b, original_key: "B" },
        C: { text: q.option_c, original_key: "C" },
        D: { text: q.option_d, original_key: "D" },
      };
    }

    return {
      id: q.id,
      question: q.question,
      options,
      Languages: q.Language,
      imageRef: q.imageRef,
      option_a_image: q.option_a_image,
      option_b_image: q.option_b_image,
      option_c_image: q.option_c_image,
      option_d_image: q.option_d_image,
      question_type: q.question_type,
      randomizeQuestion: q.RandomizeQuestion,
    };
  });

  let studentQuestions;

  const shouldShuffleQuestions =
    allQuestions[0]?.RandomizeOption?.toLowerCase() === "yes";

  if (shouldShuffleQuestions) {
    studentQuestions = shuffleArray(mappedQuestions);
  } else {
    studentQuestions = mappedQuestions;
  }
  await redisClient.set(
    ExamsectionLanguge,
    JSON.stringify(uniqueLanguages),
    "EX",
    3600
  );
  await redisClient.set(redisKey, JSON.stringify(studentQuestions), "EX", 3600);

  return { studentQuestions, uniqueLanguages };
}

module.exports = { fetchAndShuffleQuestions };
