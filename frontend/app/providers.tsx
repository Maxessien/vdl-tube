"use client";

import store from "@/src/store";
import { setScreenSize } from "@/src/store-slices/screenSizeSlice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const updateScreenSize = () => {
      store.dispatch(
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );
};

export default AppProviders;
