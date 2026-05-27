import Home from "@/src/components/home-components/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VDL Tube",
};

const HomePage = async () => {
  return <Home />;
};

export default HomePage;
