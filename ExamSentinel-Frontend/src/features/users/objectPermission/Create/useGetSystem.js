import { getSystemObjectList } from "@/services/PermissionServices/objectPermision";
import { useCallback, useEffect, useState } from "react";

const useGetSystem = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSystemObjectList();
      console.log(response);
      

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

export default useGetSystem;
