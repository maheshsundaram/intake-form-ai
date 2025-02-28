"use client";

import { useEffect, useState } from "react";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait until the store is hydrated from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // You can show a loading state here if needed
    return null;
  }

  return <>{children}</>;
}
