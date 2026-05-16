"use client";

import { startDeviceFlow } from "@/app/actions";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaCopy, FaExternalLinkAlt, FaYoutube } from "react-icons/fa";
import { toast } from "react-toastify";
import LoadRoller from "../reusable-components/LoadRoller";
import Search from "./Search";

interface HomeProps {
  isSignedIn?: boolean;
}

const Home = ({ isSignedIn = false }: HomeProps) => {
  const [showLink, setShowLink] = useState({ show: false, link: "", code: "" });
  
  const { mutateAsync, isPending } = useMutation({
    mutationFn: startDeviceFlow,
    onSuccess: ({ code, url }: { url: string; code: string }) => {
      setShowLink({ code, link: url, show: true });
      console.log("Ran success")
    },
    onError: () => toast.error("Sign In failed"),
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg px-2 pt-20 gap-4">
      <h1 className="text-3xl text-(--text-primary) mb-4 w-full text-center font-semibold">
        VDL Tube
      </h1>
      <Search />
      
      {!isSignedIn && !showLink.show && (
        <div className="flex justify-center my-6">
          <button
            onClick={() => mutateAsync()}
            disabled={isPending}
            className="flex min-w-60 items-center justify-center gap-2 rounded-md bg-(--main-primary) px-3 sm:px-6 lg:px-8 py-2 text-lg font-medium tracking-wide text-(--text-primary) shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-(--main-primary-light) hover:shadow-lg hover:shadow-(--main-primary)/50 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-80 disabled:scale-100"
          >
            {isPending ? (
              <div className="w-10"><LoadRoller /></div>
            ) : (
              <>
                <FaYoutube className="text-2xl" />
                Sign In with YouTube
              </>
            )}
          </button>
        </div>
      )}

      {showLink.show && (
        <div className="mt-8 rounded-xl border border-(--main-primary)/20 bg-(--main-primary)/5 p-6 shadow-xl backdrop-blur-sm animate-fade-in">
          <h2 className="text-xl font-bold text-(--text-primary) mb-4 text-center flex items-center justify-center gap-2">
            Device Activation
          </h2>
          
          <div className="space-y-4 mb-6 text-sm text-(--text-primary)/80">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--main-primary) text-xs font-bold text-white">1</span>
              <p>Copy the activation code shown below.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--main-primary) text-xs font-bold text-white">2</span>
              <p>Click the activation link to open Google verification.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--main-primary) text-xs font-bold text-white">3</span>
              <p>Paste the code and confirm to sign in.</p>
            </div>
          </div>

          <div className="bg-(--main-primary)/10 p-4 rounded-lg flex items-center justify-between border border-(--main-primary)/20 mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-(--text-primary)/60 block font-semibold">Your Code</span>
              <span className="text-2xl font-mono font-bold tracking-widest text-(--text-primary)">{showLink.code}</span>
            </div>
            <button 
              onClick={() => copyToClipboard(showLink.code)}
              className="p-3 bg-(--main-primary)/20 hover:bg-(--main-primary)/40 text-(--text-primary) rounded-md transition-colors"
              title="Copy Code"
            >
              <FaCopy className="text-lg" />
            </button>
          </div>

          <a 
            href={showLink.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-(--main-primary) py-3 text-md font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:bg-(--main-primary-light) hover:shadow-lg active:scale-98"
          >
            Go to Activation Link <FaExternalLinkAlt className="text-sm" />
          </a>
        </div>
      )}
    </main>
  );
};

export default Home;
