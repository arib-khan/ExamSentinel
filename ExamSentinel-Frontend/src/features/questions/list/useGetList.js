// import { getQuestionList } from "@/services/QuestionServices/questionService";
// import { useEffect, useState, useCallback } from "react";

// const useGetList = () => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await getQuestionList();
//       setData(response?.data?.result);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return {
//     data,
//     error,
//     loading,
//     refetch: fetchData,
//   };
// };

// export default useGetList;


import { getQuestionByExamid } from "@/services/QuestionServices/questionService";
import { useCallback, useEffect, useState } from "react";

const useGetList = (examId) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!examId) {
      setData([]); // no exam selected = empty table
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getQuestionByExamid(examId); // ✅ pass examId to service
      setData(response.data?.result || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
};

export default useGetList;
