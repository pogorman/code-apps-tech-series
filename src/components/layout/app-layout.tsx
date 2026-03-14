import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Building2, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">CRM Demo</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
