"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute top-6 right-6 z-50">
        <button className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md opacity-0">
          <Sun className="h-5 w-5" />
        </button>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="absolute top-6 right-6 z-50">
      <button
        onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-95 shadow-lg"
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        {currentTheme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-500" />
        )}
      </button>
    </div>
  );
}
