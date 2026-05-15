/* eslint-disable @next/next/no-img-element */
"use client";

import "@khmyznikov/pwa-install";
import { PWAInstallElement } from "@khmyznikov/pwa-install";
import { usePathname } from "next/navigation";

import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";

const AppHeader = () => {
  const router = useRouter();
  const pwaRef = useRef<PWAInstallElement>(null);
  const [canInstall, setCanInstall] = useState(false);

  const triggerInstall = () => {
    if (!canInstall || !pwaRef.current) return;
    pwaRef.current.showDialog();
  };

  useEffect(() => {
    const handlePwaAvailable = (e: any) => {
      setCanInstall(true);
    };

    const handlePwaInstalled = () => {
      setCanInstall(false);
    };

    const handleChoiceEvent = (e: any) => {
      pwaElement.userChoiceResult === "accepted"
        ? handlePwaInstalled()
        : handlePwaAvailable(e);
    };

    const pwaElement = pwaRef.current;
    if (pwaElement) {
      pwaElement.addEventListener(
        "pwa-install-available-event",
        handlePwaAvailable,
      );
      pwaElement.addEventListener(
        "pwa-user-choice-result-event",
        handleChoiceEvent,
      );
      pwaElement.addEventListener(
        "pwa-install-success-event",
        handlePwaInstalled,
      );
    }

    return () => {
      if (pwaElement) {
        pwaElement.removeEventListener(
          "pwa-install-available-event",
          handlePwaAvailable,
        );
        pwaElement.removeEventListener(
          "pwa-user-choice-result-event",
          handleChoiceEvent,
        );
        pwaElement.removeEventListener(
          "pwa-install-success-event",
          handlePwaInstalled,
        );
      }
    };
  }, []);

  const pathname = usePathname();

  return (
    <header className="flex flex-wrap justify-between items-center gap-3 sm:px-5 md:px-6 lg:px-8 px-3 py-4">
      <div className="flex-1 flex justify-between items-center gap-2">
        <div
          onClick={() => router.push("/")}
          className="flex justify-start gap-2 cursor-pointer items-center"
        >
          <img
            className="w-10"
            src="/vdl_tube_logo_transparent.png"
            alt="logo"
          />
          <h1 className="sm:text-2xl text-xl font-semibold text-(--text-primary)">
            <span>VDL</span> <span className="text-[#ff8800]">Tube</span>
          </h1>
        </div>
        {(pathname !== "/" && (pathname as string) !== "/query") && (
          <button
            onClick={() => router.push("/query")}
            className="text-xl text-(--text-primary) hover:bg-(--main-secondary-light) p-2 rounded-full font-medium"
          >
            <FaSearch />
          </button>
        )}
      </div>
      <pwa-install
        manifest-url="/manifest.webmanifest"
        ref={pwaRef}
      ></pwa-install>
      {canInstall && (
        <button
          onClick={triggerInstall}
          className="bg-[#703e04] flex gap-2 justify-center items-center text-(--text-primary) px-3 py-2.5 rounded-full font-medium text-sm sm:text-base transition-opacity hover:opacity-90"
        >
          <span>
            <FaDownload />
          </span>{" "}
          <span>Install App</span>
        </button>
      )}
    </header>
  );
};

export default AppHeader;
