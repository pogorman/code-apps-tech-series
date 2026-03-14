import { useMemo, useState } from "react";
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
import { ClipboardList, Plus, Search } from "lucide-react";
import type { Tdvsp_actionitemsModel } from "@/generated";
import { toast } from "sonner";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  priorityVariant,
  statusVariant,
} from "./labels";

type ActionItem = Tdvsp_actionitemsModel.Tdvsp_actionitems;

export function ActionItemList() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ActionItem | null>(null);
  const [viewItem, setViewItem] = useState<ActionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ActionItem | null>(null);

  const filter = search
    ? `contains(tdvsp_name, '${search.replace(/'/g, "''")}')`
    : undefined;

  const { data: items, isLoading, error } = useActionItems({ filter });
  const { data: accounts } = useAccounts();
  const deleteMutation = useDeleteActionItem();

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
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Action Item
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Priority</TableHead>
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
                    <TableCell>
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
                          size="sm"
                          onClick={() => setEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteItem(item)}
                        >
                          Delete
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
