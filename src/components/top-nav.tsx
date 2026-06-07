
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Compass, Wand2, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "./user-button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/suggestions", label: "Vibe", icon: Wand2 },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 z-50 w-full h-16 border-b border-zinc-800 bg-background/95 backdrop-blur-md flex items-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 mr-4">
              <Image src="/logo.png" alt="CineStash Logo" width={180} height={65} className="h-10 md:h-12 w-auto" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
             {navItems.map((item) => {
              const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold tracking-wide transition-all duration-300 px-3 py-2 rounded-md",
                    isActive
                      ? "text-foreground bg-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
