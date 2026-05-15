"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

const QuerySearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const getSuggestions = async () => {
    if (!(query.trim().length > 0)) return;
    const s = await axios.get<string[]>("/api/suggestions", {
      params: { query },
    });
    setSuggestions(s.data);
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: getSuggestions,
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(mutateAsync, 700);
  }, [query, mutateAsync]);

  const router = useRouter();
  return (
    <section className="space-y-3 max-w-5xl mx-auto">
      <form
        onSubmit={() => {
          router.push(`/search?query=${query}`);
        }}
        className="w-full relative"
      >
        <input
          className="w-full text-base md:text-lg font-medium text-(--text-primary) p-2 pl-8 outline-none border-b-2 border-b-(--main-secondary-light) focus:border-b-gray-400"
          onChange={(e) => handleChange(e)}
          type="text"
          placeholder="Search video..."
          autoFocus={true}
        />
        <button
          className="absolute text-(--text-primary) z-99 top-1/2 left-2 -translate-y-1/2 font-medium text-lg"
          type="submit"
        >
          <FaSearch />
        </button>
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: 0 }}
          transition={{ ease: "linear", duration: 0.3 }}
          className="bg-(--main-secondary) z-999 w-full absolute top-0 left-0 h-full"
        ></motion.div>
      </form>

      <ul className="w-full px-1 sm:px-3 gap-2 items-start flex flex-col">
        {suggestions.length > 0 ? (
          suggestions.map((s, idx) => (
            <li
              className="w-full"
              key={idx}
              onClick={() => {
                if (!(s.trim().length > 0)) return;
                router.push(`/search?query=${s}`);
              }}
            >
              <button className="font-medium px-3 text-left cursor-pointer text-(--text-primary) w-full py-2 hover:bg-(--main-secondary-light) rounded-sm">
                {s}
              </button>
            </li>
          ))
        ) : (
          <p className="w-full text-center font-medium text-lg lg:text-xl text-(--text-primary)">
            No Suggestion
          </p>
        )}
      </ul>
    </section>
  );
};

export default QuerySearchBar;
