import { getExamList } from "@/services/ExamServices/examService";
import { useEffect, useState, useCallback } from "react";

const useGetList = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getExamList();
      setData(response.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
};

export default useGetList;
