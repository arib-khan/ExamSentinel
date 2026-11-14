
import { getMapList } from "@/services/MappingServices/mappingServices";
import { useCallback, useEffect, useState } from "react";

const useGetMapping = (examId, instId) => {

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    // ✅ Stop if either examId OR instId is missing
    if (!examId || !instId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMapList(examId, instId);
      setData(response.data?.result || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [examId, instId]); // ✅ Include BOTH IDs here!

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ Only depends on fetchData now

  return { data, error, loading, refetch: fetchData };
};

export default useGetMapping;
