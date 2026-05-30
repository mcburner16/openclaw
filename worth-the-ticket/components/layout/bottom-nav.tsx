"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Library,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Library },
  { href: "/reviews/new", label: "Review", icon: PlusCircle },
  { href: "/analytics", label: "Stats", icon: BarChart2 },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d0d0d] border-t border-[#1e1e1e]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isCenter = item.href === "/reviews/new";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors select-none",
                isCenter
                  ? "relative"
                  : active
                  ? "text-red-400"
                  : "text-gray-600"
              )}
            >
              {isCenter ? (
                <div className="absolute -top-5 flex items-center justify-center w-12 h-12 rounded-full bg-red-600 shadow-lg shadow-red-900/50 border-4 border-[#0a0a0a]">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <>
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      active ? "text-red-500" : "text-gray-600"
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
              {isCenter && (
                <span className="mt-6 text-[10px] text-gray-600">Review</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
