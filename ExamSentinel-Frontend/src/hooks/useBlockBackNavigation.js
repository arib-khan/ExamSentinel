import { useEffect } from "react";

const useBlockBackNavigation = () => {
  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    // push initial dummy state
    preventBack();

    // listen for popstate event
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);
};

export default useBlockBackNavigation;
