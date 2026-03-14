import { useMemo } from "react";
import { useActionItems } from "@/hooks/use-action-items";
import { useAccounts } from "@/hooks/use-accounts";
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
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs mb-2">
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
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border/50 px-3 py-2">
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
}: {
  name: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5 mb-2.5 text-xs">
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

export function Dashboard() {
  const { data: items, isLoading, error } = useActionItems();
  const { data: accounts } = useAccounts();

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
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      sub: `${stats.complete} of ${stats.total} complete`,
      accent: "#1D9E75",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      sub: "actively being worked",
      accent: "#EF9F27",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "High / Top Priority",
      value: stats.urgent,
      sub: "need attention",
      accent: "#E24B4A",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
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
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden px-5 py-4">
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
        ))}
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
                {stats.statusCounts.map((s) => (
                  <StatusRow
                    key={s.label}
                    label={s.label}
                    count={s.count}
                    total={statusTotal}
                    color={s.color}
                  />
                ))}
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
              {stats.priorityCounts.map((p) => (
                <HBar
                  key={p.label}
                  label={p.label}
                  value={p.count}
                  max={priorityMax}
                  color={p.color}
                />
              ))}
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
                return (
                  <div key={t.label} className="flex items-center gap-3 text-sm">
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
              {stats.accountCounts.map((a) => (
                <AccountRow
                  key={a.name}
                  name={a.name}
                  count={a.count}
                  max={accountMax}
                  color={a.color}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No customer-linked items</p>
          )}
        </Card>
      </div>
    </div>
  );
}
