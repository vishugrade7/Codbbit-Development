
"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  HTMLAttributes,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";

interface PlaceholdersAndVanishInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholders: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  value?: string;
}

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  value,
  ...props
}: PlaceholdersAndVanishInputProps): ReactElement {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!value) {
       interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [placeholders.length, value]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);

  const draw = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const text = placeholders[currentPlaceholder];
    ctx.font = "14px Inter";
    ctx.fillStyle = "hsl(var(--muted-foreground))";

    const newText = text.split("").map((char, index) => {
        const x = index * 8 + 10;
        const y = 20;
        const pro = frame / 100 - index * 0.01;
        const random = Math.random();
        if (pro < 0) {
            return {
                char, x, y
            }
        }
        if (pro > 1) {
            return {
                char, x: x + (pro - 1) * 8 * random * 10, y: y + (pro - 1) * 20 * random * 10,
            }
        }
        return {
            char, x, y: y + pro * 20 * random,
        }
    });

    newText.forEach(({ char, x, y }) => {
        ctx.fillText(char, x, y);
    })
  };

  useEffect(() => {
    let frame = 0;
    let requestId: number;

    const animate = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        frame++;
        draw(ctx, frame);
        if (frame < 200) {
            requestId = requestAnimationFrame(animate);
        } else {
            setAnimating(false);
        }
    };

    if (animating) {
        animate();
    }

    return () => {
        if (requestId) {
            cancelAnimationFrame(requestId);
        }
    };
  }, [animating, currentPlaceholder, draw, placeholders]);

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        if (onSubmit) onSubmit(e);
        if (inputRef.current) inputRef.current.blur();
      }}
    >
      <div className={cn("relative w-full", props.className)}>
        <input
          {...props}
          ref={inputRef}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="peer block w-full rounded-md border border-input bg-transparent py-2 pl-3 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-10"
        />
        <AnimatePresence>
          {!value && !isFocused && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-none absolute inset-0 flex items-center px-3"
            >
              <motion.p
                initial={{ opacity: 0, y: 10, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -10, x: 0 }}
                key={`placeholder-${currentPlaceholder}`}
                className="text-muted-foreground text-sm"
              >
                {placeholders[currentPlaceholder]}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md bg-primary p-1 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
    </form>
  );
}
