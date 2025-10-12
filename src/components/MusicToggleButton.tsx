
"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import useSound from "use-sound";

export const MusicToggleButton = () => {
  const bars = 5;

  const getRandomHeights = () => {
    return Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
  };

  const [heights, setHeights] = useState(getRandomHeights());
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [play, { pause }] = useSound("/audio/audio.m4a", {
    loop: true,
    onplay: () => setIsPlaying(true),
    onend: () => setIsPlaying(false),
    onpause: () => setIsPlaying(false),
    onstop: () => setIsPlaying(false),
    soundEnabled: hasInteracted,
  });

  useEffect(() => {
    if (isPlaying) {
      const waveformIntervalId = setInterval(() => {
        setHeights(getRandomHeights());
      }, 100);

      return () => {
        clearInterval(waveformIntervalId);
      };
    }
    setHeights(Array(bars).fill(0.1));
  }, [isPlaying]);

  const handleClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      key="audio"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.6 }}
      className="bg-transparent cursor-pointer rounded-full p-2 h-8 w-8 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
        }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ type: "spring", bounce: 0.35 }}
        className="flex h-4 w-full items-center justify-center gap-0.5"
      >
        {heights.map((height, index) => (
          <motion.div
            key={index}
            className="bg-foreground w-px rounded-full"
            initial={{ height: 1 }}
            animate={{
              height: Math.max(2, height * 14),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
