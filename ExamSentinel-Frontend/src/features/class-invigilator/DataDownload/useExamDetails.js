import { getExamDetailsByCenter } from "@/services/MappingServices/mappingServices";
import { useEffect, useState, useCallback } from "react";

const useExamDetails = (centerId) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!centerId) {
      setData([]); // no exam selected = empty table
      return;
    }

    setLoading(true);
    setError(null);

    try {
     const response = await getExamDetailsByCenter(6);
      setData(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
};



export default useExamDetails;


