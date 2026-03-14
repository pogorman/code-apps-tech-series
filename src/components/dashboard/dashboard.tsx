import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Pie } from "react-chartjs-2";
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
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const STATUS_COLORS: Record<string, string> = {
  Recognized: "#94a3b8",
  "In Progress": "#3b82f6",
  "Pending Comms": "#f59e0b",
  "On Hold": "#ef4444",
  "Wrapping Up": "#8b5cf6",
  Complete: "#22c55e",
};

const PRIORITY_COLORS: Record<string, string> = {
  Eh: "#94a3b8",
  Low: "#60a5fa",
  High: "#f59e0b",
  "Top Priority": "#ef4444",
};

export function Dashboard() {
  const { data: items, isLoading, error } = useActionItems();
  const { data: accounts } = useAccounts();

  const stats = useMemo(() => {
    if (!items) return null;

    const total = items.length;
    const complete = items.filter(
      (i) => i.tdvsp_taskstatus === 468510005
    ).length;
    const inProgress = items.filter(
      (i) => i.tdvsp_taskstatus === 468510001
    ).length;
    const urgent = items.filter(
      (i) =>
        i.tdvsp_priority === 468510002 || i.tdvsp_priority === 468510003
    ).length;
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;

    // Status breakdown
    const statusCounts = new Map<string, number>();
    for (const [key, label] of Object.entries(STATUS_LABELS)) {
      const count = items.filter(
        (i) => i.tdvsp_taskstatus === Number(key)
      ).length;
      if (count > 0) statusCounts.set(label, count);
    }

    // Priority breakdown
    const priorityCounts = new Map<string, number>();
    for (const [key, label] of Object.entries(PRIORITY_LABELS)) {
      const count = items.filter(
        (i) => i.tdvsp_priority === Number(key)
      ).length;
      if (count > 0) priorityCounts.set(label, count);
    }

    // Type breakdown
    const typeCounts = new Map<string, number>();
    for (const [key, label] of Object.entries(TASK_TYPE_LABELS)) {
      const count = items.filter(
        (i) => i.tdvsp_tasktype === Number(key)
      ).length;
      if (count > 0) typeCounts.set(label, count);
    }

    // Items per account
    const accountMap = new Map<string, string>();
    accounts?.forEach((a) => accountMap.set(a.accountid, a.name));

    const accountCounts = new Map<string, number>();
    for (const item of items) {
      const custId = (item as unknown as Record<string, string>)
        ._tdvsp_customer_value;
      if (custId) {
        const name =
          item.tdvsp_customername ?? accountMap.get(custId) ?? "Unknown";
        accountCounts.set(name, (accountCounts.get(name) ?? 0) + 1);
      }
    }

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

  const statusData = {
    labels: [...stats.statusCounts.keys()],
    datasets: [
      {
        data: [...stats.statusCounts.values()],
        backgroundColor: [...stats.statusCounts.keys()].map(
          (k) => STATUS_COLORS[k] ?? "#94a3b8"
        ),
        borderWidth: 0,
      },
    ],
  };

  const priorityData = {
    labels: [...stats.priorityCounts.keys()],
    datasets: [
      {
        label: "Action Items",
        data: [...stats.priorityCounts.values()],
        backgroundColor: [...stats.priorityCounts.keys()].map(
          (k) => PRIORITY_COLORS[k] ?? "#94a3b8"
        ),
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const typeData = {
    labels: [...stats.typeCounts.keys()],
    datasets: [
      {
        data: [...stats.typeCounts.values()],
        backgroundColor: ["#3b82f6", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const accountLabels = [...stats.accountCounts.keys()];
  const accountData = {
    labels: accountLabels,
    datasets: [
      {
        label: "Action Items",
        data: [...stats.accountCounts.values()],
        backgroundColor: "#0078D4",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      x: { grid: { display: false } },
    },
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: "y" as const,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y: { grid: { display: false } },
    },
  };

  const kpis = [
    {
      label: "Total Items",
      value: stats.total,
      icon: ClipboardCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "High / Top Priority",
      value: stats.urgent,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Action item insights at a glance
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="flex items-center gap-4 p-5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.bg}`}
            >
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Status Breakdown
          </h2>
          <div className="h-[280px] flex items-center justify-center">
            {stats.statusCounts.size > 0 ? (
              <Doughnut data={statusData} options={chartOptions} />
            ) : (
              <p className="text-muted-foreground">No data</p>
            )}
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Priority Distribution
          </h2>
          <div className="h-[280px]">
            {stats.priorityCounts.size > 0 ? (
              <Bar data={priorityData} options={barOptions} />
            ) : (
              <p className="text-muted-foreground">No data</p>
            )}
          </div>
        </Card>

        {/* Work vs Personal */}
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Work vs Personal
          </h2>
          <div className="h-[280px] flex items-center justify-center">
            {stats.typeCounts.size > 0 ? (
              <Pie data={typeData} options={chartOptions} />
            ) : (
              <p className="text-muted-foreground">No data</p>
            )}
          </div>
        </Card>

        {/* Items by Account */}
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Items by Account
          </h2>
          <div
            className="flex items-center"
            style={{
              height: Math.max(280, accountLabels.length * 40 + 60),
            }}
          >
            {stats.accountCounts.size > 0 ? (
              <Bar data={accountData} options={horizontalBarOptions} />
            ) : (
              <p className="text-muted-foreground">No customer-linked items</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
