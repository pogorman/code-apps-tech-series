import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Building2, Users, ClipboardList, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/action-items", label: "Action Items", icon: ClipboardList },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Microsoft-style accent bar */}
      <div className="h-1 shrink-0 bg-gradient-to-r from-[#0078D4] via-[#50E6FF] to-[#00BCF2]" />

      {/* Title bar */}
      <header className="flex h-12 items-center gap-3 bg-gradient-to-r from-[var(--sidebar-from)] to-[var(--sidebar-to)] px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0078D4] shadow-md">
          <LayoutGrid className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Account Management
        </span>
        <span className="ml-auto text-xs text-white/40">Power Platform</span>
      </header>

      {/* Navigation tiles */}
      <nav className="flex gap-3 bg-[var(--sidebar-from)] px-6 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-[50px] w-[100px] flex-col items-center justify-center gap-1 rounded-lg px-3 text-[10px] font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-[#0078D4] text-white shadow-lg shadow-[#0078D4]/30"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
