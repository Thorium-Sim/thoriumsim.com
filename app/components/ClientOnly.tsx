import {ReactNode, useEffect, useState} from "react";

export default function ClientOnly({
  children,
}: {
  children: JSX.Element;
}): JSX.Element | null {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);
  if (!loaded) return null;
  return children;
}
