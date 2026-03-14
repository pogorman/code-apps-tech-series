import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccounts, useDeleteAccount } from "@/hooks/use-accounts";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AccountFormDialog } from "./account-form-dialog";
import { AccountDetailDialog } from "./account-detail-dialog";
import { AccountDeleteDialog } from "./account-delete-dialog";
import { Plus, Search } from "lucide-react";
import type { AccountsModel } from "@/generated";
import { toast } from "sonner";

type Account = AccountsModel.Accounts;

export function AccountList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [viewAccount, setViewAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);

  const filter = search
    ? `contains(name, '${search.replace(/'/g, "''")}')`
    : undefined;

  const { data: accounts, isLoading, error } = useAccounts({ filter });
  const deleteMutation = useDeleteAccount();

  function handleDelete() {
    if (!deleteAccount) return;
    deleteMutation.mutate(deleteAccount.accountid, {
      onSuccess: () => {
        toast.success(`Deleted "${deleteAccount.name}"`);
        setDeleteAccount(null);
      },
      onError: (err) => {
        toast.error(`Delete failed: ${err.message}`);
      },
    });
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load accounts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
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
            ) : accounts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No accounts match your search." : "No accounts found. Create one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              accounts?.map((account) => (
                <TableRow
                  key={account.accountid}
                  className="cursor-pointer"
                  onClick={() => setViewAccount(account)}
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.address1_city ?? "—"}</TableCell>
                  <TableCell>{account.telephone1 ?? "—"}</TableCell>
                  <TableCell>{account.industrycodename ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={account.statecode === 0 ? "default" : "secondary"}>
                      {account.statecodename ?? "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditAccount(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteAccount(account)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AccountFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      <AccountFormDialog
        open={!!editAccount}
        onOpenChange={(open) => { if (!open) setEditAccount(null); }}
        mode="edit"
        account={editAccount ?? undefined}
      />

      <AccountDetailDialog
        open={!!viewAccount}
        onOpenChange={(open) => { if (!open) setViewAccount(null); }}
        account={viewAccount ?? undefined}
        onEdit={(account) => {
          setViewAccount(null);
          setEditAccount(account);
        }}
        onViewContact={() => {
          setViewAccount(null);
          navigate("/contacts");
        }}
      />

      <AccountDeleteDialog
        open={!!deleteAccount}
        onOpenChange={(open) => { if (!open) setDeleteAccount(null); }}
        accountName={deleteAccount?.name ?? ""}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
