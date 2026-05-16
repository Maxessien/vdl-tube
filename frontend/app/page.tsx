import Home from "@/src/components/home-components/Home";
import { UserHomeFeed } from "@/src/types/matesTypes";
import { YT_COOKIE_NAME } from "@/src/utils/downloadApi";
import { getUserHomeFeed } from "@/src/utils/youtubei";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Innertube } from "youtubei.js";

export const metadata: Metadata = {
  title: "VDL Tube",
};

const HomePage = async () => {
  let isSignedIn = false;
  let homefeed: UserHomeFeed | null = null

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(YT_COOKIE_NAME)?.value;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const youtube = await Innertube.create();
      await youtube.session.signIn(JSON.parse(decoded));
      isSignedIn = youtube.session.logged_in;
      if (isSignedIn) homefeed = await getUserHomeFeed(youtube)
    }
  } catch (error) {
    isSignedIn = false;
  }

  return <Home feed={homefeed} isSignedIn={isSignedIn} />;
};

export default HomePage;
