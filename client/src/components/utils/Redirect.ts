// Redirect.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

interface RedirectProps {
  to: string;
}

const Redirect = ({ to }: RedirectProps): null => {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
};

export default Redirect;
