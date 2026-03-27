import type { ReactNode } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  Columns3,
  FileText,
  FolderKanban,
  House,
  LayoutDashboard,
  Lightbulb,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickCreateStore } from "@/stores/quick-create-store";
import type { QuickCreateTarget } from "@/stores/quick-create-store";

interface AppLayoutProps {
  children: ReactNode;
}

/* ── Left sidebar navigation ────────────────────────────────── */

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  color?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "insights",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/board", label: "My Board", icon: Columns3 },
    ],
  },
  {
    label: "activity",
    items: [
      { to: "/action-items", label: "Action Items", icon: ClipboardList, color: "#ef4444" },
    ],
  },
  {
    label: "capture",
    items: [
      { to: "/ideas", label: "Ideas", icon: Lightbulb, color: "#059669" },
      { to: "/meeting-summaries", label: "Meetings", icon: FileText, color: "#ec4899" },
      { to: "/projects", label: "Projects", icon: FolderKanban, color: "#7c3aed" },
    ],
  },
  {
    label: "core",
    items: [
      { to: "/accounts", label: "Accounts", icon: Building2, color: "#0d9488" },
      { to: "/contacts", label: "Contacts", icon: Users, color: "#0ea5e9" },
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
  payload?: Record<string, unknown>;
}

const QUICK_CREATE_BUTTONS: QuickCreateButton[] = [
  {
    target: "action-items",
    route: "/action-items",
    label: "work",
    icon: Briefcase,
    color: "text-red-500 border-red-200",
    bg: "bg-red-50 hover:bg-red-100",
    payload: { taskType: 468510001 },
  },
  {
    target: "action-items",
    route: "/action-items",
    label: "personal",
    icon: House,
    color: "text-blue-500 border-blue-200",
    bg: "bg-blue-50 hover:bg-blue-100",
    payload: { taskType: 468510000 },
  },
  {
    target: "action-items",
    route: "/action-items",
    label: "learning",
    icon: BookOpen,
    color: "text-fuchsia-500 border-fuchsia-200",
    bg: "bg-fuchsia-50 hover:bg-fuchsia-100",
    payload: { taskType: 468510002 },
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
    target: "meeting-summaries",
    route: "/meeting-summaries",
    label: "meeting",
    icon: FileText,
    color: "text-pink-500 border-pink-200",
    bg: "bg-pink-50 hover:bg-pink-100",
  },
  {
    target: "projects",
    route: "/projects",
    label: "project",
    icon: FolderKanban,
    color: "text-violet-600 border-violet-200",
    bg: "bg-violet-50 hover:bg-violet-100",
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
    color: "text-sky-500 border-sky-200",
    bg: "bg-sky-50 hover:bg-sky-100",
  },
];

/* ── Layout component ───────────────────────────────────────── */

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const openQuickCreate = useQuickCreateStore((s) => s.open);

  function handleQuickCreate(btn: QuickCreateButton) {
    openQuickCreate(btn.target, btn.payload);
    if (location.pathname !== btn.route) {
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
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--sidebar-from)]">
            My Work
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
                  <item.icon
                    className="h-4 w-4 shrink-0"
                    style={item.color ? { color: item.color } : undefined}
                  />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 space-y-1.5">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-3 w-3" />
            Search
            <kbd className="ml-auto rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Ctrl+K
            </kbd>
          </button>
          <span className="block text-[10px] text-muted-foreground/50">
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
              key={`${btn.target}-${btn.label}`}
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
