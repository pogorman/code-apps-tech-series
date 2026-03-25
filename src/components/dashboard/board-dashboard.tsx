import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
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
import { TileColorDots } from "@/components/ui/tile-color-dots";
import {
  priorityToColorIndex,
  tileBgClass,
  COLOR_TO_PRIORITY,
} from "@/lib/tile-colors";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_TYPE_LABELS,
  priorityVariant,
  statusVariant,
} from "@/components/action-items/labels";
import { CATEGORY_LABELS, categoryVariant } from "@/components/ideas/labels";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  FolderKanban,
  Lightbulb,
  Columns3,
} from "lucide-react";
import type { Tdvsp_actionitemsModel } from "@/generated";
import type { Tdvsp_ideasModel } from "@/generated";
import type { Tdvsp_projectsModel } from "@/generated";

type ActionItem = Tdvsp_actionitemsModel.Tdvsp_actionitems;
type Idea = Tdvsp_ideasModel.Tdvsp_ideas;
type Project = Tdvsp_projectsModel.Tdvsp_projects;

/* ── status keys ──────────────────────────────────────────────── */

const RECOGNIZED = 468510000;
const COMPLETE = 468510005;
const TASK_TYPE_WORK = 468510001;

/* ── column accent colours ────────────────────────────────────── */

const ACCENT = {
  work: "#378ADD",
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

/* ── sortable card wrapper ───────────────────────────────────── */

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
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
        "group cursor-grab active:cursor-grabbing",
        isDragging && "z-50 opacity-80",
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/* ── action-item card ─────────────────────────────────────────── */

function ActionItemCard({
  item,
  showStatus,
  onPriorityChange,
}: {
  item: ActionItem;
  showStatus: boolean;
  onPriorityChange: (id: string, priority: number | null) => void;
}) {
  const date = item.tdvsp_date
    ? new Date(item.tdvsp_date).toLocaleDateString()
    : null;
  const customer = item.tdvsp_customername;
  const taskType =
    item.tdvsp_tasktype != null
      ? TASK_TYPE_LABELS[item.tdvsp_tasktype]
      : null;
  const priority =
    item.tdvsp_priority != null
      ? PRIORITY_LABELS[item.tdvsp_priority]
      : null;
  const status =
    item.tdvsp_taskstatus != null
      ? STATUS_LABELS[item.tdvsp_taskstatus]
      : null;
  const colorIdx = priorityToColorIndex(item.tdvsp_priority);

  return (
    <div className={cn("relative rounded-lg border border-border/60 bg-card px-3.5 py-3 shadow-sm hover:shadow-md transition-shadow", tileBgClass(colorIdx))}>
      <div className="absolute top-2 right-2">
        <TileColorDots
          activeIndex={colorIdx}
          onChange={(idx) => onPriorityChange(item.tdvsp_actionitemid, COLOR_TO_PRIORITY[idx] ?? null)}
        />
      </div>
      <p className="text-sm font-medium leading-snug line-clamp-2 pr-6">
        {item.tdvsp_name}
      </p>
      {(date || customer) && (
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {date && <span>{date}</span>}
          {date && customer && <span>·</span>}
          {customer && <span className="truncate">{customer}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {showStatus && status && (
          <Badge variant={statusVariant(item.tdvsp_taskstatus!)}>
            {status}
          </Badge>
        )}
        {priority && (
          <Badge variant={priorityVariant(item.tdvsp_priority!)}>
            {priority}
          </Badge>
        )}
        {!showStatus && taskType && (
          <Badge variant="outline">{taskType}</Badge>
        )}
      </div>
    </div>
  );
}

/* ── project card ─────────────────────────────────────────────── */

function ProjectCard({
  project,
  onPriorityChange,
}: {
  project: Project;
  onPriorityChange: (id: string, priority: number | null) => void;
}) {
  const colorIdx = priorityToColorIndex(project.tdvsp_priority);
  const priority =
    project.tdvsp_priority != null
      ? PRIORITY_LABELS[project.tdvsp_priority as keyof typeof PRIORITY_LABELS]
      : null;

  return (
    <div className={cn("relative rounded-lg border border-border/60 bg-card px-3.5 py-3 shadow-sm hover:shadow-md transition-shadow", tileBgClass(colorIdx))}>
      <div className="absolute top-2 right-2">
        <TileColorDots
          activeIndex={colorIdx}
          onChange={(idx) => onPriorityChange(project.tdvsp_projectid, COLOR_TO_PRIORITY[idx] ?? null)}
        />
      </div>
      <p className="text-sm font-medium leading-snug line-clamp-2 pr-6">
        {project.tdvsp_name}
      </p>
      {priority && (
        <div className="mt-2">
          <Badge variant={priorityVariant(project.tdvsp_priority! as keyof typeof PRIORITY_LABELS)}>
            {priority}
          </Badge>
        </div>
      )}
    </div>
  );
}

/* ── idea card ────────────────────────────────────────────────── */

function IdeaCard({
  idea,
  onPriorityChange,
}: {
  idea: Idea;
  onPriorityChange: (id: string, priority: number | null) => void;
}) {
  const category =
    idea.tdvsp_category != null
      ? CATEGORY_LABELS[idea.tdvsp_category]
      : null;
  const priority = (idea as unknown as Record<string, number>).tdvsp_priority;
  const colorIdx = priorityToColorIndex(priority);

  return (
    <div className={cn("relative rounded-lg border border-border/60 bg-card px-3.5 py-3 shadow-sm hover:shadow-md transition-shadow", tileBgClass(colorIdx))}>
      <div className="absolute top-2 right-2">
        <TileColorDots
          activeIndex={colorIdx}
          onChange={(idx) => onPriorityChange(idea.tdvsp_ideaid, COLOR_TO_PRIORITY[idx] ?? null)}
        />
      </div>
      <p className="text-sm font-medium leading-snug line-clamp-2 pr-6">
        {idea.tdvsp_name}
      </p>
      {category && (
        <div className="mt-2">
          <Badge variant={categoryVariant(idea.tdvsp_category!)}>
            {category}
          </Badge>
        </div>
      )}
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
  onReorder,
  children,
}: {
  columnKey: string;
  title: string;
  icon: typeof Briefcase;
  accent: string;
  ids: string[];
  onReorder: (columnKey: string, ids: string[]) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const newIds = arrayMove(ids, oldIndex, newIndex);
      onReorder(columnKey, newIds);
    },
    [ids, onReorder, columnKey],
  );

  return (
    <div className="flex flex-col min-w-0 rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
        <h2 className="text-sm font-semibold truncate">{title}</h2>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {ids.length}
        </span>
      </div>
      {/* sortable card list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
            {children}
            {ids.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No items
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
      {/* accent bottom bar */}
      <div className="h-[3px] shrink-0" style={{ background: accent }} />
    </div>
  );
}

/* ── main board dashboard ─────────────────────────────────────── */

export function BoardDashboard() {
  const {
    data: actionItems,
    isLoading: loadingItems,
    error: itemsError,
  } = useActionItems();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: ideas, isLoading: loadingIdeas } = useIdeas();
  const updateActionItem = useUpdateActionItem();
  const updateProject = useUpdateProject();
  const updateIdea = useUpdateIdea();

  /* sort order state — seeded from localStorage on first render */
  const [orders, setOrders] = useState<Record<string, string[]>>(() => ({
    work: getSavedOrder("work"),
    projects: getSavedOrder("projects"),
    ideas: getSavedOrder("ideas"),
  }));

  const handleReorder = useCallback((columnKey: string, newIds: string[]) => {
    setOrders((prev) => ({ ...prev, [columnKey]: newIds }));
    saveOrder(columnKey, newIds);
  }, []);

  const handleActionItemPriority = (id: string, priority: number | null) => {
    updateActionItem.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };

  const handleProjectPriority = (id: string, priority: number | null) => {
    updateProject.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };

  const handleIdeaPriority = (id: string, priority: number | null) => {
    updateIdea.mutate({ id, fields: { tdvsp_priority: priority } as never });
  };

  const isLoading = loadingItems || loadingProjects || loadingIdeas;

  const work = applyOrder(
    actionItems?.filter(
      (i) =>
        i.tdvsp_tasktype === TASK_TYPE_WORK &&
        i.tdvsp_taskstatus !== RECOGNIZED &&
        i.tdvsp_taskstatus !== COMPLETE
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
          <h1 className="text-2xl font-bold tracking-tight">Board</h1>
        </div>
        <div className="grid grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <h1 className="text-lg font-medium">Board</h1>
          <p className="text-xs text-muted-foreground">
            Kanban view across action items, projects &amp; ideas
          </p>
        </div>
      </div>

      {/* 3-column board */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        <SortableColumn
          columnKey="work"
          title="work"
          icon={Briefcase}
          accent={ACCENT.work}
          ids={workIds}
          onReorder={handleReorder}
        >
          {work.map((item) => (
            <SortableCard key={item.tdvsp_actionitemid} id={item.tdvsp_actionitemid}>
              <ActionItemCard
                item={item}
                showStatus={true}
                onPriorityChange={handleActionItemPriority}
              />
            </SortableCard>
          ))}
        </SortableColumn>

        <SortableColumn
          columnKey="projects"
          title="projects"
          icon={FolderKanban}
          accent={ACCENT.projects}
          ids={projectIds}
          onReorder={handleReorder}
        >
          {projectList.map((project) => (
            <SortableCard key={project.tdvsp_projectid} id={project.tdvsp_projectid}>
              <ProjectCard project={project} onPriorityChange={handleProjectPriority} />
            </SortableCard>
          ))}
        </SortableColumn>

        <SortableColumn
          columnKey="ideas"
          title="ideas"
          icon={Lightbulb}
          accent={ACCENT.ideas}
          ids={ideaIds}
          onReorder={handleReorder}
        >
          {ideaList.map((idea) => (
            <SortableCard key={idea.tdvsp_ideaid} id={idea.tdvsp_ideaid}>
              <IdeaCard idea={idea} onPriorityChange={handleIdeaPriority} />
            </SortableCard>
          ))}
        </SortableColumn>
      </div>
    </div>
  );
}
