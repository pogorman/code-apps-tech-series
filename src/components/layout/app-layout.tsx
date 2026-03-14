import type { ReactNode } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Users,
  ClipboardList,
  LayoutGrid,
  LayoutDashboard,
  FileText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickCreateStore } from "@/stores/quick-create-store";
import type { QuickCreateTarget } from "@/stores/quick-create-store";

interface AppLayoutProps {
  children: ReactNode;
}

/* ── Left sidebar navigation ────────────────────────────────── */

interface NavSection {
  label: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "core",
    items: [
      { to: "/accounts", label: "Accounts", icon: Building2 },
      { to: "/contacts", label: "Contacts", icon: Users },
    ],
  },
  {
    label: "activity",
    items: [
      { to: "/action-items", label: "Action Items", icon: ClipboardList },
    ],
  },
  {
    label: "capture",
    items: [
      { to: "/meeting-summaries", label: "Meetings", icon: FileText },
      { to: "/ideas", label: "Ideas", icon: Lightbulb },
    ],
  },
];

/* ── Quick create bar ───────────────────────────────────────── */

interface QuickCreateButton {
  target: NonNullable<QuickCreateTarget>;
  route: string;
  label: string;
  icon: typeof LayoutDashboard;
  color: string; // text & border color
  bg: string; // pastel background
}

const QUICK_CREATE_BUTTONS: QuickCreateButton[] = [
  {
    target: "action-items",
    route: "/action-items",
    label: "task",
    icon: ClipboardList,
    color: "text-red-500 border-red-200",
    bg: "bg-red-50 hover:bg-red-100",
  },
  {
    target: "ideas",
    route: "/ideas",
    label: "idea",
    icon: Lightbulb,
    color: "text-emerald-600 border-emerald-200",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    target: "accounts",
    route: "/accounts",
    label: "account",
    icon: Building2,
    color: "text-teal-600 border-teal-200",
    bg: "bg-teal-50 hover:bg-teal-100",
  },
  {
    target: "contacts",
    route: "/contacts",
    label: "contact",
    icon: Users,
    color: "text-blue-500 border-blue-200",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    target: "meeting-summaries",
    route: "/meeting-summaries",
    label: "summary",
    icon: FileText,
    color: "text-pink-500 border-pink-200",
    bg: "bg-pink-50 hover:bg-pink-100",
  },
];

/* ── Layout component ───────────────────────────────────────── */

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const openQuickCreate = useQuickCreateStore((s) => s.open);

  function handleQuickCreate(btn: QuickCreateButton) {
    const currentPath = location.pathname;
    if (currentPath === btn.route) {
      // Already on the right page — just open the dialog
      openQuickCreate(btn.target);
    } else {
      // Navigate first, then open after a tick so the component mounts
      openQuickCreate(btn.target);
      navigate(btn.route);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left sidebar ────────────────────────────────────── */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-white">
        {/* Logo / brand */}
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0078D4] to-[#50E6FF] shadow-sm">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--sidebar-from)]">
            Acct Mgmt
          </span>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label || "__root"} className="mt-4 first:mt-0">
              {section.label && (
                <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {section.label}
                </span>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-l-[3px] border-l-[#00BCF2] bg-[#00BCF2]/8 pl-[7px] text-[#0078D4]"
                        : "border-l-[3px] border-l-transparent pl-[7px] text-foreground/60 hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <span className="text-[10px] text-muted-foreground/50">
            Power Platform
          </span>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Quick create bar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-white px-6 py-2">
          <span className="mr-1 text-xs font-semibold tracking-wide text-muted-foreground/50 uppercase">
            quick create
          </span>
          {QUICK_CREATE_BUTTONS.map((btn) => (
            <button
              key={btn.target}
              onClick={() => handleQuickCreate(btn)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                btn.bg,
                btn.color
              )}
            >
              <btn.icon className="h-3.5 w-3.5" />
              {btn.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
