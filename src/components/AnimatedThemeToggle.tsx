
"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import React, { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AnimationVariant = "circle" | "rectangle";
type AnimationStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "top-center"
  | "bottom-center"
  | "bottom-up"
  | "top-down"
  | "left-right"
  | "right-left";

interface Animation {
  name: string;
  css: string;
}

export const useThemeToggle = ({
  variant = "circle",
  start = "center",
  blur = false,
}: {
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
} = {}) => {
  const { theme, setTheme } = useTheme();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    setIsDark(effectiveTheme === "dark");
  }, [theme]);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" || theme === "system" ? "dark" : "light";
    
    const animation = createAnimation(variant, start, blur);

    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(newTheme);
    };

    // @ts-ignore
    if (!document.startViewTransition) {
      switchTheme();
      return;
    }
    // @ts-ignore
    document.startViewTransition(switchTheme);
  }, [theme, setTheme, variant, start, blur, updateStyles]);

  return { isDark, toggleTheme };
};

const getPositionCoords = (position: AnimationStart) => {
    switch (position) {
      case "top-left": return { cx: "0", cy: "0" };
      case "top-right": return { cx: "40", cy: "0" };
      case "bottom-left": return { cx: "0", cy: "40" };
      case "bottom-right": return { cx: "40", cy: "40" };
      case "top-center": return { cx: "20", cy: "0" };
      case "bottom-center": return { cx: "20", cy: "40" };
      case "bottom-up":
      case "top-down":
      case "left-right":
      case "right-left": return { cx: "20", cy: "20" };
      default: return { cx: "20", cy: "20" };
    }
};
  
const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
    if (start === "center" || variant === "rectangle") return "";

    const { cx, cy } = getPositionCoords(start);

    if (variant === "circle") {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
    }
    return "";
};

const getTransformOrigin = (start: AnimationStart) => {
    switch (start) {
        case "top-left": return "top left";
        case "top-right": return "top right";
        case "bottom-left": return "bottom left";
        case "bottom-right": return "bottom right";
        case "top-center": return "top center";
        case "bottom-center": return "bottom center";
        case "bottom-up":
        case "top-down":
        case "left-right":
        case "right-left": return "center";
        default: return "center";
    }
};

const createAnimation = (
    variant: AnimationVariant,
    start: AnimationStart = "center",
    blur = false,
  ): Animation => {
    const svg = generateSVG(variant, start);
    const transformOrigin = getTransformOrigin(start);
  
    if (variant === "rectangle") {
      const getClipPath = (direction: AnimationStart) => {
        switch (direction) {
          case "bottom-up": return { from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" };
          case "top-down": return { from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" };
          case "left-right": return { from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" };
          case "right-left": return { from: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" };
          default: return { from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" };
        }
      };
      const clipPath = getClipPath(start);
      return {
        name: `${variant}-${start}${blur ? "-blur" : ""}`,
        css: `
          ::view-transition-new(root) { animation-name: reveal-light-${start}${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
          .dark::view-transition-new(root) { animation-name: reveal-dark-${start}${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
          @keyframes reveal-dark-${start}${blur ? "-blur" : ""} { from { clip-path: ${clipPath.from}; ${blur ? "filter: blur(8px);" : ""} } to { clip-path: ${clipPath.to}; ${blur ? "filter: blur(0px);" : ""} } }
          @keyframes reveal-light-${start}${blur ? "-blur" : ""} { from { clip-path: ${clipPath.from}; ${blur ? "filter: blur(8px);" : ""} } to { clip-path: ${clipPath.to}; ${blur ? "filter: blur(0px);" : ""} } }
        `,
      };
    }
  
    if (variant === "circle" && start === "center") {
      return {
        name: `${variant}-${start}${blur ? "-blur" : ""}`,
        css: `
          ::view-transition-new(root) { animation-name: reveal-light${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
          .dark::view-transition-new(root) { animation-name: reveal-dark${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
          @keyframes reveal-dark${blur ? "-blur" : ""} { from { clip-path: circle(0% at 50% 50%); ${blur ? "filter: blur(8px);" : ""} } to { clip-path: circle(100.0% at 50% 50%); ${blur ? "filter: blur(0px);" : ""} } }
          @keyframes reveal-light${blur ? "-blur" : ""} { from { clip-path: circle(0% at 50% 50%); ${blur ? "filter: blur(8px);" : ""} } to { clip-path: circle(100.0% at 50% 50%); ${blur ? "filter: blur(0px);" : ""} } }
        `,
      };
    }
    
    const getClipPathPosition = (position: AnimationStart) => {
        switch (position) {
          case "top-left": return "0% 0%";
          case "top-right": return "100% 0%";
          case "bottom-left": return "0% 100%";
          case "bottom-right": return "100% 100%";
          case "top-center": return "50% 0%";
          case "bottom-center": return "50% 100%";
          default: return "50% 50%";
        }
    };
    const clipPosition = getClipPathPosition(start);
    return {
        name: `${variant}-${start}${blur ? "-blur" : ""}`,
        css: `
            ::view-transition-new(root) { animation-name: reveal-light-${start}${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
            .dark::view-transition-new(root) { animation-name: reveal-dark-${start}${blur ? "-blur" : ""}; ${blur ? "filter: blur(2px);" : ""} }
            @keyframes reveal-dark-${start}${blur ? "-blur" : ""} { from { clip-path: circle(0% at ${clipPosition}); ${blur ? "filter: blur(8px);" : ""} } to { clip-path: circle(150.0% at ${clipPosition}); ${blur ? "filter: blur(0px);" : ""} } }
            @keyframes reveal-light-${start}${blur ? "-blur" : ""} { from { clip-path: circle(0% at ${clipPosition}); ${blur ? "filter: blur(8px);" : ""} } to { clip-path: circle(150.0% at ${clipPosition}); ${blur ? "filter: blur(0px);" : ""} } }
        `,
    };
  };

export const AnimatedThemeToggle = ({
  className = "",
  variant = "circle",
  start = "center",
  blur = false,
}: {
  className?: string;
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
}) => {
  const { isDark, toggleTheme } = useThemeToggle({ variant, start, blur });

  return (
    <button
      type="button"
      className={cn(
        "size-8 cursor-pointer rounded-full bg-transparent p-0 transition-all duration-300 active:scale-95",
        className
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
        <motion.g
          animate={{ rotate: isDark ? -180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill={isDark ? "black" : "white"}
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            fill={isDark ? "white" : "black"}
          />
        </motion.g>
        <motion.path
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};
