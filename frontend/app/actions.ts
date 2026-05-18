"use server";

import { YT_COOKIE_NAME } from "@/src/utils/downloadApi";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Innertube } from "youtubei.js";

// Action 1: Start login flow and return code to user
export const startDeviceFlow = async () => {
  const youtube = await Innertube.create();

  return new Promise((resolve) => {
    youtube.session.on("auth-pending", (data) => {
      console.log({ url: data.verification_url, code: data.user_code });
      resolve({ url: data.verification_url, code: data.user_code });
    });

    youtube.session.on("auth", async ({ credentials }) => {
      // SECURELY save credentials in a client cookie that JS cannot touch
      const cookieStore = await cookies();
      const token = jwt.sign(
        JSON.stringify(credentials),
        process.env.JWT_SECRET,
      );
      cookieStore.set(YT_COOKIE_NAME, token, {
        httpOnly: true, // Prevents XSS script theft
        secure: process.env.NODE_ENV !== "development", // Forces HTTPS
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    });

    youtube.session.on("update-credentials", async ({ credentials }) => {
      // SECURELY refresh credentials in a client cookie that JS cannot touch
      const cookieStore = await cookies();
      const token = jwt.sign(
        JSON.stringify(credentials),
        process.env.JWT_SECRET,
      );
      cookieStore.set(YT_COOKIE_NAME, token, {
        httpOnly: true, // Prevents XSS script theft
        secure: process.env.NODE_ENV !== "development", // Forces HTTPS
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    });

    youtube.session.signIn();
  });
};
