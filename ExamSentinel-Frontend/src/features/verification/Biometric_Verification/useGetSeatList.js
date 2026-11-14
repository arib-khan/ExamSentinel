import { getStudentSeatList } from "@/services/StudentServices/studentService";
import { useCallback, useEffect, useState } from "react";

const useGetSeatList = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getStudentSeatList();
      setData(response.data?.result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }   
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
};

export default useGetSeatList;