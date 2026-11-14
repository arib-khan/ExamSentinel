import {  getCenterInvetoryListByCenter } from "@/services/CenterServices/centerServices";
import { useEffect, useState, useCallback } from "react";

const useGetList = (id) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
      if (!id) {
      setData([]); 
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await getCenterInvetoryListByCenter(id);
      setData(response.data?.result || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
