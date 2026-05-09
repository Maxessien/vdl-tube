/* eslint-disable @next/next/no-img-element */
"use client";

import "@khmyznikov/pwa-install";
import { PWAInstallElement } from "@khmyznikov/pwa-install";

import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";

const AppHeader = () => {
  const router = useRouter();
  const pwaRef = useRef<PWAInstallElement>(null);
  const [canInstall, setCanInstall] = useState(true);

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

    const pwaElement = pwaRef.current;
    if (pwaElement) {
      pwaElement.addEventListener("pwa-install-available", handlePwaAvailable);
      pwaElement.addEventListener("pwa-install-success", handlePwaInstalled);
    }

    return () => {
      if (pwaElement) {
        pwaElement.removeEventListener("pwa-install-available", handlePwaAvailable);
        pwaElement.removeEventListener("pwa-install-success", handlePwaInstalled);
      }
    };
  }, []);

  return (
    <header className="flex flex-wrap justify-between w-full items-center gap-3 sm:px-5 md:px-6 lg:px-8 px-3 py-4">
      <div
        onClick={() => router.push("/")}
        className="flex justify-start gap-2 cursor-pointer items-center"
      >
        <img className="w-10" src="/vdl_tube_logo_transparent.png" alt="logo" />
        <h1 className="sm:text-2xl text-xl font-semibold text-(--text-primary)">
          <span>VDL</span> <span className="text-[#ff8800]">Tube</span>
        </h1>
      </div>
      <pwa-install manifest-url="/manifest.webmanifest" ref={pwaRef}></pwa-install>
      {canInstall && (
        <button 
          onClick={triggerInstall}
          className="bg-[#7a470d] text-(--text-primary) flex gap-2 items-center justify-center px-4 py-2 rounded-full font-medium text-sm transition-opacity hover:opacity-90"
        >
         <span><FaDownload /></span> <span>Install App</span>
        </button>
      )}
    </header>
  );
};

export default AppHeader;
