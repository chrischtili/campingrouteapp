import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RoutePlanner } from "@/components/route-planner/RoutePlanner";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("placeFinder") === "true") {
      navigate("/campingplatz-finder", { replace: true });
      return;
    }

    if (params.get("plan") === "true") {
      navigate("/prompt-generator", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (!location.hash) return;

    const targetId = decodeURIComponent(location.hash.slice(1));

    const scrollToTarget = () => {
      const element = document.getElementById(targetId);
      if (!element) return;

      const navbarOffset = 96;
      const y = element.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    const timeoutId = window.setTimeout(scrollToTarget, 120);
    return () => window.clearTimeout(timeoutId);
  }, [location.hash]);

  return <RoutePlanner />;
};

export default Index;
