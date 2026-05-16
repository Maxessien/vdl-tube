import Home from "@/src/components/home-components/Home";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Innertube } from "youtubei.js";

export const metadata: Metadata = {
  title: "VDL Tube",
};

const HomePage = async () => {
  let isSignedIn = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_secure_session")?.value;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const youtube = await Innertube.create();
      await youtube.session.signIn(decoded);
      isSignedIn = youtube.session.logged_in;
    }
  } catch (error) {
    isSignedIn = false;
  }

  return <Home isSignedIn={isSignedIn} />;
};

export default HomePage;
