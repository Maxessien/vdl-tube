import AppHeader from "@/src/components/layouts-components/AppHeader";
import TopLoader from "@/src/components/reusable-components/TopLoader";
import "@/src/index.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../src/assets/css-reusable/variables.css";
import AppProviders from "./providers";

export const metadata: Metadata = {
  title: "VDL Tube",
  icons: {
    icon: "/vdl_tube_logo_transparent.png",
  },
};

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <TopLoader />
        <AppProviders>
          <AppHeader />
          {children}
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AppProviders>
      </body>
    </html>
  );
};

export default AppLayout;
