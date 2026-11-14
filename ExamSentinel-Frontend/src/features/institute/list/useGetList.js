import { useCallback, useEffect, useState } from "react";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";

const useGetList = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInstitutionList();
      
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

export default useGetList;
