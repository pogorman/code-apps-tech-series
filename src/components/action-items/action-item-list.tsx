import { useEffect, useMemo, useState } from "react";
import { useActionItems, useDeleteActionItem } from "@/hooks/use-action-items";
import { useAccounts } from "@/hooks/use-accounts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItemFormDialog } from "./action-item-form-dialog";
import { ActionItemDetailDialog } from "./action-item-detail-dialog";
import { ActionItemDeleteDialog } from "./action-item-delete-dialog";
import { ClipboardList, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Tdvsp_actionitemsModel } from "@/generated";
import { toast } from "sonner";
import { useQuickCreateStore } from "@/stores/quick-create-store";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  priorityVariant,
  statusVariant,
} from "./labels";
import { useViewPreference } from "@/hooks/use-view-preference";
import { ViewToggle } from "@/components/ui/view-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TileColorDots } from "@/components/ui/tile-color-dots";
import { priorityToColorIndex, tileBgClass, COLOR_TO_PRIORITY } from "@/lib/tile-colors";
import { useUpdateActionItem } from "@/hooks/use-action-items";
import { cn } from "@/lib/utils";

type ActionItem = Tdvsp_actionitemsModel.Tdvsp_actionitems;

export function ActionItemList() {
  const quickTarget = useQuickCreateStore((s) => s.target);
  const clearQuickCreate = useQuickCreateStore((s) => s.clear);

  const [viewMode, setViewMode] = useViewPreference("action-items");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (quickTarget === "action-items") {
      setCreateOpen(true);
      clearQuickCreate();
    }
  }, [quickTarget, clearQuickCreate]);
  const [editItem, setEditItem] = useState<ActionItem | null>(null);
  const [viewItem, setViewItem] = useState<ActionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ActionItem | null>(null);

  const filter = search
    ? `contains(tdvsp_name, '${search.replace(/'/g, "''")}')`
    : undefined;

  const { data: items, isLoading, error } = useActionItems({ filter });
  const { data: accounts } = useAccounts();
  const deleteMutation = useDeleteActionItem();
  const updateMutation = useUpdateActionItem();

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts?.forEach((a) => map.set(a.accountid, a.name));
    return map;
  }, [accounts]);

  function handleDelete() {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.tdvsp_actionitemid, {
      onSuccess: () => {
        toast.success(`Deleted "${deleteItem.tdvsp_name}"`);
        setDeleteItem(null);
      },
      onError: (err) => {
        toast.error(`Delete failed: ${err.message}`);
      },
    });
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load action items: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Items</h1>
          <p className="text-sm text-muted-foreground">Track and manage your tasks</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Action Item
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="whitespace-nowrap">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {search ? "No action items match your search." : "No action items found. Create one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                items?.map((item) => {
                  const customerId = (item as unknown as Record<string, string>)._tdvsp_customer_value;
                  const customerName = item.tdvsp_customername ?? accountNameMap.get(customerId ?? "") ?? "\u2014";
                  return (
                    <TableRow
                      key={item.tdvsp_actionitemid}
                      className="cursor-pointer"
                      onClick={() => setViewItem(item)}
                    >
                      <TableCell className="font-medium">{item.tdvsp_name}</TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.tdvsp_priority != null ? (
                          <Badge variant={priorityVariant(item.tdvsp_priority)}>
                            {PRIORITY_LABELS[item.tdvsp_priority]}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                      <TableCell>
                        {item.tdvsp_taskstatus != null ? (
                          <Badge variant={statusVariant(item.tdvsp_taskstatus)}>
                            {STATUS_LABELS[item.tdvsp_taskstatus]}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                      <TableCell>
                        {item.tdvsp_date
                          ? new Date(item.tdvsp_date).toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {search ? "No action items match your search." : "No action items found. Create one to get started."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => {
            const customerId = (item as unknown as Record<string, string>)._tdvsp_customer_value;
            const customerName = item.tdvsp_customername ?? accountNameMap.get(customerId ?? "") ?? "\u2014";
            const colorIdx = priorityToColorIndex(item.tdvsp_priority);
            return (
              <Card
                key={item.tdvsp_actionitemid}
                className={cn("group cursor-pointer transition-shadow hover:shadow-md", tileBgClass(colorIdx))}
                onClick={() => setViewItem(item)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">{item.tdvsp_name}</CardTitle>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <TileColorDots
                      activeIndex={colorIdx}
                      onChange={(idx) => {
                        updateMutation.mutate({
                          id: item.tdvsp_actionitemid,
                          fields: { tdvsp_priority: COLOR_TO_PRIORITY[idx] } as never,
                        });
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItem(item)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">Customer: </span>
                    {customerName}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tdvsp_priority != null && (
                      <Badge variant={priorityVariant(item.tdvsp_priority)}>
                        {PRIORITY_LABELS[item.tdvsp_priority]}
                      </Badge>
                    )}
                    {item.tdvsp_taskstatus != null && (
                      <Badge variant={statusVariant(item.tdvsp_taskstatus)}>
                        {STATUS_LABELS[item.tdvsp_taskstatus]}
                      </Badge>
                    )}
                  </div>
                  {item.tdvsp_date && (
                    <div className="text-muted-foreground">
                      {new Date(item.tdvsp_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ActionItemFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      <ActionItemFormDialog
        open={!!editItem}
        onOpenChange={(open) => { if (!open) setEditItem(null); }}
        mode="edit"
        actionItem={editItem ?? undefined}
      />

      <ActionItemDetailDialog
        open={!!viewItem}
        onOpenChange={(open) => { if (!open) setViewItem(null); }}
        actionItem={viewItem ?? undefined}
        onEdit={(item) => {
          setViewItem(null);
          setEditItem(item);
        }}
      />

      <ActionItemDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
        itemName={deleteItem?.tdvsp_name ?? ""}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
