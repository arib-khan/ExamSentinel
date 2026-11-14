// import { getStudentList } from "@/services/StudentServices/studentService";
// import { useCallback, useEffect, useState } from "react";

// const useGetList = () => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await getStudentList();

//       setData(response.data?.result);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, error, loading, refetch: fetchData };
// };

// export default useGetList;

import { getStudentByExamId } from "@/services/StudentServices/studentService";
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
      const response = await getStudentByExamId(examId); // ✅ pass examId to service
      setData(response.data?.result || []);
      console.log(response);
      
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
