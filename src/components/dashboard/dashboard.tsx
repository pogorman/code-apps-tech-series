import { useMemo, useState } from "react";
import { useActionItems } from "@/hooks/use-action-items";
import { useAccounts } from "@/hooks/use-accounts";
import type { Tdvsp_actionitemsModel } from "@/generated";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_TYPE_LABELS,
} from "@/components/action-items/labels";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { DrilldownDialog } from "./drilldown-dialog";

type ActionItem = Tdvsp_actionitemsModel.Tdvsp_actionitems;

/* ── colour tokens ─────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  Recognized: "#888780",
  "In Progress": "#378ADD",
  "Pending Comms": "#EF9F27",
  "On Hold": "#ef4444",
  "Wrapping Up": "#8b5cf6",
  Complete: "#1D9E75",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Top Priority": "#E24B4A",
  High: "#EF9F27",
  Low: "#378ADD",
  Eh: "#888780",
};

const ACCOUNT_PALETTE = ["#378ADD", "#1D9E75", "#EF9F27", "#8b5cf6", "#E24B4A", "#888780"];

/* ── reverse lookups (label → numeric key) ─────────────────────── */

const STATUS_KEY_BY_LABEL = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([k, v]) => [v, Number(k)])
) as Record<string, number>;

const PRIORITY_KEY_BY_LABEL = Object.fromEntries(
  Object.entries(PRIORITY_LABELS).map(([k, v]) => [v, Number(k)])
) as Record<string, number>;

const TYPE_KEY_BY_LABEL = Object.fromEntries(
  Object.entries(TASK_TYPE_LABELS).map(([k, v]) => [v, Number(k)])
) as Record<string, number>;

/* ── hover tooltip ─────────────────────────────────────────────── */

function Tip({
  children,
  items,
  label,
  onClick,
  position = "above",
}: {
  children: React.ReactNode;
  items: ActionItem[];
  label: string;
  onClick: () => void;
  position?: "above" | "below";
}) {
  const posClass =
    position === "below"
      ? "top-full left-1/2 -translate-x-1/2 mt-2"
      : "bottom-full left-1/2 -translate-x-1/2 mb-2";
  return (
    <div
      className="relative group/tip cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      {children}
      <div className={`absolute z-50 opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 transition-all duration-150 ${posClass}`}>
        <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[260px]">
          <p className="text-xs font-medium mb-1">
            {items.length} {label}
          </p>
          {items.slice(0, 4).map((item) => (
            <p
              key={item.tdvsp_actionitemid}
              className="text-xs text-muted-foreground truncate leading-relaxed"
            >
              {item.tdvsp_name}
            </p>
          ))}
          {items.length > 4 && (
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              +{items.length - 4} more
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 border-t border-border/50 pt-1.5">
            Click to view details
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── SVG donut ─────────────────────────────────────────────────── */

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function SvgDonut({ slices, size = 120 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = slices.map((slice) => {
    const pct = slice.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const currentOffset = offset;
    offset += dash;
    return (
      <circle
        key={slice.label}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={slice.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-currentOffset}
        strokeLinecap="butt"
        style={{ transition: "stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease" }}
      />
    );
  });

  return (
    <div className="relative" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {arcs}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-medium leading-none">{total}</span>
        <span className="text-[10px] text-muted-foreground">total</span>
      </div>
    </div>
  );
}

/* ── horizontal bar row ────────────────────────────────────────── */

function HBar({
  label,
  value,
  max,
  color,
  showValue = true,
  onClick,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
  onClick?: () => void;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className={`flex items-center gap-2 text-xs mb-2 rounded px-1 -mx-1 ${
        onClick ? "cursor-pointer hover:bg-muted/60 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <span className="min-w-[80px] text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
        <div
          className="h-full flex items-center pl-2 text-[11px] font-medium text-white rounded"
          style={{
            width: `${Math.max(pct, value > 0 ? 8 : 0)}%`,
            background: color,
            transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {showValue && value > 0 ? value : ""}
        </div>
      </div>
    </div>
  );
}

/* ── status row with mini progress bar ─────────────────────────── */

function StatusRow({
  label,
  count,
  total,
  color,
  onClick,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  onClick?: () => void;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      className={`rounded-lg border border-border/50 px-3 py-2 ${
        onClick ? "cursor-pointer hover:bg-muted/60 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: color }} />
          {label}
        </span>
        <span className="text-xs font-medium">{count}</span>
      </div>
      <div className="h-[3px] bg-muted rounded-full">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ── account bar row (thin bar) ────────────────────────────────── */

function AccountRow({
  name,
  count,
  max,
  color,
  onClick,
}: {
  name: string;
  count: number;
  max: number;
  color: string;
  onClick?: () => void;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div
      className={`flex items-center gap-2.5 mb-2.5 text-xs rounded px-1 -mx-1 py-0.5 ${
        onClick ? "cursor-pointer hover:bg-muted/60 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <span className="w-[190px] shrink-0 text-muted-foreground truncate">{name}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <span className="text-muted-foreground text-[11px] min-w-[16px] text-right">{count}</span>
    </div>
  );
}

/* ── main dashboard ────────────────────────────────────────────── */

interface Drilldown {
  title: string;
  items: ActionItem[];
}

export function Dashboard() {
  const { data: items, isLoading, error } = useActionItems();
  const { data: accounts } = useAccounts();
  const [drilldown, setDrilldown] = useState<Drilldown | null>(null);

  const openDrilldown = (title: string, filtered: ActionItem[]) =>
    setDrilldown({ title, items: filtered });

  const stats = useMemo(() => {
    if (!items) return null;

    const total = items.length;
    const complete = items.filter((i) => i.tdvsp_taskstatus === 468510005).length;
    const inProgress = items.filter((i) => i.tdvsp_taskstatus === 468510001).length;
    const urgent = items.filter(
      (i) => i.tdvsp_priority === 468510002 || i.tdvsp_priority === 468510003
    ).length;
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;

    // Status breakdown
    const statusCounts: { label: string; count: number; color: string }[] = [];
    for (const [key, label] of Object.entries(STATUS_LABELS)) {
      const count = items.filter((i) => i.tdvsp_taskstatus === Number(key)).length;
      if (count > 0)
        statusCounts.push({ label, count, color: STATUS_COLORS[label] ?? "#94a3b8" });
    }

    // Priority breakdown
    const priorityCounts: { label: string; count: number; color: string }[] = [];
    for (const [key, label] of Object.entries(PRIORITY_LABELS)) {
      const count = items.filter((i) => i.tdvsp_priority === Number(key)).length;
      if (count > 0)
        priorityCounts.push({ label, count, color: PRIORITY_COLORS[label] ?? "#94a3b8" });
    }

    // Type breakdown
    const typeCounts: { label: string; count: number }[] = [];
    for (const [key, label] of Object.entries(TASK_TYPE_LABELS)) {
      const count = items.filter((i) => i.tdvsp_tasktype === Number(key)).length;
      if (count > 0) typeCounts.push({ label, count });
    }

    // Items per account
    const accountMap = new Map<string, string>();
    accounts?.forEach((a) => accountMap.set(a.accountid, a.name));

    const accountBuckets = new Map<string, number>();
    for (const item of items) {
      const custId = (item as unknown as Record<string, string>)._tdvsp_customer_value;
      if (custId) {
        const name = item.tdvsp_customername ?? accountMap.get(custId) ?? "Unknown";
        accountBuckets.set(name, (accountBuckets.get(name) ?? 0) + 1);
      }
    }
    const accountCounts = [...accountBuckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        count,
        color: ACCOUNT_PALETTE[i % ACCOUNT_PALETTE.length] ?? "#888780",
      }));

    return {
      total,
      complete,
      inProgress,
      urgent,
      completionRate,
      statusCounts,
      priorityCounts,
      typeCounts,
      accountCounts,
    };
  }, [items, accounts]);

  /* ── filter helpers (memoised per category) ───────────────────── */

  const filterByStatus = (label: string) =>
    items?.filter((i) => i.tdvsp_taskstatus === STATUS_KEY_BY_LABEL[label]) ?? [];

  const filterByPriority = (label: string) =>
    items?.filter((i) => i.tdvsp_priority === PRIORITY_KEY_BY_LABEL[label]) ?? [];

  const filterByType = (label: string) =>
    items?.filter((i) => i.tdvsp_tasktype === TYPE_KEY_BY_LABEL[label]) ?? [];

  const filterByAccount = (accountName: string) =>
    items?.filter((i) => {
      const name = i.tdvsp_customername ?? "Unknown";
      return name === accountName;
    }) ?? [];

  const filterComplete = () =>
    items?.filter((i) => i.tdvsp_taskstatus === 468510005) ?? [];

  const filterInProgress = () =>
    items?.filter((i) => i.tdvsp_taskstatus === 468510001) ?? [];

  const filterUrgent = () =>
    items?.filter((i) => i.tdvsp_priority === 468510002 || i.tdvsp_priority === 468510003) ?? [];

  /* ── loading / error states ───────────────────────────────────── */

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load dashboard data: {error.message}
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-[250px] w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const allItems = items ?? [];

  const donutSlices: DonutSlice[] = stats.statusCounts.map((s) => ({
    label: s.label,
    value: s.count,
    color: s.color,
  }));

  const statusTotal = stats.statusCounts.reduce((s, d) => s + d.count, 0);
  const priorityMax = Math.max(...stats.priorityCounts.map((p) => p.count), 1);
  const accountMax = Math.max(...stats.accountCounts.map((a) => a.count), 1);
  const typeTotal = stats.typeCounts.reduce((s, d) => s + d.count, 0);

  const kpis = [
    {
      label: "Total Items",
      value: stats.total,
      sub: "across all accounts",
      accent: "#378ADD",
      icon: ClipboardCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      filterItems: () => allItems,
      drilldownTitle: "All Action Items",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      sub: `${stats.complete} of ${stats.total} complete`,
      accent: "#1D9E75",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      filterItems: filterComplete,
      drilldownTitle: "Completed Items",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      sub: "actively being worked",
      accent: "#EF9F27",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      filterItems: filterInProgress,
      drilldownTitle: "In Progress Items",
    },
    {
      label: "High / Top Priority",
      value: stats.urgent,
      sub: "need attention",
      accent: "#E24B4A",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      filterItems: filterUrgent,
      drilldownTitle: "High & Top Priority Items",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Action Items</h1>
            <p className="text-xs text-muted-foreground">Insights at a glance</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const filtered = kpi.filterItems();
          return (
            <Tip
              key={kpi.label}
              items={filtered}
              label={kpi.label.toLowerCase()}
              onClick={() => openDrilldown(kpi.drilldownTitle, filtered)}
              position="below"
            >
              <Card className="relative overflow-hidden px-5 py-4 hover:shadow-md transition-shadow">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  {kpi.label}
                </p>
                <p className="text-[28px] font-medium leading-none">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{ background: kpi.accent }}
                />
              </Card>
            </Tip>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status breakdown: donut + side list */}
        <Card className="p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Status Breakdown
          </h2>
          {stats.statusCounts.length > 0 ? (
            <div className="flex items-center gap-4">
              <SvgDonut slices={donutSlices} />
              <div className="flex-1 min-w-0 space-y-1.5">
                {stats.statusCounts.map((s) => {
                  const filtered = filterByStatus(s.label);
                  return (
                    <Tip
                      key={s.label}
                      items={filtered}
                      label={`${s.label.toLowerCase()} items`}
                      onClick={() => openDrilldown(`Status: ${s.label}`, filtered)}
                    >
                      <StatusRow
                        label={s.label}
                        count={s.count}
                        total={statusTotal}
                        color={s.color}
                      />
                    </Tip>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data</p>
          )}
        </Card>

        {/* Priority distribution */}
        <Card className="p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Priority Distribution
          </h2>
          {stats.priorityCounts.length > 0 ? (
            <div>
              {stats.priorityCounts.map((p) => {
                const filtered = filterByPriority(p.label);
                return (
                  <Tip
                    key={p.label}
                    items={filtered}
                    label={`${p.label.toLowerCase()} priority items`}
                    onClick={() => openDrilldown(`Priority: ${p.label}`, filtered)}
                  >
                    <HBar
                      label={p.label}
                      value={p.count}
                      max={priorityMax}
                      color={p.color}
                    />
                  </Tip>
                );
              })}
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">High + top priority</span>
                <span className="text-[15px] font-medium" style={{ color: "#E24B4A" }}>
                  {stats.urgent}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data</p>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Work vs Personal */}
        <Card className="p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Work vs Personal
          </h2>
          {stats.typeCounts.length > 0 ? (
            <div className="space-y-2">
              {stats.typeCounts.map((t) => {
                const pct = typeTotal > 0 ? Math.round((t.count / typeTotal) * 100) : 0;
                const color = t.label === "Work" ? "#378ADD" : "#8b5cf6";
                const filtered = filterByType(t.label);
                return (
                  <Tip
                    key={t.label}
                    items={filtered}
                    label={`${t.label.toLowerCase()} items`}
                    onClick={() => openDrilldown(`Type: ${t.label}`, filtered)}
                  >
                    <div className="flex items-center gap-3 text-sm rounded px-1 -mx-1 py-0.5 cursor-pointer hover:bg-muted/60 transition-colors">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-muted-foreground min-w-[70px]">{t.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: color,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[32px] text-right">
                        {t.count} ({pct}%)
                      </span>
                    </div>
                  </Tip>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data</p>
          )}
        </Card>

        {/* Items by account */}
        <Card className="p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Items by Account
          </h2>
          {stats.accountCounts.length > 0 ? (
            <div>
              {stats.accountCounts.map((a) => {
                const filtered = filterByAccount(a.name);
                return (
                  <Tip
                    key={a.name}
                    items={filtered}
                    label={`items for ${a.name}`}
                    onClick={() => openDrilldown(`Account: ${a.name}`, filtered)}
                  >
                    <AccountRow
                      name={a.name}
                      count={a.count}
                      max={accountMax}
                      color={a.color}
                    />
                  </Tip>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No customer-linked items</p>
          )}
        </Card>
      </div>

      {/* Drilldown dialog */}
      <DrilldownDialog
        open={drilldown !== null}
        onOpenChange={(open) => { if (!open) setDrilldown(null); }}
        title={drilldown?.title ?? ""}
        items={drilldown?.items ?? []}
      />
    </div>
  );
}
