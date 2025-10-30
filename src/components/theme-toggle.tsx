"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme || "light");
  }, [theme, setTheme]);

  const onClick = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button className="size-8 border-none" onClick={onClick} size="icon" variant="outline">
      <Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
