import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useActionItems, useUpdateActionItem } from "@/hooks/use-action-items";
import { useProjects, useUpdateProject } from "@/hooks/use-projects";
import { useIdeas, useUpdateIdea } from "@/hooks/use-ideas";
import {
  useMeetingSummaries,
  useUpdateMeetingSummary,
} from "@/hooks/use-meeting-summaries";
import { ActionItemFormDialog } from "@/components/action-items";
import { IdeaFormDialog } from "@/components/ideas";
import { MeetingSummaryFormDialog } from "@/components/meeting-summaries";
import { ProjectFormDialog } from "@/components/projects";
import { TileColorDots } from "@/components/ui/tile-color-dots";
import {
  priorityToColorIndex,
  tileBgClass,
  tileGradient,
  COLOR_TO_PRIORITY,
} from "@/lib/tile-colors";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_TYPE_LABELS,
  priorityPillClass,
  statusPillClass,
} from "@/components/action-items/labels";
import { CATEGORY_LABELS, categoryPillClass } from "@/components/ideas/labels";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Briefcase,
  Car,
  Columns3,
  FileText,
  FolderKanban,
  GripVertical,
  House,
  LayoutGrid,
  Lightbulb,
  Pencil,
  Pin,
  X,
} from "lucide-react";
import type { Tdvsp_actionitemsModel } from "@/generated";
import type { Tdvsp_ideasModel } from "@/generated";
import type { Tdvsp_projectsModel } from "@/generated";
import type { Tdvsp_meetingsummariesModel } from "@/generated";

type ActionItem = Tdvsp_actionitemsModel.Tdvsp_actionitems;
type Idea = Tdvsp_ideasModel.Tdvsp_ideas;
type Project = Tdvsp_projectsModel.Tdvsp_projects;
type MeetingSummary = Tdvsp_meetingsummariesModel.Tdvsp_meetingsummaries;

/* ── helpers ──────────────────────────────────────────────────── */

function isItemPinned(item: unknown): boolean {
  const val = (item as Record<string, unknown>).tdvsp_pinned;
  return val === true || val === 1;
}

/* ── status keys ──────────────────────────────────────────────── */

const RECOGNIZED = 468510000;
const COMPLETE = 468510005;
const TASK_TYPE_PERSONAL = 468510000;
const TASK_TYPE_WORK = 468510001;
const TASK_TYPE_LEARNING = 468510002;

const WORK_FILTERS = [
  { key: TASK_TYPE_WORK, letter: "W", label: "Work", accent: "#ef4444", icon: Briefcase },
  { key: TASK_TYPE_PERSONAL, letter: "P", label: "Personal", accent: "#3b82f6", icon: House },
  { key: TASK_TYPE_LEARNING, letter: "L", label: "Learning", accent: "#d946ef", icon: BookOpen },
] as const;

const WORK_ALL_ACCENT = "#6b7280";
const WORK_ALL_ICON = LayoutGrid;

function workFilterConfig(filter: number | null) {
  const match = WORK_FILTERS.find((f) => f.key === filter);
  return {
    accent: match?.accent ?? WORK_ALL_ACCENT,
    icon: match?.icon ?? WORK_ALL_ICON,
    title: match?.label.toLowerCase() ?? "all",
  };
}

/* ── column accent colours ────────────────────────────────────── */

const ACCENT = {
  parkingLot: "#22c55e",
  projects: "#8b5cf6",
  ideas: "#EF9F27",
} as const;

/* ── localStorage sort order helpers ─────────────────────────── */

const ORDER_PREFIX = "board-order-";

function getSavedOrder(column: string): string[] {
  try {
    const raw = localStorage.getItem(`${ORDER_PREFIX}${column}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrder(column: string, ids: string[]): void {
  try {
    localStorage.setItem(`${ORDER_PREFIX}${column}`, JSON.stringify(ids));
  } catch {
    // localStorage unavailable
  }
}

function applyOrder<T>(items: T[], getId: (item: T) => string, savedOrder: string[]): T[] {
  if (savedOrder.length === 0) return items;
  const posMap = new Map(savedOrder.map((id, i) => [id, i]));
  const sorted = [...items];
  sorted.sort((a, b) => {
    const posA = posMap.get(getId(a)) ?? Infinity;
    const posB = posMap.get(getId(b)) ?? Infinity;
    return posA - posB;
  });
  return sorted;
}

/* ── drag handle props ───────────────────────────────────────── */

type DragHandleProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

/* ── sortable card wrapper (render-prop for drag handle) ─────── */

function SortableCard({
  id,
  children,
}: {
  id: string;
  children: (handle: DragHandleProps) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200",
        isDragging
          ? "z-50 opacity-90 scale-[1.03] rotate-[1.5deg] ring-2 ring-primary/40 rounded-lg shadow-xl"
          : "hover:-translate-y-0.5",
      )}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

/* ── floating card toolbar ───────────────────────────────────── */

function CardToolbar({
  colorIdx,
  onPriorityChange,
  pinned,
  onPinToggle,
  onEdit,
  dragHandle,
}: {
  colorIdx: number;
  onPriorityChange: (idx: number) => void;
  pinned: boolean;
  onPinToggle: () => void;
  onEdit?: () => void;
  dragHandle: DragHandleProps;
}) {
  return (
    <div
      className={cn(
        "absolute -top-3 right-1 z-10 flex items-center gap-2",
        "rounded-lg border border-border bg-popover px-2 py-1",
        "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* drag grip */}
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...dragHandle.attributes}
        {...dragHandle.listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* separator */}
      <div className="h-4 w-px bg-border" />

      {/* priority color dots — override the built-in opacity since toolbar handles it */}
      <TileColorDots
        activeIndex={colorIdx}
        onChange={onPriorityChange}
        className="!opacity-100"
      />

      {/* separator */}
      <div className="h-4 w-px bg-border" />

      {/* edit */}
      {onEdit && (
        <button
          type="button"
          title="Edit"
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* pin */}
      <button
        type="button"
        title={pinned ? "Unpin from parking lot" : "Pin to parking lot"}
        className={cn(
          "transition-colors",
          pinned
            ? "text-green-500 hover:text-green-400"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onPinToggle();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Pin className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── action-item card ─────────────────────────────────────────── */

function ActionItemCard({
  item,
  showStatus,
  onPriorityChange,
  onPinToggle,
  onEdit,
  dragHandle,
}: {
  item: ActionItem;
  showStatus: boolean;
  onPriorityChange: (id: string, priority: number | null) => void;
  onPinToggle: (id: string) => void;
  onEdit: (item: ActionItem) => void;
  dragHandle: DragHandleProps;
}) {
  const date = item.tdvsp_date
    ? new Date(item.tdvsp_date).toLocaleDateString()
    : null;
  const customer = item.tdvsp_customername;
  const priority =
    item.tdvsp_priority != null
      ? PRIORITY_LABELS[item.tdvsp_priority]
      : null;
  const status =
    item.tdvsp_taskstatus != null
      ? STATUS_LABELS[item.tdvsp_taskstatus]
      : null;
  const colorIdx = priorityToColorIndex(item.tdvsp_priority);
  const pinned = isItemPinned(item);

  const description = item.tdvsp_description;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-card px-3.5 pt-3 pb-7",
        "shadow-sm hover:shadow-md transition-all duration-200",
        tileBgClass(colorIdx),
      )}
      style={{ backgroundImage: tileGradient(colorIdx) }}
    >
      <CardToolbar
        colorIdx={colorIdx}
        onPriorityChange={(idx) => onPriorityChange(item.tdvsp_actionitemid, COLOR_TO_PRIORITY[idx] ?? null)}
        pinned={pinned}
        onPinToggle={() => onPinToggle(item.tdvsp_actionitemid)}
        onEdit={() => onEdit(item)}
        dragHandle={dragHandle}
      />
      <div className="flex items-start gap-1.5">
        <Briefcase className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
        <p className="text-xs font-medium leading-snug line-clamp-2">
          {item.tdvsp_name}
        </p>
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1 pl-[1.125rem]">
          {description}
        </p>
      )}
      {(date || customer) && (
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground pl-[1.125rem]">
          {date && <span>{date}</span>}
          {date && customer && <span>·</span>}
          {customer && <span className="truncate">{customer}</span>}
        </div>
      )}
      {priority && (
        <span className={cn("absolute bottom-1.5 left-2 inline-flex items-center rounded-sm border px-1.5 py-px text-[10px] font-semibold", priorityPillClass(item.tdvsp_priority!))}>
          {priority}
        </span>
      )}
      {showStatus && status && (
        <span className={cn("absolute bottom-1.5 right-2 inline-flex items-center rounded-sm border px-1.5 py-px text-[10px] font-semibold", statusPillClass(item.tdvsp_taskstatus!))}>
          {status}
        </span>
      )}
    </div>
  );
}

/* ── project card ─────────────────────────────────────────────── */

function ProjectCard({
  project,
  onPriorityChange,
  onPinToggle,
  onEdit,
  dragHandle,
}: {
  project: Project;
  onPriorityChange: (id: string, priority: number | null) => void;
  onPinToggle: (id: string) => void;
  onEdit: (project: Project) => void;
  dragHandle: DragHandleProps;
}) {
  const colorIdx = priorityToColorIndex(project.tdvsp_priority);
  const priority =
    project.tdvsp_priority != null
      ? PRIORITY_LABELS[project.tdvsp_priority as keyof typeof PRIORITY_LABELS]
      : null;
  const pinned = isItemPinned(project);

  const description = project.tdvsp_description;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-card px-3.5 pt-3 pb-7",
        "shadow-sm hover:shadow-md transition-all duration-200",
        tileBgClass(colorIdx),
      )}
      style={{ backgroundImage: tileGradient(colorIdx) }}
    >
      <CardToolbar
        colorIdx={colorIdx}
        onPriorityChange={(idx) => onPriorityChange(project.tdvsp_projectid, COLOR_TO_PRIORITY[idx] ?? null)}
        pinned={pinned}
        onPinToggle={() => onPinToggle(project.tdvsp_projectid)}
        onEdit={() => onEdit(project)}
        dragHandle={dragHandle}
      />
      <div className="flex items-start gap-1.5">
        <FolderKanban className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
        <p className="text-xs font-medium leading-snug line-clamp-2">
          {project.tdvsp_name}
        </p>
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1 pl-[1.125rem]">
          {description}
        </p>
      )}
      {priority && (
        <span className={cn("absolute bottom-1.5 left-2 inline-flex items-center rounded-sm border px-1.5 py-px text-[10px] font-semibold", priorityPillClass(project.tdvsp_priority!))}>
          {priority}
        </span>
      )}
    </div>
  );
}

/* ── idea card ────────────────────────────────────────────────── */

function IdeaCard({
  idea,
  onPriorityChange,
  onPinToggle,
  onEdit,
  dragHandle,
}: {
  idea: Idea;
  onPriorityChange: (id: string, priority: number | null) => void;
  onPinToggle: (id: string) => void;
  onEdit: (idea: Idea) => void;
  dragHandle: DragHandleProps;
}) {
  const category =
    idea.tdvsp_category != null
      ? CATEGORY_LABELS[idea.tdvsp_category]
      : null;
  const priority = (idea as unknown as Record<string, number>).tdvsp_priority;
  const colorIdx = priorityToColorIndex(priority);
  const pinned = isItemPinned(idea);

  const description = idea.tdvsp_description;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-card px-3.5 pt-3 pb-7",
        "shadow-sm hover:shadow-md transition-all duration-200",
        tileBgClass(colorIdx),
      )}
      style={{ backgroundImage: tileGradient(colorIdx) }}
    >
      <CardToolbar
        colorIdx={colorIdx}
        onPriorityChange={(idx) => onPriorityChange(idea.tdvsp_ideaid, COLOR_TO_PRIORITY[idx] ?? null)}
        pinned={pinned}
        onPinToggle={() => onPinToggle(idea.tdvsp_ideaid)}
        onEdit={() => onEdit(idea)}
        dragHandle={dragHandle}
      />
      <div className="flex items-start gap-1.5">
        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
        <p className="text-xs font-medium leading-snug line-clamp-2">
          {idea.tdvsp_name}
        </p>
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1 pl-[1.125rem]">
          {description}
        </p>
      )}
      {category && (
        <span className={cn("absolute bottom-1.5 left-2 inline-flex items-center rounded-sm border px-1.5 py-px text-[10px] font-semibold", categoryPillClass(idea.tdvsp_category!))}>
          {category}
        </span>
      )}
    </div>
  );
}

/* ── parking-lot card (mixed entity, shows type + X to unpin) ── */

type ParkingLotEntry = {
  kind: "action-item" | "project" | "idea" | "meeting-summary";
  id: string;
  sortId: string;
  name: string;
  label: string;
  colorIdx: number;
  onUnpin: () => void;
};

const KIND_ICON: Record<ParkingLotEntry["kind"], typeof Briefcase> = {
  "action-item": Briefcase,
  project: FolderKanban,
  idea: Lightbulb,
  "meeting-summary": FileText,
};

function ParkingLotCard({ entry, dragHandle }: { entry: ParkingLotEntry; dragHandle: DragHandleProps }) {
  const KindIcon = KIND_ICON[entry.kind];

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-card px-3.5 py-3",
        "shadow-sm hover:shadow-md transition-all duration-200",
        tileBgClass(entry.colorIdx),
      )}
      style={{ backgroundImage: tileGradient(entry.colorIdx) }}
    >
      {/* minimal toolbar: grip + unpin */}
      <div
        className="absolute -top-3 right-1 z-10 flex items-center gap-2 rounded-lg border border-border bg-popover px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...dragHandle.attributes}
          {...dragHandle.listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="h-4 w-px bg-border" />
        <button
          type="button"
          title="Unpin"
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            entry.onUnpin();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-start gap-1.5">
        <KindIcon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
        <p className="text-xs font-medium leading-snug line-clamp-2">
          {entry.name}
        </p>
      </div>
    </div>
  );
}

/* ── sortable column ─────────────────────────────────────────── */

function SortableColumn({
  columnKey,
  title,
  icon: Icon,
  accent,
  ids,
  headerInline,
  children,
}: {
  columnKey: string;
  title?: string;
  icon: typeof Briefcase;
  accent: string;
  ids: string[];
  headerInline?: React.ReactNode;
  children: React.ReactNode;
}) {
  /* Make the card list a drop target so items can be dropped here even when empty */
  const { setNodeRef } = useDroppable({ id: `col-${columnKey}` });

  return (
    <div className="flex min-w-0 rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm">
      {/* accent left bar */}
      <div className="w-[3px] shrink-0 rounded-l-xl transition-colors duration-200" style={{ background: accent }} />
      <div className="flex flex-col min-w-0 flex-1">
        {/* glass-morphism header */}
        <div className="sticky top-0 z-[5] px-4 py-3 bg-background/60 backdrop-blur-md border-b border-border/30 rounded-tr-xl">
          <div className="flex items-center gap-2">
            {/* icon + overlapping count badge */}
            <div className="relative shrink-0 mr-1">
              <Icon className="h-5 w-5 transition-colors duration-200" style={{ color: accent }} />
              <span
                className="absolute -bottom-1.5 -right-2 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full text-[9px] font-bold tabular-nums border border-background transition-colors duration-200"
                style={{ background: accent, color: "#fff" }}
              >
                {ids.length}
              </span>
            </div>
            {title && <h2 className="text-sm font-semibold truncate">{title}</h2>}
            {headerInline}
          </div>
        </div>
        {/* sortable card list — pt-4 gives room for toolbar overflow above first card */}
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex-1 overflow-y-auto overflow-x-visible px-3 pt-4 pb-3 space-y-2.5">
            {children}
            {ids.length === 0 && (
              <div className="flex flex-col items-center py-8 text-muted-foreground/50">
                <Icon className="h-8 w-8 mb-2" />
                <p className="text-xs">No items</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

/* ── edit dialog state ────────────────────────────────────────── */

type EditTarget =
  | { kind: "action-item"; item: ActionItem }
  | { kind: "project"; item: Project }
  | { kind: "idea"; item: Idea }
  | { kind: "meeting-summary"; item: MeetingSummary }
  | null;

/* ── main board dashboard ─────────────────────────────────────── */

export function BoardDashboard() {
  const {
    data: actionItems,
    isLoading: loadingItems,
    error: itemsError,
  } = useActionItems();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: ideas, isLoading: loadingIdeas } = useIdeas();
  const { data: meetingSummaries, isLoading: loadingMeetings } = useMeetingSummaries();
  const updateActionItem = useUpdateActionItem();
  const updateProject = useUpdateProject();
  const updateIdea = useUpdateIdea();
  const updateMeetingSummary = useUpdateMeetingSummary();

  /* work column task-type filter */
  const [workFilter, setWorkFilter] = useState<number | null>(null);

  /* edit dialog state */
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  /* sort order state — seeded from localStorage on first render */
  const [orders, setOrders] = useState<Record<string, string[]>>(() => ({
    parkingLot: getSavedOrder("parkingLot"),
    work: getSavedOrder("work"),
    projects: getSavedOrder("projects"),
    ideas: getSavedOrder("ideas"),
  }));

  const handleReorder = useCallback((columnKey: string, newIds: string[]) => {
    setOrders((prev) => ({ ...prev, [columnKey]: newIds }));
    saveOrder(columnKey, newIds);
  }, []);

  /* priority handlers */
  const handleActionItemPriority = (id: string, priority: number | null) => {
    updateActionItem.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };

  const handleProjectPriority = (id: string, priority: number | null) => {
    updateProject.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };

  const handleIdeaPriority = (id: string, priority: number | null) => {
    updateIdea.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };



  /* pin/unpin handlers */
  const handleActionItemPin = (id: string) => {
    const item = actionItems?.find((i) => i.tdvsp_actionitemid === id);
    const newVal = item ? !isItemPinned(item) : true;
    updateActionItem.mutate({ id, fields: { tdvsp_pinned: newVal } as never });
  };

  const handleProjectPin = (id: string) => {
    const item = projects?.find((p) => p.tdvsp_projectid === id);
    const newVal = item ? !isItemPinned(item) : true;
    updateProject.mutate({ id, fields: { tdvsp_pinned: newVal } as never });
  };

  const handleIdeaPin = (id: string) => {
    const item = ideas?.find((i) => i.tdvsp_ideaid === id);
    const newVal = item ? !isItemPinned(item) : true;
    updateIdea.mutate({ id, fields: { tdvsp_pinned: newVal } as never });
  };

  const handleMeetingSummaryPin = (id: string) => {
    const item = meetingSummaries?.find((m) => m.tdvsp_meetingsummaryid === id);
    const newVal = item ? !isItemPinned(item) : true;
    updateMeetingSummary.mutate({ id, fields: { tdvsp_pinned: newVal } as never });
  };

  const isLoading = loadingItems || loadingProjects || loadingIdeas || loadingMeetings;

  /* ── build parking lot (all pinned items across entities) ──── */
  const parkingLotEntries: ParkingLotEntry[] = [];

  (actionItems ?? []).filter(isItemPinned).forEach((item) => {
    const taskType = (item.tdvsp_tasktype != null ? TASK_TYPE_LABELS[item.tdvsp_tasktype] : undefined) ?? "Task";
    parkingLotEntries.push({
      kind: "action-item",
      id: item.tdvsp_actionitemid,
      sortId: `ai-${item.tdvsp_actionitemid}`,
      name: item.tdvsp_name,
      label: taskType,
      colorIdx: priorityToColorIndex(item.tdvsp_priority),
      onUnpin: () => handleActionItemPin(item.tdvsp_actionitemid),
    });
  });

  (projects ?? []).filter(isItemPinned).forEach((project) => {
    parkingLotEntries.push({
      kind: "project",
      id: project.tdvsp_projectid,
      sortId: `proj-${project.tdvsp_projectid}`,
      name: project.tdvsp_name,
      label: "Project",
      colorIdx: priorityToColorIndex(project.tdvsp_priority),
      onUnpin: () => handleProjectPin(project.tdvsp_projectid),
    });
  });

  (ideas ?? []).filter(isItemPinned).forEach((idea) => {
    const priority = (idea as unknown as Record<string, number>).tdvsp_priority;
    parkingLotEntries.push({
      kind: "idea",
      id: idea.tdvsp_ideaid,
      sortId: `idea-${idea.tdvsp_ideaid}`,
      name: idea.tdvsp_name,
      label: "Idea",
      colorIdx: priorityToColorIndex(priority),
      onUnpin: () => handleIdeaPin(idea.tdvsp_ideaid),
    });
  });

  (meetingSummaries ?? []).filter(isItemPinned).forEach((ms) => {
    const priority = (ms as unknown as Record<string, number>).tdvsp_priority;
    parkingLotEntries.push({
      kind: "meeting-summary",
      id: ms.tdvsp_meetingsummaryid,
      sortId: `ms-${ms.tdvsp_meetingsummaryid}`,
      name: ms.tdvsp_name,
      label: "Meeting",
      colorIdx: priorityToColorIndex(priority),
      onUnpin: () => handleMeetingSummaryPin(ms.tdvsp_meetingsummaryid),
    });
  });

  const sortedParkingLot = applyOrder(
    parkingLotEntries,
    (e) => e.sortId,
    orders.parkingLot ?? [],
  );
  const parkingLotIds = sortedParkingLot.map((e) => e.sortId);

  /* ── build other columns ───────────────────────────────────── */
  const work = applyOrder(
    actionItems?.filter(
      (i) =>
        i.tdvsp_taskstatus !== RECOGNIZED &&
        i.tdvsp_taskstatus !== COMPLETE &&
        (workFilter === null || i.tdvsp_tasktype === workFilter)
    ) ?? [],
    (i) => i.tdvsp_actionitemid,
    orders.work ?? [],
  );
  const projectList = applyOrder(
    projects ?? [],
    (p) => p.tdvsp_projectid,
    orders.projects ?? [],
  );
  const ideaList = applyOrder(
    ideas ?? [],
    (i) => i.tdvsp_ideaid,
    orders.ideas ?? [],
  );

  const workIds = work.map((i) => i.tdvsp_actionitemid);
  const projectIds = projectList.map((p) => p.tdvsp_projectid);
  const ideaIds = ideaList.map((i) => i.tdvsp_ideaid);

  /* ── top-level DnD ─────────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const workIdSet = new Set(workIds);
  const projectIdSet = new Set(projectIds);
  const ideaIdSet = new Set(ideaIds);
  const parkingLotIdSet = new Set(parkingLotIds);

  const getColumnForId = (id: string): string | null => {
    if (id.startsWith("col-")) return id.slice(4);
    if (workIdSet.has(id)) return "work";
    if (projectIdSet.has(id)) return "projects";
    if (ideaIdSet.has(id)) return "ideas";
    if (parkingLotIdSet.has(id)) return "parkingLot";
    return null;
  };

  const handleBoardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const srcCol = getColumnForId(activeId);
    const dstCol = getColumnForId(overId);

    if (!srcCol || !dstCol) return;

    /* ── same column → reorder ───────────────────────────── */
    if (srcCol === dstCol) {
      const colIds =
        srcCol === "work" ? workIds :
        srcCol === "projects" ? projectIds :
        srcCol === "ideas" ? ideaIds :
        srcCol === "parkingLot" ? parkingLotIds : [];
      const oldIdx = colIds.indexOf(activeId);
      const newIdx = colIds.indexOf(overId);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        handleReorder(srcCol, arrayMove([...colIds], oldIdx, newIdx));
      }
      return;
    }

    /* ── cross-column: → parking lot = pin ───────────────── */
    if (dstCol === "parkingLot" && srcCol !== "parkingLot") {
      if (srcCol === "work") {
        updateActionItem.mutate({ id: activeId, fields: { tdvsp_pinned: true } as never });
      } else if (srcCol === "projects") {
        updateProject.mutate({ id: activeId, fields: { tdvsp_pinned: true } as never });
      } else if (srcCol === "ideas") {
        updateIdea.mutate({ id: activeId, fields: { tdvsp_pinned: true } as never });
      }
      return;
    }

    /* ── cross-column: parking lot → elsewhere = unpin ───── */
    if (srcCol === "parkingLot" && dstCol !== "parkingLot") {
      if (activeId.startsWith("ai-")) {
        updateActionItem.mutate({ id: activeId.slice(3), fields: { tdvsp_pinned: false } as never });
      } else if (activeId.startsWith("proj-")) {
        updateProject.mutate({ id: activeId.slice(5), fields: { tdvsp_pinned: false } as never });
      } else if (activeId.startsWith("idea-")) {
        updateIdea.mutate({ id: activeId.slice(5), fields: { tdvsp_pinned: false } as never });
      } else if (activeId.startsWith("ms-")) {
        updateMeetingSummary.mutate({ id: activeId.slice(3), fields: { tdvsp_pinned: false } as never });
      }
    }
  };

  if (itemsError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load board data: {itemsError.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Columns3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">My Board</h1>
        </div>
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <Skeleton className="h-5 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Columns3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-medium">My Board</h1>
          <p className="text-xs text-muted-foreground">
            Kanban view across action items, projects &amp; ideas
          </p>
        </div>
      </div>

      {/* 4-column board — single DndContext for cross-column drag */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleBoardDragEnd}
      >
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Parking Lot */}
        <SortableColumn
          columnKey="parkingLot"
          title="parking lot"
          icon={Car}
          accent={ACCENT.parkingLot}
          ids={parkingLotIds}
        >
          {sortedParkingLot.map((entry) => (
            <SortableCard key={entry.sortId} id={entry.sortId}>
              {(handle) => <ParkingLotCard entry={entry} dragHandle={handle} />}
            </SortableCard>
          ))}
        </SortableColumn>

        {/* Work — accent + icon shift with active filter */}
        <SortableColumn
          columnKey="work"
          title={workFilterConfig(workFilter).title}
          icon={workFilterConfig(workFilter).icon}
          accent={workFilterConfig(workFilter).accent}
          ids={workIds}
          headerInline={
            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                title="All"
                className={cn(
                  "h-5 w-5 rounded-full text-[9px] font-bold leading-none transition-colors",
                  workFilter === null
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                onClick={() => setWorkFilter(null)}
              >
                A
              </button>
              {WORK_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  title={f.label}
                  className={cn(
                    "h-5 w-5 rounded-full text-[9px] font-bold leading-none transition-colors",
                    workFilter === f.key
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  style={workFilter === f.key ? { background: f.accent } : undefined}
                  onClick={() => setWorkFilter(f.key)}
                >
                  {f.letter}
                </button>
              ))}
            </div>
          }
        >
          {work.map((item) => (
            <SortableCard key={item.tdvsp_actionitemid} id={item.tdvsp_actionitemid}>
              {(handle) => (
                <ActionItemCard
                  item={item}
                  showStatus={true}
                  onPriorityChange={handleActionItemPriority}
                  onPinToggle={handleActionItemPin}
                  onEdit={(ai) => setEditTarget({ kind: "action-item", item: ai })}
                  dragHandle={handle}
                />
              )}
            </SortableCard>
          ))}
        </SortableColumn>

        {/* Projects */}
        <SortableColumn
          columnKey="projects"
          title="projects"
          icon={FolderKanban}
          accent={ACCENT.projects}
          ids={projectIds}

        >
          {projectList.map((project) => (
            <SortableCard key={project.tdvsp_projectid} id={project.tdvsp_projectid}>
              {(handle) => (
                <ProjectCard
                  project={project}
                  onPriorityChange={handleProjectPriority}
                  onPinToggle={handleProjectPin}
                  onEdit={(p) => setEditTarget({ kind: "project", item: p })}
                  dragHandle={handle}
                />
              )}
            </SortableCard>
          ))}
        </SortableColumn>

        {/* Ideas */}
        <SortableColumn
          columnKey="ideas"
          title="ideas"
          icon={Lightbulb}
          accent={ACCENT.ideas}
          ids={ideaIds}

        >
          {ideaList.map((idea) => (
            <SortableCard key={idea.tdvsp_ideaid} id={idea.tdvsp_ideaid}>
              {(handle) => (
                <IdeaCard
                  idea={idea}
                  onPriorityChange={handleIdeaPriority}
                  onPinToggle={handleIdeaPin}
                  onEdit={(i) => setEditTarget({ kind: "idea", item: i })}
                  dragHandle={handle}
                />
              )}
            </SortableCard>
          ))}
        </SortableColumn>
      </div>
      </DndContext>

      {/* ── edit dialogs ─────────────────────────────────────── */}
      <ActionItemFormDialog
        open={editTarget?.kind === "action-item"}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        mode="edit"
        actionItem={editTarget?.kind === "action-item" ? editTarget.item : undefined}
      />
      <IdeaFormDialog
        open={editTarget?.kind === "idea"}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        mode="edit"
        idea={editTarget?.kind === "idea" ? editTarget.item : undefined}
      />
      <ProjectFormDialog
        open={editTarget?.kind === "project"}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        mode="edit"
        project={editTarget?.kind === "project" ? editTarget.item : undefined}
      />
      <MeetingSummaryFormDialog
        open={editTarget?.kind === "meeting-summary"}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        mode="edit"
        meetingSummary={editTarget?.kind === "meeting-summary" ? editTarget.item : undefined}
      />
    </div>
  );
}
