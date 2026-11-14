const redisClient = require("../../config/radishRouter");
const Questions = require("../../models/questions");

// // Shuffle utility
// const shuffleArray = (array) => {
//   const a = [...array];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// async function fetchAndShuffleSectionsQuestions(question, examId, studentId) {
//   const redisKey = `student_exam:${studentId}:${examId}`;
//   const Examsections = `examsection:${examId}`;
//   const ExamsectionLanguge = `examlanguage:${examId}`;
//   const allQuestions = question.result;

//   if (!allQuestions.length)
//     return { studentQuestions: {}, uniqueLanguages: [], examsection: {} };

//   // ✅ Count questions per subject/section
//   const sectionQuestionCount = {};
//   const groupedQuestions = {};

//   allQuestions.forEach((q) => {
//     const subject = q.question_subject;
//     const section = q.section;

//     // Counting
//     if (!sectionQuestionCount[subject]) sectionQuestionCount[subject] = {};
//     if (!sectionQuestionCount[subject][section])
//       sectionQuestionCount[subject][section] = 0;
//     sectionQuestionCount[subject][section] += 1;

//     // Grouping
//     if (!groupedQuestions[subject]) groupedQuestions[subject] = {};
//     if (!groupedQuestions[subject][section])
//       groupedQuestions[subject][section] = [];

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

//     groupedQuestions[subject][section].push({
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
//     });
//   });

//   for (const subject in groupedQuestions) {
//     for (const section in groupedQuestions[subject]) {
//       groupedQuestions[subject][section] = shuffleArray(
//         groupedQuestions[subject][section]
//       );
//     }
//   }

//   const uniqueLanguages = [...new Set(allQuestions.map((q) => q.Language))];

//   await redisClient.set(
//     Examsections,
//     JSON.stringify(sectionQuestionCount),
//     "EX",
//     3600
//   );
//   await redisClient.set(
//     ExamsectionLanguge,
//     JSON.stringify(uniqueLanguages),
//     "EX",
//     3600
//   );
//   await redisClient.set(redisKey, JSON.stringify(groupedQuestions), "EX", 3600);

//   return {
//     studentQuestions: groupedQuestions,
//     uniqueLanguages,
//     examsection: sectionQuestionCount,
//   };
// }

// module.exports = { fetchAndShuffleSectionsQuestions };

// const redisClient = require("../../config/radishRouter");
// const Questions = require("../../models/questions");

// const shuffleArray = (array) => {
//   const a = [...array];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// async function fetchAndShuffleSectionsQuestions(question, examId, studentId) {
//   const redisKey = `student_exam:${studentId}:${examId}`;
//   const Examsections = `examsection:${examId}`;
//   const ExamsectionLanguge = `examlanguage:${examId}`;
//   const allQuestions = question.result;

//   if (!allQuestions.length)
//     return { studentQuestions: {}, uniqueLanguages: [], examsection: {} };

//   const sectionQuestionCount = {};
//   const groupedQuestions = {};

//   allQuestions.forEach((q) => {
//     const subject = q.question_subject;
//     const section = q.section;

//     if (!sectionQuestionCount[subject]) sectionQuestionCount[subject] = {};
//     if (!sectionQuestionCount[subject][section])
//       sectionQuestionCount[subject][section] = 0;
//     sectionQuestionCount[subject][section] += 1;

//     if (!groupedQuestions[subject]) groupedQuestions[subject] = {};
//     if (!groupedQuestions[subject][section])
//       groupedQuestions[subject][section] = [];

//     let options = {};
//     const optionMap = {
//       A: q.option_a,
//       B: q.option_b,
//       C: q.option_c,
//       D: q.option_d,
//     };

//     if (q.RandomizeOption?.toLowerCase() === "yes") {
//       const shuffled = shuffleArray(Object.entries(optionMap));
//       options = {
//         A: { text: shuffled[0][1], original_key: shuffled[0][0] },
//         B: { text: shuffled[1][1], original_key: shuffled[1][0] },
//         C: { text: shuffled[2][1], original_key: shuffled[2][0] },
//         D: { text: shuffled[3][1], original_key: shuffled[3][0] },
//       };
//     } else {
//       options = {
//         A: { text: q.option_a, original_key: "A" },
//         B: { text: q.option_b, original_key: "B" },
//         C: { text: q.option_c, original_key: "C" },
//         D: { text: q.option_d, original_key: "D" },
//       };
//     }

//     groupedQuestions[subject][section].push({
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
//       randomizeQuestion: q.RandomizeQuestion, // 👈 keep info for later
//     });
//   });

//   for (const subject in groupedQuestions) {
//     for (const section in groupedQuestions[subject]) {
//       const questions = groupedQuestions[subject][section];

//       const shouldShuffle =
//         questions[0]?.randomizeQuestion?.toLowerCase() === "yes";

//       groupedQuestions[subject][section] = shouldShuffle
//         ? shuffleArray(questions)
//         : questions; // keep original order
//     }
//   }

//   const uniqueLanguages = [...new Set(allQuestions.map((q) => q.Language))];

//   await redisClient.set(
//     Examsections,
//     JSON.stringify(sectionQuestionCount),
//     "EX",
//     3600
//   );
//   await redisClient.set(
//     ExamsectionLanguge,
//     JSON.stringify(uniqueLanguages),
//     "EX",
//     3600
//   );
//   await redisClient.set(redisKey, JSON.stringify(groupedQuestions), "EX", 3600);

//   return {
//     studentQuestions: groupedQuestions,
//     uniqueLanguages,
//     examsection: sectionQuestionCount,
//   };
// }
// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function fetchAndShuffleSectionsQuestions(question, examId, studentId) {
  const redisKey = `student_exam:${studentId}:${examId}`;
  const Examsections = `examsection:${examId}`;
  const ExamsectionLanguge = `examlanguage:${examId}`;

  const allQuestions = question.result;

  if (!allQuestions.length)
    return { studentQuestions: {}, uniqueLanguages: [], examsection: {} };

  const sectionQuestionCount = {};
  const groupedQuestions = {};
  let hasSection = false;

  allQuestions.forEach((q) => {
    const subject = q.question_subject;
    const section = q.section || null;

    if (section) hasSection = true;

    if (!sectionQuestionCount[subject]) {
      sectionQuestionCount[subject] = section ? {} : 0;
    }

    if (section) {
      if (!sectionQuestionCount[subject][section]) {
        sectionQuestionCount[subject][section] = 0;
      }
      sectionQuestionCount[subject][section] += 1;
    } else {
      sectionQuestionCount[subject] += 1;
    }
    // --- Grouped Questions ---
    if (!groupedQuestions[subject]) {
      groupedQuestions[subject] = section ? {} : [];
    }

    // Build options (shuffling ONLY if database says "yes")
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

    const questionData = {
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

    if (section) {
      if (!groupedQuestions[subject][section])
        groupedQuestions[subject][section] = [];
      groupedQuestions[subject][section].push(questionData);
    } else {
      groupedQuestions[subject].push(questionData);
    }
  });

  // ✅ ALWAYS shuffle questions (removed the condition check)

  if (hasSection) {
    for (const subject in groupedQuestions) {
      for (const section in groupedQuestions[subject]) {
        const questions = groupedQuestions[subject][section];
        groupedQuestions[subject][section] = shuffleArray(questions); // Always shuffle
      }
    }
  } else {
    for (const subject in groupedQuestions) {
      const questions = groupedQuestions[subject];
      groupedQuestions[subject] = shuffleArray(questions); // Always shuffle
    }
  }

  const uniqueLanguages = [...new Set(allQuestions.map((q) => q.Language))];

  // Save to Redis
  await redisClient.set(
    Examsections,
    JSON.stringify(sectionQuestionCount),
    "EX",
    3600
  );
  await redisClient.set(
    ExamsectionLanguge,
    JSON.stringify(uniqueLanguages),
    "EX",
    3600
  );
  await redisClient.set(redisKey, JSON.stringify(groupedQuestions), "EX", 3600);

  return {
    studentQuestions: groupedQuestions,
    uniqueLanguages,
    examsection: sectionQuestionCount,
  };
}

module.exports = { fetchAndShuffleSectionsQuestions };
