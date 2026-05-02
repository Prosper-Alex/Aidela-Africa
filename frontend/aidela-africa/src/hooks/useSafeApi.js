// Key feature: Runs async UI requests while avoiding state updates after unmount.
import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function useSafeApi(fetcher, deps = [], options = {}) {
  const { defaultData = [], transform } = options;
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetcher(...args);
        const safeResponse = transform ? transform(response) : response;

        if (!isMounted.current) return safeResponse;

        if (Array.isArray(safeResponse)) {
          setData(safeResponse);
        } else if (safeResponse === null || safeResponse === undefined) {
          setData(defaultData);
        } else {
          setData(safeResponse);
        }

        return safeResponse;
      } catch (err) {
        console.error("[useSafeApi] Error:", err);
        const msg = getErrorMessage(
          err,
          "Something went wrong while fetching data",
        );
        if (isMounted.current) setError(msg);
        throw err;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
    // fetchData is stable because it's memoized with deps above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  return { data, setData, loading, error, refetch: fetchData };
}
