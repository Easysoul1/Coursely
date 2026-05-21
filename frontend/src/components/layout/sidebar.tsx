"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  Bookmark,
  User,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/student", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/student/assessment", label: "Assessment", icon: ClipboardCheck },
  { href: "/dashboard/student/results", label: "My Results", icon: BarChart3 },
  { href: "/dashboard/student/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/student/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <GraduationCap className="h-5 w-5 text-primary" />
        <span className="font-bold">Coursely</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors rounded-md",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
