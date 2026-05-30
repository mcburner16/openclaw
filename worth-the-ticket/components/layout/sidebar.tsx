"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Library,
  BarChart2,
  Lightbulb,
  Calendar,
  Star,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reviews/new", label: "New Review", icon: PlusCircle },
  { href: "/library", label: "Content Library", icon: Library },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/recommendations", label: "Recommendations", icon: Star },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/ideas", label: "Daily Ideas", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#0d0d0d] border-r border-[#1e1e1e] h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 bg-red-600 rounded-lg shadow-lg shadow-red-900/40">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Worth the</p>
            <p className="text-xs font-bold text-amber-500 leading-tight tracking-widest uppercase">Ticket?</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 mt-2 leading-tight">
          Honest Reviews. Real Reactions.
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all group",
                active
                  ? "bg-red-600/15 text-red-400 font-medium border border-red-600/20"
                  : "text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-red-500" : "text-gray-600 group-hover:text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e1e]">
        <div className="ticket-notch bg-[#141414] rounded px-3 py-2 mx-1">
          <p className="text-[10px] text-gray-600 text-center font-mono tracking-wider">
            — ADMIT ONE —
          </p>
        </div>
      </div>
    </aside>
  );
}
